import { SEO } from '../components/SEO';
import { Link, useSearchParams } from 'react-router';
import { CheckCircle, Package, Clock, ArrowRight, Home, FileText, Share2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Separator } from '../components/ui/separator';
import { Skeleton } from '../components/ui/skeleton';
import { useState, useEffect } from 'react';

export default function OrderSuccessPage() {
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(true);
  const [orderId, setOrderId] = useState('');

  // Load order data progressively
  useEffect(() => {
    const loadOrderData = () => {
      // Get orderId from URL or generate one
      const id = searchParams.get('orderId') || 'EZY' + Math.random().toString(36).substr(2, 9).toUpperCase();
      setOrderId(id);
      setIsLoading(false);
    };

    // Progressive loading: Use requestIdleCallback for non-critical work
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadOrderData(), { timeout: 100 });
    } else {
      setTimeout(loadOrderData, 0);
    }
  }, [searchParams]);

  return (<div className="min-h-screen bg-background pb-8 px-4">
      <SEO title="Order Confirmed — Ezyify" description="Your order has been placed successfully on Ezyify. Track your delivery and manage your orders." />
      <div className="max-w-2xl mx-auto">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl mb-5 shadow-brand"
            style={{ background: 'var(--brand-gradient)' }}>
            <CheckCircle className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Order Placed!</h1>
          <p className="text-muted-foreground text-sm">
            Thank you for shopping on Ezyify. Your order is confirmed.
          </p>
        </div>

        {/* Order Details Card */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="w-5 h-5" />
              Order Details
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isLoading ? (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order ID</span>
                  <Skeleton className="h-5 w-32" />
                </div>
                <Separator />
                <div className="flex items-start gap-3 p-4 bg-primary/8 border border-primary/20 rounded-2xl">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">Order ID</span>
                  <span className="font-mono">{orderId}</span>
                </div>
                <Separator />
                <div className="flex items-start gap-3 p-4 bg-primary/8 border border-primary/20 rounded-2xl">
                  <Clock className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium text-foreground">Estimated Delivery</p>
                    <p className="text-sm text-muted-foreground">3-5 business days</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* What's Next */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>What's Next?</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {isLoading ? (
              <>
                {Array.from({ length: 3 }).map((_, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </>
            ) : (
              <>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium">1</span>
                  </div>
                  <div>
                    <p className="font-medium">Order Confirmation</p>
                    <p className="text-sm text-muted-foreground">We've sent a confirmation email with your order details</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium">2</span>
                  </div>
                  <div>
                    <p className="font-medium">Processing</p>
                    <p className="text-sm text-muted-foreground">Your seller is preparing your order for shipment</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-medium">3</span>
                  </div>
                  <div>
                    <p className="font-medium">Delivery</p>
                    <p className="text-sm text-muted-foreground">Track your order in real-time from your orders page</p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="space-y-3">
          <Link to="/orders" className="block">
            <Button className="w-full" size="lg">
              <FileText className="w-5 h-5 mr-2" />
              View Order Details
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
          
          <Link to="/" className="block">
            <Button variant="outline" className="w-full" size="lg">
              <Home className="w-5 h-5 mr-2" />
              Continue Shopping
            </Button>
          </Link>
        </div>

        {/* Social Sharing Suggestion */}
        <div className="mt-8 p-5 bg-primary/5 border border-primary/15 rounded-2xl text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-primary" />
            <p className="text-sm font-medium text-foreground">Love what you bought? Share it!</p>
          </div>
          <p className="text-xs text-muted-foreground">
            Tag products in your posts and earn affiliate commission on every sale
          </p>
          <Link
            to="/upload"
            className="inline-flex items-center gap-2 mt-3 px-4 py-2 rounded-full text-xs font-semibold text-white transition-all hover:scale-[1.02]"
            style={{ background: 'var(--brand-gradient)' }}
          >
            <Share2 className="w-3.5 h-3.5" />
            Share Your Purchase
          </Link>
        </div>
      </div>
    </div>
  );
}