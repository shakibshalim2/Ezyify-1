import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { ChevronLeft, ShieldCheck, RotateCcw, Check } from 'lucide-react';
import { REFUND_REASONS, RefundRequestBodySchema, formatMoney, useAuth, useOrder, useOrderAction, type Order } from '@ezyify/core';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Img } from '../../components/primitives/Img';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Textarea } from '../../components/ui/textarea';
import { SEO } from '../../components/SEO';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

const CAN_REQUEST: Order['status'][] = ['paid', 'processing', 'shipped', 'out_for_delivery', 'delivered', 'completed'];

function RequestForm({ order }: { order: Order }) {
  const navigate = useNavigate();
  const action = useOrderAction();
  const [items, setItems] = useState<string[]>(order.items.map(i => i.id));
  const [reasonId, setReasonId] = useState<string>('');
  const [details, setDetails] = useState('');
  const [error, setError] = useState<string | null>(null);

  const toggle = (id: string) => setItems(cur => (cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]));
  const selectedTotal = order.items.filter(i => items.includes(i.id)).reduce((n, i) => n + i.unitPrice.amount * i.quantity, 0);
  const refundAmount = items.length === order.items.length ? order.total : { ...order.total, amount: selectedTotal };
  const label = REFUND_REASONS.find(r => r.id === reasonId)?.label;
  const reason = [label, details.trim()].filter(Boolean).join(' — ');

  const submit = () => {
    if (!reasonId) return void setError('Pick a reason');
    if (items.length === 0) return void setError('Select at least one item');
    const parsed = RefundRequestBodySchema.safeParse({ reason, itemIds: items });
    if (!parsed.success) return void setError(parsed.error.issues[0]?.message ?? 'Check the form');
    setError(null);
    action.mutate({ id: order.id, action: 'refund', reason: parsed.data.reason, itemIds: parsed.data.itemIds }, {
      onSuccess: () => { toast.success('Refund requested — the seller has 48 hours to respond'); navigate(`/orders/${order.id}/refund`, { replace: true }); },
      onError: err => { const f = formErrors(err); setError(f.message ?? Object.values(f.fields)[0] ?? 'Could not submit'); },
    });
  };

  return (
    <div className="space-y-6">
      <Card variant="default" padding="lg">
        <h2 className="font-display font-semibold text-lg text-foreground mb-1">Which items?</h2>
        <p className="text-xs text-foreground-secondary mb-4">Order {order.orderNumber} from {order.seller.name}</p>
        <ul className="divide-y divide-border" aria-label="Order items">
          {order.items.map(i => {
            const on = items.includes(i.id);
            return (
              <li key={i.id}>
                <label className={cn('flex items-center gap-3 py-3 cursor-pointer', !on && 'opacity-60')}>
                  <span className="relative size-5 flex-shrink-0">
                    <input type="checkbox" className="peer absolute inset-0 z-10 size-5 opacity-0 cursor-pointer" checked={on} onChange={() => toggle(i.id)} aria-label={`Include ${i.name}`} />
                    <span className={cn('pointer-events-none absolute inset-0 rounded-md border-2 grid place-items-center peer-focus-visible:ring-2 peer-focus-visible:ring-primary', on ? 'bg-primary border-primary text-primary-foreground' : 'border-border')} aria-hidden>{on && <Check className="size-3.5" />}</span>
                  </span>
                  <Img src={i.imageUrl} alt="" className="size-14 rounded-lg object-cover bg-muted" />
                  <span className="flex-1 min-w-0">
                    <span className="block text-sm font-medium text-foreground truncate">{i.name}</span>
                    <span className="block text-xs text-foreground-secondary">{i.variant ? `${i.variant} · ` : ''}Qty {i.quantity}</span>
                  </span>
                  <span className="text-sm font-semibold tabular-nums">{formatMoney({ ...i.unitPrice, amount: i.unitPrice.amount * i.quantity })}</span>
                </label>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card variant="default" padding="lg">
        <h2 className="font-display font-semibold text-lg text-foreground mb-4">What went wrong?</h2>
        <div role="radiogroup" aria-label="Refund reason" className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-4">
          {REFUND_REASONS.map(r => (
            <button key={r.id} type="button" role="radio" aria-checked={reasonId === r.id} onClick={() => { setReasonId(r.id); setError(null); }} className={cn('rounded-xl border-2 p-3 text-sm font-medium text-left transition-colors', reasonId === r.id ? 'border-primary bg-primary/10 text-foreground' : 'border-border hover:border-primary/50 text-foreground-secondary')}>
              {r.label}
            </button>
          ))}
        </div>
        <label htmlFor="refund-details" className="block text-sm font-semibold text-foreground mb-1.5">Tell the seller more</label>
        <Textarea id="refund-details" value={details} onChange={e => setDetails(e.target.value.slice(0, 400))} rows={4} maxLength={400} placeholder="What happened, and what would make it right? Photos can be sent in chat." className="bg-background-elevated" />
        <div className="flex justify-between text-xs mt-1">
          {error ? <span role="alert" className="text-error font-medium">{error}</span> : <span className="text-foreground-tertiary">Clear, specific requests get resolved fastest</span>}
          <span className="text-foreground-tertiary tabular-nums">{details.length}/400</span>
        </div>
      </Card>

      <Card variant="featured" padding="lg">
        <div className="flex items-start gap-3">
          <ShieldCheck className="size-6 text-primary flex-shrink-0" aria-hidden />
          <div className="flex-1 text-sm">
            <p className="font-semibold text-foreground">Escrow protects this order</p>
            <p className="text-foreground-secondary mt-0.5">{formatMoney(order.total)} stays held while the seller reviews. If they decline, you can escalate to Ezyify and we decide within 3 business days.</p>
            <p className="mt-2 text-foreground">Requesting <span className="font-semibold tabular-nums">{formatMoney(refundAmount)}</span>{items.length === order.items.length ? ' (full order)' : ` for ${items.length} item${items.length === 1 ? '' : 's'}`}</p>
          </div>
        </div>
      </Card>

      <Button variant="gradient" size="lg" fullWidth loading={action.isPending} onClick={submit} leftIcon={<RotateCcw className="size-5" aria-hidden />} className="shadow-brand">
        Send refund request
      </Button>
    </div>
  );
}

/** Buyer starts a refund case on `POST /orders/:id/refund`. Items and reason go to the seller verbatim. */
export default function RefundRequestPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const status = useAuth(s => s.status);
  const order = useOrder(id);

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: `/orders/${id}/refund/new` } });
  }, [status, navigate, id]);

  const o = order.data;
  const blocked = o && !CAN_REQUEST.includes(o.status);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Request a refund — Ezyify" description="Ask the seller for a refund; escrow keeps your money safe meanwhile." />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        <motion.header variants={fadeUp} className="flex items-center gap-3">
          <Button aria-label="Back to orders" variant="ghost" size="icon" asChild><Link to="/orders"><ChevronLeft /></Link></Button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Request a refund</h1>
            <p className="text-sm text-foreground-secondary">The seller replies within 48 hours; your money stays in escrow.</p>
          </div>
        </motion.header>

        {order.isLoading || status === 'anonymous' ? (
          <div className="space-y-4" aria-busy="true"><Skeleton className="h-48 rounded-card" /><Skeleton className="h-64 rounded-card" /></div>
        ) : order.isError || !o ? (
          <EmptyState kind="orders" title="Order not found" description={order.error ? (formErrors(order.error).message ?? 'Please try again.') : 'Please try again.'} action={<Button asChild><Link to="/orders">Back to orders</Link></Button>} />
        ) : o.status === 'refund_requested' || o.status === 'disputed' ? (
          <EmptyState kind="orders" title="A refund case is already open" description="Follow its progress or escalate from the case page." action={<Button asChild><Link to={`/orders/${o.id}/refund`}>Open case</Link></Button>} />
        ) : blocked ? (
          <EmptyState kind="orders" title="This order can’t be refunded" description={o.status === 'refunded' || o.status === 'cancelled' ? 'It has already been refunded.' : 'Refunds are available once the order is paid.'} action={<Button asChild><Link to="/orders">Back to orders</Link></Button>} />
        ) : (
          <motion.div variants={fadeUp}><RequestForm order={o} /></motion.div>
        )}
      </motion.div>
    </div>
  );
}
