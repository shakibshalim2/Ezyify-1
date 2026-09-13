import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common';

export const RoleSchema = z.enum(['user', 'creator', 'seller', 'admin']);
export type Role = z.infer<typeof RoleSchema>;

export const UserSummarySchema = z.object({
  id: IdSchema,
  username: z.string().min(2).max(30),
  name: z.string().min(1).max(50),
  avatarUrl: z.string().url().nullable(),
  verified: z.boolean().default(false),
  role: RoleSchema.default('user'),
});
export type UserSummary = z.infer<typeof UserSummarySchema>;

export const UserProfileSchema = UserSummarySchema.extend({
  bio: z.string().max(160).nullable(),
  coverUrl: z.string().url().nullable(),
  website: z.string().url().nullable(),
  location: z.string().max(80).nullable(),
  followers: z.number().int().min(0),
  following: z.number().int().min(0),
  posts: z.number().int().min(0),
  isFollowing: z.boolean().optional(),
  createdAt: IsoDateSchema,
});
export type UserProfile = z.infer<typeof UserProfileSchema>;

export const SessionSchema = z.object({
  accessToken: z.string().min(1),
  /** Seconds until access token expiry; refresh token travels in an httpOnly cookie on web and SecureStore on native. */
  expiresIn: z.number().int().positive(),
  user: UserSummarySchema,
});
export type Session = z.infer<typeof SessionSchema>;

/** Push registration — one row per device; the server dedupes by token. */
export const RegisterDeviceRequestSchema = z.object({
  token: z.string().min(1),
  platform: z.enum(['android', 'ios', 'web']),
  provider: z.enum(['fcm', 'apns', 'expo', 'webpush']),
  appVersion: z.string().min(1),
  locale: z.string().min(2).max(16).optional(),
});
export type RegisterDeviceRequest = z.infer<typeof RegisterDeviceRequestSchema>;

/** Play "account deletion" policy: user-initiated, with a reason + grace period handled server-side. */
export const DeleteAccountRequestSchema = z.object({
  reason: z.enum(['not_useful', 'privacy', 'too_many_notifications', 'switching', 'other']),
  feedback: z.string().max(500).optional(),
  /** Explicit re-auth proof for the destructive action. */
  password: z.string().min(1).optional(),
});
export type DeleteAccountRequest = z.infer<typeof DeleteAccountRequestSchema>;

/** UGC policy: report any user / post / loop / product / message / live stream. */
export const ReportRequestSchema = z.object({
  targetType: z.enum(['user', 'post', 'loop', 'story', 'product', 'message', 'live', 'comment']),
  targetId: IdSchema,
  reason: z.enum(['spam', 'scam', 'harassment', 'hate', 'nudity', 'violence', 'counterfeit', 'ip', 'self_harm', 'other']),
  details: z.string().max(1000).optional(),
});
export type ReportRequest = z.infer<typeof ReportRequestSchema>;
