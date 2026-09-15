import { Module } from '@nestjs/common';
import { SellerDashboardController } from './seller-dashboard.controller.js';

@Module({ controllers: [SellerDashboardController] })
export class SellerModule {}
