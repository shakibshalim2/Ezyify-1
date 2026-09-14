import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { MessagingService, SendMessageSchema, StartConversationSchema } from './messaging.service.js';
import { ChatGateway } from './chat.gateway.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { PageQuerySchema } from '../../common/pagination.js';

@ApiTags('messaging')
@Controller('conversations')
export class MessagingController {
  constructor(private readonly messaging: MessagingService, private readonly gateway: ChatGateway) {}

  @Get()
  list(@CurrentUser() user: AccessClaims) {
    return this.messaging.conversations(user.sub);
  }

  @Post()
  start(@CurrentUser() user: AccessClaims, @Body(zod(StartConversationSchema)) body: z.infer<typeof StartConversationSchema>) {
    return this.messaging.start(user.sub, body.username);
  }

  @Get(':id/messages')
  messages(@CurrentUser() user: AccessClaims, @Param('id') id: string, @Query(zod(PageQuerySchema)) q: z.infer<typeof PageQuerySchema>) {
    return this.messaging.messages(user.sub, id, q);
  }

  @Post(':id/messages')
  async send(@CurrentUser() user: AccessClaims, @Param('id') id: string, @Body(zod(SendMessageSchema)) body: z.infer<typeof SendMessageSchema>) {
    const message = await this.messaging.send(user.sub, id, body);
    const recipients = await this.messaging.recipients(id, user.sub);
    this.gateway.emitToUsers(recipients, 'message:new', message);
    return message;
  }
}
