import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { LOW_STOCK_THRESHOLD, type SellerDashboard } from '@ezyify/core';
import type { OrderStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { money } from '../../common/money.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';

const QuerySchema = z.object({ days: z.coerce.number().int().min(7).max(90).default(30) });

/** Orders that count as sales: money reached escrow and was not returned. */
const SALES: OrderStatus[] = ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed'];
const DAY = 86_400_000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);

@ApiTags('seller')
@Controller('seller/dashboard')
export class SellerDashboardController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('seller', 'admin')
  async get(@CurrentUser() user: AccessClaims, @Query(zod(QuerySchema)) q: z.infer<typeof QuerySchema>): Promise<SellerDashboard> {
    const sellerId = user.sub;
    const to = new Date();
    const from = new Date(to.getTime() - q.days * DAY);
    const prevFrom = new Date(from.getTime() - q.days * DAY);
    const seriesFrom = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()) - 13 * DAY);

    const [current, previous, held, payouts, ratingAgg, toShip, refundRequests, lowStock, outOfStock, recent] = await this.prisma.$transaction([
      this.prisma.order.aggregate({ where: { sellerId, status: { in: SALES }, placedAt: { gte: from, lt: to } }, _sum: { total: true }, _count: { _all: true } }),
      this.prisma.order.aggregate({ where: { sellerId, status: { in: SALES }, placedAt: { gte: prevFrom, lt: from } }, _sum: { total: true }, _count: { _all: true } }),
      this.prisma.order.aggregate({ where: { sellerId, escrowStatus: 'held', status: { in: SALES } }, _sum: { total: true } }),
      this.prisma.escrowLedger.aggregate({ where: { kind: 'release', order: { sellerId } }, _sum: { amount: true } }),
      this.prisma.product.aggregate({ where: { sellerId, published: true }, _sum: { ratingSum: true, ratingCount: true } }),
      this.prisma.order.count({ where: { sellerId, status: { in: ['paid', 'processing'] } } }),
      this.prisma.order.count({ where: { sellerId, status: { in: ['refund_requested', 'disputed'] } } }),
      this.prisma.product.count({ where: { sellerId, published: true, stock: { gt: 0, lt: LOW_STOCK_THRESHOLD } } }),
      this.prisma.product.count({ where: { sellerId, published: true, stock: 0 } }),
      this.prisma.order.findMany({ where: { sellerId, status: { in: SALES }, placedAt: { gte: seriesFrom } }, select: { total: true, placedAt: true } }),
    ]);

    const buckets = new Map<string, { gross: number; orders: number }>();
    for (let i = 0; i < 14; i++) buckets.set(dayKey(new Date(seriesFrom.getTime() + i * DAY)), { gross: 0, orders: 0 });
    for (const o of recent) {
      const b = buckets.get(dayKey(o.placedAt));
      if (b) { b.gross += o.total; b.orders += 1; }
    }

    const currency = 'USD';
    const cur = current._sum.total ?? 0;
    const prev = previous._sum.total ?? 0;
    const ratingCount = ratingAgg._sum.ratingCount ?? 0;
    return {
      currency,
      window: { from: from.toISOString(), to: to.toISOString(), days: q.days },
      gross: { current: money(cur, currency), previous: money(prev, currency) },
      orders: { current: current._count._all, previous: previous._count._all },
      averageOrder: {
        current: money(current._count._all ? Math.round(cur / current._count._all) : 0, currency),
        previous: money(previous._count._all ? Math.round(prev / previous._count._all) : 0, currency),
      },
      escrowHeld: money(held._sum.total ?? 0, currency),
      paidOut: money(payouts._sum.amount ?? 0, currency),
      rating: { average: ratingCount ? Math.round(((ratingAgg._sum.ratingSum ?? 0) / ratingCount) * 10) / 10 : 0, count: ratingCount },
      series: [...buckets.entries()].map(([date, v]) => ({ date, ...v })),
      attention: { toShip, refundRequests, lowStock, outOfStock },
    };
  }
}
