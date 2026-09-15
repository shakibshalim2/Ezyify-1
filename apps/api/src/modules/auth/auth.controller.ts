import { Body, Controller, Delete, Get, HttpCode, Inject, Param, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  ChangePasswordRequestSchema,
  ForgotPasswordRequestSchema,
  LoginRequestSchema,
  MfaDisableRequestSchema,
  MfaEnableRequestSchema,
  MfaVerifyRequestSchema,
  ResetPasswordRequestSchema,
  SignupRequestSchema,
  VerifyOtpRequestSchema,
  type ChangePasswordRequest,
  type LoginRequest,
  type MfaDisableRequest,
  type MfaEnableRequest,
  type MfaVerifyRequest,
  type SignupRequest,
  type VerifyOtpRequest,
} from '@ezyify/core';
import { AuthService, type MfaChallengeResult, type SessionResult } from './auth.service.js';
import { MfaService } from './mfa.service.js';
import { Public } from './auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import type { AccessClaims } from './auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { ENV, type Env } from '../../config.js';
import { forbidden, unauthorized } from '../../common/errors.js';

export const REFRESH_COOKIE = 'ezyify_rt';
const RefreshBody = z.object({ refreshToken: z.string().min(1).optional() });

/**
 * Refresh token transport: httpOnly cookie for web (spec), JSON body for native (no cookie jar).
 * A client that sends `X-Client: native` gets the refresh token in the body instead of a cookie.
 */
@ApiTags('auth')
@Controller('auth')
@Public()
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly mfa: MfaService, @Inject(ENV) private readonly env: Env) {}

  @Post('signup')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @ApiOperation({ summary: 'Create account; sends OTP' })
  signup(@Body(zod(SignupRequestSchema)) body: SignupRequest) {
    return this.auth.signup(body);
  }

  @Post('verify-otp')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  async verifyOtp(@Body(zod(VerifyOtpRequestSchema)) body: VerifyOtpRequest, @Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.emit(await this.auth.verifyOtp(body, meta(req)), req, reply);
  }

  @Post('login')
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Password login; 201 session, or 200 `{ mfaRequired, challengeToken }` when the account has MFA' })
  async login(@Body(zod(LoginRequestSchema)) body: LoginRequest, @Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const result = await this.auth.login(body, meta(req));
    if (!isChallenge(result)) return this.emit(result, req, reply);
    reply.status(200); // nothing was created yet
    return result;
  }

  // ---- MFA (TOTP) — ASVS 2.8

  @Post('mfa/verify')
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @ApiOperation({ summary: 'Second login step: TOTP or recovery code against a login challenge' })
  async mfaVerify(@Body(zod(MfaVerifyRequestSchema)) body: MfaVerifyRequest, @Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.emit(await this.auth.verifyMfa(body.challengeToken, body.code, meta(req)), req, reply);
  }

  @Get('mfa')
  @Public(false)
  mfaStatus(@CurrentUser() user: AccessClaims) {
    return this.mfa.status(user.sub);
  }

  @Post('mfa/setup')
  @Public(false)
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  mfaSetup(@CurrentUser() user: AccessClaims) {
    return this.mfa.setup(user.sub);
  }

  @Post('mfa/enable')
  @Public(false)
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  mfaEnable(@CurrentUser() user: AccessClaims, @Body(zod(MfaEnableRequestSchema)) body: MfaEnableRequest, @Req() req: FastifyRequest) {
    return this.mfa.enable(user.sub, body.code, meta(req));
  }

  @Post('mfa/disable')
  @Public(false)
  @HttpCode(200)
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  mfaDisable(@CurrentUser() user: AccessClaims, @Body(zod(MfaDisableRequestSchema)) body: MfaDisableRequest, @Req() req: FastifyRequest) {
    return this.mfa.disable(user.sub, body.code, meta(req));
  }

  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(@Body(zod(RefreshBody)) body: z.infer<typeof RefreshBody>, @Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const token = body.refreshToken ?? req.cookies?.[REFRESH_COOKIE];
    if (!token) throw unauthorized('No session');
    if (!body.refreshToken) this.assertSameOrigin(req); // cookie flow → CSRF check
    const result = await this.auth.refresh(token, meta(req));
    if (isNative(req)) return result;
    this.setCookie(reply, result.refreshToken);
    return { accessToken: result.accessToken, expiresIn: result.expiresIn };
  }

  @Post('logout')
  @HttpCode(200)
  async logout(@Body(zod(RefreshBody)) body: z.infer<typeof RefreshBody>, @Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply, @CurrentUser() user?: AccessClaims) {
    const token = body.refreshToken ?? req.cookies?.[REFRESH_COOKIE];
    if (user) await this.auth.logout(token, user.sub);
    reply.clearCookie(REFRESH_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Get('sessions')
  @Public(false)
  sessions(@CurrentUser() user: AccessClaims, @Req() req: FastifyRequest) {
    return this.auth.sessions(user.sub, req.cookies?.[REFRESH_COOKIE]);
  }

  @Delete('sessions/:id')
  @Public(false)
  revoke(@CurrentUser() user: AccessClaims, @Param('id') id: string, @Req() req: FastifyRequest) {
    return this.auth.revokeSession(user.sub, id, meta(req));
  }

  @Post('logout-all')
  @Public(false)
  @HttpCode(200)
  async logoutAll(@CurrentUser() user: AccessClaims, @Res({ passthrough: true }) reply: FastifyReply) {
    await this.auth.logoutAll(user.sub);
    reply.clearCookie(REFRESH_COOKIE, { path: '/' });
    return { ok: true };
  }

  @Post('change-password')
  @Public(false)
  @HttpCode(200)
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async changePassword(@CurrentUser() user: AccessClaims, @Body(zod(ChangePasswordRequestSchema)) body: ChangePasswordRequest, @Req() req: FastifyRequest) {
    // Keep this device signed in; every other session is revoked.
    await this.auth.changePassword(user.sub, body.currentPassword, body.newPassword, req.cookies?.[REFRESH_COOKIE]);
    return { ok: true };
  }

  @Post('forgot-password')
  @Throttle({ default: { limit: 3, ttl: 60_000 } })
  async forgot(@Body(zod(ForgotPasswordRequestSchema)) body: { email: string }) {
    await this.auth.forgotPassword(body.email);
    return { ok: true };
  }

  @Post('reset-password')
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  async reset(@Body(zod(ResetPasswordRequestSchema)) body: { token: string; password: string }) {
    await this.auth.resetPassword(body.token, body.password);
    return { ok: true };
  }

  /**
   * CSRF defence for the cookie-based refresh (ASVS 4.2.2): SameSite=Lax blocks cross-site POSTs in modern browsers,
   * and as defence-in-depth the Origin/Referer must be one of our configured web origins.
   */
  private assertSameOrigin(req: FastifyRequest) {
    const allowed = this.env.CORS_ORIGINS.split(',').map(s => s.trim());
    const origin = req.headers.origin ?? (req.headers.referer ? new URL(req.headers.referer).origin : undefined);
    if (!origin || !allowed.includes(origin)) throw forbidden('Cross-site request blocked');
  }

  private emit(session: SessionResult, req: FastifyRequest, reply: FastifyReply) {
    if (isNative(req)) return session;
    this.setCookie(reply, session.refreshToken);
    return { accessToken: session.accessToken, expiresIn: session.expiresIn, user: session.user };
  }

  private setCookie(reply: FastifyReply, token: string) {
    reply.setCookie(REFRESH_COOKIE, token, {
      httpOnly: true,
      secure: this.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      domain: this.env.COOKIE_DOMAIN || undefined,
      maxAge: this.env.REFRESH_TOKEN_TTL_DAYS * 86_400,
    });
  }
}

const isNative = (req: FastifyRequest) => req.headers['x-client'] === 'native';
const isChallenge = (r: SessionResult | MfaChallengeResult): r is MfaChallengeResult => 'mfaRequired' in r;
const meta = (req: FastifyRequest) => ({ userAgent: req.headers['user-agent'], ip: req.ip });
