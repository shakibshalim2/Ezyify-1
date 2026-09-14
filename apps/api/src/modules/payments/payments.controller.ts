import { Body, Controller, Headers, HttpCode, Post, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import type { FastifyRequest } from 'fastify';
import { z } from 'zod';
import { PaymentsService } from './payments.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Public, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { raw } from '../../common/envelope.interceptor.js';

const TopupIntent = z.object({ amount: z.number().int().min(100).max(1_000_000), currency: z.enum(['USD', 'IDR', 'EUR', 'GBP']).default('USD') });
const OrderIntent = z.object({ orderIds: z.array(z.string().min(1)).min(1).max(20) });

@ApiTags('payments')
@Controller('payments')
export class PaymentsController {
  constructor(private readonly payments: PaymentsService) {}

  @Post('topup-intent')
  topup(@CurrentUser() user: AccessClaims, @Body(zod(TopupIntent)) body: z.infer<typeof TopupIntent>, @Headers('idempotency-key') key?: string) {
    return this.payments.createTopupIntent(user.sub, body.amount, body.currency, key);
  }

  @Post('order-intent')
  order(@CurrentUser() user: AccessClaims, @Body(zod(OrderIntent)) body: z.infer<typeof OrderIntent>, @Headers('idempotency-key') key?: string) {
    return this.payments.createOrderIntent(user.sub, body.orderIds, key);
  }

  /** Stripe → us. Unauthenticated by design; trust comes from the signature over the raw body. */
  @Post('webhooks/stripe')
  @Public()
  @SkipThrottle()
  @HttpCode(200)
  async stripe(@Req() req: FastifyRequest & { rawBody?: Buffer }, @Headers('stripe-signature') signature?: string) {
    return raw(await this.payments.handleWebhook(req.rawBody ?? JSON.stringify(req.body), signature, req.ip));
  }
}
