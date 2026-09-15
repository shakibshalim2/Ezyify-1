import type { Order, RefundCase } from '@ezyify/core';
import type { Prisma } from '../../generated/prisma/client.js';
import { money } from '../../common/money.js';
import { toUserSummary } from '../users/users.mapper.js';

export const orderInclude = { items: true, seller: true, buyer: true, address: { select: { recipient: true, city: true, region: true, country: true } }, refunds: { orderBy: { createdAt: 'desc' }, take: 1 } } satisfies Prisma.OrderInclude;
type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

type RefundRow = OrderRow['refunds'][number];
const toRefundCase = (r: RefundRow): RefundCase => ({
  id: r.id, status: r.status as RefundCase['status'], reason: r.reason, itemIds: r.itemIds, sellerResponse: r.sellerResponse, disputeReason: r.disputeReason, resolution: r.resolution,
  requestedAt: r.createdAt.toISOString(), resolvedAt: r.resolvedAt?.toISOString() ?? null,
});

export function toOrder(o: OrderRow): Order {
  return {
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    escrow: { status: o.escrowStatus, autoReleaseAt: o.autoReleaseAt?.toISOString() ?? null },
    seller: toUserSummary(o.seller),
    buyer: toUserSummary(o.buyer),
    shippingTo: { recipient: o.address.recipient, city: o.address.city, region: o.address.region ?? null, country: o.address.country },
    paymentMethod: o.paymentMethod,
    note: o.note ?? null,
    items: o.items.map(i => ({ id: i.id, productId: i.productId, name: i.name, imageUrl: i.imageUrl, variant: i.variant, quantity: i.quantity, unitPrice: money(i.unitPrice, o.currency) })),
    subtotal: money(o.subtotal, o.currency),
    shipping: money(o.shipping, o.currency),
    total: money(o.total, o.currency),
    tracking: o.trackingNumber ? { carrier: o.trackingCarrier ?? 'Courier', number: o.trackingNumber, url: o.trackingUrl } : null,
    refund: o.refunds[0] ? toRefundCase(o.refunds[0]) : null,
    placedAt: o.placedAt.toISOString(),
    deliveredAt: o.deliveredAt?.toISOString() ?? null,
  };
}
