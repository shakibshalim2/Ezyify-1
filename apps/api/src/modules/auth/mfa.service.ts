import { Inject, Injectable } from '@nestjs/common';
import { createHash, randomBytes } from 'node:crypto';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { ENV, type Env } from '../../config.js';
import { AuditService } from '../../common/audit.service.js';
import { ApiException, conflict, forbidden, notFound, validation } from '../../common/errors.js';
import type { Role } from '../../generated/prisma/enums.js';
import { MfaCrypto, consumeRecoveryCode, newRecoveryCodes, totp } from './mfa.crypto.js';
import type { SessionMeta } from './auth.service.js';

const CHALLENGE_TTL_MS = 5 * 60_000;
const CHALLENGE_MAX_ATTEMPTS = 5;
const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

/** Roles whose accounts move money for others: MFA is mandatory for them (ASVS 2.8), opt-in for everyone else. */
export const MFA_REQUIRED_ROLES: ReadonlySet<Role> = new Set<Role>(['seller', 'admin', 'superadmin']);
export const mfaRequiredForRole = (role: Role) => MFA_REQUIRED_ROLES.has(role);

type MfaUser = { id: string; email: string; role: Role; mfaSecret: string | null; mfaEnabledAt: Date | null; mfaRecoveryCodes: string[] };

@Injectable()
export class MfaService {
  private readonly crypto: MfaCrypto;
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService, @Inject(ENV) env: Env) {
    this.crypto = MfaCrypto.fromEnv(env);
  }

  async status(userId: string) {
    const u = await this.user(userId);
    return { enabled: !!u.mfaEnabledAt, enabledAt: u.mfaEnabledAt?.toISOString() ?? null, recoveryCodesLeft: u.mfaEnabledAt ? u.mfaRecoveryCodes.length : 0, requiredForRole: mfaRequiredForRole(u.role) };
  }

  /** Stores a *pending* secret (encrypted); nothing is enforced until `enable()` proves the authenticator works. */
  async setup(userId: string) {
    const u = await this.user(userId);
    if (u.mfaEnabledAt) throw conflict('Two-factor authentication is already enabled');
    const secret = totp.secret();
    await this.prisma.user.update({ where: { id: u.id }, data: { mfaSecret: this.crypto.encrypt(secret) } });
    return { secret, otpauthUrl: totp.uri(u.email, secret), qrLabel: u.email };
  }

  async enable(userId: string, code: string, meta: SessionMeta) {
    const u = await this.user(userId);
    if (u.mfaEnabledAt) throw conflict('Two-factor authentication is already enabled');
    if (!u.mfaSecret) throw validation({ code: 'Start setup first' });
    if (!(await totp.verify(this.crypto.decrypt(u.mfaSecret), code))) throw validation({ code: 'That code is not valid' });
    const { codes, hashes } = newRecoveryCodes();
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: u.id }, data: { mfaEnabledAt: new Date(), mfaRecoveryCodes: hashes } }),
      // Any other device that signed in before MFA existed must re-authenticate with the second factor.
      this.prisma.refreshSession.updateMany({ where: { userId: u.id, revokedAt: null }, data: { revokedAt: new Date() } }),
    ]);
    await this.audit.log('auth.mfa_enabled', { userId: u.id, ...meta });
    return { recoveryCodes: codes };
  }

  async disable(userId: string, code: string, meta: SessionMeta) {
    const u = await this.user(userId);
    if (u.role === 'admin' || u.role === 'superadmin') throw forbidden('Administrators cannot disable two-factor authentication');
    if (!u.mfaEnabledAt || !u.mfaSecret) throw conflict('Two-factor authentication is not enabled');
    if (!(await this.matches(u, code))) throw validation({ code: 'That code is not valid' });
    await this.prisma.user.update({ where: { id: u.id }, data: { mfaSecret: null, mfaEnabledAt: null, mfaRecoveryCodes: [] } });
    await this.audit.log('auth.mfa_disabled', { userId: u.id, ...meta });
    return { ok: true as const };
  }

  /** Password step passed: park the login behind an opaque, hashed, short-lived challenge instead of minting a session. */
  async createChallenge(userId: string) {
    const token = randomBytes(32).toString('base64url');
    await this.prisma.mfaChallenge.deleteMany({ where: { OR: [{ userId }, { expiresAt: { lt: new Date() } }] } });
    await this.prisma.mfaChallenge.create({ data: { userId, tokenHash: sha256(token), expiresAt: new Date(Date.now() + CHALLENGE_TTL_MS) } });
    return { mfaRequired: true as const, challengeToken: token };
  }

  /** Resolves the challenge to its user when the TOTP/recovery code is right; 5 misses burn the challenge. */
  async verifyChallenge(challengeToken: string, code: string, meta: SessionMeta) {
    const ch = await this.prisma.mfaChallenge.findUnique({ where: { tokenHash: sha256(challengeToken) }, include: { user: true } });
    if (!ch || ch.expiresAt < new Date()) throw validation({ challengeToken: 'Sign-in expired — start again' });
    const u = ch.user;
    if (!u.mfaEnabledAt || !u.mfaSecret) {
      await this.prisma.mfaChallenge.delete({ where: { id: ch.id } });
      throw validation({ challengeToken: 'Sign-in expired — start again' });
    }
    const recovery = consumeRecoveryCode(u.mfaRecoveryCodes, code);
    const ok = recovery !== null || (await totp.verify(this.crypto.decrypt(u.mfaSecret), code));
    if (!ok) {
      const attempts = ch.attempts + 1;
      if (attempts >= CHALLENGE_MAX_ATTEMPTS) {
        await this.prisma.mfaChallenge.delete({ where: { id: ch.id } });
        await this.audit.log('auth.mfa_failed', { userId: u.id, ...meta, meta: { attempts } });
        throw new ApiException('RATE_LIMIT_EXCEEDED', 'Too many incorrect codes. Sign in again.');
      }
      await this.prisma.mfaChallenge.update({ where: { id: ch.id }, data: { attempts } });
      throw validation({ code: 'That code is not valid' });
    }
    await this.prisma.$transaction([
      this.prisma.mfaChallenge.delete({ where: { id: ch.id } }),
      ...(recovery ? [this.prisma.user.update({ where: { id: u.id }, data: { mfaRecoveryCodes: recovery } })] : []),
    ]);
    return u;
  }

  private async matches(u: MfaUser, code: string) {
    if (!u.mfaSecret) return false;
    if (consumeRecoveryCode(u.mfaRecoveryCodes, code) !== null) return true;
    return totp.verify(this.crypto.decrypt(u.mfaSecret), code);
  }

  private async user(id: string): Promise<MfaUser> {
    const u = await this.prisma.user.findFirst({ where: { id, deletedAt: null }, select: { id: true, email: true, role: true, mfaSecret: true, mfaEnabledAt: true, mfaRecoveryCodes: true } });
    if (!u) throw notFound('User');
    return u;
  }
}
