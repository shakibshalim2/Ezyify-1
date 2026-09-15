import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { z } from 'zod';
import { CallTokenSchema, LiveService, LiveTokenSchema, type LiveTokenRequest } from './live.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Public, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { CreateLiveSessionSchema, LiveHeartbeatSchema, LiveSessionsQuerySchema, LiveSessionsService, PinLiveSessionSchema } from './live-sessions.service.js';

@ApiTags('live')
@Controller('live')
export class LiveController {
  constructor(private readonly live: LiveService, private readonly sessions: LiveSessionsService) {}

  @Get('sessions')
  @Public()
  sessionsList(@Query(zod(LiveSessionsQuerySchema)) query: z.infer<typeof LiveSessionsQuerySchema>) {
    return this.sessions.list(query);
  }

  @Get('sessions/:id')
  @Public()
  session(@Param('id') id: string) {
    return this.sessions.get(id);
  }

  @Post('sessions')
  create(@CurrentUser() user: AccessClaims, @Body(zod(CreateLiveSessionSchema)) body: z.infer<typeof CreateLiveSessionSchema>) {
    return this.sessions.create(user, body);
  }

  @Post('sessions/:id/start')
  start(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.sessions.start(user, id);
  }

  @Post('sessions/:id/end')
  end(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.sessions.end(user, id);
  }

  @Post('sessions/:id/pin')
  pin(@CurrentUser() user: AccessClaims, @Param('id') id: string, @Body(zod(PinLiveSessionSchema)) body: z.infer<typeof PinLiveSessionSchema>) {
    return this.sessions.pin(user, id, body.productId);
  }

  @Post('sessions/:id/heartbeat')
  @Throttle({ default: { limit: 60, ttl: 60_000 } })
  heartbeat(@CurrentUser() user: AccessClaims, @Param('id') id: string, @Body(zod(LiveHeartbeatSchema)) body: z.infer<typeof LiveHeartbeatSchema>) {
    return this.sessions.heartbeat(user, id, body.like);
  }

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
