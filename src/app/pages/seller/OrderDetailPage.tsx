import { motion, useReducedMotion } from 'motion/react';
import { useParams } from 'react-router';
import { Package, Truck, CheckCircle, MessageSquare, Download } from 'lucide-react';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';

export default function OrderDetailPage() {
  const reduce = useReducedMotion();
  const { id } = useParams();

  return (
    <SellerLayout>
      <SEO title="Order Detail — Ezyify Seller" description="View and manage order details." />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="max-w-4xl mx-auto space-y-6"
      >
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Order #ORD-2024-1001</h1>
          <p className="text-sm text-foreground-secondary mt-1">View and manage this order</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Timeline */}
            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-6 text-foreground">Order Timeline</h2>
                <div className="space-y-4">
                  {[
                    { status: 'Order Placed', time: 'Jan 15, 2024', icon: CheckCircle, completed: true },
                    { status: 'Payment Confirmed', time: 'Jan 15, 2024', icon: CheckCircle, completed: true },
                    { status: 'Packing', time: 'Pending', icon: Package, completed: false },
                    { status: 'Shipped', time: 'Pending', icon: Truck, completed: false },
                  ].map((item, i) => {
                    const Icon = item.icon;
                    return (
                      <div key={i} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className={`size-10 rounded-full flex items-center justify-center ${item.completed ? 'bg-success-subtle text-success' : 'bg-background-elevated text-foreground-tertiary'}`}>
                            <Icon className="size-5" />
                          </div>
                          {i < 3 && <div className={`w-0.5 h-12 ${item.completed ? 'bg-success' : 'bg-border'}`} />}
                        </div>
                        <div className="pt-1">
                          <p className="font-semibold text-foreground">{item.status}</p>
                          <p className="text-sm text-foreground-secondary">{item.time}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </Card>
            </motion.div>

            {/* Actions */}
            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Actions</h2>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" fullWidth>Pack Order</Button>
                  <Button variant="outline" fullWidth>Print Label</Button>
                  <Button variant="outline" fullWidth>Update Tracking</Button>
                  <Button variant="outline" fullWidth>Request Return</Button>
                </div>
              </Card>
            </motion.div>

            {/* Products */}
            <motion.div variants={fadeUp}>
              <Card variant="default" padding="lg">
                <h2 className="font-display font-semibold text-lg mb-4 text-foreground">Items</h2>
                <div className="space-y-3">
                  <div className="flex gap-4 p-3 bg-background-elevated rounded-lg">
                    <img src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100" alt="Product" className="size-20 rounded-card object-cover" />
                    <div className="flex-1">
                      <p className="font-semibold text-foreground">Wireless Headphones</p>
                      <p className="text-xs text-foreground-secondary mt-1">Qty: 1 × $99.99</p>
                      <p className="font-semibold text-foreground mt-2">$99.99</p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Customer */}
            <motion.div variants={fadeUp}>
              <Card variant="elevated" padding="lg">
                <h3 className="font-display font-semibold text-lg mb-4 text-foreground">Customer</h3>
                <div className="flex items-center gap-3 mb-4">
                  <Avatar className="size-12">
                    <AvatarImage src="https://i.pravatar.cc/150?img=1" />
                    <AvatarFallback>A</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold text-foreground">Ahmed Hassan</p>
                    <p className="text-xs text-foreground-secondary">ahmed@email.com</p>
                  </div>
                </div>
                <Button fullWidth variant="outline" leftIcon={<MessageSquare className="size-4" />}>
                  Message
                </Button>
              </Card>
            </motion.div>

            {/* Payment */}
            <motion.div variants={fadeUp}>
              <Card variant="elevated" padding="lg">
                <h3 className="font-display font-semibold text-lg mb-4 text-foreground">Payment</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Subtotal</span>
                    <span className="font-medium text-foreground">$99.99</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-foreground-secondary">Shipping</span>
                    <span className="font-medium text-foreground">$10.00</span>
                  </div>
                  <div className="border-t border-border pt-2 mt-2 flex justify-between">
                    <span className="font-semibold text-foreground">Total</span>
                    <span className="font-display font-bold text-lg text-foreground">$109.99</span>
                  </div>
                </div>
                <Button fullWidth variant="outline" size="sm" className="mt-4">View Invoice</Button>
              </Card>
            </motion.div>

            {/* Shipping */}
            <motion.div variants={fadeUp}>
              <Card variant="elevated" padding="lg">
                <h3 className="font-display font-semibold text-lg mb-4 text-foreground">Shipping</h3>
                <div className="space-y-2 text-sm mb-4">
                  <p className="text-foreground">Ahmed Hassan</p>
                  <p className="text-foreground-secondary">123 Main Street</p>
                  <p className="text-foreground-secondary">New York, NY 10001</p>
                </div>
                <Button fullWidth variant="outline" size="sm">Edit Address</Button>
              </Card>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </SellerLayout>
  );
}
