import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ReportRequestSchema, type ReportRequest } from '@ezyify/core';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles, type AccessClaims } from '../auth/auth.guard.js';
import { zod } from '../../common/zod.pipe.js';
import { PageQuerySchema, page, skipTake } from '../../common/pagination.js';
import { notFound, validation } from '../../common/errors.js';
import type { ReportStatus } from '../../generated/prisma/enums.js';

const ReviewSchema = z.object({ status: z.enum(['reviewing', 'actioned', 'dismissed']) });
const QueueQuery = PageQuerySchema.extend({ status: z.enum(['open', 'reviewing', 'actioned', 'dismissed']).default('open') });

/** UGC policy surface: report anything, block users, admin review queue (24 h SLA target). */
@ApiTags('moderation')
@Controller()
export class ModerationController {
  constructor(private readonly prisma: PrismaService) {}

  @Post('reports')
  async report(@CurrentUser() user: AccessClaims, @Body(zod(ReportRequestSchema)) body: ReportRequest) {
    const recent = await this.prisma.report.findFirst({ where: { reporterId: user.sub, targetType: body.targetType, targetId: body.targetId, createdAt: { gt: new Date(Date.now() - 86_400_000) } } });
    if (recent) return { ok: true as const, id: recent.id };
    const r = await this.prisma.report.create({ data: { reporterId: user.sub, ...body } });
    return { ok: true as const, id: r.id };
  }

  @Post('users/:id/block')
  async block(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    if (id === user.sub) throw validation({ id: "You can't block yourself" });
    if (!(await this.prisma.user.findUnique({ where: { id }, select: { id: true } }))) throw notFound('User');
    await this.prisma.$transaction([
      this.prisma.block.upsert({ where: { blockerId_blockedId: { blockerId: user.sub, blockedId: id } }, create: { blockerId: user.sub, blockedId: id }, update: {} }),
      this.prisma.follow.deleteMany({ where: { OR: [{ followerId: user.sub, followingId: id }, { followerId: id, followingId: user.sub }] } }),
    ]);
    return { ok: true as const };
  }

  @Delete('users/:id/block')
  async unblock(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    await this.prisma.block.deleteMany({ where: { blockerId: user.sub, blockedId: id } });
    return { ok: true as const };
  }

  @Get('users/me/blocked')
  async blocked(@CurrentUser() user: AccessClaims) {
    const rows = await this.prisma.block.findMany({ where: { blockerId: user.sub }, include: { blocked: { select: { id: true, username: true, name: true, avatarUrl: true } } } });
    return rows.map(r => r.blocked);
  }

  @Get('admin/reports')
  @Roles('admin')
  async queue(@Query(zod(QueueQuery)) q: z.infer<typeof QueueQuery>) {
    const where = { status: q.status as ReportStatus };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.report.findMany({ where, include: { reporter: { select: { id: true, username: true } } }, orderBy: { createdAt: 'asc' }, ...skipTake(q) }),
      this.prisma.report.count({ where }),
    ]);
    return page(rows, total, q);
  }

  @Patch('admin/reports/:id')
  @Roles('admin')
  async review(@Param('id') id: string, @Body(zod(ReviewSchema)) body: z.infer<typeof ReviewSchema>) {
    await this.prisma.report.update({ where: { id }, data: { status: body.status, resolvedAt: body.status === 'reviewing' ? null : new Date() } });
    return { ok: true as const };
  }
}
