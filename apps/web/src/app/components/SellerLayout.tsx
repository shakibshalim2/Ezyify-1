import { ReactNode, memo, useCallback } from 'react';
import { Link, useLocation } from 'react-router';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  TrendingUp,
  Users,
  Settings,
  HelpCircle,
  DollarSign,
  Star,
  Bell,
  Plus,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { Button } from './primitives/Button';
import { Card } from './primitives/Card';
import { BrandMark } from './primitives/BrandMark';
import { cn } from './ui/utils';

const navigation = [
  { name: 'Overview', href: '/seller-dashboard', icon: LayoutDashboard, badge: null },
  { name: 'Products', href: '/seller/products', icon: Package, badge: null },
  { name: 'Orders', href: '/seller/orders', icon: ShoppingCart, badge: 12 },
  { name: 'Analytics', href: '/seller/analytics', icon: TrendingUp, badge: null },
  { name: 'Customers', href: '/seller/customers', icon: Users, badge: null },
  { name: 'Reviews', href: '/seller/reviews', icon: Star, badge: 8 },
  { name: 'Earnings', href: '/seller/earnings', icon: DollarSign, badge: null },
  { name: 'Settings', href: '/seller/settings', icon: Settings, badge: null },
  { name: 'Support', href: '/seller/support', icon: HelpCircle, badge: null }
];

interface SellerLayoutProps {
  children: ReactNode;
}

export const SellerLayout = memo(function SellerLayout({ children }: SellerLayoutProps) {
  const location = useLocation();

  const isActive = useCallback((href: string) => {
    if (href === '/seller-dashboard') return location.pathname === href;
    return location.pathname.startsWith(href);
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-60 lg:flex-col lg:pt-16 lg:border-r lg:border-border lg:overflow-y-auto">
        <div className="flex flex-col flex-1 gap-6 px-4 py-6">
          {/* Brand mark */}
          <Link to="/seller-dashboard" className="flex items-center gap-3">
            <BrandMark size={40} />
            <div className="min-w-0">
              <div className="font-display font-semibold text-sm text-foreground">TechHub Store</div>
              <div className="flex items-center gap-1.5 text-xs text-foreground-secondary"><span className="size-1.5 rounded-full bg-success" /> Store live</div>
            </div>
          </Link>

          {/* Add product button */}
          <Link to="/seller/add-product">
            <Button variant="gradient" size="md" fullWidth leftIcon={<Plus className="size-4" />} className="shadow-brand">
              Add Product
            </Button>
          </Link>

          {/* Navigation */}
          <nav className="flex flex-col gap-1">
            {navigation.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.name} to={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-colors',
                      active
                        ? 'bg-primary-subtle text-primary'
                        : 'text-foreground-secondary hover:bg-background-elevated'
                    )}
                  >
                    <Icon className="size-5 shrink-0" />
                    <span className="flex-1 truncate">{item.name}</span>
                    {item.badge && (
                      <span className={cn('text-xs font-semibold px-2 py-1 rounded-lg', active ? 'bg-primary/20 text-primary' : 'bg-background-elevated text-foreground-secondary')}>
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </nav>

          {/* Revenue teaser */}
          <div className="mt-auto space-y-3">
            <Link to="/seller/analytics">
              <Card variant="elevated" padding="md" interactive className="group">
                <div className="flex items-start justify-between mb-2">
                  <span className="text-xs font-semibold text-foreground-secondary">This Month</span>
                  <ArrowUpRight className="size-4 text-success group-hover:text-success/80 transition-colors" />
                </div>
                <p className="font-display font-bold text-lg text-foreground">$48,200</p>
                <p className="text-xs text-success mt-2">+12.4% vs last month</p>
              </Card>
            </Link>
          </div>
        </div>
      </aside>

      {/* Mobile header */}
      <div className="lg:hidden sticky top-16 z-30 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 h-14">
          <div className="flex min-w-0 items-center gap-2.5">
            <BrandMark size={32} />
            <div className="min-w-0">
              <div className="truncate font-display text-sm font-semibold text-foreground">TechHub Store</div>
              <div className="flex items-center gap-1.5 text-[11px] text-foreground-secondary"><span className="size-1.5 rounded-full bg-success" /> Store live</div>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" aria-label="Notifications">
              <Bell className="size-5" />
            </Button>
            <Button variant="primary" size="icon" asChild aria-label="Add product">
              <Link to="/seller/add-product"><Plus className="size-5" /></Link>
            </Button>
          </div>
        </div>

        {/* Mobile nav tabs */}
        <div className="overflow-x-auto scrollbar-hide border-b border-border">
          <div className="flex gap-1 px-4 py-0 min-w-max">
            {navigation.map(item => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.name} to={item.href}>
                  <div
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap',
                      active
                        ? 'border-primary text-primary'
                        : 'border-transparent text-foreground-secondary'
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{item.name}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main content */}
      <main className="lg:pl-60 pb-28 lg:pb-0 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
          {children}
        </div>
      </main>
    </div>
  );
});
