import { Inject, Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as argon2 from 'argon2';
import { createHash, randomBytes, randomInt } from 'node:crypto';
import type { LoginRequest, SignupRequest, VerifyOtpRequest } from '@ezyify/core';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { ENV, type Env } from '../../config.js';
import { ApiException, conflict, unauthorized, validation } from '../../common/errors.js';
import type { AccessClaims } from './auth.guard.js';
import { toUserSummary } from '../users/users.mapper.js';
import { AuditService } from '../../common/audit.service.js';
import { MAILER, type Mailer } from './mail.provider.js';
import { SearchIndexer } from '../search/search.indexer.js';
import { MfaService } from './mfa.service.js';

const ARGON = { type: argon2.argon2id, memoryCost: 19_456, timeCost: 2, parallelism: 1 } as const; // OWASP 2025 minimums
const OTP_TTL_MS = 10 * 60_000;
const OTP_MAX_ATTEMPTS = 5;
// ASVS 2.2.1: lock after repeated failures, with a short cooling-off window rather than a permanent lock.
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_MS = 15 * 60_000;
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

export interface SessionResult {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  user: ReturnType<typeof toUserSummary>;
}
/** Password accepted but a second factor is pending — no tokens are issued until `/auth/mfa/verify`. */
export interface MfaChallengeResult {
  mfaRequired: true;
  challengeToken: string;
}

@Injectable()
export class AuthService {
  private readonly log = new Logger(AuthService.name);
  constructor(private readonly prisma: PrismaService, private readonly jwt: JwtService, private readonly audit: AuditService, @Inject(MAILER) private readonly mailer: Mailer, private readonly indexer: SearchIndexer, private readonly mfa: MfaService, @Inject(ENV) private readonly env: Env) {}

  async signup(body: SignupRequest) {
    const email = body.email.toLowerCase();
    const exists = await this.prisma.user.findUnique({ where: { email }, select: { id: true } });
    if (exists) throw conflict('An account with that email already exists');
    const username = await this.uniqueUsername(body.name);
    const user = await this.prisma.user.create({
      data: { email, name: body.name, username, passwordHash: await argon2.hash(body.password, ARGON), wallet: { create: {} }, cart: { create: {} } },
    });
    this.indexer.user(user.id);
    const otp = await this.issueOtp(user.id, 'email', 'verify');
    this.deliverOtp(user.email, otp);
    return { userId: user.id, email: user.email, name: user.name, requiresOTP: true, otpSentTo: 'email' as const };
  }

  async verifyOtp(body: VerifyOtpRequest, meta: SessionMeta): Promise<SessionResult> {
    const record = await this.prisma.otpCode.findFirst({ where: { userId: body.userId, purpose: 'verify', usedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
    if (!record) throw validation({ otp: 'Code expired — request a new one' });
    if (record.attempts >= OTP_MAX_ATTEMPTS) throw new ApiException('RATE_LIMIT_EXCEEDED', 'Too many attempts. Request a new code.');
    if (record.codeHash !== sha256(body.otp)) {
      await this.prisma.otpCode.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } });
      throw validation({ otp: 'That code is not valid' });
    }
    const [, user] = await this.prisma.$transaction([
      this.prisma.otpCode.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: body.userId }, data: { emailVerified: true } }),
    ]);
    return this.createSession(user, meta);
  }

  async login(body: LoginRequest, meta: SessionMeta): Promise<SessionResult | MfaChallengeResult> {
    const id = body.identifier.trim().toLowerCase();
    const user = await this.prisma.user.findFirst({ where: { OR: [{ email: id }, { phone: body.identifier.trim() }, { username: id }], deletedAt: null } });
    if (user?.lockedUntil && user.lockedUntil > new Date()) {
      throw new ApiException('RATE_LIMIT_EXCEEDED', `Too many failed attempts. Try again in ${Math.ceil((user.lockedUntil.getTime() - Date.now()) / 60_000)} min.`);
    }
    // Constant-time-ish: always run a hash verify so timing doesn't reveal account existence.
    const ok = user ? await argon2.verify(user.passwordHash, body.password) : await argon2.verify(DUMMY_HASH, body.password).catch(() => false);
    if (!user || !ok) {
      if (user) {
        const failed = user.failedLogins + 1;
        const lock = failed >= LOCKOUT_THRESHOLD;
        await this.prisma.user.update({ where: { id: user.id }, data: { failedLogins: lock ? 0 : failed, lockedUntil: lock ? new Date(Date.now() + LOCKOUT_MS) : null } });
        await this.audit.log(lock ? 'auth.locked' : 'auth.login_failed', { userId: user.id, ...meta, meta: { failed } });
      }
      throw unauthorized('Incorrect email/phone or password');
    }
    if (user.failedLogins) await this.prisma.user.update({ where: { id: user.id }, data: { failedLogins: 0, lockedUntil: null } });
    if (user.mfaEnabledAt) return this.mfa.createChallenge(user.id);
    await this.audit.log('auth.login', { userId: user.id, ...meta });
    return this.createSession(user, meta);
  }

  /** Second login step (ASVS 2.8): TOTP or single-use recovery code against a pending challenge. */
  async verifyMfa(challengeToken: string, code: string, meta: SessionMeta): Promise<SessionResult> {
    const user = await this.mfa.verifyChallenge(challengeToken, code, meta);
    await this.audit.log('auth.login', { userId: user.id, ...meta, meta: { mfa: true } });
    return this.createSession(user, meta);
  }

  /** Rotation with reuse detection: a presented token that was already replaced revokes the whole chain. */
  async refresh(refreshToken: string, meta: SessionMeta) {
    const session = await this.prisma.refreshSession.findUnique({ where: { tokenHash: sha256(refreshToken) }, include: { user: true } });
    if (!session || session.expiresAt < new Date()) throw unauthorized('Session expired');
    // A token the user explicitly revoked (logout / device revoke) is simply dead; only a *rotated* token being
    // presented again signals theft and revokes the whole chain.
    if (session.revokedAt && !session.replacedById) throw unauthorized('Session revoked');
    if (session.replacedById) {
      await this.prisma.refreshSession.updateMany({ where: { userId: session.userId, revokedAt: null }, data: { revokedAt: new Date() } });
      this.log.warn(`Refresh token reuse detected for user ${session.userId}; all sessions revoked`);
      await this.audit.log('auth.refresh_reuse', { userId: session.userId, ...meta, meta: { sessionId: session.id } });
      throw unauthorized('Session invalidated — please sign in again');
    }
    const next = await this.newRefreshSession(session.userId, meta);
    await this.prisma.refreshSession.update({ where: { id: session.id }, data: { revokedAt: new Date(), replacedById: next.id } });
    return { accessToken: await this.accessToken(session.user), expiresIn: this.env.ACCESS_TOKEN_TTL_SECONDS, refreshToken: next.token };
  }

  async logout(refreshToken: string | undefined, userId: string) {
    if (refreshToken) await this.prisma.refreshSession.updateMany({ where: { tokenHash: sha256(refreshToken), userId }, data: { revokedAt: new Date() } });
  }

  async logoutAll(userId: string) {
    await this.prisma.refreshSession.updateMany({ where: { userId, revokedAt: null }, data: { revokedAt: new Date() } });
  }

  /** ASVS 3.3: users can see and end their own device sessions. */
  async sessions(userId: string, currentRefreshToken?: string) {
    const currentHash = currentRefreshToken ? sha256(currentRefreshToken) : null;
    const rows = await this.prisma.refreshSession.findMany({ where: { userId, revokedAt: null, expiresAt: { gt: new Date() } }, orderBy: { createdAt: 'desc' } });
    return rows.map(r => ({ id: r.id, userAgent: r.userAgent, ip: r.ip, createdAt: r.createdAt.toISOString(), expiresAt: r.expiresAt.toISOString(), current: r.tokenHash === currentHash }));
  }

  async revokeSession(userId: string, sessionId: string, meta: SessionMeta) {
    const r = await this.prisma.refreshSession.updateMany({ where: { id: sessionId, userId, revokedAt: null }, data: { revokedAt: new Date() } });
    if (r.count) await this.audit.log('auth.session_revoked', { userId, ...meta, meta: { sessionId } });
    return { ok: true as const };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (user) {
      const otp = await this.issueOtp(user.id, 'email', 'reset');
      this.deliverOtp(user.email, otp, 'reset');
    }
    // Always 200 — never reveal whether the email exists.
  }

  async resetPassword(token: string, password: string) {
    const record = await this.prisma.otpCode.findFirst({ where: { codeHash: sha256(token), purpose: 'reset', usedAt: null, expiresAt: { gt: new Date() } } });
    if (!record) throw validation({ token: 'Reset link is invalid or expired' });
    await this.prisma.$transaction([
      this.prisma.otpCode.update({ where: { id: record.id }, data: { usedAt: new Date() } }),
      this.prisma.user.update({ where: { id: record.userId }, data: { passwordHash: await argon2.hash(password, ARGON), passwordChangedAt: new Date(), failedLogins: 0, lockedUntil: null } }),
      this.prisma.refreshSession.updateMany({ where: { userId: record.userId, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    await this.audit.log('auth.password_reset', { userId: record.userId });
  }

  // ---- internals

  private async createSession(user: { id: string; email: string; role: AccessClaims['role']; username: string; name: string; avatarUrl: string | null; verified: boolean }, meta: SessionMeta): Promise<SessionResult> {
    const refresh = await this.newRefreshSession(user.id, meta);
    return { accessToken: await this.accessToken(user), expiresIn: this.env.ACCESS_TOKEN_TTL_SECONDS, refreshToken: refresh.token, user: toUserSummary(user) };
  }

  private accessToken(user: { id: string; email: string; role: AccessClaims['role']; username: string }) {
    const claims: AccessClaims = { sub: user.id, email: user.email, role: user.role, username: user.username };
    return this.jwt.signAsync(claims, { secret: this.env.JWT_ACCESS_SECRET, expiresIn: this.env.ACCESS_TOKEN_TTL_SECONDS });
  }

  private async newRefreshSession(userId: string, meta: SessionMeta) {
    const token = randomBytes(48).toString('base64url');
    const row = await this.prisma.refreshSession.create({
      data: { userId, tokenHash: sha256(token), userAgent: meta.userAgent?.slice(0, 255), ip: meta.ip, expiresAt: new Date(Date.now() + this.env.REFRESH_TOKEN_TTL_DAYS * 86_400_000) },
    });
    return { id: row.id, token };
  }

  private async issueOtp(userId: string, channel: 'email' | 'phone', purpose: 'verify' | 'reset') {
    const code = purpose === 'reset' ? randomBytes(24).toString('base64url') : String(randomInt(0, 1_000_000)).padStart(6, '0');
    await this.prisma.otpCode.updateMany({ where: { userId, purpose, usedAt: null }, data: { usedAt: new Date() } });
    await this.prisma.otpCode.create({ data: { userId, channel, purpose, codeHash: sha256(code), expiresAt: new Date(Date.now() + OTP_TTL_MS) } });
    return code;
  }

  /**
   * Fire-and-forget delivery so the request never waits on (or reveals timing of) the mail provider. Phone channel is
   * a later adapter (SMS provider); until then phone codes are only logged outside production.
   */
  private deliverOtp(to: string, code: string, purpose: 'verify' | 'reset' = 'verify', channel: 'email' | 'phone' = 'email') {
    if (channel === 'phone') {
      if (this.env.NODE_ENV !== 'production') this.log.log(`[${purpose}] SMS OTP for ${to}: ${code}`);
      return;
    }
    const send = purpose === 'reset' ? this.mailer.sendResetLink(to, code) : this.mailer.sendOtp(to, code);
    void send.catch((e: Error) => this.log.error(`[${purpose}] email to ${to} failed: ${e.message}`));
  }

  private async uniqueUsername(name: string) {
    const base = name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '').slice(0, 20) || 'user';
    for (let i = 0; i < 5; i++) {
      const candidate = i === 0 ? base : `${base}${randomInt(10, 9999)}`;
      if (!(await this.prisma.user.findUnique({ where: { username: candidate }, select: { id: true } }))) return candidate;
    }
    return `${base}${Date.now().toString(36)}`;
  }
}

export interface SessionMeta {
  userAgent?: string;
  ip?: string;
}

// Pre-computed argon2id hash of a random string; keeps failed-login timing uniform.
const DUMMY_HASH = '$argon2id$v=19$m=19456,t=2,p=1$c2FsdHNhbHRzYWx0c2FsdA$Z8+Tm1H1u2G5o5jb0aYb3n0v5o9JcmH0WcGFqW0ZbXk';
