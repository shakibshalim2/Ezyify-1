import { useState, useEffect } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import {
  Package,
  Search,
  Eye,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Download,
  AlertCircle,
  MessageSquare
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Field } from '../../components/primitives/Field';
import { Skeleton } from '../../components/primitives/Skeleton';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

interface Order {
  id: string;
  orderNumber: string;
  customer: {
    name: string;
    email: string;
    avatar: string;
  };
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  paymentStatus: 'paid' | 'pending' | 'failed';
  createdAt: string;
}

const mockOrders: Order[] = [
  {
    id: '1',
    orderNumber: 'ORD-2024-1001',
    customer: { name: 'Ahmed Hassan', email: 'ahmed@email.com', avatar: 'https://i.pravatar.cc/150?img=1' },
    total: 157.50,
    status: 'pending',
    paymentStatus: 'paid',
    createdAt: '2024-01-15'
  },
  {
    id: '2',
    orderNumber: 'ORD-2024-1002',
    customer: { name: 'Sarah Ahmed', email: 'sarah@email.com', avatar: 'https://i.pravatar.cc/150?img=2' },
    total: 32.00,
    status: 'processing',
    paymentStatus: 'paid',
    createdAt: '2024-01-14'
  },
  {
    id: '3',
    orderNumber: 'ORD-2024-1003',
    customer: { name: 'Mike Johnson', email: 'mike@email.com', avatar: 'https://i.pravatar.cc/150?img=3' },
    total: 89.00,
    status: 'shipped',
    paymentStatus: 'paid',
    createdAt: '2024-01-13'
  },
  {
    id: '4',
    orderNumber: 'ORD-2024-1004',
    customer: { name: 'Emma Williams', email: 'emma@email.com', avatar: 'https://i.pravatar.cc/150?img=4' },
    total: 90.00,
    status: 'delivered',
    paymentStatus: 'paid',
    createdAt: '2024-01-12'
  },
  {
    id: '5',
    orderNumber: 'ORD-2024-1005',
    customer: { name: 'John Smith', email: 'john@email.com', avatar: 'https://i.pravatar.cc/150?img=5' },
    total: 125.00,
    status: 'processing',
    paymentStatus: 'paid',
    createdAt: '2024-01-11'
  }
];

function OrderListSkeleton() {
  return (
    <div className="space-y-3">
      {[1, 2, 3].map(i => (
        <Skeleton key={i} className="h-20 w-full" />
      ))}
    </div>
  );
}

export default function OrderManagement() {
  const reduce = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const stats = {
    total: mockOrders.length,
    pending: mockOrders.filter(o => o.status === 'pending').length,
    processing: mockOrders.filter(o => o.status === 'processing').length,
    shipped: mockOrders.filter(o => o.status === 'shipped').length,
    delivered: mockOrders.filter(o => o.status === 'delivered').length,
  };

  const filteredOrders = mockOrders.filter(order => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = selectedTab === 'all' || order.status === selectedTab;
    return matchesSearch && matchesTab;
  });

  const getStatusConfig = (status: Order['status']) => {
    const configs: Record<string, { icon: any; bg: string; text: string }> = {
      pending: { icon: Clock, bg: 'bg-warning-subtle', text: 'text-warning' },
      processing: { icon: Package, bg: 'bg-info-subtle', text: 'text-info' },
      shipped: { icon: Truck, bg: 'bg-primary-subtle', text: 'text-primary' },
      delivered: { icon: CheckCircle, bg: 'bg-success-subtle', text: 'text-success' },
      cancelled: { icon: XCircle, bg: 'bg-error-subtle', text: 'text-error' },
    };
    return configs[status] || configs.pending;
  };

  if (isLoading) {
    return (
      <SellerLayout>
        <div className="space-y-6">
          <Skeleton className="h-10 w-64" />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
          </div>
          <OrderListSkeleton />
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.orders} />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Orders</h1>
            <p className="text-sm text-foreground-secondary mt-1">{stats.total} orders total</p>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Clock className="size-5 text-warning" />
              <div>
                <p className="text-xs font-medium text-foreground-secondary">Pending</p>
                <p className="font-display font-bold text-2xl text-foreground">{stats.pending}</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Package className="size-5 text-info" />
              <div>
                <p className="text-xs font-medium text-foreground-secondary">Processing</p>
                <p className="font-display font-bold text-2xl text-foreground">{stats.processing}</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <Truck className="size-5 text-primary" />
              <div>
                <p className="text-xs font-medium text-foreground-secondary">Shipped</p>
                <p className="font-display font-bold text-2xl text-foreground">{stats.shipped}</p>
              </div>
            </div>
          </Card>

          <Card variant="default" padding="md">
            <div className="flex items-center gap-3">
              <CheckCircle className="size-5 text-success" />
              <div>
                <p className="text-xs font-medium text-foreground-secondary">Delivered</p>
                <p className="font-display font-bold text-2xl text-foreground">{stats.delivered}</p>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Search */}
        <motion.div variants={fadeUp}>
          <Field
            label="Search orders"
            type="text"
            placeholder="Search by order number or customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            leftIcon={<Search className="size-5" />}
          />
        </motion.div>

        {/* Orders Tabs */}
        <motion.div variants={fadeUp}>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="w-full grid grid-cols-5">
              <TabsTrigger value="all">All ({stats.total})</TabsTrigger>
              <TabsTrigger value="pending">Pending ({stats.pending})</TabsTrigger>
              <TabsTrigger value="processing">Processing ({stats.processing})</TabsTrigger>
              <TabsTrigger value="shipped">Shipped ({stats.shipped})</TabsTrigger>
              <TabsTrigger value="delivered">Delivered ({stats.delivered})</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab} className="mt-6">
              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="size-12 text-foreground-tertiary mx-auto mb-4" />
                  <p className="text-foreground-secondary">No orders found</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredOrders.map(order => {
                    const statusConfig = getStatusConfig(order.status);
                    const StatusIcon = statusConfig.icon;

                    return (
                      <Link key={order.id} to={`/seller/orders/${order.id}`}>
                        <Card variant="default" padding="md" interactive>
                          <div className="flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                            {/* Order info */}
                            <div className="flex items-center gap-4 flex-1 min-w-0 w-full sm:w-auto">
                              <Avatar className="size-12 flex-shrink-0">
                                <AvatarImage src={order.customer.avatar} alt={order.customer.name} />
                                <AvatarFallback>{order.customer.name.charAt(0)}</AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <p className="font-semibold text-foreground truncate">{order.orderNumber}</p>
                                <p className="text-xs text-foreground-secondary mt-0.5">{order.customer.name}</p>
                                <p className="text-xs text-foreground-secondary">{order.createdAt}</p>
                              </div>
                            </div>

                            {/* Status and amount */}
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2">
                                <div className={cn('size-8 rounded-lg flex items-center justify-center', statusConfig.bg)}>
                                  <StatusIcon className={cn('size-4', statusConfig.text)} />
                                </div>
                                <div>
                                  <p className="text-xs text-foreground-secondary">Status</p>
                                  <p className={cn('font-semibold text-sm', statusConfig.text)}>
                                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right">
                                <p className="text-xs text-foreground-secondary">Amount</p>
                                <p className="font-display font-bold text-lg text-foreground tabular-nums">
                                  ${order.total.toFixed(2)}
                                </p>
                              </div>
                            </div>

                            {/* Action */}
                            <Eye className="size-5 text-foreground-tertiary flex-shrink-0 ml-auto sm:ml-0" />
                          </div>
                        </Card>
                      </Link>
                    );
                  })}
                </div>
              )}
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
