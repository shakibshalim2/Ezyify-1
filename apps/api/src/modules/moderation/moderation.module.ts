import { Module } from '@nestjs/common';
import { ModerationController } from './moderation.controller.js';

@Module({ controllers: [ModerationController] })
export class ModerationModule {}
