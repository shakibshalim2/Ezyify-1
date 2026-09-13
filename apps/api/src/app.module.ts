import { Module } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { ScheduleModule } from '@nestjs/schedule';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { loadEnv, type Env } from './config.js';
import { PrismaModule } from './infra/prisma/prisma.module.js';
import { EnvModule } from './infra/env.module.js';
import { HttpExceptionFilter } from './common/http-exception.filter.js';
import { EnvelopeInterceptor } from './common/envelope.interceptor.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { UsersModule } from './modules/users/users.module.js';
import { CatalogModule } from './modules/catalog/catalog.module.js';
import { CartModule } from './modules/cart/cart.module.js';
import { OrdersModule } from './modules/orders/orders.module.js';
import { WalletModule } from './modules/wallet/wallet.module.js';
import { FeedModule } from './modules/feed/feed.module.js';
import { MessagingModule } from './modules/messaging/messaging.module.js';
import { NotificationsModule } from './modules/notifications/notifications.module.js';
import { AccountModule } from './modules/account/account.module.js';
import { ModerationModule } from './modules/moderation/moderation.module.js';
import { HealthController } from './modules/health/health.controller.js';

export function buildAppModule(env: Env = loadEnv()) {
  @Module({
    imports: [
      LoggerModule.forRoot({
        pinoHttp: {
          level: env.NODE_ENV === 'test' ? 'silent' : env.NODE_ENV === 'production' ? 'info' : 'debug',
          transport: env.NODE_ENV === 'development' ? { target: 'pino-pretty', options: { singleLine: true } } : undefined,
          redact: ['req.headers.authorization', 'req.headers.cookie', 'res.headers["set-cookie"]'],
        },
      }),
      // Spec §Rate limiting: 100 req/min per IP by default; auth endpoints tighten further via @Throttle.
      ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: env.NODE_ENV === 'test' ? 10_000 : 100 }]),
      ScheduleModule.forRoot(),
      EnvModule.forRoot(env),
      PrismaModule,
      AuthModule,
      UsersModule,
      CatalogModule,
      CartModule,
      WalletModule,
      OrdersModule,
      FeedModule,
      MessagingModule,
      NotificationsModule,
      AccountModule,
      ModerationModule,
    ],
    controllers: [HealthController],
    providers: [
      { provide: APP_GUARD, useClass: ThrottlerGuard },
      { provide: APP_FILTER, useClass: HttpExceptionFilter },
      { provide: APP_INTERCEPTOR, useClass: EnvelopeInterceptor },
    ],
  })
  class AppModule {}
  return AppModule;
}
