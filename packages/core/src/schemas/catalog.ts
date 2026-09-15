import { z } from 'zod';
import { IdSchema, IsoDateSchema, MoneySchema, PaginationSchema } from './common.js';
import { UserSummarySchema } from './user.js';

export const ProductBadgeSchema = z.enum(['new', 'sale', 'bestseller', 'limited', 'live']);

export const ProductSummarySchema = z.object({
  id: IdSchema,
  slug: z.string().min(1),
  name: z.string().min(1),
  imageUrl: z.string().url(),
  price: MoneySchema,
  compareAtPrice: MoneySchema.nullable(),
  rating: z.number().min(0).max(5),
  reviewCount: z.number().int().min(0),
  seller: UserSummarySchema.pick({ id: true, username: true, name: true, verified: true }),
  badge: ProductBadgeSchema.nullable(),
  inStock: z.boolean(),
});
export type ProductSummary = z.infer<typeof ProductSummarySchema>;

export const ProductVariantSchema = z.object({
  id: IdSchema,
  name: z.string(),
  options: z.record(z.string()), // { Color: 'Blue', Size: 'M' }
  price: MoneySchema,
  stock: z.number().int().min(0),
  imageUrl: z.string().url().nullable(),
});

export const ProductDetailSchema = ProductSummarySchema.extend({
  description: z.string(),
  images: z.array(z.string().url()).min(1),
  category: z.string(),
  tags: z.array(z.string()),
  variants: z.array(ProductVariantSchema),
  shipping: z.object({ freeOver: MoneySchema.nullable(), etaDays: z.tuple([z.number(), z.number()]) }),
  escrowProtected: z.boolean().default(true),
  soldCount: z.number().int().min(0),
  createdAt: IsoDateSchema,
});
export type ProductDetail = z.infer<typeof ProductDetailSchema>;

export const CategorySchema = z.object({
  id: IdSchema,
  slug: z.string(),
  name: z.string(),
  imageUrl: z.string().url().nullable(),
  productCount: z.number().int().min(0),
});
export type Category = z.infer<typeof CategorySchema>;

/** Seller hub row (`GET /seller/products`): the summary plus inventory + performance the buyer API never exposes. */
export const SellerProductSchema = ProductSummarySchema.extend({
  stock: z.number().int().min(0),
  soldCount: z.number().int().min(0),
  revenue: MoneySchema,
  published: z.boolean(),
  updatedAt: IsoDateSchema,
});
export type SellerProduct = z.infer<typeof SellerProductSchema>;

export const SellerProductStatusSchema = z.enum(['active', 'low_stock', 'out_of_stock', 'draft']);
export type SellerProductStatus = z.infer<typeof SellerProductStatusSchema>;

/** Shared with the API so the "Low stock" threshold means the same thing everywhere. */
export const LOW_STOCK_THRESHOLD = 10;
export const sellerProductStatus = (p: Pick<SellerProduct, 'stock' | 'published'>): SellerProductStatus =>
  !p.published ? 'draft' : p.stock === 0 ? 'out_of_stock' : p.stock < LOW_STOCK_THRESHOLD ? 'low_stock' : 'active';

export const SellerProductsSummarySchema = z.object({
  total: z.number().int().min(0),
  active: z.number().int().min(0),
  lowStock: z.number().int().min(0),
  outOfStock: z.number().int().min(0),
  draft: z.number().int().min(0),
});
export const SellerProductsResponseSchema = z.object({
  items: z.array(SellerProductSchema),
  pagination: PaginationSchema,
  summary: SellerProductsSummarySchema,
});
export type SellerProductsResponse = z.infer<typeof SellerProductsResponseSchema>;

/** A product review; `reply` is the seller's public answer. */
export const ReviewSchema = z.object({
  id: IdSchema,
  productId: IdSchema,
  user: UserSummarySchema,
  rating: z.number().int().min(1).max(5),
  text: z.string().nullable(),
  verifiedPurchase: z.boolean(),
  reply: z.object({ text: z.string(), at: IsoDateSchema }).nullable(),
  createdAt: IsoDateSchema,
});
export type Review = z.infer<typeof ReviewSchema>;

export const ReviewStatsSchema = z.object({
  average: z.number().min(0).max(5),
  total: z.number().int().min(0),
  distribution: z.record(z.enum(['1', '2', '3', '4', '5']), z.number().int().min(0)),
});
export type ReviewStats = z.infer<typeof ReviewStatsSchema>;

export const ProductReviewsResponseSchema = z.object({ items: z.array(ReviewSchema), pagination: PaginationSchema, stats: ReviewStatsSchema });
export type ProductReviewsResponse = z.infer<typeof ProductReviewsResponseSchema>;

export const CreateReviewRequestSchema = z.object({
  rating: z.number().int().min(1).max(5),
  text: z.string().trim().min(3, 'Say a little more').max(2000).optional(),
});
export type CreateReviewRequest = z.infer<typeof CreateReviewRequestSchema>;

export const ReplyReviewRequestSchema = z.object({ text: z.string().trim().min(2, 'Write a short reply').max(1000) });
export type ReplyReviewRequest = z.infer<typeof ReplyReviewRequestSchema>;

/** Seller hub row: the review plus which product it belongs to. */
export const SellerReviewSchema = ReviewSchema.extend({ product: z.object({ id: IdSchema, name: z.string(), imageUrl: z.string().url() }) });
export type SellerReview = z.infer<typeof SellerReviewSchema>;
export const SellerReviewsResponseSchema = z.object({
  items: z.array(SellerReviewSchema),
  pagination: PaginationSchema,
  stats: ReviewStatsSchema.extend({ awaitingReply: z.number().int().min(0), replyRate: z.number().min(0).max(1) }),
});
export type SellerReviewsResponse = z.infer<typeof SellerReviewsResponseSchema>;
export type SellerReviewFilter = 'all' | 'unreplied' | 'low';
