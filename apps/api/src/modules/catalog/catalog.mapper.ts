import type { ProductDetail, ProductSummary } from '@ezyify/core';
import type { Prisma } from '../../generated/prisma/client.js';
import { money } from '../../common/money.js';

export const productInclude = { seller: { select: { id: true, username: true, name: true, verified: true } }, category: true, variants: true } satisfies Prisma.ProductInclude;
type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export function toProductSummary(p: ProductRow): ProductSummary {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    imageUrl: p.images[0] ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800',
    price: money(p.price, p.currency),
    compareAtPrice: p.compareAtPrice != null ? money(p.compareAtPrice, p.currency) : null,
    rating: p.ratingCount ? Math.round((p.ratingSum / p.ratingCount) * 10) / 10 : 0,
    reviewCount: p.ratingCount,
    seller: p.seller,
    badge: (p.badge as ProductSummary['badge']) ?? null,
    inStock: p.stock > 0 || p.variants.some(v => v.stock > 0),
  };
}

export function toProductDetail(p: ProductRow): ProductDetail {
  return {
    ...toProductSummary(p),
    description: p.description,
    images: p.images.length ? p.images : [toProductSummary(p).imageUrl],
    category: p.category.name,
    tags: p.tags,
    variants: p.variants.map(v => ({ id: v.id, name: v.name, options: v.options as Record<string, string>, price: money(v.price, p.currency), stock: v.stock, imageUrl: v.imageUrl })),
    shipping: { freeOver: p.freeShipOver != null ? money(p.freeShipOver, p.currency) : null, etaDays: [p.etaMinDays, p.etaMaxDays] },
    escrowProtected: true,
    soldCount: p.soldCount,
    createdAt: p.createdAt.toISOString(),
  };
}
