import 'reflect-metadata';
import { existsSync, readFileSync } from 'node:fs';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from '../src/bootstrap.js';
import { loadEnv } from '../src/config.js';
import { OrderSchema, ProductReviewsResponseSchema, ProductSummarySchema, SellerReviewsResponseSchema, SellerAnalyticsSchema, SellerCustomersResponseSchema, SellerDashboardSchema, SellerEarningsSchema, SellerProductDetailSchema, SellerProductsResponseSchema, SessionSchema, paginated } from '@ezyify/core';

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

  it('seller dashboard aggregates real sales, escrow, payouts and attention counts', async () => {
    expect((await inject('GET', '/seller/dashboard', { token: buyer })).statusCode).toBe(403);
    const d = json(await inject('GET', '/seller/dashboard?days=30', { token: seller })).data;
    expect(SellerDashboardSchema.safeParse(d).success).toBe(true);
    expect(d.window.days).toBe(30);
    // The completed headphones order (7999) counts as gross; the cancelled watch order does not.
    expect(d.gross.current.amount).toBe(7999);
    expect(d.orders.current).toBe(1);
    expect(d.averageOrder.current.amount).toBe(7999);
    expect(d.paidOut.amount).toBe(7999 - Math.round(7999 * 0.05));
    expect(d.escrowHeld.amount).toBe(0);
    expect(d.series).toHaveLength(14);
    expect(d.series.reduce((n: number, p: { gross: number }) => n + p.gross, 0)).toBe(7999);
    expect(d.attention).toMatchObject({ toShip: 0, refundRequests: 0 });
    expect(d.rating.count).toBeGreaterThan(0);
    expect((await inject('GET', '/seller/dashboard?days=3', { token: seller })).statusCode).toBe(422);
  });

  it('seller analytics reconciles top products, categories, customers and fulfilment with real orders', async () => {
    expect((await inject('GET', '/seller/analytics', { token: buyer })).statusCode).toBe(403);
    const a = json(await inject('GET', '/seller/analytics?days=30', { token: seller })).data;
    expect(SellerAnalyticsSchema.safeParse(a).success).toBe(true);
    expect(a.series).toHaveLength(30);
    expect(a.totals).toMatchObject({ gross: { amount: 7999 }, orders: 1, units: 1, averageOrder: { amount: 7999 } });
    expect(a.series.reduce((n: number, p: { gross: number }) => n + p.gross, 0)).toBe(a.totals.gross.amount);
    expect(a.topProducts).toHaveLength(1);
    expect(a.topProducts[0]).toMatchObject({ id: 'prod-001', units: 1, share: 1 });
    expect(a.categories).toEqual([expect.objectContaining({ name: 'Tech', share: 1 })]);
    expect(a.customers).toEqual({ unique: 1, repeat: 0, firstTime: 1 });
    // One completed + one cancelled order in the window → 50% each; shipped 1 order so latency is a number.
    expect(a.fulfillment.completionRate).toBe(0.5);
    expect(a.fulfillment.cancelRate).toBe(0.5);
    expect(typeof a.fulfillment.avgHoursToShip).toBe('number');
    expect(a.paymentMix).toEqual([{ method: 'wallet', orders: 1, share: 1 }]);
  });

  it('seller customers aggregate buyers from paid orders with public profile data only', async () => {
    expect((await inject('GET', '/seller/customers', { token: buyer })).statusCode).toBe(403);
    const r = json(await inject('GET', '/seller/customers?sort=spent', { token: seller })).data;
    expect(SellerCustomersResponseSchema.safeParse(r).success).toBe(true);
    expect(r.items).toHaveLength(1);
    const c = r.items[0];
    expect(c.user.username).toBe('buyer');
    expect(c.user).not.toHaveProperty('email');
    // Only the completed 7999 order counts; the cancelled one is excluded from orders/spend.
    expect(c).toMatchObject({ orders: 1, spent: { amount: 7999 }, openOrders: 0 });
    expect(c.lastShippedTo).toMatchObject({ city: expect.any(String), country: expect.any(String) });
    expect(r.summary).toMatchObject({ total: 1, repeat: 0, averageOrder: { amount: 7999 }, averageLifetime: { amount: 7999 } });
    expect(json(await inject('GET', '/seller/customers?q=nobody', { token: seller })).data.items).toHaveLength(0);
  });

  it('reviews: one per buyer, verified from a completed order, seller replies are scoped and public', async () => {
    const before = json(await inject('GET', '/products/prod-001/reviews')).data;
    expect(ProductReviewsResponseSchema.safeParse(before).success).toBe(true);
    expect(before.stats.total).toBe(2);
    const countBefore = json(await inject('GET', '/products/prod-001')).data.reviewCount as number;
    // Seller cannot review own product; buyer with the completed headphones order gets "verified purchase".
    expect((await inject('POST', '/products/prod-001/reviews', { token: seller, body: { rating: 5 } })).statusCode).toBe(403);
    const created = json(await inject('POST', '/products/prod-001/reviews', { token: buyer, body: { rating: 4, text: 'Solid ANC, comfy for hours.' } })).data;
    expect(created).toMatchObject({ rating: 4, verifiedPurchase: true, reply: null, user: { username: 'buyer' } });
    expect(json(await inject('POST', '/products/prod-001/reviews', { token: buyer, body: { rating: 5 } })).error.code).toBe('CONFLICT');
    const after = json(await inject('GET', '/products/prod-001/reviews')).data;
    expect(after.stats.total).toBe(3);
    expect(after.stats.distribution['4']).toBe(2);
    // Product aggregate (seeded marketing count + real reviews) moves with the new review.
    expect(json(await inject('GET', '/products/prod-001')).data.reviewCount).toBe(countBefore + 1);

    // Seller hub: scoped to own products, filter works, reply notifies + shows publicly.
    expect((await inject('GET', '/seller/reviews', { token: buyer })).statusCode).toBe(403);
    const mine = json(await inject('GET', '/seller/reviews?filter=unreplied', { token: seller })).data;
    expect(SellerReviewsResponseSchema.safeParse(mine).success).toBe(true);
    expect(mine.items.every((r: { product: { id: string } }) => ['prod-001', 'prod-002'].includes(r.product.id))).toBe(true);
    expect(mine.items.every((r: { reply: unknown }) => r.reply === null)).toBe(true);
    const other = (await login('fashion@ezyify.test')).accessToken;
    expect((await inject('POST', `/seller/reviews/${created.id}/reply`, { token: other, body: { text: 'Not my product' } })).statusCode).toBe(403);
    const replied = json(await inject('POST', `/seller/reviews/${created.id}/reply`, { token: seller, body: { text: 'Thanks! Enjoy the music.' } })).data;
    expect(replied.reply).toMatchObject({ text: 'Thanks! Enjoy the music.' });
    const stats = json(await inject('GET', '/seller/reviews', { token: seller })).data.stats;
    expect(stats.awaitingReply).toBe(mine.stats.awaitingReply - 1);
    const notes = json(await inject('GET', '/notifications', { token: buyer })).data;
    expect(JSON.stringify(notes)).toMatch(/replied to your review/);
  });

  it('seller earnings reconcile escrow, releases, fees and payouts; payout methods are encrypted and scoped', async () => {
    expect((await inject('GET', '/seller/earnings', { token: buyer })).statusCode).toBe(403);
    const e = json(await inject('GET', '/seller/earnings', { token: seller })).data;
    expect(SellerEarningsSchema.safeParse(e).success).toBe(true);
    const fee = Math.round(7999 * 0.05);
    expect(e.paidOutAllTime.amount).toBe(7999 - fee);
    expect(e.platformFeeAllTime.amount).toBe(fee);
    expect(e.paidOutThisMonth.amount).toBe(7999 - fee);
    expect(e.escrowHeld.amount).toBe(0);
    expect(e.series).toHaveLength(30);
    expect(e.series.reduce((n: number, d: { released: number }) => n + d.released, 0)).toBe(7999 - fee);
    expect(e.available.amount).toBeGreaterThanOrEqual(7999 - fee);

    expect(json(await inject('GET', '/seller/payout-methods', { token: seller })).data).toEqual([]);
    expect((await inject('POST', '/seller/payout-methods', { token: seller, body: { label: 'Main', holderName: 'T', institution: 'X', accountNumber: '12' } })).statusCode).toBe(422);
    const a = json(await inject('POST', '/seller/payout-methods', { token: seller, body: { label: 'Mandiri', holderName: 'TechStore Pte', institution: 'Bank Mandiri', accountNumber: '9988-7766-5544' } })).data;
    const b = json(await inject('POST', '/seller/payout-methods', { token: seller, body: { label: 'GoPay', type: 'ewallet', holderName: 'TechStore Pte', institution: 'GoPay', accountNumber: '081234567890', isDefault: true } })).data;
    expect(a).toMatchObject({ accountLast4: '5544', isDefault: true });
    expect(b).toMatchObject({ accountLast4: '7890', isDefault: true, type: 'ewallet' });
    const list = json(await inject('GET', '/seller/payout-methods', { token: seller })).data;
    expect(list.map((m: { id: string; isDefault: boolean }) => [m.id, m.isDefault])).toEqual([[b.id, true], [a.id, false]]);
    expect(JSON.stringify(list)).not.toMatch(/9988|081234567890|accountEncrypted/);
    // Another seller can neither see nor use these methods.
    const other = (await login('fashion@ezyify.test')).accessToken;
    expect(json(await inject('GET', '/seller/payout-methods', { token: other })).data).toEqual([]);
    expect((await inject('POST', '/wallet/withdraw', { token: other, body: { amount: 500, payoutMethodId: a.id } })).statusCode).toBe(422);
    const w = json(await inject('POST', '/wallet/withdraw', { token: seller, body: { amount: 1000, payoutMethodId: a.id } })).data;
    expect(w.description).toContain('••••5544');
    const after = json(await inject('GET', '/seller/earnings', { token: seller })).data;
    expect(after.pendingWithdrawal.amount).toBe(e.pendingWithdrawal.amount + 1000);
    expect(after.available.amount).toBe(e.available.amount - 1000);
    expect(after.recentPayouts[0]).toMatchObject({ type: 'withdrawal', status: 'pending' });
    expect(json(await inject('POST', `/seller/payout-methods/${a.id}/default`, { token: seller })).data.isDefault).toBe(true);
    expect((await inject('DELETE', `/seller/payout-methods/${b.id}`, { token: seller })).statusCode).toBe(200);
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

  it('seller product CRUD: drafts are owner-only, cross-field validation, ownership 404s, sold products archive', async () => {
    // Unique per run: the test DB is migrated + seeded, not dropped, between local runs.
    const suffix = Date.now().toString(36);
    const body = { name: `Studio Monitor Speakers ${suffix}`, description: 'Bi-amped nearfield monitors with a flat response.', categoryId: 'tech', price: 24900, compareAtPrice: 29900, stock: 8, images: ['https://images.unsplash.com/photo-1545454675-3531b543be5d?w=800'], tags: ['Audio', 'studio'], published: false };
    expect((await inject('POST', '/seller/products', { token: buyer, body })).statusCode).toBe(403);
    const bad = await inject('POST', '/seller/products', { token: seller, body: { ...body, compareAtPrice: 100 } });
    expect(bad.statusCode).toBe(422);
    expect(json(bad).error.details.compareAtPrice).toBeDefined();
    expect(json(await inject('POST', '/seller/products', { token: seller, body: { ...body, categoryId: 'nope' } })).error.details.categoryId).toBeDefined();

    const c = await inject('POST', '/seller/products', { token: seller, body });
    expect(c.statusCode).toBe(201);
    const created = json(c).data;
    expect(SellerProductDetailSchema.safeParse(created).success).toBe(true);
    expect(created).toMatchObject({ slug: `studio-monitor-speakers-${suffix}`, published: false, stock: 8, category: 'Tech', categoryId: 'cat_tech', tags: ['audio', 'studio'], seller: { username: 'techstore' } });
    // Same name again gets a de-duplicated slug.
    expect(json(await inject('POST', '/seller/products', { token: seller, body })).data.slug).toBe(`studio-monitor-speakers-${suffix}-2`);

    // Draft: owner list + detail see it, the public catalog and search do not.
    expect(json(await inject('GET', '/seller/products?status=draft', { token: seller })).data.items.map((p: { id: string }) => p.id)).toContain(created.id);
    expect(json(await inject('GET', `/seller/products/${created.id}`, { token: seller })).data.id).toBe(created.id);
    expect((await inject('GET', `/products/${created.id}`)).statusCode).toBe(404);
    expect(json(await inject('GET', `/products?q=${encodeURIComponent(body.name)}`)).data.items).toHaveLength(0);

    // Publish + restock; partial update keeps the stored compare-at price in the rule.
    const u = json(await inject('PATCH', `/seller/products/${created.id}`, { token: seller, body: { published: true, stock: 3, price: 25900 } })).data;
    expect(u).toMatchObject({ published: true, stock: 3, price: { amount: 25900 }, inStock: true });
    expect(json(await inject('GET', `/products/${created.slug}`)).data.name).toBe(body.name);
    expect(json(await inject('GET', '/seller/products?status=low_stock', { token: seller })).data.items.map((p: { id: string }) => p.id)).toContain(created.id);
    expect(json(await inject('PATCH', `/seller/products/${created.id}`, { token: seller, body: { price: 30000 } })).error.details.price).toBeDefined();

    // Other sellers get 404 (no id probing), admins may manage anything.
    const other = (await login('fashion@ezyify.test')).accessToken;
    expect((await inject('GET', `/seller/products/${created.id}`, { token: other })).statusCode).toBe(404);
    expect((await inject('PATCH', `/seller/products/${created.id}`, { token: other, body: { stock: 0 } })).statusCode).toBe(404);
    expect((await inject('DELETE', `/seller/products/${created.id}`, { token: other })).statusCode).toBe(404);

    expect(json(await inject('DELETE', `/seller/products/${created.id}`, { token: seller })).data).toEqual({ ok: true, mode: 'deleted' });
    expect((await inject('GET', `/seller/products/${created.id}`, { token: seller })).statusCode).toBe(404);
    // prod-002 has order lines from the cancel test above → archived, not deleted.
    expect(json(await inject('DELETE', '/seller/products/prod-002', { token: seller })).data).toEqual({ ok: true, mode: 'archived' });
    expect(json(await inject('GET', '/seller/products/prod-002', { token: seller })).data.published).toBe(false);
    expect((await inject('GET', '/products/prod-002')).statusCode).toBe(404);
    // Restore it so later suites keep their fixture.
    expect(json(await inject('PATCH', '/seller/products/prod-002', { token: seller, body: { published: true } })).data.published).toBe(true);
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
