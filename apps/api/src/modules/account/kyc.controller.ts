import { Body, Controller, Get, Inject, Param, Patch, Post, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { z } from 'zod';
import { ReviewKycRequestSchema, SubmitKycRequestSchema, type AdminKycSubmission, type KycState, type KycSubmission, type ReviewKycRequest } from '@ezyify/core';
import type { Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { ENV, type Env } from '../../config.js';
import { PageQuerySchema, page, skipTake } from '../../common/pagination.js';
import { conflict, notFound } from '../../common/errors.js';
import { AuditService } from '../../common/audit.service.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles, type AccessClaims } from '../auth/auth.guard.js';
import { MfaCrypto } from '../auth/mfa.crypto.js';
import { zod } from '../../common/zod.pipe.js';
import { toUserSummary } from '../users/users.mapper.js';

type Row = Prisma.KycSubmissionGetPayload<{ include: { user: true } }>;
const toSubmission = (k: Row): KycSubmission => ({
  id: k.id, status: k.status, documentType: k.documentType, fullName: k.fullName, idNumberLast4: k.idNumberLast4, dateOfBirth: k.dateOfBirth, country: k.country,
  documentFrontUrl: k.documentFrontUrl, documentBackUrl: k.documentBackUrl, selfieUrl: k.selfieUrl, rejectionReason: k.rejectionReason,
  submittedAt: k.submittedAt.toISOString(), reviewedAt: k.reviewedAt?.toISOString() ?? null,
});
const toAdmin = (k: Row): AdminKycSubmission => ({ ...toSubmission(k), user: toUserSummary(k.user), email: k.user.email });
const QueueQuery = PageQuerySchema.extend({ status: z.enum(['pending', 'approved', 'rejected']).default('pending') });

/**
 * Identity verification (KYC). Documents go through the signed-upload flow (purpose `kyc`); the ID number is
 * encrypted at rest and never returned in full. Approval flips `User.verified`, which powers the badge everywhere.
 */
@ApiTags('kyc')
@Controller()
export class KycController {
  private readonly crypto: MfaCrypto;
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditService, @Inject(ENV) env: Env) {
    this.crypto = MfaCrypto.fromEnv(env);
  }

  @Get('kyc')
  async state(@CurrentUser() user: AccessClaims): Promise<KycState> {
    const [u, latest] = await Promise.all([
      this.prisma.user.findUniqueOrThrow({ where: { id: user.sub }, select: { verified: true } }),
      this.prisma.kycSubmission.findFirst({ where: { userId: user.sub }, orderBy: { submittedAt: 'desc' }, include: { user: true } }),
    ]);
    return { verified: u.verified, submission: latest ? toSubmission(latest) : null, canSubmit: !u.verified && latest?.status !== 'pending' };
  }

  @Post('kyc')
  async submit(@CurrentUser() user: AccessClaims, @Body(zod(SubmitKycRequestSchema)) body: z.output<typeof SubmitKycRequestSchema>): Promise<KycSubmission> {
    const u = await this.prisma.user.findUniqueOrThrow({ where: { id: user.sub }, select: { verified: true } });
    if (u.verified) throw conflict('Your identity is already verified');
    const open = await this.prisma.kycSubmission.findFirst({ where: { userId: user.sub, status: 'pending' } });
    if (open) throw conflict('A submission is already under review');
    const row = await this.prisma.kycSubmission.create({
      data: {
        userId: user.sub, documentType: body.documentType, fullName: body.fullName, dateOfBirth: body.dateOfBirth, country: body.country,
        idNumberEncrypted: this.crypto.encrypt(body.idNumber), idNumberLast4: body.idNumber.slice(-4),
        documentFrontUrl: body.documentFrontUrl, documentBackUrl: body.documentBackUrl, selfieUrl: body.selfieUrl,
      },
      include: { user: true },
    });
    await this.audit.log('kyc.submitted', { userId: user.sub, meta: { submissionId: row.id, documentType: row.documentType } });
    return toSubmission(row);
  }

  @Get('admin/kyc')
  @Roles('admin')
  async queue(@Query(zod(QueueQuery)) q: z.infer<typeof QueueQuery>) {
    const where = { status: q.status };
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.kycSubmission.findMany({ where, include: { user: true }, orderBy: { submittedAt: q.status === 'pending' ? 'asc' : 'desc' }, ...skipTake(q) }),
      this.prisma.kycSubmission.count({ where }),
    ]);
    return page(rows.map(toAdmin), total, q);
  }

  @Patch('admin/kyc/:id')
  @Roles('admin')
  async review(@CurrentUser() admin: AccessClaims, @Param('id') id: string, @Body(zod(ReviewKycRequestSchema)) body: ReviewKycRequest): Promise<AdminKycSubmission> {
    const existing = await this.prisma.kycSubmission.findUnique({ where: { id } });
    if (!existing) throw notFound('Submission');
    if (existing.status !== 'pending') throw conflict('This submission was already reviewed');
    const approved = body.decision === 'approve';
    const [row] = await this.prisma.$transaction([
      this.prisma.kycSubmission.update({
        where: { id },
        data: { status: approved ? 'approved' : 'rejected', rejectionReason: approved ? null : body.reason, reviewedById: admin.sub, reviewedAt: new Date() },
        include: { user: true },
      }),
      ...(approved ? [this.prisma.user.update({ where: { id: existing.userId }, data: { verified: true } })] : []),
      this.prisma.notification.create({
        data: {
          recipientId: existing.userId, type: 'system', href: '/seller/kyc-verification',
          message: body.decision === 'approve' ? 'Your identity is verified — the verified badge is now on your profile.' : `Identity verification needs another look: ${body.reason}`,
        },
      }),
    ]);
    await this.audit.log(approved ? 'kyc.approved' : 'kyc.rejected', { userId: admin.sub, meta: { submissionId: id, subjectId: existing.userId } });
    return toAdmin(row);
  }
}
