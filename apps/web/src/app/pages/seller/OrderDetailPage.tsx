import { useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, CheckCircle, Clock, MapPin, ShieldCheck, Truck, CreditCard, StickyNote } from 'lucide-react';
import { avatarUrlFor, formatMoney, formatTimeUntil, useAuth, useOrder, useOrderTimeline, type OrderStatus } from '@ezyify/core';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Img } from '../../components/primitives/Img';
import { QueryError } from '../../components/QueryError';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { SellerOrderActions, SELLER_STATUS, PAYMENT_LABEL } from '../../components/seller/SellerOrderActions';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

const EVENT_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Order placed',
  paid: 'Payment held in escrow',
  processing: 'You accepted the order',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  completed: 'Buyer confirmed · escrow released',
  cancelled: 'Cancelled',
  refund_requested: 'Buyer requested a refund',
  refunded: 'Refunded',
  disputed: 'Dispute opened',
};

const dateTime = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function DetailSkeleton() {
  return (
    <div className="max-w-5xl mx-auto space-y-6" aria-busy>
      <Skeleton className="h-8 w-56" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-64" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
      </div>
    </div>
  );
}

/** Seller view of one order: real timeline, buyer + destination, escrow state and the next-step actions. */
export default function OrderDetailPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { id } = useParams();
  const status = useAuth(s => s.status);
  const order = useOrder(id);
  const timeline = useOrderTimeline(id);

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: `/seller/order-detail/${id}` } });
  }, [status, navigate, id]);

  if (order.isLoading) {
    return (
      <SellerLayout>
        <DetailSkeleton />
      </SellerLayout>
    );
  }
  if (order.isError || !order.data) {
    return (
      <SellerLayout>
        <div className="max-w-2xl mx-auto">
          {order.isError ? (
            <QueryError error={order.error} onRetry={() => void order.refetch()} />
          ) : (
            <EmptyState kind="orders" title="Order not found" description="It may belong to another seller or have been removed." action={<Button asChild><Link to="/seller/orders">Back to orders</Link></Button>} />
          )}
        </div>
      </SellerLayout>
    );
  }

  const o = order.data;
  const cfg = SELLER_STATUS[o.status];
  const StatusIcon = cfg.icon;
  const events = timeline.data ?? [];

  return (
    <SellerLayout>
      <SEO title={`Order ${o.orderNumber} — Ezyify Seller`} description="View and manage this order." />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="max-w-5xl mx-auto space-y-6">
        <motion.div variants={fadeUp} className="space-y-3">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link to="/seller/orders"><ArrowLeft className="size-4" aria-hidden />All orders</Link>
          </Button>
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="font-display text-2xl font-semibold text-foreground">{o.orderNumber}</h1>
                <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', cfg.className)} data-testid="seller-order-status">
                  <StatusIcon className="size-3.5" aria-hidden />
                  {cfg.label}
                </span>
              </div>
              <p className="text-sm text-foreground-secondary mt-1">Placed {dateTime(o.placedAt)} · {PAYMENT_LABEL[o.paymentMethod]}</p>
            </div>
            <SellerOrderActions order={o} />
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Items</h2>
                <ul className="divide-y divide-border">
                  {o.items.map(item => (
                    <li key={item.id} className="flex gap-4 py-3 first:pt-0 last:pb-0">
                      <Img src={item.imageUrl} alt="" className="size-16 rounded-lg object-cover flex-shrink-0 bg-card" />
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${item.productId}`} className="text-sm font-medium text-foreground hover:underline line-clamp-2">{item.name}</Link>
                        <p className="text-xs text-foreground-secondary mt-0.5">{item.variant ? `${item.variant} • ` : ''}Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-semibold tabular-nums text-foreground">{formatMoney({ amount: item.unitPrice.amount * item.quantity, currency: item.unitPrice.currency })}</p>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
                  <div className="flex justify-between text-foreground-secondary"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(o.subtotal)}</dd></div>
                  <div className="flex justify-between text-foreground-secondary"><dt>Shipping</dt><dd className="tabular-nums">{o.shipping.amount === 0 ? 'Free' : formatMoney(o.shipping)}</dd></div>
                  <div className="flex justify-between font-display font-semibold text-foreground text-base pt-1"><dt>Total</dt><dd className="tabular-nums">{formatMoney(o.total)}</dd></div>
                </dl>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-6 text-foreground">Timeline</h2>
                {timeline.isLoading ? (
                  <div className="space-y-4">{[1, 2, 3].map(i => <Skeleton key={i} className="h-10" />)}</div>
                ) : timeline.isError ? (
                  <QueryError error={timeline.error} onRetry={() => void timeline.refetch()} compact />
                ) : (
                  <ol className="space-y-0">
                    {events.map((e, i) => {
                      const last = i === events.length - 1;
                      return (
                        <li key={`${e.status}-${e.at}`} className="flex gap-4">
                          <div className="flex flex-col items-center">
                            <div className={cn('size-9 rounded-full flex items-center justify-center flex-shrink-0', last ? 'bg-primary text-primary-foreground' : 'bg-success-subtle text-success')}>
                              {last ? <Clock className="size-4" aria-hidden /> : <CheckCircle className="size-4" aria-hidden />}
                            </div>
                            {!last && <div className="w-0.5 flex-1 min-h-6 bg-border" aria-hidden />}
                          </div>
                          <div className="pb-6">
                            <p className="font-medium text-foreground">{EVENT_LABEL[e.status]}</p>
                            <p className="text-xs text-foreground-secondary"><time dateTime={e.at}>{dateTime(e.at)}</time>{e.note ? ` · ${e.note}` : ''}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                )}
              </Card>
            </motion.div>
          </div>

          <div className="space-y-6">
            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Buyer</h2>
                <div className="flex items-center gap-3">
                  <Img src={avatarUrlFor(o.buyer, 96)} alt="" className="size-12 rounded-full object-cover" />
                  <div className="min-w-0">
                    <Link to={`/profile/${o.buyer.username}`} className="font-medium text-foreground hover:underline truncate block">{o.buyer.name}</Link>
                    <p className="text-xs text-foreground-secondary truncate">@{o.buyer.username}</p>
                  </div>
                </div>
                <address className="mt-4 not-italic text-sm text-foreground-secondary flex gap-2">
                  <MapPin className="size-4 mt-0.5 flex-shrink-0 text-foreground-tertiary" aria-hidden />
                  <span>
                    <span className="text-foreground font-medium">{o.shippingTo.recipient}</span><br />
                    {o.shippingTo.city}{o.shippingTo.region ? `, ${o.shippingTo.region}` : ''}<br />
                    {o.shippingTo.country}
                  </span>
                </address>
                {o.note && (
                  <p className="mt-4 flex gap-2 text-sm text-foreground-secondary rounded-lg bg-background-elevated p-3">
                    <StickyNote className="size-4 mt-0.5 flex-shrink-0 text-foreground-tertiary" aria-hidden />
                    <span>“{o.note}”</span>
                  </p>
                )}
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Escrow</h2>
                <div className="flex items-start gap-3">
                  <ShieldCheck className={cn('size-5 flex-shrink-0 mt-0.5', o.escrow.status === 'held' ? 'text-primary' : o.escrow.status === 'released' ? 'text-success' : 'text-foreground-tertiary')} aria-hidden />
                  <div className="text-sm">
                    <p className="font-medium text-foreground capitalize">{o.escrow.status}</p>
                    <p className="text-foreground-secondary mt-0.5">
                      {o.escrow.status === 'held' && (o.escrow.autoReleaseAt ? `Auto-releases to your wallet ${formatTimeUntil(o.escrow.autoReleaseAt)} unless the buyer confirms earlier.` : 'Released to your wallet once the buyer confirms delivery.')}
                      {o.escrow.status === 'released' && 'Paid out to your wallet minus the platform fee.'}
                      {o.escrow.status === 'refunded' && 'Returned to the buyer.'}
                      {o.escrow.status === 'disputed' && 'Frozen until the refund request is resolved.'}
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-foreground-secondary">
                  <CreditCard className="size-4 text-foreground-tertiary" aria-hidden />
                  {PAYMENT_LABEL[o.paymentMethod]}
                </div>
              </Card>
            </motion.div>

            {o.tracking && (
              <motion.div variants={fadeUp}>
                <Card variant="default" padding="lg">
                  <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Shipment</h2>
                  <div className="flex items-start gap-3 text-sm">
                    <Truck className="size-5 text-primary flex-shrink-0 mt-0.5" aria-hidden />
                    <div>
                      <p className="font-medium text-foreground">{o.tracking.carrier}</p>
                      <p className="text-foreground-secondary font-mono text-xs mt-0.5" data-testid="seller-order-tracking">{o.tracking.number}</p>
                      {o.tracking.url && (
                        <a href={o.tracking.url} target="_blank" rel="noreferrer" className="text-primary hover:underline text-xs mt-1 inline-block">Track parcel ↗</a>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </SellerLayout>
  );
}
