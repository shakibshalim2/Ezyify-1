import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { z } from 'zod';
import { ShipOrderRequestSchema, type CheckoutRequest, type SellerOrdersSummary } from '@ezyify/core';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { ENV, type Env } from '../../config.js';
import { ApiException, forbidden, notFound, validation } from '../../common/errors.js';
import { PageQuerySchema, page, skipTake } from '../../common/pagination.js';
import { bps } from '../../common/money.js';
import type { OrderStatus } from '../../generated/prisma/enums.js';
import type { Prisma } from '../../generated/prisma/client.js';
import { priceCart } from '../cart/cart.service.js';
import { WalletService } from '../wallet/wallet.service.js';
import { actorMay, canTransition, ESCROW_FOR_STATUS, type Actor } from './escrow.js';
import { orderInclude, toOrder } from './orders.mapper.js';

export const OrderQuerySchema = PageQuerySchema.extend({ status: z.string().optional(), role: z.enum(['buyer', 'seller']).default('buyer') });
export const RefundSchema = z.object({ reason: z.string().min(3).max(500), itemIds: z.array(z.string()).default([]) });
export const ShipSchema = ShipOrderRequestSchema;

const orderNumber = () => `EZ-${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;

@Injectable()
export class OrdersService {
  private readonly log = new Logger(OrdersService.name);
  constructor(private readonly prisma: PrismaService, private readonly wallet: WalletService, @Inject(ENV) private readonly env: Env) {}

  /**
   * Checkout fans the cart out into one order per seller, charges once (wallet debits immediately;
   * other methods stay `pending_payment` until the processor webhook confirms) and holds funds in escrow.
   * `Idempotency-Key` makes retries safe.
   */
  async checkout(userId: string, body: CheckoutRequest, idempotencyKey?: string) {
    if (idempotencyKey) {
      const prior = await this.prisma.order.findMany({ where: { buyerId: userId, idempotencyKey: { startsWith: `${idempotencyKey}:` } }, include: orderInclude });
      if (prior.length) return prior.map(toOrder);
    }
    const address = await this.prisma.address.findFirst({ where: { id: body.addressId, userId } });
    if (!address) throw notFound('Address');
    const cartRow = await this.prisma.cart.findUnique({ where: { userId }, include: { items: { include: { product: true, variant: true } } } });
    if (!cartRow || cartRow.items.length === 0) throw validation({ cart: 'Your cart is empty' });

    const bySeller = new Map<string, typeof cartRow.items>();
    for (const item of cartRow.items) {
      if (!item.product.published) throw validation({ cart: `${item.product.name} is no longer available` });
      const stock = item.variant?.stock ?? item.product.stock;
      if (item.quantity > stock) throw validation({ cart: `Only ${stock} of ${item.product.name} left` });
      bySeller.set(item.product.sellerId, [...(bySeller.get(item.product.sellerId) ?? []), item]);
    }
    const currency = cartRow.items[0].product.currency;
    const unit = (i: (typeof cartRow.items)[number]) => i.variant?.price ?? i.product.price;
    const grand = priceCart(cartRow.items.map(i => ({ unitPrice: unit(i), quantity: i.quantity })), body.couponCode ?? cartRow.couponCode);
    const paidNow = body.paymentMethod === 'wallet';
    const autoReleaseAt = new Date(Date.now() + this.env.ESCROW_AUTO_RELEASE_DAYS * 86_400_000);

    const created = await this.prisma.$transaction(async tx => {
      if (paidNow) await this.wallet.debit(userId, grand.total, currency, 'purchase', 'Order payment', idempotencyKey ? `${idempotencyKey}:pay` : undefined, tx);
      const orders = [];
      let sellerIndex = 0;
      for (const [sellerId, items] of bySeller) {
        const sub = items.reduce((n, i) => n + unit(i) * i.quantity, 0);
        // Discount + shipping split proportionally across seller orders so the sum equals the charged total.
        const share = grand.subtotal ? sub / grand.subtotal : 0;
        const discount = Math.round(grand.discount * share);
        const shipping = Math.round(grand.shipping * share);
        const total = sub - discount + shipping;
        const status: OrderStatus = paidNow ? 'paid' : 'pending_payment';
        const order = await tx.order.create({
          data: {
            orderNumber: orderNumber(),
            buyerId: userId,
            sellerId,
            addressId: address.id,
            status,
            paymentMethod: body.paymentMethod,
            currency,
            subtotal: sub,
            shipping,
            discount,
            total,
            escrowStatus: 'held',
            autoReleaseAt: paidNow ? autoReleaseAt : null,
            note: body.note,
            idempotencyKey: idempotencyKey ? `${idempotencyKey}:${sellerIndex++}` : null,
            paidAt: paidNow ? new Date() : null,
            items: { create: items.map(i => ({ productId: i.productId, name: i.product.name, imageUrl: i.product.images[0] ?? '', variant: i.variant?.name ?? null, quantity: i.quantity, unitPrice: unit(i) })) },
            events: { create: [{ status: 'pending_payment', note: 'Order placed' }, ...(paidNow ? [{ status: 'paid' as OrderStatus, note: 'Paid from wallet · funds held in escrow' }] : [])] },
            ledger: paidNow ? { create: { kind: 'hold', amount: total, currency, note: 'Buyer payment held' } } : undefined,
          },
          include: orderInclude,
        });
        for (const i of items) {
          if (i.variantId) await tx.productVariant.update({ where: { id: i.variantId }, data: { stock: { decrement: i.quantity } } });
          else await tx.product.update({ where: { id: i.productId }, data: { stock: { decrement: i.quantity } } });
          await tx.product.update({ where: { id: i.productId }, data: { soldCount: { increment: i.quantity } } });
        }
        await tx.notification.create({ data: { recipientId: sellerId, actorId: userId, type: 'purchase', message: `New order ${order.orderNumber} · ${items.length} item${items.length > 1 ? 's' : ''}`, href: `/seller/orders/${order.id}` } });
        orders.push(order);
      }
      await tx.cartItem.deleteMany({ where: { cartId: cartRow.id } });
      await tx.cart.update({ where: { id: cartRow.id }, data: { couponCode: null } });
      return orders;
    });
    return created.map(toOrder);
  }

  async list(userId: string, q: z.infer<typeof OrderQuerySchema>) {
    const where: Prisma.OrderWhereInput = { ...(q.role === 'seller' ? { sellerId: userId } : { buyerId: userId }), ...(q.status ? { status: q.status as OrderStatus } : {}) };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.order.findMany({ where, include: orderInclude, orderBy: { placedAt: 'desc' }, ...skipTake(q) }),
      this.prisma.order.count({ where }),
    ]);
    return page(rows.map(toOrder), total, q);
  }

  async sellerSummary(sellerId: string): Promise<SellerOrdersSummary> {
    const rows = await this.prisma.order.groupBy({ by: ['status'], where: { sellerId }, _count: { _all: true } });
    const n = (...st: OrderStatus[]) => rows.filter(r => st.includes(r.status)).reduce((a, r) => a + r._count._all, 0);
    return {
      total: rows.reduce((a, r) => a + r._count._all, 0),
      needsAction: n('paid', 'processing', 'refund_requested'),
      toShip: n('paid', 'processing'),
      inTransit: n('shipped', 'out_for_delivery', 'delivered'),
      completed: n('completed'),
      refunds: n('refund_requested', 'refunded', 'disputed', 'cancelled'),
    };
  }

  async get(userId: string, id: string, role: string) {
    const o = await this.prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!o) throw notFound('Order');
    if (o.buyerId !== userId && o.sellerId !== userId && !['admin', 'superadmin'].includes(role)) throw forbidden();
    return toOrder(o);
  }

  async timeline(userId: string, id: string, role: string) {
    await this.get(userId, id, role);
    const events = await this.prisma.orderEvent.findMany({ where: { orderId: id }, orderBy: { at: 'asc' } });
    return events.map(e => ({ status: e.status, at: e.at.toISOString(), note: e.note }));
  }

  /** Buyer confirms delivery → escrow released to seller wallet minus platform fee. */
  confirmDelivery(userId: string, id: string) {
    return this.transition(id, 'completed', 'buyer', userId, 'Buyer confirmed delivery · escrow released');
  }

  async requestRefund(userId: string, id: string, body: z.infer<typeof RefundSchema>) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw notFound('Order');
    if (order.buyerId !== userId) throw forbidden();
    await this.prisma.refundRequest.create({ data: { orderId: id, reason: body.reason, itemIds: body.itemIds } });
    return this.transition(id, 'refund_requested', 'buyer', userId, body.reason);
  }

  async ship(sellerId: string, id: string, body: z.infer<typeof ShipSchema>) {
    const owned = await this.prisma.order.findFirst({ where: { id, sellerId }, select: { id: true } });
    if (!owned) throw forbidden();
    await this.prisma.order.update({ where: { id }, data: { trackingCarrier: body.carrier, trackingNumber: body.number, trackingUrl: body.url ?? null } });
    return this.transition(id, 'shipped', 'seller', sellerId, `Shipped via ${body.carrier}`);
  }

  setStatus(actorId: string, id: string, status: OrderStatus, actor: Actor, note?: string) {
    return this.transition(id, status, actor, actorId, note ?? null);
  }

  /** Single choke point for every status change: state machine, actor permission, escrow side-effects, audit trail. */
  async transition(id: string, to: OrderStatus, actor: Actor, actorId: string, note: string | null) {
    const order = await this.prisma.order.findUnique({ where: { id }, include: orderInclude });
    if (!order) throw notFound('Order');
    if (actor === 'buyer' && order.buyerId !== actorId) throw forbidden();
    if (actor === 'seller' && order.sellerId !== actorId) throw forbidden();
    if (!actorMay(actor, to)) throw forbidden(`A ${actor} cannot move an order to ${to}`);
    if (!canTransition(order.status, to)) throw new ApiException('CONFLICT', `Cannot go from ${order.status} to ${to}`);

    const escrow = ESCROW_FOR_STATUS[to] ?? order.escrowStatus;
    const now = new Date();
    const updated = await this.prisma.$transaction(async tx => {
      if (to === 'completed' && order.escrowStatus === 'held') {
        const fee = bps(order.total, this.env.PLATFORM_FEE_BPS);
        await tx.escrowLedger.createMany({
          data: [
            { orderId: id, kind: 'commission', amount: fee, currency: order.currency, note: 'Platform fee' },
            { orderId: id, kind: 'release', amount: order.total - fee, currency: order.currency, note: 'Released to seller' },
          ],
        });
        await this.wallet.credit(order.sellerId, order.total - fee, order.currency, 'commission', `Payout · ${order.orderNumber}`, `${id}:release`, tx);
      }
      if ((to === 'refunded' || to === 'cancelled') && order.escrowStatus === 'held' && order.paidAt) {
        await tx.escrowLedger.create({ data: { orderId: id, kind: 'refund', amount: order.total, currency: order.currency, note: 'Refunded to buyer' } });
        await this.wallet.credit(order.buyerId, order.total, order.currency, 'refund', `Refund · ${order.orderNumber}`, `${id}:refund`, tx);
        for (const i of order.items) await tx.product.update({ where: { id: i.productId }, data: { stock: { increment: i.quantity }, soldCount: { decrement: i.quantity } } });
      }
      const row = await tx.order.update({
        where: { id },
        data: {
          status: to,
          escrowStatus: escrow,
          ...(to === 'paid' ? { paidAt: now, autoReleaseAt: new Date(now.getTime() + this.env.ESCROW_AUTO_RELEASE_DAYS * 86_400_000) } : {}),
          ...(to === 'delivered' ? { deliveredAt: now } : {}),
          ...(to === 'completed' ? { completedAt: now, autoReleaseAt: null } : {}),
          events: { create: { status: to, note } },
        },
        include: orderInclude,
      });
      const recipient = actor === 'buyer' ? order.sellerId : order.buyerId;
      await tx.notification.create({ data: { recipientId: recipient, actorId: actor === 'system' ? null : actorId, type: 'order', message: `${order.orderNumber} · ${to.replace(/_/g, ' ')}`, href: `/orders/${id}` } });
      return row;
    });
    return toOrder(updated);
  }

  /** Escrow auto-release: delivered orders the buyer hasn't confirmed within N days complete automatically. */
  @Cron(CronExpression.EVERY_HOUR)
  async autoRelease() {
    const due = await this.prisma.order.findMany({ where: { status: 'delivered', escrowStatus: 'held', autoReleaseAt: { lte: new Date() } }, select: { id: true } });
    for (const o of due) {
      try {
        await this.transition(o.id, 'completed', 'system', 'system', 'Auto-released after hold period');
      } catch (e) {
        this.log.warn(`auto-release failed for ${o.id}: ${(e as Error).message}`);
      }
    }
    if (due.length) this.log.log(`auto-released ${due.length} order(s)`);
    return due.length;
  }

  /** Stories expire after 24 h; soft-deleted users are purged after 30 d. */
  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async housekeeping() {
    await this.prisma.post.updateMany({ where: { kind: 'story', expiresAt: { lte: new Date() }, deletedAt: null }, data: { deletedAt: new Date() } });
    await this.prisma.user.deleteMany({ where: { deletedAt: { lte: new Date(Date.now() - 30 * 86_400_000) } } });
  }
}
