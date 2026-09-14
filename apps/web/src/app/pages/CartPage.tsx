import { useMemo, useState, type FormEvent } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { formatMoney, useApplyCoupon, type Cart, type CartItem } from '@ezyify/core';
import { Button } from '../components/primitives/Button';
import { Field } from '../components/primitives/Field';
import { Card } from '../components/primitives/Card';
import { Skeleton } from '../components/primitives/Skeleton';
import { EmptyCart } from '../components/EmptyStates';
import { CartItemRow } from '../components/cart/CartItemRow';
import { EscrowProtectionBanner } from '../components/EscrowProtectionBanner';
import { QueryError } from '../components/QueryError';
import { SEO, SEOConfigs } from '../components/SEO';
import { useUnifiedCart } from '../lib/data';
import { formErrors } from '../lib/apiErrors';
import { fadeUp, staggerContainer, DURATION } from '../lib/motion';

function CartSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 pb-40">
        <Skeleton className="h-8 w-32 mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="flex gap-4">
                <Skeleton className="size-22 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-6 w-20 mt-4" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

type SellerGroup = { sellerId: string; seller: CartItem['product']['seller']; items: CartItem[] };

function groupBySeller(items: CartItem[]): SellerGroup[] {
  const groups: SellerGroup[] = [];
  for (const item of items) {
    const g = groups.find(x => x.sellerId === item.product.seller.id);
    if (g) g.items.push(item);
    else groups.push({ sellerId: item.product.seller.id, seller: item.product.seller, items: [item] });
  }
  return groups;
}

function Summary({ cart, sellers }: { cart: Cart; sellers: number }) {
  const freeOver = 5000;
  const remaining = freeOver - cart.subtotal.amount;
  return (
    <div className="space-y-3">
      <div className="flex justify-between text-sm">
        <span className="text-foreground-secondary">Subtotal · {sellers} seller{sellers > 1 ? 's' : ''}</span>
        <span className="font-medium text-foreground">{formatMoney(cart.subtotal)}</span>
      </div>
      {cart.discount.amount > 0 && (
        <div className="flex justify-between text-sm text-success">
          <span>Discount{cart.couponCode ? ` (${cart.couponCode})` : ''}</span>
          <span>-{formatMoney(cart.discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm">
        <span className="text-foreground-secondary">Shipping</span>
        <span className="font-medium text-foreground">{cart.shipping.amount === 0 ? 'FREE' : formatMoney(cart.shipping)}</span>
      </div>
      {remaining > 0 && cart.subtotal.amount > 0 && (
        <p className="text-xs text-foreground-secondary">Add {formatMoney({ amount: remaining, currency: cart.subtotal.currency })} more for free shipping</p>
      )}
    </div>
  );
}

export default function CartPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const { cart, loading, error, authed, setQuantity, removeItem, refetch, busy } = useUnifiedCart();
  const coupon = useApplyCoupon();
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  const groups = useMemo(() => groupBySeller(cart?.items ?? []), [cart?.items]);
  const breakdown = useMemo(
    () => groups.map(g => ({ sellerId: g.sellerId, sellerName: g.seller.name, amount: g.items.reduce((n, i) => n + (i.product.price.amount * i.quantity) / 100, 0) })),
    [groups],
  );

  const applyPromo = async (e?: FormEvent) => {
    e?.preventDefault();
    const code = promoCode.trim().toUpperCase();
    if (!code) return;
    setPromoError(null);
    try {
      await coupon.mutateAsync({ code });
      toast.success(`Code ${code} applied`);
      setPromoCode('');
    } catch (err) {
      const { fields, message } = formErrors(err, 'That code isn’t valid');
      setPromoError(fields.code ?? message);
    }
  };

  const change = async (item: CartItem, delta: number) => {
    const next = item.quantity + delta;
    try {
      if (next <= 0) {
        await removeItem(item.productId, item.variantId);
        toast.success('Item removed from cart');
      } else await setQuantity(item.productId, Math.min(99, next), item.variantId);
    } catch (err) {
      toast.error(formErrors(err).message ?? 'Couldn’t update your cart');
    }
  };

  if (loading && !cart?.items.length) return <CartSkeleton />;
  if (error && !cart?.items.length) {
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <SEO {...SEOConfigs.cart} />
        <QueryError error={error} onRetry={() => void refetch()} />
      </div>
    );
  }

  const items = cart?.items ?? [];
  const total = cart?.total ?? { amount: 0, currency: 'USD' as const };

  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.cart} />

      {items.length === 0 ? (
        <div className="px-4 py-6">
          <Link to="/shop" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors">
            <ArrowLeft className="size-5" />
            <span className="text-sm font-medium">Continue Shopping</span>
          </Link>
          <EmptyCart />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:px-6 lg:py-8">
          <motion.div variants={staggerContainer(reduce ? 0 : 0.05, 0)} initial="hidden" animate="visible" className="px-4 py-6 pb-28 space-y-6 lg:p-0">
            <motion.div variants={fadeUp} className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground">Your Cart</h1>
                <p className="text-sm text-foreground-secondary mt-1">
                  {items.length} {items.length === 1 ? 'item' : 'items'}
                  {!authed && ' · saved on this device'}
                </p>
              </div>
              <Link to="/shop" aria-label="Continue shopping" className="text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="size-5" />
              </Link>
            </motion.div>

            <motion.div variants={fadeUp}>
              <EscrowProtectionBanner amount={total.amount / 100} variant="cart" multiSellerBreakdown={breakdown.length > 1 ? breakdown : undefined} />
            </motion.div>

            <motion.div variants={fadeUp} className="space-y-4">
              {groups.map(group => (
                <motion.div
                  key={group.sellerId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: DURATION.fast }}
                  className="border border-border rounded-card overflow-hidden"
                >
                  <div className="flex items-center justify-between gap-3 bg-background-elevated px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                        {group.seller.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">{group.seller.name}</p>
                        {group.seller.verified && <p className="text-xs text-success">Verified seller</p>}
                      </div>
                    </div>
                    <Button variant="ghost" size="sm" asChild className="text-xs font-medium text-foreground">
                      <Link to={`/profile/${group.seller.username}`}>Visit store</Link>
                    </Button>
                  </div>
                  <ul>
                    <AnimatePresence initial={false}>
                      {group.items.map(item => (
                        <CartItemRow
                          key={`${item.productId}:${item.variantId ?? ''}`}
                          item={item}
                          busy={busy}
                          onQuantityChange={delta => void change(item, delta)}
                          onRemove={() => void change(item, -item.quantity)}
                        />
                      ))}
                    </AnimatePresence>
                  </ul>
                </motion.div>
              ))}
            </motion.div>

            {authed ? (
              <motion.form variants={fadeUp} onSubmit={applyPromo} className="space-y-3">
                <label htmlFor="promo" className="text-sm font-semibold text-foreground block">Promo Code</label>
                {cart?.couponCode ? (
                  <div className="flex-1 px-4 py-3 rounded-xl bg-success/10 border border-success/30 flex items-center gap-2">
                    <span className="text-sm font-medium text-success">{cart.couponCode}</span>
                    <span className="text-xs text-success">({formatMoney(cart.discount)} off)</span>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <Field id="promo" label="Promo code" hideLabel placeholder="Enter code" value={promoCode} onChange={e => setPromoCode(e.target.value)} error={promoError ?? undefined} autoCapitalize="characters" />
                    </div>
                    <Button type="submit" variant="secondary" size="lg" loading={coupon.isPending} disabled={!promoCode.trim()}>
                      Apply
                    </Button>
                  </div>
                )}
              </motion.form>
            ) : (
              <motion.div variants={fadeUp} className="rounded-card border border-dashed border-border bg-background-elevated px-4 py-3 text-sm text-foreground-secondary">
                <Link to="/login" className="font-semibold text-primary hover:underline">Sign in</Link> to apply promo codes and check out with escrow protection.
              </motion.div>
            )}

            <motion.div variants={fadeUp} className="flex items-start gap-3 rounded-card bg-success/5 border border-success/20 p-4">
              <ShieldCheck className="size-5 text-success shrink-0 mt-0.5" />
              <p className="text-sm text-foreground-secondary">Every order is escrow-protected. Sellers are paid only after you confirm delivery.</p>
            </motion.div>
          </motion.div>

          {/* Mobile sticky footer */}
          <div className="fixed left-0 right-0 bottom-[calc(var(--nav-height)+var(--safe-bottom))] lg:hidden z-20 bg-background/95 backdrop-blur-xl border-t border-border">
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground-secondary">
                  Total · {cart?.shipping.amount === 0 ? 'free shipping' : `+${formatMoney(cart!.shipping)} shipping`}
                  {cart && cart.discount.amount > 0 ? ` · saved ${formatMoney(cart.discount)}` : ''}
                </p>
                <p className="font-display font-bold text-lg tabular-nums text-foreground">{formatMoney(total)}</p>
              </div>
              <Button variant="gradient" size="lg" className="shadow-brand" onClick={() => navigate(authed ? '/checkout' : '/login', authed ? undefined : { state: { next: '/checkout' } })}>
                Checkout
              </Button>
            </div>
          </div>

          {/* Desktop summary */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
              <Card variant="elevated" className="p-6 space-y-4">
                <h3 className="font-display font-semibold text-lg">Order Summary</h3>
                {cart && <Summary cart={cart} sellers={groups.length} />}
                <div className="pt-4 border-t border-border flex justify-between font-display font-bold text-lg">
                  <span>Total</span>
                  <span className="text-accent-brand">{formatMoney(total)}</span>
                </div>
                <Button variant="gradient" size="xl" fullWidth className="shadow-brand" onClick={() => navigate(authed ? '/checkout' : '/login', authed ? undefined : { state: { next: '/checkout' } })}>
                  {authed ? 'Checkout' : 'Sign in to checkout'}
                </Button>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
