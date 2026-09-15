import type { Order } from '@ezyify/core';
import type { Prisma } from '../../generated/prisma/client.js';
import { money } from '../../common/money.js';
import { toUserSummary } from '../users/users.mapper.js';

export const orderInclude = { items: true, seller: true, buyer: true, address: { select: { recipient: true, city: true, region: true, country: true } } } satisfies Prisma.OrderInclude;
type OrderRow = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

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
    placedAt: o.placedAt.toISOString(),
    deliveredAt: o.deliveredAt?.toISOString() ?? null,
  };
}
