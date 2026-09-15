import 'reflect-metadata';
import { existsSync, readFileSync } from 'node:fs';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from '../src/bootstrap.js';
import { loadEnv } from '../src/config.js';
import { LiveSessionSchema, paginated } from '@ezyify/core';

let app: NestFastifyApplication;
const inject = (method: 'GET' | 'POST', url: string, opts: { token?: string; body?: unknown } = {}) =>
  app.inject({
    method,
    url: `/v1${url}`,
    payload: opts.body as never,
    headers: { ...(opts.body !== undefined ? { 'content-type': 'application/json' } : {}), 'x-client': 'native', ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}) },
  });
const json = (response: { body: string }) => JSON.parse(response.body);
const login = async (email: string) => json(await inject('POST', '/auth/login', { body: { identifier: email, password: 'Password1' } })).data.accessToken as string;

beforeAll(async () => {
  if (existsSync('.env.test')) {
    for (const line of readFileSync('.env.test', 'utf8').split('\n')) {
      const match = line.match(/^([A-Z_]+)=(.*)$/);
      if (match && !process.env[match[1]]) process.env[match[1]] = match[2];
    }
  }
  app = await createApp(loadEnv({ ...process.env, NODE_ENV: 'test' }));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});
afterAll(() => app.close());

describe('live shopping sessions', () => {
  let buyer: string;
  let techstore: string;
  let fashion: string;

  beforeAll(async () => {
    buyer = await login('buyer@ezyify.test');
    techstore = await login('techstore@ezyify.test');
    fashion = await login('fashion@ezyify.test');
  });

  it('lists and gets public sessions using the shared contract', async () => {
    const list = json(await inject('GET', '/live/sessions?status=live&pageSize=2')).data;
    expect(paginated(LiveSessionSchema).safeParse(list).success).toBe(true);
    expect(list.items.map((session: { viewers: number }) => session.viewers)).toEqual([...list.items.map((session: { viewers: number }) => session.viewers)].sort((a: number, b: number) => b - a));
    const detail = json(await inject('GET', '/live/sessions/live-001')).data;
    expect(LiveSessionSchema.safeParse(detail).success).toBe(true);
    expect(detail).toMatchObject({ id: 'live-001', room: 'live-001', status: 'live' });
  });

  it('requires an eligible host role to create a session', async () => {
    const body = { title: 'Buyer cannot go live' };
    expect((await inject('POST', '/live/sessions', { token: buyer, body })).statusCode).toBe(403);
    const created = json(await inject('POST', '/live/sessions', { token: techstore, body: { title: 'New tech launch', productIds: ['prod-001'] } })).data;
    expect(created).toMatchObject({ status: 'live', host: { username: 'techstore' }, productIds: ['prod-001'] });
  });

  it('enforces host ownership for start, end, and pin', async () => {
    const scheduled = json(await inject('POST', '/live/sessions', { token: techstore, body: { title: 'Tomorrow launch', scheduledFor: new Date(Date.now() + 3_600_000).toISOString(), productIds: ['prod-001'] } })).data;
    expect((await inject('POST', `/live/sessions/${scheduled.id}/start`, { token: fashion })).statusCode).toBe(403);
    const started = json(await inject('POST', `/live/sessions/${scheduled.id}/start`, { token: techstore })).data;
    expect(started.status).toBe('live');
    expect((await inject('POST', `/live/sessions/${scheduled.id}/pin`, { token: fashion, body: { productId: 'prod-001' } })).statusCode).toBe(403);
    expect(json(await inject('POST', `/live/sessions/${scheduled.id}/pin`, { token: techstore, body: { productId: 'prod-001' } })).data.pinnedProductId).toBe('prod-001');
    expect((await inject('POST', `/live/sessions/${scheduled.id}/end`, { token: fashion })).statusCode).toBe(403);
    expect(json(await inject('POST', `/live/sessions/${scheduled.id}/end`, { token: techstore })).data.status).toBe('ended');
  });

  it('records presence and likes through heartbeats', async () => {
    const first = json(await inject('POST', '/live/sessions/live-001/heartbeat', { token: buyer, body: {} })).data;
    const liked = json(await inject('POST', '/live/sessions/live-001/heartbeat', { token: buyer, body: { like: true } })).data;
    expect(liked.viewers).toBeGreaterThanOrEqual(first.viewers);
    expect(liked.likes).toBe(first.likes + 1);
  });

  it('prevents non-hosts from minting a host token for persisted rooms', async () => {
    const token = await inject('POST', '/live/token', { token: buyer, body: { room: 'live-001', role: 'host' } });
    expect(token.statusCode).toBe(403);
    expect(json(token).error.code).toBe('FORBIDDEN');
  });
});
