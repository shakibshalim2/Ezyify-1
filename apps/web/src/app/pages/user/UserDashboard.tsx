import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowUpRight,
  Bell,
  Heart,
  Package,
  Settings,
  ShoppingBag,
  Star,
  Wallet,
} from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Skeleton } from '../../components/primitives/Skeleton';
import { fadeUp, staggerContainer } from '../../lib/motion';
const stats = [
  {
    label: 'Orders',
    value: '24',
    detail: '+3 this month',
    icon: Package,
    tone: 'text-primary bg-primary-subtle',
  },
  {
    label: 'Total spent',
    value: '$1,234',
    detail: '+$89 this month',
    icon: Wallet,
    tone: 'text-success bg-success-subtle',
  },
  {
    label: 'Rewards',
    value: '$45',
    detail: '450 points',
    icon: Star,
    tone: 'text-warning bg-warning-subtle',
  },
  {
    label: 'Wishlist',
    value: '12',
    detail: '3 on sale',
    icon: Heart,
    tone: 'text-error bg-error-subtle',
  },
];
const links = [
  { to: '/orders', label: 'My orders', desc: 'Track and manage purchases', icon: Package },
  { to: '/wishlist', label: 'Wishlist', desc: 'Your saved products', icon: Heart },
  { to: '/wallet', label: 'Wallet', desc: 'Balance and rewards', icon: Wallet },
  { to: '/notifications', label: 'Notifications', desc: 'Your latest updates', icon: Bell },
  { to: '/profile/me', label: 'My profile', desc: 'Creator space and posts', icon: ShoppingBag },
  { to: '/settings', label: 'Settings', desc: 'Account preferences', icon: Settings },
];
function DashboardSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-5 px-4 py-6">
      <Skeleton className="h-14 w-64" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-36 rounded-card" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-card" />
    </div>
  );
}
export default function UserDashboard() {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [orders] = useState([
    {
      id: 'EZY12345',
      product: 'Premium Wireless Headphones',
      state: 'Delivered',
      amount: '$45.00',
      date: '2 days ago',
      tone: 'text-success',
    },
    {
      id: 'EZY12344',
      product: 'Smart Watch Pro',
      state: 'In transit',
      amount: '$120.00',
      date: '5 days ago',
      tone: 'text-info',
    },
    {
      id: 'EZY12343',
      product: 'Laptop Stand',
      state: 'Processing',
      amount: '$18.00',
      date: '1 week ago',
      tone: 'text-warning',
    },
  ]);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 100);
    return () => clearTimeout(timer);
  }, []);
  if (loading) return <DashboardSkeleton />;
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="My Dashboard — Ezyify"
        description="View orders, wallet, rewards, and recent activity."
      />
      <motion.main
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl space-y-8 px-4 py-6 lg:px-6 lg:py-8"
      >
        <motion.header variants={fadeUp}>
          <p className="text-sm font-medium text-primary">YOUR SPACE</p>
          <h1 className="font-display text-3xl font-semibold">Welcome back, Emma</h1>
          <p className="mt-1 text-foreground-secondary">
            A clear view of your shopping and community.
          </p>
        </motion.header>
        <motion.section variants={fadeUp} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className="space-y-3">
                <span
                  className={`flex size-10 items-center justify-center rounded-xl ${stat.tone}`}
                >
                  <Icon className="size-5" />
                </span>
                <div>
                  <p className="text-sm text-foreground-secondary">{stat.label}</p>
                  <p className="font-display text-2xl font-bold tabular-nums">{stat.value}</p>
                  <p className="text-xs text-foreground-tertiary">{stat.detail}</p>
                </div>
              </Card>
            );
          })}
        </motion.section>
        <motion.section variants={fadeUp}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Quick actions</h2>
            <Link to="/profile/me">
              <Button variant="link">View profile</Button>
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.to} to={link.to}>
                  <Card interactive className="flex items-center gap-3">
                    <span className="flex size-11 items-center justify-center rounded-xl bg-primary-subtle text-primary">
                      <Icon className="size-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-semibold">{link.label}</span>
                      <span className="block truncate text-sm text-foreground-secondary">
                        {link.desc}
                      </span>
                    </span>
                    <ArrowUpRight className="size-5 text-foreground-secondary" />
                  </Card>
                </Link>
              );
            })}
          </div>
        </motion.section>
        <motion.section variants={fadeUp}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-xl font-semibold">Recent orders</h2>
            <Link to="/orders">
              <Button variant="link">View all</Button>
            </Link>
          </div>
          {orders.length ? (
            <Card className="divide-y divide-border p-0">
              {orders.map((order) => (
                <Link
                  key={order.id}
                  to={`/order/${order.id}`}
                  className="flex items-center gap-4 p-4 transition hover:bg-muted"
                >
                  <span className="flex size-11 items-center justify-center rounded-xl bg-accent-brand-subtle text-accent-brand">
                    <Package className="size-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{order.product}</span>
                    <span className="text-sm text-foreground-secondary">
                      {order.id} · {order.date}
                    </span>
                  </span>
                  <span className="text-right">
                    <span className="block font-display font-bold tabular-nums">
                      {order.amount}
                    </span>
                    <span className={`text-xs font-semibold ${order.tone}`}>{order.state}</span>
                  </span>
                </Link>
              ))}
            </Card>
          ) : (
            <EmptyState
              compact
              kind="orders"
              title="No orders yet"
              description="Your next order will appear here."
            />
          )}
        </motion.section>
      </motion.main>
    </div>
  );
}
