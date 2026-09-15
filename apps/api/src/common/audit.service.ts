import { Injectable } from '@nestjs/common';
import { PrismaService } from '../infra/prisma/prisma.service.js';

export type AuditEvent =
  | 'auth.login'
  | 'auth.login_failed'
  | 'auth.locked'
  | 'auth.logout'
  | 'auth.refresh_reuse'
  | 'auth.password_reset'
  | 'auth.session_revoked'
  | 'auth.mfa_enabled'
  | 'auth.mfa_disabled'
  | 'auth.mfa_failed'
  | 'account.deleted'
  | 'account.exported'
  | 'kyc.submitted'
  | 'kyc.approved'
  | 'kyc.rejected'
  | 'admin.report_reviewed'
  | 'moderation.child_safety_report'
  | 'seller.product_created'
  | 'seller.product_archived'
  | 'seller.product_deleted'
  | 'payment.webhook'
  | 'payment.webhook_rejected';

/** ASVS V7 audit trail — never logs secrets or full tokens; `meta` is for ids and reasons only. */
@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(event: AuditEvent, ctx: { userId?: string | null; ip?: string; userAgent?: string; meta?: Record<string, unknown> } = {}) {
    await this.prisma.auditLog
      .create({ data: { event, userId: ctx.userId ?? null, ip: ctx.ip, userAgent: ctx.userAgent?.slice(0, 255), meta: ctx.meta as never } })
      .catch(() => undefined); // auditing must never fail the request
  }
}
