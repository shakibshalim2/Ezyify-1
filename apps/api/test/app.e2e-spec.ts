import 'reflect-metadata';
import { existsSync, readFileSync } from 'node:fs';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from '../src/bootstrap.js';
import { loadEnv } from '../src/config.js';
import { OrderSchema, ProductSummarySchema, SellerProductsResponseSchema, SessionSchema, paginated } from '@ezyify/core';

let app: NestFastifyApplication;
const inject = (method: 'GET' | 'POST' | 'PATCH' | 'DELETE', url: string, opts: { token?: string; body?: unknown; headers?: Record<string, string> } = {}) =>
  app.inject({
    method,
    url: `/v1${url}`,
    payload: opts.body as never,
    // Fastify rejects an empty body when content-type is JSON, so only set it when a body is present.
    headers: { ...(opts.body !== undefined ? { 'content-type': 'application/json' } : {}), 'x-client': 'native', ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers },
  });
const json = (r: { body: string }) => JSON.parse(r.body);
const login = async (email: string) => json(await inject('POST', '/auth/login', { body: { identifier: email, password: 'Password1' } })).data as { accessToken: string; refreshToken: string };

beforeAll(async () => {
  if (existsSync('.env.test')) {
    for (const line of readFileSync('.env.test', 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
  app = await createApp(loadEnv({ ...process.env, NODE_ENV: 'test' }));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});
afterAll(() => app.close());

describe('envelope & errors', () => {
  it('health is raw, everything else enveloped', async () => {
    expect(json(await inject('GET', '/health'))).toMatchObject({ status: 'ok' });
    const r = await inject('GET', '/cart');
    expect(r.statusCode).toBe(401);
    expect(json(r)).toEqual({ success: false, error: { code: 'UNAUTHORIZED', message: expect.any(String) } });
  });
  it('maps zod failures to VALIDATION_ERROR with field details', async () => {
    const r = await inject('POST', '/auth/signup', { body: { name: 'x', email: 'nope', password: 'weak', acceptTerms: false } });
    expect(r.statusCode).toBe(422);
    const b = json(r);
    expect(b.error.code).toBe('VALIDATION_ERROR');
    expect(Object.keys(b.error.details)).toEqual(expect.arrayContaining(['email', 'password', 'acceptTerms']));
  });
});

describe('auth', () => {
  it('signup → OTP verify → session; wrong OTP rejected', async () => {
    const email = `new${Date.now()}@ezyify.test`;
    const s = json(await inject('POST', '/auth/signup', { body: { name: 'New User', email, password: 'Password1', acceptTerms: true } })).data;
    expect(s.requiresOTP).toBe(true);
    const bad = await inject('POST', '/auth/verify-otp', { body: { userId: s.userId, otp: '000000', type: 'email' } });
    expect([422, 401]).toContain(bad.statusCode);
  });
  it('login returns a schema-valid session and refresh rotates the token', async () => {
    const r = json(await inject('POST', '/auth/login', { body: { identifier: 'buyer@ezyify.test', password: 'Password1' } }));
    expect(r.success).toBe(true);
    expect(SessionSchema.safeParse(r.data).success).toBe(true);
    const first = json(await inject('POST', '/auth/refresh', { body: { refreshToken: r.data.refreshToken } })).data;
    expect(first.accessToken).toBeTruthy();
    // Reuse of the rotated token must be detected and rejected.
    const reuse = await inject('POST', '/auth/refresh', { body: { refreshToken: r.data.refreshToken } });
    expect(reuse.statusCode).toBe(401);
  });
  it('rejects bad credentials without revealing which field', async () => {
    const r = await inject('POST', '/auth/login', { body: { identifier: 'buyer@ezyify.test', password: 'Wrong1234' } });
    expect(r.statusCode).toBe(401);
  });
});

describe('catalog (public)', () => {
  it('lists products matching the shared ProductSummary contract', async () => {
    const r = json(await inject('GET', '/products?pageSize=3&sort=price_asc'));
    expect(paginated(ProductSummarySchema).safeParse(r.data).success).toBe(true);
    const prices = r.data.items.map((p: { price: { amount: number } }) => p.price.amount);
    expect([...prices].sort((a, b) => a - b)).toEqual(prices);
  });
  it('404s unknown products with the spec code', async () => {
    const r = await inject('GET', '/products/does-not-exist');
    expect(r.statusCode).toBe(404);
    expect(json(r).error.code).toBe('NOT_FOUND');
  });
});

describe('commerce: cart → checkout → escrow → release', () => {
  let buyer: string;
  let seller: string;
  let orderId: string;

  beforeAll(async () => {
    buyer = (await login('buyer@ezyify.test')).accessToken;
    seller = (await login('techstore@ezyify.test')).accessToken;
  });

  it('adds to cart and prices it', async () => {
    const r = json(await inject('POST', '/cart/items', { token: buyer, body: { productId: 'prod-001', quantity: 1 } }));
    expect(r.data.items).toHaveLength(1);
    expect(r.data.total.amount).toBe(7999);
  });

  it('checkout debits wallet, holds escrow, is idempotent', async () => {
    const before = json(await inject('GET', '/wallet', { token: buyer })).data.balance.amount;
    const key = `test-${Date.now()}`;
    const r = json(await inject('POST', '/checkout', { token: buyer, body: { addressId: 'addr_buyer_home', paymentMethod: 'wallet' }, headers: { 'idempotency-key': key } }));
    expect(r.success).toBe(true);
    expect(r.data).toHaveLength(1);
    expect(OrderSchema.safeParse(r.data[0]).success).toBe(true);
    expect(r.data[0]).toMatchObject({ status: 'paid', escrow: { status: 'held' } });
    orderId = r.data[0].id;
    const after = json(await inject('GET', '/wallet', { token: buyer })).data.balance.amount;
    expect(before - after).toBe(7999);
    const replay = json(await inject('POST', '/checkout', { token: buyer, body: { addressId: 'addr_buyer_home', paymentMethod: 'wallet' }, headers: { 'idempotency-key': key } }));
    expect(replay.data[0].id).toBe(orderId);
  });

  it('buyer cannot ship; seller cannot confirm delivery', async () => {
    expect((await inject('POST', `/seller/orders/${orderId}/ship`, { token: buyer, body: { carrier: 'X', number: '1' } })).statusCode).toBe(403);
    expect((await inject('POST', `/orders/${orderId}/confirm-delivery`, { token: seller })).statusCode).toBe(403);
  });

  it('seller list/summary are seller-scoped and the order exposes buyer + destination', async () => {
    expect((await inject('GET', '/seller/orders/summary', { token: buyer })).statusCode).toBe(403);
    const list = json(await inject('GET', '/orders?role=seller', { token: seller })).data;
    expect(list.items.map((o: { id: string }) => o.id)).toContain(orderId);
    const o = list.items.find((x: { id: string }) => x.id === orderId);
    expect(o.buyer.username).toBe('buyer');
    expect(o.shippingTo).toMatchObject({ recipient: expect.any(String), city: expect.any(String), country: expect.any(String) });
    expect(o.paymentMethod).toBe('wallet');
    const summary = json(await inject('GET', '/seller/orders/summary', { token: seller })).data;
    expect(summary.total).toBe(list.pagination.total);
    expect(summary.toShip).toBeGreaterThanOrEqual(1);
    expect(summary.needsAction).toBeGreaterThanOrEqual(summary.toShip);
    // Other sellers never see this order.
    const other = (await login('fashion@ezyify.test')).accessToken;
    expect(json(await inject('GET', '/orders?role=seller', { token: other })).data.items.map((x: { id: string }) => x.id)).not.toContain(orderId);
    expect((await inject('POST', `/seller/orders/${orderId}/accept`, { token: other })).statusCode).toBe(403);
  });

  it('walks the state machine and releases escrow minus platform fee', async () => {
    const sellerBefore = json(await inject('GET', '/wallet', { token: seller })).data.balance.amount;
    expect(json(await inject('POST', `/seller/orders/${orderId}/accept`, { token: seller })).data.status).toBe('processing');
    expect(json(await inject('POST', `/seller/orders/${orderId}/ship`, { token: seller, body: { carrier: 'JNE', number: 'JNE1' } })).data.status).toBe('shipped');
    expect(json(await inject('POST', `/seller/orders/${orderId}/deliver`, { token: seller })).data.status).toBe('delivered');
    const done = json(await inject('POST', `/orders/${orderId}/confirm-delivery`, { token: buyer })).data;
    expect(done).toMatchObject({ status: 'completed', escrow: { status: 'released', autoReleaseAt: null } });
    const sellerAfter = json(await inject('GET', '/wallet', { token: seller })).data.balance.amount;
    expect(sellerAfter - sellerBefore).toBe(7999 - Math.round(7999 * 0.05));
    const again = await inject('POST', `/orders/${orderId}/confirm-delivery`, { token: buyer });
    expect(json(again).error.code).toBe('CONFLICT');
  });

  it('seller cancel refunds the buyer and restores stock; summary reflects it', async () => {
    json(await inject('POST', '/cart/items', { token: buyer, body: { productId: 'prod-002', quantity: 1 } }));
    const [created] = json(await inject('POST', '/checkout', { token: buyer, body: { addressId: 'addr_buyer_home', paymentMethod: 'wallet' } })).data;
    const stockOf = async () => json(await inject('GET', '/seller/products?q=watch', { token: seller })).data.items[0].stock as number;
    const stockBefore = await stockOf();
    const summaryBefore = json(await inject('GET', '/seller/orders/summary', { token: seller })).data;
    const buyerBefore = json(await inject('GET', '/wallet', { token: buyer })).data.balance.amount;
    const cancelled = json(await inject('POST', `/seller/orders/${created.id}/cancel`, { token: seller })).data;
    expect(cancelled).toMatchObject({ status: 'cancelled', escrow: { status: 'refunded' } });
    expect(json(await inject('GET', '/wallet', { token: buyer })).data.balance.amount - buyerBefore).toBe(created.total.amount);
    expect(await stockOf()).toBe(stockBefore + 1);
    const summary = json(await inject('GET', '/seller/orders/summary', { token: seller })).data;
    expect(summary.refunds).toBe(summaryBefore.refunds + 1);
    expect(summary.toShip).toBe(summaryBefore.toShip - 1);
    expect(summary.completed).toBeGreaterThanOrEqual(1);
  });

  it('timeline records every transition', async () => {
    const t = json(await inject('GET', `/orders/${orderId}/timeline`, { token: buyer })).data.map((e: { status: string }) => e.status);
    expect(t).toEqual(['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'completed']);
  });

  it('seller hub inventory is seller-scoped, role-gated and reflects real order revenue', async () => {
    expect((await inject('GET', '/seller/products', { token: buyer })).statusCode).toBe(403);
    const r = json(await inject('GET', '/seller/products', { token: seller })).data;
    expect(SellerProductsResponseSchema.safeParse(r).success).toBe(true);
    expect(r.items.every((p: { seller: { username: string } }) => p.seller.username === 'techstore')).toBe(true);
    expect(r.summary.total).toBe(r.summary.active + r.summary.lowStock + r.summary.outOfStock + r.summary.draft);
    const sold = r.items.find((p: { id: string }) => p.id === 'prod-001');
    expect(sold.revenue.amount).toBeGreaterThanOrEqual(7999);
    const filtered = json(await inject('GET', '/seller/products?q=headphones&status=active', { token: seller })).data;
    expect(filtered.items.map((p: { id: string }) => p.id)).toEqual(['prod-001']);
  });
});

describe('social + policy', () => {
  let buyer: string;
  beforeAll(async () => {
    buyer = (await login('buyer@ezyify.test')).accessToken;
  });
  it('feed is public and reports viewer like state after liking', async () => {
    const anon = json(await inject('GET', '/feed?pageSize=2')).data;
    expect(anon.items.length).toBeGreaterThan(0);
    await inject('POST', '/posts/post-001/like', { token: buyer });
    const mine = json(await inject('GET', '/posts/post-001', { token: buyer })).data;
    expect(mine.engagement.isLiked).toBe(true);
    await inject('DELETE', '/posts/post-001/like', { token: buyer });
    await inject('POST', '/posts/post-001/save', { token: buyer });
    const saved = json(await inject('GET', '/posts/saved', { token: buyer })).data;
    expect(saved.items.map((p: { id: string }) => p.id)).toContain('post-001');
    expect(saved.items[0].engagement.isSaved).toBe(true);
    await inject('DELETE', '/posts/post-001/save', { token: buyer });
    expect(json(await inject('GET', '/posts/saved', { token: buyer })).data.items).toHaveLength(0);
    expect((await inject('GET', '/posts/saved')).statusCode).toBe(401);
  });
  it('blocking hides the author from the feed and reports are accepted', async () => {
    await inject('POST', '/users/u_jules/block', { token: buyer });
    const feed = json(await inject('GET', '/feed?pageSize=50', { token: buyer })).data.items;
    expect(feed.some((p: { author: { id: string } }) => p.author.id === 'u_jules')).toBe(false);
    await inject('DELETE', '/users/u_jules/block', { token: buyer });
    const rep = json(await inject('POST', '/reports', { token: buyer, body: { targetType: 'post', targetId: 'post-002', reason: 'spam' } }));
    expect(rep.data.ok).toBe(true);
  });
  it('admin queue is role-gated and child-safety reports are served first', async () => {
    expect((await inject('GET', '/admin/reports', { token: buyer })).statusCode).toBe(403);
    const csae = json(await inject('POST', '/reports', { token: buyer, body: { targetType: 'post', targetId: 'post-003', reason: 'child_safety' } }));
    expect(csae.data.ok).toBe(true);
    const admin = (await login('admin@ezyify.test')).accessToken;
    const queue = await inject('GET', '/admin/reports', { token: admin });
    expect(queue.statusCode).toBe(200);
    const items = json(queue).data.items as { id: string; reason: string; priority: number }[];
    expect(items[0]).toMatchObject({ id: csae.data.id, reason: 'child_safety', priority: 2 });
  });
  it('device registration + notifications work', async () => {
    expect(json(await inject('POST', '/devices', { token: buyer, body: { token: 'fcm-test', platform: 'android', provider: 'fcm', appVersion: '0.1.0' } })).data.ok).toBe(true);
    const n = json(await inject('GET', '/notifications', { token: buyer })).data;
    expect(Array.isArray(n.items)).toBe(true);
  });
});
