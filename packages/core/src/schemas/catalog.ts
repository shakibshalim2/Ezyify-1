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

/** Owner view of one product (`GET /seller/products/:id`): the public detail plus draft state and the editable fields. */
export const SellerProductDetailSchema = ProductDetailSchema.extend({
  published: z.boolean(),
  /** Base stock (variants carry their own). */
  stock: z.number().int().min(0),
  categoryId: IdSchema,
  updatedAt: IsoDateSchema,
});
export type SellerProductDetail = z.infer<typeof SellerProductDetailSchema>;

/** Prices/stock are minor units and whole numbers; shared by web, mobile and the API so validation is identical everywhere. */
const productBody = z.object({
  name: z.string().trim().min(3, 'Name needs at least 3 characters').max(120),
  description: z.string().trim().min(10, 'Describe the product in at least 10 characters').max(5000),
  /** Category id or slug. */
  categoryId: z.string().trim().min(1, 'Pick a category'),
  price: z.number().int('Price must be a whole amount').min(1, 'Price must be greater than zero'),
  compareAtPrice: z.number().int().min(1).nullable().optional(),
  stock: z.number().int('Stock must be a whole number').min(0, 'Stock cannot be negative').max(1_000_000),
  images: z.array(z.string().url('Each image must be a valid URL')).min(1, 'Add at least one image').max(8),
  tags: z.array(z.string().trim().toLowerCase().min(1).max(30)).max(10),
  badge: ProductBadgeSchema.nullable().optional(),
  published: z.boolean(),
  freeShipOver: z.number().int().min(0).nullable().optional(),
  etaDays: z.tuple([z.number().int().min(0).max(90), z.number().int().min(0).max(90)]).optional(),
});
const priceRule = { path: ['compareAtPrice'], message: 'Compare-at price must be higher than the selling price' };
const etaRule = { path: ['etaDays'], message: 'Delivery window is out of order' };

/** Body for `POST /seller/products`. */
export const UpsertProductRequestSchema = productBody
  .extend({ tags: productBody.shape.tags.default([]), published: productBody.shape.published.default(true) })
  .refine(b => b.compareAtPrice == null || b.compareAtPrice > b.price, priceRule)
  .refine(b => !b.etaDays || b.etaDays[0] <= b.etaDays[1], etaRule);
export type UpsertProductRequest = z.input<typeof UpsertProductRequestSchema>;

/** `PATCH /seller/products/:id` — any subset of the create body; cross-field rules only apply when both sides are sent. */
export const UpdateProductRequestSchema = productBody
  .partial()
  .refine(b => b.compareAtPrice == null || b.price == null || b.compareAtPrice > b.price, priceRule)
  .refine(b => !b.etaDays || b.etaDays[0] <= b.etaDays[1], etaRule);
export type UpdateProductRequest = z.infer<typeof UpdateProductRequestSchema>;

/** Products with order history are archived (unpublished) instead of removed so past orders keep their lines. */
export const DeleteProductResultSchema = z.object({ ok: z.literal(true), mode: z.enum(['deleted', 'archived']) });
export type DeleteProductResult = z.infer<typeof DeleteProductResultSchema>;

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
