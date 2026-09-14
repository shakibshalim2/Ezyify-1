import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { z } from 'zod';
import { CallTokenSchema, LiveService, LiveTokenSchema, type LiveTokenRequest } from './live.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';

@ApiTags('live')
@Controller('live')
export class LiveController {
  constructor(private readonly live: LiveService) {}

  @Post('token')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  token(@CurrentUser() user: AccessClaims, @Body(zod(LiveTokenSchema)) body: LiveTokenRequest) {
    return this.live.roomToken(user, body);
  }

  @Post('call-token')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  callToken(@CurrentUser() user: AccessClaims, @Body(zod(CallTokenSchema)) body: z.infer<typeof CallTokenSchema>) {
    return this.live.callToken(user, body.conversationId);
  }
}
