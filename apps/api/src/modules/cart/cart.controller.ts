import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { AddItemSchema, CartService, CouponSchema, UpdateItemSchema } from './cart.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';

@ApiTags('cart')
@Controller('cart')
export class CartController {
  constructor(private readonly cart: CartService) {}

  @Get()
  get(@CurrentUser() user: AccessClaims) {
    return this.cart.get(user.sub);
  }

  @Post('items')
  add(@CurrentUser() user: AccessClaims, @Body(zod(AddItemSchema)) body: z.infer<typeof AddItemSchema>) {
    return this.cart.add(user.sub, body);
  }

  @Patch('items/:productId')
  update(@CurrentUser() user: AccessClaims, @Param('productId') productId: string, @Body(zod(UpdateItemSchema)) body: z.infer<typeof UpdateItemSchema>) {
    return this.cart.update(user.sub, productId, body.quantity);
  }

  @Delete('items/:productId')
  remove(@CurrentUser() user: AccessClaims, @Param('productId') productId: string) {
    return this.cart.remove(user.sub, productId);
  }

  @Post('coupon')
  coupon(@CurrentUser() user: AccessClaims, @Body(zod(CouponSchema)) body: z.infer<typeof CouponSchema>) {
    return this.cart.applyCoupon(user.sub, body.code);
  }
}
