import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller.js';
import { PaymentsService } from './payments.service.js';
import { WalletModule } from '../wallet/wallet.module.js';
import { OrdersModule } from '../orders/orders.module.js';

@Module({ imports: [WalletModule, OrdersModule], controllers: [PaymentsController], providers: [PaymentsService], exports: [PaymentsService] })
export class PaymentsModule {}
