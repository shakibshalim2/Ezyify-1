import { z } from 'zod';
import { IdSchema, IsoDateSchema } from './common.js';
import { UserSummarySchema } from './user.js';

export const MediaSchema = z.object({
  type: z.enum(['image', 'video']),
  url: z.string().url(),
  thumbnailUrl: z.string().url().nullable(),
  width: z.number().int().positive().nullable(),
  height: z.number().int().positive().nullable(),
  durationMs: z.number().int().positive().nullable(),
});
export type Media = z.infer<typeof MediaSchema>;

export const EngagementSchema = z.object({
  likes: z.number().int().min(0),
  comments: z.number().int().min(0),
  shares: z.number().int().min(0),
  saves: z.number().int().min(0),
  views: z.number().int().min(0).optional(),
  isLiked: z.boolean().default(false),
  isSaved: z.boolean().default(false),
});

export const PostSchema = z.object({
  id: IdSchema,
  kind: z.enum(['post', 'loop', 'story']),
  author: UserSummarySchema,
  caption: z.string().max(2200),
  hashtags: z.array(z.string()),
  media: z.array(MediaSchema).min(1),
  taggedProductIds: z.array(IdSchema),
  engagement: EngagementSchema,
  location: z.string().nullable(),
  createdAt: IsoDateSchema,
});
export type Post = z.infer<typeof PostSchema>;

export const CommentSchema = z.object({
  id: IdSchema,
  author: UserSummarySchema,
  text: z.string().min(1).max(1000),
  likes: z.number().int().min(0),
  createdAt: IsoDateSchema,
});
export type Comment = z.infer<typeof CommentSchema>;

/** POST /posts — media URLs come from the signed-upload flow (`uploads.sign` → PUT → `uploads.finalize`). */
export const CreatePostRequestSchema = z.object({
  kind: z.enum(['post', 'loop', 'story']).default('post'),
  caption: z.string().max(2200).default(''),
  hashtags: z.array(z.string().regex(/^[\w]+$/)).max(30).default([]),
  media: z.array(MediaSchema).min(1).max(10),
  taggedProductIds: z.array(IdSchema).max(10).default([]),
  location: z.string().max(80).nullable().default(null),
});
export type CreatePostRequest = z.input<typeof CreatePostRequestSchema>;

/** Direct-to-bucket upload contract: sign → PUT bytes to `url` with `headers` → finalize. */
export const UploadContentTypeSchema = z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'video/mp4', 'video/quicktime']);
export const UploadPurposeSchema = z.enum(['post', 'loop', 'story', 'avatar', 'cover', 'product', 'message', 'kyc']);
export const SignUploadRequestSchema = z.object({
  contentType: UploadContentTypeSchema,
  sizeBytes: z.number().int().positive(),
  purpose: UploadPurposeSchema,
});
export type SignUploadRequest = z.infer<typeof SignUploadRequestSchema>;
export const SignedUploadSchema = z.object({
  key: z.string().min(1),
  url: z.string().url(),
  method: z.literal('PUT'),
  headers: z.record(z.string()),
  expiresInSeconds: z.number().int().positive(),
  publicUrl: z.string().url(),
});
export type SignedUpload = z.infer<typeof SignedUploadSchema>;
export const FinalizedUploadSchema = z.object({
  key: z.string().min(1),
  url: z.string().url(),
  contentType: z.string(),
  kind: z.enum(['image', 'video']),
  sizeBytes: z.number().int().min(0),
});
export type FinalizedUpload = z.infer<typeof FinalizedUploadSchema>;

export const SendMessageRequestSchema = z
  .object({ text: z.string().max(4000).optional(), productId: IdSchema.optional(), mediaUrl: z.string().url().optional() })
  .refine(b => b.text || b.productId || b.mediaUrl, { message: 'Message is empty' });
export type SendMessageRequest = z.infer<typeof SendMessageRequestSchema>;

export const ConversationSchema = z.object({
  id: IdSchema,
  participants: z.array(UserSummarySchema).min(1),
  lastMessage: z.object({ text: z.string(), at: IsoDateSchema, fromMe: z.boolean() }).nullable(),
  unreadCount: z.number().int().min(0),
});
export type Conversation = z.infer<typeof ConversationSchema>;

export const MessageSchema = z.object({
  id: IdSchema,
  conversationId: IdSchema,
  senderId: IdSchema,
  text: z.string().nullable(),
  media: MediaSchema.nullable(),
  productId: IdSchema.nullable(),
  status: z.enum(['sending', 'sent', 'delivered', 'read']),
  createdAt: IsoDateSchema,
});
export type Message = z.infer<typeof MessageSchema>;

export const NotificationSchema = z.object({
  id: IdSchema,
  type: z.enum(['like', 'comment', 'follow', 'purchase', 'live', 'order', 'trending', 'repost', 'system']),
  actor: UserSummarySchema.nullable(),
  message: z.string(),
  href: z.string().nullable(),
  thumbnailUrl: z.string().url().nullable(),
  read: z.boolean(),
  createdAt: IsoDateSchema,
});
export type Notification = z.infer<typeof NotificationSchema>;

export const LiveStreamSchema = z.object({
  id: IdSchema,
  host: UserSummarySchema,
  title: z.string(),
  thumbnailUrl: z.string().url(),
  status: z.enum(['scheduled', 'live', 'ended']),
  viewers: z.number().int().min(0),
  startsAt: IsoDateSchema,
  featuredProductIds: z.array(IdSchema),
});
export type LiveStream = z.infer<typeof LiveStreamSchema>;
