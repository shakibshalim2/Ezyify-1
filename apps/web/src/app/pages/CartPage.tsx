import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Button } from '../components/primitives/Button';
import { Field } from '../components/primitives/Field';
import { Card } from '../components/primitives/Card';
import { Skeleton } from '../components/primitives/Skeleton';
import { EmptyCart } from '../components/EmptyStates';
import { CartItemRow } from '../components/cart/CartItemRow';
import { EscrowProtectionBanner } from '../components/EscrowProtectionBanner';
import { SEO, SEOConfigs } from '../components/SEO';
import { products } from '../data/products';
import { toast } from 'sonner';
import { fadeUp, staggerContainer, DURATION, EASE_EMPHASIZED } from '../lib/motion';

interface CartItem {
  id: string;
  quantity: number;
}

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

export default function CartPage() {
  const reduce = useReducedMotion();
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [cartItemIds, setCartItemIds] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCartData = () => {
      const savedCart = localStorage.getItem('ezyify_cart');
      let loadedCartItems: CartItem[] = [];

      if (savedCart) {
        try {
          loadedCartItems = JSON.parse(savedCart);
        } catch (e) {
          console.error('Failed to parse cart', e);
        }
      }

      setCartItemIds(loadedCartItems);
      setIsLoading(false);
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadCartData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadCartData, 16);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('ezyify_cart', JSON.stringify(cartItemIds));
    }
  }, [cartItemIds, isLoading]);

  const cartItems = cartItemIds
    .map(item => {
      const product = products.find(p => p.id === item.id);
      return product ? { ...product, quantity: item.quantity } : null;
    })
    .filter(Boolean);

  const updateQuantity = (id: string, delta: number) => {
    setCartItemIds(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: Math.max(1, Math.min(99, item.quantity + delta)) } : item
      )
    );
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id: string) => {
    setCartItemIds(prev => prev.filter(item => item.id !== id));
    toast.success('Item removed from cart');
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const saveForLater = (id: string) => {
    const wishlist = JSON.parse(localStorage.getItem('ezyify_wishlist') || '[]');
    if (!wishlist.includes(id)) {
      wishlist.push(id);
      localStorage.setItem('ezyify_wishlist', JSON.stringify(wishlist));
      removeItem(id);
      toast.success('Saved to wishlist');
    }
  };

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'EZYIFY10') {
      setAppliedPromo('EZYIFY10');
      toast.success('10% discount applied!');
      setPromoCode('');
    } else if (promoCode.toUpperCase() === 'EZYIFY20') {
      setAppliedPromo('EZYIFY20');
      toast.success('20% discount applied!');
      setPromoCode('');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const removePromo = () => {
    setAppliedPromo(null);
    toast.success('Promo code removed');
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0);
  const discount = appliedPromo === 'EZYIFY20' ? subtotal * 0.2 : appliedPromo === 'EZYIFY10' ? subtotal * 0.1 : 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal - discount + shipping;

  const groupedBySeller = cartItems.reduce((acc, item) => {
    if (!item) return acc;
    const sellerId = item.seller.id;
    const existing = acc.find(g => g.sellerId === sellerId);
    if (existing) {
      existing.items.push(item);
    } else {
      acc.push({ sellerId, seller: item.seller, items: [item] });
    }
    return acc;
  }, [] as Array<{ sellerId: string; seller: any; items: any[] }>);

  const sellerBreakdown = groupedBySeller.map(g => ({
    sellerId: g.sellerId,
    sellerName: g.seller.name,
    amount: g.items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  }));

  if (isLoading) {
    return <CartSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.cart} />

      {cartItems.length === 0 ? (
        <div className="px-4 py-6">
          <Link to="/shop" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors">
            <ArrowLeft className="size-5" />
            <span className="text-sm font-medium">Continue Shopping</span>
          </Link>
          <EmptyCart />
        </div>
      ) : (
        <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:px-6 lg:py-8">
          <motion.div
            variants={staggerContainer(reduce ? 0 : 0.05, 0)}
            initial="hidden"
            animate="visible"
            className="px-4 py-6 pb-28 space-y-6 lg:p-0"
          >
            {/* Header */}
            <motion.div variants={fadeUp} className="flex items-center justify-between">
              <div>
                <h1 className="font-display text-2xl font-semibold text-foreground">Your Cart</h1>
                <p className="text-sm text-foreground-secondary mt-1">
                  {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
                </p>
              </div>
              <Link to="/shop" className="text-primary hover:text-primary/80 transition-colors">
                <ArrowLeft className="size-5" />
              </Link>
            </motion.div>

            {/* Escrow Protection */}
            <motion.div variants={fadeUp}>
              <EscrowProtectionBanner
                amount={total}
                variant="cart"
                multiSellerBreakdown={sellerBreakdown.length > 1 ? sellerBreakdown : undefined}
              />
            </motion.div>

            {/* Seller Groups */}
            <AnimatePresence mode="wait">
              <motion.div variants={fadeUp} className="space-y-4">
                {groupedBySeller.map(group => (
                  <motion.div
                    key={group.sellerId}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: DURATION.fast }}
                    className="border border-border rounded-card overflow-hidden"
                  >
                    {/* Seller Header */}
                    <div className="flex items-center justify-between gap-3 bg-background-elevated px-4 py-3 border-b border-border">
                      <div className="flex items-center gap-3">
                        <div className="size-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-sm flex-shrink-0">
                          {group.seller.avatar ? (
                            <img
                              src={group.seller.avatar}
                              alt={group.seller.name}
                              className="size-full rounded-full object-cover"
                            />
                          ) : (
                            group.seller.name.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">{group.seller.name}</p>
                          {group.seller.verified && (
                            <p className="text-xs text-success">Verified seller</p>
                          )}
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="text-xs font-medium text-foreground"
                      >
                        <a href={`/seller/${group.seller.id}`}>Chat</a>
                      </Button>
                    </div>

                    {/* Items */}
                    <ul>
                      <AnimatePresence initial={false}>
                        {group.items.map(item => (
                          <CartItemRow
                            key={item.id}
                            item={item}
                            onQuantityChange={delta => updateQuantity(item.id, delta)}
                            onRemove={() => removeItem(item.id)}
                            onSaveForLater={() => saveForLater(item.id)}
                          />
                        ))}
                      </AnimatePresence>
                    </ul>
                  </motion.div>
                ))}
              </motion.div>
            </AnimatePresence>

            {/* Promo Code */}
            <motion.div variants={fadeUp} className="space-y-3">
              <label className="text-sm font-semibold text-foreground block">Promo Code</label>
              {appliedPromo ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 rounded-xl bg-success/10 border border-success/30 flex items-center gap-2">
                    <span className="text-sm font-medium text-success">{appliedPromo}</span>
                    <span className="text-xs text-success">({(discount).toFixed(2)} off)</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={removePromo}
                    aria-label="Remove promo code"
                  >
                    ✕
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Field
                    label="Enter code"
                    hideLabel
                    placeholder="EZYIFY10"
                    value={promoCode}
                    onChange={e => setPromoCode(e.target.value.toUpperCase())}
                    onKeyDown={e => e.key === 'Enter' && applyPromo()}
                    containerClassName="flex-1 m-0"
                  />
                  <Button
                    variant="outline"
                    size="md"
                    onClick={applyPromo}
                    className="mt-6"
                  >
                    Apply
                  </Button>
                </div>
              )}
            </motion.div>
          </motion.div>

          {/* Sticky Bottom Bar (Mobile) */}
          <div className="fixed inset-x-0 bottom-[calc(var(--nav-height)+var(--safe-bottom))] lg:hidden z-20 bg-background/95 backdrop-blur-xl border-t border-border">
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs text-foreground-secondary">
                  Total · {shipping === 0 ? 'free shipping' : `+$${shipping.toFixed(2)} shipping`}
                  {discount > 0 ? ` · saved $${discount.toFixed(2)}` : ''}
                </p>
                <p className="font-display font-bold text-lg tabular-nums text-foreground">${total.toFixed(2)}</p>
              </div>
              <Button asChild variant="gradient" size="lg" className="shadow-brand">
                <Link to="/checkout">Checkout</Link>
              </Button>
            </div>
          </div>

          {/* Desktop Summary Card */}
          <div className="hidden lg:block">
            <div className="sticky top-24">
            <Card variant="elevated" className="p-6 space-y-4">
              <h3 className="font-display font-semibold text-lg">Order Summary</h3>

              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Subtotal</span>
                  <span className="font-medium text-foreground">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-success">
                    <span>Discount ({appliedPromo === 'EZYIFY20' ? '20%' : '10%'})</span>
                    <span>-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-foreground-secondary">Shipping</span>
                  <span className="font-medium text-foreground">
                    {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                  </span>
                </div>
                {subtotal < 100 && subtotal > 0 && (
                  <p className="text-xs text-foreground-secondary">
                    Add ${(100 - subtotal).toFixed(2)} more for free shipping
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-border flex justify-between font-display font-bold text-lg">
                <span>Total</span>
                <span className="text-accent-brand">${total.toFixed(2)}</span>
              </div>

              <Button asChild variant="gradient" size="xl" fullWidth className="shadow-brand">
                <Link to="/checkout">Checkout</Link>
              </Button>
            </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
