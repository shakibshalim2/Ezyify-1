import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { CreateReviewRequestSchema, ReplyReviewRequestSchema, type CreateReviewRequest, type ProductReviewsResponse, type ReplyReviewRequest, type Review, type ReviewStats, type SellerReview, type SellerReviewsResponse } from '@ezyify/core';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { PageQuerySchema, page, skipTake } from '../../common/pagination.js';
import { ApiException, forbidden, notFound } from '../../common/errors.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Public, Roles, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { toUserSummary } from '../users/users.mapper.js';

const reviewInclude = { user: { select: { id: true, username: true, name: true, avatarUrl: true, verified: true, role: true } }, product: { select: { id: true, name: true, images: true, sellerId: true } } } satisfies Prisma.ReviewInclude;
type ReviewRow = Prisma.ReviewGetPayload<{ include: typeof reviewInclude }>;

const toReview = (r: ReviewRow): Review => ({
  id: r.id,
  productId: r.productId,
  user: toUserSummary(r.user),
  rating: r.rating,
  text: r.text,
  verifiedPurchase: !!r.orderId,
  reply: r.reply ? { text: r.reply, at: (r.repliedAt ?? r.createdAt).toISOString() } : null,
  createdAt: r.createdAt.toISOString(),
});
const toSellerReview = (r: ReviewRow): SellerReview => ({ ...toReview(r), product: { id: r.product.id, name: r.product.name, imageUrl: r.product.images[0] ?? 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800' } });

const statsFrom = (rows: { rating: number; _count: { _all: number } }[]): ReviewStats => {
  const distribution = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } as ReviewStats['distribution'];
  let total = 0, sum = 0;
  for (const r of rows) {
    const k = String(Math.min(5, Math.max(1, r.rating))) as keyof typeof distribution;
    distribution[k] = (distribution[k] ?? 0) + r._count._all;
    total += r._count._all;
    sum += r.rating * r._count._all;
  }
  return { average: total ? Math.round((sum / total) * 10) / 10 : 0, total, distribution };
};

const SellerQuerySchema = PageQuerySchema.extend({ filter: z.enum(['all', 'unreplied', 'low']).default('all'), productId: z.string().optional() });

@ApiTags('catalog')
@Controller()
export class ReviewsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('products/:id/reviews')
  @Public()
  async list(@Param('id') idOrSlug: string, @Query(zod(PageQuerySchema)) q: z.infer<typeof PageQuerySchema>): Promise<ProductReviewsResponse> {
    const product = await this.prisma.product.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }, select: { id: true } });
    if (!product) throw notFound('Product');
    const where = { productId: product.id };
    const [rows, total, dist] = await Promise.all([
      this.prisma.review.findMany({ where, include: reviewInclude, orderBy: { createdAt: 'desc' }, ...skipTake(q) }),
      this.prisma.review.count({ where }),
      this.prisma.review.groupBy({ by: ['rating'], where, _count: { _all: true } }),
    ]);
    return { ...page(rows.map(toReview), total, q), stats: statsFrom(dist) };
  }

  /** One review per buyer per product. Verified purchase is derived server-side from a completed order — the client can't claim it. */
  @Post('products/:id/reviews')
  async create(@CurrentUser() user: AccessClaims, @Param('id') idOrSlug: string, @Body(zod(CreateReviewRequestSchema)) body: CreateReviewRequest): Promise<Review> {
    const product = await this.prisma.product.findFirst({ where: { OR: [{ id: idOrSlug }, { slug: idOrSlug }] }, select: { id: true, sellerId: true } });
    if (!product) throw notFound('Product');
    if (product.sellerId === user.sub) throw forbidden('You cannot review your own product');
    const existing = await this.prisma.review.findUnique({ where: { productId_userId: { productId: product.id, userId: user.sub } } });
    if (existing) throw new ApiException('CONFLICT', 'You have already reviewed this product');
    const purchase = await this.prisma.order.findFirst({ where: { buyerId: user.sub, status: 'completed', items: { some: { productId: product.id } } }, select: { id: true }, orderBy: { placedAt: 'desc' } });
    const row = await this.prisma.$transaction(async tx => {
      const r = await tx.review.create({ data: { productId: product.id, userId: user.sub, rating: body.rating, text: body.text ?? null, orderId: purchase?.id ?? null }, include: reviewInclude });
      await tx.product.update({ where: { id: product.id }, data: { ratingSum: { increment: body.rating }, ratingCount: { increment: 1 } } });
      return r;
    });
    return toReview(row);
  }

  @Get('seller/reviews')
  @Roles('seller', 'admin')
  async sellerList(@CurrentUser() user: AccessClaims, @Query(zod(SellerQuerySchema)) q: z.infer<typeof SellerQuerySchema>): Promise<SellerReviewsResponse> {
    const base: Prisma.ReviewWhereInput = { product: { sellerId: user.sub }, ...(q.productId ? { productId: q.productId } : {}) };
    const where: Prisma.ReviewWhereInput = q.filter === 'unreplied' ? { ...base, reply: null } : q.filter === 'low' ? { ...base, rating: { lte: 3 } } : base;
    const [rows, total, dist, awaiting, all] = await Promise.all([
      this.prisma.review.findMany({ where, include: reviewInclude, orderBy: { createdAt: 'desc' }, ...skipTake(q) }),
      this.prisma.review.count({ where }),
      this.prisma.review.groupBy({ by: ['rating'], where: base, _count: { _all: true } }),
      this.prisma.review.count({ where: { ...base, reply: null } }),
      this.prisma.review.count({ where: base }),
    ]);
    const stats = statsFrom(dist);
    return { ...page(rows.map(toSellerReview), total, q), stats: { ...stats, awaitingReply: awaiting, replyRate: all ? Math.round(((all - awaiting) / all) * 1000) / 1000 : 0 } };
  }

  @Post('seller/reviews/:id/reply')
  @Roles('seller', 'admin')
  async reply(@CurrentUser() user: AccessClaims, @Param('id') id: string, @Body(zod(ReplyReviewRequestSchema)) body: ReplyReviewRequest): Promise<Review> {
    const r = await this.prisma.review.findUnique({ where: { id }, include: reviewInclude });
    if (!r) throw notFound('Review');
    if (r.product.sellerId !== user.sub && user.role !== 'admin') throw forbidden();
    const updated = await this.prisma.review.update({ where: { id }, data: { reply: body.text, repliedAt: new Date() }, include: reviewInclude });
    await this.prisma.notification.create({ data: { recipientId: r.userId, actorId: user.sub, type: 'system', message: `${r.product.name} · the seller replied to your review`, href: `/product/${r.productId}` } }).catch(() => undefined);
    return toReview(updated);
  }
}
