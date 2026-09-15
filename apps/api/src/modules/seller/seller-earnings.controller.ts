import { Body, Controller, Delete, Get, Inject, Param, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CreatePayoutMethodRequestSchema, type CreatePayoutMethodRequest, type PayoutMethod, type SellerEarnings } from '@ezyify/core';
import type { OrderStatus } from '../../generated/prisma/client.js';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { ENV, type Env } from '../../config.js';
import { money } from '../../common/money.js';
import { notFound, validation } from '../../common/errors.js';
import { CurrentUser } from '../auth/current-user.decorator.js';
import { Roles, type AccessClaims } from '../auth/auth.guard.js';
import { MfaCrypto } from '../auth/mfa.crypto.js';
import { zod } from '../../common/zod.pipe.js';
import { WithdrawSchema } from '../wallet/wallet.service.js';

const SALES: OrderStatus[] = ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed'];
const DAY = 86_400_000;
const dayKey = (d: Date) => d.toISOString().slice(0, 10);
const monthStart = (d: Date, offset = 0) => new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + offset, 1));

type PayoutRow = { id: string; type: 'bank_account' | 'ewallet'; label: string; holderName: string; institution: string; accountLast4: string; country: string; isDefault: boolean; createdAt: Date };
const toPayoutMethod = (m: PayoutRow): PayoutMethod => ({ id: m.id, type: m.type, label: m.label, holderName: m.holderName, institution: m.institution, accountLast4: m.accountLast4, country: m.country, isDefault: m.isDefault, createdAt: m.createdAt.toISOString() });
const payoutSelect = { id: true, type: true, label: true, holderName: true, institution: true, accountLast4: true, country: true, isDefault: true, createdAt: true } as const;

/** Seller earnings + payout destinations. Account numbers are encrypted at rest; the API only ever returns last4. */
@ApiTags('seller')
@Controller('seller')
export class SellerEarningsController {
  private readonly crypto: MfaCrypto;
  constructor(private readonly prisma: PrismaService, @Inject(ENV) private readonly env: Env) {
    this.crypto = MfaCrypto.fromEnv(env);
  }

  @Get('earnings')
  @Roles('seller', 'admin')
  async earnings(@CurrentUser() user: AccessClaims): Promise<SellerEarnings> {
    const sellerId = user.sub;
    const now = new Date();
    const seriesFrom = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()) - 29 * DAY);
    const wallet = await this.prisma.wallet.upsert({ where: { userId: sellerId }, create: { userId: sellerId }, update: {} });
    const [held, releases, commissions, recentReleases, withdrawals, recentPayouts] = await Promise.all([
      this.prisma.order.aggregate({ where: { sellerId, escrowStatus: 'held', status: { in: SALES } }, _sum: { total: true } }),
      this.prisma.escrowLedger.findMany({ where: { kind: 'release', order: { sellerId } }, select: { amount: true, createdAt: true } }),
      this.prisma.escrowLedger.aggregate({ where: { kind: 'commission', order: { sellerId } }, _sum: { amount: true } }),
      this.prisma.escrowLedger.findMany({ where: { kind: 'release', order: { sellerId }, createdAt: { gte: seriesFrom } }, select: { amount: true, createdAt: true } }),
      this.prisma.transaction.findMany({ where: { walletId: wallet.id, type: 'withdrawal', createdAt: { gte: seriesFrom } }, select: { amount: true, createdAt: true } }),
      this.prisma.transaction.findMany({ where: { walletId: wallet.id, type: { in: ['withdrawal', 'commission'] } }, orderBy: { createdAt: 'desc' }, take: 8 }),
    ]);

    const thisMonth = monthStart(now);
    const lastMonth = monthStart(now, -1);
    // Compare month‑to‑date with the same day range last month so a mid‑month read isn't a fake drop.
    const lastMonthSameDay = new Date(Math.min(monthStart(now).getTime(), lastMonth.getTime() + (now.getTime() - thisMonth.getTime())));
    const sum = (rows: { amount: number; createdAt: Date }[], from: Date, to?: Date) => rows.filter(r => r.createdAt >= from && (!to || r.createdAt < to)).reduce((n, r) => n + r.amount, 0);
    const buckets = new Map<string, { released: number; withdrawn: number }>();
    for (let i = 0; i < 30; i++) buckets.set(dayKey(new Date(seriesFrom.getTime() + i * DAY)), { released: 0, withdrawn: 0 });
    for (const r of recentReleases) { const b = buckets.get(dayKey(r.createdAt)); if (b) b.released += r.amount; }
    for (const w of withdrawals) { const b = buckets.get(dayKey(w.createdAt)); if (b) b.withdrawn += w.amount; }

    const currency = wallet.currency;
    return {
      currency,
      available: money(wallet.balance, currency),
      pendingWithdrawal: money(wallet.pending, currency),
      escrowHeld: money(held._sum.total ?? 0, currency),
      paidOutAllTime: money(releases.reduce((n, r) => n + r.amount, 0), currency),
      paidOutThisMonth: money(sum(releases, thisMonth), currency),
      paidOutLastMonth: money(sum(releases, lastMonth, lastMonthSameDay), currency),
      platformFeeAllTime: money(commissions._sum.amount ?? 0, currency),
      feeBps: this.env.PLATFORM_FEE_BPS,
      withdrawalMin: money(WithdrawSchema.shape.amount.minValue ?? 500, currency),
      series: [...buckets.entries()].map(([date, v]) => ({ date, ...v })),
      recentPayouts: recentPayouts.map(t => ({ id: t.id, type: t.type, direction: t.direction as 'in' | 'out', amount: money(t.amount, t.currency), status: t.status, description: t.description, createdAt: t.createdAt.toISOString() })),
    };
  }

  @Get('payout-methods')
  @Roles('seller', 'creator', 'admin')
  async payoutMethods(@CurrentUser() user: AccessClaims): Promise<PayoutMethod[]> {
    const rows = await this.prisma.payoutMethod.findMany({ where: { userId: user.sub }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }], select: payoutSelect });
    return rows.map(toPayoutMethod);
  }

  @Post('payout-methods')
  @Roles('seller', 'creator', 'admin')
  async addPayoutMethod(@CurrentUser() user: AccessClaims, @Body(zod(CreatePayoutMethodRequestSchema)) body: CreatePayoutMethodRequest): Promise<PayoutMethod> {
    const count = await this.prisma.payoutMethod.count({ where: { userId: user.sub } });
    if (count >= 5) throw validation({ _: 'You can keep up to 5 payout methods' });
    const digits = body.accountNumber.replace(/\D/g, '');
    const last4 = (digits.length >= 4 ? digits : body.accountNumber).slice(-4);
    const makeDefault = body.isDefault || count === 0;
    const row = await this.prisma.$transaction(async tx => {
      if (makeDefault) await tx.payoutMethod.updateMany({ where: { userId: user.sub, isDefault: true }, data: { isDefault: false } });
      return tx.payoutMethod.create({
        data: { userId: user.sub, type: body.type, label: body.label, holderName: body.holderName, institution: body.institution, accountLast4: last4, accountEncrypted: this.crypto.encrypt(body.accountNumber), routing: body.routing ?? null, country: body.country, isDefault: makeDefault },
        select: payoutSelect,
      });
    });
    return toPayoutMethod(row);
  }

  @Post('payout-methods/:id/default')
  @Roles('seller', 'creator', 'admin')
  async setDefault(@CurrentUser() user: AccessClaims, @Param('id') id: string): Promise<PayoutMethod> {
    const m = await this.prisma.payoutMethod.findFirst({ where: { id, userId: user.sub }, select: { id: true } });
    if (!m) throw notFound('Payout method');
    const [, row] = await this.prisma.$transaction([
      this.prisma.payoutMethod.updateMany({ where: { userId: user.sub, isDefault: true }, data: { isDefault: false } }),
      this.prisma.payoutMethod.update({ where: { id }, data: { isDefault: true }, select: payoutSelect }),
    ]);
    return toPayoutMethod(row);
  }

  @Delete('payout-methods/:id')
  @Roles('seller', 'creator', 'admin')
  async remove(@CurrentUser() user: AccessClaims, @Param('id') id: string) {
    const m = await this.prisma.payoutMethod.findFirst({ where: { id, userId: user.sub }, select: { id: true, isDefault: true } });
    if (!m) throw notFound('Payout method');
    const pending = await this.prisma.transaction.count({ where: { wallet: { userId: user.sub }, type: 'withdrawal', status: 'pending', reference: id } });
    if (pending) throw validation({ _: 'A withdrawal to this account is still processing' });
    await this.prisma.$transaction(async tx => {
      await tx.payoutMethod.delete({ where: { id } });
      if (m.isDefault) {
        const next = await tx.payoutMethod.findFirst({ where: { userId: user.sub }, orderBy: { createdAt: 'asc' }, select: { id: true } });
        if (next) await tx.payoutMethod.update({ where: { id: next.id }, data: { isDefault: true } });
      }
    });
    return { ok: true as const };
  }
}
