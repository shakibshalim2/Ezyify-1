import { z } from 'zod';
import { IdSchema, IsoDateSchema, MoneySchema } from './common.js';
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
