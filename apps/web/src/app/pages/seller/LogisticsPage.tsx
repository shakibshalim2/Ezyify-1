import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Truck, Package, CheckCircle, Clock, ExternalLink, Search, MapPin, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, formatMoney, formatTimeAgo, useAuth, useSellerOrders, useSellerOrdersSummary, type Order, type OrderStatus } from '@ezyify/core';
import { Tabs, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Img } from '../../components/primitives/Img';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { SELLER_STATUS, SellerOrderActions } from '../../components/seller/SellerOrderActions';
import { useInfiniteList } from '../../lib/data';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

/** Logistics lens over the seller's orders: what still has to leave, what's on the road, what has landed. */
type Lane = 'to_ship' | 'in_transit' | 'delivered' | 'all';
const LANES: { key: Lane; label: string; statuses: OrderStatus[] | null }[] = [
  { key: 'to_ship', label: 'To ship', statuses: ['paid', 'processing'] },
  { key: 'in_transit', label: 'In transit', statuses: ['shipped', 'out_for_delivery'] },
  { key: 'delivered', label: 'Delivered', statuses: ['delivered', 'completed'] },
  { key: 'all', label: 'All', statuses: null },
];

/** Carrier tracking pages for the couriers sellers type most; unknown carriers fall back to the stored URL or a web search. */
const CARRIER_URLS: [RegExp, (n: string) => string][] = [
  [/j&t|jnt/i, n => `https://www.jet.co.id/track?awb=${encodeURIComponent(n)}`],
  [/jne/i, n => `https://www.jne.co.id/tracking-package?awb=${encodeURIComponent(n)}`],
  [/sicepat/i, n => `https://www.sicepat.com/checkAwb/${encodeURIComponent(n)}`],
  [/dhl/i, n => `https://www.dhl.com/track?tracking-id=${encodeURIComponent(n)}`],
  [/fedex/i, n => `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`],
  [/ups/i, n => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`],
  [/usps/i, n => `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(n)}`],
];
export function trackingUrl(t: NonNullable<Order['tracking']>): string {
  if (t.url) return t.url;
  const hit = CARRIER_URLS.find(([re]) => re.test(t.carrier));
  return hit ? hit[1](t.number) : `https://www.google.com/search?q=${encodeURIComponent(`${t.carrier} ${t.number}`)}`;
}

function LogisticsSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading shipments">
      <Skeleton className="h-10 w-64" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">{[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}</div>
      <div className="space-y-3">{[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}</div>
    </div>
  );
}

function ShipmentRow({ order }: { order: Order }) {
  const status = SELLER_STATUS[order.status];
  const Icon = status.icon;
  const destination = [order.shippingTo.city, order.shippingTo.region, order.shippingTo.country].filter(Boolean).join(', ');
  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => toast.success('Tracking number copied')).catch(() => toast.error('Could not copy'));
  return (
    <Card variant="elevated" padding="md" data-testid={`shipment-${order.id}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex gap-3 min-w-0">
          <div className="flex -space-x-3 flex-shrink-0">
            {order.items.slice(0, 3).map(i => <Img key={i.id} src={i.imageUrl} alt="" className="size-12 rounded-lg border-2 border-background object-cover bg-muted" />)}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Link to={`/seller/order-detail/${order.id}`} className="font-semibold text-foreground hover:underline">{order.orderNumber}</Link>
              <span className={cn('inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg', status.className)}><Icon className="size-3.5" aria-hidden />{status.label}</span>
            </div>
            <p className="text-sm text-foreground-secondary mt-1 truncate">
              {order.items.reduce((n, i) => n + i.quantity, 0)} item{order.items.reduce((n, i) => n + i.quantity, 0) === 1 ? '' : 's'} · {order.buyer.name} · placed {formatTimeAgo(order.placedAt)}
            </p>
            <p className="text-sm text-foreground mt-1 inline-flex items-center gap-1"><MapPin className="size-3.5 text-primary" aria-hidden />{order.shippingTo.recipient} — {destination}</p>
            {order.tracking ? (
              <p className="text-sm mt-1 flex flex-wrap items-center gap-2">
                <span className="text-foreground-secondary">{order.tracking.carrier}</span>
                <code className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{order.tracking.number}</code>
                <button type="button" onClick={() => copy(order.tracking!.number)} aria-label="Copy tracking number" className="text-foreground-tertiary hover:text-foreground"><Copy className="size-3.5" /></button>
                <a href={trackingUrl(order.tracking)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-primary font-medium hover:underline">Track<ExternalLink className="size-3.5" aria-hidden /></a>
              </p>
            ) : (order.status === 'paid' || order.status === 'processing') ? (
              <p className="text-xs text-warning mt-1">No tracking yet — ship it to add a carrier and number.</p>
            ) : null}
          </div>
        </div>
        <div className="flex flex-col items-start lg:items-end gap-2 flex-shrink-0">
          <p className="text-sm text-foreground-secondary">Shipping <span className="font-semibold text-foreground tabular-nums">{order.shipping.amount === 0 ? 'Free' : formatMoney(order.shipping)}</span> · Total <span className="font-semibold text-foreground tabular-nums">{formatMoney(order.total)}</span></p>
          <SellerOrderActions order={order} size="sm" />
        </div>
      </div>
    </Card>
  );
}

export default function LogisticsPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const [lane, setLane] = useState<Lane>('to_ship');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/seller/logistics' } });
  }, [status, navigate]);

  const summary = useSellerOrdersSummary();
  // One unfiltered list (pageSize 50) covers the lanes client-side; the API's single `status` filter can't express a lane of several statuses.
  const orders = useSellerOrders({ pageSize: 50 });
  const { items, loadMore, loadingMore, hasMore } = useInfiniteList<Order>(orders);
  const active = LANES.find(l => l.key === lane)!;
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items
      .filter(o => !active.statuses || active.statuses.includes(o.status))
      .filter(o => !q || o.orderNumber.toLowerCase().includes(q) || o.tracking?.number.toLowerCase().includes(q) || o.buyer.name.toLowerCase().includes(q) || o.shippingTo.city.toLowerCase().includes(q));
  }, [items, active, search]);

  const stats = [
    { label: 'To ship', value: summary.data?.toShip, icon: Package, tone: 'text-warning' },
    { label: 'In transit', value: summary.data?.inTransit, icon: Truck, tone: 'text-primary' },
    { label: 'Completed', value: summary.data?.completed, icon: CheckCircle, tone: 'text-success' },
    { label: 'Refunds open', value: summary.data?.refunds, icon: Clock, tone: 'text-error' },
  ];
  const forbidden = orders.error instanceof ApiError && orders.error.code === 'FORBIDDEN';

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.logistics} />
      {orders.isLoading && summary.isLoading ? (
        <LogisticsSkeleton />
      ) : forbidden ? (
        <EmptyState kind="error" title="Seller account required" description="Shipments appear here once you have a store." action={<Button asChild><Link to="/sell-on-ezyify">Start selling</Link></Button>} />
      ) : (
        <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="space-y-6">
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-foreground">Logistics</h1>
              <p className="text-sm text-foreground-secondary mt-1">Every parcel from your orders — ship, track and confirm delivery.</p>
            </div>
            <Button variant="outline" asChild><Link to="/seller/orders">All orders</Link></Button>
          </motion.div>

          <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {stats.map(({ label, value, icon: Icon, tone }) => (
              <Card key={label} variant="default" padding="md">
                <div className="flex items-center gap-3">
                  <Icon className={cn('size-5', tone)} aria-hidden />
                  <div>
                    <p className="text-xs text-foreground-secondary">{label}</p>
                    {value == null ? <Skeleton className="h-8 w-10 mt-1" /> : <p className="font-display font-bold text-2xl text-foreground tabular-nums">{value}</p>}
                  </div>
                </div>
              </Card>
            ))}
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-4">
            <Field label="Search shipments" hideLabel type="search" placeholder="Order number, tracking number, buyer or city…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="size-5" aria-hidden />} />
            <Tabs value={lane} onValueChange={v => setLane(v as Lane)}>
              <TabsList className="w-full grid grid-cols-4">
                {LANES.map(l => <TabsTrigger key={l.key} value={l.key}>{l.label}</TabsTrigger>)}
              </TabsList>
            </Tabs>

            <div className="mt-6 space-y-3" role="region" aria-live="polite" aria-label="Shipments">
              {orders.isError ? (
                <EmptyState kind="error" title="Couldn’t load shipments" description={formErrors(orders.error).message ?? 'Please try again.'} action={<Button onClick={() => orders.refetch()}>Retry</Button>} compact />
              ) : visible.length === 0 ? (
                <EmptyState
                  kind="orders"
                  title={search ? 'No shipments match' : lane === 'to_ship' ? 'Nothing waiting to ship' : lane === 'in_transit' ? 'Nothing on the road' : 'No shipments yet'}
                  description={search ? 'Try an order or tracking number.' : lane === 'to_ship' ? 'New paid orders will show up here first.' : 'Ship an order to see it here.'}
                  compact
                />
              ) : (
                <>
                  {visible.map(o => <ShipmentRow key={o.id} order={o} />)}
                  {hasMore && <div className="flex justify-center pt-2"><Button variant="outline" onClick={loadMore} loading={loadingMore}>Load more</Button></div>}
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </SellerLayout>
  );
}
