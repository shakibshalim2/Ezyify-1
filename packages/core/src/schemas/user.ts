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
