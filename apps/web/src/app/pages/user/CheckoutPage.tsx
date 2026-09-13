import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, Truck, CreditCard, Shield, CheckCircle2 } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Field } from '../../components/primitives/Field';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EscrowProtectionBanner } from '../../components/EscrowProtectionBanner';
import { PaymentFailureModal, PaymentErrorType } from '../../components/PaymentFailureModal';
import { UnavailableItemsModal, UnavailableItem } from '../../components/UnavailableItemsModal';
import { QuickAddFunds } from '../../components/QuickAddFunds';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Label } from '../../components/ui/label';
import { products } from '../../data/products';
import { ReferralService } from '../../services/referral';
import { toast } from 'sonner';
import { fadeUp, staggerContainer, DURATION } from '../../lib/motion';

interface CartItem {
  id: string;
  quantity: number;
}

const STEPS = [
  { id: 'address', label: 'Address' },
  { id: 'payment', label: 'Payment' },
  { id: 'review', label: 'Review' },
] as const;

function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="px-4 py-6 pb-40">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="space-y-6">
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
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [currentStep, setCurrentStep] = useState<'address' | 'payment' | 'review'>('address');
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [showPaymentFailure, setShowPaymentFailure] = useState(false);
  const [paymentError, setPaymentError] = useState<PaymentErrorType>('UNKNOWN_ERROR');
  const [walletBalance] = useState(1500);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [showUnavailableItems, setShowUnavailableItems] = useState(false);
  const [unavailableItems, setUnavailableItems] = useState<UnavailableItem[]>([]);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    zip: ''
  });

  const [pageData, setPageData] = useState<{
    cartItemIds: CartItem[];
    cartItems: any[];
  } | null>(null);

  useEffect(() => {
    const loadCheckoutData = () => {
      const savedCart = localStorage.getItem('ezyify_cart');
      let cartItemIds: CartItem[] = [];

      if (savedCart) {
        try {
          cartItemIds = JSON.parse(savedCart);
        } catch (e) {
          console.error('Failed to parse cart', e);
        }
      }

      const cartItems = cartItemIds
        .map(item => {
          const product = products.find(p => p.id === item.id);
          return product ? { ...product, quantity: item.quantity } : null;
        })
        .filter(Boolean);

      setPageData({ cartItemIds, cartItems });
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadCheckoutData, { timeout: 50 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadCheckoutData, 10);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!pageData) {
    return <CheckoutSkeleton />;
  }

  const { cartItemIds, cartItems } = pageData;

  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4">
        <h2 className="font-display text-2xl font-semibold text-foreground mb-2">Your cart is empty</h2>
        <p className="text-foreground-secondary mb-6">Add some items before checkout</p>
        <Link to="/shop">
          <Button variant="primary">Continue Shopping</Button>
        </Link>
      </div>
    );
  }

  const subtotal = cartItems.reduce((sum, item) => sum + (item?.price || 0) * (item?.quantity || 0), 0);
  const discount = appliedPromo === 'EZYIFY20' ? subtotal * 0.2 : appliedPromo === 'EZYIFY10' ? subtotal * 0.1 : 0;
  const shippingCost = shippingMethod === 'express' ? 15 : subtotal > 100 ? 0 : 9.99;
  const total = subtotal - discount + shippingCost;

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

  const handlePlaceOrder = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (paymentMethod === 'card' && walletBalance < total) {
      setPaymentError('INSUFFICIENT_FUNDS');
      setShowPaymentFailure(true);
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      const randomFail = Math.random();

      if (randomFail > 0.9) {
        setPaymentError('PAYMENT_GATEWAY_ERROR');
        setShowPaymentFailure(true);
        setIsProcessing(false);
        return;
      }

      if (randomFail > 0.85) {
        setPaymentError('NETWORK_ERROR');
        setShowPaymentFailure(true);
        setIsProcessing(false);
        return;
      }

      localStorage.setItem('ezyify_cart', JSON.stringify([]));

      const pendingReferralRaw = sessionStorage.getItem('ezyify_pending_referral');
      if (pendingReferralRaw) {
        try {
          const { productId } = JSON.parse(pendingReferralRaw);
          const orderId = `order-${Date.now()}`;
          const buyerUserId = (JSON.parse(localStorage.getItem('ezyify_user') ?? 'null')?.id as string) ?? 'guest';
          ReferralService.attributePurchase({ productId, buyerUserId, orderId, orderValue: total });
          sessionStorage.removeItem('ezyify_pending_referral');
        } catch (_) {}
      }

      toast.success('Order placed successfully! 🎉', {
        description: `Payment of $${total.toFixed(2)} is held securely in escrow until delivery is confirmed.`
      });

      setIsProcessing(false);

      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    }, 2000);
  };

  const stepIndex = STEPS.findIndex(s => s.id === currentStep);
  const isAddressComplete = formData.firstName && formData.lastName && formData.address && formData.city && formData.phone;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Checkout — Ezyify" description="Complete your purchase securely with escrow protection." />

      <div className="mx-auto max-w-7xl lg:grid lg:grid-cols-[minmax(0,1fr)_360px] lg:gap-8 lg:px-6 lg:py-8">
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="px-4 py-6 pb-28 space-y-6 lg:p-0"
      >
        {/* Header */}
        <motion.div variants={fadeUp}>
          <Link to="/cart" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 transition-colors">
            <ArrowLeft className="size-5" />
            <span className="text-sm font-medium">Back to Cart</span>
          </Link>
          <h1 className="font-display text-2xl font-semibold text-foreground">Checkout</h1>
        </motion.div>

        {/* Progress Steps */}
        <motion.div variants={fadeUp}>
          <ol className="flex gap-2" aria-label="Checkout progress">
            {STEPS.map((step, i) => (
              <li key={step.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => i < stepIndex && setCurrentStep(step.id)}
                  className="w-full text-left"
                >
                  <div className="space-y-1.5">
                    <div className={`h-1.5 rounded-full transition-colors ${
                      i < stepIndex ? 'bg-success' : i === stepIndex ? 'bg-primary' : 'bg-border'
                    }`} />
                    <p className={`text-xs font-medium ${
                      i <= stepIndex ? 'text-foreground' : 'text-foreground-tertiary'
                    }`}>
                      {step.label}
                    </p>
                  </div>
                </button>
              </li>
            ))}
          </ol>
        </motion.div>

        {/* Escrow Banner */}
        <motion.div variants={fadeUp}>
          <EscrowProtectionBanner amount={total} variant="checkout" />
        </motion.div>

        {/* Form Sections */}
        <motion.div variants={fadeUp} className="space-y-6">
          {/* Address Step */}
          {currentStep === 'address' && (
            <Card className="p-4 lg:p-6 space-y-4">
              <div className="flex items-center gap-3">
                <MapPin className="size-5 text-primary flex-shrink-0" />
                <h2 className="font-display font-semibold text-lg">Shipping Address</h2>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="First Name"
                    placeholder="John"
                    value={formData.firstName}
                    onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                    success={!!(formData.firstName && !formData.firstName.match(/^\s*$/))}
                  />
                  <Field
                    label="Last Name"
                    placeholder="Doe"
                    value={formData.lastName}
                    onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                    success={!!(formData.lastName && !formData.lastName.match(/^\s*$/))}
                  />
                </div>

                <Field
                  label="Phone Number"
                  type="tel"
                  placeholder="+1 (888) 234-5678"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />

                <Field
                  label="Street Address"
                  placeholder="House #, Road #, Area"
                  value={formData.address}
                  onChange={e => setFormData({ ...formData, address: e.target.value })}
                />

                <div className="grid grid-cols-2 gap-3">
                  <Field
                    label="City"
                    placeholder="New York"
                    value={formData.city}
                    onChange={e => setFormData({ ...formData, city: e.target.value })}
                  />
                  <Field
                    label="ZIP Code"
                    placeholder="10001"
                    value={formData.zip}
                    onChange={e => setFormData({ ...formData, zip: e.target.value })}
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border flex gap-2">
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => isAddressComplete && setCurrentStep('payment')}
                  disabled={!isAddressComplete}
                >
                  Continue to Payment
                </Button>
              </div>
            </Card>
          )}

          {/* Payment Step */}
          {currentStep === 'payment' && (
            <div className="space-y-4">
              {/* Shipping Method */}
              <Card className="p-4 lg:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <Truck className="size-5 text-primary flex-shrink-0" />
                  <h2 className="font-display font-semibold text-lg">Shipping Method</h2>
                </div>

                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="space-y-3">
                    {[
                      { value: 'standard', label: 'Standard Delivery', desc: '5-7 business days', cost: subtotal > 100 ? 'FREE' : '$9.99' },
                      { value: 'express', label: 'Express Delivery', desc: '2-3 business days', cost: '$15.00' }
                    ].map(option => (
                      <label key={option.value} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-border-strong cursor-pointer transition-colors">
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{option.label}</p>
                          <p className="text-xs text-foreground-secondary">{option.desc}</p>
                        </div>
                        <span className="text-sm font-semibold text-accent-brand flex-shrink-0">{option.cost}</span>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </Card>

              {/* Payment Method */}
              <Card className="p-4 lg:p-6 space-y-4">
                <div className="flex items-center gap-3">
                  <CreditCard className="size-5 text-primary flex-shrink-0" />
                  <h2 className="font-display font-semibold text-lg">Payment Method</h2>
                </div>

                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="space-y-3">
                    {[
                      { value: 'card', label: 'Credit/Debit Card', desc: 'Visa, Mastercard, Amex' },
                      { value: 'wallet', label: 'Digital Wallet', desc: 'Apple Pay, Google Pay' },
                      { value: 'ezyify-wallet', label: 'Ezyify Wallet', desc: 'Use your wallet balance' }
                    ].map(option => (
                      <label key={option.value} className="flex items-start gap-3 p-3 rounded-xl border border-border hover:border-border-strong cursor-pointer transition-colors">
                        <RadioGroupItem value={option.value} id={option.value} className="mt-1 flex-shrink-0" />
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-foreground">{option.label}</p>
                          <p className="text-xs text-foreground-secondary">{option.desc}</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </RadioGroup>
              </Card>

              {/* Promo Code */}
              <Card className="p-4 lg:p-6 space-y-3">
                <label className="text-sm font-semibold text-foreground block">Promo Code</label>
                {appliedPromo ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-4 py-2 rounded-xl bg-success/10 border border-success/30 flex items-center gap-2">
                      <span className="text-sm font-medium text-success">{appliedPromo}</span>
                      <span className="text-xs text-success">-${discount.toFixed(2)}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setAppliedPromo(null)}
                      aria-label="Remove promo"
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
                      containerClassName="flex-1 m-0"
                      onKeyDown={e => e.key === 'Enter' && applyPromo()}
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
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => setCurrentStep('address')}
                >
                  Back
                </Button>
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  onClick={() => setCurrentStep('review')}
                >
                  Review Order
                </Button>
              </div>
            </div>
          )}

          {/* Review Step */}
          {currentStep === 'review' && (
            <div className="space-y-4">
              {/* Address Summary */}
              <Card variant="ghost" className="p-4 lg:p-6 border border-border-subtle space-y-2">
                <h3 className="font-semibold text-sm text-foreground-secondary">Shipping To</h3>
                <p className="font-medium text-foreground">{formData.firstName} {formData.lastName}</p>
                <p className="text-sm text-foreground-secondary">{formData.address}</p>
                <p className="text-sm text-foreground-secondary">{formData.city}, {formData.zip}</p>
              </Card>

              {/* Items Summary */}
              <Card variant="ghost" className="p-4 lg:p-6 border border-border-subtle space-y-3">
                <h3 className="font-semibold text-sm text-foreground-secondary">Order Items</h3>
                <div className="space-y-2">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="text-foreground">{item.name} × {item.quantity}</span>
                      <span className="font-medium text-foreground">${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </Card>

              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="lg"
                  fullWidth
                  onClick={() => setCurrentStep('payment')}
                >
                  Back
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>

      {/* Sticky Bottom Bar (Mobile) */}
      {currentStep === 'review' && (
      <div className="fixed inset-x-0 bottom-[calc(var(--nav-height)+var(--safe-bottom))] lg:hidden z-20 bg-background/95 backdrop-blur-xl border-t border-border">
        <div className="px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground-secondary">Total{discount > 0 ? ` · saved $${discount.toFixed(2)}` : ''}</p>
            <p className="font-display font-bold text-lg tabular-nums text-foreground">${total.toFixed(2)}</p>
          </div>
          {(
            <Button
              variant="gradient"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="shadow-brand"
              leftIcon={isProcessing ? undefined : <Shield className="size-5" />}
              loadingText="Processing..."
              loading={isProcessing}
            >
              {isProcessing ? 'Processing...' : 'Place order'}
            </Button>
          )}
        </div>
      </div>
      )}

      {/* Desktop Summary */}
      <div className="hidden lg:block">
        <div className="sticky top-24">
        <Card variant="elevated" className="p-6 space-y-4">
          <h3 className="font-display font-semibold text-lg">Order Summary</h3>

          <div className="space-y-3 max-h-64 overflow-y-auto">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-foreground line-clamp-1">{item.name} × {item.quantity}</span>
                <span className="font-medium flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div className="border-t border-border pt-3 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-sm text-success">
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-foreground-secondary">Shipping</span>
              <span>{shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-border flex justify-between font-display font-bold text-lg">
            <span>Total</span>
            <span className="text-accent-brand">${total.toFixed(2)}</span>
          </div>

          {currentStep === 'review' && (
            <Button
              variant="gradient"
              size="lg"
              onClick={handlePlaceOrder}
              disabled={isProcessing}
              className="shadow-brand"
              loading={isProcessing}
              loadingText="Processing..."
            >
              Place Order
            </Button>
          )}
        </Card>
        </div>
      </div>
      </div>

      {/* Modals */}
      <PaymentFailureModal
        isOpen={showPaymentFailure}
        error={paymentError}
        requiredAmount={total}
        currentBalance={walletBalance}
        onRetry={() => {
          setShowPaymentFailure(false);
          handlePlaceOrder();
        }}
        onAddFunds={() => {
          setShowPaymentFailure(false);
          setShowAddFunds(true);
        }}
        onCancel={() => setShowPaymentFailure(false)}
        onContactSupport={() => {
          setShowPaymentFailure(false);
          navigate('/help');
        }}
      />

      <Dialog open={showAddFunds} onOpenChange={setShowAddFunds}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Add Funds to Wallet</DialogTitle>
            <DialogDescription>
              Securely add funds to your Ezyify wallet to complete your purchase
            </DialogDescription>
          </DialogHeader>
          <QuickAddFunds
            suggestedAmount={Math.ceil((total - walletBalance) / 100) * 100}
            onSuccess={amount => {
              toast.success(`Successfully added $${amount.toFixed(2)} to your wallet`);
              setShowAddFunds(false);
              toast.info('Please click "Place Order" again to complete your purchase');
            }}
            onCancel={() => setShowAddFunds(false)}
          />
        </DialogContent>
      </Dialog>

      <UnavailableItemsModal
        isOpen={showUnavailableItems}
        items={unavailableItems}
        onUpdateQuantity={() => setShowUnavailableItems(false)}
        onRemoveItem={() => setShowUnavailableItems(false)}
        onRemoveAll={() => setShowUnavailableItems(false)}
        onMoveToWishlist={() => setShowUnavailableItems(false)}
        onContinue={() => setShowUnavailableItems(false)}
        onViewCart={() => navigate('/cart')}
      />
    </div>
  );
}
