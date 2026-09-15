import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import type { SellerAnalytics } from '@ezyify/core';
import type { OrderStatus, PaymentMethod } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { money } from '../../common/money.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';

const QuerySchema = z.object({ days: z.coerce.number().int().min(7).max(90).default(30) });
const SALES: OrderStatus[] = ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed'];
const DAY = 86_400_000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const share = (part: number, whole: number) => (whole ? Math.round((part / whole) * 1000) / 1000 : 0);

@ApiTags('seller')
@Controller('seller/analytics')
export class SellerAnalyticsController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @Roles('seller', 'admin')
  async get(@CurrentUser() user: AccessClaims, @Query(zod(QuerySchema)) q: z.infer<typeof QuerySchema>): Promise<SellerAnalytics> {
    const sellerId = user.sub;
    const to = new Date();
    const from = new Date(Date.UTC(to.getUTCFullYear(), to.getUTCMonth(), to.getUTCDate()) - (q.days - 1) * DAY);

    // One pass over the window's orders; every figure below derives from this set so numbers always reconcile.
    const orders = await this.prisma.order.findMany({
      where: { sellerId, placedAt: { gte: from, lte: to } },
      select: {
        id: true, status: true, buyerId: true, total: true, paymentMethod: true, placedAt: true,
        items: { select: { productId: true, quantity: true, unitPrice: true, product: { select: { name: true, images: true, category: { select: { name: true } } } } } },
        events: { where: { status: { in: ['paid', 'shipped'] } }, select: { status: true, at: true }, orderBy: { at: 'asc' } },
      },
    });
    const sales = orders.filter(o => SALES.includes(o.status));
    const currency = 'USD';

    const buckets = new Map<string, { gross: number; orders: number; units: number }>();
    for (let i = 0; i < q.days; i++) buckets.set(dayKey(new Date(from.getTime() + i * DAY)), { gross: 0, orders: 0, units: 0 });
    const byProduct = new Map<string, { name: string; imageUrl: string; units: number; orders: number; gross: number }>();
    const byCategory = new Map<string, { gross: number; units: number }>();
    const byBuyer = new Map<string, number>();
    const byMethod = new Map<PaymentMethod, number>();
    let gross = 0, units = 0;

    for (const o of sales) {
      gross += o.total;
      byBuyer.set(o.buyerId, (byBuyer.get(o.buyerId) ?? 0) + 1);
      byMethod.set(o.paymentMethod, (byMethod.get(o.paymentMethod) ?? 0) + 1);
      const b = buckets.get(dayKey(o.placedAt));
      if (b) { b.gross += o.total; b.orders += 1; }
      for (const it of o.items) {
        const line = it.unitPrice * it.quantity;
        units += it.quantity;
        if (b) b.units += it.quantity;
        const p = byProduct.get(it.productId) ?? { name: it.product.name, imageUrl: it.product.images[0] ?? '', units: 0, orders: 0, gross: 0 };
        p.units += it.quantity; p.orders += 1; p.gross += line;
        byProduct.set(it.productId, p);
        const c = byCategory.get(it.product.category.name) ?? { gross: 0, units: 0 };
        c.gross += line; c.units += it.quantity;
        byCategory.set(it.product.category.name, c);
      }
    }
    const lineGross = [...byProduct.values()].reduce((n, p) => n + p.gross, 0);

    // Fulfilment: paid → shipped latency for orders that shipped in the window.
    const latencies = sales.flatMap(o => {
      const paid = o.events.find(e => e.status === 'paid')?.at;
      const shipped = o.events.find(e => e.status === 'shipped')?.at;
      return paid && shipped ? [(shipped.getTime() - paid.getTime()) / 3_600_000] : [];
    });
    const count = (...st: OrderStatus[]) => orders.filter(o => st.includes(o.status)).length;
    const decided = orders.filter(o => o.status !== 'pending_payment').length;

    // Buyers who had any earlier order with this seller are "repeat"; the rest are first‑time in this window.
    const buyers = [...byBuyer.keys()];
    const earlier = buyers.length
      ? await this.prisma.order.groupBy({ by: ['buyerId'], where: { sellerId, buyerId: { in: buyers }, status: { in: SALES }, placedAt: { lt: from } }, _count: { _all: true } })
      : [];
    const earlierSet = new Set(earlier.map(e => e.buyerId));
    const repeat = buyers.filter(b => earlierSet.has(b) || (byBuyer.get(b) ?? 0) > 1).length;

    return {
      currency,
      window: { from: from.toISOString(), to: to.toISOString(), days: q.days },
      totals: { gross: money(gross, currency), orders: sales.length, units, averageOrder: money(sales.length ? Math.round(gross / sales.length) : 0, currency) },
      series: [...buckets.entries()].map(([date, v]) => ({ date, ...v })),
      topProducts: [...byProduct.entries()]
        .sort((a, b) => b[1].gross - a[1].gross)
        .slice(0, 8)
        .map(([id, p]) => ({ id, name: p.name, imageUrl: p.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800', units: p.units, orders: p.orders, gross: money(p.gross, currency), share: share(p.gross, lineGross) })),
      categories: [...byCategory.entries()]
        .sort((a, b) => b[1].gross - a[1].gross)
        .map(([name, c]) => ({ name, gross: money(c.gross, currency), units: c.units, share: share(c.gross, lineGross) })),
      customers: { unique: buyers.length, repeat, firstTime: buyers.length - repeat },
      fulfillment: {
        avgHoursToShip: latencies.length ? Math.round((latencies.reduce((n, h) => n + h, 0) / latencies.length) * 10) / 10 : null,
        completionRate: share(count('completed'), decided),
        refundRate: share(count('refund_requested', 'refunded', 'disputed'), decided),
        cancelRate: share(count('cancelled'), decided),
      },
      paymentMix: [...byMethod.entries()].sort((a, b) => b[1] - a[1]).map(([method, n]) => ({ method, orders: n, share: share(n, sales.length) })),
    };
  }
}
