import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { DollarSign, ShieldCheck, Wallet, ArrowDownToLine, Landmark, Clock, Percent, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ApiError, formatMoney, formatTimeAgo, useAuth, usePayoutMethods, useSellerEarnings, type Money } from '@ezyify/core';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { QueryError } from '../../components/QueryError';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

const shortDate = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { month: 'short', day: 'numeric', timeZone: 'UTC' });

function Stat({ label, value, sub, icon: Icon, tone, testId }: { label: string; value?: string; sub?: React.ReactNode; icon: typeof Wallet; tone: string; testId?: string }) {
  return (
    <Card variant="default" padding="md" data-testid={testId}>
      <div className="flex items-center gap-3">
        <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', tone)}><Icon className="size-5" aria-hidden /></div>
        <div className="min-w-0">
          <p className="text-xs text-foreground-secondary">{label}</p>
          {value != null ? <p className="font-display font-bold text-2xl text-foreground tabular-nums truncate">{value}</p> : <Skeleton className="h-8 w-20 mt-1" />}
          {sub && <p className="text-xs text-foreground-tertiary">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

/** Seller earnings on `GET /seller/earnings`: escrow → released → wallet → bank, all from the ledger. */
export default function EarningsPage() {
  const reduce = useReducedMotion();
  const status = useAuth(s => s.status);
  const earnings = useSellerEarnings();
  const methods = usePayoutMethods();
  const e = earnings.data;
  const fmt = (m: Money) => formatMoney(m, { compact: m.amount >= 1_000_000 });
  const series = useMemo(() => (e?.series ?? []).map(p => ({ ...p, label: shortDate(p.date), releasedMajor: p.released / 100 })), [e]);
  const monthDelta = e && e.paidOutLastMonth.amount > 0 ? Math.round(((e.paidOutThisMonth.amount - e.paidOutLastMonth.amount) / e.paidOutLastMonth.amount) * 1000) / 10 : null;
  const defaultMethod = methods.data?.find(m => m.isDefault) ?? methods.data?.[0];

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.earnings} />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Earnings</h1>
            <p className="text-sm text-foreground-secondary mt-1">Escrow releases land in your wallet; withdraw to your bank whenever you like.</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="md" asChild><Link to="/seller/payout-settings"><Landmark className="size-4" aria-hidden />Payout methods</Link></Button>
            <Button variant="gradient" size="md" asChild className="shadow-brand"><Link to="/seller/withdraw"><ArrowDownToLine className="size-4" aria-hidden />Withdraw</Link></Button>
          </div>
        </motion.div>

        {status === 'anonymous' || (earnings.error instanceof ApiError && earnings.error.code === 'UNAUTHORIZED') ? (
          <EmptyState kind="orders" title="Sign in to see earnings" description="Your balance, escrow and payouts live here." action={<Button asChild><Link to="/login" state={{ next: '/seller/earnings' }}>Sign in</Link></Button>} />
        ) : earnings.isError && earnings.error instanceof ApiError && earnings.error.code === 'FORBIDDEN' ? (
          <EmptyState kind="orders" title="Seller account required" description="Open a store to start earning with escrow protection." action={<Button variant="gradient" asChild><Link to="/sell-on-ezyify">Open a store</Link></Button>} />
        ) : earnings.isError ? (
          <QueryError error={earnings.error} onRetry={() => void earnings.refetch()} />
        ) : (
          <>
            <motion.div variants={fadeUp}>
              <Card variant="featured" padding="lg" className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                <div>
                  <p className="text-sm text-foreground-secondary">Available to withdraw</p>
                  {e ? <p className="font-display font-bold text-4xl text-foreground mt-1 tabular-nums" data-testid="earnings-available">{formatMoney(e.available)}</p> : <Skeleton className="h-10 w-40 mt-2" />}
                  {e && e.pendingWithdrawal.amount > 0 && (
                    <p className="text-xs text-foreground-secondary mt-2 inline-flex items-center gap-1"><Clock className="size-3.5" aria-hidden />{formatMoney(e.pendingWithdrawal)} on its way to your bank</p>
                  )}
                </div>
                <div className="text-sm text-foreground-secondary md:text-right">
                  {methods.isSuccess && (defaultMethod ? (
                    <p>Pays out to <span className="text-foreground font-medium">{defaultMethod.institution} ••••{defaultMethod.accountLast4}</span></p>
                  ) : (
                    <p><Link to="/seller/payout-settings" className="text-primary hover:underline">Add a payout method</Link> to enable withdrawals.</p>
                  ))}
                  {e && <p className="mt-1">Min. withdrawal {formatMoney(e.withdrawalMin)} · Platform fee {e.feeBps / 100}% per order</p>}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <Stat
                testId="earnings-this-month"
                label="Released month to date"
                value={e ? fmt(e.paidOutThisMonth) : undefined}
                icon={DollarSign}
                tone="bg-primary-subtle text-primary"
                sub={
                  e && (monthDelta == null ? `vs ${fmt(e.paidOutLastMonth)} same days last month` : (
                    <span className={cn('inline-flex items-center gap-0.5 tabular-nums', monthDelta > 0 ? 'text-success' : monthDelta < 0 ? 'text-error' : 'text-foreground-secondary')}>
                      {monthDelta > 0 ? <ArrowUpRight className="size-3" aria-hidden /> : monthDelta < 0 ? <ArrowDownRight className="size-3" aria-hidden /> : <Minus className="size-3" aria-hidden />}
                      {monthDelta > 0 ? '+' : ''}{monthDelta}% vs same days last month
                    </span>
                  ))
                }
              />
              <Stat label="Held in escrow" value={e ? fmt(e.escrowHeld) : undefined} sub="Releases when buyers confirm" icon={ShieldCheck} tone="bg-info-subtle text-info" />
              <Stat label="Paid out all‑time" value={e ? fmt(e.paidOutAllTime) : undefined} sub="Net of platform fee" icon={Wallet} tone="bg-success-subtle text-success" />
              <Stat label="Platform fees all‑time" value={e ? fmt(e.platformFeeAllTime) : undefined} sub={e ? `${e.feeBps / 100}% of each completed order` : undefined} icon={Percent} tone="bg-warning-subtle text-warning" />
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-lg text-foreground">Escrow releases · last 30 days</h2>
                  {e && <span className="text-xs text-foreground-secondary tabular-nums">{formatMoney({ amount: series.reduce((n, p) => n + p.released, 0), currency: e.currency })} released</span>}
                </div>
                {!e ? <Skeleton className="h-64" /> : series.every(p => p.released === 0) ? (
                  <p className="text-sm text-foreground-secondary py-10 text-center">No escrow releases in the last 30 days yet. Completed orders show up here.</p>
                ) : (
                  <div className="w-full h-64" role="img" aria-label="Daily escrow releases to your wallet for the last 30 days">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="earningsReleased" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="label" stroke="var(--color-foreground-tertiary)" tickLine={false} axisLine={false} fontSize={12} interval="preserveStartEnd" minTickGap={24} />
                        <YAxis stroke="var(--color-foreground-tertiary)" tickLine={false} axisLine={false} fontSize={12} width={56} tickFormatter={(v: number) => formatMoney({ amount: Math.round(v * 100), currency: e.currency }, { compact: true })} />
                        <Tooltip
                          content={({ active, payload }) => {
                            const p = payload?.[0]?.payload as (typeof series)[number] | undefined;
                            if (!active || !p) return null;
                            return (
                              <div className="rounded-xl border border-border bg-background-elevated px-3 py-2 text-xs shadow-lg">
                                <p className="font-medium text-foreground">{p.date}</p>
                                <p className="text-foreground-secondary tabular-nums">Released {formatMoney({ amount: p.released, currency: e.currency })}{p.withdrawn ? ` · Withdrawn ${formatMoney({ amount: p.withdrawn, currency: e.currency })}` : ''}</p>
                              </div>
                            );
                          }}
                        />
                        <Area type="monotone" dataKey="releasedMajor" stroke="var(--color-success)" strokeWidth={2} fill="url(#earningsReleased)" isAnimationActive={!reduce} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display font-semibold text-lg text-foreground">Recent payouts</h2>
                  <Link to="/wallet" className="text-sm font-medium text-primary hover:underline">Full wallet history →</Link>
                </div>
                {!e ? <Skeleton className="h-24" /> : e.recentPayouts.length === 0 ? (
                  <p className="text-sm text-foreground-secondary py-6 text-center">No payouts yet. Your first escrow release will appear here.</p>
                ) : (
                  <ul className="divide-y divide-border" data-testid="earnings-payouts">
                    {e.recentPayouts.map(t => (
                      <li key={t.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          <span className={cn('size-8 rounded-lg flex items-center justify-center shrink-0', t.direction === 'in' ? 'bg-success-subtle text-success' : 'bg-muted text-foreground-secondary')}>
                            {t.direction === 'in' ? <ArrowDownRight className="size-4" aria-hidden /> : <ArrowUpRight className="size-4" aria-hidden />}
                          </span>
                          <div className="min-w-0">
                            <p className="text-foreground truncate">{t.description}</p>
                            <p className="text-xs text-foreground-secondary"><time dateTime={t.createdAt}>{formatTimeAgo(t.createdAt)}</time>{t.status !== 'completed' && <> · <span className={t.status === 'pending' ? 'text-warning' : 'text-error'}>{t.status}</span></>}</p>
                          </div>
                        </div>
                        <span className={cn('font-semibold tabular-nums shrink-0', t.direction === 'in' ? 'text-success' : 'text-foreground')}>{t.direction === 'in' ? '+' : '−'}{formatMoney(t.amount)}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </Card>
            </motion.div>
          </>
        )}
      </motion.div>
    </SellerLayout>
  );
}
