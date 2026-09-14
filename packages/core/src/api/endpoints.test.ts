import { describe, it, expect, vi } from 'vitest';
import { createApiClient } from './client.js';
import { createEndpoints } from './endpoints.js';

const product = {
  id: 'p1', slug: 'p1', name: 'Thing', imageUrl: 'https://img.test/a.jpg', price: { amount: 100, currency: 'USD' }, compareAtPrice: null,
  rating: 4.5, reviewCount: 3, seller: { id: 's1', username: 'seller', name: 'S', verified: true }, badge: null, inStock: true,
};
const respond = (data: unknown) => new Response(JSON.stringify({ success: true, data }), { status: 200, headers: { 'Content-Type': 'application/json' } });

function harness(data: unknown) {
  const fetch = vi.fn(async () => respond(data));
  const api = createEndpoints(createApiClient({ baseUrl: 'https://api.test/v1', tokens: { getAccessToken: () => 'tok', setAccessToken: () => {}, refresh: async () => null }, fetch }));
  const call = (i = 0) => {
    const [url, init] = fetch.mock.calls[i] as unknown as [string, RequestInit];
    return { url, method: init.method, body: init.body ? JSON.parse(init.body as string) : undefined, headers: init.headers as Record<string, string> };
  };
  return { api, fetch, call };
}

describe('createEndpoints — request shapes match BACKEND_API_SPECIFICATION', () => {
  it('validates request bodies with the shared schemas before sending (throws synchronously, no network)', () => {
    const { api, fetch } = harness(null);
    expect(() => api.auth.login({ identifier: 'x', password: '' })).toThrow(/at least/);
    expect(fetch).not.toHaveBeenCalled();
  });

  it('auth endpoints are unauthenticated and hit the right paths', async () => {
    const { api, call } = harness({ userId: 'u1', email: 'a@b.co', name: 'A', requiresOTP: true, otpSentTo: 'email' });
    await api.auth.signup({ name: 'Ab', email: 'a@b.co', password: 'Password1', acceptTerms: true });
    expect(call()).toMatchObject({ url: 'https://api.test/v1/auth/signup', method: 'POST' });
    expect(call().headers.Authorization).toBeUndefined();
  });

  it('catalog list serialises query params and validates paginated output', async () => {
    const { api, call } = harness({ items: [product], pagination: { page: 1, pageSize: 20, total: 1, hasMore: false } });
    const res = await api.catalog.products({ category: 'tech', sort: 'price_asc', page: 2 });
    expect(res.items[0].id).toBe('p1');
    const url = new URL(call().url);
    expect(url.pathname).toBe('/v1/products');
    expect(Object.fromEntries(url.searchParams)).toEqual({ category: 'tech', sort: 'price_asc', page: '2' });
  });

  it('cart mutations use the spec verbs and encode ids', async () => {
    const cart = { items: [], subtotal: { amount: 0, currency: 'USD' }, shipping: { amount: 0, currency: 'USD' }, discount: { amount: 0, currency: 'USD' }, total: { amount: 0, currency: 'USD' }, couponCode: null };
    const { api, call } = harness(cart);
    await api.cart.add('p 1', 2, 'v1');
    expect(call(0)).toMatchObject({ url: 'https://api.test/v1/cart/items', method: 'POST', body: { productId: 'p 1', quantity: 2, variantId: 'v1' } });
    await api.cart.update('p 1', 3);
    expect(call(1)).toMatchObject({ url: 'https://api.test/v1/cart/items/p%201', method: 'PATCH', body: { quantity: 3 } });
    await api.cart.remove('p 1');
    expect(call(2).method).toBe('DELETE');
  });

  it('rejects malformed server payloads instead of leaking them into the UI', async () => {
    const { api } = harness({ items: [{ ...product, price: 'oops' }], pagination: { page: 1, pageSize: 20, total: 1, hasMore: false } });
    await expect(api.catalog.products()).rejects.toMatchObject({ code: 'SERVER_ERROR' });
  });

  it('policy endpoints validate + route: report, block, device, deletion', async () => {
    const { api, call } = harness({ ok: true });
    await api.moderation.report({ targetType: 'post', targetId: 'post-1', reason: 'spam' });
    expect(call(0)).toMatchObject({ url: 'https://api.test/v1/reports', method: 'POST' });
    await api.moderation.block('u/2');
    expect(call(1)).toMatchObject({ url: 'https://api.test/v1/users/u%2F2/block', method: 'POST' });
    await api.notifications.registerDevice({ token: 't', platform: 'android', provider: 'fcm', appVersion: '1.0.0' });
    expect(call(2).url).toBe('https://api.test/v1/devices');
    await api.account.requestDeletion({ reason: 'privacy' });
    expect(call(3)).toMatchObject({ url: 'https://api.test/v1/account/delete', body: { reason: 'privacy' } });
    expect(() => api.moderation.report({ targetType: 'nope' as never, targetId: 'x', reason: 'spam' })).toThrow();
  });
});

describe('createEndpoints — every endpoint is wired to a path', () => {
  it('walks the whole map: each call performs exactly one request under the base URL', async () => {
    // Responses are irrelevant here (schema failures are fine) — we only assert routing.
    const fetch = vi.fn(async () => respond(null));
    const api = createEndpoints(createApiClient({ baseUrl: 'https://api.test/v1', tokens: { getAccessToken: () => 'tok', setAccessToken: () => {}, refresh: async () => null }, fetch, retries: 0 }));
    const calls: Array<() => Promise<unknown>> = [
      () => api.auth.verifyOtp({ userId: 'u1', otp: '123456', type: 'email' }),
      () => api.auth.forgotPassword('a@b.co'),
      () => api.auth.resetPassword('tok', 'Password1'),
      () => api.auth.refresh(),
      () => api.auth.logout(),
      () => api.users.me(),
      () => api.users.profile('maya'),
      () => api.users.follow('maya'),
      () => api.users.unfollow('maya'),
      () => api.catalog.product('p1'),
      () => api.catalog.categories(),
      () => api.catalog.search('shoes', { page: 1 }),
      () => api.cart.get(),
      () => api.cart.applyCoupon('WELCOME10'),
      () => api.orders.checkout({ addressId: 'a1', paymentMethod: 'wallet' }),
      () => api.orders.list({ status: 'paid' }),
      () => api.orders.get('o1'),
      () => api.orders.timeline('o1'),
      () => api.orders.confirmDelivery('o1'),
      () => api.orders.requestRefund('o1', 'broken', ['i1']),
      () => api.wallet.get(),
      () => api.wallet.transactions(),
      () => api.wallet.topup(1000, 'card'),
      () => api.wallet.withdraw(500, 'pm1'),
      () => api.feed.home(),
      () => api.feed.loops(),
      () => api.feed.post('post-1'),
      () => api.feed.like('post-1'),
      () => api.feed.unlike('post-1'),
      () => api.messaging.conversations(),
      () => api.messaging.messages('c1'),
      () => api.messaging.send('c1', 'hi'),
      () => api.notifications.list(),
      () => api.notifications.markRead('n1'),
      () => api.notifications.markAllRead(),
      () => api.notifications.unregisterDevice('tok'),
      () => api.account.exportData(),
      () => api.moderation.unblock('u2'),
      // Phase 8 additions
      () => api.auth.refresh('rt'),
      () => api.auth.logoutAll(),
      () => api.auth.sessions(),
      () => api.auth.revokeSession('s1'),
      () => api.users.updateMe({ bio: 'hi' }),
      () => api.users.followers('maya'),
      () => api.users.following('maya'),
      () => api.orders.cancel('o1'),
      () => api.addresses.list(),
      () => api.addresses.create({ label: 'Home', recipient: 'A', phone: '0812345', line1: 'Jl. 1', city: 'Jakarta', postal: '12345', country: 'ID' }),
      () => api.addresses.remove('a1'),
      () => api.feed.stories(),
      () => api.feed.saved(),
      () => api.feed.create({ media: [{ type: 'image', url: 'https://img.test/a.jpg', thumbnailUrl: null, width: null, height: null, durationMs: null }] }),
      () => api.feed.remove('post-1'),
      () => api.feed.save('post-1'),
      () => api.feed.unsave('post-1'),
      () => api.feed.comments('post-1'),
      () => api.feed.comment('post-1', 'nice'),
      () => api.messaging.start('maya'),
      () => api.notifications.unreadCount(),
      () => api.uploads.sign({ contentType: 'image/jpeg', sizeBytes: 10, purpose: 'post' }),
      () => api.uploads.finalize('u/x/post/k.jpg'),
      () => api.account.restore(),
      () => api.moderation.blocked(),
    ];
    for (const c of calls) await c().catch(() => undefined);
    expect(fetch).toHaveBeenCalledTimes(calls.length);
    for (const [url] of fetch.mock.calls as unknown as [string][]) expect(url.startsWith('https://api.test/v1/')).toBe(true);
    const urls = (fetch.mock.calls as unknown as [string][]).map(([u]) => new URL(u).pathname);
    expect(urls).toContain('/v1/orders/o1/confirm-delivery');
    expect(urls).toContain('/v1/wallet/withdraw');
    expect(urls).toContain('/v1/devices/tok');
    expect(urls).toContain('/v1/stories');
    expect(urls).toContain('/v1/posts/saved');
    expect(urls).toContain('/v1/uploads/sign');
    expect(urls).toContain('/v1/users/me/blocked');
  });

  it('native refresh sends the stored token in the body; web refresh sends an empty body', async () => {
    const { api, call } = harness({ accessToken: 'a', expiresIn: 900, refreshToken: 'r2' });
    const native = await api.auth.refresh('r1');
    expect(call(0)).toMatchObject({ url: 'https://api.test/v1/auth/refresh', method: 'POST', body: { refreshToken: 'r1' } });
    expect(native.refreshToken).toBe('r2');
    await api.auth.refresh();
    expect(call(1).body).toEqual({});
  });

  it('checkout forwards the Idempotency-Key header only when provided', async () => {
    const { api, call } = harness([]);
    await api.orders.checkout({ addressId: 'a1', paymentMethod: 'wallet' }, 'idem-1');
    expect(call(0).headers['Idempotency-Key']).toBe('idem-1');
    await api.orders.checkout({ addressId: 'a1', paymentMethod: 'wallet' });
    expect(call(1).headers['Idempotency-Key']).toBeUndefined();
  });

  it('messaging.send accepts a plain string or a structured body and rejects empty messages', async () => {
    const msg = { id: 'm1', conversationId: 'c1', senderId: 'me', text: 'hi', media: null, productId: null, status: 'sent', createdAt: new Date().toISOString() };
    const { api, call } = harness(msg);
    await api.messaging.send('c1', 'hi');
    expect(call(0).body).toEqual({ text: 'hi' });
    await api.messaging.send('c1', { productId: 'p1' });
    expect(call(1).body).toEqual({ productId: 'p1' });
    expect(() => api.messaging.send('c1', {})).toThrow(/empty/i);
  });

  it('public catalog reads never attach the bearer token (cacheable, works for guests)', async () => {
    const { api, call } = harness([]);
    await api.catalog.categories();
    expect(call(0).headers.Authorization).toBeUndefined();
    await api.cart.get().catch(() => undefined);
    expect(call(1).headers.Authorization).toBe('Bearer tok');
  });
});
