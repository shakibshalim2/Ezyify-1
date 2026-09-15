import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import {
  LOW_STOCK_THRESHOLD,
  SellerProductStatusSchema,
  UpdateProductRequestSchema,
  UpsertProductRequestSchema,
  type DeleteProductResult,
  type SellerProduct,
  type SellerProductDetail,
  type SellerProductsResponse,
  type UpdateProductRequest,
} from '@ezyify/core';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { PageQuerySchema, skipTake } from '../../common/pagination.js';
import { money } from '../../common/money.js';
import { notFound, validation } from '../../common/errors.js';
import { AuditService } from '../../common/audit.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { SearchIndexer } from '../search/search.indexer.js';
import { productInclude, toProductDetail, toProductSummary } from './catalog.mapper.js';

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

type CreateBody = z.output<typeof UpsertProductRequestSchema>;
type ProductRow = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

const toSellerDetail = (p: ProductRow): SellerProductDetail => ({ ...toProductDetail(p), published: p.published, stock: p.stock, categoryId: p.categoryId, updatedAt: p.updatedAt.toISOString() });

const slugify = (name: string) => name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 60) || 'product';

/** Seller hub inventory — always scoped to the caller; drafts included (the public catalog hides them). */
@ApiTags('seller')
@Controller('seller/products')
export class SellerProductsController {
  constructor(private readonly prisma: PrismaService, private readonly indexer: SearchIndexer, private readonly audit: AuditService) {}

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

  @Get(':id')
  @Roles('seller', 'admin')
  async detail(@CurrentUser() user: AccessClaims, @Param('id') id: string): Promise<SellerProductDetail> {
    return toSellerDetail(await this.own(user, id));
  }

  @Post()
  @Roles('seller', 'admin')
  @HttpCode(201)
  async create(@CurrentUser() user: AccessClaims, @Body(zod(UpsertProductRequestSchema)) body: CreateBody): Promise<SellerProductDetail> {
    const category = await this.category(body.categoryId);
    const slug = await this.uniqueSlug(slugify(body.name));
    const row = await this.prisma.product.create({
      data: {
        slug,
        name: body.name,
        description: body.description,
        sellerId: user.sub,
        categoryId: category.id,
        price: body.price,
        compareAtPrice: body.compareAtPrice ?? null,
        images: body.images,
        tags: body.tags,
        badge: body.badge ?? null,
        stock: body.stock,
        published: body.published,
        freeShipOver: body.freeShipOver ?? null,
        ...(body.etaDays ? { etaMinDays: body.etaDays[0], etaMaxDays: body.etaDays[1] } : {}),
      },
      include: productInclude,
    });
    this.indexer.product(row.id);
    void this.audit.log('seller.product_created', { userId: user.sub, meta: { productId: row.id, published: row.published } });
    return toSellerDetail(row);
  }

  @Patch(':id')
  @Roles('seller', 'admin')
  async update(@CurrentUser() user: AccessClaims, @Param('id') id: string, @Body(zod(UpdateProductRequestSchema)) body: UpdateProductRequest): Promise<SellerProductDetail> {
    const current = await this.own(user, id);
    // Cross-field rule against the stored value when only one side of the pair is sent.
    const price = body.price ?? current.price;
    const compareAt = body.compareAtPrice === undefined ? current.compareAtPrice : body.compareAtPrice;
    if (compareAt != null && compareAt <= price) {
      throw validation(body.price !== undefined && body.compareAtPrice === undefined ? { price: 'Selling price must be lower than the compare-at price' } : { compareAtPrice: 'Compare-at price must be higher than the selling price' });
    }
    const category = body.categoryId !== undefined ? await this.category(body.categoryId) : null;
    const row = await this.prisma.product.update({
      where: { id: current.id },
      data: {
        ...(body.name !== undefined ? { name: body.name } : {}),
        ...(body.description !== undefined ? { description: body.description } : {}),
        ...(category ? { categoryId: category.id } : {}),
        ...(body.price !== undefined ? { price: body.price } : {}),
        ...(body.compareAtPrice !== undefined ? { compareAtPrice: body.compareAtPrice } : {}),
        ...(body.images !== undefined ? { images: body.images } : {}),
        ...(body.tags !== undefined ? { tags: body.tags } : {}),
        ...(body.badge !== undefined ? { badge: body.badge } : {}),
        ...(body.stock !== undefined ? { stock: body.stock } : {}),
        ...(body.published !== undefined ? { published: body.published } : {}),
        ...(body.freeShipOver !== undefined ? { freeShipOver: body.freeShipOver } : {}),
        ...(body.etaDays ? { etaMinDays: body.etaDays[0], etaMaxDays: body.etaDays[1] } : {}),
      },
      include: productInclude,
    });
    this.indexer.product(row.id);
    return toSellerDetail(row);
  }

  /** Products that were ever ordered are archived (unpublished) so order lines keep their reference; others are removed outright. */
  @Delete(':id')
  @Roles('seller', 'admin')
  async remove(@CurrentUser() user: AccessClaims, @Param('id') id: string): Promise<DeleteProductResult> {
    const current = await this.own(user, id);
    const ordered = await this.prisma.orderItem.count({ where: { productId: current.id } });
    if (ordered > 0 || current.soldCount > 0) {
      await this.prisma.product.update({ where: { id: current.id }, data: { published: false } });
      this.indexer.product(current.id);
      void this.audit.log('seller.product_archived', { userId: user.sub, meta: { productId: current.id } });
      return { ok: true, mode: 'archived' };
    }
    // Cart lines, variants, reviews and post tags cascade in the schema.
    await this.prisma.product.delete({ where: { id: current.id } });
    this.indexer.removeProduct(current.id);
    void this.audit.log('seller.product_deleted', { userId: user.sub, meta: { productId: current.id } });
    return { ok: true, mode: 'deleted' };
  }

  /** Ownership check: admins may manage any product; everyone else only their own. Non-owned ids read as 404, not 403, so ids can't be probed. */
  private async own(user: AccessClaims, idOrSlug: string) {
    const p = await this.prisma.product.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }], ...(user.role === 'admin' || user.role === 'superadmin' ? {} : { sellerId: user.sub }) }, include: productInclude });
    if (!p) throw notFound('Product');
    return p;
  }

  private async category(idOrSlug: string) {
    const c = await this.prisma.category.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }, select: { id: true } });
    if (!c) throw validation({ categoryId: 'Unknown category' });
    return c;
  }

  private async uniqueSlug(base: string) {
    const taken = new Set((await this.prisma.product.findMany({ where: { slug: { startsWith: base } }, select: { slug: true } })).map(p => p.slug));
    if (!taken.has(base)) return base;
    for (let n = 2; ; n++) if (!taken.has(`${base}-${n}`)) return `${base}-${n}`;
  }
}
