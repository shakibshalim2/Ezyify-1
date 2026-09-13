import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { products } from '../data/products';
import { Trash2, Plus, Minus, ShoppingBag, Tag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router';
import { SEO, SEOConfigs } from '../components/SEO';
import { toast } from 'sonner';
import { EscrowProtectionBanner } from '../components/EscrowProtectionBanner';
import { TrustSignals } from '../components/TrustSignals';

interface CartItem {
  id: string;
  quantity: number;
}

// SKELETON FOR INSTANT UI
function CartSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 pb-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-card border border-border rounded-2xl p-4">
                <div className="flex gap-4">
                  <Skeleton className="w-24 h-24 rounded-xl" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                    <Skeleton className="h-8 w-32" />
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div>
            <div className="bg-card border border-border rounded-2xl p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  // ALL HOOKS MUST BE AT TOP LEVEL - NO CONDITIONAL HOOKS
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [cartItemIds, setCartItemIds] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load cart from localStorage progressively
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

  // Save cart to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('ezyify_cart', JSON.stringify(cartItemIds));
    }
  }, [cartItemIds, isLoading]);

  // Compute cart items from IDs
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
    // Dispatch custom event to update Navigation cart count
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (id: string) => {
    setCartItemIds(prev => prev.filter(item => item.id !== id));
    toast.success('Item removed from cart');
    // Dispatch custom event to update Navigation cart count
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const applyPromo = () => {
    if (promoCode.toUpperCase() === 'EZYIFY10') {
      setAppliedPromo('EZYIFY10');
      toast.success('10% discount applied!');
    } else if (promoCode.toUpperCase() === 'EZYIFY20') {
      setAppliedPromo('EZYIFY20');
      toast.success('20% discount applied!');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const subtotal = cartItems.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0);
  const discount = appliedPromo === 'EZYIFY20' ? subtotal * 0.2 : appliedPromo === 'EZYIFY10' ? subtotal * 0.1 : 0;
  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal - discount + shipping;

  // Calculate multi-seller breakdown for escrow
  const sellerBreakdown = cartItems.reduce((acc, item) => {
    if (!item) return acc;
    const sellerId = item.seller.id;
    const existing = acc.find(s => s.sellerId === sellerId);
    const itemTotal = item.price * item.quantity;
    
    if (existing) {
      existing.amount += itemTotal;
    } else {
      acc.push({
        sellerId: sellerId,
        sellerName: item.seller.name,
        amount: itemTotal
      });
    }
    return acc;
  }, [] as Array<{ sellerId: string; sellerName: string; amount: number }>);

  // Show skeleton while loading
  if (isLoading) {
    return <CartSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.cart} />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <Link to="/shop" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          <span>Continue Shopping</span>
        </Link>

        <div className="flex items-center justify-between mb-6">
          <h1 className="font-semibold text-foreground">
            Shopping Cart
            <span className="ml-2 text-sm font-normal text-muted-foreground">({cartItems.length} {cartItems.length === 1 ? 'item' : 'items'})</span>
          </h1>
        </div>

        {cartItems.length === 0 ? (
          <div className="bg-card border border-border rounded-3xl p-16 text-center">
            <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mx-auto mb-5 shadow-inset">
              <ShoppingBag className="w-9 h-9 text-muted-foreground" />
            </div>
            <h2 className="font-semibold text-foreground mb-2">Your cart is empty</h2>
            <p className="text-sm text-muted-foreground mb-6 max-w-xs mx-auto">Add some products to get started on your shopping journey.</p>
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold text-white shadow-brand hover:shadow-brand-lg transition-all hover:scale-[1.02]"
              style={{ background: 'var(--brand-gradient)' }}
            >
              Start Shopping
            </Link>
          </div>
        ) : (
          <>
            {/* Escrow Protection Banner */}
            <EscrowProtectionBanner
              amount={total}
              variant="cart"
              multiSellerBreakdown={sellerBreakdown.length > 1 ? sellerBreakdown : undefined}
            />

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Cart Items */}
              <div className="lg:col-span-2 space-y-4">
                {cartItems.map(item => item && (
                  <div key={item.id} className="bg-card border border-border rounded-2xl p-4 sm:p-5 transition-all hover:shadow-md hover:border-border-strong">
                    <div className="flex gap-4">
                      <Link to={`/product/${item.id}`} className="flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          loading="lazy"
                          className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-xl hover:opacity-90 transition-opacity"
                        />
                      </Link>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between gap-3 mb-2">
                          <div className="flex-1 min-w-0">
                            <Link to={`/product/${item.id}`} className="font-semibold text-sm text-foreground hover:text-primary transition-colors line-clamp-2 leading-snug">
                              {item.name}
                            </Link>
                            <p className="text-xs text-muted-foreground mt-0.5">{item.seller.name}</p>
                            {item.inStock
                              ? <span className="inline-flex items-center gap-1 text-xs text-success mt-1"><span className="w-1.5 h-1.5 rounded-full bg-success" />In Stock</span>
                              : <span className="text-xs text-error mt-1 block">Out of Stock</span>
                            }
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="p-3 rounded-xl text-muted-foreground hover:text-error hover:bg-error/8 transition-all flex-shrink-0"
                            aria-label="Remove item"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2 bg-muted rounded-xl p-0.5">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              disabled={item.quantity <= 1}
                              className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-card transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3.5 h-3.5 text-foreground" />
                            </button>
                            <span className="font-semibold w-7 text-center text-sm text-foreground">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              disabled={item.quantity >= 99}
                              className="w-11 h-11 rounded-xl flex items-center justify-center hover:bg-card transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3.5 h-3.5 text-foreground" />
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-foreground">${(item.price * item.quantity).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">${item.price.toFixed(2)} each</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-card border border-border rounded-3xl p-6 sticky top-20 shadow-md">
                  <h2 className="font-bold text-foreground mb-5">Order Summary</h2>
                  
                  {/* Promo Code */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-foreground mb-2">Promo Code</label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                          placeholder="Enter code"
                          className="w-full pl-10 pr-4 py-2 bg-muted border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-foreground placeholder:text-muted-foreground transition-all"
                          disabled={!!appliedPromo}
                        />
                      </div>
                      <Button
                        onClick={applyPromo}
                        disabled={!!appliedPromo || !promoCode}
                        variant="outline"
                        className="whitespace-nowrap"
                      >
                        {appliedPromo ? 'Applied' : 'Apply'}
                      </Button>
                    </div>
                    {appliedPromo && (
                      <div className="mt-2 flex items-center justify-between text-sm">
                        <span className="text-primary font-medium">{appliedPromo} applied</span>
                        <button
                          onClick={() => {
                            setAppliedPromo(null);
                            setPromoCode('');
                            toast.success('Promo code removed');
                          }}
                          className="text-destructive hover:text-destructive/80 text-xs"
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </div>

                  <Separator className="my-4" />

                  {/* Price Breakdown */}
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Subtotal</span>
                      <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between text-success">
                        <span>Discount ({appliedPromo === 'EZYIFY20' ? '20%' : '10%'})</span>
                        <span className="font-medium">-${discount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-muted-foreground">
                      <span>Shipping</span>
                      <span className="text-foreground font-medium">
                        {shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}
                      </span>
                    </div>
                    {subtotal < 100 && subtotal > 0 && (
                      <p className="text-xs text-muted-foreground">
                        Add ${(100 - subtotal).toFixed(2)} more for free shipping!
                      </p>
                    )}
                  </div>

                  <Separator className="my-4" />

                  <div className="flex justify-between font-bold text-foreground mb-5 pt-3 border-t border-border">
                    <span>Total</span>
                    <span className="text-xl">${total.toFixed(2)}</span>
                  </div>

                  <Link to="/checkout" className="block">
                    <button
                      className="w-full py-3.5 rounded-2xl text-sm font-bold text-white shadow-brand hover:shadow-brand-lg transition-all hover:scale-[1.01] active:scale-[0.99]"
                      style={{ background: 'var(--brand-gradient)' }}
                    >
                      Proceed to Checkout →
                    </button>
                  </Link>

                  <Link to="/shop" className="block mt-2.5">
                    <Button variant="outline" className="w-full text-sm">
                      Continue Shopping
                    </Button>
                  </Link>

                  {/* Trust Signals */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <TrustSignals variant="compact" context="checkout" />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
