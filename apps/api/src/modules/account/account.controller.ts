import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import { AuditService } from '../../common/audit.service.js';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import * as argon2 from 'argon2';
import { z } from 'zod';
import { DeleteAccountRequestSchema, type DeleteAccountRequest } from '@ezyify/core';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { AuthService } from '../auth/auth.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import type { AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { notFound, unauthorized } from '../../common/errors.js';

export const AddressSchema = z.object({
  label: z.string().min(1).max(30),
  recipient: z.string().min(1).max(80),
  phone: z.string().min(6).max(20),
  line1: z.string().min(1).max(120),
  line2: z.string().max(120).optional(),
  city: z.string().min(1).max(80),
  region: z.string().max(80).optional(),
  postal: z.string().min(2).max(12),
  country: z.string().length(2).toUpperCase(),
  isDefault: z.boolean().default(false),
});

/** Google Play account-deletion + data-export policy endpoints, plus the address book. */
@ApiTags('account')
@Controller()
export class AccountController {
  constructor(private readonly prisma: PrismaService, private readonly auth: AuthService, private readonly audit: AuditService) {}

  /** Soft-delete with 30-day purge (housekeeping cron); all sessions revoked immediately; re-auth when a password is supplied. */
  @Post('account/delete')
  async requestDeletion(@CurrentUser() user: AccessClaims, @Body(zod(DeleteAccountRequestSchema)) body: DeleteAccountRequest, @Req() req: FastifyRequest) {
    const row = await this.prisma.user.findUnique({ where: { id: user.sub } });
    if (!row) throw notFound('User');
    if (body.password && !(await argon2.verify(row.passwordHash, body.password))) throw unauthorized('Incorrect password');
    await this.prisma.$transaction([
      this.prisma.user.update({ where: { id: user.sub }, data: { deletedAt: new Date(), deletionReason: [body.reason, body.feedback].filter(Boolean).join(': ') } }),
      this.prisma.device.deleteMany({ where: { userId: user.sub } }),
    ]);
    await this.auth.logoutAll(user.sub);
    await this.audit.log('account.deleted', { userId: user.sub, ip: req.ip, userAgent: req.headers['user-agent'], meta: { reason: body.reason } });
    return { ok: true as const, purgeAfterDays: 30, cancelWithinDays: 14 };
  }

  /** Cancel a pending deletion within the grace period. */
  @Post('account/restore')
  async restore(@CurrentUser() user: AccessClaims) {
    await this.prisma.user.update({ where: { id: user.sub }, data: { deletedAt: null, deletionReason: null } });
    return { ok: true as const };
  }

  /** Data export (GDPR / Play Data safety): the user's own records as JSON; media stays as URLs. */
  @Post('account/export')
  @Throttle({ default: { limit: 3, ttl: 3_600_000 } })
  async exportData(@CurrentUser() user: AccessClaims, @Req() req: FastifyRequest) {
    await this.audit.log('account.exported', { userId: user.sub, ip: req.ip });
    const [profile, posts, orders, transactions, messages] = await this.prisma.$transaction([
      this.prisma.user.findUnique({ where: { id: user.sub }, select: { id: true, email: true, phone: true, username: true, name: true, bio: true, website: true, location: true, interests: true, createdAt: true } }),
      this.prisma.post.findMany({ where: { authorId: user.sub }, include: { media: true } }),
      this.prisma.order.findMany({ where: { buyerId: user.sub }, include: { items: true, events: true } }),
      this.prisma.transaction.findMany({ where: { wallet: { userId: user.sub } } }),
      this.prisma.message.findMany({ where: { senderId: user.sub } }),
    ]);
    return { exportedAt: new Date().toISOString(), profile, posts, orders, transactions, messages };
  }

  @Get('addresses')
  addresses(@CurrentUser() user: AccessClaims) {
    return this.prisma.address.findMany({ where: { userId: user.sub }, orderBy: [{ isDefault: 'desc' }, { label: 'asc' }] });
  }

  @Post('addresses')
  async addAddress(@CurrentUser() user: AccessClaims, @Body(zod(AddressSchema)) body: z.infer<typeof AddressSchema>) {
    if (body.isDefault) await this.prisma.address.updateMany({ where: { userId: user.sub }, data: { isDefault: false } });
    return this.prisma.address.create({ data: { ...body, userId: user.sub } });
  }

  @Delete('addresses/:id')
  async removeAddress(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    await this.prisma.address.deleteMany({ where: { id, userId: user.sub } });
    return { ok: true as const };
  }
}
