import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { notFound } from '../../common/errors.js';
import { PageQuerySchema, page, skipTake } from '../../common/pagination.js';
import { productInclude, toProductDetail, toProductSummary } from './catalog.mapper.js';

export const ProductQuerySchema = PageQuerySchema.extend({
  category: z.string().optional(),
  q: z.string().max(100).optional(),
  sort: z.enum(['popular', 'newest', 'price_asc', 'price_desc', 'rating']).default('popular'),
  seller: z.string().optional(),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  /** Deals: only products with a compare‑at price above the current price. */
  onSale: z.enum(['true', 'false']).optional(),
});
type ProductQuery = z.infer<typeof ProductQuerySchema>;

const ORDER: Record<ProductQuery['sort'], Prisma.ProductOrderByWithRelationInput[]> = {
  popular: [{ soldCount: 'desc' }, { ratingCount: 'desc' }],
  newest: [{ createdAt: 'desc' }],
  price_asc: [{ price: 'asc' }],
  price_desc: [{ price: 'desc' }],
  rating: [{ ratingSum: 'desc' }],
};

@Injectable()
export class CatalogService {
  constructor(private readonly prisma: PrismaService) {}

  async list(q: ProductQuery) {
    const where: Prisma.ProductWhereInput = {
      published: true,
      ...(q.category ? { category: { slug: q.category } } : {}),
      ...(q.seller ? { seller: { username: q.seller } } : {}),
      ...(q.q ? { OR: [{ name: { contains: q.q, mode: 'insensitive' } }, { tags: { has: q.q.toLowerCase() } }, { description: { contains: q.q, mode: 'insensitive' } }] } : {}),
      ...(q.minPrice != null || q.maxPrice != null ? { price: { gte: q.minPrice, lte: q.maxPrice } } : {}),
      ...(q.onSale === 'true' ? { compareAtPrice: { not: null } } : {}),
    };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, include: productInclude, orderBy: ORDER[q.sort], ...skipTake(q) }),
      this.prisma.product.count({ where }),
    ]);
    return page(rows.map(toProductSummary), total, q);
  }

  async get(idOrSlug: string) {
    const p = await this.prisma.product.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], published: true }, include: productInclude });
    if (!p) throw notFound('Product');
    return toProductDetail(p);
  }

  async categories() {
    const rows = await this.prisma.category.findMany({ include: { _count: { select: { products: { where: { published: true } } } } }, orderBy: { name: 'asc' } });
    return rows.map(c => ({ id: c.id, slug: c.slug, name: c.name, imageUrl: c.imageUrl, productCount: c._count.products }));
  }
}
