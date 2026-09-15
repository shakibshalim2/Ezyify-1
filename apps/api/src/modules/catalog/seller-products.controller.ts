import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { LOW_STOCK_THRESHOLD, SellerProductStatusSchema, type SellerProduct, type SellerProductsResponse } from '@ezyify/core';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { PageQuerySchema, skipTake } from '../../common/pagination.js';
import { money } from '../../common/money.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { productInclude, toProductSummary } from './catalog.mapper.js';

export const SellerProductQuerySchema = PageQuerySchema.extend({
  q: z.string().max(100).optional(),
  status: SellerProductStatusSchema.optional(),
});
type SellerProductQuery = z.infer<typeof SellerProductQuerySchema>;

/** Orders that count as revenue for the seller hub — money has reached (or is held in escrow for) the seller. */
const REVENUE_STATUSES: Prisma.OrderWhereInput['status'] = { in: ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed'] };

const STATUS_WHERE: Record<z.infer<typeof SellerProductStatusSchema>, Prisma.ProductWhereInput> = {
  active: { published: true, stock: { gte: LOW_STOCK_THRESHOLD } },
  low_stock: { published: true, stock: { gt: 0, lt: LOW_STOCK_THRESHOLD } },
  out_of_stock: { published: true, stock: 0 },
  draft: { published: false },
};

/** Seller hub inventory — always scoped to the caller; drafts included (the public catalog hides them). */
@ApiTags('seller')
@Controller('seller/products')
export class SellerProductsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('seller', 'admin')
  async list(@CurrentUser() user: AccessClaims, @Query(zod(SellerProductQuerySchema)) q: SellerProductQuery): Promise<SellerProductsResponse> {
    const base: Prisma.ProductWhereInput = {
      sellerId: user.sub,
      ...(q.q ? { name: { contains: q.q, mode: 'insensitive' } } : {}),
    };
    const where: Prisma.ProductWhereInput = q.status ? { AND: [base, STATUS_WHERE[q.status]] } : base;

    const [rows, total, active, lowStock, outOfStock, draft] = await this.prisma.$transaction([
      this.prisma.product.findMany({ where, include: productInclude, orderBy: [{ updatedAt: 'desc' }], ...skipTake(q) }),
      this.prisma.product.count({ where }),
      this.prisma.product.count({ where: { AND: [base, STATUS_WHERE.active] } }),
      this.prisma.product.count({ where: { AND: [base, STATUS_WHERE.low_stock] } }),
      this.prisma.product.count({ where: { AND: [base, STATUS_WHERE.out_of_stock] } }),
      this.prisma.product.count({ where: { AND: [base, STATUS_WHERE.draft] } }),
    ]);

    // Revenue per product from real order lines (one query for the page, not one per row).
    const revenueByProduct = new Map<string, number>();
    for (const r of await this.prisma.orderItem.findMany({
      where: { productId: { in: rows.map(x => x.id) }, order: { status: REVENUE_STATUSES } },
      select: { productId: true, unitPrice: true, quantity: true },
    })) {
      revenueByProduct.set(r.productId, (revenueByProduct.get(r.productId) ?? 0) + r.unitPrice * r.quantity);
    }

    const items: SellerProduct[] = rows.map(p => ({
      ...toProductSummary(p),
      stock: p.stock + p.variants.reduce((n, v) => n + v.stock, 0),
      soldCount: p.soldCount,
      revenue: money(revenueByProduct.get(p.id) ?? 0, p.currency),
      published: p.published,
      updatedAt: p.updatedAt.toISOString(),
    }));

    return {
      items,
      pagination: { page: q.page, pageSize: q.pageSize, total, hasMore: q.page * q.pageSize < total },
      summary: { total: active + lowStock + outOfStock + draft, active, lowStock, outOfStock, draft },
    };
  }
}
