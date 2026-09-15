import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Package, Search, Eye, Truck, CheckCircle, AlertCircle, ShieldCheck } from 'lucide-react';
import { avatarUrlFor, formatMoney, formatTimeAgo, formatTimeUntil, useAuth, useSellerOrders, useSellerOrdersSummary, type Order, type OrderStatus } from '@ezyify/core';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Img } from '../../components/primitives/Img';
import { QueryError } from '../../components/QueryError';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { SellerOrderActions, SELLER_STATUS, PAYMENT_LABEL } from '../../components/seller/SellerOrderActions';
import { useInfiniteList } from '../../lib/data';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

const FILTERS = [
  ['all', 'All'],
  ['action', 'Needs action'],
  ['transit', 'In transit'],
  ['completed', 'Completed'],
  ['refunds', 'Refunds & cancelled'],
] as const;
type Filter = (typeof FILTERS)[number][0];
const ACTION: OrderStatus[] = ['paid', 'processing', 'refund_requested'];
const TRANSIT: OrderStatus[] = ['shipped', 'out_for_delivery', 'delivered'];
const REFUNDS: OrderStatus[] = ['refund_requested', 'refunded', 'disputed', 'cancelled'];
const matches = (o: Order, f: Filter) =>
  f === 'all' || (f === 'action' && ACTION.includes(o.status)) || (f === 'transit' && TRANSIT.includes(o.status)) || (f === 'completed' && o.status === 'completed') || (f === 'refunds' && REFUNDS.includes(o.status));

function OrdersSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      {[1, 2, 3].map(i => (
        <Card key={i} className="p-4 space-y-4">
          <Skeleton className="h-6 w-40" />
          <div className="flex gap-4">
            <Skeleton className="size-16 rounded-card flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <Skeleton className="h-10 w-48" />
        </Card>
      ))}
    </div>
  );
}

function SellerOrderCard({ order }: { order: Order }) {
  const cfg = SELLER_STATUS[order.status];
  const Icon = cfg.icon;
  const escrow = order.escrow;
  return (
    <Card variant="elevated" data-testid={`seller-order-${order.id}`}>
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <Link to={`/seller/order-detail/${order.id}`} className="font-display font-semibold text-foreground hover:underline">{order.orderNumber}</Link>
              <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', cfg.className)}>
                <Icon className="size-3.5" aria-hidden />
                {cfg.label}
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-foreground-secondary">
              <Img src={avatarUrlFor(order.buyer, 48)} alt="" className="size-5 rounded-full object-cover" />
              <Link to={`/profile/${order.buyer.username}`} className="hover:underline font-medium text-foreground">{order.buyer.name}</Link>
              <span aria-hidden>•</span>
              <span>{order.shippingTo.city}, {order.shippingTo.country}</span>
              <span aria-hidden>•</span>
              <time dateTime={order.placedAt}>{formatTimeAgo(order.placedAt)}</time>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <p className="font-display font-bold text-lg tabular-nums text-foreground">{formatMoney(order.total)}</p>
            <p className="text-xs text-foreground-secondary">{PAYMENT_LABEL[order.paymentMethod]}</p>
          </div>
        </div>

        <ul className="space-y-2">
          {order.items.slice(0, 2).map(item => (
            <li key={item.id} className="flex gap-3">
              <Img src={item.imageUrl} alt="" loading="lazy" className="size-14 rounded-lg object-cover flex-shrink-0 bg-card" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-foreground-secondary">{item.variant ? `${item.variant} • ` : ''}Qty {item.quantity} • {formatMoney(item.unitPrice)}</p>
              </div>
            </li>
          ))}
          {order.items.length > 2 && <li className="text-xs text-foreground-secondary">+{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}</li>}
        </ul>

        <div className="flex items-center gap-2 rounded-xl bg-background-elevated px-3 py-2 text-xs text-foreground-secondary">
          <ShieldCheck className={cn('size-4 shrink-0', escrow.status === 'held' ? 'text-primary' : escrow.status === 'released' ? 'text-success' : 'text-foreground-tertiary')} aria-hidden />
          {escrow.status === 'held' && (escrow.autoReleaseAt ? `Escrow held · auto-releases to you ${formatTimeUntil(escrow.autoReleaseAt)}` : 'Escrow held until the buyer confirms delivery')}
          {escrow.status === 'released' && 'Escrow released to your wallet'}
          {escrow.status === 'refunded' && 'Refunded to the buyer'}
          {escrow.status === 'disputed' && 'Escrow frozen while the refund is decided'}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <SellerOrderActions order={order} size="sm" />
          <Button variant="ghost" size="sm" asChild>
            <Link to={`/seller/order-detail/${order.id}`}><Eye className="size-4" aria-hidden />Details</Link>
          </Button>
        </div>
      </div>
    </Card>
  );
}

/** Seller hub orders on `GET /orders?role=seller` + the seller state-machine endpoints. */
export default function OrderManagement() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const [filter, setFilter] = useState<Filter>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/seller/orders' } });
  }, [status, navigate]);

  const orders = useSellerOrders({ pageSize: 50 });
  const summary = useSellerOrdersSummary();
  const { items, loadMore, hasMore, loadingMore } = useInfiniteList<Order>(orders);
  const list = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter(o => matches(o, filter)).filter(o => !q || o.orderNumber.toLowerCase().includes(q) || o.buyer.name.toLowerCase().includes(q) || o.buyer.username.toLowerCase().includes(q) || o.items.some(i => i.name.toLowerCase().includes(q)));
  }, [items, filter, search]);
  const held = useMemo(() => items.filter(o => o.escrow.status === 'held').reduce((n, o) => n + o.total.amount, 0), [items]);

  const counts: Partial<Record<Filter, number>> = summary.data
    ? { action: summary.data.needsAction, transit: summary.data.inTransit, completed: summary.data.completed, refunds: summary.data.refunds }
    : {};

  const stats = [
    { label: 'Needs action', value: summary.data?.needsAction, icon: AlertCircle, tone: 'text-warning' },
    { label: 'To ship', value: summary.data?.toShip, icon: Package, tone: 'text-info' },
    { label: 'In transit', value: summary.data?.inTransit, icon: Truck, tone: 'text-primary' },
    { label: 'Completed', value: summary.data?.completed, icon: CheckCircle, tone: 'text-success' },
  ];

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.orders} />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Orders</h1>
            <p className="text-sm text-foreground-secondary mt-1">
              {summary.data ? `${summary.data.total} ${summary.data.total === 1 ? 'order' : 'orders'} · ${formatMoney({ amount: held, currency: 'USD' })} held in escrow for you` : 'Accept, ship and settle orders'}
            </p>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {stats.map(({ label, value, icon: Icon, tone }) => (
            <Card key={label} variant="default" padding="md">
              <div className="flex items-center gap-3">
                <Icon className={cn('size-5', tone)} aria-hidden />
                <div>
                  <p className="text-xs font-medium text-foreground-secondary">{label}</p>
                  {value != null ? <p className="font-display font-bold text-2xl text-foreground tabular-nums">{value}</p> : <Skeleton className="h-8 w-10 mt-1" />}
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        <motion.div variants={fadeUp} className="space-y-4">
          <Field label="Search orders" type="search" placeholder="Order number, buyer or product…" value={search} onChange={e => setSearch(e.target.value)} leftIcon={<Search className="size-5" aria-hidden />} />

          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1" role="group" aria-label="Filter orders">
            {FILTERS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                aria-pressed={filter === id}
                className={cn(
                  'px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all',
                  filter === id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-card-hover',
                )}
              >
                {label}
                {counts[id] ? <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs font-semibold bg-foreground/10 tabular-nums">{counts[id]}</span> : null}
              </button>
            ))}
          </div>

          <div role="region" aria-live="polite" aria-label="Order list">
            {orders.isLoading ? (
              <OrdersSkeleton />
            ) : orders.error ? (
              <QueryError error={orders.error} onRetry={() => void orders.refetch()} />
            ) : list.length === 0 ? (
              <EmptyState
                kind="orders"
                title={search || filter !== 'all' ? 'No orders match' : 'No orders yet'}
                description={search || filter !== 'all' ? 'Try a different search or filter.' : 'When shoppers buy from your store, orders land here with escrow already held.'}
                action={search || filter !== 'all' ? undefined : <Button asChild><Link to="/seller/products">Manage products</Link></Button>}
                compact
              />
            ) : (
              <motion.div variants={staggerContainer(reduce ? 0 : 0.04)} className="space-y-4">
                {list.map(order => (
                  <motion.div key={order.id} variants={fadeUp}>
                    <SellerOrderCard order={order} />
                  </motion.div>
                ))}
                {hasMore && (
                  <div className="flex justify-center">
                    <Button variant="secondary" size="md" loading={loadingMore} onClick={loadMore}>Load more</Button>
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
