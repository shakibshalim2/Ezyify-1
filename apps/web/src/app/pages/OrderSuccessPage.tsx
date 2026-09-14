import { motion, useReducedMotion } from 'motion/react';
import { useSearchParams, Link } from 'react-router';
import { formatMoney, type Money } from '@ezyify/core';
import { CheckCircle, Home, ArrowRight, Share2 } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { Skeleton } from '../components/primitives/Skeleton';
import { fadeUp, staggerContainer, DURATION } from '../lib/motion';

function OrderSuccessSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <div className="max-w-md w-full space-y-6">
        <div className="text-center space-y-4">
          <Skeleton className="size-20 rounded-full mx-auto" />
          <Skeleton className="h-8 w-40 mx-auto" />
          <Skeleton className="h-6 w-64 mx-auto" />
        </div>

        <Card>
          <div className="p-6 space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-5 w-full" />
            ))}
          </div>
        </Card>

        <div className="space-y-3">
          <Skeleton className="h-11 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  const reduce = useReducedMotion();
  const [searchParams] = useSearchParams();
  const orderNumbers = (searchParams.get('orders') ?? searchParams.get('orderId') ?? '').split(',').filter(Boolean);
  const totalAmount = Number(searchParams.get('total'));
  const total: Money | null = Number.isFinite(totalAmount) && totalAmount > 0 ? { amount: totalAmount, currency: (searchParams.get('currency') as Money['currency']) || 'USD' } : null;
  const pendingPayment = searchParams.get('status') === 'pending_payment';

  if (orderNumbers.length === 0) return <OrderSuccessSkeleton />;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: reduce ? 0 : 0.08,
        delayChildren: 0.1,
      },
    },
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-6">
      <SEO title="Order Confirmed — Ezyify" description="Your order has been placed successfully. Track your delivery and manage your orders." />

      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-md w-full space-y-6"
      >
        {/* Success Icon with Animation */}
        <motion.div
          variants={fadeUp}
          className="text-center"
        >
          <div className="inline-flex items-center justify-center size-20 rounded-full mb-5 bg-brand-gradient shadow-brand">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', delay: 0.2, stiffness: 100, damping: 10 }}
            >
              <CheckCircle className="size-10 text-white" />
            </motion.div>
          </div>

          <motion.div variants={fadeUp} className="space-y-2">
            <h1 className="font-display text-2xl font-semibold text-foreground">Order Placed!</h1>
            <p className="text-sm text-foreground-secondary">
              Thank you for shopping on Ezyify. Your order is confirmed.
            </p>
          </motion.div>
        </motion.div>

        {/* Order Summary Card */}
        <motion.div variants={fadeUp}>
          <Card variant="elevated">
            <div className="p-6 space-y-4">
              <h3 className="font-display font-semibold text-foreground">Order Details</h3>

              <div className="space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-sm text-foreground-secondary">{orderNumbers.length > 1 ? 'Orders' : 'Order'}</span>
                  <code className="font-mono text-sm font-semibold text-foreground text-right">{orderNumbers.join(', ')}</code>
                </div>
                {total && (
                  <div className="flex items-center justify-between pb-3 border-b border-border">
                    <span className="text-sm text-foreground-secondary">{pendingPayment ? 'Amount due' : 'Held in escrow'}</span>
                    <span className="font-display text-sm font-bold text-foreground">{formatMoney(total)}</span>
                  </div>
                )}

                <div className="flex items-start gap-3 p-3 bg-accent-brand-subtle rounded-lg">
                  <div className="size-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="size-5 text-accent-brand" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-accent-brand">Estimated Delivery</p>
                    <p className="text-xs text-accent-brand/70">3-5 business days</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-info-subtle rounded-lg">
                  <div className="size-8 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="size-5 text-info" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-info">100% Buyer Protection</p>
                    <p className="text-xs text-info/70">{pendingPayment ? 'Complete the payment to move your order into escrow' : 'Your payment is held in escrow until you confirm delivery'}</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* What's Next */}
        <motion.div variants={fadeUp}>
          <Card variant="elevated">
            <div className="p-6 space-y-4">
              <h3 className="font-display font-semibold text-foreground">What's Next?</h3>

              <div className="space-y-3">
                {[
                  {
                    num: 1,
                    title: pendingPayment ? 'Complete payment' : 'Order confirmed',
                    desc: pendingPayment ? 'Finish the transfer from your orders page — the seller ships once it lands' : 'The seller has been notified and your receipt is in your inbox'
                  },
                  {
                    num: 2,
                    title: 'Processing',
                    desc: 'Your seller is preparing your order for shipment'
                  },
                  {
                    num: 3,
                    title: 'Delivery',
                    desc: 'Track your order in real-time from your orders page'
                  }
                ].map((step) => (
                  <div key={step.num} className="flex items-start gap-3">
                    <div className="size-8 bg-primary-subtle rounded-full flex items-center justify-center flex-shrink-0 text-sm font-semibold text-primary">
                      {step.num}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-foreground">{step.title}</p>
                      <p className="text-xs text-foreground-secondary">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={fadeUp} className="space-y-3">
          <Button
            asChild
            variant="gradient"
            fullWidth
            size="lg"
            className="shadow-brand"
            rightIcon={<ArrowRight className="size-4" />}
          >
            <Link to="/orders">View my orders</Link>
          </Button>

          <Button
            asChild
            variant="outline"
            fullWidth
            size="lg"
            leftIcon={<Home className="size-4" />}
          >
            <Link to="/">Continue Shopping</Link>
          </Button>
        </motion.div>

        {/* Social Sharing Suggestion */}
        <motion.div variants={fadeUp}>
          <Card variant="ghost" className="bg-primary-subtle border border-primary/20">
            <div className="p-4 text-center space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Share2 className="size-4 text-primary" />
                <p className="text-sm font-medium text-primary">Love what you bought?</p>
              </div>
              <p className="text-xs text-foreground-secondary">
                Share it in a Loop and earn affiliate commission on every sale
              </p>
              <Button
                asChild
                variant="secondary"
                size="sm"
                fullWidth
              >
                <Link to="/upload">Share Your Purchase</Link>
              </Button>
            </div>
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}
