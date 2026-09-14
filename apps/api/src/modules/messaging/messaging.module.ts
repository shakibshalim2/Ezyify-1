import { Module } from '@nestjs/common';
import { MessagingController } from './messaging.controller.js';
import { MessagingService } from './messaging.service.js';
import { ChatGateway } from './chat.gateway.js';

@Module({ controllers: [MessagingController], providers: [MessagingService, ChatGateway], exports: [ChatGateway, MessagingService] })
export class MessagingModule {}
