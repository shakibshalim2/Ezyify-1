import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { TrendingUp, ShoppingBag, Users, Clock, RotateCcw, CheckCircle, XCircle, Wallet } from 'lucide-react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { ApiError, formatCompactNumber, formatMoney, useAuth, useSellerAnalytics, type Money, type SellerAnalytics } from '@ezyify/core';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Img } from '../../components/primitives/Img';
import { QueryError } from '../../components/QueryError';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { PAYMENT_LABEL } from '../../components/seller/SellerOrderActions';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

const RANGES = [
  [7, '7 days'],
  [30, '30 days'],
  [90, '90 days'],
] as const;
type Range = (typeof RANGES)[number][0];

const CATEGORY_COLORS = ['var(--color-primary)', 'var(--color-accent)', 'var(--color-success)', 'var(--color-info)', 'var(--color-warning)', 'var(--color-foreground-tertiary)'];
const pct = (n: number) => `${Math.round(n * 100)}%`;
const shortDate = (iso: string, days: number) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, days <= 7 ? { weekday: 'short', timeZone: 'UTC' } : { month: 'short', day: 'numeric', timeZone: 'UTC' });

function AnalyticsSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-24" />)}</div>
      <Skeleton className="h-72" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><Skeleton className="h-80" /><Skeleton className="h-80" /></div>
    </div>
  );
}

function Stat({ label, value, sub, icon: Icon, tone }: { label: string; value: string; sub?: string; icon: typeof TrendingUp; tone: string }) {
  return (
    <Card variant="default" padding="md">
      <div className="flex items-center gap-3">
        <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', tone)}><Icon className="size-5" aria-hidden /></div>
        <div className="min-w-0">
          <p className="text-xs text-foreground-secondary">{label}</p>
          <p className="font-display font-bold text-2xl text-foreground tabular-nums truncate">{value}</p>
          {sub && <p className="text-xs text-foreground-tertiary truncate">{sub}</p>}
        </div>
      </div>
    </Card>
  );
}

function ChartTip({ active, payload, currency }: { active?: boolean; payload?: { payload: SellerAnalytics['series'][number] }[]; currency: Money['currency'] }) {
  const p = payload?.[0]?.payload;
  if (!active || !p) return null;
  return (
    <div className="rounded-xl border border-border bg-background-elevated px-3 py-2 text-xs shadow-lg">
      <p className="font-medium text-foreground">{p.date}</p>
      <p className="text-foreground-secondary tabular-nums">{formatMoney({ amount: p.gross, currency })} · {p.orders} {p.orders === 1 ? 'order' : 'orders'} · {p.units} units</p>
    </div>
  );
}

/** Seller analytics on `GET /seller/analytics?days=` — every figure derives from real order lines in the window. */
export default function SellerAnalytics() {
  const reduce = useReducedMotion();
  const status = useAuth(s => s.status);
  const [days, setDays] = useState<Range>(30);
  const analytics = useSellerAnalytics({ days });
  const a = analytics.data;

  const series = useMemo(() => (a?.series ?? []).map(p => ({ ...p, label: shortDate(p.date, a?.window.days ?? days), grossMajor: p.gross / 100 })), [a, days]);
  const fmt = (m: Money) => formatMoney(m, { compact: m.amount >= 1_000_000 });

  return (
    <SellerLayout>
      <SEO title="Analytics — Ezyify Seller" description="Top products, category mix, customers and fulfilment performance for your Ezyify store." />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Analytics</h1>
            <p className="text-sm text-foreground-secondary mt-1">What sold, to whom, and how fast you fulfilled it.</p>
          </div>
          <div role="group" aria-label="Date range" className="inline-flex rounded-xl border border-border bg-card p-1 self-start">
            {RANGES.map(([d, label]) => (
              <button
                key={d}
                type="button"
                onClick={() => setDays(d)}
                aria-pressed={days === d}
                className={cn('px-3 py-1.5 rounded-lg text-sm font-medium transition-colors', days === d ? 'bg-primary text-primary-foreground' : 'text-foreground-secondary hover:text-foreground')}
              >
                {label}
              </button>
            ))}
          </div>
        </motion.div>

        {status === 'anonymous' || (analytics.error instanceof ApiError && analytics.error.code === 'UNAUTHORIZED') ? (
          <EmptyState kind="orders" title="Sign in to see analytics" description="Your store’s sales, customers and fulfilment metrics live here." action={<Button asChild><Link to="/login" state={{ next: '/seller/analytics' }}>Sign in</Link></Button>} />
        ) : analytics.isLoading ? (
          <AnalyticsSkeleton />
        ) : analytics.isError || !a ? (
          analytics.error instanceof ApiError && analytics.error.code === 'FORBIDDEN' ? (
            <EmptyState kind="orders" title="Seller account required" description="Open a store to unlock analytics, escrow‑protected checkout and payouts." action={<Button variant="gradient" asChild><Link to="/sell-on-ezyify">Open a store</Link></Button>} />
          ) : (
            <QueryError error={analytics.error} onRetry={() => void analytics.refetch()} />
          )
        ) : (
          <div className={cn('space-y-6 transition-opacity', analytics.isPlaceholderData && 'opacity-60')} aria-live="polite">
            <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4" data-testid="analytics-totals">
              <Stat label="Gross sales" value={fmt(a.totals.gross)} sub={`avg ${fmt(a.totals.averageOrder)} / order`} icon={TrendingUp} tone="bg-primary-subtle text-primary" />
              <Stat label="Orders" value={formatCompactNumber(a.totals.orders)} sub={`${formatCompactNumber(a.totals.units)} units`} icon={ShoppingBag} tone="bg-success-subtle text-success" />
              <Stat label="Customers" value={formatCompactNumber(a.customers.unique)} sub={a.customers.unique ? `${pct(a.customers.repeat / a.customers.unique)} repeat` : 'No buyers yet'} icon={Users} tone="bg-info-subtle text-info" />
              <Stat label="Time to ship" value={a.fulfillment.avgHoursToShip == null ? '—' : a.fulfillment.avgHoursToShip < 48 ? `${a.fulfillment.avgHoursToShip}h` : `${Math.round(a.fulfillment.avgHoursToShip / 24)}d`} sub={a.fulfillment.avgHoursToShip == null ? 'Nothing shipped yet' : 'paid → shipped, average'} icon={Clock} tone="bg-warning-subtle text-warning" />
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="font-display font-semibold text-lg text-foreground">Daily sales</h2>
                  <span className="text-xs text-foreground-secondary">Last {a.window.days} days</span>
                </div>
                {a.totals.orders === 0 ? (
                  <p className="text-sm text-foreground-secondary py-10 text-center">No sales in this period yet.</p>
                ) : (
                  <div className="w-full h-64" role="img" aria-label={`Daily gross sales for the last ${a.window.days} days`}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                        <defs>
                          <linearGradient id="analyticsGross" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                        <XAxis dataKey="label" stroke="var(--color-foreground-tertiary)" tickLine={false} axisLine={false} fontSize={12} interval="preserveStartEnd" minTickGap={24} />
                        <YAxis stroke="var(--color-foreground-tertiary)" tickLine={false} axisLine={false} fontSize={12} width={56} tickFormatter={(v: number) => formatMoney({ amount: Math.round(v * 100), currency: a.currency }, { compact: true })} />
                        <Tooltip content={<ChartTip currency={a.currency} />} />
                        <Area type="monotone" dataKey="grossMajor" stroke="var(--color-primary)" strokeWidth={2} fill="url(#analyticsGross)" isAnimationActive={!reduce} />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </Card>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={fadeUp}>
                <Card variant="default" padding="lg" className="h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-semibold text-lg text-foreground">Top products</h2>
                    <Link to="/seller/products" className="text-sm font-medium text-primary hover:underline">Manage →</Link>
                  </div>
                  {a.topProducts.length === 0 ? (
                    <p className="text-sm text-foreground-secondary py-8 text-center">Nothing sold in this period.</p>
                  ) : (
                    <ol className="space-y-3" data-testid="analytics-top-products">
                      {a.topProducts.map((p, i) => (
                        <li key={p.id} className="flex items-center gap-3">
                          <span className="w-5 text-xs font-semibold text-foreground-tertiary tabular-nums">{i + 1}</span>
                          <Img src={p.imageUrl} alt="" className="size-10 rounded-lg object-cover shrink-0 bg-card" loading="lazy" />
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${p.id}`} className="text-sm font-medium text-foreground truncate block hover:underline">{p.name}</Link>
                            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden" aria-hidden>
                              <div className="h-full rounded-full bg-primary" style={{ width: `${Math.max(4, p.share * 100)}%` }} />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-sm font-semibold text-foreground tabular-nums">{fmt(p.gross)}</p>
                            <p className="text-xs text-foreground-secondary tabular-nums">{p.units} units · {pct(p.share)}</p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </Card>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Card variant="default" padding="lg" className="h-full">
                  <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Category mix</h2>
                  {a.categories.length === 0 ? (
                    <p className="text-sm text-foreground-secondary py-8 text-center">Nothing sold in this period.</p>
                  ) : (
                    <>
                      <div className="w-full" style={{ height: Math.min(176, 24 + a.categories.length * 40) }} role="img" aria-label={`Sales by category: ${a.categories.map(c => `${c.name} ${pct(c.share)}`).join(', ')}`}>
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={a.categories.map(c => ({ ...c, grossMajor: c.gross.amount / 100 }))} layout="vertical" margin={{ left: 0, right: 16, top: 0, bottom: 0 }} barSize={18}>
                            <XAxis type="number" hide />
                            <YAxis type="category" dataKey="name" width={88} tickLine={false} axisLine={false} fontSize={12} stroke="var(--color-foreground-secondary)" />
                            <Bar dataKey="grossMajor" radius={[0, 8, 8, 0]} isAnimationActive={!reduce}>
                              {a.categories.map((c, i) => <Cell key={c.name} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />)}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                      <ul className="mt-2 divide-y divide-border">
                        {a.categories.map((c, i) => (
                          <li key={c.name} className="flex items-center justify-between py-2 text-sm">
                            <span className="flex items-center gap-2 text-foreground"><span className="size-2.5 rounded-full" style={{ background: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }} aria-hidden />{c.name}</span>
                            <span className="text-foreground-secondary tabular-nums">{fmt(c.gross)} · {pct(c.share)}</span>
                          </li>
                        ))}
                      </ul>
                    </>
                  )}
                </Card>
              </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <motion.div variants={fadeUp}>
                <Card variant="default" padding="lg" className="h-full">
                  <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Fulfilment health</h2>
                  <dl className="grid grid-cols-3 gap-4" data-testid="analytics-fulfillment">
                    {[
                      { label: 'Completed', value: pct(a.fulfillment.completionRate), icon: CheckCircle, tone: 'text-success' },
                      { label: 'Refunds', value: pct(a.fulfillment.refundRate), icon: RotateCcw, tone: a.fulfillment.refundRate > 0.05 ? 'text-error' : 'text-foreground-secondary' },
                      { label: 'Cancelled', value: pct(a.fulfillment.cancelRate), icon: XCircle, tone: a.fulfillment.cancelRate > 0.05 ? 'text-error' : 'text-foreground-secondary' },
                    ].map(({ label, value, icon: Icon, tone }) => (
                      <div key={label} className="rounded-xl bg-background-elevated p-3">
                        <dt className="flex items-center gap-1.5 text-xs text-foreground-secondary"><Icon className={cn('size-3.5', tone)} aria-hidden />{label}</dt>
                        <dd className="font-display font-bold text-xl text-foreground tabular-nums mt-1">{value}</dd>
                      </div>
                    ))}
                  </dl>
                  <p className="text-xs text-foreground-tertiary mt-4">Rates are over orders placed in the period, excluding unpaid checkouts. Keeping refunds and cancellations under 5% protects your seller rating.</p>
                </Card>
              </motion.div>

              <motion.div variants={fadeUp}>
                <Card variant="default" padding="lg" className="h-full">
                  <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Customers & payment</h2>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="rounded-xl bg-background-elevated p-3">
                      <p className="text-xs text-foreground-secondary">First‑time buyers</p>
                      <p className="font-display font-bold text-xl text-foreground tabular-nums mt-1">{a.customers.firstTime}</p>
                    </div>
                    <div className="rounded-xl bg-background-elevated p-3">
                      <p className="text-xs text-foreground-secondary">Repeat buyers</p>
                      <p className="font-display font-bold text-xl text-foreground tabular-nums mt-1">{a.customers.repeat}</p>
                    </div>
                  </div>
                  {a.paymentMix.length > 0 && (
                    <ul className="space-y-2" aria-label="Payment methods">
                      {a.paymentMix.map(m => (
                        <li key={m.method} className="flex items-center gap-3 text-sm">
                          <Wallet className="size-4 text-foreground-tertiary shrink-0" aria-hidden />
                          <span className="w-32 text-foreground">{PAYMENT_LABEL[m.method]}</span>
                          <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden" aria-hidden><div className="h-full bg-primary rounded-full" style={{ width: `${Math.max(2, m.share * 100)}%` }} /></div>
                          <span className="w-12 text-right text-foreground-secondary tabular-nums text-xs">{pct(m.share)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </motion.div>
    </SellerLayout>
  );
}
