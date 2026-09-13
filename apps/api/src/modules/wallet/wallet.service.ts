import { Injectable } from '@nestjs/common';
import { z } from 'zod';
import type { Transaction, Wallet } from '@ezyify/core';
import { PrismaService } from '../../infra/prisma/prisma.service.js';
import { ApiException, validation } from '../../common/errors.js';
import { PageQuerySchema, page, skipTake } from '../../common/pagination.js';
import { money } from '../../common/money.js';
import type { Currency, TransactionStatus, TransactionType } from '../../generated/prisma/enums.js';
import type { Prisma } from '../../generated/prisma/client.js';

export const TopupSchema = z.object({ amount: z.number().int().min(100).max(1_000_000), method: z.enum(['card', 'bank_transfer']) });
export const WithdrawSchema = z.object({ amount: z.number().int().min(500), payoutMethodId: z.string().min(1) });

type Tx = Prisma.TransactionClient;

@Injectable()
export class WalletService {
  constructor(private readonly prisma: PrismaService) {}

  async get(userId: string): Promise<Wallet> {
    const w = await this.ensure(userId);
    return { balance: money(w.balance, w.currency), pending: money(w.pending, w.currency), currency: w.currency };
  }

  async transactions(userId: string, q: z.infer<typeof PageQuerySchema>) {
    const w = await this.ensure(userId);
    const [rows, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({ where: { walletId: w.id }, orderBy: { createdAt: 'desc' }, ...skipTake(q) }),
      this.prisma.transaction.count({ where: { walletId: w.id } }),
    ]);
    return page(rows.map(toTransaction), total, q);
  }

  /** Top-up is instant in dev; in production this creates a PaymentIntent and credits on webhook. */
  async topup(userId: string, body: z.infer<typeof TopupSchema>) {
    const w = await this.ensure(userId);
    await this.credit(userId, body.amount, w.currency, 'topup', `Top up · ${body.method === 'card' ? 'Card' : 'Bank transfer'}`);
    return this.get(userId);
  }

  async withdraw(userId: string, body: z.infer<typeof WithdrawSchema>): Promise<Transaction> {
    const w = await this.ensure(userId);
    if (body.amount > w.balance) throw validation({ amount: 'Insufficient balance' });
    const [, tx] = await this.prisma.$transaction([
      this.prisma.wallet.update({ where: { id: w.id }, data: { balance: { decrement: body.amount }, pending: { increment: body.amount } } }),
      this.prisma.transaction.create({
        data: { walletId: w.id, type: 'withdrawal', direction: 'out', amount: body.amount, currency: w.currency, status: 'pending', description: 'Withdrawal to bank account', reference: body.payoutMethodId },
      }),
    ]);
    return toTransaction(tx);
  }

  async debit(userId: string, amount: number, currency: Currency, type: TransactionType, description: string, idempotencyKey?: string, tx: Tx = this.prisma) {
    const w = await this.ensure(userId, tx);
    if (idempotencyKey && (await tx.transaction.findUnique({ where: { idempotencyKey } }))) return;
    if (w.balance < amount) throw new ApiException('VALIDATION_ERROR', 'Insufficient wallet balance', { amount: `Short by ${amount - w.balance} (minor units)` });
    await tx.wallet.update({ where: { id: w.id }, data: { balance: { decrement: amount } } });
    await tx.transaction.create({ data: { walletId: w.id, type, direction: 'out', amount, currency, description, idempotencyKey } });
  }

  async credit(userId: string, amount: number, currency: Currency, type: TransactionType, description: string, idempotencyKey?: string, tx: Tx = this.prisma) {
    const w = await this.ensure(userId, tx);
    if (idempotencyKey && (await tx.transaction.findUnique({ where: { idempotencyKey } }))) return;
    await tx.wallet.update({ where: { id: w.id }, data: { balance: { increment: amount } } });
    await tx.transaction.create({ data: { walletId: w.id, type, direction: 'in', amount, currency, description, idempotencyKey } });
  }

  private ensure(userId: string, tx: Tx = this.prisma) {
    return tx.wallet.upsert({ where: { userId }, create: { userId }, update: {} });
  }
}

const toTransaction = (t: { id: string; type: TransactionType; direction: string; amount: number; currency: Currency; status: TransactionStatus; description: string; createdAt: Date }): Transaction => ({
  id: t.id,
  type: t.type,
  direction: t.direction as 'in' | 'out',
  amount: money(t.amount, t.currency),
  status: t.status,
  description: t.description,
  createdAt: t.createdAt.toISOString(),
});
