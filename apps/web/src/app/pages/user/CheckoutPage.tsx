import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, CreditCard, Plus, ShieldCheck, Wallet } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, formatMoney, useAddresses, useCheckout, useServerCart, useWallet, type Address, type CheckoutRequest } from '@ezyify/core';
import { AddressForm, fmtAddress } from '../../components/AddressForm';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Field } from '../../components/primitives/Field';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EscrowProtectionBanner } from '../../components/EscrowProtectionBanner';
import { PaymentFailureModal, type PaymentErrorType } from '../../components/PaymentFailureModal';
import { QueryError } from '../../components/QueryError';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { useAuthed } from '../../lib/data';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';
import { Img } from '../../components/primitives/Img';

const STEPS = [
  { id: 'address', label: 'Address' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
] as const;
type Step = (typeof STEPS)[number]['id'];
type PaymentMethod = CheckoutRequest['paymentMethod'];

const PAYMENT_OPTIONS: { value: PaymentMethod; label: string; desc: string }[] = [
  { value: 'wallet', label: 'Ezyify Wallet', desc: 'Pay instantly from your balance' },
  { value: 'card', label: 'Credit / debit card', desc: 'Visa, Mastercard, Amex' },
  { value: 'bank_transfer', label: 'Bank transfer', desc: 'Order is confirmed once the transfer lands' },
  { value: 'cod', label: 'Cash on delivery', desc: 'Pay the courier when it arrives' },
];


function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 pb-40 max-w-3xl mx-auto" aria-busy>
        <Skeleton className="h-6 w-32 mb-6" />
        <Card>
          <div className="p-4 space-y-4">
            <Skeleton className="h-6 w-40" />
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map(i => (
                <div key={i}>
                  <Skeleton className="h-4 w-20 mb-2" />
                  <Skeleton className="h-12" />
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}


export default function CheckoutPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const authed = useAuthed();
  const cart = useServerCart();
  const addresses = useAddresses();
  const wallet = useWallet();
  const checkout = useCheckout();

  const [step, setStep] = useState<Step>('address');
  const [addressId, setAddressId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [method, setMethod] = useState<PaymentMethod>('wallet');
  const [note, setNote] = useState('');
  const [failure, setFailure] = useState<PaymentErrorType | null>(null);
  // One key per checkout attempt so a retry after a network blip can't double-charge.
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());

  useEffect(() => {
    if (!authed) navigate('/login', { replace: true, state: { next: '/checkout' } });
  }, [authed, navigate]);

  useEffect(() => {
    if (addressId || !addresses.data?.length) return;
    setAddressId((addresses.data.find(a => a.isDefault) ?? addresses.data[0]).id);
  }, [addresses.data, addressId]);

  const items = cart.data?.items ?? [];
  const total = cart.data?.total ?? { amount: 0, currency: 'USD' as const };
  const balance = wallet.data?.balance.amount ?? 0;
  const walletShort = method === 'wallet' && wallet.data ? balance < total.amount : false;
  const address = useMemo(() => addresses.data?.find(a => a.id === addressId) ?? null, [addresses.data, addressId]);
  const stepIndex = STEPS.findIndex(s => s.id === step);

  const placeOrder = async () => {
    if (!address) return setStep('address');
    if (walletShort) return setFailure('INSUFFICIENT_FUNDS');
    try {
      const orders = await checkout.mutateAsync({ body: { addressId: address.id, paymentMethod: method, couponCode: cart.data?.couponCode ?? undefined, note: note.trim() || undefined }, idempotencyKey });
      toast.success('Order placed 🎉', { description: `${formatMoney(total)} is held in escrow until you confirm delivery.` });
      navigate(`/order-success?orders=${orders.map(o => o.orderNumber).join(',')}&total=${total.amount}&currency=${total.currency}&status=${orders[0]?.status ?? 'paid'}`, { replace: true });
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.details?.payment) return setFailure('INSUFFICIENT_FUNDS');
        if (err.code === 'NETWORK_ERROR') return setFailure('NETWORK_ERROR');
        if (err.status >= 500) return setFailure('PAYMENT_GATEWAY_ERROR');
        toast.error(formErrors(err).message ?? 'Couldn’t place your order');
        return;
      }
      setFailure('UNKNOWN_ERROR');
    }
  };

  if (!authed) return null;
  if (cart.isLoading || addresses.isLoading) return <CheckoutSkeleton />;
  if (cart.error) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <QueryError error={cart.error} onRetry={() => void cart.refetch()} />
      </div>
    );
  }
  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
        <SEO title="Checkout — Ezyify" description="Complete your purchase securely with escrow protection." />
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-foreground-secondary mb-6">Add some items before checkout</p>
        <Button variant="primary" asChild><Link to="/shop">Continue shopping</Link></Button>
      </div>
    );
  }

  const sellers = new Set(items.map(i => i.product.seller.id)).size;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Checkout — Ezyify" description="Complete your purchase securely with escrow protection." />

      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:px-6 lg:py-8">
        <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="px-4 py-6 pb-28 space-y-6 lg:p-0">
          <motion.div variants={fadeUp}>
            <Link to="/cart" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors">
              <ArrowLeft className="size-5" />
              <span className="text-sm font-medium">Back to cart</span>
            </Link>
            <h1 className="font-display text-2xl font-semibold text-foreground">Checkout</h1>
          </motion.div>

          <motion.div variants={fadeUp}>
            <ol className="flex gap-2" aria-label="Checkout progress">
              {STEPS.map((s, i) => (
                <li key={s.id} className="flex-1">
                  <button type="button" onClick={() => i < stepIndex && setStep(s.id)} aria-current={i === stepIndex ? 'step' : undefined} className="w-full text-left">
                    <div className="space-y-1.5">
                      <div className={cn('h-1.5 rounded-full transition-colors', i < stepIndex ? 'bg-success' : i === stepIndex ? 'bg-primary' : 'bg-border')} />
                      <p className={cn('text-xs font-medium', i <= stepIndex ? 'text-foreground' : 'text-foreground-tertiary')}>{s.label}</p>
                    </div>
                  </button>
                </li>
              ))}
            </ol>
          </motion.div>

          <motion.div variants={fadeUp}>
            <EscrowProtectionBanner amount={total.amount / 100} variant="checkout" />
          </motion.div>

          <motion.div variants={fadeUp} className="space-y-6">
            {step === 'address' && (
              <Card className="p-4 lg:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <MapPin className="size-5 text-primary flex-shrink-0" />
                  <h2 className="font-display font-semibold text-lg">Shipping address</h2>
                </div>
                {addresses.error ? (
                  <QueryError error={addresses.error} onRetry={() => void addresses.refetch()} compact />
                ) : adding || !addresses.data?.length ? (
                  <AddressForm
                    onSaved={a => {
                      setAddressId(a.id);
                      setAdding(false);
                      setStep('payment');
                    }}
                    onCancel={addresses.data?.length ? () => setAdding(false) : undefined}
                  />
                ) : (
                  <>
                    <RadioGroup value={addressId ?? ''} onValueChange={setAddressId} aria-label="Saved addresses">
                      <div className="space-y-3">
                        {addresses.data.map(a => (
                          <label key={a.id} className={cn('flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors', addressId === a.id ? 'border-primary bg-primary-subtle' : 'border-border hover:border-border-strong')}>
                            <RadioGroupItem value={a.id} id={`addr-${a.id}`} className="mt-1 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-foreground">
                                {a.label} · {a.recipient}
                                {a.isDefault && <span className="ml-2 text-[10px] font-bold uppercase text-primary">Default</span>}
                              </p>
                              <p className="text-xs text-foreground-secondary">{fmtAddress(a)}</p>
                              <p className="text-xs text-foreground-tertiary">{a.phone}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </RadioGroup>
                    <Button type="button" variant="ghost" size="sm" onClick={() => setAdding(true)}>
                      <Plus className="size-4" /> Add a new address
                    </Button>
                    <div className="pt-4 border-t border-border">
                      <Button variant="primary" size="lg" fullWidth disabled={!address} onClick={() => setStep('payment')}>
                        Continue to payment
                      </Button>
                    </div>
                  </>
                )}
              </Card>
            )}

            {step === 'payment' && (
              <div className="space-y-4">
                <Card className="p-4 lg:p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="size-5 text-primary flex-shrink-0" />
                    <h2 className="font-display font-semibold text-lg">Payment method</h2>
                  </div>
                  <RadioGroup value={method} onValueChange={v => setMethod(v as PaymentMethod)} aria-label="Payment method">
                    <div className="space-y-3">
                      {PAYMENT_OPTIONS.map(o => (
                        <label key={o.value} className={cn('flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors', method === o.value ? 'border-primary bg-primary-subtle' : 'border-border hover:border-border-strong')}>
                          <RadioGroupItem value={o.value} id={`pay-${o.value}`} className="mt-1 flex-shrink-0" />
                          <div className="flex-1">
                            <p className="text-sm font-semibold text-foreground">{o.label}</p>
                            <p className="text-xs text-foreground-secondary">{o.desc}</p>
                          </div>
                          {o.value === 'wallet' && wallet.data && (
                            <span className={cn('text-sm font-semibold flex-shrink-0 inline-flex items-center gap-1', walletShort ? 'text-error' : 'text-success')}>
                              <Wallet className="size-4" /> {formatMoney(wallet.data.balance)}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </RadioGroup>
                  {walletShort && (
                    <p className="text-sm text-error">
                      Your wallet is {formatMoney({ amount: total.amount - balance, currency: total.currency })} short.{' '}
                      <Link to="/wallet" className="font-semibold underline">Top up</Link> or pick another method.
                    </p>
                  )}
                </Card>
                <Card className="p-4 lg:p-6 space-y-3">
                  <Field label="Note for the seller (optional)" placeholder="Leave at the front desk…" value={note} onChange={e => setNote(e.target.value)} maxLength={500} />
                </Card>
                <div className="flex gap-2">
                  <Button variant="outline" size="lg" onClick={() => setStep('address')}>Back</Button>
                  <Button variant="primary" size="lg" fullWidth disabled={walletShort} onClick={() => setStep('review')}>Review order</Button>
                </div>
              </div>
            )}

            {step === 'review' && address && (
              <div className="space-y-4">
                <Card className="p-4 lg:p-6 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-tertiary">Deliver to</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{address.recipient} · {address.phone}</p>
                      <p className="text-xs text-foreground-secondary">{fmtAddress(address)}</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep('address')}>Change</Button>
                  </div>
                  <div className="flex items-start justify-between gap-3 pt-3 border-t border-border">
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide text-foreground-tertiary">Pay with</p>
                      <p className="text-sm font-semibold text-foreground mt-1">{PAYMENT_OPTIONS.find(o => o.value === method)?.label}</p>
                      {note && <p className="text-xs text-foreground-secondary">Note: {note}</p>}
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setStep('payment')}>Change</Button>
                  </div>
                </Card>
                <Card className="p-4 lg:p-6 space-y-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-foreground-tertiary">{items.length} item{items.length > 1 ? 's' : ''} · {sellers} seller{sellers > 1 ? 's' : ''}</p>
                  <ul className="divide-y divide-border">
                    {items.map(i => (
                      <li key={`${i.productId}:${i.variantId ?? ''}`} className="flex items-center gap-3 py-3">
                        <Img src={i.product.imageUrl} alt="" className="size-14 rounded-lg object-cover bg-muted" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">{i.product.name}</p>
                          <p className="text-xs text-foreground-secondary">{i.product.seller.name} · Qty {i.quantity}</p>
                        </div>
                        <p className="text-sm font-semibold tabular-nums">{formatMoney({ amount: i.product.price.amount * i.quantity, currency: i.product.price.currency })}</p>
                      </li>
                    ))}
                  </ul>
                </Card>
                <div className="flex items-start gap-3 rounded-card bg-success/5 border border-success/20 p-4">
                  <ShieldCheck className="size-5 text-success shrink-0 mt-0.5" />
                  <p className="text-sm text-foreground-secondary">By placing this order you agree to Ezyify’s terms. Your payment stays in escrow until you confirm delivery.</p>
                </div>
                <div className="flex gap-2 lg:hidden">
                  <Button variant="outline" size="lg" onClick={() => setStep('payment')}>Back</Button>
                  <Button variant="gradient" size="lg" fullWidth className="shadow-brand" loading={checkout.isPending} loadingText="Placing order…" onClick={() => void placeOrder()}>
                    Place order · {formatMoney(total)}
                  </Button>
                </div>
              </div>
            )}
          </motion.div>
        </motion.div>

        <div className="hidden lg:block">
          <Card variant="elevated" className="sticky top-24 p-6 space-y-4">
            <h3 className="font-display font-semibold text-lg">Order summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-foreground-secondary">Subtotal</span><span>{formatMoney(cart.data!.subtotal)}</span></div>
              {cart.data!.discount.amount > 0 && <div className="flex justify-between text-success"><span>Discount{cart.data!.couponCode ? ` (${cart.data!.couponCode})` : ''}</span><span>-{formatMoney(cart.data!.discount)}</span></div>}
              <div className="flex justify-between"><span className="text-foreground-secondary">Shipping</span><span>{cart.data!.shipping.amount === 0 ? 'FREE' : formatMoney(cart.data!.shipping)}</span></div>
            </div>
            <div className="pt-3 border-t border-border flex justify-between font-display font-bold text-lg">
              <span>Total</span>
              <span className="text-accent-brand">{formatMoney(total)}</span>
            </div>
            {step === 'review' && (
              <Button variant="gradient" size="lg" fullWidth className="shadow-brand" loading={checkout.isPending} loadingText="Placing order…" onClick={() => void placeOrder()}>
                Place order
              </Button>
            )}
          </Card>
        </div>
      </div>

      <PaymentFailureModal
        isOpen={!!failure}
        error={failure ?? 'UNKNOWN_ERROR'}
        requiredAmount={total.amount / 100}
        currentBalance={balance / 100}
        onRetry={() => {
          setFailure(null);
          setIdempotencyKey(crypto.randomUUID());
          void placeOrder();
        }}
        onAddFunds={() => {
          setFailure(null);
          navigate('/wallet');
        }}
        onCancel={() => setFailure(null)}
        onContactSupport={() => {
          setFailure(null);
          navigate('/help');
        }}
      />
    </div>
  );
}
