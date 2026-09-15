import { Logger } from '@nestjs/common';
import { loadEnv } from '../../config.js';
import { MeilisearchIndex } from './meilisearch.index.js';
import { decodeCursor, encodeCursor } from './search.index.js';

const base = { DATABASE_URL: 'postgresql://u:p@localhost:5432/db', JWT_ACCESS_SECRET: 'a'.repeat(32), JWT_REFRESH_SECRET: 'b'.repeat(32) };
const env = loadEnv({ ...base, NODE_ENV: 'test', MEILISEARCH_HOST: 'http://meili:7700/', MEILISEARCH_API_KEY: 'masterKey' });

type Call = { method: string; path: string; body: unknown };
const stub = (reply: (c: Call) => unknown = () => ({})) => {
  const calls: Call[] = [];
  const fetchImpl: typeof fetch = async (url, init) => {
    const c = { method: init!.method!, path: String(url).replace('http://meili:7700', ''), body: JSON.parse(init!.body as string) };
    calls.push(c);
    const out = reply(c);
    return out instanceof Response ? out : new Response(JSON.stringify(out), { status: 200 });
  };
  return { calls, fetchImpl };
};

beforeAll(() => Logger.overrideLogger(false));

describe('cursor codec', () => {
  it('round-trips offsets and rejects garbage', () => {
    expect(decodeCursor(encodeCursor(40))).toBe(40);
    expect(decodeCursor(undefined)).toBe(0);
    expect(decodeCursor('not-base64!!')).toBe(0);
    expect(decodeCursor(Buffer.from('-5').toString('base64url'))).toBe(0);
  });
});

describe('MeilisearchIndex', () => {
  it('refuses to construct without host + key', () => {
    expect(() => new MeilisearchIndex(loadEnv(base))).toThrow(/MEILISEARCH_HOST/);
  });

  it('ensureIndexes PATCHes settings for every env-prefixed index with the bearer key', async () => {
    const { calls, fetchImpl } = stub();
    await new MeilisearchIndex(env, fetchImpl).ensureIndexes();
    expect(calls.map(c => c.path)).toEqual(['/indexes/ezyify_test_products/settings', '/indexes/ezyify_test_users/settings', '/indexes/ezyify_test_posts/settings']);
    expect(calls[0].method).toBe('PATCH');
    expect(calls[0].body).toMatchObject({ searchableAttributes: ['name', 'tags', 'description'], filterableAttributes: expect.arrayContaining(['published']) });
  });

  it('search sends filters for visibility + blocks and maps hits to a cursor page', async () => {
    const { calls, fetchImpl } = stub(() => ({ hits: [{ id: 'p1' }, { id: 'p2' }], estimatedTotalHits: 5 }));
    const idx = new MeilisearchIndex(env, fetchImpl);
    const posts = await idx.search('posts', 'skincare', { limit: 2, excludeAuthorIds: ['u_blocked', 'u"quote'] });
    expect(posts).toEqual({ ids: ['p1', 'p2'], cursor: encodeCursor(2), estimatedTotal: 5 });
    expect(calls[0]).toMatchObject({ method: 'POST', path: '/indexes/ezyify_test_posts/search' });
    expect(calls[0].body).toMatchObject({ q: 'skincare', limit: 2, offset: 0, sort: ['createdAt:desc'], filter: ['deleted = false', 'kind != story', 'authorId NOT IN ["u_blocked", "u\\"quote"]'] });

    const products = await idx.search('products', 'x', { limit: 10, cursor: encodeCursor(3), excludeAuthorIds: [] });
    expect(products.cursor).toBeNull(); // offset 3 + 2 hits reaches the 5 estimated → exhausted
    expect(calls[1].body).toMatchObject({ offset: 3, filter: ['published = true'], sort: ['soldCount:desc'] });

    await idx.search('users', 'maya', { limit: 5, excludeAuthorIds: ['u1'] });
    expect(calls[2].body).toMatchObject({ filter: ['deleted = false', 'id NOT IN ["u1"]'] });
    expect(calls[2].body).not.toHaveProperty('sort');
  });

  it('upsert/remove batch documents and skip empty batches', async () => {
    const { calls, fetchImpl } = stub();
    const idx = new MeilisearchIndex(env, fetchImpl);
    await idx.upsert('users', []);
    await idx.remove('users', []);
    expect(calls).toHaveLength(0);
    await idx.upsert('users', [{ id: 'u1', username: 'a', name: 'A', bio: '', role: 'user', deleted: false }]);
    await idx.remove('posts', ['p1']);
    expect(calls[0]).toMatchObject({ method: 'POST', path: '/indexes/ezyify_test_users/documents?primaryKey=id' });
    expect(calls[1]).toMatchObject({ method: 'POST', path: '/indexes/ezyify_test_posts/documents/delete-batch', body: ['p1'] });
  });

  it('surfaces non-2xx responses as errors', async () => {
    const { fetchImpl } = stub(() => new Response('{"message":"index not found"}', { status: 404 }));
    await expect(new MeilisearchIndex(env, fetchImpl).search('products', 'x', { limit: 1, excludeAuthorIds: [] })).rejects.toThrow(/Meilisearch POST .* 404/);
  });
});
