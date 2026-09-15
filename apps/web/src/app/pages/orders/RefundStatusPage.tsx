import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { ChevronLeft, Clock, CheckCircle2, XCircle, Scale, MessageSquare, RotateCcw, ShieldCheck, Wallet } from 'lucide-react';
import { DisputeRequestSchema, formatMoney, formatRelativeTime, useAuth, useOrder, useOrderAction, useOrderTimeline, type Order, type RefundCase } from '@ezyify/core';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Img } from '../../components/primitives/Img';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Textarea } from '../../components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { SEO } from '../../components/SEO';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

type Stage = { key: string; label: string; hint: string; icon: typeof Clock; tone: string };
function stageFor(order: Order, c: RefundCase): Stage {
  if (order.status === 'refunded' || c.status === 'refunded') return { key: 'refunded', label: 'Refunded to your wallet', hint: `${formatMoney(order.total)} is back in your Ezyify wallet.`, icon: Wallet, tone: 'text-success bg-success/15' };
  if (c.status === 'withdrawn') return { key: 'withdrawn', label: 'Request withdrawn', hint: 'You closed this case; the order continued as normal.', icon: XCircle, tone: 'text-foreground-secondary bg-muted' };
  if (order.status === 'disputed') return { key: 'disputed', label: 'Ezyify is reviewing', hint: 'Escrow is frozen. Our team decides within 3 business days and both of you are notified.', icon: Scale, tone: 'text-primary bg-primary/15' };
  if (c.status === 'rejected' && order.status === 'refund_requested') return { key: 'declined', label: 'Seller declined', hint: 'You can accept their answer and withdraw, or escalate to Ezyify.', icon: XCircle, tone: 'text-error bg-error/15' };
  if (c.status === 'rejected') return { key: 'released', label: 'Resolved in the seller’s favour', hint: 'Ezyify reviewed the case and released the payment to the seller.', icon: CheckCircle2, tone: 'text-foreground-secondary bg-muted' };
  return { key: 'pending', label: 'Waiting for the seller', hint: 'Sellers respond within 48 hours. Your money stays in escrow meanwhile.', icon: Clock, tone: 'text-warning bg-warning/15' };
}

function EscalateDialog({ open, onClose, onSubmit, pending }: { open: boolean; onClose: () => void; onSubmit: (reason: string) => void; pending: boolean }) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const parsed = DisputeRequestSchema.safeParse({ reason });
    if (!parsed.success) return void setError(parsed.error.issues[0]?.message ?? 'Add more detail');
    onSubmit(parsed.data.reason);
  };
  return (
    <Dialog open={open} onOpenChange={o => { if (!o) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Escalate to Ezyify</DialogTitle>
          <DialogDescription>Escrow is frozen while our team reviews both sides. Tell us what happened and what you’ve tried with the seller.</DialogDescription>
        </DialogHeader>
        <label htmlFor="dispute-reason" className="text-sm font-semibold text-foreground">Your side</label>
        <Textarea id="dispute-reason" value={reason} onChange={e => { setReason(e.target.value.slice(0, 1000)); setError(null); }} rows={5} maxLength={1000} placeholder="e.g. The lamp base arrived cracked; I sent photos in chat on the day of delivery and the seller says it left intact." autoFocus aria-invalid={!!error} />
        {error && <p role="alert" className="text-xs text-error font-medium">{error}</p>}
        <DialogFooter>
          <Button variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
          <Button variant="gradient" loading={pending} onClick={submit} leftIcon={<Scale className="size-4" aria-hidden />}>Open dispute</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/** Buyer-side refund case: what the seller said, what happens next, withdraw / escalate actions. */
export default function RefundStatusPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const status = useAuth(s => s.status);
  const order = useOrder(id);
  const timeline = useOrderTimeline(id);
  const action = useOrderAction();
  const [escalating, setEscalating] = useState(false);
  const [confirmWithdraw, setConfirmWithdraw] = useState(false);

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: `/orders/${id}/refund` } });
  }, [status, navigate, id]);

  const o = order.data;
  const c = o?.refund ?? null;
  const run = (vars: Parameters<typeof action.mutate>[0], ok: string) =>
    action.mutate(vars, { onSuccess: () => { toast.success(ok); setEscalating(false); setConfirmWithdraw(false); }, onError: err => toast.error(formErrors(err).message ?? 'Something went wrong') });

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Refund case — Ezyify" description="Track your refund request and escalate to Ezyify if needed." />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="max-w-2xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        <motion.header variants={fadeUp} className="flex items-center gap-3">
          <Button aria-label="Back to orders" variant="ghost" size="icon" asChild><Link to="/orders"><ChevronLeft /></Link></Button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Refund case</h1>
            {o && <p className="text-sm text-foreground-secondary">{o.orderNumber} · {o.seller.name}</p>}
          </div>
        </motion.header>

        {order.isLoading || status === 'anonymous' ? (
          <div className="space-y-4" aria-busy="true"><Skeleton className="h-32 rounded-card" /><Skeleton className="h-48 rounded-card" /></div>
        ) : order.isError || !o ? (
          <EmptyState kind="orders" title="Order not found" description={order.error ? (formErrors(order.error).message ?? 'Please try again.') : 'Please try again.'} action={<Button asChild><Link to="/orders">Back to orders</Link></Button>} />
        ) : !c ? (
          <EmptyState kind="orders" title="No refund case on this order" description="Something wrong with it? Start a request and the seller will hear from you." action={<Button asChild><Link to={`/orders/${o.id}/refund/new`}>Request a refund</Link></Button>} />
        ) : (
          (() => {
            const stage = stageFor(o, c);
            const Icon = stage.icon;
            const canAct = o.status === 'refund_requested';
            return (
              <>
                <motion.div variants={fadeUp}>
                  <Card variant="featured" padding="lg" data-testid={`refund-stage-${stage.key}`}>
                    <div className="flex items-start gap-4">
                      <span className={cn('size-12 rounded-full grid place-items-center flex-shrink-0', stage.tone)}><Icon className="size-6" aria-hidden /></span>
                      <div className="flex-1">
                        <h2 className="font-display font-semibold text-lg text-foreground">{stage.label}</h2>
                        <p className="text-sm text-foreground-secondary mt-1">{stage.hint}</p>
                        <p className="text-xs text-foreground-tertiary mt-2">Opened {formatRelativeTime(c.requestedAt)}{c.resolvedAt ? ` · closed ${formatRelativeTime(c.resolvedAt)}` : ''}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>

                <motion.div variants={fadeUp}>
                  <Card variant="default" padding="lg" className="space-y-4">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1">Your request</p>
                      <p className="text-sm text-foreground">{c.reason}</p>
                      {c.itemIds.length > 0 && c.itemIds.length < o.items.length && (
                        <div className="flex gap-2 mt-2">{o.items.filter(i => c.itemIds.includes(i.id)).map(i => <Img key={i.id} src={i.imageUrl} alt={i.name} className="size-12 rounded-lg object-cover bg-muted" />)}</div>
                      )}
                    </div>
                    {c.sellerResponse && (
                      <div className="rounded-xl border border-error/30 bg-error-subtle p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-error mb-1">Seller’s response</p>
                        <p className="text-sm text-foreground">{c.sellerResponse}</p>
                      </div>
                    )}
                    {c.disputeReason && (
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary mb-1">Your escalation</p>
                        <p className="text-sm text-foreground">{c.disputeReason}</p>
                      </div>
                    )}
                    {c.resolution && (
                      <div className="rounded-xl border border-primary/30 bg-primary/5 p-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-primary mb-1 flex items-center gap-1"><ShieldCheck className="size-3.5" aria-hidden /> Ezyify decision</p>
                        <p className="text-sm text-foreground">{c.resolution}</p>
                      </div>
                    )}
                    <dl className="grid grid-cols-2 gap-3 text-sm pt-2 border-t border-border">
                      <div><dt className="text-xs text-foreground-secondary">Amount in escrow</dt><dd className="font-semibold tabular-nums">{formatMoney(o.total)}</dd></div>
                      <div><dt className="text-xs text-foreground-secondary">Escrow status</dt><dd className="font-semibold capitalize">{o.escrow.status}</dd></div>
                    </dl>
                  </Card>
                </motion.div>

                {canAct && (
                  <motion.div variants={fadeUp} className="grid sm:grid-cols-2 gap-3">
                    <Button variant="outline" size="lg" disabled={action.isPending} leftIcon={<RotateCcw className="size-4" aria-hidden />} onClick={() => setConfirmWithdraw(true)}>Withdraw request</Button>
                    <Button variant="gradient" size="lg" disabled={action.isPending} leftIcon={<Scale className="size-4" aria-hidden />} onClick={() => setEscalating(true)}>Escalate to Ezyify</Button>
                    <Button variant="ghost" size="sm" className="sm:col-span-2" asChild><Link to={`/messages?with=${o.seller.username}`}><MessageSquare className="size-4" aria-hidden /> Message {o.seller.name}</Link></Button>
                  </motion.div>
                )}

                {timeline.data && timeline.data.length > 0 && (
                  <motion.div variants={fadeUp}>
                    <Card variant="default" padding="lg">
                      <h3 className="font-display font-semibold text-foreground mb-3">Timeline</h3>
                      <ol className="space-y-3">
                        {[...timeline.data].reverse().map((e, i) => (
                          <li key={`${e.at}-${i}`} className="flex gap-3 text-sm">
                            <span className={cn('mt-1.5 size-2 rounded-full flex-shrink-0', i === 0 ? 'bg-primary' : 'bg-border')} aria-hidden />
                            <div className="min-w-0">
                              <p className="font-medium text-foreground capitalize">{e.status.replace(/_/g, ' ')}</p>
                              {e.note && <p className="text-foreground-secondary">{e.note}</p>}
                              <p className="text-xs text-foreground-tertiary">{formatRelativeTime(e.at)}</p>
                            </div>
                          </li>
                        ))}
                      </ol>
                    </Card>
                  </motion.div>
                )}

                <EscalateDialog open={escalating} onClose={() => setEscalating(false)} pending={action.isPending} onSubmit={reason => run({ id: o.id, action: 'dispute', reason }, 'Dispute opened — Ezyify will review')} />
                <Dialog open={confirmWithdraw} onOpenChange={v => !v && setConfirmWithdraw(false)}>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Withdraw your refund request?</DialogTitle>
                      <DialogDescription>The order continues where it left off and escrow releases to the seller as normal once delivered.</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                      <Button variant="ghost" onClick={() => setConfirmWithdraw(false)} disabled={action.isPending}>Keep it open</Button>
                      <Button variant="destructive" loading={action.isPending} onClick={() => run({ id: o.id, action: 'withdrawRefund' }, 'Request withdrawn')}>Withdraw</Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </>
            );
          })()
        )}
      </motion.div>
    </div>
  );
}
