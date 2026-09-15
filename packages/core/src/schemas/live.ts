import { z } from 'zod';
import { IsoDateSchema } from './common.js';
import { PostSchema } from './social.js';
import { ProductSummarySchema } from './catalog.js';
import { UserSummarySchema } from './user.js';

// ---------- Unified search (GET /search) ----------

export const SearchTypeSchema = z.enum(['products', 'users', 'posts', 'all']);
export type SearchType = z.infer<typeof SearchTypeSchema>;

const section = <T extends z.ZodTypeAny>(item: T) =>
  z.object({ items: z.array(item), nextCursor: z.string().nullable(), total: z.number().int().min(0) });

export const SearchResponseSchema = z.object({
  products: section(ProductSummarySchema),
  users: section(UserSummarySchema),
  posts: section(PostSchema),
});
export type SearchResponse = z.infer<typeof SearchResponseSchema>;

// ---------- LiveKit tokens (POST /live/token, /live/call-token) ----------

export const LiveRoleSchema = z.enum(['host', 'viewer']);
export type LiveRole = z.infer<typeof LiveRoleSchema>;

export const LiveTokenRequestSchema = z.object({
  room: z.string().regex(/^[\w.-]{1,64}$/, 'Room names are 1-64 word characters, dots or dashes'),
  role: LiveRoleSchema,
});
export type LiveTokenRequest = z.infer<typeof LiveTokenRequestSchema>;

export const LiveTokenSchema = z.object({
  token: z.string().min(1),
  url: z.string().url(),
  room: z.string().min(1),
  identity: z.string().min(1),
});
export type LiveToken = z.infer<typeof LiveTokenSchema>;

// ---------- Live shopping sessions (GET/POST /live/sessions) ----------

export const LiveSessionStatusSchema = z.enum(['scheduled', 'live', 'ended']);
export type LiveSessionStatus = z.infer<typeof LiveSessionStatusSchema>;

export const LiveSessionSchema = z.object({
  id: z.string().min(1),
  room: z.string().min(1),
  title: z.string().min(1).max(120),
  host: UserSummarySchema,
  status: LiveSessionStatusSchema,
  category: z.string().nullable(),
  coverUrl: z.string().url().nullable(),
  productIds: z.array(z.string().min(1)),
  pinnedProductId: z.string().min(1).nullable(),
  viewers: z.number().int().min(0),
  peakViewers: z.number().int().min(0),
  likes: z.number().int().min(0),
  scheduledFor: IsoDateSchema.nullable(),
  startedAt: IsoDateSchema.nullable(),
  endedAt: IsoDateSchema.nullable(),
  createdAt: IsoDateSchema,
});
export type LiveSession = z.infer<typeof LiveSessionSchema>;

export const LiveSessionsQuerySchema = z.object({
  status: LiveSessionStatusSchema.optional(),
  category: z.string().min(1).max(80).optional(),
  host: z.string().min(1).max(30).optional(),
  page: z.number().int().min(1).optional(),
  pageSize: z.number().int().min(1).max(100).optional(),
});
export type LiveSessionsQuery = z.infer<typeof LiveSessionsQuerySchema>;

export const CreateLiveSessionRequestSchema = z.object({
  title: z.string().min(1).max(120),
  category: z.string().min(1).max(80).optional(),
  coverUrl: z.string().url().optional(),
  productIds: z.array(z.string().min(1)).max(50).optional(),
  scheduledFor: IsoDateSchema.optional(),
});
export type CreateLiveSessionRequest = z.infer<typeof CreateLiveSessionRequestSchema>;

export const PinLiveSessionRequestSchema = z.object({ productId: z.string().min(1).nullable() });
export type PinLiveSessionRequest = z.infer<typeof PinLiveSessionRequestSchema>;

export const LiveHeartbeatRequestSchema = z.object({ like: z.boolean().optional() });
export type LiveHeartbeatRequest = z.infer<typeof LiveHeartbeatRequestSchema>;

export const LiveHeartbeatSchema = z.object({
  viewers: z.number().int().min(0),
  likes: z.number().int().min(0),
});
export type LiveHeartbeat = z.infer<typeof LiveHeartbeatSchema>;
