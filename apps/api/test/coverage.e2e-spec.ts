import 'reflect-metadata';
import { existsSync, readFileSync } from 'node:fs';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from '../src/bootstrap.js';
import { loadEnv } from '../src/config.js';
import { PrismaService } from '../src/infra/prisma/prisma.service.js';
import { OrdersService } from '../src/modules/orders/orders.service.js';
import { NotificationsService } from '../src/modules/notifications/notifications.service.js';
import { CategorySchema, ConversationSchema, MessageSchema, NotificationSchema, PostSchema, ProductDetailSchema, TransactionSchema, UserProfileSchema, WalletSchema, paginated, DEFAULT_NOTIFICATION_PREFERENCES } from '@ezyify/core';
import { z } from 'zod';

/** Broad behavioural coverage of the remaining modules: users, catalog detail, cart edge cases, feed authoring, messaging, wallet, account, orders refund/cancel. */
let app: NestFastifyApplication;
type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE';
const inject = (method: Method, url: string, opts: { token?: string; body?: unknown; headers?: Record<string, string> } = {}) =>
  app.inject({
    method,
    url: `/v1${url}`,
    payload: opts.body as never,
    headers: { ...(opts.body !== undefined ? { 'content-type': 'application/json' } : {}), 'x-client': 'native', ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers },
  });
const json = (r: { body: string }) => JSON.parse(r.body);
const login = async (email: string) => json(await inject('POST', '/auth/login', { body: { identifier: email, password: 'Password1' } })).data.accessToken as string;
const valid = <T extends z.ZodTypeAny>(schema: T, value: unknown) => {
  const r = schema.safeParse(value);
  if (!r.success) throw new Error(JSON.stringify(r.error.issues, null, 2));
  return true;
};

let buyer: string;
let maya: string;
let seller: string;

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
  buyer = await login('buyer@ezyify.test');
  maya = await login('maya@ezyify.test');
  seller = await login('techstore@ezyify.test');
});
afterAll(() => app.close());

describe('users', () => {
  it('me / public profile / update / followers', async () => {
    const me = json(await inject('GET', '/users/me', { token: buyer })).data;
    expect(valid(UserProfileSchema, me)).toBe(true);
    const upd = json(await inject('PATCH', '/users/me', { token: buyer, body: { bio: 'Hello 👋', website: 'https://buyer.example' } })).data;
    expect(upd.bio).toBe('Hello 👋');
    expect((await inject('PATCH', '/users/me', { token: buyer, body: { username: 'fashionista_maya' } })).statusCode).toBe(409);
    expect((await inject('PATCH', '/users/me', { token: buyer, body: { username: 'Bad Name!' } })).statusCode).toBe(422);
    const profile = json(await inject('GET', '/users/fashionista_maya', { token: buyer })).data;
    expect(profile.isFollowing).toBe(true);
    const anon = json(await inject('GET', '/users/fashionista_maya')).data;
    expect(anon.isFollowing).toBeUndefined();
    expect((await inject('GET', '/users/nobody-here')).statusCode).toBe(404);
    const followers = json(await inject('GET', '/users/fashionista_maya/followers')).data;
    expect(followers.some((u: { username: string }) => u.username === 'buyer')).toBe(true);
    expect((await inject('GET', '/users/fashionista_maya/following')).statusCode).toBe(200);
    expect((await inject('POST', '/users/buyer/follow', { token: buyer })).statusCode).toBe(422);
    expect(json(await inject('DELETE', '/users/fashionista_maya/follow', { token: buyer })).data.ok).toBe(true);
    expect(json(await inject('POST', '/users/fashionista_maya/follow', { token: buyer })).data.ok).toBe(true);
  });

  it('account details, private accounts gate posts/followers, and change-password re-auths + revokes other sessions', async () => {
    const alex = await login('alex@ezyify.test');
    const acct = json(await inject('GET', '/users/me/account', { token: alex })).data;
    expect(acct).toMatchObject({ email: 'alex@ezyify.test', emailVerified: true, role: 'creator', deletionScheduledAt: null });
    expect(JSON.stringify(json(await inject('GET', '/users/tech_reviews_pro')).data)).not.toContain('alex@ezyify.test');
    // Go private: anonymous + non-followers lose posts/followers/following; the owner and followers keep them.
    expect(json(await inject('PATCH', '/users/me', { token: alex, body: { isPrivate: true } })).data.isPrivate).toBe(true);
    expect((await inject('GET', '/users/tech_reviews_pro/followers')).statusCode).toBe(403);
    expect((await inject('GET', '/users/tech_reviews_pro/following', { token: seller })).statusCode).toBe(403);
    expect((await inject('GET', '/users/tech_reviews_pro/followers', { token: alex })).statusCode).toBe(200);
    expect(json(await inject('GET', '/feed?author=tech_reviews_pro')).data.items).toHaveLength(0);
    expect(json(await inject('GET', '/users/tech_reviews_pro')).data.isPrivate).toBe(true); // profile card stays discoverable
    await inject('POST', '/users/tech_reviews_pro/follow', { token: seller });
    expect((await inject('GET', '/users/tech_reviews_pro/followers', { token: seller })).statusCode).toBe(200);
    await inject('DELETE', '/users/tech_reviews_pro/follow', { token: seller });
    await inject('PATCH', '/users/me', { token: alex, body: { isPrivate: false } });
    expect((await inject('GET', '/users/tech_reviews_pro/followers')).statusCode).toBe(200);
    // Change password: wrong current → 401; weak → 422; success → old password refused, other sessions revoked.
    const other = await login('alex@ezyify.test');
    expect((await inject('POST', '/auth/change-password', { token: alex, body: { currentPassword: 'Wrong1234', newPassword: 'Newpass123' } })).statusCode).toBe(401);
    expect((await inject('POST', '/auth/change-password', { token: alex, body: { currentPassword: 'Password1', newPassword: 'short' } })).statusCode).toBe(422);
    expect(json(await inject('POST', '/auth/change-password', { token: alex, body: { currentPassword: 'Password1', newPassword: 'Newpass123' } })).data.ok).toBe(true);
    expect((await inject('POST', '/auth/login', { body: { identifier: 'alex@ezyify.test', password: 'Password1' } })).statusCode).toBe(401);
    // Access tokens outlive the change, but every refresh session was revoked (the test client has no cookie to keep).
    expect(json(await inject('GET', '/auth/sessions', { token: other })).data).toHaveLength(0);
    // Restore the seed password for later suites.
    const fresh = json(await inject('POST', '/auth/login', { body: { identifier: 'alex@ezyify.test', password: 'Newpass123' } })).data.accessToken;
    expect(json(await inject('POST', '/auth/change-password', { token: fresh, body: { currentPassword: 'Newpass123', newPassword: 'Password1' } })).data.ok).toBe(true);
  });

  it('notification preferences default from core, patch per category/channel, and gate push delivery', async () => {
    expect((await inject('GET', '/users/me/notification-preferences')).statusCode).toBe(401);
    const initial = json(await inject('GET', '/users/me/notification-preferences', { token: buyer })).data;
    expect(initial).toEqual(DEFAULT_NOTIFICATION_PREFERENCES);
    const patched = json(await inject('PATCH', '/users/me/notification-preferences', { token: buyer, body: { promos: { email: true }, social: { push: false } } })).data;
    expect(patched.promos).toEqual({ push: false, email: true });
    expect(patched.social).toEqual({ push: false, email: false });
    expect(patched.orders).toEqual(DEFAULT_NOTIFICATION_PREFERENCES.orders);
    expect(json(await inject('GET', '/users/me/notification-preferences', { token: buyer })).data).toEqual(patched);
    expect((await inject('PATCH', '/users/me/notification-preferences', { token: buyer, body: { social: { push: 'yes' } } })).statusCode).toBe(422);
    // Restore so later suites see defaults.
    await inject('PATCH', '/users/me/notification-preferences', { token: buyer, body: { promos: { email: false }, social: { push: true } } });
  });
});

describe('catalog detail + categories', () => {
  it('returns a schema-valid product detail by id or slug, categories with counts, filters', async () => {
    const byId = json(await inject('GET', '/products/prod-004')).data;
    expect(valid(ProductDetailSchema, byId)).toBe(true);
    expect(byId.variants).toHaveLength(2);
    const bySlug = json(await inject('GET', '/products/leather-backpack')).data;
    expect(bySlug.id).toBe('prod-004');
    const cats = json(await inject('GET', '/categories')).data;
    expect(valid(z.array(CategorySchema), cats)).toBe(true);
    expect(cats.find((c: { slug: string }) => c.slug === 'tech').productCount).toBeGreaterThanOrEqual(3);
    const filtered = json(await inject('GET', '/products?category=beauty&minPrice=1000&maxPrice=5000&sort=rating')).data;
    expect(filtered.items.every((p: { id: string }) => p.id === 'prod-006')).toBe(true);
    const search = json(await inject('GET', '/search?q=serum')).data;
    expect(search.items[0].id).toBe('prod-006');
    const bySeller = json(await inject('GET', '/products?seller=techstore&sort=newest')).data;
    expect(bySeller.items.every((p: { seller: { username: string } }) => p.seller.username === 'techstore')).toBe(true);
    expect((await inject('GET', '/products?pageSize=500')).statusCode).toBe(422);
  });
});

describe('cart edge cases', () => {
  it('variants, stock limits, coupons, quantity updates, removal', async () => {
    await inject('DELETE', '/cart/items/prod-001', { token: maya });
    await inject('DELETE', '/cart/items/prod-004', { token: maya });
    expect((await inject('POST', '/cart/items', { token: maya, body: { productId: 'prod-004', variantId: 'nope' } })).statusCode).toBe(404);
    expect((await inject('POST', '/cart/items', { token: maya, body: { productId: 'nope' } })).statusCode).toBe(404);
    const over = await inject('POST', '/cart/items', { token: maya, body: { productId: 'prod-004', variantId: 'var_backpack_sand', quantity: 50 } });
    expect(json(over).error.details.quantity).toMatch(/left in stock/);
    let cart = json(await inject('POST', '/cart/items', { token: maya, body: { productId: 'prod-004', variantId: 'var_backpack_sand', quantity: 1 } })).data;
    cart = json(await inject('POST', '/cart/items', { token: maya, body: { productId: 'prod-004', variantId: 'var_backpack_sand', quantity: 1 } })).data;
    expect(cart.items[0].quantity).toBe(2);
    expect(cart.shipping.amount).toBe(0); // ≥ 50.00 → free
    expect((await inject('POST', '/cart/coupon', { token: maya, body: { code: 'NOPE' } })).statusCode).toBe(422);
    cart = json(await inject('POST', '/cart/coupon', { token: maya, body: { code: 'welcome10' } })).data;
    expect(cart.couponCode).toBe('WELCOME10');
    expect(cart.discount.amount).toBe(Math.round(cart.subtotal.amount * 0.1));
    cart = json(await inject('PATCH', '/cart/items/prod-004', { token: maya, body: { quantity: 1 } })).data;
    expect(cart.items[0].quantity).toBe(1);
    cart = json(await inject('PATCH', '/cart/items/prod-004', { token: maya, body: { quantity: 0 } })).data;
    expect(cart.items).toHaveLength(0);
    expect(cart.total.amount).toBe(0);
  });
});

describe('feed authoring + engagement', () => {
  let postId: string;
  it('creates a post with tagged products, comments on it, saves it, lists stories, deletes it', async () => {
    const created = json(
      await inject('POST', '/posts', {
        token: maya,
        body: { caption: 'New drop ✨ #ootd', hashtags: ['OOTD'], media: [{ type: 'image', url: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1080' }], taggedProductIds: ['prod-004'], location: 'Jakarta' },
      }),
    ).data;
    expect(valid(PostSchema, created)).toBe(true);
    postId = created.id;
    expect(created.hashtags).toEqual(['ootd']);
    expect(created.taggedProductIds).toEqual(['prod-004']);
    expect((await inject('POST', '/posts', { token: maya, body: { caption: 'no media', media: [] } })).statusCode).toBe(422);

    const c = json(await inject('POST', `/posts/${postId}/comments`, { token: buyer, body: { text: 'Love it!' } })).data;
    expect(c.author.username).toBe('buyer');
    const comments = json(await inject('GET', `/posts/${postId}/comments`)).data;
    expect(comments.items[0].text).toBe('Love it!');
    expect(json(await inject('GET', `/posts/${postId}`, { token: buyer })).data.engagement.comments).toBe(1);

    await inject('POST', `/posts/${postId}/save`, { token: buyer });
    expect(json(await inject('GET', `/posts/${postId}`, { token: buyer })).data.engagement.isSaved).toBe(true);
    await inject('DELETE', `/posts/${postId}/save`, { token: buyer });
    expect(json(await inject('GET', `/posts/${postId}`, { token: buyer })).data.engagement.isSaved).toBe(false);

    const byTag = json(await inject('GET', '/feed?hashtag=%23ootd&author=fashionista_maya')).data;
    expect(byTag.items.some((p: { id: string }) => p.id === postId)).toBe(true);
    const stories = json(await inject('GET', '/stories', { token: buyer })).data;
    expect(stories.every((p: { kind: string }) => p.kind === 'story')).toBe(true);
    const loops = json(await inject('GET', '/loops')).data;
    expect(valid(paginated(PostSchema), loops)).toBe(true);
    expect(loops.items.every((p: { kind: string }) => p.kind === 'loop')).toBe(true);

    const notifs = json(await inject('GET', '/notifications', { token: maya })).data;
    expect(valid(paginated(NotificationSchema), notifs)).toBe(true);
    expect(notifs.items.some((n: { type: string }) => n.type === 'comment')).toBe(true);
    const unread = json(await inject('GET', '/notifications/unread-count', { token: maya })).data.count;
    expect(unread).toBeGreaterThan(0);
    await inject('POST', `/notifications/${notifs.items[0].id}/read`, { token: maya });
    await inject('POST', '/notifications/read-all', { token: maya });
    expect(json(await inject('GET', '/notifications/unread-count', { token: maya })).data.count).toBe(0);

    expect((await inject('DELETE', `/posts/${postId}`, { token: buyer })).statusCode).toBe(403);
    expect(json(await inject('DELETE', `/posts/${postId}`, { token: maya })).data.ok).toBe(true);
    expect((await inject('GET', `/posts/${postId}`)).statusCode).toBe(404);
    expect((await inject('POST', `/posts/${postId}/like`, { token: buyer })).statusCode).toBe(404);
  });
});

describe('messaging', () => {
  it('starts (or reuses) a thread, sends, lists with unread counts, refuses blocked pairs', async () => {
    const start = json(await inject('POST', '/conversations', { token: buyer, body: { username: 'fashionista_maya' } })).data;
    expect(start.id).toBe('c_buyer_maya'); // seeded thread reused
    expect((await inject('POST', '/conversations', { token: buyer, body: { username: 'buyer' } })).statusCode).toBe(422);
    expect((await inject('POST', '/conversations', { token: buyer, body: { username: 'ghost' } })).statusCode).toBe(404);
    const sent = json(await inject('POST', `/conversations/${start.id}/messages`, { token: buyer, body: { text: 'Ordered the sand one!' } })).data;
    expect(valid(MessageSchema, sent)).toBe(true);
    expect((await inject('POST', `/conversations/${start.id}/messages`, { token: buyer, body: {} })).statusCode).toBe(422);
    expect((await inject('GET', `/conversations/${start.id}/messages`, { token: seller })).statusCode).toBe(404);
    const list = json(await inject('GET', '/conversations', { token: maya })).data;
    expect(valid(z.array(ConversationSchema), list)).toBe(true);
    const thread = list.find((c: { id: string }) => c.id === start.id);
    expect(thread.unreadCount).toBeGreaterThan(0);
    expect(thread.lastMessage.fromMe).toBe(false);
    const msgs = json(await inject('GET', `/conversations/${start.id}/messages`, { token: maya })).data;
    expect(valid(paginated(MessageSchema), msgs)).toBe(true);
    expect(json(await inject('GET', '/conversations', { token: maya })).data.find((c: { id: string }) => c.id === start.id).unreadCount).toBe(0);

    await inject('POST', '/users/u_alex/block', { token: buyer });
    expect((await inject('POST', '/conversations', { token: buyer, body: { username: 'tech_reviews_pro' } })).statusCode).toBe(403);
    expect((await inject('GET', '/users/tech_reviews_pro', { token: buyer })).statusCode).toBe(404);
    const blocked = json(await inject('GET', '/users/me/blocked', { token: buyer })).data;
    expect(blocked.some((u: { id: string }) => u.id === 'u_alex')).toBe(true);
    await inject('DELETE', '/users/u_alex/block', { token: buyer });
  });
});

describe('wallet', () => {
  it('top-up, transactions, withdraw with insufficient funds guard', async () => {
    const before = json(await inject('GET', '/wallet', { token: maya })).data;
    expect(valid(WalletSchema, before)).toBe(true);
    const after = json(await inject('POST', '/wallet/topup', { token: maya, body: { amount: 2500, method: 'card' } })).data;
    expect(after.balance.amount - before.balance.amount).toBe(2500);
    expect((await inject('POST', '/wallet/topup', { token: maya, body: { amount: 5, method: 'card' } })).statusCode).toBe(422);
    const tx = json(await inject('GET', '/wallet/transactions', { token: maya })).data;
    expect(valid(paginated(TransactionSchema), tx)).toBe(true);
    expect(tx.items[0]).toMatchObject({ type: 'topup', direction: 'in' });
    // Withdrawals only go to a saved payout method owned by the caller.
    expect((await inject('POST', '/wallet/withdraw', { token: maya, body: { amount: 1000, payoutMethodId: 'pm-not-mine' } })).statusCode).toBe(422);
    const pm = json(await inject('POST', '/seller/payout-methods', { token: maya, body: { label: 'BCA', holderName: 'Maya Chen', institution: 'Bank Central Asia', accountNumber: '1234567890' } })).data;
    expect(pm).toMatchObject({ accountLast4: '7890', isDefault: true });
    expect(pm).not.toHaveProperty('accountEncrypted');
    expect((await inject('POST', '/wallet/withdraw', { token: maya, body: { amount: 10_000_000, payoutMethodId: pm.id } })).statusCode).toBe(422);
    const w = json(await inject('POST', '/wallet/withdraw', { token: maya, body: { amount: 1000, payoutMethodId: pm.id } })).data;
    expect(w).toMatchObject({ type: 'withdrawal', status: 'pending', description: expect.stringContaining('••••7890') });
    // A pending withdrawal blocks deleting its destination.
    expect((await inject('DELETE', `/seller/payout-methods/${pm.id}`, { token: maya })).statusCode).toBe(422);
    expect(json(await inject('GET', '/wallet', { token: maya })).data.pending.amount).toBeGreaterThanOrEqual(1000);
  });
});

describe('orders: refund, cancel, seller list, errors', () => {
  it('buyer requests refund, seller approves → wallet refunded + stock restored', async () => {
    const stockBefore = (await app.get(PrismaService).product.findUnique({ where: { id: 'prod-003' } }))!.stock;
    await inject('POST', '/cart/items', { token: buyer, body: { productId: 'prod-003', quantity: 1 } });
    const orders = json(await inject('POST', '/checkout', { token: buyer, body: { addressId: 'addr_buyer_home', paymentMethod: 'wallet', note: 'Leave at door' } })).data;
    const order = orders.find((o: { seller: { username: string } }) => o.seller.username === 'homebyjules');
    expect(order).toBeTruthy();
    const jules = await login('jules@ezyify.test');
    expect((await inject('POST', `/orders/${order.id}/refund`, { token: buyer, body: { reason: 'x' } })).statusCode).toBe(422);
    const refundReq = json(await inject('POST', `/orders/${order.id}/refund`, { token: buyer, body: { reason: 'Changed my mind', itemIds: [order.items[0].id] } })).data;
    expect(refundReq.status).toBe('refund_requested');
    const walletBefore = json(await inject('GET', '/wallet', { token: buyer })).data.balance.amount;
    const refunded = json(await inject('POST', `/seller/orders/${order.id}/refund`, { token: jules })).data;
    expect(refunded).toMatchObject({ status: 'refunded', escrow: { status: 'refunded' } });
    expect(json(await inject('GET', '/wallet', { token: buyer })).data.balance.amount - walletBefore).toBe(order.total.amount);
    expect((await app.get(PrismaService).product.findUnique({ where: { id: 'prod-003' } }))!.stock).toBe(stockBefore);
    const sellerOrders = json(await inject('GET', '/orders?role=seller&status=refunded', { token: jules })).data;
    expect(sellerOrders.items.some((o: { id: string }) => o.id === order.id)).toBe(true);
    expect((await inject('GET', `/orders/${order.id}`, { token: maya })).statusCode).toBe(403);
    expect((await inject('GET', '/orders/nope', { token: buyer })).statusCode).toBe(404);
  });

  it('refund case: seller declines → buyer withdraws (order resumes) → re-requests → escalates → admin resolves', async () => {
    const prisma = app.get(PrismaService);
    await inject('POST', '/cart/items', { token: buyer, body: { productId: 'prod-003', quantity: 1 } });
    const orders = json(await inject('POST', '/checkout', { token: buyer, body: { addressId: 'addr_buyer_home', paymentMethod: 'wallet' } })).data;
    const order = orders.find((o: { seller: { username: string } }) => o.seller.username === 'homebyjules');
    const jules = await login('jules@ezyify.test');
    const admin = await login('admin@ezyify.test');
    expect(json(await inject('GET', `/orders/${order.id}`, { token: buyer })).data.refund).toBeNull();
    // Unknown item id → 422; a valid request attaches an open case.
    expect((await inject('POST', `/orders/${order.id}/refund`, { token: buyer, body: { reason: 'Arrived cracked', itemIds: ['nope'] } })).statusCode).toBe(422);
    const req = json(await inject('POST', `/orders/${order.id}/refund`, { token: buyer, body: { reason: 'Arrived cracked', itemIds: [order.items[0].id] } })).data;
    expect(req.refund).toMatchObject({ status: 'requested', reason: 'Arrived cracked', sellerResponse: null });
    // Decline needs a reason and seller ownership; the order stays refund_requested so the buyer keeps options.
    expect((await inject('POST', `/seller/orders/${order.id}/refund/decline`, { token: jules, body: { response: 'no' } })).statusCode).toBe(422);
    expect((await inject('POST', `/seller/orders/${order.id}/refund/decline`, { token: seller, body: { response: 'Not my order' } })).statusCode).toBe(403);
    const declined = json(await inject('POST', `/seller/orders/${order.id}/refund/decline`, { token: jules, body: { response: 'Packaging photos show it left intact' } })).data;
    expect(declined).toMatchObject({ status: 'refund_requested', refund: { status: 'rejected', sellerResponse: 'Packaging photos show it left intact' } });
    // Buyer withdraws → order resumes at `paid`, seller notified, case closed as withdrawn.
    const wres = await inject('POST', `/orders/${order.id}/refund/withdraw`, { token: buyer });
    expect(wres.statusCode, wres.body).toBe(201);
    const resumed = json(wres).data;
    expect(resumed).toMatchObject({ status: 'paid', escrow: { status: 'held' }, refund: { status: 'withdrawn' } });
    expect((await inject('POST', `/orders/${order.id}/refund/withdraw`, { token: buyer })).statusCode).toBe(409);
    // Re-request, then escalate: escrow frozen, admin queue lists it, non-admin can't see the queue.
    await inject('POST', `/orders/${order.id}/refund`, { token: buyer, body: { reason: 'Still cracked', itemIds: [] } });
    expect((await inject('POST', `/orders/${order.id}/dispute`, { token: buyer, body: { reason: 'short' } })).statusCode).toBe(422);
    const disputed = json(await inject('POST', `/orders/${order.id}/dispute`, { token: buyer, body: { reason: 'Seller refuses to acknowledge the damage; photos attached in chat.' } })).data;
    expect(disputed).toMatchObject({ status: 'disputed', escrow: { status: 'disputed' }, refund: { status: 'disputed' } });
    expect((await inject('GET', '/admin/disputes', { token: jules })).statusCode).toBe(403);
    const queue = json(await inject('GET', '/admin/disputes', { token: admin })).data;
    expect(queue.items.some((o: { id: string }) => o.id === order.id)).toBe(true);
    // Seller can no longer approve/decline a disputed order; admin refunds the buyer.
    expect((await inject('POST', `/seller/orders/${order.id}/refund/decline`, { token: jules, body: { response: 'Too late' } })).statusCode).toBe(409);
    const walletBefore = json(await inject('GET', '/wallet', { token: buyer })).data.balance.amount;
    const resolved = json(await inject('POST', `/admin/orders/${order.id}/resolve`, { token: admin, body: { decision: 'refund', note: 'Damage confirmed from buyer photos' } })).data;
    expect(resolved).toMatchObject({ status: 'refunded', escrow: { status: 'refunded' }, refund: { status: 'refunded', resolution: 'Damage confirmed from buyer photos' } });
    expect(json(await inject('GET', '/wallet', { token: buyer })).data.balance.amount - walletBefore).toBe(order.total.amount);
    expect((await inject('POST', `/admin/orders/${order.id}/resolve`, { token: admin, body: { decision: 'release', note: 'again' } })).statusCode).toBe(409);
    expect(await prisma.refundRequest.count({ where: { orderId: order.id } })).toBe(2);
  });

  it('buyer cancels a paid order; empty cart / bad address / non-wallet payment paths', async () => {
    await inject('POST', '/cart/items', { token: buyer, body: { productId: 'prod-007', quantity: 1 } });
    const [order] = json(await inject('POST', '/checkout', { token: buyer, body: { addressId: 'addr_buyer_home', paymentMethod: 'wallet' } })).data;
    expect(json(await inject('POST', `/orders/${order.id}/cancel`, { token: buyer })).data.status).toBe('cancelled');
    expect((await inject('POST', '/checkout', { token: buyer, body: { addressId: 'addr_buyer_home', paymentMethod: 'wallet' } })).statusCode).toBe(422);
    await inject('POST', '/cart/items', { token: buyer, body: { productId: 'prod-007', quantity: 1 } });
    expect((await inject('POST', '/checkout', { token: buyer, body: { addressId: 'not-mine', paymentMethod: 'wallet' } })).statusCode).toBe(404);
    const [pending] = json(await inject('POST', '/checkout', { token: buyer, body: { addressId: 'addr_buyer_home', paymentMethod: 'card' } })).data;
    expect(pending).toMatchObject({ status: 'pending_payment', escrow: { autoReleaseAt: null } });
    expect((await inject('POST', '/payments/order-intent', { token: buyer, body: { orderIds: [pending.id] } })).statusCode).toBe(422); // Stripe not configured in tests
    expect((await inject('POST', '/seller/orders/' + pending.id + '/accept', { token: buyer })).statusCode).toBe(403); // buyer lacks seller role
  });

  it('auto-release cron completes delivered orders past their hold and housekeeping runs', async () => {
    const prisma = app.get(PrismaService);
    await inject('POST', '/cart/items', { token: buyer, body: { productId: 'prod-002', quantity: 1 } });
    const [order] = json(await inject('POST', '/checkout', { token: buyer, body: { addressId: 'addr_buyer_home', paymentMethod: 'wallet' } })).data;
    await inject('POST', `/seller/orders/${order.id}/accept`, { token: seller });
    await inject('POST', `/seller/orders/${order.id}/ship`, { token: seller, body: { carrier: 'JNE', number: 'X1', url: 'https://track.example/X1' } });
    await inject('POST', `/seller/orders/${order.id}/deliver`, { token: seller });
    await prisma.order.update({ where: { id: order.id }, data: { autoReleaseAt: new Date(Date.now() - 1000) } });
    const released = await app.get(OrdersService).autoRelease();
    expect(released).toBeGreaterThanOrEqual(1);
    const done = json(await inject('GET', `/orders/${order.id}`, { token: buyer })).data;
    expect(done).toMatchObject({ status: 'completed', escrow: { status: 'released' }, tracking: { carrier: 'JNE', number: 'X1' } });
    await expect(app.get(OrdersService).housekeeping()).resolves.toBeUndefined();
    expect(await app.get(NotificationsService).push('u_buyer', 'Hi', 'there')).toBeGreaterThanOrEqual(0);
  });
});

describe('kyc', () => {
  it('submit → pending (no full id number back) → admin reject → resubmit → approve flips User.verified', async () => {
    const sara = await login('sara@ezyify.test');
    const admin = await login('admin@ezyify.test');
    const doc = { documentType: 'national_id', fullName: 'Sara Kim', idNumber: 'ID-1234567890', dateOfBirth: '1990-04-12', country: 'id', documentFrontUrl: 'https://cdn.example/kyc/front.jpg', documentBackUrl: 'https://cdn.example/kyc/back.jpg', selfieUrl: 'https://cdn.example/kyc/selfie.jpg' };
    expect((await inject('GET', '/kyc')).statusCode).toBe(401);
    expect(json(await inject('GET', '/kyc', { token: sara })).data).toEqual({ verified: false, submission: null, canSubmit: true });
    // Validation: minors and missing back-of-card are 422.
    expect((await inject('POST', '/kyc', { token: sara, body: { ...doc, dateOfBirth: '2015-01-01' } })).statusCode).toBe(422);
    expect((await inject('POST', '/kyc', { token: sara, body: { ...doc, documentBackUrl: null } })).statusCode).toBe(422);
    const sub = json(await inject('POST', '/kyc', { token: sara, body: doc })).data;
    expect(sub).toMatchObject({ status: 'pending', idNumberLast4: '7890', country: 'ID' });
    expect(JSON.stringify(sub)).not.toContain('ID-1234567890');
    expect((await inject('POST', '/kyc', { token: sara, body: doc })).statusCode).toBe(409);
    expect(json(await inject('GET', '/kyc', { token: sara })).data.canSubmit).toBe(false);
    // Admin queue is admin-only and shows the submitter's email for the reviewer.
    expect((await inject('GET', '/admin/kyc', { token: sara })).statusCode).toBe(403);
    const queue = json(await inject('GET', '/admin/kyc', { token: admin })).data;
    expect(queue.items.some((k: { id: string; email: string }) => k.id === sub.id && k.email === 'sara@ezyify.test')).toBe(true);
    expect((await inject('PATCH', `/admin/kyc/${sub.id}`, { token: admin, body: { decision: 'reject' } })).statusCode).toBe(422);
    const rejected = json(await inject('PATCH', `/admin/kyc/${sub.id}`, { token: admin, body: { decision: 'reject', reason: 'Selfie is blurry' } })).data;
    expect(rejected).toMatchObject({ status: 'rejected', rejectionReason: 'Selfie is blurry' });
    expect((await inject('PATCH', `/admin/kyc/${sub.id}`, { token: admin, body: { decision: 'approve' } })).statusCode).toBe(409);
    const state = json(await inject('GET', '/kyc', { token: sara })).data;
    expect(state).toMatchObject({ verified: false, canSubmit: true, submission: { status: 'rejected' } });
    const again = json(await inject('POST', '/kyc', { token: sara, body: doc })).data;
    expect(json(await inject('PATCH', `/admin/kyc/${again.id}`, { token: admin, body: { decision: 'approve' } })).data.status).toBe('approved');
    expect(json(await inject('GET', '/kyc', { token: sara })).data).toMatchObject({ verified: true, canSubmit: false });
    expect(json(await inject('GET', '/users/glow.with.sara')).data.verified).toBe(true);
    expect((await inject('POST', '/kyc', { token: sara, body: doc })).statusCode).toBe(409);
    const notes = json(await inject('GET', '/notifications', { token: sara })).data;
    expect(notes.items.some((n: { message: string }) => /identity is verified/.test(n.message))).toBe(true);
  });
});

describe('account', () => {
  it('addresses CRUD, export, deletion with wrong/right password, restore', async () => {
    const sara = await login('sara@ezyify.test');
    const addr = json(await inject('POST', '/addresses', { token: sara, body: { label: 'Home', recipient: 'Sara', phone: '+82101234567', line1: '1 Gangnam', city: 'Seoul', postal: '06000', country: 'kr', isDefault: true } })).data;
    expect(addr.country).toBe('KR');
    expect(json(await inject('GET', '/addresses', { token: sara })).data).toHaveLength(1);
    expect(json(await inject('DELETE', `/addresses/${addr.id}`, { token: sara })).data.ok).toBe(true);
    const exp = json(await inject('POST', '/account/export', { token: sara })).data;
    expect(exp.profile.email).toBe('sara@ezyify.test');
    expect(Array.isArray(exp.posts)).toBe(true);
    expect((await inject('POST', '/account/delete', { token: sara, body: { reason: 'privacy', password: 'Wrong1234' } })).statusCode).toBe(401);
    const del = json(await inject('POST', '/account/delete', { token: sara, body: { reason: 'privacy', feedback: 'bye', password: 'Password1' } })).data;
    expect(del).toMatchObject({ ok: true, purgeAfterDays: 30 });
    // Soft-deleted: profile hidden, login refused, restore brings it back.
    expect((await inject('GET', '/users/glow.with.sara')).statusCode).toBe(404);
    expect((await inject('POST', '/auth/login', { body: { identifier: 'sara@ezyify.test', password: 'Password1' } })).statusCode).toBe(401);
    expect(json(await inject('POST', '/account/restore', { token: sara })).data.ok).toBe(true);
    expect((await inject('GET', '/users/glow.with.sara')).statusCode).toBe(200);
  });

  it('uploads return "storage unavailable" when S3 is not configured, and readiness probe hits the DB', async () => {
    expect(json(await inject('POST', '/uploads/sign', { token: buyer, body: { contentType: 'image/png', sizeBytes: 1000, purpose: 'avatar' } })).error.details.storage).toMatch(/not enabled/);
    expect(json(await inject('GET', '/health/ready'))).toEqual({ status: 'ready', db: 'ok' });
    expect((await inject('GET', '/users/me', { headers: { authorization: 'Bearer nope' } })).statusCode).toBe(401);
    expect(json(await inject('GET', '/products/prod-001', { headers: { authorization: 'Bearer nope' } })).success).toBe(true); // public route tolerates a bad token
  });
});
