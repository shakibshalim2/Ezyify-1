// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createRoot, type Root } from 'react-dom/client';
import { act, createElement, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EzyifyContext } from './index.js';
import * as Q from './queries.js';
import {
  flattenPages,
  queryKeys,
  useAddToCart,
  useFeed,
  useMe,
  useProducts,
  useServerCart,
  useToggleFollow,
  useToggleLike,
  useUnifiedSearch,
  useUnreadCount,
} from './queries.js';
import { createAuthStore } from '../stores/auth.js';
import { createCartStore } from '../stores/cart.js';
import { memoryStorage } from '../stores/storage.js';
import type { Endpoints } from '../api/endpoints.js';
import type { Post, UserProfile } from '../schemas/index.js';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const user = { id: 'u1', username: 'maya', name: 'Maya', avatarUrl: null, verified: true, role: 'creator' as const };
const post = (id: string, likes = 10): Post => ({
  id,
  kind: 'post',
  author: user,
  caption: 'c',
  hashtags: [],
  media: [{ type: 'image', url: 'https://img.test/a.jpg', thumbnailUrl: null, width: null, height: null, durationMs: null }],
  taggedProductIds: [],
  engagement: { likes, comments: 0, shares: 0, saves: 0, isLiked: false, isSaved: false },
  location: null,
  createdAt: new Date().toISOString(),
});
const page = <T,>(items: T[], pageNo = 1, hasMore = false) => ({ items, pagination: { page: pageNo, pageSize: 20, total: items.length, hasMore } });
const profile: UserProfile = { ...user, bio: null, coverUrl: null, website: null, location: null, followers: 5, following: 1, posts: 2, isFollowing: false, createdAt: new Date().toISOString() };

function fakeApi() {
  const api = {
    catalog: { products: vi.fn(async (q: { page?: number }) => page([{ id: `p${q.page ?? 1}` }], q.page ?? 1, (q.page ?? 1) < 2)) },
    feed: {
      home: vi.fn(async () => page([post('a'), post('b')])),
      like: vi.fn(async () => null),
      unlike: vi.fn(async () => null),
    },
    users: { me: vi.fn(async () => profile), follow: vi.fn(async () => null), unfollow: vi.fn(async () => null) },
    cart: { get: vi.fn(async () => cart(0)), add: vi.fn(async () => cart(2)) },
    notifications: { unreadCount: vi.fn(async () => ({ count: 4 })) },
    search: { all: vi.fn(async () => ({ products: { items: [], nextCursor: null, total: 0 }, users: { items: [user], nextCursor: null, total: 1 }, posts: { items: [], nextCursor: null, total: 0 } })) },
  };
  return api as unknown as Endpoints & typeof api;
}
const cart = (qty: number) => ({ items: qty ? [{ productId: 'p1', variantId: null, quantity: qty, product: { id: 'p1', slug: 'p1', name: 'P', imageUrl: 'https://img.test/a.jpg', price: { amount: 100, currency: 'USD' as const }, compareAtPrice: null, rating: 5, reviewCount: 1, seller: { id: 's', username: 's', name: 'S', verified: true }, badge: null, inStock: true } }] : [], subtotal: { amount: 100 * qty, currency: 'USD' as const }, shipping: { amount: 0, currency: 'USD' as const }, discount: { amount: 0, currency: 'USD' as const }, total: { amount: 100 * qty, currency: 'USD' as const }, couponCode: null });

let root: Root;
let el: HTMLDivElement;
let qc: QueryClient;

function mount(node: ReactNode, api: Endpoints, authed = false) {
  const auth = createAuthStore(memoryStorage());
  if (authed) auth.getState().setSession({ accessToken: 't', expiresIn: 900, user });
  const cartStore = createCartStore(memoryStorage());
  act(() => {
    root.render(
      createElement(EzyifyContext.Provider, { value: { api, auth, cart: cartStore } }, createElement(QueryClientProvider, { client: qc }, node)),
    );
  });
  return { auth };
}
// react-query resolves in microtasks and notifies subscribers on a later macrotask, so drain a few ticks.
const flush = async (ticks = 4) => {
  for (let i = 0; i < ticks; i++) await act(() => new Promise(r => setTimeout(r, 0)));
};

beforeEach(() => {
  el = document.createElement('div');
  root = createRoot(el);
  qc = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } });
});

describe('query hooks', () => {
  it('useUnifiedSearch calls the sectioned search endpoint only for a non-empty query', async () => {
    const api = fakeApi();
    function Probe() {
      const search = useUnifiedSearch('sara', 'users');
      return createElement('span', null, search.data?.users.items[0]?.username ?? '');
    }
    mount(createElement(Probe), api);
    await flush();
    expect(el.textContent).toBe('maya');
    expect(api.search.all).toHaveBeenCalledWith('sara', { type: 'users' });
  });

  it('useProducts pages through the API and flattens items', async () => {
    const api = fakeApi();
    let hook: ReturnType<typeof useProducts> | undefined;
    function Probe() {
      hook = useProducts({ category: 'tech' });
      return createElement('span', null, flattenPages(hook.data).map(p => p.id).join(','));
    }
    mount(createElement(Probe), api);
    await flush();
    expect(el.textContent).toBe('p1');
    expect(api.catalog.products).toHaveBeenCalledWith({ category: 'tech', page: 1 });
    expect(hook!.hasNextPage).toBe(true);
    await act(async () => {
      await hook!.fetchNextPage();
    });
    await flush();
    expect(el.textContent).toBe('p1,p2');
    expect(hook!.hasNextPage).toBe(false);
  });

  it('useToggleLike patches cached feed pages optimistically and rolls back on error', async () => {
    const api = fakeApi();
    let reject!: (e: Error) => void;
    api.feed.like.mockImplementationOnce(() => new Promise<null>((_r, rej) => (reject = rej)));
    let like: ReturnType<typeof useToggleLike> | undefined;
    function Probe() {
      const feed = useFeed();
      like = useToggleLike();
      return createElement('span', null, flattenPages(feed.data).map(p => `${p.id}:${p.engagement.likes}:${p.engagement.isLiked}`).join(' '));
    }
    mount(createElement(Probe), api);
    await flush();
    expect(el.textContent).toBe('a:10:false b:10:false');
    act(() => like!.mutate({ id: 'a', liked: false }));
    await flush();
    expect(el.textContent).toBe('a:11:true b:10:false'); // optimistic while the request is in flight
    act(() => reject(new Error('boom')));
    await flush();
    expect(el.textContent).toBe('a:10:false b:10:false'); // rolled back
    act(() => like!.mutate({ id: 'b', liked: false }));
    await flush();
    expect(el.textContent).toBe('a:10:false b:11:true');
    expect(api.feed.like).toHaveBeenCalledTimes(2);
  });

  it('authenticated-only queries stay idle for guests and run once signed in', async () => {
    const api = fakeApi();
    function Probe() {
      const me = useMe();
      const cart = useServerCart();
      const unread = useUnreadCount();
      return createElement('span', null, `${me.fetchStatus}/${cart.fetchStatus}/${unread.data ?? '-'}`);
    }
    const { auth } = mount(createElement(Probe), api);
    await flush();
    expect(api.users.me).not.toHaveBeenCalled();
    expect(api.cart.get).not.toHaveBeenCalled();
    act(() => auth.getState().setSession({ accessToken: 't', expiresIn: 900, user }));
    await flush();
    expect(api.users.me).toHaveBeenCalledTimes(1);
    expect(api.cart.get).toHaveBeenCalledTimes(1);
    expect(el.textContent).toBe('idle/idle/4');
  });

  it('cart mutations replace the cached cart with the server response', async () => {
    const api = fakeApi();
    let add: ReturnType<typeof useAddToCart> | undefined;
    function Probe() {
      const cart = useServerCart();
      add = useAddToCart();
      return createElement('span', null, String(cart.data?.items.reduce((n, l) => n + l.quantity, 0) ?? '-'));
    }
    mount(createElement(Probe), api, true);
    await flush();
    expect(el.textContent).toBe('0');
    await act(async () => {
      await add!.mutateAsync({ productId: 'p1', quantity: 2 });
    });
    await flush();
    expect(api.cart.add).toHaveBeenCalledWith('p1', 2, undefined);
    expect(el.textContent).toBe('2');
  });

  it('useToggleFollow updates the cached profile immediately', async () => {
    const api = fakeApi();
    qc.setQueryData(queryKeys.profile('maya'), profile);
    let follow: ReturnType<typeof useToggleFollow> | undefined;
    function Probe() {
      follow = useToggleFollow();
      return null;
    }
    mount(createElement(Probe), api, true);
    act(() => follow!.mutate({ username: 'maya', following: false }));
    const cached = qc.getQueryData<UserProfile>(queryKeys.profile('maya'));
    expect(cached).toMatchObject({ isFollowing: true, followers: 6 });
    await flush();
    expect(api.users.follow).toHaveBeenCalledWith('maya');
  });

  it('every read hook calls exactly its endpoint once when enabled; every mutation hook invalidates without throwing', async () => {
    const ok = vi.fn(async () => null);
    const pageOf = vi.fn(async () => page([]));
    const listOf = vi.fn(async () => []);
    const api = {
      catalog: { products: pageOf, product: vi.fn(async () => ({})), categories: listOf, search: pageOf },
      feed: { home: pageOf, loops: pageOf, stories: listOf, post: vi.fn(async () => post('a')), comments: pageOf, comment: vi.fn(async () => ({})), create: vi.fn(async () => post('n')), like: ok, unlike: ok, save: ok, unsave: ok },
      users: { me: vi.fn(async () => profile), profile: vi.fn(async () => profile), followers: listOf, following: listOf, follow: ok, unfollow: ok, updateMe: vi.fn(async () => ({ ...profile, name: 'New' })) },
      moderation: { block: ok, unblock: ok, blocked: listOf },
      cart: { get: vi.fn(async () => cart(0)), add: vi.fn(async () => cart(1)), update: vi.fn(async () => cart(2)), remove: vi.fn(async () => cart(0)), applyCoupon: vi.fn(async () => cart(0)) },
      addresses: { list: listOf, create: vi.fn(async () => ({ id: 'a1' })) },
      orders: { checkout: vi.fn(async () => []), list: pageOf, get: vi.fn(async () => ({ id: 'o1' })), timeline: listOf, confirmDelivery: vi.fn(async () => ({ id: 'o1' })), cancel: vi.fn(async () => ({ id: 'o1' })), requestRefund: vi.fn(async () => ({ id: 'o1' })) },
      wallet: { get: vi.fn(async () => ({})), transactions: pageOf },
      messaging: { conversations: listOf, messages: pageOf, send: vi.fn(async () => ({})), start: vi.fn(async () => ({ id: 'c9' })) },
      notifications: { list: pageOf, unreadCount: vi.fn(async () => ({ count: 0 })), markRead: ok, markAllRead: ok },
    } as unknown as Endpoints;

    const mutations: Record<string, () => void> = {};
    function Probe() {
      Q.useProducts(); Q.useProduct('p1'); Q.useCategories(); Q.useSearch('shoes');
      Q.useFeed(); Q.useLoops(); Q.useStories(); Q.usePost('a'); Q.useComments('a');
      Q.useMe(); Q.useProfile('maya'); Q.useFollowers('maya', 'followers'); Q.useFollowers('maya', 'following'); Q.useBlockedUsers();
      Q.useServerCart(); Q.useAddresses(); Q.useOrders(); Q.useOrder('o1'); Q.useOrderTimeline('o1'); Q.useWallet(); Q.useTransactions();
      Q.useConversations(); Q.useMessages('c1'); Q.useNotifications(); Q.useUnreadCount();
      const save = Q.useToggleSave(); const comment = Q.useAddComment('a'); const create = Q.useCreatePost(); const update = Q.useUpdateProfile();
      const block = Q.useBlockUser(); const upd = Q.useUpdateCartItem(); const rm = Q.useRemoveCartItem(); const coupon = Q.useApplyCoupon();
      const addr = Q.useCreateAddress(); const checkout = Q.useCheckout(); const action = Q.useOrderAction(); const send = Q.useSendMessage('c1');
      const start = Q.useStartConversation(); const read = Q.useMarkNotificationsRead();
      Object.assign(mutations, {
        save: () => save.mutate({ id: 'a', saved: false }),
        comment: () => comment.mutate('hi'),
        create: () => create.mutate({ media: post('n').media }),
        update: () => update.mutate({ name: 'New' }),
        block: () => block.mutate({ userId: 'u2', blocked: false }),
        upd: () => upd.mutate({ productId: 'p1', quantity: 2 }),
        rm: () => rm.mutate({ productId: 'p1' }),
        coupon: () => coupon.mutate({ code: 'X' }),
        addr: () => addr.mutate({ label: 'H', recipient: 'A', phone: '0812345', line1: 'L', city: 'C', postal: '12345', country: 'ID' }),
        checkout: () => checkout.mutate({ body: { addressId: 'a1', paymentMethod: 'wallet' }, idempotencyKey: 'k' }),
        confirm: () => action.mutate({ id: 'o1', action: 'confirm' }),
        cancel: () => action.mutate({ id: 'o1', action: 'cancel' }),
        refund: () => action.mutate({ id: 'o1', action: 'refund', reason: 'r', itemIds: ['i'] }),
        send: () => send.mutate('hi'),
        start: () => start.mutate('maya'),
        readOne: () => read.mutate('n1'),
        readAll: () => read.mutate(undefined),
      });
      return null;
    }
    const { auth } = mount(createElement(Probe), api, true);
    await flush();
    for (const fn of [api.catalog.products, api.catalog.product, api.catalog.categories, api.catalog.search, api.feed.home, api.feed.loops, api.feed.stories, api.feed.post, api.feed.comments, api.users.me, api.users.profile, api.moderation.blocked, api.cart.get, api.addresses.list, api.orders.list, api.orders.get, api.orders.timeline, api.wallet.get, api.wallet.transactions, api.messaging.conversations, api.messaging.messages, api.notifications.list, api.notifications.unreadCount]) {
      expect(fn).toHaveBeenCalled();
    }
    expect(api.users.followers).toHaveBeenCalledWith('maya');
    expect(api.users.following).toHaveBeenCalledWith('maya');
    for (const run of Object.values(mutations)) {
      act(run);
      await flush();
    }
    expect(api.feed.save).toHaveBeenCalledWith('a');
    expect(api.feed.comment).toHaveBeenCalledWith('a', 'hi');
    expect(api.users.updateMe).toHaveBeenCalledWith({ name: 'New' });
    expect(auth.getState().user?.name).toBe('New');
    expect(api.moderation.block).toHaveBeenCalledWith('u2');
    expect(api.cart.update).toHaveBeenCalledWith('p1', 2);
    expect(api.cart.remove).toHaveBeenCalledWith('p1');
    expect(api.cart.applyCoupon).toHaveBeenCalledWith('X');
    expect(api.orders.checkout).toHaveBeenCalledWith({ addressId: 'a1', paymentMethod: 'wallet' }, 'k');
    expect(api.orders.confirmDelivery).toHaveBeenCalledWith('o1');
    expect(api.orders.cancel).toHaveBeenCalledWith('o1');
    expect(api.orders.requestRefund).toHaveBeenCalledWith('o1', 'r', ['i']);
    expect(api.messaging.send).toHaveBeenCalledWith('c1', 'hi');
    expect(api.messaging.start).toHaveBeenCalledWith('maya');
    expect(api.notifications.markRead).toHaveBeenCalledWith('n1');
    expect(api.notifications.markAllRead).toHaveBeenCalled();
  });
});
