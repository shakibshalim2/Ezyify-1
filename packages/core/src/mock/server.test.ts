import { describe, it, expect } from 'vitest';
import { createApiClient } from '../api/client.js';
import { createEndpoints } from '../api/endpoints.js';
import { createMockFetch, MOCK_CREDENTIALS } from './server.js';
import { OrderSchema, PostSchema, ProductDetailSchema, UserProfileSchema } from '../schemas/index.js';

/** The mock server is exercised through the real client + endpoint map, so every response is contract-validated. */
function harness(native = true) {
  const fetch = createMockFetch({ latencyMs: 0 });
  let access: string | null = null;
  let refresh: string | null = null;
  const client = createApiClient({
    baseUrl: 'https://api.test/v1',
    fetch,
    headers: native ? { 'X-Client': 'native' } : {},
    tokens: {
      getAccessToken: () => access,
      setAccessToken: t => void (access = t),
      refresh: async () => {
        if (!refresh) return null;
        const r = await createEndpoints(client).auth.refresh(refresh);
        refresh = r.refreshToken ?? refresh;
        return r.accessToken;
      },
    },
    retries: 0,
  });
  const api = createEndpoints(client);
  const login = async (email = MOCK_CREDENTIALS.email) => {
    const s = await api.auth.login({ identifier: email, password: MOCK_CREDENTIALS.password });
    access = s.accessToken;
    refresh = s.refreshToken ?? null;
    return s;
  };
  return { api, fetch, login, tokens: () => ({ access, refresh }), setAccess: (t: string | null) => void (access = t) };
}

describe('mock API server', () => {
  it('serves the public catalog without auth and validates against the shared schemas', async () => {
    const { api } = harness();
    const page = await api.catalog.products({ category: 'tech', sort: 'price_asc' });
    expect(page.items.map(p => p.id)).toEqual(['prod-003', 'prod-001', 'prod-002']);
    const detail = await api.catalog.product('prod-004');
    expect(ProductDetailSchema.safeParse(detail).success).toBe(true);
    expect(detail.variants).toHaveLength(2);
    expect((await api.catalog.categories()).length).toBe(6);
    expect((await api.catalog.search('serum')).items[0].id).toBe('prod-006');
  });

  it('unified search returns products, users and posts sections; live tokens need a session', async () => {
    const { api, login } = harness();
    const res = await api.search.all('serum');
    expect(res.products.items[0].id).toBe('prod-006');
    expect(res.users.items).toEqual([]);
    expect(res.posts.total).toBeGreaterThanOrEqual(0);
    const onlyUsers = await api.search.all('maya', { type: 'users' });
    expect(onlyUsers.products.items).toEqual([]);
    expect(onlyUsers.users.items.some(u => u.username.includes('maya'))).toBe(true);

    await expect(api.live.token({ room: 'live-maya', role: 'viewer' })).rejects.toMatchObject({ status: 401 });
    await login();
    const t = await api.live.token({ room: 'live-maya', role: 'viewer' });
    expect(t.room).toBe('live-maya');
    expect(t.url).toMatch(/^wss:/);
    await expect(api.live.callToken('nope')).rejects.toMatchObject({ status: 404 });
    const convo = (await api.messaging.conversations())[0];
    expect((await api.live.callToken(convo.id)).room).toBe(`call-${convo.id}`);
  });

  it('login → native refresh rotation → protected route; rejects bad credentials', async () => {
    const { api, login, tokens, setAccess } = harness();
    await expect(api.auth.login({ identifier: 'buyer@ezyify.test', password: 'nope' })).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    const s = await login();
    expect(s.refreshToken).toMatch(/^mockrt\./);
    const me = await api.users.me();
    expect(UserProfileSchema.safeParse(me).success).toBe(true);
    expect(me.username).toBe('buyer');
    // Expire the access token: the client refreshes once with the stored refresh token and retries.
    const before = tokens();
    setAccess('mock.expired');
    const again = await api.users.me();
    expect(again.id).toBe(me.id);
    expect(tokens().access).not.toBe(before.access);
    expect(tokens().refresh).not.toBe(before.refresh); // rotated
  });

  it('a refresh token outlives an in-memory reset (app restart in demo mode) but not a logout', async () => {
    const first = harness();
    const s = await first.login();
    const fresh = harness(); // brand-new state, same token string
    const r = await fresh.api.auth.refresh(s.refreshToken!);
    expect(r.accessToken).toBeTruthy();
    await expect(fresh.api.auth.refresh(s.refreshToken!)).rejects.toMatchObject({ code: 'UNAUTHORIZED' }); // rotated → old one dead
    await fresh.api.auth.logout(r.refreshToken!);
    await expect(fresh.api.auth.refresh(r.refreshToken!)).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('web clients never receive the refresh token in the body', async () => {
    const { api } = harness(false);
    const s = await api.auth.login({ identifier: MOCK_CREDENTIALS.email, password: MOCK_CREDENTIALS.password });
    expect(s.refreshToken).toBeUndefined();
  });

  it('web: the cookie jar carries the refresh token — silent refresh works, logout clears it', async () => {
    let cookie: string | null = null;
    const jar = { get: () => cookie, set: (v: string | null) => void (cookie = v) };
    const fetch = createMockFetch({ latencyMs: 0, cookieJar: jar });
    let access: string | null = null;
    const client = createApiClient({
      baseUrl: 'https://api.test/v1',
      fetch,
      tokens: {
        getAccessToken: () => access,
        setAccessToken: t => void (access = t),
        refresh: async () => {
          const res = await fetch('https://api.test/v1/auth/refresh', { method: 'POST', body: '{}' });
          if (!res.ok) return null;
          const json = (await res.json()) as { data: { accessToken: string } };
          access = json.data.accessToken;
          return access;
        },
      },
      retries: 0,
    });
    const api = createEndpoints(client);
    await expect(api.auth.refresh()).rejects.toMatchObject({ code: 'UNAUTHORIZED' }); // no cookie yet
    const s = await api.auth.login({ identifier: MOCK_CREDENTIALS.email, password: MOCK_CREDENTIALS.password });
    access = s.accessToken;
    expect(cookie).toMatch(/^mockrt\./);
    const first = cookie;
    access = 'mock.expired';
    expect((await api.users.me()).username).toBe('buyer'); // 401 → cookie refresh → retry
    expect(cookie).not.toBe(first); // rotated
    await api.auth.logout();
    expect(cookie).toBeNull();
    await expect(api.auth.refresh()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('signup requires OTP; 000000 is rejected, any other 6 digits verifies', async () => {
    const { api } = harness();
    const r = await api.auth.signup({ name: 'New Person', email: 'new@ezyify.test', password: 'Password1', acceptTerms: true });
    expect(r.requiresOTP).toBe(true);
    await expect(api.auth.verifyOtp({ userId: r.userId, otp: '000000', type: 'email' })).rejects.toMatchObject({ code: 'VALIDATION_ERROR' });
    const s = await api.auth.verifyOtp({ userId: r.userId, otp: '123456', type: 'email' });
    expect(s.user.name).toBe('New Person');
    await expect(api.auth.signup({ name: 'Dup', email: 'new@ezyify.test', password: 'Password1', acceptTerms: true })).rejects.toMatchObject({ code: 'CONFLICT' });
  });

  it('cart → checkout with wallet → escrow held → confirm delivery releases; idempotent retry', async () => {
    const { api, login } = harness();
    await login();
    await expect(api.cart.get()).resolves.toMatchObject({ items: [] });
    let cart = await api.cart.add('prod-004', 1, 'var_backpack_sand');
    cart = await api.cart.add('prod-001', 2);
    expect(cart.items).toHaveLength(2);
    expect(cart.total.amount).toBe(8999 + 2 * 7999);
    cart = await api.cart.applyCoupon('welcome10');
    expect(cart.discount.amount).toBeGreaterThan(0);
    const walletBefore = await api.wallet.get();
    const [addr] = await api.addresses.list();
    const orders = await api.orders.checkout({ addressId: addr.id, paymentMethod: 'wallet' }, 'idem-1');
    expect(orders).toHaveLength(2); // one per seller
    for (const o of orders) expect(OrderSchema.safeParse(o).success).toBe(true);
    expect(orders[0].escrow.status).toBe('held');
    const retry = await api.orders.checkout({ addressId: addr.id, paymentMethod: 'wallet' }, 'idem-1');
    expect(retry.map(o => o.id)).toEqual(orders.map(o => o.id));
    const walletAfter = await api.wallet.get();
    expect(walletBefore.balance.amount - walletAfter.balance.amount).toBe(cart.total.amount);
    expect((await api.cart.get()).items).toHaveLength(0);
    const existing = await api.orders.get('o1');
    const done = await api.orders.confirmDelivery(existing.id);
    expect(done.status).toBe('completed');
    expect(done.escrow.status).toBe('released');
    await expect(api.orders.confirmDelivery('o3')).rejects.toMatchObject({ code: 'CONFLICT' });
    const cancelled = await api.orders.cancel(orders[0].id);
    expect(cancelled.status).toBe('cancelled');
    expect((await api.wallet.get()).balance.amount).toBe(walletAfter.balance.amount + orders[0].total.amount);
  });

  it('feed, like/save toggles, comments, follow and block affect what the viewer sees', async () => {
    const { api, login } = harness();
    await login();
    const feed = await api.feed.home();
    expect(feed.items.every(p => PostSchema.safeParse(p).success)).toBe(true);
    expect(feed.items.every(p => p.kind === 'post')).toBe(true);
    const tech = await api.feed.loops({ hashtag: 'tech' });
    expect(tech.items.length).toBeGreaterThan(0);
    expect(tech.items.every(p => p.kind === 'loop' && p.hashtags.some(h => h.toLowerCase() === 'tech'))).toBe(true);
    const first = feed.items[0];
    await api.feed.like(first.id);
    await api.feed.save(first.id);
    const after = await api.feed.post(first.id);
    expect(after.engagement).toMatchObject({ isLiked: true, isSaved: true, likes: first.engagement.likes + 1 });
    expect((await api.feed.saved()).items.map(p => p.id)).toEqual([first.id]);
    await api.feed.unsave(first.id);
    expect((await api.feed.saved()).items).toHaveLength(0);
    expect((await api.catalog.products({ seller: 'techstore' })).items.every(p => p.seller.username === 'techstore')).toBe(true);
    await api.feed.unlike(first.id);
    expect((await api.feed.post(first.id)).engagement.likes).toBe(first.engagement.likes);
    const c = await api.feed.comment(first.id, 'Love this');
    expect((await api.feed.comments(first.id)).items[0].id).toBe(c.id);
    const maya = await api.users.profile('fashionista_maya');
    expect(maya.isFollowing).toBe(true); // seeded follow
    await api.users.unfollow('fashionista_maya');
    expect((await api.users.profile('fashionista_maya')).isFollowing).toBe(false);
    await api.moderation.block(maya.id);
    expect((await api.feed.home()).items.some(p => p.author.id === maya.id)).toBe(false);
    expect((await api.moderation.blocked()).map(u => u.id)).toEqual([maya.id]);
    await api.moderation.unblock(maya.id);
    expect((await api.feed.home()).items.some(p => p.author.id === maya.id)).toBe(true);
    expect((await api.feed.stories()).length).toBeGreaterThan(0);
  });

  it('messaging, notifications, uploads, create post, profile update', async () => {
    const { api, login, fetch } = harness();
    await login();
    const convos = await api.messaging.conversations();
    expect(convos[0].unreadCount).toBe(2);
    const msgs = await api.messaging.messages(convos[0].id);
    expect(msgs.items.length).toBe(5);
    expect((await api.messaging.conversations())[0].unreadCount).toBe(0);
    const sent = await api.messaging.send(convos[0].id, 'hello');
    expect(sent.senderId).toBe('u_buyer');
    const started = await api.messaging.start('fitwithdan');
    expect((await api.messaging.conversations()).some(c => c.id === started.id)).toBe(true);
    expect((await api.notifications.unreadCount()).count).toBe(2);
    await api.notifications.markAllRead();
    expect((await api.notifications.unreadCount()).count).toBe(0);
    const signed = await api.uploads.sign({ contentType: 'image/jpeg', sizeBytes: 1000, purpose: 'post' });
    // The signed PUT goes through the same mock fetch so demo builds can upload without a bucket.
    const put = await fetch(signed.url, { method: signed.method, headers: signed.headers, body: new Uint8Array(1000) });
    expect(put.ok).toBe(true);
    const fin = await api.uploads.finalize(signed.key);
    expect(fin.kind).toBe('image');
    const post = await api.feed.create({ caption: 'hi', media: [{ type: 'image', url: fin.url, thumbnailUrl: null, width: null, height: null, durationMs: null }] });
    expect((await api.feed.home()).items[0].id).toBe(post.id);
    expect((await api.feed.comments(post.id)).items).toHaveLength(0);
    await api.feed.remove(post.id);
    await expect(api.feed.post(post.id)).rejects.toMatchObject({ code: 'NOT_FOUND' });
    const me = await api.users.updateMe({ name: 'Renamed', bio: 'hey' });
    expect(me.name).toBe('Renamed');
    await expect(api.users.updateMe({ username: 'fashionista_maya' })).rejects.toMatchObject({ code: 'CONFLICT' });
    expect((await api.auth.sessions()).length).toBeGreaterThan(0);
    await api.auth.logoutAll();
    await expect(api.users.me()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
  });

  it('protected routes return UNAUTHORIZED for guests and NOT_FOUND for unknown routes', async () => {
    const { api, fetch } = harness();
    await expect(api.cart.get()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    const r = await fetch('https://api.test/v1/nope');
    expect(r.status).toBe(404);
  });

  it('persists a snapshot after mutations and restores it (cart survives a reload in demo mode)', async () => {
    let saved: string | null = null;
    const persist = { load: () => saved, save: (v: string) => void (saved = v) };
    const first = createMockFetch({ latencyMs: 0, persist });
    const login = async (fetch: typeof first) => {
      let access: string | null = null;
      const client = createApiClient({ baseUrl: 'https://api.test/v1', fetch, headers: { 'X-Client': 'native' }, tokens: { getAccessToken: () => access, setAccessToken: t => void (access = t), refresh: async () => null }, retries: 0 });
      const api = createEndpoints(client);
      const s = await api.auth.login({ identifier: MOCK_CREDENTIALS.email, password: MOCK_CREDENTIALS.password });
      access = s.accessToken;
      return api;
    };
    const api = await login(first);
    await api.cart.add('prod-003', 2);
    expect(saved).toBeTruthy();
    const second = createMockFetch({ latencyMs: 0, persist });
    const api2 = await login(second);
    expect((await api2.cart.get()).items.map(i => [i.productId, i.quantity])).toEqual([['prod-003', 2]]);
  });
});
