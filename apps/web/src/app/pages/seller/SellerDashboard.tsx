import type React from 'react';
import { useMemo } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { DollarSign, Package, TrendingUp, ShoppingCart, ShieldCheck, Star, AlertTriangle, Plus, ArrowUpRight, ArrowDownRight, Minus, RotateCcw, Truck, Settings } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { ApiError, formatMoney, formatCompactNumber, useAuth, useMe, useSellerDashboard, useSellerOrders, type Money, type Order } from '@ezyify/core';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Img } from '../../components/primitives/Img';
import { QueryError } from '../../components/QueryError';
import { EmptyState } from '../../components/primitives/EmptyState';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { SELLER_STATUS } from '../../components/seller/SellerOrderActions';
import { useInfiniteList } from '../../lib/data';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

function DashboardSkeleton() {
  return (
    <div className="space-y-6" aria-busy>
      <Skeleton className="h-8 w-40" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} padding="md">
            <Skeleton className="h-4 w-20 mb-4" />
            <Skeleton className="h-8 w-32 mb-2" />
            <Skeleton className="h-4 w-16" />
          </Card>
        ))}
      </div>
      <Card padding="lg"><Skeleton className="h-64 w-full" /></Card>
      <Card padding="lg">
        <Skeleton className="h-6 w-40 mb-6" />
        <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}</div>
      </Card>
    </div>
  );
}

/** Percentage delta vs previous window; `null` when there is no baseline so we never show a fake "+∞%". */
const deltaPct = (current: number, previous: number): number | null => (previous > 0 ? Math.round(((current - previous) / previous) * 1000) / 10 : null);

function KPICard({ title, value, delta, icon: Icon, hint, testId }: { title: string; value: string; delta: number | null; icon: React.ComponentType<{ className?: string }>; hint: string; testId?: string }) {
  const tone = delta == null ? 'neutral' : delta > 0 ? 'up' : delta < 0 ? 'down' : 'flat';
  return (
    <Card variant="default" padding="md" className="space-y-2" data-testid={testId}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium text-foreground-secondary">{title}</span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary"><Icon className="size-4" aria-hidden /></span>
      </div>
      <div className="font-display font-bold text-xl sm:text-2xl text-foreground tabular-nums">{value}</div>
      <div className="flex flex-wrap items-center gap-1.5 min-h-6">
        {tone === 'neutral' ? (
          <span className="text-xs text-foreground-tertiary">No prior period yet</span>
        ) : (
          <>
            <span
              className={cn(
                'flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg tabular-nums',
                tone === 'up' && 'text-success bg-success-subtle',
                tone === 'down' && 'text-error bg-error-subtle',
                tone === 'flat' && 'text-foreground-secondary bg-muted',
              )}
            >
              {tone === 'up' ? <ArrowUpRight className="size-3" aria-hidden /> : tone === 'down' ? <ArrowDownRight className="size-3" aria-hidden /> : <Minus className="size-3" aria-hidden />}
              {delta! > 0 ? '+' : ''}{delta}%
            </span>
            <span className="hidden sm:inline text-xs text-foreground-secondary">{hint}</span>
          </>
        )}
      </div>
    </Card>
  );
}

const shortDay = (iso: string) => new Date(`${iso}T00:00:00Z`).toLocaleDateString(undefined, { weekday: 'short', timeZone: 'UTC' });

function RecentOrderRow({ order }: { order: Order }) {
  const cfg = SELLER_STATUS[order.status];
  const Icon = cfg.icon;
  return (
    <Link to={`/seller/order-detail/${order.id}`} className="flex items-center justify-between gap-4 p-3 -mx-1 rounded-card hover:bg-background-elevated transition-colors" data-testid={`dash-order-${order.id}`}>
      <div className="flex items-center gap-3 min-w-0">
        <Img src={order.items[0].imageUrl} alt="" className="size-12 rounded-lg object-cover flex-shrink-0 bg-card" loading="lazy" />
        <div className="min-w-0">
          <p className="font-medium text-foreground text-sm truncate">{order.orderNumber} · {order.buyer.name}</p>
          <p className="text-xs text-foreground-secondary truncate">{order.items[0].name}{order.items.length > 1 ? ` +${order.items.length - 1}` : ''}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        <span className="font-semibold text-foreground tabular-nums text-sm">{formatMoney(order.total)}</span>
        <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg', cfg.className)}><Icon className="size-3" aria-hidden />{cfg.label}</span>
      </div>
    </Link>
  );
}

/** Seller overview on `GET /seller/dashboard` (30‑day KPIs, 14‑day series, attention counts) + the latest seller orders. */
export default function SellerDashboard() {
  const reduce = useReducedMotion();
  const status = useAuth(s => s.status);
  const me = useMe();
  const dash = useSellerDashboard({ days: 30 });
  const recent = useSellerOrders({ pageSize: 5 });
  const { items: recentOrders } = useInfiniteList<Order>(recent);

  const d = dash.data;
  const series = useMemo(() => (d?.series ?? []).map(p => ({ ...p, label: shortDay(p.date), grossMajor: p.gross / 100 })), [d]);
  const alerts = useMemo(() => {
    if (!d) return [];
    const a = d.attention;
    const out: { tone: 'error' | 'warning'; message: string; action: string; href: string; icon: typeof Truck }[] = [];
    if (a.toShip) out.push({ tone: 'error', message: `${a.toShip} ${a.toShip === 1 ? 'order needs' : 'orders need'} accepting or shipping`, action: 'Ship now', href: '/seller/orders', icon: Truck });
    if (a.refundRequests) out.push({ tone: 'error', message: `${a.refundRequests} refund ${a.refundRequests === 1 ? 'request awaits' : 'requests await'} your decision`, action: 'Review', href: '/seller/orders', icon: RotateCcw });
    if (a.outOfStock) out.push({ tone: 'warning', message: `${a.outOfStock} ${a.outOfStock === 1 ? 'product is' : 'products are'} out of stock`, action: 'Restock', href: '/seller/products', icon: Package });
    if (a.lowStock) out.push({ tone: 'warning', message: `${a.lowStock} ${a.lowStock === 1 ? 'product is' : 'products are'} low on stock`, action: 'Restock', href: '/seller/products', icon: AlertTriangle });
    return out;
  }, [d]);

  const fmt = (m: Money) => formatMoney(m, { compact: m.amount >= 1_000_000 });

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.sellerDashboard} />
      {status === 'anonymous' || (dash.error instanceof ApiError && dash.error.code === 'UNAUTHORIZED') ? (
        <div className="max-w-xl mx-auto">
          <EmptyState kind="orders" title="Overview" description="Sign in with your seller account to see sales, escrow and orders." action={<Button asChild><Link to="/login" state={{ next: '/seller-dashboard' }}>Sign in</Link></Button>} />
        </div>
      ) : dash.isLoading ? (
        <DashboardSkeleton />
      ) : dash.isError || !d ? (
        <div className="max-w-xl mx-auto">
          {dash.error instanceof ApiError && dash.error.code === 'FORBIDDEN' ? (
            <EmptyState
              kind="orders"
              title="Overview"
              description="This account isn’t a seller yet. Open a store to unlock the seller hub — escrow‑protected checkout, live shopping and payouts included."
              action={<Button variant="gradient" asChild><Link to="/sell-on-ezyify">Open a store</Link></Button>}
            />
          ) : (
            <QueryError error={dash.error} onRetry={() => void dash.refetch()} />
          )}
        </div>
      ) : (
        <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground">Overview</h1>
              <p className="text-sm text-foreground-secondary mt-1">
                {me.data ? `Welcome back, ${me.data.name.split(' ')[0]} — ` : ''}last {d.window.days} days vs the {d.window.days} before.
              </p>
            </div>
            <Button variant="gradient" size="md" asChild className="shadow-brand">
              <Link to="/seller/add-product"><Plus className="size-4" aria-hidden />Add product</Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <KPICard testId="kpi-gross" title="Gross sales" value={fmt(d.gross.current)} delta={deltaPct(d.gross.current.amount, d.gross.previous.amount)} icon={DollarSign} hint={`vs ${fmt(d.gross.previous)}`} />
            <KPICard testId="kpi-orders" title="Orders" value={formatCompactNumber(d.orders.current)} delta={deltaPct(d.orders.current, d.orders.previous)} icon={ShoppingCart} hint={`vs ${d.orders.previous}`} />
            <KPICard title="Avg. order" value={fmt(d.averageOrder.current)} delta={deltaPct(d.averageOrder.current.amount, d.averageOrder.previous.amount)} icon={TrendingUp} hint={`vs ${fmt(d.averageOrder.previous)}`} />
            <Card variant="default" padding="md" className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <span className="text-xs sm:text-sm font-medium text-foreground-secondary">Store rating</span>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary"><Star className="size-4" aria-hidden /></span>
              </div>
              <div className="font-display font-bold text-xl sm:text-2xl text-foreground tabular-nums">{d.rating.count ? d.rating.average.toFixed(1) : '—'}</div>
              <p className="text-xs text-foreground-secondary min-h-6 flex items-center">{d.rating.count ? `${formatCompactNumber(d.rating.count)} ${d.rating.count === 1 ? 'review' : 'reviews'}` : 'No reviews yet'}</p>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Card variant="elevated" padding="md" className="flex items-center gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary-subtle text-primary"><ShieldCheck className="size-5" aria-hidden /></span>
              <div className="min-w-0">
                <p className="text-xs font-medium text-foreground-secondary">Held in escrow</p>
                <p className="font-display font-bold text-lg text-foreground tabular-nums" data-testid="kpi-escrow">{fmt(d.escrowHeld)}</p>
                <p className="text-xs text-foreground-tertiary">Releases to your wallet as buyers confirm delivery</p>
              </div>
            </Card>
            <Card variant="elevated" padding="md" className="flex items-center gap-4">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-success-subtle text-success"><DollarSign className="size-5" aria-hidden /></span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium text-foreground-secondary">Paid out to date</p>
                <p className="font-display font-bold text-lg text-foreground tabular-nums">{fmt(d.paidOut)}</p>
                <Link to="/seller/earnings" className="text-xs text-primary hover:underline">Earnings & withdrawals →</Link>
              </div>
            </Card>
          </motion.div>

          {alerts.length > 0 && (
            <motion.div variants={fadeUp} className="space-y-2" role="list" aria-label="Needs attention">
              {alerts.map(alert => {
                const Icon = alert.icon;
                return (
                  <Card key={alert.message} variant="elevated" padding="md" className="flex items-center justify-between gap-4" role="listitem">
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon className={cn('size-5 shrink-0', alert.tone === 'error' ? 'text-error' : 'text-warning')} aria-hidden />
                      <p className="text-sm font-medium text-foreground">{alert.message}</p>
                    </div>
                    <Button variant="outline" size="sm" asChild><Link to={alert.href}>{alert.action}</Link></Button>
                  </Card>
                );
              })}
            </motion.div>
          )}

          <motion.div variants={fadeUp}>
            <Card variant="default" padding="lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="font-display font-semibold text-lg text-foreground">Sales · last 14 days</h2>
                <span className="text-xs text-foreground-secondary tabular-nums">{formatMoney({ amount: series.reduce((n, p) => n + p.gross, 0), currency: d.currency })} · {series.reduce((n, p) => n + p.orders, 0)} orders</span>
              </div>
              <div className="w-full h-64" role="img" aria-label={`Daily gross sales for the last 14 days, from ${series[0]?.date ?? ''} to ${series.at(-1)?.date ?? ''}`}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={series} margin={{ left: 0, right: 8, top: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id="dashGross" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                    <XAxis dataKey="label" stroke="var(--color-foreground-tertiary)" tickLine={false} axisLine={false} fontSize={12} />
                    <YAxis stroke="var(--color-foreground-tertiary)" tickLine={false} axisLine={false} fontSize={12} width={56} tickFormatter={(v: number) => formatMoney({ amount: Math.round(v * 100), currency: d.currency }, { compact: true })} />
                    <Tooltip
                      contentStyle={{ backgroundColor: 'var(--color-background-elevated)', border: '1px solid var(--color-border)', borderRadius: 12 }}
                      content={({ active, payload }) => {
                        const p = payload?.[0]?.payload as { date: string; gross: number; orders: number } | undefined;
                        if (!active || !p) return null;
                        return (
                          <div className="rounded-xl border border-border bg-background-elevated px-3 py-2 text-xs shadow-lg">
                            <p className="font-medium text-foreground">{p.date}</p>
                            <p className="text-foreground-secondary tabular-nums">{formatMoney({ amount: p.gross, currency: d.currency })} · {p.orders} {p.orders === 1 ? 'order' : 'orders'}</p>
                          </div>
                        );
                      }}
                    />
                    <Area type="monotone" dataKey="grossMajor" stroke="var(--color-primary)" strokeWidth={2} fillOpacity={1} fill="url(#dashGross)" isAnimationActive={!reduce} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </motion.div>

          <motion.div variants={fadeUp}>
            <Card variant="default" padding="lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-semibold text-lg text-foreground">Recent orders</h2>
                <Link to="/seller/orders" className="text-sm font-medium text-primary hover:underline">View all →</Link>
              </div>
              {recent.isLoading ? (
                <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-16 w-full" />)}</div>
              ) : recentOrders.length === 0 ? (
                <p className="text-sm text-foreground-secondary py-6 text-center">No orders yet — they’ll appear here the moment a shopper checks out.</p>
              ) : (
                <div className="divide-y divide-border">{recentOrders.slice(0, 5).map(o => <RecentOrderRow key={o.id} order={o} />)}</div>
              )}
            </Card>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { to: '/seller/products', icon: Package, title: 'Products', text: 'Inventory, prices & drafts' },
              { to: '/seller/analytics', icon: TrendingUp, title: 'Analytics', text: 'Deeper trends & top items' },
              { to: '/seller/settings', icon: Settings, title: 'Store settings', text: 'Profile, shipping & payouts' },
            ].map(({ to, icon: Icon, title, text }) => (
              <Link key={to} to={to} className="rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <Card variant="elevated" padding="lg" interactive className="text-center space-y-3 h-full">
                  <Icon className="size-8 text-primary mx-auto" aria-hidden />
                  <div>
                    <h3 className="font-display font-semibold text-foreground">{title}</h3>
                    <p className="text-xs text-foreground-secondary mt-1">{text}</p>
                  </div>
                </Card>
              </Link>
            ))}
          </motion.div>
        </motion.div>
      )}
    </SellerLayout>
  );
}
