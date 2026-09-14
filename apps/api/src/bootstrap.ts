import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from '@fastify/helmet';
import cookie from '@fastify/cookie';
import { Logger } from 'nestjs-pino';
import { buildAppModule } from './app.module.js';
import { loadEnv, type Env } from './config.js';

/** Shared by main.ts and e2e tests so both run the exact production middleware stack. */
export async function createApp(env: Env = loadEnv()) {
  const app = await NestFactory.create<NestFastifyApplication>(buildAppModule(env), new FastifyAdapter({ trustProxy: true, bodyLimit: 2 * 1024 * 1024 }), { bufferLogs: true, rawBody: true });
  app.useLogger(app.get(Logger));
  app.setGlobalPrefix(env.API_PREFIX);
  app.enableCors({
    origin: env.CORS_ORIGINS.split(',').map(s => s.trim()),
    credentials: true,
    allowedHeaders: ['Authorization', 'Content-Type', 'Idempotency-Key', 'X-Client'],
  });
  // Strict headers (ASVS V14.4). CSP is API-only ('none') except for the Swagger UI, which is disabled in production.
  await app.register(helmet, {
    contentSecurityPolicy: env.NODE_ENV === 'production' ? { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } } : false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    hsts: env.NODE_ENV === 'production' ? { maxAge: 63_072_000, includeSubDomains: true, preload: true } : false,
    referrerPolicy: { policy: 'no-referrer' },
  });
  await app.register(cookie);
  app.enableShutdownHooks();

  if (env.NODE_ENV !== 'production') {
    const doc = SwaggerModule.createDocument(app, new DocumentBuilder().setTitle('Ezyify API').setVersion('1.0').addBearerAuth().build());
    SwaggerModule.setup(`${env.API_PREFIX}/docs`, app, doc, { jsonDocumentUrl: `${env.API_PREFIX}/openapi.json` });
  }
  return app;
}
