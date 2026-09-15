import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { Scale, ChevronLeft, Wallet, CheckCircle2, MapPin } from 'lucide-react';
import { ApiError, avatarUrlFor, formatMoney, formatTimeAgo, useAdminDisputes, useAuth, useResolveDispute, type Order, type ResolveDisputeRequest } from '@ezyify/core';
import { Card } from '../../components/primitives/Card';
import { Button } from '../../components/primitives/Button';
import { Img } from '../../components/primitives/Img';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../components/ui/dialog';
import { Textarea } from '../../components/ui/textarea';
import { SEO } from '../../components/SEO';
import { useInfiniteList } from '../../lib/data';
import { formErrors } from '../../lib/apiErrors';
import { cn } from '../../components/ui/utils';

function Party({ label, user, text, tone }: { label: string; user: Order['buyer']; text: string | null; tone: 'buyer' | 'seller' }) {
  return (
    <div className={cn('rounded-xl border p-3 space-y-2', tone === 'buyer' ? 'border-primary/30 bg-primary/5' : 'border-border bg-background-elevated')}>
      <div className="flex items-center gap-2">
        <Img src={avatarUrlFor(user, 64)} alt="" className="size-8 rounded-full object-cover" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wider text-foreground-secondary">{label}</p>
          <Link to={`/profile/${user.username}`} className="text-sm font-medium text-foreground hover:underline truncate block">{user.name} <span className="text-foreground-secondary">@{user.username}</span></Link>
        </div>
      </div>
      <p className="text-sm text-foreground whitespace-pre-wrap">{text ?? <span className="text-foreground-tertiary">No statement yet</span>}</p>
    </div>
  );
}

function DisputeCard({ order, onDecide, pending }: { order: Order; onDecide: (decision: ResolveDisputeRequest['decision']) => void; pending: boolean }) {
  const c = order.refund;
  return (
    <Card variant="elevated" padding="lg" data-testid={`dispute-${order.id}`} className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-display font-semibold text-foreground">{order.orderNumber} <span className="ml-2 inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-lg bg-error-subtle text-error"><Scale className="size-3.5" aria-hidden />Disputed</span></p>
          <p className="text-xs text-foreground-secondary mt-0.5">Placed {formatTimeAgo(order.placedAt)}{c ? ` · escalated ${formatTimeAgo(c.requestedAt)}` : ''} · {order.paymentMethod.replace('_', ' ')}</p>
        </div>
        <p className="text-lg font-display font-bold tabular-nums text-foreground">{formatMoney(order.total)} <span className="text-xs font-normal text-foreground-secondary">frozen</span></p>
      </div>
      <div className="flex items-center gap-3 overflow-x-auto pb-1">
        {order.items.map(i => (
          <div key={i.id} className="flex items-center gap-2 flex-shrink-0">
            <Img src={i.imageUrl} alt="" className="size-12 rounded-lg object-cover bg-muted" />
            <div><p className="text-sm font-medium text-foreground">{i.name}</p><p className="text-xs text-foreground-secondary">{i.variant ? `${i.variant} · ` : ''}×{i.quantity}{c && c.itemIds.includes(i.id) ? ' · in claim' : ''}</p></div>
          </div>
        ))}
      </div>
      <p className="text-xs text-foreground-secondary inline-flex items-center gap-1"><MapPin className="size-3.5" aria-hidden />Shipped to {order.shippingTo.recipient}, {order.shippingTo.city}, {order.shippingTo.country}{order.tracking ? ` · ${order.tracking.carrier} ${order.tracking.number}` : ' · no tracking recorded'}{order.deliveredAt ? ` · delivered ${formatTimeAgo(order.deliveredAt)}` : ''}</p>
      <div className="grid md:grid-cols-2 gap-3">
        <Party label="Buyer claims" user={order.buyer} text={c ? [c.reason, c.disputeReason].filter(Boolean).join('\n\n') : null} tone="buyer" />
        <Party label="Seller says" user={order.seller} text={c?.sellerResponse ?? null} tone="seller" />
      </div>
      <div className="flex flex-wrap gap-2 justify-end">
        <Button variant="outline" disabled={pending} leftIcon={<CheckCircle2 className="size-4" aria-hidden />} onClick={() => onDecide('release')}>Release to seller</Button>
        <Button variant="gradient" disabled={pending} leftIcon={<Wallet className="size-4" aria-hidden />} onClick={() => onDecide('refund')}>Refund buyer</Button>
      </div>
    </Card>
  );
}

/** Admin dispute queue on `GET /admin/disputes` + `POST /admin/orders/:id/resolve`. Every verdict needs a note both parties can read. */
export default function DisputeResolutionDashboard() {
  const navigate = useNavigate();
  const status = useAuth(s => s.status);
  const queue = useAdminDisputes({ pageSize: 20 });
  const resolve = useResolveDispute();
  const { items, loadMore, loadingMore, hasMore } = useInfiniteList<Order>(queue);
  const [pendingDecision, setPendingDecision] = useState<{ order: Order; decision: ResolveDisputeRequest['decision'] } | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    if (status === 'anonymous') navigate('/login', { replace: true, state: { next: '/admin/disputes' } });
  }, [status, navigate]);

  const close = () => { setPendingDecision(null); setNote(''); };
  const submit = () => {
    if (!pendingDecision) return;
    resolve.mutate({ id: pendingDecision.order.id, body: { decision: pendingDecision.decision, note: note.trim() } }, {
      onSuccess: o => { toast.success(o.status === 'refunded' ? `${o.orderNumber} refunded to ${o.buyer.name}` : `${o.orderNumber} released to ${o.seller.name}`); close(); },
      onError: err => toast.error(formErrors(err).message ?? 'Could not record the decision'),
    });
  };
  const forbidden = queue.error instanceof ApiError && queue.error.code === 'FORBIDDEN';

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Dispute Resolution — Ezyify Admin" description="Decide escalated refund cases; escrow is frozen until you do." />
      <div className="max-w-5xl mx-auto px-4 py-6 lg:py-8 space-y-6">
        <header className="flex items-center gap-3">
          <Button aria-label="Back to admin" variant="ghost" size="icon" asChild><Link to="/admin"><ChevronLeft /></Link></Button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground flex items-center gap-2"><Scale className="size-6 text-primary" aria-hidden /> Dispute resolution</h1>
            <p className="text-sm text-foreground-secondary">Oldest first. Refund returns escrow to the buyer and restores stock; release completes the order and pays the seller.</p>
          </div>
        </header>

        {forbidden ? (
          <EmptyState kind="error" title="Admins only" description="Dispute resolution is restricted to the trust & safety team." action={<Button asChild><Link to="/">Go home</Link></Button>} />
        ) : queue.isLoading ? (
          <div className="space-y-4" aria-busy="true">{[1, 2].map(i => <Skeleton key={i} className="h-72 rounded-card" />)}</div>
        ) : queue.isError ? (
          <EmptyState kind="error" title="Couldn’t load disputes" description={formErrors(queue.error).message ?? 'Please try again.'} action={<Button onClick={() => queue.refetch()}>Retry</Button>} />
        ) : items.length === 0 ? (
          <EmptyState kind="orders" title="No open disputes" description="Escalated refund cases land here with both sides' statements." />
        ) : (
          <div className="space-y-4" aria-live="polite">
            {items.map(o => <DisputeCard key={o.id} order={o} pending={resolve.isPending} onDecide={decision => setPendingDecision({ order: o, decision })} />)}
            {hasMore && <div className="flex justify-center"><Button variant="outline" onClick={loadMore} loading={loadingMore}>Load more</Button></div>}
          </div>
        )}
      </div>

      <Dialog open={!!pendingDecision} onOpenChange={v => !v && close()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pendingDecision?.decision === 'refund' ? `Refund ${pendingDecision.order.buyer.name}?` : `Release payment to ${pendingDecision?.order.seller.name}?`}</DialogTitle>
            <DialogDescription>
              {pendingDecision?.decision === 'refund'
                ? `${pendingDecision ? formatMoney(pendingDecision.order.total) : ''} goes back to the buyer's wallet and stock is restored. This cannot be undone.`
                : `The order completes and ${pendingDecision ? formatMoney(pendingDecision.order.total) : ''} minus platform fee is paid out to the seller. This cannot be undone.`}
            </DialogDescription>
          </DialogHeader>
          <label htmlFor="resolve-note" className="text-sm font-semibold text-foreground">Decision note (shown to both parties)</label>
          <Textarea id="resolve-note" value={note} onChange={e => setNote(e.target.value.slice(0, 500))} rows={3} maxLength={500} placeholder="e.g. Buyer's delivery-day photos show shipping damage; refund approved." autoFocus />
          <DialogFooter>
            <Button variant="ghost" onClick={close} disabled={resolve.isPending}>Cancel</Button>
            <Button variant={pendingDecision?.decision === 'refund' ? 'gradient' : 'primary'} loading={resolve.isPending} disabled={note.trim().length < 5} onClick={submit}>
              {pendingDecision?.decision === 'refund' ? 'Refund buyer' : 'Release to seller'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
