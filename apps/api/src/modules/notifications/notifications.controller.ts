import { Body, Controller, Delete, Get, Param, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import type { z } from 'zod';
import { RegisterDeviceRequestSchema, type RegisterDeviceRequest } from '@ezyify/core';
import { NotificationsService } from './notifications.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { PageQuerySchema } from '../../common/pagination.js';

@ApiTags('notifications')
@Controller()
export class NotificationsController {
  constructor(private readonly notifications: NotificationsService) {}

  @Get('notifications')
  list(@CurrentUser() user: AccessClaims, @Query(zod(PageQuerySchema)) q: z.infer<typeof PageQuerySchema>) {
    return this.notifications.list(user.sub, q);
  }

  @Get('notifications/unread-count')
  unread(@CurrentUser() user: AccessClaims) {
    return this.notifications.unreadCount(user.sub);
  }

  @Post('notifications/read-all')
  readAll(@CurrentUser() user: AccessClaims) {
    return this.notifications.markAllRead(user.sub);
  }

  @Post('notifications/:id/read')
  read(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    return this.notifications.markRead(user.sub, id);
  }

  @Post('devices')
  register(@CurrentUser() user: AccessClaims, @Body(zod(RegisterDeviceRequestSchema)) body: RegisterDeviceRequest) {
    return this.notifications.registerDevice(user.sub, body);
  }

  @Delete('devices/:token')
  unregister(@CurrentUser() user: AccessClaims, @Param('token') token: string) {
    return this.notifications.unregisterDevice(user.sub, token);
  }
}
