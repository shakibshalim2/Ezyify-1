import { Module } from '@nestjs/common';
import { SellerDashboardController } from './seller-dashboard.controller.js';
import { SellerAnalyticsController } from './seller-analytics.controller.js';
import { SellerCustomersController } from './seller-customers.controller.js';
import { SellerEarningsController } from './seller-earnings.controller.js';

@Module({ controllers: [SellerDashboardController, SellerAnalyticsController, SellerCustomersController, SellerEarningsController] })
export class SellerModule {}
