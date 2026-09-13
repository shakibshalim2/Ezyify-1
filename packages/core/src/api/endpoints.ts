import { z } from 'zod';
import type { ApiClient } from './client';
import {
  CartSchema,
  CategorySchema,
  CheckoutRequestSchema,
  ConversationSchema,
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
  ResetPasswordRequestSchema,
  SignupRequestSchema,
  SignupResponseSchema,
  TransactionSchema,
  UserProfileSchema,
  VerifyOtpRequestSchema,
  VerifyOtpResponseSchema,
  WalletSchema,
  paginated,
  type CheckoutRequest,
  type LoginRequest,
  type SignupRequest,
  type VerifyOtpRequest,
} from '../schemas';

const Ok = z.object({ ok: z.literal(true) }).or(z.null());
type PageQuery = { page?: number; pageSize?: number };

/** Endpoint map mirroring BACKEND_API_SPECIFICATION.md; each call validates input and output. */
export function createEndpoints(api: ApiClient) {
  return {
    auth: {
      signup: (body: SignupRequest) => api.post('/auth/signup', SignupRequestSchema.parse(body), SignupResponseSchema, { auth: false }),
      login: (body: LoginRequest) => api.post('/auth/login', LoginRequestSchema.parse(body), LoginResponseSchema, { auth: false }),
      verifyOtp: (body: VerifyOtpRequest) => api.post('/auth/verify-otp', VerifyOtpRequestSchema.parse(body), VerifyOtpResponseSchema, { auth: false }),
      forgotPassword: (email: string) => api.post('/auth/forgot-password', ForgotPasswordRequestSchema.parse({ email }), Ok, { auth: false }),
      resetPassword: (token: string, password: string) => api.post('/auth/reset-password', ResetPasswordRequestSchema.parse({ token, password }), Ok, { auth: false }),
      refresh: () => api.post('/auth/refresh', {}, RefreshResponseSchema, { auth: false }),
      logout: () => api.post('/auth/logout', {}, Ok),
    },
    users: {
      me: () => api.get('/users/me', UserProfileSchema),
      profile: (username: string) => api.get(`/users/${encodeURIComponent(username)}`, UserProfileSchema),
      follow: (username: string) => api.post(`/users/${encodeURIComponent(username)}/follow`, {}, Ok),
      unfollow: (username: string) => api.delete(`/users/${encodeURIComponent(username)}/follow`, Ok),
    },
    catalog: {
      products: (query: PageQuery & { category?: string; q?: string; sort?: string } = {}) =>
        api.get('/products', paginated(ProductSummarySchema), { query }),
      product: (id: string) => api.get(`/products/${encodeURIComponent(id)}`, ProductDetailSchema),
      categories: () => api.get('/categories', z.array(CategorySchema)),
      search: (q: string, query: PageQuery = {}) => api.get('/search', paginated(ProductSummarySchema), { query: { q, ...query } }),
    },
    cart: {
      get: () => api.get('/cart', CartSchema),
      add: (productId: string, quantity = 1, variantId?: string) => api.post('/cart/items', { productId, quantity, variantId }, CartSchema),
      update: (productId: string, quantity: number) => api.patch(`/cart/items/${encodeURIComponent(productId)}`, { quantity }, CartSchema),
      remove: (productId: string) => api.delete(`/cart/items/${encodeURIComponent(productId)}`, CartSchema),
      applyCoupon: (code: string) => api.post('/cart/coupon', { code }, CartSchema),
    },
    orders: {
      checkout: (body: CheckoutRequest) => api.post('/checkout', CheckoutRequestSchema.parse(body), z.array(OrderSchema)),
      list: (query: PageQuery & { status?: string } = {}) => api.get('/orders', paginated(OrderSchema), { query }),
      get: (id: string) => api.get(`/orders/${encodeURIComponent(id)}`, OrderSchema),
      timeline: (id: string) => api.get(`/orders/${encodeURIComponent(id)}/timeline`, z.array(OrderEventSchema)),
      confirmDelivery: (id: string) => api.post(`/orders/${encodeURIComponent(id)}/confirm-delivery`, {}, OrderSchema),
      requestRefund: (id: string, reason: string, itemIds: string[]) =>
        api.post(`/orders/${encodeURIComponent(id)}/refund`, { reason, itemIds }, OrderSchema),
    },
    wallet: {
      get: () => api.get('/wallet', WalletSchema),
      transactions: (query: PageQuery = {}) => api.get('/wallet/transactions', paginated(TransactionSchema), { query }),
      topup: (amount: number, method: string) => api.post('/wallet/topup', { amount, method }, WalletSchema),
      withdraw: (amount: number, payoutMethodId: string) => api.post('/wallet/withdraw', { amount, payoutMethodId }, TransactionSchema),
    },
    feed: {
      home: (query: PageQuery = {}) => api.get('/feed', paginated(PostSchema), { query }),
      loops: (query: PageQuery = {}) => api.get('/loops', paginated(PostSchema), { query }),
      post: (id: string) => api.get(`/posts/${encodeURIComponent(id)}`, PostSchema),
      like: (id: string) => api.post(`/posts/${encodeURIComponent(id)}/like`, {}, Ok),
      unlike: (id: string) => api.delete(`/posts/${encodeURIComponent(id)}/like`, Ok),
    },
    messaging: {
      conversations: () => api.get('/conversations', z.array(ConversationSchema)),
      messages: (conversationId: string, query: PageQuery = {}) =>
        api.get(`/conversations/${encodeURIComponent(conversationId)}/messages`, paginated(MessageSchema), { query }),
      send: (conversationId: string, text: string) =>
        api.post(`/conversations/${encodeURIComponent(conversationId)}/messages`, { text }, MessageSchema),
    },
    notifications: {
      list: (query: PageQuery = {}) => api.get('/notifications', paginated(NotificationSchema), { query }),
      markRead: (id: string) => api.post(`/notifications/${encodeURIComponent(id)}/read`, {}, Ok),
      markAllRead: () => api.post('/notifications/read-all', {}, Ok),
    },
  };
}

export type Endpoints = ReturnType<typeof createEndpoints>;
