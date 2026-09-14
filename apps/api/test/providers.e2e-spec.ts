import 'reflect-metadata';
import { existsSync, readFileSync } from 'node:fs';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PostSchema, ProductSummarySchema, UserSummarySchema, paginated } from '@ezyify/core';
import { createApp } from '../src/bootstrap.js';
import { loadEnv } from '../src/config.js';
import { PrismaService } from '../src/infra/prisma/prisma.service.js';
import { SearchIndexer } from '../src/modules/search/search.indexer.js';
import { SearchService } from '../src/modules/search/search.service.js';

/** Phase 8.6 providers through the real stack: unified search on the Postgres fallback, LiveKit endpoints (disabled). */
let app: NestFastifyApplication;
let prisma: PrismaService;
type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';
const inject = (method: Method, url: string, opts: { token?: string; body?: unknown } = {}) =>
  app.inject({
    method,
    url: `/v1${url}`,
    payload: opts.body as never,
    headers: { ...(opts.body !== undefined ? { 'content-type': 'application/json' } : {}), 'x-client': 'native', ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}) },
  });
const json = (r: { body: string }) => JSON.parse(r.body);
const login = async (email: string) => json(await inject('POST', '/auth/login', { body: { identifier: email, password: 'Password1' } })).data.accessToken as string;

beforeAll(async () => {
  if (existsSync('.env.test')) {
    for (const line of readFileSync('.env.test', 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
  // Force the Postgres fallback even if a developer's shell has Meilisearch configured.
  app = await createApp(loadEnv({ ...process.env, NODE_ENV: 'test', MEILISEARCH_HOST: undefined, MEILISEARCH_API_KEY: undefined, LIVEKIT_API_KEY: undefined, LIVEKIT_API_SECRET: undefined, LIVEKIT_URL: undefined }));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  prisma = app.get(PrismaService);
});
afterAll(() => app.close());

describe('GET /search (Postgres fallback)', () => {
  it('uses the postgres backend and returns all three sections plus the legacy paginated products view', async () => {
    expect(app.get(SearchService).backend).toBe('postgres');
    const r = await inject('GET', '/search?q=headphones');
    expect(r.statusCode).toBe(200);
    const d = json(r).data;
    expect(d.products.items.map((p: { id: string }) => p.id)).toContain('prod-001');
    expect(d.products.items.every((p: unknown) => ProductSummarySchema.safeParse(p).success)).toBe(true);
    expect(d.posts.items.some((p: { id: string }) => p.id === 'post-001')).toBe(true);
    expect(d.posts.items.every((p: unknown) => PostSchema.safeParse(p).success)).toBe(true);
    expect(d.users.items).toEqual([]);
    expect(paginated(ProductSummarySchema).safeParse(d).success).toBe(true);
    expect(d.items).toEqual(d.products.items);
  });

  it('matches users by handle, name and bio; supports type filter, hashtags and @handles', async () => {
    const users = json(await inject('GET', '/search?q=maya&type=users')).data;
    expect(users.users.items.map((u: { username: string }) => u.username)).toContain('fashionista_maya');
    expect(users.users.items.every((u: unknown) => UserSummarySchema.safeParse(u).success)).toBe(true);
    expect(users.products).toEqual({ items: [], nextCursor: null, total: 0 });

    const handle = json(await inject('GET', '/search?q=%40techstore&type=users')).data;
    expect(handle.users.items[0].username).toBe('techstore');

    const tag = json(await inject('GET', '/search?q=%23skincare&type=posts')).data;
    expect(tag.posts.items.length).toBeGreaterThan(0);
    expect(tag.posts.items.every((p: { hashtags: string[] }) => p.hashtags.includes('skincare'))).toBe(true);
  });

  it('paginates with cursors and honours the legacy page/pageSize query', async () => {
    const first = json(await inject('GET', '/search?q=a&type=products&limit=2')).data;
    expect(first.products.items).toHaveLength(2);
    expect(first.products.nextCursor).toBeTruthy();
    expect(first.pagination).toMatchObject({ page: 1, pageSize: 2, hasMore: true });
    const second = json(await inject('GET', `/search?q=a&type=products&limit=2&cursor=${first.products.nextCursor}`)).data;
    expect(second.pagination.page).toBe(2);
    expect(second.products.items.map((p: { id: string }) => p.id)).not.toEqual(first.products.items.map((p: { id: string }) => p.id));
    const legacy = json(await inject('GET', '/search?q=a&page=2&pageSize=2')).data;
    expect(legacy.items.map((p: { id: string }) => p.id)).toEqual(second.products.items.map((p: { id: string }) => p.id));
  });

  it('validates the query and never leaks unpublished products or soft-deleted users', async () => {
    expect((await inject('GET', '/search')).statusCode).toBe(422);
    expect((await inject('GET', '/search?q=x&type=nope')).statusCode).toBe(422);
    expect((await inject('GET', '/search?q=x&limit=500')).statusCode).toBe(422);
    await prisma.product.update({ where: { id: 'prod-002' }, data: { published: false } });
    try {
      const d = json(await inject('GET', '/search?q=watch&type=products')).data;
      expect(d.products.items.map((p: { id: string }) => p.id)).not.toContain('prod-002');
    } finally {
      await prisma.product.update({ where: { id: 'prod-002' }, data: { published: true } });
    }
  });

  it('hides blocked users and their posts from the blocker (and vice versa)', async () => {
    const buyer = await login('buyer@ezyify.test');
    const sara = await login('sara@ezyify.test');
    const before = json(await inject('GET', '/search?q=skincare', { token: buyer })).data;
    expect(before.posts.items.some((p: { author: { username: string } }) => p.author.username === 'glow.with.sara')).toBe(true);
    expect((await inject('POST', '/users/u_sara/block', { token: buyer })).statusCode).toBe(201);
    try {
      const after = json(await inject('GET', '/search?q=skincare', { token: buyer })).data;
      expect(after.posts.items.some((p: { author: { username: string } }) => p.author.username === 'glow.with.sara')).toBe(false);
      expect(json(await inject('GET', '/search?q=sara&type=users', { token: buyer })).data.users.items).toEqual([]);
      // The blocked side cannot find the blocker either.
      expect(json(await inject('GET', '/search?q=buyer&type=users', { token: sara })).data.users.items.map((u: { username: string }) => u.username)).not.toContain('buyer');
      // Guests still see everything.
      expect(json(await inject('GET', '/search?q=sara&type=users')).data.users.items.map((u: { username: string }) => u.username)).toContain('glow.with.sara');
    } finally {
      await inject('DELETE', '/users/u_sara/block', { token: buyer });
    }
  });

  it('indexer hooks are no-ops on the postgres backend and reindexAll counts rows', async () => {
    const indexer = app.get(SearchIndexer);
    expect(indexer.external).toBe(false);
    expect(indexer.user('u_buyer')).toBeUndefined();
    const counts = await indexer.reindexAll();
    expect(counts.products).toBeGreaterThan(0);
    expect(counts.users).toBeGreaterThan(0);
    expect(counts.posts).toBeGreaterThan(0);
  });
});

describe('POST /live/token & /live/call-token', () => {
  it('require auth, validate the body, and return 503 LIVE_UNAVAILABLE when LiveKit is not configured', async () => {
    expect((await inject('POST', '/live/token', { body: { room: 'r', role: 'host' } })).statusCode).toBe(401);
    const buyer = await login('buyer@ezyify.test');
    const bad = await inject('POST', '/live/token', { token: buyer, body: { room: 'has spaces!', role: 'host' } });
    expect(bad.statusCode).toBe(422);
    const r = await inject('POST', '/live/token', { token: buyer, body: { room: 'maya-live', role: 'viewer' } });
    expect(r.statusCode).toBe(503);
    expect(json(r)).toEqual({ success: false, error: { code: 'SERVER_ERROR', message: expect.stringMatching(/Live video/), details: { code: 'LIVE_UNAVAILABLE' } } });
    const call = await inject('POST', '/live/call-token', { token: buyer, body: { conversationId: 'c_buyer_maya' } });
    expect(call.statusCode).toBe(503);
  });
});
