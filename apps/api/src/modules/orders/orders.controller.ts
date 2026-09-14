import { Body, Controller, Get, Headers, Param, Post, Query } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { CheckoutRequestSchema, type CheckoutRequest } from '@ezyify/core';
import { OrderQuerySchema, OrdersService, RefundSchema, ShipSchema } from './orders.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';

@ApiTags('orders')
@Controller()
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Post('checkout')
  @ApiHeader({ name: 'Idempotency-Key', required: false })
  checkout(@CurrentUser() user: AccessClaims, @Body(zod(CheckoutRequestSchema)) body: CheckoutRequest, @Headers('idempotency-key') key?: string) {
    return this.orders.checkout(user.sub, body, key);
  }

  @Get('orders')
  list(@CurrentUser() user: AccessClaims, @Query(zod(OrderQuerySchema)) q: z.infer<typeof OrderQuerySchema>) {
    return this.orders.list(user.sub, q);
  }

  @Get('orders/:id')
  get(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.orders.get(user.sub, id, user.role);
  }

  @Get('orders/:id/timeline')
  timeline(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.orders.timeline(user.sub, id, user.role);
  }

  @Post('orders/:id/confirm-delivery')
  confirm(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.orders.confirmDelivery(user.sub, id);
  }

  @Post('orders/:id/refund')
  refund(@CurrentUser() user: AccessClaims, @Param('id') id: string, @Body(zod(RefundSchema)) body: z.infer<typeof RefundSchema>) {
    return this.orders.requestRefund(user.sub, id, body);
  }

  @Post('orders/:id/cancel')
  cancel(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    const actor = user.role === 'admin' || user.role === 'superadmin' ? 'admin' : 'buyer';
    return this.orders.setStatus(user.sub, id, 'cancelled', actor, 'Cancelled by buyer');
  }

  // Seller side
  @Post('seller/orders/:id/accept')
  @Roles('seller')
  accept(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.orders.setStatus(user.sub, id, 'processing', 'seller', 'Seller is preparing the order');
  }

  @Post('seller/orders/:id/ship')
  @Roles('seller')
  ship(@CurrentUser() user: AccessClaims, @Param('id') id: string, @Body(zod(ShipSchema)) body: z.infer<typeof ShipSchema>) {
    return this.orders.ship(user.sub, id, body);
  }

  @Post('seller/orders/:id/deliver')
  @Roles('seller')
  deliver(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.orders.setStatus(user.sub, id, 'delivered', 'seller', 'Marked delivered by seller');
  }

  @Post('seller/orders/:id/refund')
  @Roles('seller')
  approveRefund(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.orders.setStatus(user.sub, id, 'refunded', 'seller', 'Refund approved by seller');
  }
}
