import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { Cart } from '@ezyify/core';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { notFound, validation } from '../../common/errors.js';
import { money } from '../../common/money.js';
import { productInclude, toProductSummary } from '../catalog/catalog.mapper.js';

export const AddItemSchema = z.object({ productId: z.string().min(1), quantity: z.number().int().min(1).max(99).default(1), variantId: z.string().min(1).optional() });
export const UpdateItemSchema = z.object({ quantity: z.number().int().min(0).max(99) });
export const CouponSchema = z.object({ code: z.string().min(1).max(32) });

const FREE_SHIPPING_OVER = 5000;
const FLAT_SHIPPING = 499;
/** Demo coupons until the promotions module lands. */
const COUPONS: Record<string, { pct?: number; flat?: number }> = { WELCOME10: { pct: 10 }, EZY5: { flat: 500 } };

export function priceCart(items: { unitPrice: number; quantity: number }[], couponCode: string | null) {
  const subtotal = items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
  const coupon = couponCode ? COUPONS[couponCode.toUpperCase()] : undefined;
  const discount = !coupon || subtotal === 0 ? 0 : Math.min(subtotal, coupon.flat ?? Math.round((subtotal * (coupon.pct ?? 0)) / 100));
  const shipping = subtotal === 0 || subtotal - discount >= FREE_SHIPPING_OVER ? 0 : FLAT_SHIPPING;
  return { subtotal, discount, shipping, total: subtotal - discount + shipping };
}

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string): Promise<Cart> {
    const cart = await this.ensure(userId);
    const rows = await this.prisma.cartItem.findMany({ where: { cartId: cart.id }, include: { product: { include: productInclude }, variant: true }, orderBy: { id: 'asc' } });
    const priced = rows.map(r => ({ row: r, unitPrice: r.variant?.price ?? r.product.price }));
    const totals = priceCart(priced.map(p => ({ unitPrice: p.unitPrice, quantity: p.row.quantity })), cart.couponCode);
    const currency = rows[0]?.product.currency ?? 'USD';
    return {
      items: rows.map(r => ({ productId: r.productId, variantId: r.variantId, quantity: r.quantity, product: toProductSummary(r.product) })),
      subtotal: money(totals.subtotal, currency),
      shipping: money(totals.shipping, currency),
      discount: money(totals.discount, currency),
      total: money(totals.total, currency),
      couponCode: cart.couponCode,
    };
  }

  async add(userId: string, body: z.infer<typeof AddItemSchema>) {
    const cart = await this.ensure(userId);
    const product = await this.prisma.product.findFirst({ where: { id: body.productId, published: true }, include: { variants: true } });
    if (!product) throw notFound('Product');
    const variant = body.variantId ? product.variants.find(v => v.id === body.variantId) : undefined;
    if (body.variantId && !variant) throw notFound('Variant');
    const stock = variant ? variant.stock : product.stock;
    const existing = await this.prisma.cartItem.findFirst({ where: { cartId: cart.id, productId: product.id, variantId: variant?.id ?? null } });
    const nextQty = (existing?.quantity ?? 0) + body.quantity;
    if (nextQty > stock) throw validation({ quantity: `Only ${stock} left in stock` });
    if (existing) await this.prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: nextQty } });
    else await this.prisma.cartItem.create({ data: { cartId: cart.id, productId: product.id, variantId: variant?.id ?? null, quantity: body.quantity } });
    return this.get(userId);
  }

  async update(userId: string, productId: string, quantity: number, variantId?: string) {
    const cart = await this.ensure(userId);
    const where = { cartId: cart.id, productId, ...(variantId ? { variantId } : {}) };
    if (quantity === 0) await this.prisma.cartItem.deleteMany({ where });
    else await this.prisma.cartItem.updateMany({ where, data: { quantity } });
    return this.get(userId);
  }

  async remove(userId: string, productId: string) {
    const cart = await this.ensure(userId);
    await this.prisma.cartItem.deleteMany({ where: { cartId: cart.id, productId } });
    return this.get(userId);
  }

  async applyCoupon(userId: string, code: string) {
    if (!COUPONS[code.toUpperCase()]) throw validation({ code: 'That coupon is not valid' });
    const cart = await this.ensure(userId);
    await this.prisma.cart.update({ where: { id: cart.id }, data: { couponCode: code.toUpperCase() } });
    return this.get(userId);
  }

  async clear(userId: string) {
    const cart = await this.ensure(userId);
    await this.prisma.$transaction([this.prisma.cartItem.deleteMany({ where: { cartId: cart.id } }), this.prisma.cart.update({ where: { id: cart.id }, data: { couponCode: null } })]);
  }

  private ensure(userId: string) {
    return this.prisma.cart.upsert({ where: { userId }, create: { userId }, update: {} });
  }
}
