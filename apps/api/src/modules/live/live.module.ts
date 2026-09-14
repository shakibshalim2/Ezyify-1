import { Module } from '@nestjs/common';
import { LiveController } from './live.controller.js';
import { LiveService } from './live.service.js';
import { MessagingModule } from '../messaging/messaging.module.js';

@Module({ imports: [MessagingModule], controllers: [LiveController], providers: [LiveService], exports: [LiveService] })
export class LiveModule {}
