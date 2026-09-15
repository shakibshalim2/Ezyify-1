import { useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { Package, Truck, CheckCircle, Clock, AlertCircle, RotateCcw, MessageSquare, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useSellerOrderAction, useStartConversation, type Order, type OrderStatus, type ShipOrderRequest } from '@ezyify/core';
import { Button } from '../primitives/Button';
import { Field } from '../primitives/Field';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { ConfirmDialog, type ConfirmState } from '../ConfirmDialog';
import { formErrors } from '../../lib/apiErrors';

/** Seller‑facing status vocabulary: what the seller must *do*, not what the buyer sees. */
export const SELLER_STATUS: Record<OrderStatus, { icon: typeof Clock; label: string; className: string }> = {
  pending_payment: { icon: Clock, label: 'Awaiting payment', className: 'bg-muted text-foreground-secondary' },
  paid: { icon: AlertCircle, label: 'New · accept', className: 'bg-warning-subtle text-warning' },
  processing: { icon: Package, label: 'To ship', className: 'bg-info-subtle text-info' },
  shipped: { icon: Truck, label: 'Shipped', className: 'bg-info-subtle text-info' },
  out_for_delivery: { icon: Truck, label: 'Out for delivery', className: 'bg-info-subtle text-info' },
  delivered: { icon: CheckCircle, label: 'Delivered · awaiting buyer', className: 'bg-success-subtle text-success' },
  completed: { icon: CheckCircle, label: 'Completed · paid out', className: 'bg-success-subtle text-success' },
  cancelled: { icon: XCircle, label: 'Cancelled', className: 'bg-muted text-foreground-secondary' },
  refund_requested: { icon: RotateCcw, label: 'Refund requested', className: 'bg-warning-subtle text-warning' },
  refunded: { icon: RotateCcw, label: 'Refunded', className: 'bg-muted text-foreground-secondary' },
  disputed: { icon: AlertCircle, label: 'In dispute', className: 'bg-error-subtle text-error' },
};

export const PAYMENT_LABEL: Record<Order['paymentMethod'], string> = { wallet: 'Ezyify Wallet', card: 'Card', bank_transfer: 'Bank transfer', cod: 'Cash on delivery' };

const CARRIERS = ['JNE', 'J&T Express', 'SiCepat', 'DHL', 'FedEx', 'UPS'];

function ShipDialog({ order, open, onClose, onSubmit, pending }: { order: Order; open: boolean; onClose: () => void; onSubmit: (b: ShipOrderRequest) => void; pending: boolean }) {
  const [carrier, setCarrier] = useState('');
  const [number, setNumber] = useState('');
  const [url, setUrl] = useState('');
  const [errors, setErrors] = useState<{ carrier?: string; number?: string; url?: string }>({});

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const next: typeof errors = {};
    if (!carrier.trim()) next.carrier = 'Enter the courier name';
    if (!number.trim()) next.number = 'Enter the tracking number';
    if (url.trim() && !/^https?:\/\//i.test(url.trim())) next.url = 'Enter a full URL starting with https://';
    setErrors(next);
    if (Object.keys(next).length) return;
    onSubmit({ carrier: carrier.trim(), number: number.trim(), ...(url.trim() ? { url: url.trim() } : {}) });
  };

  return (
    <Dialog open={open} onOpenChange={o => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <form onSubmit={submit} noValidate>
          <DialogHeader>
            <DialogTitle>Ship {order.orderNumber}</DialogTitle>
            <DialogDescription>
              To {order.shippingTo.recipient}, {order.shippingTo.city}. The buyer is notified and can track the parcel right away.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Field label="Courier" list="ezyify-carriers" placeholder="e.g. JNE" value={carrier} onChange={e => setCarrier(e.target.value)} error={errors.carrier} autoComplete="off" required />
            <datalist id="ezyify-carriers">{CARRIERS.map(c => <option key={c} value={c} />)}</datalist>
            <Field label="Tracking number" placeholder="e.g. JNE12345678" value={number} onChange={e => setNumber(e.target.value)} error={errors.number} autoComplete="off" required />
            <Field label="Tracking link (optional)" type="url" inputMode="url" placeholder="https://" value={url} onChange={e => setUrl(e.target.value)} error={errors.url} />
          </div>
          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>Cancel</Button>
            <Button type="submit" variant="gradient" loading={pending} leftIcon={<Truck className="size-4" aria-hidden />}>Mark as shipped</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/**
 * The seller's next-step buttons for one order, derived from the escrow state machine:
 * paid → accept | cancel; processing → ship | cancel; shipped/out_for_delivery → deliver; refund_requested → approve refund.
 */
export function SellerOrderActions({ order, size = 'md', className }: { order: Order; size?: 'sm' | 'md'; className?: string }) {
  const navigate = useNavigate();
  const action = useSellerOrderAction();
  const startChat = useStartConversation();
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);
  const [shipping, setShipping] = useState(false);

  const run = (vars: Parameters<typeof action.mutate>[0], ok: string) =>
    action.mutate(vars, { onSuccess: () => { toast.success(ok); setShipping(false); }, onError: err => toast.error(formErrors(err).message ?? 'Something went wrong') });

  const message = () =>
    startChat.mutate(order.buyer.username, { onSuccess: r => navigate(`/messages?c=${encodeURIComponent(r.id)}`), onError: err => toast.error(formErrors(err).message ?? 'Could not open chat') });

  const pending = action.isPending;
  const s = order.status;

  return (
    <div className={className}>
      <ConfirmDialog state={confirm} onClose={() => setConfirm(null)} />
      <ShipDialog order={order} open={shipping} onClose={() => setShipping(false)} pending={pending} onSubmit={body => run({ id: order.id, action: 'ship', body }, `${order.orderNumber} marked as shipped`)} />
      <div className="flex flex-wrap gap-2">
        {s === 'paid' && (
          <Button size={size} variant="gradient" loading={pending} leftIcon={<Package className="size-4" aria-hidden />} onClick={() => run({ id: order.id, action: 'accept' }, 'Order accepted — start packing')}>
            Accept order
          </Button>
        )}
        {s === 'processing' && (
          <Button size={size} variant="gradient" disabled={pending} leftIcon={<Truck className="size-4" aria-hidden />} onClick={() => setShipping(true)}>
            Ship order
          </Button>
        )}
        {(s === 'shipped' || s === 'out_for_delivery') && (
          <Button
            size={size}
            variant="secondary"
            loading={pending}
            leftIcon={<CheckCircle className="size-4" aria-hidden />}
            onClick={() => setConfirm({ title: 'Mark as delivered?', message: 'Only do this once the courier confirms hand-over. The buyer then has a window to confirm before escrow auto-releases to you.', confirmLabel: 'Mark delivered', onConfirm: () => run({ id: order.id, action: 'deliver' }, 'Marked as delivered') })}
          >
            Mark delivered
          </Button>
        )}
        {s === 'refund_requested' && (
          <Button
            size={size}
            variant="outline"
            loading={pending}
            leftIcon={<RotateCcw className="size-4" aria-hidden />}
            onClick={() => setConfirm({ title: 'Approve refund?', message: 'The full order amount is returned to the buyer from escrow and stock is restored. This cannot be undone.', confirmLabel: 'Approve refund', destructive: true, onConfirm: () => run({ id: order.id, action: 'approveRefund' }, 'Refund approved') })}
          >
            Approve refund
          </Button>
        )}
        {(s === 'paid' || s === 'processing') && (
          <Button
            size={size}
            variant="ghost"
            disabled={pending}
            leftIcon={<XCircle className="size-4" aria-hidden />}
            onClick={() => setConfirm({ title: `Cancel ${order.orderNumber}?`, message: 'The buyer is refunded in full from escrow. Cancelling often hurts your seller rating — only do this if you cannot fulfil the order.', confirmLabel: 'Cancel order', destructive: true, onConfirm: () => run({ id: order.id, action: 'cancel' }, 'Order cancelled and refunded') })}
          >
            Cancel
          </Button>
        )}
        <Button size={size} variant="ghost" leftIcon={<MessageSquare className="size-4" aria-hidden />} loading={startChat.isPending} onClick={message}>
          Message buyer
        </Button>
        {(s === 'shipped' || s === 'out_for_delivery' || s === 'delivered') && order.tracking?.url && (
          <Button size={size} variant="ghost" asChild>
            <Link to={order.tracking.url} target="_blank" rel="noreferrer">Track parcel</Link>
          </Button>
        )}
      </div>
    </div>
  );
}
