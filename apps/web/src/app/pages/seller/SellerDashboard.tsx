import type React from 'react';
import { useState, useEffect } from 'react';
import { useReducedMotion } from 'motion/react';
import { motion } from 'motion/react';
import { Link } from 'react-router';
import {
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  ShoppingCart
} from 'lucide-react';
import { cn } from '../../components/ui/utils';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { fadeUp, staggerContainer, DURATION, EASE_EMPHASIZED } from '../../lib/motion';

function DashboardSkeleton() {
  return (
    <SellerLayout>
      <div className="space-y-6">
        {/* KPI Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i} padding="md">
              <Skeleton className="h-4 w-20 mb-4" />
              <Skeleton className="h-8 w-32 mb-2" />
              <Skeleton className="h-4 w-16" />
            </Card>
          ))}
        </div>

        {/* Chart */}
        <Card padding="lg">
          <Skeleton className="h-64 w-full" />
        </Card>

        {/* Recent Orders */}
        <Card padding="lg">
          <Skeleton className="h-6 w-40 mb-6" />
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </Card>
      </div>
    </SellerLayout>
  );
}

interface KPICardProps {
  title: string;
  value: string;
  delta: number;
  icon: React.ComponentType<{ className?: string }>;
  trend: 'up' | 'down';
}

function KPICard({ title, value, delta, icon: Icon, trend }: KPICardProps) {
  return (
    <Card variant="default" padding="md" className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <span className="text-xs sm:text-sm font-medium text-foreground-secondary">{title}</span>
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary-subtle text-primary">
          <Icon className="size-4" />
        </span>
      </div>
      <div className="font-display font-bold text-xl sm:text-2xl text-foreground tabular-nums">{value}</div>
      <div className="flex flex-wrap items-center gap-1.5">
        {trend === 'up' ? (
          <span className="flex items-center gap-1 text-xs font-medium text-success bg-success-subtle px-2 py-1 rounded-lg">
            <ArrowUpRight className="size-3" />
            +{delta}%
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-error bg-error-subtle px-2 py-1 rounded-lg">
            <ArrowDownRight className="size-3" />
            {delta}%
          </span>
        )}
        <span className="hidden sm:inline text-xs text-foreground-secondary">vs last month</span>
      </div>
    </Card>
  );
}

const chartData = [
  { date: 'Mon', revenue: 2400 },
  { date: 'Tue', revenue: 2210 },
  { date: 'Wed', revenue: 2290 },
  { date: 'Thu', revenue: 2000 },
  { date: 'Fri', revenue: 2181 },
  { date: 'Sat', revenue: 2500 },
  { date: 'Sun', revenue: 2100 }
];

export default function SellerDashboard() {
  const reduce = useReducedMotion();
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (hasError) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center min-h-96">
          <Card variant="featured" padding="lg" className="max-w-md text-center space-y-4">
            <div className="flex justify-center">
              <XCircle className="size-12 text-error" />
            </div>
            <div>
              <h2 className="font-display font-bold text-lg text-foreground">Unable to Load</h2>
              <p className="text-sm text-foreground-secondary mt-1">Check your connection and try again.</p>
            </div>
            <Button onClick={() => window.location.reload()} variant="primary" fullWidth>
              Retry
            </Button>
          </Card>
        </div>
      </SellerLayout>
    );
  }

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.dashboard} />
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Header */}
        <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">Overview</h1>
            <p className="text-sm text-foreground-secondary mt-1">Welcome back — here’s how your store is doing today.</p>
          </div>
        </motion.div>

        {/* KPI Cards */}
        <motion.div variants={fadeUp} className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <KPICard title="Revenue" value="$1,856" delta={18.2} icon={DollarSign} trend="up" />
          <KPICard title="Orders" value="342" delta={12.5} icon={ShoppingCart} trend="up" />
          <KPICard title="Visitors" value="45.6K" delta={15.4} icon={Eye} trend="up" />
          <KPICard title="Conversion" value="3.2%" delta={0.3} icon={TrendingUp} trend="up" />
        </motion.div>

        {/* Alerts */}
        <motion.div variants={fadeUp} className="space-y-2">
          {[
            { type: 'error', message: '12 orders need shipping today', action: 'Ship Now', href: '/seller/orders' },
            { type: 'warning', message: '5 products low in stock', action: 'Restock', href: '/seller/products' }
          ].map((alert, i) => (
            <Card
              key={i}
              variant="elevated"
              padding="md"
              className="flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className={cn('size-5', alert.type === 'error' ? 'text-error' : 'text-warning')} />
                <p className="text-sm font-medium text-foreground">{alert.message}</p>
              </div>
              <Link to={alert.href}>
                <Button variant="outline" size="sm">
                  {alert.action}
                </Button>
              </Link>
            </Card>
          ))}
        </motion.div>

        {/* Revenue Chart */}
        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <h2 className="font-display font-semibold text-lg mb-6 text-foreground">Weekly Revenue</h2>
            <div className="w-full h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
                  <XAxis dataKey="date" stroke="var(--color-foreground-tertiary)" />
                  <YAxis stroke="var(--color-foreground-tertiary)" />
                  <Tooltip contentStyle={{ backgroundColor: 'var(--color-background-elevated)', border: '1px solid var(--color-border)' }} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="var(--color-primary)"
                    fillOpacity={1}
                    fill="url(#colorRevenue)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </motion.div>

        {/* Recent Orders */}
        <motion.div variants={fadeUp}>
          <Card variant="default" padding="lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-lg text-foreground">Recent Orders</h2>
              <Link to="/seller/orders" className="text-sm font-medium text-primary hover:underline">
                View All →
              </Link>
            </div>

            <div className="space-y-3">
              {[
                { id: 'EZY001', customer: 'Sarah Ahmed', product: 'Wireless Headphones', amount: '$45', status: 'pending' },
                { id: 'EZY002', customer: 'Mike Rahman', product: 'Smart Watch Pro', amount: '$120', status: 'processing' },
                { id: 'EZY003', customer: 'Emma Khan', product: 'Wireless Earbuds', amount: '$25', status: 'shipped' }
              ].map(order => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-4 bg-background-elevated rounded-xl hover:bg-background-elevated/80 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-medium text-foreground text-sm">{order.customer}</p>
                    <p className="text-xs text-foreground-secondary mt-0.5">{order.product}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="font-semibold text-foreground tabular-nums">{order.amount}</span>
                    <span
                      className={cn(
                        'text-xs font-semibold px-2 py-1 rounded-lg',
                        order.status === 'pending'
                          ? 'bg-warning-subtle text-warning'
                          : order.status === 'processing'
                            ? 'bg-info-subtle text-info'
                            : 'bg-success-subtle text-success'
                      )}
                    >
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/seller/orders" className="block mt-4">
              <Button variant="secondary" fullWidth>
                View All Orders
              </Button>
            </Link>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={fadeUp} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Link to="/seller/add-product">
            <Card variant="elevated" padding="lg" interactive className="text-center space-y-3">
              <Plus className="size-8 text-primary mx-auto" />
              <div>
                <h3 className="font-display font-semibold text-foreground">Add Product</h3>
                <p className="text-xs text-foreground-secondary mt-1">List a new item</p>
              </div>
            </Card>
          </Link>
          <Link to="/seller/analytics">
            <Card variant="elevated" padding="lg" interactive className="text-center space-y-3">
              <TrendingUp className="size-8 text-primary mx-auto" />
              <div>
                <h3 className="font-display font-semibold text-foreground">Analytics</h3>
                <p className="text-xs text-foreground-secondary mt-1">View insights</p>
              </div>
            </Card>
          </Link>
          <Link to="/seller/settings">
            <Card variant="elevated" padding="lg" interactive className="text-center space-y-3">
              <Package className="size-8 text-primary mx-auto" />
              <div>
                <h3 className="font-display font-semibold text-foreground">Store Settings</h3>
                <p className="text-xs text-foreground-secondary mt-1">Configure</p>
              </div>
            </Card>
          </Link>
        </motion.div>
      </motion.div>
    </SellerLayout>
  );
}
