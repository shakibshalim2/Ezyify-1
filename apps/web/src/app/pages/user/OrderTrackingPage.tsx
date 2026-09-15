import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { ChevronLeft, Truck, MapPin, Package, CheckCircle, Clock, Copy, ExternalLink, MessageCircle, ShieldCheck, RotateCcw, AlertCircle, Wallet, Scale } from 'lucide-react';
import { formatMoney, formatRelativeTime, formatTimeUntil, useAuth, useOrder, useOrderAction, useOrderTimeline, type Order, type OrderStatus } from '@ezyify/core';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Img } from '../../components/primitives/Img';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { QueryError } from '../../components/QueryError';
import { ConfirmDialog, type ConfirmState } from '../../components/ConfirmDialog';
import { PAYMENT_LABEL } from '../../components/seller/SellerOrderActions';
import { trackingUrl } from '../../lib/tracking';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

/** Buyer-facing labels for order events (the seller hub has its own). */
const EVENT_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Order placed',
  paid: 'Payment held in escrow',
  processing: 'Seller is preparing your order',
  shipped: 'Shipped',
  out_for_delivery: 'Out for delivery',
  delivered: 'Delivered',
  completed: 'You confirmed delivery · escrow released',
  cancelled: 'Cancelled',
  refund_requested: 'Refund requested',
  refunded: 'Refunded to your wallet',
  disputed: 'Escalated to Ezyify',
};
/** The happy-path stepper; refund/dispute states render as a banner instead of a step. */
const STEPS: { key: OrderStatus; label: string; icon: typeof Clock }[] = [
  { key: 'paid', label: 'Paid', icon: Wallet },
  { key: 'processing', label: 'Preparing', icon: Package },
  { key: 'shipped', label: 'Shipped', icon: Truck },
  { key: 'delivered', label: 'Delivered', icon: MapPin },
  { key: 'completed', label: 'Complete', icon: CheckCircle },
];
const STAGE: Record<OrderStatus, number> = { pending_payment: -1, paid: 0, processing: 1, shipped: 2, out_for_delivery: 2, delivered: 3, completed: 4, cancelled: -1, refund_requested: -1, refunded: -1, disputed: -1 };
const dateTime = (iso: string) => new Date(iso).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });

function TrackingSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6" aria-busy="true" aria-label="Loading order">
      <Skeleton className="h-8 w-56" />
      <Skeleton className="h-28 rounded-card" />
      <Skeleton className="h-48 rounded-card" />
      <Skeleton className="h-64 rounded-card" />
    </div>
  );
}

function Stepper({ order }: { order: Order }) {
  const stage = STAGE[order.status];
  return (
    <ol className="grid grid-cols-5 gap-1" aria-label="Order progress">
      {STEPS.map((s, i) => {
        const done = stage >= i;
        const current = stage === i;
        const Icon = s.icon;
        return (
          <li key={s.key} className="flex flex-col items-center text-center gap-1.5" aria-current={current ? 'step' : undefined}>
            <div className="flex items-center w-full">
              <span className={cn('h-0.5 flex-1', i === 0 ? 'bg-transparent' : done ? 'bg-primary' : 'bg-border')} aria-hidden />
              <span className={cn('size-8 rounded-full grid place-items-center flex-shrink-0 transition-colors', done ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground-tertiary', current && 'ring-4 ring-primary/20')}><Icon className="size-4" aria-hidden /></span>
              <span className={cn('h-0.5 flex-1', i === STEPS.length - 1 ? 'bg-transparent' : stage > i ? 'bg-primary' : 'bg-border')} aria-hidden />
            </div>
            <span className={cn('text-[11px] sm:text-xs font-medium', done ? 'text-foreground' : 'text-foreground-tertiary')}>{s.label}</span>
          </li>
        );
      })}
    </ol>
  );
}

function StatusBanner({ order }: { order: Order }) {
  const s = order.status;
  if (s === 'refund_requested' || s === 'disputed' || s === 'refunded' || s === 'cancelled') {
    const cfg = s === 'refunded' || s === 'cancelled'
      ? { icon: RotateCcw, title: s === 'cancelled' ? 'Order cancelled' : 'Refunded to your wallet', body: `${formatMoney(order.total)} is back in your Ezyify wallet.`, tone: 'bg-muted text-foreground-secondary' }
      : s === 'disputed'
        ? { icon: Scale, title: 'Ezyify is reviewing your case', body: 'Escrow is frozen until we decide — usually within 3 business days.', tone: 'bg-primary/10 text-primary' }
        : { icon: AlertCircle, title: order.refund?.status === 'rejected' ? 'Seller declined your refund' : 'Refund requested', body: order.refund?.status === 'rejected' ? 'You can withdraw the request or escalate to Ezyify.' : 'The seller has 48 hours to respond. Your money stays in escrow.', tone: 'bg-warning/15 text-warning' };
    const Icon = cfg.icon;
    return (
      <Card variant="default" padding="md" className="flex items-center gap-3" data-testid="tracking-banner">
        <span className={cn('size-10 rounded-full grid place-items-center flex-shrink-0', cfg.tone)}><Icon className="size-5" aria-hidden /></span>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground">{cfg.title}</p>
          <p className="text-xs text-foreground-secondary">{cfg.body}</p>
        </div>
        {order.refund && <Button size="sm" variant={s === 'refund_requested' ? 'gradient' : 'outline'} asChild><Link to={`/orders/${order.id}/refund`}>View case</Link></Button>}
      </Card>
    );
  }
  if (s === 'pending_payment') {
    return (
      <Card variant="default" padding="md" className="flex items-center gap-3" data-testid="tracking-banner">
        <span className="size-10 rounded-full grid place-items-center bg-warning/15 text-warning"><Clock className="size-5" aria-hidden /></span>
        <div className="flex-1"><p className="font-semibold text-foreground">Waiting for payment</p><p className="text-xs text-foreground-secondary">Complete payment to start fulfilment.</p></div>
        <Button size="sm" variant="gradient" asChild><Link to="/wallet">Pay now</Link></Button>
      </Card>
    );
  }
  return null;
}

/** Buyer order tracking on `GET /orders/:id` + `/timeline`: stepper, carrier tracking, items, escrow, actions. */
export default function OrderTrackingPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { orderId } = useParams<{ orderId: string }>();
  const status = useAuth(s => s.status);
  const me = useAuth(s => s.user);
  const order = useOrder(orderId);
  const timeline = useOrderTimeline(orderId);
  const action = useOrderAction();
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: `/orders/${orderId ?? ''}` } });
  }, [status, navigate, orderId]);

  const run = (vars: Parameters<typeof action.mutate>[0], ok: string) =>
    action.mutate(vars, { onSuccess: () => toast.success(ok), onError: err => toast.error(formErrors(err).message ?? 'Something went wrong') });
  const copy = (text: string) => navigator.clipboard?.writeText(text).then(() => toast.success('Tracking number copied')).catch(() => toast.error('Could not copy'));

  const o = order.data;
  // A seller landing on their own sale belongs in the seller hub view.
  useEffect(() => {
    if (o && me && o.seller.id === me.id && o.buyer.id !== me.id) navigate(`/seller/order-detail/${o.id}`, { replace: true });
  }, [o, me, navigate]);

  const events = [...(timeline.data ?? [])].reverse();
  const canConfirm = o && ['shipped', 'out_for_delivery', 'delivered'].includes(o.status) && o.escrow.status === 'held';
  const canCancel = o && ['pending_payment', 'paid', 'processing'].includes(o.status);
  const canRefund = o && ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed'].includes(o.status) && o.escrow.status !== 'refunded' && !o.refund;

  return (
    <div className="min-h-screen bg-background">
      <SEO title={o ? `Order ${o.orderNumber} — Ezyify` : 'Order — Ezyify'} description="Track your order, carrier updates and escrow status." />
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
      <div className="max-w-3xl mx-auto px-4 py-6 lg:py-8">
        {!orderId ? (
          <EmptyState kind="orders" title="Pick an order to track" description="Every order shows live status, carrier tracking and escrow." action={<Button asChild><Link to="/orders">My orders</Link></Button>} />
        ) : order.isLoading || status === 'anonymous' ? (
          <TrackingSkeleton />
        ) : order.isError || !o ? (
          <QueryError error={order.error} onRetry={() => void order.refetch()} />
        ) : (
          <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="space-y-6">
            <motion.header variants={fadeUp} className="flex items-center gap-3">
              <Button aria-label="Back to orders" variant="ghost" size="icon" asChild><Link to="/orders"><ChevronLeft /></Link></Button>
              <div className="min-w-0 flex-1">
                <h1 className="font-display text-2xl font-semibold text-foreground truncate">{o.orderNumber}</h1>
                <p className="text-sm text-foreground-secondary">Placed {formatRelativeTime(o.placedAt)} · <Link to={`/seller/${o.seller.username}`} className="hover:underline text-foreground">{o.seller.name}</Link></p>
              </div>
              <span className="text-lg font-display font-bold tabular-nums text-foreground">{formatMoney(o.total)}</span>
            </motion.header>

            <motion.div variants={fadeUp}><StatusBanner order={o} /></motion.div>

            {STAGE[o.status] >= 0 && (
              <motion.div variants={fadeUp}>
                <Card variant="default" padding="lg" data-testid="tracking-stepper">
                  <Stepper order={o} />
                  <p className="mt-4 text-sm text-center text-foreground-secondary">
                    {o.status === 'completed' ? 'All done — thanks for shopping with escrow protection.' :
                      o.status === 'delivered' ? `Delivered${o.deliveredAt ? ` ${formatRelativeTime(o.deliveredAt)}` : ''}. Confirm to release payment to the seller.` :
                        o.status === 'out_for_delivery' ? 'The courier has your parcel out for delivery today.' :
                          o.status === 'shipped' ? 'On its way — follow the parcel with the tracking number below.' :
                            o.status === 'processing' ? 'The seller is packing your order.' : 'Payment received and held safely in escrow.'}
                  </p>
                </Card>
              </motion.div>
            )}

            {o.tracking && (
              <motion.div variants={fadeUp}>
                <Card variant="featured" padding="lg" className="flex flex-col sm:flex-row sm:items-center gap-4" data-testid="tracking-carrier">
                  <span className="size-12 rounded-full bg-primary/15 text-primary grid place-items-center flex-shrink-0"><Truck className="size-6" aria-hidden /></span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">{o.tracking.carrier}</p>
                    <div className="flex items-center gap-2">
                      <code className="font-mono text-base text-foreground">{o.tracking.number}</code>
                      <button type="button" onClick={() => copy(o.tracking!.number)} aria-label="Copy tracking number" className="text-foreground-tertiary hover:text-foreground"><Copy className="size-4" /></button>
                    </div>
                  </div>
                  <Button variant="outline" asChild><a href={trackingUrl(o.tracking)} target="_blank" rel="noreferrer">Track with {o.tracking.carrier}<ExternalLink className="size-4" aria-hidden /></a></Button>
                </Card>
              </motion.div>
            )}

            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-3">
              {canConfirm && (
                <Button variant="gradient" size="lg" loading={action.isPending} leftIcon={<CheckCircle className="size-5" aria-hidden />} onClick={() => setConfirm({ title: 'Confirm delivery?', message: `${formatMoney(o.total)} is released from escrow to ${o.seller.name}. Only confirm once everything arrived as described.`, confirmLabel: 'Release payment', onConfirm: () => run({ id: o.id, action: 'confirm' }, 'Delivery confirmed — escrow released') })}>
                  Confirm delivery
                </Button>
              )}
              {canRefund && <Button variant={canConfirm ? 'outline' : 'secondary'} size="lg" asChild><Link to={`/orders/${o.id}/refund/new`}>Problem with order</Link></Button>}
              {canCancel && (
                <Button variant="outline" size="lg" disabled={action.isPending} onClick={() => setConfirm({ title: 'Cancel order?', message: o.status === 'pending_payment' ? 'The order will be removed.' : 'Your payment is refunded to your wallet instantly.', confirmLabel: 'Cancel order', cancelLabel: 'Keep it', destructive: true, onConfirm: () => run({ id: o.id, action: 'cancel' }, 'Order cancelled') })}>
                  Cancel order
                </Button>
              )}
              <Button variant="ghost" size="lg" className={cn(!canConfirm && !canRefund && !canCancel && 'sm:col-span-2')} asChild><Link to={`/messages?with=${o.seller.username}`}><MessageCircle className="size-4" aria-hidden /> Message {o.seller.name}</Link></Button>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Items</h2>
                <ul className="divide-y divide-border">
                  {o.items.map(i => (
                    <li key={i.id} className="flex items-center gap-3 py-3">
                      <Link to={`/product/${i.productId}`}><Img src={i.imageUrl} alt="" className="size-14 rounded-lg object-cover bg-muted" /></Link>
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${i.productId}`} className="block text-sm font-medium text-foreground truncate hover:underline">{i.name}</Link>
                        <p className="text-xs text-foreground-secondary">{i.variant ? `${i.variant} · ` : ''}Qty {i.quantity}</p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums">{formatMoney({ ...i.unitPrice, amount: i.unitPrice.amount * i.quantity })}</span>
                    </li>
                  ))}
                </ul>
                <dl className="mt-4 pt-4 border-t border-border space-y-1.5 text-sm">
                  <div className="flex justify-between text-foreground-secondary"><dt>Subtotal</dt><dd className="tabular-nums">{formatMoney(o.subtotal)}</dd></div>
                  <div className="flex justify-between text-foreground-secondary"><dt>Shipping</dt><dd className="tabular-nums">{o.shipping.amount === 0 ? 'Free' : formatMoney(o.shipping)}</dd></div>
                  <div className="flex justify-between text-foreground-secondary"><dt>Paid with</dt><dd>{PAYMENT_LABEL[o.paymentMethod]}</dd></div>
                  <div className="flex justify-between font-display font-semibold text-foreground text-base pt-1"><dt>Total</dt><dd className="tabular-nums">{formatMoney(o.total)}</dd></div>
                </dl>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-4">
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2"><MapPin className="size-4 text-primary" aria-hidden /> Delivering to</h2>
                <p className="text-sm text-foreground">{o.shippingTo.recipient}</p>
                <p className="text-sm text-foreground-secondary">{[o.shippingTo.city, o.shippingTo.region, o.shippingTo.country].filter(Boolean).join(', ')}</p>
                {o.note && <p className="mt-2 text-xs text-foreground-secondary italic">“{o.note}”</p>}
              </Card>
              <Card variant="default" padding="lg" data-testid="tracking-escrow">
                <h2 className="font-display font-semibold text-foreground mb-2 flex items-center gap-2"><ShieldCheck className="size-4 text-primary" aria-hidden /> Escrow</h2>
                <p className="text-sm text-foreground">
                  {o.escrow.status === 'held' && <>{formatMoney(o.total)} held safely{o.escrow.autoReleaseAt ? ` · auto-releases ${formatTimeUntil(o.escrow.autoReleaseAt)}` : ''}</>}
                  {o.escrow.status === 'released' && 'Released to the seller after delivery was confirmed.'}
                  {o.escrow.status === 'refunded' && 'Refunded to your Ezyify wallet.'}
                  {o.escrow.status === 'disputed' && 'Frozen while Ezyify reviews the case.'}
                </p>
                <p className="mt-1 text-xs text-foreground-secondary">Sellers are only paid once you confirm delivery or the hold period ends.</p>
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
                  <ol data-testid="tracking-timeline">
                    {events.map((e, i) => (
                      <li key={`${e.status}-${e.at}-${i}`} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={cn('size-9 rounded-full flex items-center justify-center flex-shrink-0', i === 0 ? 'bg-primary text-primary-foreground' : 'bg-success-subtle text-success')}>{i === 0 ? <Clock className="size-4" aria-hidden /> : <CheckCircle className="size-4" aria-hidden />}</div>
                          {i < events.length - 1 && <div className="w-0.5 flex-1 min-h-6 bg-border" aria-hidden />}
                        </div>
                        <div className="pb-6 min-w-0">
                          <p className="font-medium text-foreground">{EVENT_LABEL[e.status]}</p>
                          <p className="text-xs text-foreground-secondary"><time dateTime={e.at}>{dateTime(e.at)}</time>{e.note ? ` · ${e.note}` : ''}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}
              </Card>
            </motion.div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
