import { keepPreviousData, useInfiniteQuery, useMutation, useQuery, useQueryClient, type UseQueryOptions } from '@tanstack/react-query';
import type { z } from 'zod';
import type { FeedQuery, ProductQuery, SellerProductQuery } from '../api/endpoints.js';
import type { ShipOrderRequest } from '../schemas/index.js';
import type { SearchType } from '../schemas/index.js';
import type { paginated } from '../schemas/common.js';
import type { Cart, CheckoutRequest, CreateAddressRequest, CreatePostRequest, Post, UpdateProfileRequest, UserProfile } from '../schemas/index.js';
import { useApi, useAuth } from './index.js';

type Page<T> = z.infer<ReturnType<typeof paginated<z.ZodType<T>>>>;
type PageQuery = { page?: number; pageSize?: number };

export const queryKeys = {
  me: ['me'] as const,
  profile: (username: string) => ['profile', username] as const,
  followers: (username: string) => ['profile', username, 'followers'] as const,
  following: (username: string) => ['profile', username, 'following'] as const,
  products: (params: Record<string, unknown> = {}) => ['products', params] as const,
  product: (id: string) => ['product', id] as const,
  categories: ['categories'] as const,
  sellerProducts: (params: Record<string, unknown> = {}) => ['seller', 'products', params] as const,
  sellerDashboard: (params: Record<string, unknown> = {}) => ['seller', 'dashboard', params] as const,
  sellerAnalytics: (params: Record<string, unknown> = {}) => ['seller', 'analytics', params] as const,
  sellerCustomers: (params: Record<string, unknown> = {}) => ['seller', 'customers', params] as const,
  search: (q: string) => ['search', q] as const,
  unifiedSearch: (q: string, type: SearchType = 'all') => ['search', 'all', q, type] as const,
  cart: ['cart'] as const,
  orders: (params: Record<string, unknown> = {}) => ['orders', params] as const,
  sellerOrders: (params: Record<string, unknown> = {}) => ['orders', 'seller', params] as const,
  sellerOrdersSummary: ['orders', 'seller', 'summary'] as const,
  order: (id: string) => ['order', id] as const,
  orderTimeline: (id: string) => ['order', id, 'timeline'] as const,
  addresses: ['addresses'] as const,
  wallet: ['wallet'] as const,
  transactions: ['wallet', 'transactions'] as const,
  feed: (params: Record<string, unknown> = {}) => ['feed', params] as const,
  loops: (params: Record<string, unknown> = {}) => ['loops', params] as const,
  stories: ['stories'] as const,
  saved: ['posts', 'saved'] as const,
  post: (id: string) => ['post', id] as const,
  comments: (id: string) => ['post', id, 'comments'] as const,
  conversations: ['conversations'] as const,
  messages: (id: string) => ['conversations', id, 'messages'] as const,
  notifications: ['notifications'] as const,
  unreadCount: ['notifications', 'unread'] as const,
  blocked: ['blocked'] as const,
  sessions: ['auth', 'sessions'] as const,
  mfa: ['auth', 'mfa'] as const,
};

/** Shared cursor for every paginated endpoint: page numbers, `hasMore` from the envelope. */
const nextPage = <T>(last: Page<T>) => (last.pagination.hasMore ? last.pagination.page + 1 : undefined);
export const flattenPages = <T>(data: { pages: Page<T>[] } | undefined): T[] => data?.pages.flatMap(p => p.items) ?? [];

const useAuthed = () => useAuth(s => s.status === 'authenticated');

// ---------- Catalog ----------

export function useProducts(query: ProductQuery = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.products(query),
    queryFn: ({ pageParam }) => api.catalog.products({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

export function useProduct(id: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.product(id ?? ''), queryFn: () => api.catalog.product(id!), enabled: !!id });
}

export function useCategories() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.categories, queryFn: () => api.catalog.categories(), staleTime: 5 * 60_000 });
}

export function useSearch(q: string, query: PageQuery = {}) {
  const api = useApi();
  return useQuery({ queryKey: [...queryKeys.search(q), query], queryFn: () => api.catalog.search(q, query), enabled: q.trim().length > 0 });
}

/** Searches all discoverable entities through the sectioned search endpoint. */
export function useUnifiedSearch(q: string, type: SearchType = 'all') {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.unifiedSearch(q, type), queryFn: () => api.search.all(q, { type }), enabled: q.trim().length > 0 });
}

/** Seller hub inventory (role seller/admin); keeps previous page while filters change so counts don't flicker. */
export function useSellerProducts(query: SellerProductQuery = {}) {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.sellerProducts(query), queryFn: () => api.seller.products(query), enabled: authed, placeholderData: keepPreviousData });
}

export function useSellerDashboard(query: { days?: number } = {}) {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.sellerDashboard(query), queryFn: () => api.seller.dashboard(query), enabled: authed, placeholderData: keepPreviousData, staleTime: 60_000 });
}

export function useSellerAnalytics(query: { days?: number } = {}) {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.sellerAnalytics(query), queryFn: () => api.seller.analytics(query), enabled: authed, placeholderData: keepPreviousData, staleTime: 60_000 });
}

export function useSellerCustomers(query: PageQuery & { q?: string; sort?: 'recent' | 'spent' | 'orders' } = {}) {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.sellerCustomers(query), queryFn: () => api.seller.customers(query), enabled: authed, placeholderData: keepPreviousData });
}

// ---------- Social ----------

export function useFeed(query: FeedQuery = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.feed(query),
    queryFn: ({ pageParam }) => api.feed.home({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

export function useLoops(query: FeedQuery = {}) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.loops(query),
    queryFn: ({ pageParam }) => api.feed.loops({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
  });
}

export function useStories() {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.stories, queryFn: () => api.feed.stories() });
}

export function useSavedPosts() {
  const api = useApi();
  const authed = useAuthed();
  return useInfiniteQuery({
    queryKey: queryKeys.saved,
    queryFn: ({ pageParam }) => api.feed.saved({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: authed,
  });
}

export function usePost(id: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.post(id ?? ''), queryFn: () => api.feed.post(id!), enabled: !!id });
}

export function useComments(postId: string | undefined) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.comments(postId ?? ''),
    queryFn: ({ pageParam }) => api.feed.comments(postId!, { page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: !!postId,
  });
}

/** Patch a post everywhere it is cached (feed/loops pages, detail) without refetching. */
function patchPost(qc: ReturnType<typeof useQueryClient>, id: string, patch: (p: Post) => Post) {
  qc.setQueriesData<{ pages: Page<Post>[] }>({ queryKey: ['feed'] }, old => old && { ...old, pages: old.pages.map(pg => ({ ...pg, items: pg.items.map(p => (p.id === id ? patch(p) : p)) })) });
  qc.setQueriesData<{ pages: Page<Post>[] }>({ queryKey: ['loops'] }, old => old && { ...old, pages: old.pages.map(pg => ({ ...pg, items: pg.items.map(p => (p.id === id ? patch(p) : p)) })) });
  qc.setQueryData<Post>(queryKeys.post(id), old => old && patch(old));
  qc.setQueryData<Post[]>(queryKeys.stories, old => old && old.map(p => (p.id === id ? patch(p) : p)));
  qc.setQueriesData<{ pages: Page<Post>[] }>({ queryKey: queryKeys.saved }, old => old && { ...old, pages: old.pages.map(pg => ({ ...pg, items: pg.items.map(p => (p.id === id ? patch(p) : p)) })) });
}

export function useToggleLike() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, liked }: { id: string; liked: boolean }) => (liked ? api.feed.unlike(id) : api.feed.like(id)),
    onMutate: ({ id, liked }) =>
      patchPost(qc, id, p => ({ ...p, engagement: { ...p.engagement, isLiked: !liked, likes: Math.max(0, p.engagement.likes + (liked ? -1 : 1)) } })),
    onError: (_e, { id, liked }) =>
      patchPost(qc, id, p => ({ ...p, engagement: { ...p.engagement, isLiked: liked, likes: Math.max(0, p.engagement.likes + (liked ? 1 : -1)) } })),
  });
}

export function useToggleSave() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, saved }: { id: string; saved: boolean }) => (saved ? api.feed.unsave(id) : api.feed.save(id)),
    onMutate: ({ id, saved }) => patchPost(qc, id, p => ({ ...p, engagement: { ...p.engagement, isSaved: !saved, saves: Math.max(0, p.engagement.saves + (saved ? -1 : 1)) } })),
    onError: (_e, { id, saved }) => patchPost(qc, id, p => ({ ...p, engagement: { ...p.engagement, isSaved: saved, saves: Math.max(0, p.engagement.saves + (saved ? 1 : -1)) } })),
    onSettled: () => qc.invalidateQueries({ queryKey: queryKeys.saved }),
  });
}

export function useAddComment(postId: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => api.feed.comment(postId, text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.comments(postId) });
      patchPost(qc, postId, p => ({ ...p, engagement: { ...p.engagement, comments: p.engagement.comments + 1 } }));
    },
  });
}

export function useCreatePost() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePostRequest) => api.feed.create(body),
    onSuccess: post => {
      qc.invalidateQueries({ queryKey: ['feed'] });
      if (post.kind === 'loop') qc.invalidateQueries({ queryKey: ['loops'] });
      if (post.kind === 'story') qc.invalidateQueries({ queryKey: queryKeys.stories });
      qc.invalidateQueries({ queryKey: queryKeys.me });
    },
  });
}

// ---------- Users ----------

export function useMe(options: Pick<UseQueryOptions<UserProfile>, 'staleTime'> = {}) {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.me, queryFn: () => api.users.me(), enabled: authed, ...options });
}

export function useProfile(username: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.profile(username ?? ''), queryFn: () => api.users.profile(username!), enabled: !!username });
}

export function useFollowers(username: string | undefined, kind: 'followers' | 'following') {
  const api = useApi();
  return useQuery({
    queryKey: kind === 'followers' ? queryKeys.followers(username ?? '') : queryKeys.following(username ?? ''),
    queryFn: () => (kind === 'followers' ? api.users.followers(username!) : api.users.following(username!)),
    enabled: !!username,
  });
}

export function useToggleFollow() {
  const api = useApi();
  const qc = useQueryClient();
  const me = useAuth(s => s.user);
  return useMutation({
    mutationFn: ({ username, following }: { username: string; following: boolean }) => (following ? api.users.unfollow(username) : api.users.follow(username)),
    onMutate: ({ username, following }) =>
      qc.setQueryData<UserProfile>(queryKeys.profile(username), old => old && { ...old, isFollowing: !following, followers: Math.max(0, old.followers + (following ? -1 : 1)) }),
    onSettled: (_d, _e, { username }) => {
      qc.invalidateQueries({ queryKey: queryKeys.profile(username) });
      qc.invalidateQueries({ queryKey: queryKeys.me });
      qc.invalidateQueries({ queryKey: queryKeys.stories });
      if (me) qc.invalidateQueries({ queryKey: queryKeys.following(me.username) });
    },
  });
}

export function useUpdateProfile() {
  const api = useApi();
  const qc = useQueryClient();
  const updateUser = useAuth(s => s.updateUser);
  return useMutation({
    mutationFn: (body: UpdateProfileRequest) => api.users.updateMe(body),
    onSuccess: profile => {
      qc.setQueryData(queryKeys.me, profile);
      updateUser({ name: profile.name, username: profile.username, avatarUrl: profile.avatarUrl });
    },
  });
}

export function useBlockUser() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ userId, blocked }: { userId: string; blocked: boolean }) => (blocked ? api.moderation.unblock(userId) : api.moderation.block(userId)),
    onSettled: () => {
      qc.invalidateQueries({ queryKey: queryKeys.blocked });
      qc.invalidateQueries({ queryKey: ['feed'] });
      qc.invalidateQueries({ queryKey: ['loops'] });
      qc.invalidateQueries({ queryKey: queryKeys.stories });
    },
  });
}

export function useBlockedUsers() {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.blocked, queryFn: () => api.moderation.blocked(), enabled: authed });
}

// ---------- Commerce ----------

export function useServerCart() {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.cart, queryFn: () => api.cart.get(), enabled: authed });
}

function useCartMutation<TVars>(fn: (api: ReturnType<typeof useApi>, vars: TVars) => Promise<Cart>) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: TVars) => fn(api, vars),
    onSuccess: cart => qc.setQueryData(queryKeys.cart, cart),
  });
}
export const useAddToCart = () => useCartMutation<{ productId: string; quantity?: number; variantId?: string | null }>((api, v) => api.cart.add(v.productId, v.quantity ?? 1, v.variantId));
export const useUpdateCartItem = () => useCartMutation<{ productId: string; quantity: number }>((api, v) => api.cart.update(v.productId, v.quantity));
export const useRemoveCartItem = () => useCartMutation<{ productId: string }>((api, v) => api.cart.remove(v.productId));
export const useApplyCoupon = () => useCartMutation<{ code: string }>((api, v) => api.cart.applyCoupon(v.code));

export function useAddresses() {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.addresses, queryFn: () => api.addresses.list(), enabled: authed });
}

export function useCreateAddress() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({ mutationFn: (body: CreateAddressRequest) => api.addresses.create(body), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.addresses }) });
}

export function useCheckout() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ body, idempotencyKey }: { body: CheckoutRequest; idempotencyKey?: string }) => api.orders.checkout(body, idempotencyKey),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.cart });
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: queryKeys.wallet });
      qc.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });
}

export function useOrders(query: PageQuery & { status?: string } = {}) {
  const api = useApi();
  const authed = useAuthed();
  return useInfiniteQuery({
    queryKey: queryKeys.orders(query),
    queryFn: ({ pageParam }) => api.orders.list({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: authed,
  });
}

export function useOrder(id: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.order(id ?? ''), queryFn: () => api.orders.get(id!), enabled: !!id });
}

export function useOrderTimeline(id: string | undefined) {
  const api = useApi();
  return useQuery({ queryKey: queryKeys.orderTimeline(id ?? ''), queryFn: () => api.orders.timeline(id!), enabled: !!id });
}

export function useOrderAction() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: string; action: 'confirm' | 'cancel' } | { id: string; action: 'refund'; reason: string; itemIds: string[] }) => {
      if (v.action === 'refund') return api.orders.requestRefund(v.id, v.reason, v.itemIds);
      return v.action === 'confirm' ? api.orders.confirmDelivery(v.id) : api.orders.cancel(v.id);
    },
    onSuccess: order => {
      qc.setQueryData(queryKeys.order(order.id), order);
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: queryKeys.orderTimeline(order.id) });
      qc.invalidateQueries({ queryKey: queryKeys.wallet });
    },
  });
}

/** Seller hub orders (role seller); the buyer list uses `useOrders`. */
export function useSellerOrders(query: PageQuery & { status?: string } = {}) {
  const api = useApi();
  const authed = useAuthed();
  return useInfiniteQuery({
    queryKey: queryKeys.sellerOrders(query),
    queryFn: ({ pageParam }) => api.sellerOrders.list({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: authed,
  });
}

export function useSellerOrdersSummary() {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.sellerOrdersSummary, queryFn: () => api.sellerOrders.summary(), enabled: authed, placeholderData: keepPreviousData });
}

export type SellerOrderAction =
  | { id: string; action: 'accept' | 'deliver' | 'approveRefund' | 'cancel' }
  | { id: string; action: 'ship'; body: ShipOrderRequest };

export function useSellerOrderAction() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (v: SellerOrderAction) => {
      switch (v.action) {
        case 'accept': return api.sellerOrders.accept(v.id);
        case 'ship': return api.sellerOrders.ship(v.id, v.body);
        case 'deliver': return api.sellerOrders.deliver(v.id);
        case 'approveRefund': return api.sellerOrders.approveRefund(v.id);
        case 'cancel': return api.sellerOrders.cancel(v.id);
      }
    },
    onSuccess: order => {
      qc.setQueryData(queryKeys.order(order.id), order);
      qc.invalidateQueries({ queryKey: ['orders'] });
      qc.invalidateQueries({ queryKey: queryKeys.orderTimeline(order.id) });
      qc.invalidateQueries({ queryKey: queryKeys.wallet });
      qc.invalidateQueries({ queryKey: ['seller'] });
    },
  });
}

export function useWallet() {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.wallet, queryFn: () => api.wallet.get(), enabled: authed });
}

function useWalletMutation<TVars>(fn: (api: ReturnType<typeof useApi>, vars: TVars) => Promise<unknown>) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: TVars) => fn(api, vars),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.wallet });
      qc.invalidateQueries({ queryKey: queryKeys.transactions });
    },
  });
}
/** Amounts are minor units (cents). */
export const useTopUp = () => useWalletMutation<{ amount: number; method: 'card' | 'bank_transfer' }>((api, v) => api.wallet.topup(v.amount, v.method));
export const useWithdraw = () => useWalletMutation<{ amount: number; payoutMethodId: string }>((api, v) => api.wallet.withdraw(v.amount, v.payoutMethodId));

export function useTransactions() {
  const api = useApi();
  const authed = useAuthed();
  return useInfiniteQuery({
    queryKey: queryKeys.transactions,
    queryFn: ({ pageParam }) => api.wallet.transactions({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: authed,
  });
}

// ---------- Messaging & notifications ----------

export function useConversations() {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.conversations, queryFn: () => api.messaging.conversations(), enabled: authed, refetchInterval: 15_000 });
}

export function useMessages(conversationId: string | undefined) {
  const api = useApi();
  return useInfiniteQuery({
    queryKey: queryKeys.messages(conversationId ?? ''),
    queryFn: ({ pageParam }) => api.messaging.messages(conversationId!, { page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: !!conversationId,
    refetchInterval: 5_000,
  });
}

export function useSendMessage(conversationId: string) {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Parameters<ReturnType<typeof useApi>['messaging']['send']>[1]) => api.messaging.send(conversationId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.messages(conversationId) });
      qc.invalidateQueries({ queryKey: queryKeys.conversations });
    },
  });
}

export function useStartConversation() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({ mutationFn: (username: string) => api.messaging.start(username), onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.conversations }) });
}

export function useNotifications() {
  const api = useApi();
  const authed = useAuthed();
  return useInfiniteQuery({
    queryKey: queryKeys.notifications,
    queryFn: ({ pageParam }) => api.notifications.list({ page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: nextPage,
    enabled: authed,
  });
}

export function useUnreadCount() {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.unreadCount, queryFn: () => api.notifications.unreadCount(), enabled: authed, refetchInterval: 30_000, select: d => d.count });
}

export function useMarkNotificationsRead() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id?: string) => (id ? api.notifications.markRead(id) : api.notifications.markAllRead()),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.notifications });
      qc.invalidateQueries({ queryKey: queryKeys.unreadCount });
    },
  });
}

// ---------- Account security ----------

export function useSessions() {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.sessions, queryFn: () => api.auth.sessions(), enabled: authed });
}

export function useRevokeSession() {
  const api = useApi();
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id?: string) => (id ? api.auth.revokeSession(id) : api.auth.logoutAll()),
    onSuccess: () => qc.invalidateQueries({ queryKey: queryKeys.sessions }),
  });
}

export function useMfaStatus() {
  const api = useApi();
  const authed = useAuthed();
  return useQuery({ queryKey: queryKeys.mfa, queryFn: () => api.auth.mfa.status(), enabled: authed, staleTime: 60_000 });
}

/** Setup → enable → disable; every step refreshes the status query and the session list (enable revokes others). */
export function useMfaActions() {
  const api = useApi();
  const qc = useQueryClient();
  const refresh = () => {
    qc.invalidateQueries({ queryKey: queryKeys.mfa });
    qc.invalidateQueries({ queryKey: queryKeys.sessions });
  };
  const setup = useMutation({ mutationFn: () => api.auth.mfa.setup() });
  const enable = useMutation({ mutationFn: (code: string) => api.auth.mfa.enable(code), onSuccess: refresh });
  const disable = useMutation({ mutationFn: (code: string) => api.auth.mfa.disable(code), onSuccess: refresh });
  return { setup, enable, disable };
}
