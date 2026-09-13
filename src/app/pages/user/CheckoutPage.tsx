import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowLeft, MapPin, CreditCard, Truck, Shield, Tag, CheckCircle } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { RadioGroup, RadioGroupItem } from '../../components/ui/radio-group';
import { Separator } from '../../components/ui/separator';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { products } from '../../data/products';
import { ReferralService } from '../../services/referral';
import { toast } from 'sonner';
import { EscrowProtectionBanner } from '../../components/EscrowProtectionBanner';
import { PaymentFailureModal, PaymentErrorType } from '../../components/PaymentFailureModal';
import { UnavailableItemsModal, UnavailableItem } from '../../components/UnavailableItemsModal';
import { QuickAddFunds } from '../../components/QuickAddFunds';
import { TrustSignals, SecurityBadges } from '../../components/TrustSignals';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../components/ui/dialog';

// SKELETON FOR INSTANT UI - CRITICAL FOR CHECKOUT
function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 pb-6">
        <Skeleton className="h-6 w-32 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Form Skeleton */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="grid grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="space-y-2">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-10 w-full" />
                  </div>
                ))}
              </div>
            </div>
            {/* Payment Method Skeleton */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <Skeleton className="h-6 w-48 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            </div>
          </div>
          {/* Order Summary Skeleton */}
          <div>
            <div className="bg-card border border-border rounded-2xl p-6 sticky top-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex gap-3">
                    <Skeleton className="w-16 h-16 rounded" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-20" />
                    </div>
                  </div>
                ))}
              </div>
              <Separator className="my-4" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-6 w-full" />
              </div>
              <Skeleton className="h-12 w-full mt-4" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('ezyify-wallet');
  const [shippingMethod, setShippingMethod] = useState('standard');
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Payment failure state
  const [showPaymentFailure, setShowPaymentFailure] = useState(false);
  const [paymentError, setPaymentError] = useState<PaymentErrorType>('UNKNOWN_ERROR');
  
  // Wallet state
  const [walletBalance] = useState(1500); // Mock wallet balance
  const [showAddFunds, setShowAddFunds] = useState(false);
  
  // Unavailable items state
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

  // PROGRESSIVE LOADING: Load checkout data after initial render
  const [pageData, setPageData] = useState<{
    cartItemIds: { id: string; quantity: number }[];
    cartItems: any[];
  } | null>(null);

  // Load cart data progressively
  useEffect(() => {
    const loadCheckoutData = () => {
      const savedCart = localStorage.getItem('ezyify_cart');
      let cartItemIds: { id: string; quantity: number }[] = [];
      
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
      const handle = requestIdleCallback(loadCheckoutData, { timeout: 50 }); // Higher priority
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadCheckoutData, 10); // Faster for critical checkout
      return () => clearTimeout(timer);
    }
  }, []);

  // Show skeleton while loading
  if (!pageData) {
    return <CheckoutSkeleton />;
  }

  const { cartItemIds, cartItems } = pageData;

  const setCartItemIds = (updatedIds: { id: string; quantity: number }[]) => {
    const updatedCartItems = updatedIds
      .map(item => {
        const product = products.find(p => p.id === item.id);
        return product ? { ...product, quantity: item.quantity } : null;
      })
      .filter(Boolean);
    setPageData({ cartItemIds: updatedIds, cartItems: updatedCartItems });
  };

  // Redirect if cart is empty
  if (cartItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-foreground mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-4">Add some items before checkout</p>
          <Link to="/shop" className="text-primary hover:underline">Continue Shopping</Link>
        </div>
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
    } else if (promoCode.toUpperCase() === 'EZYIFY20') {
      setAppliedPromo('EZYIFY20');
      toast.success('20% discount applied!');
    } else {
      toast.error('Invalid promo code');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handlePlaceOrder = async () => {
    // Validate form
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.address || !formData.city) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('Your cart is empty');
      return;
    }

    // Validate cart availability (simulate)
    const mockUnavailableItems: UnavailableItem[] = [];
    
    // Simulate random unavailability for demo purposes  
    if (Math.random() > 0.8 && cartItems[0]) {
      mockUnavailableItems.push({
        id: cartItems[0].id,
        name: cartItems[0].name,
        image: cartItems[0].image,
        price: cartItems[0].price,
        quantity: cartItems[0].quantity,
        available: Math.floor(cartItems[0].quantity / 2),
        reason: 'INSUFFICIENT_QUANTITY'
      });
    }
    
    if (mockUnavailableItems.length > 0) {
      setUnavailableItems(mockUnavailableItems);
      setShowUnavailableItems(true);
      return;
    }

    // Check wallet balance if using Ezyify wallet
    if (paymentMethod === 'ezyify-wallet' && walletBalance < total) {
      setPaymentError('INSUFFICIENT_FUNDS');
      setShowPaymentFailure(true);
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing with random failures for demo
    setTimeout(() => {
      const randomFail = Math.random();
      
      if (randomFail > 0.9) {
        // Simulate payment gateway error
        setPaymentError('PAYMENT_GATEWAY_ERROR');
        setShowPaymentFailure(true);
        setIsProcessing(false);
        return;
      }
      
      if (randomFail > 0.85) {
        // Simulate network error
        setPaymentError('NETWORK_ERROR');
        setShowPaymentFailure(true);
        setIsProcessing(false);
        return;
      }

      // Clear cart
      localStorage.setItem('ezyify_cart', JSON.stringify([]));

      // Attribute any pending referral commission
      const pendingReferralRaw = sessionStorage.getItem('ezyify_pending_referral');
      if (pendingReferralRaw) {
        try {
          const { referralId } = JSON.parse(pendingReferralRaw);
          const orderId = `order-${Date.now()}`;
          ReferralService.attributePurchase(referralId, orderId, total);
          sessionStorage.removeItem('ezyify_pending_referral');
        } catch (_) {}
      }

      toast.success('Order placed successfully! 🎉', {
        description: `Payment of $${total.toFixed(2)} is held securely in escrow until delivery is confirmed.`
      });

      setIsProcessing(false);

      // Redirect to orders page
      setTimeout(() => {
        navigate('/orders');
      }, 1500);
    }, 2000);
  };

  const handleRetryPayment = () => {
    setShowPaymentFailure(false);
    handlePlaceOrder();
  };

  const handleAddFunds = () => {
    setShowPaymentFailure(false);
    setShowAddFunds(true);
  };

  const handleAddFundsSuccess = (amount: number, method: string) => {
    toast.success(`Successfully added ₹${amount.toLocaleString()} to your wallet`);
    setShowAddFunds(false);
    // In real app, update wallet balance
    toast.info('Please click "Place Order" again to complete your purchase');
  };

  const handleContactSupport = () => {
    setShowPaymentFailure(false);
    navigate('/help');
  };

  const handleUpdateQuantity = (itemId: string, newQuantity: number) => {
    const updatedCart = cartItemIds.map(item =>
      item.id === itemId ? { ...item, quantity: newQuantity } : item
    );
    setCartItemIds(updatedCart);
    localStorage.setItem('ezyify_cart', JSON.stringify(updatedCart));
    setUnavailableItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Quantity updated');
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedCart = cartItemIds.filter(item => item.id !== itemId);
    setCartItemIds(updatedCart);
    localStorage.setItem('ezyify_cart', JSON.stringify(updatedCart));
    setUnavailableItems(prev => prev.filter(item => item.id !== itemId));
    toast.success('Item removed from cart');
  };

  const handleRemoveAllUnavailable = () => {
    const unavailableIds = unavailableItems.map(item => item.id);
    const updatedCart = cartItemIds.filter(item => !unavailableIds.includes(item.id));
    setCartItemIds(updatedCart);
    localStorage.setItem('ezyify_cart', JSON.stringify(updatedCart));
    setUnavailableItems([]);
    setShowUnavailableItems(false);
    toast.success('Unavailable items removed');
  };

  const handleMoveToWishlist = (itemId: string) => {
    handleRemoveItem(itemId);
    toast.success('Moved to wishlist');
  };

  const handleContinueCheckout = () => {
    setShowUnavailableItems(false);
    setUnavailableItems([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Checkout — Ezyify" description="Complete your purchase securely on Ezyify with escrow buyer protection." />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <Link to="/cart" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Cart</span>
          </Link>
          <h1 className="text-foreground mb-2">Checkout</h1>
          <p className="text-muted-foreground">Complete your order</p>
        </div>

        {/* Escrow Protection Banner */}
        <EscrowProtectionBanner
          amount={total}
          variant="checkout"
        />

        <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Shipping Address</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">First Name *</Label>
                    <Input 
                      id="firstName" 
                      placeholder="John" 
                      className="mt-1"
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Last Name *</Label>
                    <Input 
                      id="lastName" 
                      placeholder="Doe" 
                      className="mt-1"
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="phone">Phone Number *</Label>
                    <Input 
                      id="phone" 
                      type="tel" 
                      placeholder="+1 (888) 234-5678" 
                      className="mt-1"
                      value={formData.phone}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="address">Street Address *</Label>
                    <Input 
                      id="address" 
                      placeholder="House #, Road #, Area" 
                      className="mt-1"
                      value={formData.address}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="city">City *</Label>
                    <Input 
                      id="city" 
                      placeholder="New York" 
                      className="mt-1"
                      value={formData.city}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <Label htmlFor="zip">ZIP Code</Label>
                    <Input 
                      id="zip" 
                      placeholder="1200" 
                      className="mt-1"
                      value={formData.zip}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Shipping Method */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Truck className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Shipping Method</h2>
                </div>
                <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                  <div className="flex items-center space-x-3 p-3.5 border-2 border-border rounded-xl mb-2.5 hover:border-primary transition-all cursor-pointer">
                    <RadioGroupItem value="standard" id="standard" />
                    <Label htmlFor="standard" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Standard Delivery</p>
                          <p className="text-sm text-muted-foreground">5-7 business days</p>
                        </div>
                        <p className="font-semibold text-foreground">{subtotal > 100 ? 'FREE' : '$9.99'}</p>
                      </div>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3.5 border-2 border-border rounded-xl hover:border-primary transition-all cursor-pointer">
                    <RadioGroupItem value="express" id="express" />
                    <Label htmlFor="express" className="flex-1 cursor-pointer">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-foreground">Express Delivery</p>
                          <p className="text-sm text-muted-foreground">2-3 business days</p>
                        </div>
                        <p className="font-semibold text-foreground">$15.00</p>
                      </div>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>

            {/* Payment Method */}
            <Card>
              <CardContent className="p-4 sm:p-6">
                <div className="flex items-center gap-2 mb-4">
                  <CreditCard className="w-5 h-5 text-primary" />
                  <h2 className="text-lg font-semibold text-foreground">Payment Method</h2>
                </div>
                <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod}>
                  <div className="flex items-center space-x-3 p-3.5 border-2 border-border rounded-xl mb-2.5 hover:border-primary transition-all cursor-pointer">
                    <RadioGroupItem value="card" id="card" />
                    <Label htmlFor="card" className="flex-1 cursor-pointer">
                      <p className="font-medium text-foreground">Credit/Debit Card</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, Amex</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3.5 border-2 border-border rounded-xl hover:border-primary transition-all cursor-pointer">
                    <RadioGroupItem value="wallet" id="wallet" />
                    <Label htmlFor="wallet" className="flex-1 cursor-pointer">
                      <p className="font-medium text-foreground">Digital Wallet</p>
                      <p className="text-sm text-muted-foreground">Apple Pay, Google Pay</p>
                    </Label>
                  </div>
                  <div className="flex items-center space-x-3 p-3.5 border-2 border-border rounded-xl hover:border-primary transition-all cursor-pointer">
                    <RadioGroupItem value="ezyify-wallet" id="ezyify-wallet" />
                    <Label htmlFor="ezyify-wallet" className="flex-1 cursor-pointer">
                      <p className="font-medium text-foreground">Ezyify Wallet</p>
                      <p className="text-sm text-muted-foreground">Use your wallet balance</p>
                    </Label>
                  </div>
                </RadioGroup>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-2xl p-4 sm:p-6 sticky top-4">
              <h2 className="text-lg font-semibold text-foreground mb-4">Order Summary</h2>

              {/* Cart Items */}
              <div className="space-y-3 mb-4 max-h-60 overflow-y-auto">
                {cartItems.map(item => item && (
                  <div key={item.id} className="flex gap-3">
                    <img
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="w-16 h-16 object-cover rounded-xl"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground line-clamp-2">{item.name}</p>
                      <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                      <p className="text-sm font-semibold text-primary">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  </div>
                ))}
              </div>

              <Separator className="my-4" />

              {/* Promo Code */}
              <div className="mb-4">
                <Label className="text-sm font-medium text-foreground mb-2 block">Promo Code</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      placeholder="Enter code"
                      className="pl-10"
                      disabled={!!appliedPromo}
                    />
                  </div>
                  <Button
                    onClick={applyPromo}
                    disabled={!!appliedPromo || !promoCode}
                    variant="outline"
                    size="sm"
                  >
                    {appliedPromo ? 'Applied' : 'Apply'}
                  </Button>
                </div>
                {appliedPromo && (
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-success font-medium">{appliedPromo} applied</span>
                    <button
                      onClick={() => {
                        setAppliedPromo(null);
                        setPromoCode('');
                      }}
                      className="text-destructive hover:text-destructive/80 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground mt-1">Try: EZYIFY10 or EZYIFY20</p>
              </div>

              <Separator className="my-4" />

              {/* Price Breakdown */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="text-foreground font-medium">${subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-success">Discount ({appliedPromo === 'EZYIFY20' ? '20%' : '10%'})</span>
                    <span className="text-success font-medium">-${discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="text-foreground font-medium">
                    {shippingCost === 0 ? 'FREE' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
              </div>

              <Separator className="my-4" />

              <div className="flex justify-between text-lg font-bold text-foreground mb-6">
                <span>Total</span>
                <span className="font-bold text-foreground">${total.toFixed(2)}</span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing}
                className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-brand hover:shadow-brand-lg transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{ background: 'var(--brand-gradient)' }}
              >
                {isProcessing ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin">⏳</span>
                    Processing...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    Place Order →
                  </span>
                )}
              </button>

              {/* Security Badge */}
              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Secure checkout powered by Ezyify</span>
              </div>

              {/* Escrow Protection Notice */}
              <EscrowProtectionBanner />
            </div>
          </div>
        </div>

        {/* Payment Failure Modal */}
        <PaymentFailureModal
          isOpen={showPaymentFailure}
          error={paymentError}
          requiredAmount={total}
          currentBalance={walletBalance}
          onRetry={handleRetryPayment}
          onAddFunds={handleAddFunds}
          onCancel={() => setShowPaymentFailure(false)}
          onContactSupport={handleContactSupport}
        />

        {/* Add Funds Modal */}
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
              onSuccess={handleAddFundsSuccess}
              onCancel={() => setShowAddFunds(false)}
            />
          </DialogContent>
        </Dialog>

        {/* Unavailable Items Modal */}
        <UnavailableItemsModal
          isOpen={showUnavailableItems}
          items={unavailableItems}
          onUpdateQuantity={handleUpdateQuantity}
          onRemoveItem={handleRemoveItem}
          onRemoveAll={handleRemoveAllUnavailable}
          onMoveToWishlist={handleMoveToWishlist}
          onContinue={handleContinueCheckout}
          onViewCart={() => navigate('/cart')}
        />
      </div>
    </div>
  );
}