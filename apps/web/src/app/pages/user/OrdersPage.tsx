import React, { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import { Package, Truck, CheckCircle, Clock, AlertCircle, ArrowRight } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyOrders } from '../../components/EmptyStates';
import { EscrowProtectionBanner } from '../../components/EscrowProtectionBanner';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { toast } from 'sonner';
import { fadeUp, staggerContainer, DURATION, EASE_EMPHASIZED } from '../../lib/motion';

interface OrderItem {
  id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
}

interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  total: number;
  status: 'to-pay' | 'to-ship' | 'to-receive' | 'completed' | 'cancelled';
  orderDate: string;
  seller: string;
  sellerId: string;
  estimatedDelivery?: string;
  trackingNumber?: string;
}

const statusConfig = {
  'to-pay': { icon: Clock, label: 'To Pay', color: 'bg-warning-subtle text-warning' },
  'to-ship': { icon: Package, label: 'To Ship', color: 'bg-info-subtle text-info' },
  'to-receive': { icon: Truck, label: 'To Receive', color: 'bg-info-subtle text-info' },
  'completed': { icon: CheckCircle, label: 'Completed', color: 'bg-success-subtle text-success' },
  'cancelled': { icon: AlertCircle, label: 'Cancelled', color: 'bg-error-subtle text-error' }
};

function OrdersSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-4xl px-4 py-6 pb-28 space-y-6">
        <Skeleton className="h-10 w-40" />
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[1, 2, 3, 4, 5].map(i => (
            <Skeleton key={i} className="h-9 w-20 rounded-full flex-shrink-0" />
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i} className="p-4">
              <div className="space-y-4">
                <Skeleton className="h-6 w-32" />
                <div className="flex gap-4">
                  <Skeleton className="size-20 rounded-card flex-shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-2/3" />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-10 flex-1" />
                  <Skeleton className="h-10 flex-1" />
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const reduce = useReducedMotion();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<'all' | 'to-pay' | 'to-ship' | 'to-receive' | 'completed' | 'cancelled'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    const loadOrdersData = () => {
      const mockOrders: Order[] = [
        {
          id: '1',
          orderNumber: 'EZY12345678',
          items: [
            {
              id: '1',
              name: 'Premium Wireless Headphones',
              image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200',
              price: 45.00,
              quantity: 1
            }
          ],
          total: 54.99,
          status: 'to-receive',
          orderDate: 'Jan 2, 2024',
          seller: 'TechHub Store',
          sellerId: 'seller-1',
          estimatedDelivery: 'Jan 6, 2024',
          trackingNumber: 'TRK987654321'
        },
        {
          id: '2',
          orderNumber: 'EZY12345679',
          items: [
            {
              id: '2',
              name: 'Smart Watch Pro',
              image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200',
              price: 120.00,
              quantity: 1
            },
            {
              id: '3',
              name: 'Wireless Earbuds',
              image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200',
              price: 25.00,
              quantity: 1
            }
          ],
          total: 154.99,
          status: 'completed',
          orderDate: 'Dec 24, 2023',
          seller: 'GadgetHub',
          sellerId: 'seller-2'
        },
        {
          id: '3',
          orderNumber: 'EZY12345680',
          items: [
            {
              id: '4',
              name: 'Laptop Stand',
              image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200',
              price: 18.00,
              quantity: 1
            }
          ],
          total: 27.99,
          status: 'to-pay',
          orderDate: 'Jan 4, 2024',
          seller: 'OfficeEssentials',
          sellerId: 'seller-3'
        }
      ];

      setOrders(mockOrders);
      setIsLoading(false);
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadOrdersData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadOrdersData, 16);
      return () => clearTimeout(timer);
    }
  }, []);

  const statusCounts = {
    all: orders.length,
    'to-pay': orders.filter(o => o.status === 'to-pay').length,
    'to-ship': orders.filter(o => o.status === 'to-ship').length,
    'to-receive': orders.filter(o => o.status === 'to-receive').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
  };

  const filteredOrders = activeFilter === 'all'
    ? orders
    : orders.filter(o => o.status === activeFilter);

  if (isLoading) {
    return <OrdersSkeleton />;
  }

  const filterTabs = [
    { id: 'all', label: 'All' },
    { id: 'to-pay', label: 'To pay' },
    { id: 'to-ship', label: 'To ship' },
    { id: 'to-receive', label: 'To receive' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
  ] as const;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Orders - Ezyify" description="Track and manage your orders" />

      <div className="mx-auto max-w-4xl lg:grid lg:grid-cols-[1fr_320px] lg:gap-8 lg:px-6 lg:py-8">
        <motion.div
          variants={staggerContainer(reduce ? 0 : 0.05, 0)}
          initial="hidden"
          animate="visible"
          className="px-4 py-6 pb-28 lg:p-0 space-y-6"
        >
          {/* Header */}
          <motion.div variants={fadeUp} className="space-y-1">
            <h1 className="font-display text-2xl font-semibold text-foreground">My Orders</h1>
            <p className="text-sm text-foreground-secondary">Track and manage your orders</p>
          </motion.div>

          {/* Filter Chips */}
          <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all ${
                  activeFilter === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border text-foreground hover:bg-card-hover'
                }`}
              >
                {tab.label}
                {statusCounts[tab.id as keyof typeof statusCounts] > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center size-5 rounded-full text-xs font-semibold bg-foreground/10">
                    {statusCounts[tab.id as keyof typeof statusCounts]}
                  </span>
                )}
              </button>
            ))}
          </motion.div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <motion.div variants={fadeUp}>
              <EmptyOrders />
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer(reduce ? 0 : 0.04)} className="space-y-4">
              {filteredOrders.map((order) => {
                const config = statusConfig[order.status];
                const StatusIcon = config.icon;

                return (
                  <motion.div key={order.id} variants={fadeUp}>
                    <Card variant="elevated" interactive>
                      <div className="p-4 space-y-4">
                        {/* Order Header */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-display font-semibold text-foreground">
                                {order.orderNumber}
                              </p>
                              <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${config.color}`}>
                                <StatusIcon className="size-3.5" />
                                {config.label}
                              </div>
                            </div>
                            <p className="text-xs text-foreground-secondary">{order.seller} • {order.orderDate}</p>
                          </div>
                          <p className="font-display font-bold text-lg tabular-nums text-foreground flex-shrink-0">
                            ${order.total.toFixed(2)}
                          </p>
                        </div>

                        {/* Items Preview */}
                        <div className="space-y-2">
                          {order.items.slice(0, 2).map((item) => (
                            <div key={item.id} className="flex gap-3">
                              <ImageWithFallback
                                src={item.image}
                                alt={item.name}
                                loading="lazy"
                                className="size-16 rounded-lg object-cover flex-shrink-0 bg-card"
                              />
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                                <p className="text-xs text-foreground-secondary">
                                  Qty: {item.quantity} • ${item.price.toFixed(2)}
                                </p>
                              </div>
                            </div>
                          ))}
                          {order.items.length > 2 && (
                            <p className="text-xs text-foreground-secondary px-1">
                              +{order.items.length - 2} more item{order.items.length - 2 > 1 ? 's' : ''}
                            </p>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="grid grid-cols-2 gap-2 pt-2">
                          {order.status === 'to-receive' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => navigate(`/user/order-tracking/${order.id}`)}
                              >
                                Track Order
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => navigate(`/orders/refund-request?orderId=${order.id}`)}
                              >
                                Request Refund
                              </Button>
                            </>
                          )}
                          {order.status === 'completed' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => toast.info('Review feature coming soon')}
                              >
                                Review
                              </Button>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => toast.info('Buy again feature coming soon')}
                              >
                                Buy Again
                              </Button>
                            </>
                          )}
                          {order.status === 'to-pay' && (
                            <>
                              <Button
                                variant="gradient"
                                size="sm"
                                fullWidth
                                className="col-span-2"
                                onClick={() => navigate(`/user/order-tracking/${order.id}`)}
                              >
                                Complete Payment
                              </Button>
                            </>
                          )}
                          {order.status === 'to-ship' && (
                            <Button
                              variant="outline"
                              size="sm"
                              fullWidth
                              className="col-span-2"
                              onClick={() => navigate(`/user/order-tracking/${order.id}`)}
                            >
                              View Details
                            </Button>
                          )}
                          {order.status === 'cancelled' && (
                            <Button
                              variant="secondary"
                              size="sm"
                              fullWidth
                              className="col-span-2"
                              onClick={() => toast.info('Shop similar items')}
                            >
                              Shop Similar
                            </Button>
                          )}
                        </div>
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </motion.div>
          )}
        </motion.div>

        {/* Desktop: Sticky Escrow Protection Banner */}
        <div className="hidden lg:block">
          <div className="sticky top-24">
            <EscrowProtectionBanner
              amount={filteredOrders.reduce((sum, o) => sum + o.total, 0)}
              variant="cart"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
