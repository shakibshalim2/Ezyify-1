import { Module } from '@nestjs/common';
import { AccountController } from './account.controller.js';
import { KycController } from './kyc.controller.js';

@Module({ controllers: [AccountController, KycController] })
export class AccountModule {}
