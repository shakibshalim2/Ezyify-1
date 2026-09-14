import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { TopupSchema, WalletService, WithdrawSchema } from './wallet.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { PageQuerySchema } from '../../common/pagination.js';

@ApiTags('wallet')
@Controller('wallet')
export class WalletController {
  constructor(private readonly wallet: WalletService) {}

  @Get()
  get(@CurrentUser() user: AccessClaims) {
    return this.wallet.get(user.sub);
  }

  @Get('transactions')
  transactions(@CurrentUser() user: AccessClaims, @Query(zod(PageQuerySchema)) q: z.infer<typeof PageQuerySchema>) {
    return this.wallet.transactions(user.sub, q);
  }

  @Post('topup')
  topup(@CurrentUser() user: AccessClaims, @Body(zod(TopupSchema)) body: z.infer<typeof TopupSchema>) {
    return this.wallet.topup(user.sub, body);
  }

  @Post('withdraw')
  withdraw(@CurrentUser() user: AccessClaims, @Body(zod(WithdrawSchema)) body: z.infer<typeof WithdrawSchema>) {
    return this.wallet.withdraw(user.sub, body);
  }
}
