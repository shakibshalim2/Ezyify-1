import { z } from 'zod';
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
