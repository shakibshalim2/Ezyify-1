import { useMemo, useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { Eye, EyeOff, Plus, ArrowUpRight, ArrowDownLeft, Receipt, ShieldCheck, Sparkles, RotateCcw } from 'lucide-react';
import { toast } from 'sonner';
import { formatMoney, formatRelativeTime, useTopUp, useTransactions, useWallet, useWithdraw, type Transaction } from '@ezyify/core';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Field } from '../../components/primitives/Field';
import { QueryError } from '../../components/QueryError';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { useInfiniteList } from '../../lib/data';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

const PRESETS = [10, 25, 50, 100];
const ICON: Record<Transaction['type'], typeof Plus> = { topup: Plus, purchase: ArrowUpRight, refund: RotateCcw, commission: Sparkles, withdrawal: ArrowUpRight, transfer: ArrowDownLeft };

function WalletSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 pb-28 space-y-6" aria-busy>
        <Skeleton className="h-10 w-40" />
        <Skeleton className="h-48 w-full rounded-card" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <div className="p-4 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Top-up / withdraw sheet; amounts are entered in major units and sent as cents. */
function AmountDialog({ mode, onClose, max }: { mode: 'topup' | 'withdraw' | null; onClose: () => void; max: number }) {
  const topup = useTopUp();
  const withdraw = useWithdraw();
  const [amount, setAmount] = useState('');
  const [method, setMethod] = useState<'card' | 'bank_transfer'>('card');
  const cents = Math.round(Number(amount.replace(/[^0-9.]/g, '')) * 100) || 0;
  const busy = topup.isPending || withdraw.isPending;
  const err = topup.error ?? withdraw.error;
  const errors = err ? formErrors(err) : null;
  const minimum = mode === 'withdraw' ? 500 : 100;
  const tooMuch = mode === 'withdraw' && cents > max;

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (cents < minimum || tooMuch) return;
    try {
      if (mode === 'withdraw') await withdraw.mutateAsync({ amount: cents, payoutMethodId: 'bank_primary' });
      else await topup.mutateAsync({ amount: cents, method });
      toast.success(mode === 'withdraw' ? `Withdrawal of ${formatMoney({ amount: cents, currency: 'USD' })} requested` : `${formatMoney({ amount: cents, currency: 'USD' })} added to your wallet`);
      setAmount('');
      onClose();
    } catch {
      /* surfaced via mutation state */
    }
  };

  return (
    <Dialog open={!!mode} onOpenChange={open => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-display">{mode === 'withdraw' ? 'Withdraw' : 'Add funds'}</DialogTitle>
          <DialogDescription>
            {mode === 'withdraw' ? `Up to ${formatMoney({ amount: max, currency: 'USD' })} · arrives in 1–2 business days.` : 'Funds are available instantly and protected by escrow on every purchase.'}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Amount (USD)" inputMode="decimal" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} error={tooMuch ? 'Exceeds your available balance' : errors?.fields.amount} autoFocus />
          <div className="flex flex-wrap gap-2" role="group" aria-label="Quick amounts">
            {PRESETS.map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(String(p))}
                aria-pressed={cents === p * 100}
                className={cn('px-4 py-2 rounded-full text-sm font-semibold border transition-colors', cents === p * 100 ? 'bg-primary text-primary-foreground border-transparent' : 'bg-card border-border hover:border-border-strong')}
              >
                ${p}
              </button>
            ))}
          </div>
          {mode === 'topup' && (
            <div className="space-y-2">
              <p className="text-sm font-medium text-foreground">Pay with</p>
              <div className="flex gap-2" role="radiogroup" aria-label="Payment method">
                {(['card', 'bank_transfer'] as const).map(m => (
                  <button key={m} type="button" role="radio" aria-checked={method === m} onClick={() => setMethod(m)} className={cn('flex-1 px-4 py-2.5 rounded-xl text-sm font-medium border transition-colors', method === m ? 'bg-primary-subtle border-primary text-primary' : 'bg-card border-border')}>
                    {m === 'card' ? 'Card' : 'Bank transfer'}
                  </button>
                ))}
              </div>
            </div>
          )}
          {errors?.message && <p role="alert" className="text-sm text-error">{errors.message}</p>}
          <Button type="submit" variant="gradient" size="lg" fullWidth loading={busy} disabled={cents < minimum || tooMuch}>
            {mode === 'withdraw' ? 'Withdraw' : 'Add funds'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function WalletPage() {
  const reduce = useReducedMotion();
  const wallet = useWallet();
  const tx = useTransactions();
  const { items, loadMore, hasMore, loadingMore } = useInfiniteList<Transaction>(tx);
  const [showBalance, setShowBalance] = useState(true);
  const [sheet, setSheet] = useState<'topup' | 'withdraw' | null>(null);
  const [filter, setFilter] = useState<'all' | 'in' | 'out' | 'pending'>('all');

  const filtered = useMemo(
    () => items.filter(t => (filter === 'all' ? true : filter === 'pending' ? t.status === 'pending' : t.direction === filter)),
    [items, filter],
  );
  const groupedByDay = useMemo(() => {
    const groups = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const day = new Date(t.createdAt).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
      groups.set(day, [...(groups.get(day) ?? []), t]);
    }
    return [...groups.entries()];
  }, [filtered]);

  if (wallet.isLoading && tx.isLoading) return <WalletSkeleton />;
  if (wallet.error && !wallet.data) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <SEO title="My Wallet — Ezyify" description="Manage your Ezyify wallet balance, transactions, and payouts." />
        <QueryError error={wallet.error} onRetry={() => void wallet.refetch()} />
      </div>
    );
  }

  const balance = wallet.data?.balance ?? { amount: 0, currency: 'USD' as const };
  const pending = wallet.data?.pending ?? { amount: 0, currency: 'USD' as const };
  const canWithdraw = balance.amount >= 500;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Wallet — Ezyify" description="Manage your Ezyify wallet balance, transactions, and payouts." />
      <AmountDialog mode={sheet} onClose={() => setSheet(null)} max={balance.amount} />

      <motion.div variants={staggerContainer(reduce ? 0 : 0.05, 0)} initial="hidden" animate="visible" className="mx-auto max-w-2xl px-4 py-6 pb-28 space-y-6">
        <motion.div variants={fadeUp} className="space-y-1">
          <h1 className="font-display text-2xl font-semibold text-foreground">My Wallet</h1>
          <p className="text-sm text-foreground-secondary">Manage your balance and transactions</p>
        </motion.div>

        <motion.div variants={fadeUp}>
          <Card variant="featured" className="bg-brand-gradient text-white overflow-hidden relative">
            <div className="p-6 space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-white/70 text-sm font-medium">Available balance</span>
                    <button type="button" onClick={() => setShowBalance(v => !v)} aria-label={showBalance ? 'Hide balance' : 'Show balance'} aria-pressed={!showBalance} className="p-1 rounded-full hover:bg-white/10 transition-colors">
                      {showBalance ? <EyeOff className="size-4 text-white/60" /> : <Eye className="size-4 text-white/60" />}
                    </button>
                  </div>
                  <ShieldCheck className="size-5 text-white/80" aria-hidden />
                </div>
                <p className="font-display text-4xl font-bold tabular-nums">{showBalance ? formatMoney(balance) : '••••••'}</p>
                <p className="text-white/70 text-sm">Pending: {showBalance ? formatMoney(pending) : '••••'}</p>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <button type="button" onClick={() => setSheet('topup')} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white text-primary font-semibold hover:bg-white/90 transition-colors">
                  <Plus className="size-5" />
                  <span className="text-xs">Add funds</span>
                </button>
                <button type="button" onClick={() => setSheet('withdraw')} disabled={!canWithdraw} className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors disabled:opacity-50">
                  <ArrowUpRight className="size-5" />
                  <span className="text-xs font-medium">Withdraw</span>
                </button>
                <Link to="/orders" className="flex flex-col items-center gap-2 p-3 rounded-xl bg-white/10 hover:bg-white/15 transition-colors">
                  <Receipt className="size-5" />
                  <span className="text-xs font-medium">Orders</span>
                </Link>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div variants={fadeUp} className="flex items-center justify-between gap-3">
          <h2 className="font-display text-lg font-semibold text-foreground">Recent activity</h2>
          <div role="group" aria-label="Filter transactions" className="flex gap-1 rounded-full bg-muted p-1">
            {(['all', 'in', 'out', 'pending'] as const).map(f => (
              <button key={f} type="button" onClick={() => setFilter(f)} aria-pressed={filter === f} className={cn('px-3 py-1.5 rounded-full text-xs font-semibold capitalize transition-colors', filter === f ? 'bg-background-elevated text-foreground shadow-sm' : 'text-foreground-secondary hover:text-foreground')}>
                {f}
              </button>
            ))}
          </div>
        </motion.div>

        {tx.isLoading ? (
          <div className="space-y-2" aria-busy>{[0, 1, 2].map(i => <Skeleton key={i} className="h-16 rounded-card" />)}</div>
        ) : tx.error ? (
          <QueryError error={tx.error} onRetry={() => void tx.refetch()} compact />
        ) : filtered.length === 0 ? (
          <motion.div variants={fadeUp}>
            <Card variant="ghost" className="text-center py-12 space-y-3">
              <p className="text-foreground-secondary">{filter === 'all' ? 'No transactions yet. Top up your wallet or make a purchase to see activity here.' : 'Nothing matches this filter.'}</p>
              {filter === 'all' && <Button variant="primary" size="md" onClick={() => setSheet('topup')}>Add funds</Button>}
            </Card>
          </motion.div>
        ) : (
          <motion.div variants={staggerContainer(reduce ? 0 : 0.04)} className="space-y-3">
            {groupedByDay.map(([day, list]) => (
              <motion.div key={day} variants={fadeUp} className="space-y-2">
                <p className="text-xs font-semibold text-foreground-secondary px-2">{day}</p>
                <ul className="space-y-2">
                  {list.map(t => {
                    const Icon = ICON[t.type];
                    const credit = t.direction === 'in';
                    return (
                      <li key={t.id}>
                        <Card variant="ghost">
                          <div className="p-3 flex items-center gap-3">
                            <div className={cn('size-10 rounded-full flex items-center justify-center flex-shrink-0', credit ? 'bg-success-subtle text-success' : 'bg-primary-subtle text-primary')}>
                              <Icon className="size-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{t.description}</p>
                              <p className="text-xs text-foreground-secondary">
                                {formatRelativeTime(t.createdAt)}
                                {t.status !== 'completed' && <span className={cn('ml-2 font-medium', t.status === 'failed' ? 'text-error' : 'text-warning')}>· {t.status === 'pending' ? 'Pending' : 'Failed'}</span>}
                              </p>
                            </div>
                            <p className={cn('text-sm font-display font-semibold tabular-nums flex-shrink-0', credit ? 'text-success' : 'text-foreground', t.status === 'failed' && 'line-through opacity-60')}>
                              {credit ? '+' : '−'}{formatMoney(t.amount)}
                            </p>
                          </div>
                        </Card>
                      </li>
                    );
                  })}
                </ul>
              </motion.div>
            ))}
            {hasMore && (
              <div className="flex justify-center pt-2">
                <Button variant="secondary" size="md" loading={loadingMore} onClick={loadMore}>Load more</Button>
              </div>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}
