import 'reflect-metadata';
import { existsSync, readFileSync } from 'node:fs';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from '../src/bootstrap.js';
import { loadEnv } from '../src/config.js';
import { PaymentsService } from '../src/modules/payments/payments.service.js';
import { PrismaService } from '../src/infra/prisma/prisma.service.js';

let app: NestFastifyApplication;
const inject = (method: 'GET' | 'POST' | 'DELETE', url: string, opts: { token?: string; body?: unknown; headers?: Record<string, string>; cookie?: string } = {}) =>
  app.inject({
    method,
    url: `/v1${url}`,
    payload: opts.body as never,
    headers: { ...(opts.body !== undefined ? { 'content-type': 'application/json' } : {}), ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...(opts.cookie ? { cookie: opts.cookie } : {}), ...opts.headers },
  });
const json = (r: { body: string }) => JSON.parse(r.body);

beforeAll(async () => {
  if (existsSync('.env.test')) {
    for (const line of readFileSync('.env.test', 'utf8').split('\n')) {
      const m = line.match(/^([A-Z_]+)=(.*)$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  }
  app = await createApp(loadEnv({ ...process.env, NODE_ENV: 'test' }));
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
});
afterAll(() => app.close());

describe('ASVS V2 — authentication hardening', () => {
  it('locks the account after 5 failed logins and audits it', async () => {
    const prisma = app.get(PrismaService);
    await prisma.user.update({ where: { email: 'sara@ezyify.test' }, data: { failedLogins: 0, lockedUntil: null } });
    for (let i = 0; i < 5; i++) {
      const r = await inject('POST', '/auth/login', { body: { identifier: 'sara@ezyify.test', password: 'Wrong1234' }, headers: { 'x-client': 'native' } });
      expect(r.statusCode).toBe(401);
    }
    const locked = await inject('POST', '/auth/login', { body: { identifier: 'sara@ezyify.test', password: 'Password1' }, headers: { 'x-client': 'native' } });
    expect(locked.statusCode).toBe(429);
    expect(json(locked).error.code).toBe('RATE_LIMIT_EXCEEDED');
    const audit = await prisma.auditLog.findFirst({ where: { event: 'auth.locked', userId: (await prisma.user.findUnique({ where: { email: 'sara@ezyify.test' } }))!.id } });
    expect(audit).toBeTruthy();
    await prisma.user.update({ where: { email: 'sara@ezyify.test' }, data: { failedLogins: 0, lockedUntil: null } });
  });

  it('lists device sessions and revokes one', async () => {
    const a = json(await inject('POST', '/auth/login', { body: { identifier: 'alex@ezyify.test', password: 'Password1' }, headers: { 'x-client': 'native' } })).data;
    const b = json(await inject('POST', '/auth/login', { body: { identifier: 'alex@ezyify.test', password: 'Password1' }, headers: { 'x-client': 'native', 'user-agent': 'Ezyify-Android/1.0' } })).data;
    const sessions = json(await inject('GET', '/auth/sessions', { token: a.accessToken })).data as { id: string; userAgent: string }[];
    expect(sessions.length).toBeGreaterThanOrEqual(2);
    const android = sessions.find(s => s.userAgent === 'Ezyify-Android/1.0')!;
    expect(json(await inject('DELETE', `/auth/sessions/${android.id}`, { token: a.accessToken })).data.ok).toBe(true);
    const dead = await inject('POST', '/auth/refresh', { body: { refreshToken: b.refreshToken }, headers: { 'x-client': 'native' } });
    expect(dead.statusCode).toBe(401);
    const alive = await inject('POST', '/auth/refresh', { body: { refreshToken: a.refreshToken }, headers: { 'x-client': 'native' } });
    expect(alive.statusCode).toBe(201);
  });
});

describe('ASVS V4 — CSRF on the cookie refresh flow', () => {
  it('sets an httpOnly SameSite cookie for web clients and rejects cross-site refresh', async () => {
    const r = await inject('POST', '/auth/login', { body: { identifier: 'maya@ezyify.test', password: 'Password1' }, headers: { origin: 'http://localhost:5173' } });
    const setCookie = String(r.headers['set-cookie']);
    expect(setCookie).toMatch(/ezyify_rt=/);
    expect(setCookie).toMatch(/HttpOnly/);
    expect(setCookie).toMatch(/SameSite=Lax/);
    expect(json(r).data.refreshToken).toBeUndefined();
    const cookie = setCookie.split(';')[0];
    const evil = await inject('POST', '/auth/refresh', { body: {}, cookie, headers: { origin: 'https://evil.example' } });
    expect(evil.statusCode).toBe(403);
    const ok = await inject('POST', '/auth/refresh', { body: {}, cookie, headers: { origin: 'http://localhost:5173' } });
    expect(ok.statusCode).toBe(201);
    expect(json(ok).data.refreshToken).toBeUndefined();
  });
});

describe('ASVS V14 — headers & disclosure', () => {
  it('sends hardened security headers and no server fingerprint', async () => {
    const r = await inject('GET', '/health');
    expect(r.headers['x-content-type-options']).toBe('nosniff');
    expect(r.headers['x-frame-options']).toBeDefined();
    expect(r.headers['referrer-policy']).toBe('no-referrer');
    expect(r.headers['x-powered-by']).toBeUndefined();
  });
  it('rejects oversized JSON bodies', async () => {
    const r = await inject('POST', '/auth/login', { body: { identifier: 'a'.repeat(3 * 1024 * 1024), password: 'x' } });
    expect(r.statusCode).toBe(413);
  });
});

describe('ASVS V13 — payment webhooks', () => {
  it('rejects unsigned Stripe webhooks when Stripe is not configured / signature is invalid', async () => {
    const r = await inject('POST', '/payments/webhooks/stripe', { body: { id: 'evt_x', type: 'payment_intent.succeeded' }, headers: { 'stripe-signature': 'bad' } });
    expect([401, 422]).toContain(r.statusCode);
    expect(json(r).success).toBe(false);
  });
  it('applies a payment_intent.succeeded exactly once (idempotent by event id)', async () => {
    const payments = app.get(PaymentsService);
    const prisma = app.get(PrismaService);
    const buyer = await prisma.user.findUnique({ where: { email: 'buyer@ezyify.test' }, include: { wallet: true } });
    const before = buyer!.wallet!.balance;
    const event = { id: `evt_test_${Date.now()}`, type: 'payment_intent.succeeded', data: { object: { id: `pi_${Date.now()}`, amount: 1234, currency: 'usd', metadata: { kind: 'topup', userId: buyer!.id } } } };
    expect(await payments.applyEvent(event as never)).toEqual({ received: true, duplicate: false });
    expect(await payments.applyEvent(event as never)).toEqual({ received: true, duplicate: true });
    const after = await prisma.wallet.findUnique({ where: { userId: buyer!.id } });
    expect(after!.balance - before).toBe(1234);
  });
});

describe('ASVS V12 — uploads', () => {
  it('refuses disallowed MIME types before signing anything', async () => {
    const token = json(await inject('POST', '/auth/login', { body: { identifier: 'buyer@ezyify.test', password: 'Password1' }, headers: { 'x-client': 'native' } })).data.accessToken;
    const r = await inject('POST', '/uploads/sign', { token, body: { contentType: 'application/x-msdownload', sizeBytes: 100, purpose: 'post' } });
    expect(r.statusCode).toBe(422);
    const big = await inject('POST', '/uploads/sign', { token, body: { contentType: 'image/png', sizeBytes: 500 * 1024 * 1024, purpose: 'post' } });
    expect(json(big).error.details.sizeBytes).toMatch(/Max/);
  });
});
