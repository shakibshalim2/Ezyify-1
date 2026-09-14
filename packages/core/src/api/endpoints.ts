import { z } from 'zod';
import type { ApiClient } from './client.js';
import {
  AddressSchema,
  CartSchema,
  CategorySchema,
  CheckoutRequestSchema,
  CommentSchema,
  ConversationSchema,
  CreateAddressRequestSchema,
  CreatePostRequestSchema,
  DeleteAccountRequestSchema,
  DeviceSessionSchema,
  FinalizedUploadSchema,
  ForgotPasswordRequestSchema,
  LoginRequestSchema,
  LoginResponseSchema,
  MessageSchema,
  NotificationSchema,
  OrderEventSchema,
  OrderSchema,
  PostSchema,
  ProductDetailSchema,
  ProductSummarySchema,
  RefreshResponseSchema,
  RegisterDeviceRequestSchema,
  ReportRequestSchema,
  ResetPasswordRequestSchema,
  SendMessageRequestSchema,
  SignUploadRequestSchema,
  SignedUploadSchema,
  SignupRequestSchema,
  SignupResponseSchema,
  TransactionSchema,
  UpdateProfileRequestSchema,
  UserProfileSchema,
  UserSummarySchema,
  VerifyOtpRequestSchema,
  VerifyOtpResponseSchema,
  WalletSchema,
  paginated,
  type CheckoutRequest,
  type CreateAddressRequest,
  type CreatePostRequest,
  type DeleteAccountRequest,
  type LoginRequest,
  type RegisterDeviceRequest,
  type ReportRequest,
  type SendMessageRequest,
  type SignUploadRequest,
  type SignupRequest,
  type UpdateProfileRequest,
  type VerifyOtpRequest,
} from '../schemas/index.js';

const Ok = z.object({ ok: z.literal(true) }).or(z.null());
const Count = z.object({ count: z.number().int().min(0) });
type PageQuery = { page?: number; pageSize?: number };
export type FeedQuery = PageQuery & { kind?: 'post' | 'loop' | 'story'; author?: string; hashtag?: string };
export type ProductQuery = PageQuery & { category?: string; q?: string; sort?: 'popular' | 'newest' | 'price_asc' | 'price_desc' | 'rating'; seller?: string };

const enc = encodeURIComponent;

/** Endpoint map mirroring apps/api; each call validates input and output against the shared schemas. */
export function createEndpoints(api: ApiClient) {
  return {
    auth: {
      signup: (body: SignupRequest) => api.post('/auth/signup', SignupRequestSchema.parse(body), SignupResponseSchema, { auth: false }),
      login: (body: LoginRequest) => api.post('/auth/login', LoginRequestSchema.parse(body), LoginResponseSchema, { auth: false }),
      verifyOtp: (body: VerifyOtpRequest) => api.post('/auth/verify-otp', VerifyOtpRequestSchema.parse(body), VerifyOtpResponseSchema, { auth: false }),
      forgotPassword: (email: string) => api.post('/auth/forgot-password', ForgotPasswordRequestSchema.parse({ email }), Ok, { auth: false }),
      resetPassword: (token: string, password: string) => api.post('/auth/reset-password', ResetPasswordRequestSchema.parse({ token, password }), Ok, { auth: false }),
      /** Web: cookie carries the refresh token. Native: pass the stored one explicitly. */
      refresh: (refreshToken?: string) => api.post('/auth/refresh', refreshToken ? { refreshToken } : {}, RefreshResponseSchema, { auth: false }),
      logout: (refreshToken?: string) => api.post('/auth/logout', refreshToken ? { refreshToken } : {}, Ok),
      logoutAll: () => api.post('/auth/logout-all', {}, Ok),
      sessions: () => api.get('/auth/sessions', z.array(DeviceSessionSchema)),
      revokeSession: (id: string) => api.delete(`/auth/sessions/${enc(id)}`, Ok),
    },
    users: {
      me: () => api.get('/users/me', UserProfileSchema),
      updateMe: (body: UpdateProfileRequest) => api.patch('/users/me', UpdateProfileRequestSchema.parse(body), UserProfileSchema),
      profile: (username: string) => api.get(`/users/${enc(username)}`, UserProfileSchema),
      followers: (username: string) => api.get(`/users/${enc(username)}/followers`, z.array(UserSummarySchema)),
      following: (username: string) => api.get(`/users/${enc(username)}/following`, z.array(UserSummarySchema)),
      follow: (username: string) => api.post(`/users/${enc(username)}/follow`, {}, Ok),
      unfollow: (username: string) => api.delete(`/users/${enc(username)}/follow`, Ok),
    },
    catalog: {
      products: (query: ProductQuery = {}) => api.get('/products', paginated(ProductSummarySchema), { query, auth: false }),
      product: (id: string) => api.get(`/products/${enc(id)}`, ProductDetailSchema, { auth: false }),
      categories: () => api.get('/categories', z.array(CategorySchema), { auth: false }),
      search: (q: string, query: PageQuery = {}) => api.get('/search', paginated(ProductSummarySchema), { query: { q, ...query }, auth: false }),
    },
    cart: {
      get: () => api.get('/cart', CartSchema),
      add: (productId: string, quantity = 1, variantId?: string | null) =>
        api.post('/cart/items', { productId, quantity, ...(variantId ? { variantId } : {}) }, CartSchema),
      update: (productId: string, quantity: number) => api.patch(`/cart/items/${enc(productId)}`, { quantity }, CartSchema),
      remove: (productId: string) => api.delete(`/cart/items/${enc(productId)}`, CartSchema),
      applyCoupon: (code: string) => api.post('/cart/coupon', { code }, CartSchema),
    },
    orders: {
      /** `idempotencyKey` lets a retried checkout return the already-created orders instead of charging twice. */
      checkout: (body: CheckoutRequest, idempotencyKey?: string) =>
        api.post('/checkout', CheckoutRequestSchema.parse(body), z.array(OrderSchema), idempotencyKey ? { headers: { 'Idempotency-Key': idempotencyKey } } : {}),
      list: (query: PageQuery & { status?: string } = {}) => api.get('/orders', paginated(OrderSchema), { query }),
      get: (id: string) => api.get(`/orders/${enc(id)}`, OrderSchema),
      timeline: (id: string) => api.get(`/orders/${enc(id)}/timeline`, z.array(OrderEventSchema)),
      confirmDelivery: (id: string) => api.post(`/orders/${enc(id)}/confirm-delivery`, {}, OrderSchema),
      requestRefund: (id: string, reason: string, itemIds: string[]) => api.post(`/orders/${enc(id)}/refund`, { reason, itemIds }, OrderSchema),
      cancel: (id: string) => api.post(`/orders/${enc(id)}/cancel`, {}, OrderSchema),
    },
    addresses: {
      list: () => api.get('/addresses', z.array(AddressSchema)),
      create: (body: CreateAddressRequest) => api.post('/addresses', CreateAddressRequestSchema.parse(body), AddressSchema),
      remove: (id: string) => api.delete(`/addresses/${enc(id)}`, Ok),
    },
    wallet: {
      get: () => api.get('/wallet', WalletSchema),
      transactions: (query: PageQuery = {}) => api.get('/wallet/transactions', paginated(TransactionSchema), { query }),
      topup: (amount: number, method: string) => api.post('/wallet/topup', { amount, method }, WalletSchema),
      withdraw: (amount: number, payoutMethodId: string) => api.post('/wallet/withdraw', { amount, payoutMethodId }, TransactionSchema),
    },
    feed: {
      home: (query: FeedQuery = {}) => api.get('/feed', paginated(PostSchema), { query }),
      loops: (query: FeedQuery = {}) => api.get('/loops', paginated(PostSchema), { query }),
      stories: () => api.get('/stories', z.array(PostSchema)),
      /** Posts the viewer bookmarked, newest first. */
      saved: (query: PageQuery = {}) => api.get('/posts/saved', paginated(PostSchema), { query }),
      post: (id: string) => api.get(`/posts/${enc(id)}`, PostSchema),
      create: (body: CreatePostRequest) => api.post('/posts', CreatePostRequestSchema.parse(body), PostSchema),
      remove: (id: string) => api.delete(`/posts/${enc(id)}`, Ok),
      like: (id: string) => api.post(`/posts/${enc(id)}/like`, {}, Ok),
      unlike: (id: string) => api.delete(`/posts/${enc(id)}/like`, Ok),
      save: (id: string) => api.post(`/posts/${enc(id)}/save`, {}, Ok),
      unsave: (id: string) => api.delete(`/posts/${enc(id)}/save`, Ok),
      comments: (id: string, query: PageQuery = {}) => api.get(`/posts/${enc(id)}/comments`, paginated(CommentSchema), { query }),
      comment: (id: string, text: string) => api.post(`/posts/${enc(id)}/comments`, { text }, CommentSchema),
    },
    messaging: {
      conversations: () => api.get('/conversations', z.array(ConversationSchema)),
      /** Returns the existing 1:1 conversation id or creates one. */
      start: (username: string) => api.post('/conversations', { username }, z.object({ id: z.string().min(1) })),
      messages: (conversationId: string, query: PageQuery = {}) => api.get(`/conversations/${enc(conversationId)}/messages`, paginated(MessageSchema), { query }),
      send: (conversationId: string, body: SendMessageRequest | string) =>
        api.post(`/conversations/${enc(conversationId)}/messages`, SendMessageRequestSchema.parse(typeof body === 'string' ? { text: body } : body), MessageSchema),
    },
    notifications: {
      list: (query: PageQuery = {}) => api.get('/notifications', paginated(NotificationSchema), { query }),
      unreadCount: () => api.get('/notifications/unread-count', Count),
      markRead: (id: string) => api.post(`/notifications/${enc(id)}/read`, {}, Ok),
      markAllRead: () => api.post('/notifications/read-all', {}, Ok),
      /** Register/refresh this device's push token (FCM on Android, APNs on iOS, web push). */
      registerDevice: (body: RegisterDeviceRequest) => api.post('/devices', RegisterDeviceRequestSchema.parse(body), Ok),
      unregisterDevice: (token: string) => api.delete(`/devices/${enc(token)}`, Ok),
    },
    uploads: {
      sign: (body: SignUploadRequest) => api.post('/uploads/sign', SignUploadRequestSchema.parse(body), SignedUploadSchema),
      finalize: (key: string) => api.post('/uploads/finalize', { key }, FinalizedUploadSchema),
    },
    account: {
      /** Play policy: in-app account deletion must exist and match the web URL. */
      requestDeletion: (body: DeleteAccountRequest) => api.post('/account/delete', DeleteAccountRequestSchema.parse(body), Ok),
      restore: () => api.post('/account/restore', {}, Ok),
      exportData: () => api.post('/account/export', {}, Ok),
    },
    moderation: {
      /** UGC policy: users must be able to report and block. */
      report: (body: ReportRequest) => api.post('/reports', ReportRequestSchema.parse(body), Ok),
      block: (userId: string) => api.post(`/users/${enc(userId)}/block`, {}, Ok),
      unblock: (userId: string) => api.delete(`/users/${enc(userId)}/block`, Ok),
      blocked: () => api.get('/users/me/blocked', z.array(UserSummarySchema.pick({ id: true, username: true, name: true, avatarUrl: true }))),
    },
  };
}

export type Endpoints = ReturnType<typeof createEndpoints>;
