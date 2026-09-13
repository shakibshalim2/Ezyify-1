import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Package, DollarSign, TrendingUp, ShoppingBag, Heart, Wallet, ArrowUpRight, Star, Bell, Settings } from 'lucide-react';
import { Link } from 'react-router';
import { Skeleton } from '../../components/ui/skeleton';

function UserDashboardSkeleton() {
  return (
    <div className="max-w-screen-xl mx-auto px-4 pb-6 space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <Skeleton className="w-10 h-10 rounded-full" />
        <div className="space-y-1.5"><Skeleton className="h-6 w-48" /><Skeleton className="h-4 w-32" /></div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => <Skeleton key={i} className="h-28 rounded-2xl" />)}
      </div>
      <Skeleton className="h-12 w-full rounded-2xl" />
      <div className="space-y-3">
        {[1,2,3,4,5].map(i => <Skeleton key={i} className="h-20 rounded-xl" />)}
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => setIsLoading(false), { timeout: 150 });
      return () => cancelIdleCallback(handle);
    }
    const t = setTimeout(() => setIsLoading(false), 50);
    return () => clearTimeout(t);
  }, []);

  if (isLoading) return <UserDashboardSkeleton />;

  const stats = [
    { label: 'Total Orders', value: '24', icon: Package, accent: 'bg-primary/10 text-primary', trend: '+3 this month' },
    { label: 'Total Spent', value: '$1,234', icon: DollarSign, accent: 'bg-success/10 text-success', trend: '+$89 this month' },
    { label: 'Rewards Earned', value: '$45', icon: TrendingUp, accent: 'bg-warning/10 text-warning', trend: '450 points' },
    { label: 'Wishlist Items', value: '12', icon: ShoppingBag, accent: 'bg-like/10 text-like', trend: '3 on sale now' },
  ];

  const quickActions = [
    {
      to: '/orders',
      icon: Package,
      iconBg: 'bg-primary/10 text-primary',
      label: 'My Orders',
      desc: 'Track and manage your orders',
    },
    {
      to: '/wishlist',
      icon: Heart,
      iconBg: 'bg-like/10 text-like',
      label: 'Wishlist',
      desc: 'View your saved items',
    },
    {
      to: '/wallet',
      icon: Wallet,
      iconBg: 'bg-success/10 text-success',
      label: 'Wallet',
      desc: 'Manage balance and rewards',
    },
    {
      to: '/notifications',
      icon: Bell,
      iconBg: 'bg-info/10 text-info',
      label: 'Notifications',
      desc: 'Stay up to date',
    },
    {
      to: '/profile/me',
      icon: Star,
      iconBg: 'bg-warning/10 text-warning',
      label: 'My Profile',
      desc: 'Manage your public profile',
    },
    {
      to: '/settings',
      icon: Settings,
      iconBg: 'bg-muted text-muted-foreground',
      label: 'Settings',
      desc: 'Account preferences',
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <SEO title="My Dashboard — Ezyify" description="View your Ezyify dashboard — orders, earnings, rewards, and activity." />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 sm:pb-8">

        {/* Header */}
        <div className="mb-7">
          <h1 className="font-semibold text-foreground">My Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Welcome back — here's what's happening</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 sm:p-5 hover:shadow-md hover:border-border-strong transition-all duration-200">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center mb-3 ${stat.accent}`}>
                  <Icon className="w-4 h-4" />
                </div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">{stat.label}</p>
                <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{stat.trend}</p>
              </div>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="mb-5">
          <h2 className="font-semibold text-foreground mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {quickActions.map(({ to, icon: Icon, iconBg, label, desc }) => (
              <Link
                key={to}
                to={to}
                className="group flex items-center gap-4 p-4 bg-card border border-border rounded-2xl hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
                  <Icon className="w-4.5 h-4.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-foreground">{label}</p>
                  <p className="text-xs text-muted-foreground truncate">{desc}</p>
                </div>
                <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Activity Placeholder */}
        <div className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-foreground text-sm">Recent Orders</h2>
            <Link to="/orders" className="text-xs font-semibold text-primary hover:underline">
              View all
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { id: 'EZY12345', product: 'Premium Wireless Headphones', status: 'Delivered', amount: '$45.00', date: '2 days ago', statusColor: 'text-success' },
              { id: 'EZY12344', product: 'Smart Watch Pro', status: 'In Transit', amount: '$120.00', date: '5 days ago', statusColor: 'text-info' },
              { id: 'EZY12343', product: 'Laptop Stand', status: 'Processing', amount: '$18.00', date: '1 week ago', statusColor: 'text-warning' },
            ].map((order) => (
              <Link
                key={order.id}
                to={`/order/${order.id}`}
                className="flex items-center justify-between py-2.5 border-b border-border last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded-xl transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{order.product}</p>
                  <p className="text-xs text-muted-foreground">{order.id} · {order.date}</p>
                </div>
                <div className="text-right shrink-0 ml-4">
                  <p className="text-sm font-bold text-foreground">{order.amount}</p>
                  <p className={`text-xs font-semibold ${order.statusColor}`}>{order.status}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
