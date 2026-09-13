import { Body, Controller, HttpCode, Inject, Post, Req, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { z } from 'zod';
import {
  ForgotPasswordRequestSchema,
  LoginRequestSchema,
  ResetPasswordRequestSchema,
  SignupRequestSchema,
  VerifyOtpRequestSchema,
  type LoginRequest,
  type SignupRequest,
  type VerifyOtpRequest,
} from '@ezyify/core';
import { AuthService, type SessionResult } from './auth.service.js';
import { Public } from './auth.guard.js';
import { CurrentUser } from './current-user.decorator.js';
import type { AccessClaims } from './auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { ENV, type Env } from '../../config.js';
import { unauthorized } from '../../common/errors.js';

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
  constructor(private readonly auth: AuthService, @Inject(ENV) private readonly env: Env) {}

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
  async login(@Body(zod(LoginRequestSchema)) body: LoginRequest, @Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    return this.emit(await this.auth.login(body, meta(req)), req, reply);
  }

  @Post('refresh')
  @Throttle({ default: { limit: 30, ttl: 60_000 } })
  async refresh(@Body(zod(RefreshBody)) body: z.infer<typeof RefreshBody>, @Req() req: FastifyRequest, @Res({ passthrough: true }) reply: FastifyReply) {
    const token = body.refreshToken ?? req.cookies?.[REFRESH_COOKIE];
    if (!token) throw unauthorized('No session');
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
const meta = (req: FastifyRequest) => ({ userAgent: req.headers['user-agent'], ip: req.ip });
