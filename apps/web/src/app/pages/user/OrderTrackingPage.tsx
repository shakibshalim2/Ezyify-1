import React, { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { useParams, useNavigate, Link } from 'react-router';
import { ArrowLeft, Truck, MapPin, Package, CheckCircle, MessageCircle, Shield, Clock, Copy, AlertCircle } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EscrowProtectionBanner } from '../../components/EscrowProtectionBanner';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { fadeUp, staggerContainer, DURATION, EASE_EMPHASIZED } from '../../lib/motion';

interface TrackingEvent {
  title: string;
  location: string;
  timestamp: string;
  icon: React.ReactNode;
  active: boolean;
}

const mockOrderDetails = {
  id: 'EZY123456789',
  orderNumber: 'EZY123456789',
  status: 'shipped' as const,
  estimatedDelivery: 'Jan 5, 2026',
  carrier: 'FedEx',
  trackingNumber: '1234567890123',
  items: [
    {
      id: '1',
      name: 'Wireless Bluetooth Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
      quantity: 1,
      price: 79.99
    },
    {
      id: '2',
      name: 'Phone Case - Clear',
      image: 'https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200',
      quantity: 2,
      price: 15.99
    }
  ],
  total: 111.97,
  seller: {
    name: 'TechStore Official',
    username: 'techstore',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'
  }
};

const mockTrackingEvents: TrackingEvent[] = [
  {
    title: 'Out for Delivery',
    location: 'San Francisco, CA',
    timestamp: 'Jan 5, 2026, 8:30 AM',
    icon: <Truck className="size-5" />,
    active: true
  },
  {
    title: 'In Transit',
    location: 'Oakland Distribution Center, CA',
    timestamp: 'Jan 4, 2026, 11:45 PM',
    icon: <MapPin className="size-5" />,
    active: false
  },
  {
    title: 'Departed Facility',
    location: 'Los Angeles, CA',
    timestamp: 'Jan 4, 2026, 3:20 PM',
    icon: <MapPin className="size-5" />,
    active: false
  },
  {
    title: 'Shipped',
    location: 'Distribution Center',
    timestamp: 'Jan 3, 2026, 2:00 PM',
    icon: <Package className="size-5" />,
    active: false
  },
  {
    title: 'Order Confirmed',
    location: 'Ezyify',
    timestamp: 'Jan 3, 2026, 10:30 AM',
    icon: <CheckCircle className="size-5" />,
    active: false
  }
];

function OrderTrackingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 pb-28 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-40 w-full rounded-card" />
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <Skeleton className="h-20 w-full" />
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrderTrackingPage() {
  const reduce = useReducedMotion();
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [deliveryConfirmed, setDeliveryConfirmed] = useState(false);

  if (!orderId) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="max-w-md w-full">
          <div className="p-6 text-center space-y-4">
            <AlertCircle className="size-12 text-error mx-auto" />
            <h2 className="font-display text-lg font-semibold text-foreground">Order not found</h2>
            <p className="text-sm text-foreground-secondary">We couldn't find this order. Please check the ID and try again.</p>
            <Button asChild variant="primary">
              <Link to="/user/orders">Back to Orders</Link>
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  const orderDetails = {
    ...mockOrderDetails,
    id: orderId,
    orderNumber: orderId
  };

  const totalPrice = orderDetails.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`Order ${orderDetails.orderNumber} - Tracking`} description="Track your Ezyify order in real-time." />

      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05, 0)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-2xl px-4 py-6 pb-28 space-y-6"
      >
        {/* Sticky Header with Back Button */}
        <motion.div variants={fadeUp} className="flex items-center gap-3 -mx-4 px-4 py-3 sticky top-0 bg-background z-10">
          <Button
            variant="ghost"
            size="icon"
            aria-label="Back"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="size-5" />
          </Button>
          <div className="flex-1 min-w-0">
            <h1 className="font-display text-xl font-semibold text-foreground truncate">Order {orderDetails.orderNumber}</h1>
            <p className="text-xs text-foreground-secondary">Est. delivery: {orderDetails.estimatedDelivery}</p>
          </div>
        </motion.div>

        {/* Escrow Protection Banner */}
        <motion.div variants={fadeUp}>
          <EscrowProtectionBanner
            amount={totalPrice}
            variant="tracking"
            daysRemaining={7}
          />
        </motion.div>

        {/* Status Hero Card */}
        <motion.div variants={fadeUp}>
          <Card className="bg-brand-gradient text-white overflow-hidden">
            <div className="p-6 space-y-4">
              <div className="flex items-start gap-4">
                <div className="size-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Truck className="size-6" />
                </div>
                <div className="flex-1">
                  <p className="text-white/80 text-sm mb-1">Your package is on the way!</p>
                  <p className="text-lg font-semibold">Estimated delivery: {orderDetails.estimatedDelivery}</p>
                  <p className="text-white/70 text-xs mt-2">
                    {orderDetails.carrier} • {orderDetails.trackingNumber}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-white rounded-full" />
                </div>
                <p className="text-xs text-white/70">75% of the way there</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Timeline */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="p-4 space-y-6">
              <h3 className="font-display font-semibold text-foreground">Tracking History</h3>

              <div className="space-y-0">
                {mockTrackingEvents.map((event, index) => (
                  <div key={index} className="flex gap-4 pb-6 last:pb-0">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div
                        className={`size-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          event.active
                            ? 'bg-success-subtle text-success'
                            : 'bg-card border-2 border-border text-foreground-secondary'
                        }`}
                      >
                        {event.icon}
                      </div>
                      {index < mockTrackingEvents.length - 1 && (
                        <div className={`w-0.5 flex-1 my-2 ${
                          event.active ? 'bg-success/40' : 'bg-border'
                        }`} style={{ minHeight: '32px' }} />
                      )}
                    </div>

                    <div className="flex-1 pb-6 last:pb-0">
                      <h4 className={`font-semibold ${
                        event.active ? 'text-success' : 'text-foreground'
                      }`}>
                        {event.title}
                      </h4>
                      <p className="text-sm text-foreground-secondary">{event.location}</p>
                      <p className="text-xs text-foreground-tertiary mt-1">{event.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Shipping Details */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="p-4 space-y-3">
              <h3 className="font-display font-semibold text-foreground">Shipping Details</h3>

              <div className="space-y-3 bg-card rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-secondary">Carrier</span>
                  <span className="font-medium text-foreground">{orderDetails.carrier}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-foreground-secondary">Tracking Number</span>
                  <div className="flex items-center gap-2">
                    <code className="text-sm font-mono text-foreground">{orderDetails.trackingNumber}</code>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(orderDetails.trackingNumber);
                        toast.success('Copied to clipboard');
                      }}
                      aria-label="Copy tracking number"
                      className="p-1 hover:bg-card-hover rounded transition-colors"
                    >
                      <Copy className="size-4 text-primary" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Items Card */}
        <motion.div variants={fadeUp}>
          <Card>
            <div className="p-4 space-y-4">
              <h3 className="font-display font-semibold text-foreground">Order Items</h3>

              <div className="space-y-3">
                {orderDetails.items.map((item) => (
                  <div key={item.id} className="flex gap-3 pb-3 last:pb-0 border-b border-border last:border-0">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      loading="lazy"
                      className="size-16 rounded-lg object-cover bg-card flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                      <p className="text-xs text-foreground-secondary">Qty: {item.quantity}</p>
                      <p className="text-sm font-display font-semibold text-foreground mt-1">
                        ${(item.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-3">
                <div className="flex items-center justify-between">
                  <span className="font-display font-semibold text-foreground">Total</span>
                  <span className="font-display text-lg font-bold text-accent-brand tabular-nums">
                    ${totalPrice.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Actions */}
        <motion.div variants={fadeUp} className="space-y-3">
          <Button
            variant="secondary"
            fullWidth
            leftIcon={<MessageCircle className="size-4" />}
            onClick={() => toast.info('Contact seller feature coming soon')}
          >
            Contact Seller
          </Button>

          {!deliveryConfirmed && (
            <Button
              variant="gradient"
              fullWidth
              className="shadow-brand"
              onClick={() => {
                setDeliveryConfirmed(true);
                toast.success('Delivery confirmed! Payment released to seller.');
              }}
            >
              Confirm Delivery
            </Button>
          )}

          {deliveryConfirmed && (
            <Card variant="ghost" className="bg-success/5 border border-success/20 p-4 text-center">
              <div className="flex items-center justify-center gap-2 text-success">
                <CheckCircle className="size-5" />
                <p className="font-medium">Delivery confirmed</p>
              </div>
            </Card>
          )}

          <Button
            variant="outline"
            fullWidth
            onClick={() => navigate('/orders/refund-request')}
          >
            Report Issue
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
