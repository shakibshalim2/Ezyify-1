import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type { SellerCustomer, SellerCustomersResponse } from '@ezyify/core';
import type { OrderStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { PageQuerySchema } from '../../common/pagination.js';
import { money } from '../../common/money.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { toUserSummary } from '../users/users.mapper.js';

const QuerySchema = PageQuerySchema.extend({
  q: z.string().max(100).optional(),
  sort: z.enum(['recent', 'spent', 'orders']).default('recent'),
});
const SALES: OrderStatus[] = ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed'];
const OPEN: OrderStatus[] = ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'refund_requested', 'disputed'];

/** Buyers aggregated from the seller's orders. Deliberately exposes only the public user summary + shipping city. */
@ApiTags('seller')
@Controller('seller/customers')
export class SellerCustomersController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('seller', 'admin')
  async list(@CurrentUser() user: AccessClaims, @Query(zod(QuerySchema)) q: z.infer<typeof QuerySchema>): Promise<SellerCustomersResponse> {
    const sellerId = user.sub;
    const [groups, recentRows] = await Promise.all([
      this.prisma.order.groupBy({
        by: ['buyerId'],
        where: { sellerId, status: { in: SALES } },
        _count: { _all: true },
        _sum: { total: true },
        _min: { placedAt: true },
        _max: { placedAt: true },
      }),
      // Latest order per buyer supplies the shipping snapshot; ordered desc so the first hit per buyer wins.
      this.prisma.order.findMany({
        where: { sellerId, status: { in: SALES } },
        orderBy: { placedAt: 'desc' },
        select: { buyerId: true, address: { select: { city: true, country: true } } },
      }),
    ]);
    const buyerIds = groups.map(g => g.buyerId);
    const [users, open] = await Promise.all([
      this.prisma.user.findMany({ where: { id: { in: buyerIds } }, select: { id: true, username: true, name: true, avatarUrl: true, verified: true, role: true } }),
      this.prisma.order.groupBy({ by: ['buyerId'], where: { sellerId, status: { in: OPEN } }, _count: { _all: true } }),
    ]);
    const userById = new Map(users.map(u => [u.id, u]));
    const openById = new Map(open.map(o => [o.buyerId, o._count._all]));
    const lastShip = new Map<string, { city: string; country: string }>();
    for (const r of recentRows) if (!lastShip.has(r.buyerId)) lastShip.set(r.buyerId, r.address);

    const currency = 'USD';
    let all: SellerCustomer[] = groups.flatMap(g => {
      const u = userById.get(g.buyerId);
      if (!u) return [];
      return [{
        user: toUserSummary(u),
        orders: g._count._all,
        spent: money(g._sum.total ?? 0, currency),
        firstOrderAt: (g._min.placedAt ?? new Date()).toISOString(),
        lastOrderAt: (g._max.placedAt ?? new Date()).toISOString(),
        lastShippedTo: lastShip.get(g.buyerId) ?? null,
        openOrders: openById.get(g.buyerId) ?? 0,
      }];
    });

    const totalSpent = all.reduce((n, c) => n + c.spent.amount, 0);
    const totalOrders = all.reduce((n, c) => n + c.orders, 0);
    const summary = {
      total: all.length,
      repeat: all.filter(c => c.orders > 1).length,
      averageOrder: money(totalOrders ? Math.round(totalSpent / totalOrders) : 0, currency),
      averageLifetime: money(all.length ? Math.round(totalSpent / all.length) : 0, currency),
    };

    if (q.q) {
      const needle = q.q.toLowerCase();
      all = all.filter(c => c.user.name.toLowerCase().includes(needle) || c.user.username.toLowerCase().includes(needle));
    }
    all.sort((a, b) => (q.sort === 'spent' ? b.spent.amount - a.spent.amount : q.sort === 'orders' ? b.orders - a.orders : +new Date(b.lastOrderAt) - +new Date(a.lastOrderAt)));
    const start = (q.page - 1) * q.pageSize;
    return {
      items: all.slice(start, start + q.pageSize),
      pagination: { page: q.page, pageSize: q.pageSize, total: all.length, hasMore: start + q.pageSize < all.length },
      summary,
    };
  }
}
