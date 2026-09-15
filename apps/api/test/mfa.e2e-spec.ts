import 'reflect-metadata';
import { existsSync, readFileSync } from 'node:fs';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { createApp } from '../src/bootstrap.js';
import { loadEnv } from '../src/config.js';
import { PrismaService } from '../src/infra/prisma/prisma.service.js';
import { totp } from '../src/modules/auth/mfa.crypto.js';

/** ASVS 2.8 — TOTP second factor: enrolment, login step-up, recovery codes, lockout, role rules. */
let app: NestFastifyApplication;
let prisma: PrismaService;
type Method = 'GET' | 'POST' | 'DELETE';
// This file alone makes > 10 login / mfa-verify calls; a fresh forwarded IP per request keeps the per-IP throttle
// (10/min, trustProxy) out of the way so the assertions exercise the per-challenge limits instead.
let ipCounter = 0;
const inject = (method: Method, url: string, opts: { token?: string; body?: unknown; headers?: Record<string, string> } = {}) =>
  app.inject({
    method,
    url: `/v1${url}`,
    payload: opts.body as never,
    headers: { ...(opts.body !== undefined ? { 'content-type': 'application/json' } : {}), 'x-client': 'native', 'x-forwarded-for': `10.7.${Math.floor(ipCounter / 250)}.${(ipCounter++ % 250) + 1}`, ...(opts.token ? { authorization: `Bearer ${opts.token}` } : {}), ...opts.headers },
  });
const json = (r: { body: string }) => JSON.parse(r.body);
const login = (email: string) => inject('POST', '/auth/login', { body: { identifier: email, password: 'Password1' } });
const SELLER = 'glowcare@ezyify.test';
const resetMfa = (email: string) => prisma.user.update({ where: { email }, data: { mfaSecret: null, mfaEnabledAt: null, mfaRecoveryCodes: [] } });

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
  prisma = app.get(PrismaService);
  await resetMfa(SELLER);
  await resetMfa('admin@ezyify.test');
});
afterAll(async () => {
  await resetMfa(SELLER);
  await resetMfa('admin@ezyify.test');
  await app.close();
});

describe('MFA enrolment', () => {
  let token: string;
  let secret: string;
  let recoveryCodes: string[];

  it('status reports required-for-role and not enabled; setup returns an otpauth URI and stores the secret encrypted', async () => {
    token = json(await login(SELLER)).data.accessToken;
    expect(json(await inject('GET', '/auth/mfa', { token })).data).toEqual({ enabled: false, enabledAt: null, recoveryCodesLeft: 0, requiredForRole: true });
    const setup = json(await inject('POST', '/auth/mfa/setup', { token })).data;
    secret = setup.secret;
    expect(setup.otpauthUrl).toBe(`otpauth://totp/Ezyify:${encodeURIComponent(SELLER)}?secret=${secret}&issuer=Ezyify`);
    expect(setup.qrLabel).toBe(SELLER);
    const row = await prisma.user.findUnique({ where: { email: SELLER }, select: { mfaSecret: true, mfaEnabledAt: true } });
    expect(row!.mfaEnabledAt).toBeNull();
    expect(row!.mfaSecret).toMatch(/^v1\./);
    expect(row!.mfaSecret).not.toContain(secret);
    // Login still works normally while enrolment is pending.
    expect(json(await login(SELLER)).data.accessToken).toBeTruthy();
  });

  it('enable rejects a wrong code, then accepts a live TOTP, returns 10 recovery codes (hashed at rest) and revokes other sessions', async () => {
    const other = json(await login(SELLER)).data;
    const bad = await inject('POST', '/auth/mfa/enable', { token, body: { code: '000000' } });
    expect(bad.statusCode).toBe(422);
    const ok = json(await inject('POST', '/auth/mfa/enable', { token, body: { code: await totp.generate(secret) } })).data;
    recoveryCodes = ok.recoveryCodes;
    expect(recoveryCodes).toHaveLength(10);
    const row = await prisma.user.findUnique({ where: { email: SELLER }, select: { mfaEnabledAt: true, mfaRecoveryCodes: true } });
    expect(row!.mfaEnabledAt).toBeTruthy();
    expect(row!.mfaRecoveryCodes).toHaveLength(10);
    for (const c of recoveryCodes) expect(row!.mfaRecoveryCodes).not.toContain(c);
    expect((await inject('POST', '/auth/refresh', { body: { refreshToken: other.refreshToken } })).statusCode).toBe(401);
    expect((await inject('POST', '/auth/mfa/setup', { token })).statusCode).toBe(409);
    expect(await prisma.auditLog.findFirst({ where: { event: 'auth.mfa_enabled', userId: 'u_glowcare' } })).toBeTruthy();
  });

  it('login returns a challenge instead of a session; verify with TOTP mints a normal session (cookie on web, body on native)', async () => {
    const r = await login(SELLER);
    expect(r.statusCode).toBe(200);
    expect(json(r).data).toEqual({ mfaRequired: true, challengeToken: expect.any(String) });
    expect(json(r).data.accessToken).toBeUndefined();
    const { challengeToken } = json(r).data;
    const wrong = await inject('POST', '/auth/mfa/verify', { body: { challengeToken, code: '000000' } });
    expect(wrong.statusCode).toBe(422);
    const native = json(await inject('POST', '/auth/mfa/verify', { body: { challengeToken, code: await totp.generate(secret) } })).data;
    expect(native.refreshToken).toBeTruthy();
    expect(native.user.username).toBe('glowcare');
    expect(json(await inject('GET', '/users/me', { token: native.accessToken })).data.username).toBe('glowcare');
    // Challenge is single use.
    expect((await inject('POST', '/auth/mfa/verify', { body: { challengeToken, code: await totp.generate(secret) } })).statusCode).toBe(422);

    const web = json(await login(SELLER)).data;
    const w = await inject('POST', '/auth/mfa/verify', { body: { challengeToken: web.challengeToken, code: await totp.generate(secret) }, headers: { 'x-client': 'web', origin: 'http://localhost:5173' } });
    expect(w.statusCode).toBe(200);
    expect(String(w.headers['set-cookie'])).toMatch(/ezyify_rt=.*HttpOnly/);
    expect(json(w).data.refreshToken).toBeUndefined();
    token = native.accessToken;
  });

  it('a recovery code works exactly once and decrements the counter', async () => {
    const { challengeToken } = json(await login(SELLER)).data;
    const s = json(await inject('POST', '/auth/mfa/verify', { body: { challengeToken, code: recoveryCodes[0].toUpperCase() } })).data;
    expect(s.accessToken).toBeTruthy();
    expect(json(await inject('GET', '/auth/mfa', { token: s.accessToken })).data).toMatchObject({ enabled: true, recoveryCodesLeft: 9, requiredForRole: true });
    const again = json(await login(SELLER)).data;
    expect((await inject('POST', '/auth/mfa/verify', { body: { challengeToken: again.challengeToken, code: recoveryCodes[0] } })).statusCode).toBe(422);
  });

  it('five wrong codes invalidate the challenge and audit it; unknown/expired tokens are rejected', async () => {
    const { challengeToken } = json(await login(SELLER)).data;
    for (let i = 0; i < 4; i++) expect((await inject('POST', '/auth/mfa/verify', { body: { challengeToken, code: '111111' } })).statusCode).toBe(422);
    const fifth = await inject('POST', '/auth/mfa/verify', { body: { challengeToken, code: '111111' } });
    expect(fifth.statusCode).toBe(429);
    expect(json(fifth).error.code).toBe('RATE_LIMIT_EXCEEDED');
    expect((await inject('POST', '/auth/mfa/verify', { body: { challengeToken, code: await totp.generate(secret) } })).statusCode).toBe(422);
    expect(await prisma.auditLog.findFirst({ where: { event: 'auth.mfa_failed', userId: 'u_glowcare' } })).toBeTruthy();
    expect((await inject('POST', '/auth/mfa/verify', { body: { challengeToken: 'nope', code: '123456' } })).statusCode).toBe(422);
    const fresh = json(await login(SELLER)).data;
    await prisma.mfaChallenge.updateMany({ where: { userId: 'u_glowcare' }, data: { expiresAt: new Date(Date.now() - 1000) } });
    expect((await inject('POST', '/auth/mfa/verify', { body: { challengeToken: fresh.challengeToken, code: await totp.generate(secret) } })).statusCode).toBe(422);
  });

  it('disable needs a valid TOTP (or recovery code) and then login is single-step again', async () => {
    expect((await inject('POST', '/auth/mfa/disable', { token, body: { code: '000000' } })).statusCode).toBe(422);
    expect(json(await inject('POST', '/auth/mfa/disable', { token, body: { code: await totp.generate(secret) } })).data).toEqual({ ok: true });
    expect(json(await inject('GET', '/auth/mfa', { token })).data.enabled).toBe(false);
    expect((await inject('POST', '/auth/mfa/disable', { token, body: { code: '123456' } })).statusCode).toBe(409);
    const r = await login(SELLER);
    expect(r.statusCode).toBe(201);
    expect(json(r).data.accessToken).toBeTruthy();
    expect(await prisma.auditLog.findFirst({ where: { event: 'auth.mfa_disabled', userId: 'u_glowcare' } })).toBeTruthy();
  });
});

describe('MFA role rules', () => {
  it('admins can enrol but never disable; buyers are not required to enrol', async () => {
    const admin = json(await login('admin@ezyify.test')).data.accessToken;
    const { secret } = json(await inject('POST', '/auth/mfa/setup', { token: admin })).data;
    expect((await inject('POST', '/auth/mfa/enable', { token: admin, body: { code: await totp.generate(secret) } })).statusCode).toBe(200);
    const denied = await inject('POST', '/auth/mfa/disable', { token: admin, body: { code: await totp.generate(secret) } });
    expect(denied.statusCode).toBe(403);
    expect(json(await inject('GET', '/auth/mfa', { token: admin })).data.enabled).toBe(true);

    const buyer = json(await login('buyer@ezyify.test')).data.accessToken;
    expect(json(await inject('GET', '/auth/mfa', { token: buyer })).data.requiredForRole).toBe(false);
    expect((await inject('POST', '/auth/mfa/enable', { token: buyer, body: { code: '123456' } })).statusCode).toBe(422); // no setup yet
    expect((await inject('GET', '/auth/mfa')).statusCode).toBe(401);
  });
});
