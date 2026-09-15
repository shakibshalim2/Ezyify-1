import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Wallet, DollarSign, AlertCircle, Landmark, CheckCircle, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, formatMoney, useAuth, usePayoutMethods, useSellerEarnings, useWithdraw } from '@ezyify/core';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Button } from '../../components/primitives/Button';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { QueryError } from '../../components/QueryError';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

/** Parses "12.50" / "12,50" / "1,250" into minor units; null when not a number. */
const toMinor = (raw: string): number | null => {
  const cleaned = raw.trim().replace(/[^\d.,]/g, '');
  if (!cleaned) return null;
  const normalised = /,\d{1,2}$/.test(cleaned) && !cleaned.includes('.') ? cleaned.replace(',', '.') : cleaned.replace(/,/g, '');
  const n = Number(normalised);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) : null;
};

/** Withdraw wallet balance to a saved payout method (`POST /wallet/withdraw`). No fee is charged by Ezyify on withdrawals. */
export default function WithdrawPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const earnings = useSellerEarnings();
  const methods = usePayoutMethods();
  const withdraw = useWithdraw();
  const [amount, setAmount] = useState('');
  const [methodId, setMethodId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ amount: number; label: string } | null>(null);

  const e = earnings.data;
  const list = methods.data ?? [];
  const selected = list.find(m => m.id === (methodId ?? list.find(x => x.isDefault)?.id ?? list[0]?.id));
  const minor = useMemo(() => toMinor(amount), [amount]);
  const available = e?.available.amount ?? 0;
  const min = e?.withdrawalMin.amount ?? 500;
  const currency = e?.available.currency ?? 'USD';

  const problem =
    amount === '' ? null
    : minor == null ? 'Enter a valid amount'
    : minor < min ? `Minimum withdrawal is ${formatMoney({ amount: min, currency })}`
    : minor > available ? 'That’s more than your available balance'
    : null;

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!selected) return setError('Add a payout method first');
    if (minor == null || problem) return setError(problem ?? 'Enter a valid amount');
    setError(null);
    withdraw.mutate({ amount: minor, payoutMethodId: selected.id }, {
      onSuccess: () => { setDone({ amount: minor, label: `${selected.institution} ••••${selected.accountLast4}` }); setAmount(''); toast.success('Withdrawal requested'); },
      onError: err => { const f = formErrors(err); setError(f.message ?? f.fields.amount ?? f.fields.payoutMethodId ?? 'Could not request withdrawal'); },
    });
  };

  return (
    <SellerLayout>
      <SEO title="Withdraw — Ezyify Seller" description="Withdraw your earnings from Ezyify." />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="max-w-2xl mx-auto space-y-6">
        <motion.div variants={fadeUp} className="space-y-3">
          <Button variant="ghost" size="sm" asChild className="-ml-2"><Link to="/seller/earnings"><ArrowLeft className="size-4" aria-hidden />Earnings</Link></Button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Withdraw earnings</h1>
            <p className="text-sm text-foreground-secondary mt-1">Move money from your Ezyify wallet to your bank or e‑wallet.</p>
          </div>
        </motion.div>

        {status === 'anonymous' || (earnings.error instanceof ApiError && earnings.error.code === 'UNAUTHORIZED') ? (
          <EmptyState kind="orders" title="Sign in to withdraw" description="Your wallet balance and payout methods live here." action={<Button asChild><Link to="/login" state={{ next: '/seller/withdraw' }}>Sign in</Link></Button>} />
        ) : earnings.isError && earnings.error instanceof ApiError && earnings.error.code === 'FORBIDDEN' ? (
          <EmptyState kind="orders" title="Seller account required" description="Open a store to start earning with escrow protection." action={<Button variant="gradient" asChild><Link to="/sell-on-ezyify">Open a store</Link></Button>} />
        ) : earnings.isError ? (
          <QueryError error={earnings.error} onRetry={() => void earnings.refetch()} />
        ) : done ? (
          <motion.div variants={fadeUp}>
            <Card variant="featured" padding="lg" className="text-center space-y-4" data-testid="withdraw-success">
              <CheckCircle className="size-12 text-success mx-auto" aria-hidden />
              <div>
                <h2 className="font-display font-semibold text-xl text-foreground">{formatMoney({ amount: done.amount, currency })} on its way</h2>
                <p className="text-sm text-foreground-secondary mt-1">To {done.label}. Bank transfers usually land within 1–3 business days; e‑wallets within minutes.</p>
              </div>
              <div className="flex gap-2 justify-center">
                <Button variant="outline" onClick={() => setDone(null)}>Withdraw more</Button>
                <Button variant="primary" onClick={() => navigate('/seller/earnings')}>Back to earnings</Button>
              </div>
            </Card>
          </motion.div>
        ) : (
          <form onSubmit={submit} className="space-y-6" noValidate>
            <motion.div variants={fadeUp}>
              <Card variant="featured" padding="lg">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm text-foreground-secondary">Available balance</p>
                    {e ? <p className="font-display font-bold text-4xl text-foreground mt-2 tabular-nums" data-testid="withdraw-available">{formatMoney(e.available)}</p> : <Skeleton className="h-10 w-40 mt-2" />}
                    {e && e.pendingWithdrawal.amount > 0 && <p className="text-xs text-foreground-secondary mt-2">{formatMoney(e.pendingWithdrawal)} already processing</p>}
                  </div>
                  <Wallet className="size-12 text-primary/30" aria-hidden />
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Send to</h2>
                {methods.isLoading ? <Skeleton className="h-16" /> : list.length === 0 ? (
                  <div className="rounded-xl border border-dashed border-border p-4 text-sm text-foreground-secondary flex items-start gap-3">
                    <Landmark className="size-5 text-foreground-tertiary mt-0.5 shrink-0" aria-hidden />
                    <div>
                      <p className="text-foreground font-medium">No payout method yet</p>
                      <p className="mt-0.5">Add a bank account or e‑wallet to withdraw.</p>
                      <Button variant="primary" size="sm" className="mt-3" asChild><Link to="/seller/payout-settings">Add payout method</Link></Button>
                    </div>
                  </div>
                ) : (
                  <div role="radiogroup" aria-label="Payout method" className="space-y-2">
                    {list.map(m => {
                      const on = selected?.id === m.id;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => setMethodId(m.id)}
                          className={cn('w-full flex items-center gap-3 rounded-xl border p-3 text-left transition-colors', on ? 'border-primary bg-primary/5' : 'border-border hover:bg-background-elevated')}
                          data-testid={`payout-method-${m.id}`}
                        >
                          <Landmark className={cn('size-5 shrink-0', on ? 'text-primary' : 'text-foreground-tertiary')} aria-hidden />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">{m.label} · {m.institution} ••••{m.accountLast4}</p>
                            <p className="text-xs text-foreground-secondary truncate">{m.holderName}{m.isDefault ? ' · Default' : ''}</p>
                          </div>
                          <span className={cn('size-4 rounded-full border-2 shrink-0', on ? 'border-primary bg-primary' : 'border-border')} aria-hidden />
                        </button>
                      );
                    })}
                    <Link to="/seller/payout-settings" className="inline-block text-xs text-primary hover:underline pt-1">Manage payout methods</Link>
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Amount</h2>
                <div className="space-y-4">
                  <Field
                    label="Withdrawal amount"
                    type="text"
                    inputMode="decimal"
                    placeholder="0.00"
                    value={amount}
                    onChange={ev => { setAmount(ev.target.value); setError(null); }}
                    leftIcon={<DollarSign className="size-5" aria-hidden />}
                    error={problem ?? undefined}
                    hint={e ? `Min ${formatMoney(e.withdrawalMin)} · no withdrawal fee` : undefined}
                    rightSlot={e && available >= min ? <button type="button" className="text-xs font-semibold text-primary hover:underline" onClick={() => setAmount((available / 100).toFixed(2))}>Max</button> : undefined}
                  />
                  {minor != null && !problem && selected && (
                    <div className="space-y-2 p-4 bg-background-elevated rounded-xl text-sm" data-testid="withdraw-summary">
                      <div className="flex justify-between"><span className="text-foreground-secondary">You withdraw</span><span className="font-semibold text-foreground tabular-nums">{formatMoney({ amount: minor, currency })}</span></div>
                      <div className="flex justify-between"><span className="text-foreground-secondary">Fee</span><span className="font-semibold text-foreground tabular-nums">{formatMoney({ amount: 0, currency })}</span></div>
                      <div className="border-t border-border pt-2 flex justify-between"><span className="font-semibold text-foreground">Arrives at {selected.institution} ••••{selected.accountLast4}</span><span className="font-display font-bold text-lg text-primary tabular-nums">{formatMoney({ amount: minor, currency })}</span></div>
                    </div>
                  )}
                  {error && <p className="text-sm text-error" role="alert">{error}</p>}
                  <div className="p-3 bg-info-subtle rounded-lg flex gap-3">
                    <AlertCircle className="size-5 text-info flex-shrink-0 mt-0.5" aria-hidden />
                    <p className="text-xs text-info">Bank transfers land within 1–3 business days. Escrow still held for open orders isn’t withdrawable until the buyer confirms delivery.</p>
                  </div>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Button type="submit" variant="gradient" size="lg" fullWidth loading={withdraw.isPending} disabled={!selected || !e || minor == null || !!problem} className="shadow-brand">
                {minor != null && !problem ? `Withdraw ${formatMoney({ amount: minor, currency })}` : 'Request withdrawal'}
              </Button>
            </motion.div>
          </form>
        )}
      </motion.div>
    </SellerLayout>
  );
}
