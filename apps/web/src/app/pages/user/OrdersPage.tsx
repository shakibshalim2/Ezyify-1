import { useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Package, Truck, CheckCircle, Clock, AlertCircle, RotateCcw, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatMoney, formatRelativeTime, formatTimeUntil, useOrderAction, useOrders, type Order, type OrderStatus } from '@ezyify/core';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyOrders } from '../../components/EmptyStates';
import { EscrowProtectionBanner } from '../../components/EscrowProtectionBanner';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { QueryError } from '../../components/QueryError';
import { ConfirmDialog, type ConfirmState } from '../../components/ConfirmDialog';
import { useInfiniteList } from '../../lib/data';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

const FILTERS = [
  ['all', 'All'],
  ['active', 'Active'],
  ['completed', 'Completed'],
  ['refunds', 'Refunds & cancelled'],
] as const;
type Filter = (typeof FILTERS)[number][0];
const ACTIVE: OrderStatus[] = ['pending_payment', 'paid', 'processing', 'shipped', 'out_for_delivery', 'delivered'];
const REFUNDS: OrderStatus[] = ['refund_requested', 'refunded', 'disputed', 'cancelled'];
const matches = (o: Order, f: Filter) => f === 'all' || (f === 'active' && ACTIVE.includes(o.status)) || (f === 'completed' && o.status === 'completed') || (f === 'refunds' && REFUNDS.includes(o.status));

const STATUS: Record<OrderStatus, { icon: typeof Clock; label: string; className: string }> = {
  pending_payment: { icon: Clock, label: 'Awaiting payment', className: 'bg-warning-subtle text-warning' },
  paid: { icon: CheckCircle, label: 'Paid', className: 'bg-info-subtle text-info' },
  processing: { icon: Package, label: 'Preparing', className: 'bg-info-subtle text-info' },
  shipped: { icon: Truck, label: 'Shipped', className: 'bg-info-subtle text-info' },
  out_for_delivery: { icon: Truck, label: 'Out for delivery', className: 'bg-info-subtle text-info' },
  delivered: { icon: CheckCircle, label: 'Delivered', className: 'bg-success-subtle text-success' },
  completed: { icon: CheckCircle, label: 'Completed', className: 'bg-success-subtle text-success' },
  cancelled: { icon: AlertCircle, label: 'Cancelled', className: 'bg-muted text-foreground-secondary' },
  refund_requested: { icon: RotateCcw, label: 'Refund requested', className: 'bg-warning-subtle text-warning' },
  refunded: { icon: RotateCcw, label: 'Refunded', className: 'bg-muted text-foreground-secondary' },
  disputed: { icon: AlertCircle, label: 'In dispute', className: 'bg-error-subtle text-error' },
};

function OrdersSkeleton() {
  return (
    <div className="space-y-4" aria-busy>
      {[1, 2, 3].map(i => (
        <Card key={i} className="p-4">
          <div className="space-y-4">
            <Skeleton className="h-6 w-32" />
            <div className="flex gap-4">
              <Skeleton className="size-20 rounded-card flex-shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-10 flex-1" />
              <Skeleton className="h-10 flex-1" />
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function OrderCard({ order, onConfirmRequest }: { order: Order; onConfirmRequest: (s: ConfirmState) => void }) {
  const navigate = useNavigate();
  const action = useOrderAction();
  const cfg = STATUS[order.status];
  const Icon = cfg.icon;
  const run = (vars: Parameters<typeof action.mutate>[0], ok: string) =>
    action.mutate(vars, { onSuccess: () => toast.success(ok), onError: err => toast.error(formErrors(err).message ?? 'Something went wrong') });

  const canConfirm = ['shipped', 'out_for_delivery', 'delivered'].includes(order.status);
  const canCancel = ['pending_payment', 'paid', 'processing'].includes(order.status);
  const canRefund = ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed'].includes(order.status) && order.escrow.status !== 'refunded' && !order.refund;

  return (
    <Card variant="elevated" className={cn(action.isPending && 'opacity-70')}>
      <div className="p-4 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="font-display font-semibold text-foreground">{order.orderNumber}</p>
              <span className={cn('inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium', cfg.className)}>
                <Icon className="size-3.5" />
                {cfg.label}
              </span>
            </div>
            <p className="text-xs text-foreground-secondary">
              <Link to={`/profile/${order.seller.username}`} className="hover:underline">{order.seller.name}</Link> • {formatRelativeTime(order.placedAt)}
            </p>
          </div>
          <p className="font-display font-bold text-lg tabular-nums text-foreground flex-shrink-0">{formatMoney(order.total)}</p>
        </div>

        <div className="space-y-2">
          {order.items.slice(0, 2).map(item => (
            <Link key={item.id} to={`/product/${item.productId}`} className="flex gap-3 rounded-lg -mx-1 px-1 py-0.5 hover:bg-muted/60 transition-colors">
              <ImageWithFallback src={item.imageUrl} alt="" loading="lazy" className="size-16 rounded-lg object-cover flex-shrink-0 bg-card" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                <p className="text-xs text-foreground-secondary">
                  {item.variant ? `${item.variant} • ` : ''}Qty {item.quantity} • {formatMoney(item.unitPrice)}
                </p>
              </div>
            </Link>
          ))}
          {order.items.length > 2 && (
            <p className="text-xs text-foreground-secondary px-1">+{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}</p>
          )}
        </div>

        <div className="flex items-center gap-2 rounded-xl bg-background-elevated px-3 py-2 text-xs text-foreground-secondary">
          <ShieldCheck className={cn('size-4 shrink-0', order.escrow.status === 'held' ? 'text-primary' : order.escrow.status === 'released' ? 'text-success' : 'text-foreground-tertiary')} />
          {order.escrow.status === 'held' && (
            <span>
              {formatMoney(order.total)} held in escrow
              {order.escrow.autoReleaseAt ? ` · auto-releases ${formatTimeUntil(order.escrow.autoReleaseAt)}` : ''}
            </span>
          )}
          {order.escrow.status === 'released' && <span>Paid to seller after you confirmed delivery</span>}
          {order.escrow.status === 'refunded' && <span>Refunded to your wallet</span>}
          {order.escrow.status === 'disputed' && <span>Under review — funds stay in escrow</span>}
          {order.tracking && (
            <a href={order.tracking.url ?? undefined} target="_blank" rel="noreferrer" className="ml-auto font-medium text-primary hover:underline">
              {order.tracking.carrier} {order.tracking.number}
            </a>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          {canConfirm && (
            <Button
              variant="gradient"
              size="sm"
              onClick={() =>
                onConfirmRequest({
                  title: 'Confirm delivery?',
                  message: `This releases ${formatMoney(order.total)} to ${order.seller.name}. Only confirm once you have the items.`,
                  confirmLabel: 'Confirm delivery',
                  cancelLabel: 'Not yet',
                  onConfirm: () => run({ id: order.id, action: 'confirm' }, 'Delivery confirmed — escrow released'),
                })
              }
            >
              Confirm delivery
            </Button>
          )}
          {canRefund && (
            <Button variant="secondary" size="sm" asChild>
              <Link to={`/orders/${order.id}/refund/new`}>Problem with order</Link>
            </Button>
          )}
          {(order.status === 'refund_requested' || order.status === 'disputed' || (order.status === 'refunded' && order.refund)) && (
            <Button variant={order.status === 'refunded' ? 'outline' : 'gradient'} size="sm" asChild>
              <Link to={`/orders/${order.id}/refund`}>{order.status === 'refund_requested' && order.refund?.status === 'rejected' ? 'Seller declined · respond' : 'View refund case'}</Link>
            </Button>
          )}
          {canCancel && (
            <Button
              variant="outline"
              size="sm"
              className={cn(order.status === 'pending_payment' && 'col-span-1')}
              onClick={() =>
                onConfirmRequest({
                  title: 'Cancel order?',
                  message: order.status === 'pending_payment' ? 'The order will be removed.' : 'Your payment is refunded to your wallet instantly.',
                  confirmLabel: 'Cancel order',
                  cancelLabel: 'Keep it',
                  destructive: true,
                  onConfirm: () => run({ id: order.id, action: 'cancel' }, 'Order cancelled'),
                })
              }
            >
              Cancel order
            </Button>
          )}
          {order.status === 'pending_payment' && (
            <Button variant="gradient" size="sm" onClick={() => navigate('/wallet')}>
              Complete payment
            </Button>
          )}
          {order.status === 'completed' && (
            <>
              <Button variant="outline" size="sm" asChild>
                <Link to={`/product/${order.items[0].productId}`}>Buy again</Link>
              </Button>
              <Button variant="secondary" size="sm" asChild>
                <Link to={`/messages?with=${order.seller.username}`}>Message seller</Link>
              </Button>
            </>
          )}
          {REFUNDS.includes(order.status) && order.status !== 'cancelled' && (
            <Button variant="secondary" size="sm" className="col-span-2" asChild>
              <Link to={`/messages?with=${order.seller.username}`}>Message seller</Link>
            </Button>
          )}
          {order.status === 'cancelled' && (
            <Button variant="secondary" size="sm" className="col-span-2" asChild>
              <Link to="/shop">Shop similar</Link>
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function OrdersPage() {
  const reduce = useReducedMotion();
  const [params, setParams] = useSearchParams();
  const initial = params.get('filter');
  const [filter, setFilterState] = useState<Filter>(FILTERS.some(([id]) => id === initial) ? (initial as Filter) : 'all');
  const setFilter = (f: Filter) => { setFilterState(f); setParams(f === 'all' ? {} : { filter: f }, { replace: true }); };
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const orders = useOrders({ pageSize: 50 });
  const { items, loadMore, hasMore, loadingMore } = useInfiniteList<Order>(orders);
  const list = useMemo(() => items.filter(o => matches(o, filter)), [items, filter]);
  const counts = useMemo(() => Object.fromEntries(FILTERS.map(([id]) => [id, items.filter(o => matches(o, id)).length])) as Record<Filter, number>, [items]);
  const held = useMemo(() => items.filter(o => o.escrow.status === 'held').reduce((n, o) => n + o.total.amount, 0), [items]);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Orders — Ezyify" description="Track and manage your Ezyify orders." />
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />

      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8 lg:px-6 lg:py-8">
        <motion.div variants={staggerContainer(reduce ? 0 : 0.05, 0)} initial="hidden" animate="visible" className="px-4 py-6 pb-28 lg:p-0 space-y-6">
          <motion.div variants={fadeUp} className="space-y-1">
            <h1 className="font-display text-2xl font-semibold text-foreground">My Orders</h1>
            <p className="text-sm text-foreground-secondary">Track and manage your orders</p>
          </motion.div>

          <motion.div variants={fadeUp} role="group" aria-label="Filter orders" className="flex gap-2 overflow-x-auto pb-2">
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
                {counts[id] > 0 && id !== 'all' && (
                  <span className="ml-2 inline-flex items-center justify-center size-5 rounded-full text-xs font-semibold bg-foreground/10">{counts[id]}</span>
                )}
              </button>
            ))}
          </motion.div>

          {orders.isLoading ? (
            <OrdersSkeleton />
          ) : orders.error ? (
            <QueryError error={orders.error} onRetry={() => void orders.refetch()} />
          ) : list.length === 0 ? (
            <motion.div variants={fadeUp}>
              <EmptyOrders />
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer(reduce ? 0 : 0.04)} className="space-y-4">
              {list.map(order => (
                <motion.div key={order.id} variants={fadeUp}>
                  <OrderCard order={order} onConfirmRequest={setConfirm} />
                </motion.div>
              ))}
              {hasMore && (
                <div className="flex justify-center">
                  <Button variant="secondary" size="md" loading={loadingMore} onClick={loadMore}>
                    Load more
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </motion.div>

        <div className="hidden lg:block">
          <div className="sticky top-24">
            <EscrowProtectionBanner amount={held / 100} variant="cart" />
          </div>
        </div>
      </div>
    </div>
  );
}
