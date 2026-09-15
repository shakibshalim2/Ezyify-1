import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common.js';

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

export const UpdateProfileRequestSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  username: z.string().regex(/^[a-z0-9._]{2,30}$/, 'Lowercase letters, numbers, dots and underscores only').optional(),
  bio: z.string().max(160).nullable().optional(),
  website: z.string().url().nullable().optional(),
  location: z.string().max(80).nullable().optional(),
  avatarUrl: z.string().url().nullable().optional(),
  coverUrl: z.string().url().nullable().optional(),
  interests: z.array(z.string()).max(20).optional(),
});
export type UpdateProfileRequest = z.infer<typeof UpdateProfileRequestSchema>;

/** One refresh session (device) as listed by GET /auth/sessions. */
export const DeviceSessionSchema = z.object({
  id: IdSchema,
  userAgent: z.string().nullable(),
  ip: z.string().nullable(),
  createdAt: IsoDateSchema,
  expiresAt: IsoDateSchema,
  current: z.boolean(),
});
export type DeviceSession = z.infer<typeof DeviceSessionSchema>;

export const SessionSchema = z.object({
  accessToken: z.string().min(1),
  /** Seconds until access token expiry; refresh token travels in an httpOnly cookie on web and SecureStore on native. */
  expiresIn: z.number().int().positive(),
  user: UserSummarySchema,
  /** Only present for `X-Client: native` callers; web never sees it (httpOnly cookie). */
  refreshToken: z.string().min(1).optional(),
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
  /** `child_safety` is CSAE (Play Child Safety Standards): routed to the front of the admin queue. */
  reason: z.enum(['spam', 'scam', 'harassment', 'hate', 'nudity', 'child_safety', 'violence', 'counterfeit', 'ip', 'self_harm', 'other']),
  details: z.string().max(1000).optional(),
});
export type ReportRequest = z.infer<typeof ReportRequestSchema>;

/** Notification categories map 1:1 onto the Android channels the app creates; `email` mirrors them for mail digests. */
export const NotificationCategorySchema = z.enum(['orders', 'social', 'messages', 'live', 'promos']);
export type NotificationCategory = z.infer<typeof NotificationCategorySchema>;
export const NotificationChannelPrefsSchema = z.object({ push: z.boolean(), email: z.boolean() });
export const NotificationPreferencesSchema = z.object({
  orders: NotificationChannelPrefsSchema,
  social: NotificationChannelPrefsSchema,
  messages: NotificationChannelPrefsSchema,
  live: NotificationChannelPrefsSchema,
  promos: NotificationChannelPrefsSchema,
});
export type NotificationPreferences = z.infer<typeof NotificationPreferencesSchema>;
/** Defaults for a new account: everything on except marketing. Shared so client + API agree on unset values. */
export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  orders: { push: true, email: true },
  social: { push: true, email: false },
  messages: { push: true, email: false },
  live: { push: true, email: false },
  promos: { push: false, email: false },
};
/** PATCH body: any subset of categories, each with any subset of channels. */
export const UpdateNotificationPreferencesRequestSchema = z.object({
  orders: NotificationChannelPrefsSchema.partial().optional(),
  social: NotificationChannelPrefsSchema.partial().optional(),
  messages: NotificationChannelPrefsSchema.partial().optional(),
  live: NotificationChannelPrefsSchema.partial().optional(),
  promos: NotificationChannelPrefsSchema.partial().optional(),
});
export type UpdateNotificationPreferencesRequest = z.infer<typeof UpdateNotificationPreferencesRequestSchema>;
/** Merges a stored (possibly partial / legacy) value over the defaults. */
export function resolveNotificationPreferences(stored: unknown): NotificationPreferences {
  const parsed = UpdateNotificationPreferencesRequestSchema.safeParse(stored ?? {});
  const patch = parsed.success ? parsed.data : {};
  const out = { ...DEFAULT_NOTIFICATION_PREFERENCES };
  for (const k of NotificationCategorySchema.options) out[k] = { ...DEFAULT_NOTIFICATION_PREFERENCES[k], ...(patch[k] ?? {}) };
  return out;
}

// ---------- KYC ----------

export const KycDocumentTypeSchema = z.enum(['passport', 'national_id', 'driving_license']);
export const KycStatusSchema = z.enum(['pending', 'approved', 'rejected']);
export type KycStatus = z.infer<typeof KycStatusSchema>;

/** What the submitter sees back: never the full ID number or raw document keys, only last4 + preview URLs. */
export const KycSubmissionSchema = z.object({
  id: IdSchema,
  status: KycStatusSchema,
  documentType: KycDocumentTypeSchema,
  fullName: z.string(),
  idNumberLast4: z.string(),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  country: z.string().length(2),
  documentFrontUrl: z.string().url(),
  documentBackUrl: z.string().url().nullable(),
  selfieUrl: z.string().url(),
  rejectionReason: z.string().nullable(),
  submittedAt: IsoDateSchema,
  reviewedAt: IsoDateSchema.nullable(),
});
export type KycSubmission = z.infer<typeof KycSubmissionSchema>;

/** `GET /kyc`: null until the user has ever submitted. */
export const KycStateSchema = z.object({ verified: z.boolean(), submission: KycSubmissionSchema.nullable(), canSubmit: z.boolean() });
export type KycState = z.infer<typeof KycStateSchema>;

const adult = (iso: string) => {
  const d = new Date(`${iso}T00:00:00Z`);
  if (Number.isNaN(d.getTime())) return false;
  const cutoff = new Date();
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - 18);
  return d <= cutoff;
};
export const SubmitKycRequestSchema = z.object({
  documentType: KycDocumentTypeSchema,
  fullName: z.string().trim().min(2, 'Enter your legal name').max(120),
  idNumber: z.string().trim().regex(/^[A-Za-z0-9-]{4,32}$/, 'Letters, digits and dashes only (4–32)'),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD').refine(adult, 'You must be at least 18'),
  country: z.string().length(2, 'Two-letter country code').transform(v => v.toUpperCase()),
  documentFrontUrl: z.string().url().nullable().default(null),
  documentBackUrl: z.string().url().nullable().default(null),
  selfieUrl: z.string().url().nullable().default(null),
}).superRefine((v, ctx) => {
  // Null slots surface as friendly per-slot messages instead of zod's "expected string".
  if (!v.documentFrontUrl) ctx.addIssue({ code: 'custom', path: ['documentFrontUrl'], message: 'Upload the front of your ID' });
  if (v.documentType !== 'passport' && !v.documentBackUrl) ctx.addIssue({ code: 'custom', path: ['documentBackUrl'], message: 'Upload the back of your ID' });
  if (!v.selfieUrl) ctx.addIssue({ code: 'custom', path: ['selfieUrl'], message: 'Upload a selfie holding your ID' });
}).transform(v => ({ ...v, documentFrontUrl: v.documentFrontUrl as string, selfieUrl: v.selfieUrl as string }));
export type SubmitKycRequest = z.input<typeof SubmitKycRequestSchema>;

/** Admin queue row: the reviewer sees who submitted plus the same redacted payload. */
export const AdminKycSubmissionSchema = KycSubmissionSchema.extend({ user: UserSummarySchema, email: z.string().email() });
export type AdminKycSubmission = z.infer<typeof AdminKycSubmissionSchema>;
export const ReviewKycRequestSchema = z.discriminatedUnion('decision', [
  z.object({ decision: z.literal('approve') }),
  z.object({ decision: z.literal('reject'), reason: z.string().trim().min(5, 'Tell the user what to fix').max(500) }),
]);
export type ReviewKycRequest = z.infer<typeof ReviewKycRequestSchema>;
