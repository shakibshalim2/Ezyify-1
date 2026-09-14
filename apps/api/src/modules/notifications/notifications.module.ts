import { Module } from '@nestjs/common';
import { NotificationsController } from './notifications.controller.js';
import { NotificationsService } from './notifications.service.js';
import { FCM_TRANSPORT, FcmProvider } from './fcm.provider.js';

@Module({ controllers: [NotificationsController], providers: [NotificationsService, { provide: FCM_TRANSPORT, useClass: FcmProvider }], exports: [NotificationsService] })
export class NotificationsModule {}
