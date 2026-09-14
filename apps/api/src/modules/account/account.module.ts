import { Module } from '@nestjs/common';
import { AccountController } from './account.controller.js';

@Module({ controllers: [AccountController] })
export class AccountModule {}
