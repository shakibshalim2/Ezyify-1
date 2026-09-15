import { Module } from '@nestjs/common';
import { SellerDashboardController } from './seller-dashboard.controller.js';
import { SellerAnalyticsController } from './seller-analytics.controller.js';

@Module({ controllers: [SellerDashboardController, SellerAnalyticsController] })
export class SellerModule {}
