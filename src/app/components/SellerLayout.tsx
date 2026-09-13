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
  ChevronRight,
  ArrowUpRight,
  Zap
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

const navigation = [
  { 
    name: 'Overview', 
    href: '/seller-dashboard', 
    icon: LayoutDashboard,
    description: 'Business summary',
    badge: null
  },
  { 
    name: 'Products', 
    href: '/seller/products', 
    icon: Package,
    description: 'Manage inventory',
    badge: null
  },
  { 
    name: 'Orders', 
    href: '/seller/orders', 
    icon: ShoppingCart,
    badge: 12,
    description: 'Process orders'
  },
  { 
    name: 'Analytics', 
    href: '/seller/analytics', 
    icon: TrendingUp,
    description: 'Performance insights',
    badge: null
  },
  { 
    name: 'Customers', 
    href: '/seller/customers', 
    icon: Users,
    description: 'Customer relationships',
    badge: null
  },
  { 
    name: 'Reviews', 
    href: '/seller/reviews', 
    icon: Star,
    description: 'Ratings & feedback',
    badge: 8,
    badgeVariant: 'secondary'
  },
  { 
    name: 'Earnings', 
    href: '/seller/earnings', 
    icon: DollarSign,
    description: 'Revenue & payouts',
    badge: null
  },
  { 
    name: 'Settings', 
    href: '/seller/settings', 
    icon: Settings,
    description: 'Store configuration',
    badge: null
  },
  { 
    name: 'Support', 
    href: '/seller/support', 
    icon: HelpCircle,
    description: 'Help & resources',
    badge: null
  }
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

  const activeRoute = navigation.find(item => isActive(item.href));

  return (
    <div className="min-h-screen bg-background">

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:left-0 lg:flex lg:w-60 xl:w-64 lg:flex-col lg:pt-16 lg:border-r lg:border-border" style={{ background: 'var(--sidebar)' }}>
        <div className="flex flex-col flex-1 overflow-y-auto scrollbar-thin">

          {/* Identity card */}
          <div className="px-4 py-4">
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-brand-gradient shadow-brand">
              <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                <LayoutDashboard className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-sm text-white truncate">Seller Hub</h2>
                <p className="text-xs text-white/70 truncate">Business Center</p>
              </div>
              <Zap className="w-4 h-4 text-white/80 shrink-0" />
            </div>
          </div>

          {/* Quick add */}
          <div className="px-4 mb-2">
            <Link to="/seller/add-product">
              <Button size="sm" variant="outline" className="w-full gap-2 text-primary border-primary/30 hover:bg-primary/5">
                <Plus className="w-4 h-4" />
                Add Product
              </Button>
            </Link>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 py-2 space-y-0.5">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    'group flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
                    active
                      ? 'bg-primary text-primary-foreground shadow-brand'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}
                >
                  <Icon className={cn('w-4 h-4 shrink-0 transition-colors', active ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground')} />
                  <span className="flex-1 truncate">{item.name}</span>
                  {item.badge && (
                    <Badge
                      variant={active ? 'secondary' : 'outline'}
                      className={cn(
                        'text-[10px] px-1.5 py-0 h-4 min-w-[18px] font-semibold',
                        active ? 'bg-white/20 text-white border-white/30' : (item as any).badgeVariant === 'secondary' ? 'text-muted-foreground' : 'bg-destructive/10 text-destructive border-destructive/20'
                      )}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Revenue teaser */}
          <div className="p-4 mt-auto space-y-3">
            <Link to="/seller/analytics" className="block">
              <div className="p-3 rounded-2xl bg-muted border border-border hover:border-primary/30 hover:bg-primary/5 transition-all group cursor-pointer">
                <div className="flex items-center justify-between mb-1.5">
                  <p className="text-xs font-semibold text-foreground">This Month</p>
                  <ArrowUpRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>
                <p className="text-lg font-bold text-foreground">৳ 48,200</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <span className="text-[10px] font-semibold text-success">+12.4%</span>
                  <span className="text-[10px] text-muted-foreground">vs last month</span>
                </div>
                <div className="mt-2 h-1 bg-border rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-brand-gradient rounded-full" />
                </div>
              </div>
            </Link>
            <div className="p-3 rounded-2xl bg-muted border border-border">
              <p className="text-xs font-semibold mb-0.5">Need Help?</p>
              <p className="text-[11px] text-muted-foreground mb-2">Chat with seller support</p>
              <Link to="/seller/support">
                <Button size="sm" variant="outline" className="w-full text-xs h-7">Get Support</Button>
              </Link>
            </div>
          </div>
        </div>
      </aside>

      {/* ── MOBILE HEADER ── */}
      <div className="lg:hidden fixed left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-b border-border" style={{ top: 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="flex items-center justify-between px-4 py-2.5">
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shrink-0 shadow-brand">
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-semibold text-sm text-foreground truncate">{activeRoute?.name ?? 'Seller Hub'}</h2>
              <p className="text-[11px] text-muted-foreground truncate">{activeRoute?.description ?? 'Business Center'}</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Link to="/seller/add-product">
              <Button size="sm" variant="ghost" className="h-8 px-2.5 gap-1.5 text-xs">
                <Plus className="w-3.5 h-3.5" />Add
              </Button>
            </Link>
            <Button variant="ghost" size="sm" className="p-2 relative h-8 w-8">
              <Bell className="w-4 h-4" />
              <Badge className="absolute -top-0.5 -right-0.5 w-4 h-4 p-0 flex items-center justify-center text-[9px] bg-error text-error-foreground border-2 border-background">3</Badge>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <ChevronRight className="w-4 h-4 rotate-90" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52 rounded-2xl">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  return (
                    <DropdownMenuItem key={item.name} asChild>
                      <Link to={item.href} className="flex items-center w-full gap-2">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        {item.name}
                        {item.badge && <Badge variant="outline" className="ml-auto text-[10px] px-1.5 h-4">{item.badge}</Badge>}
                      </Link>
                    </DropdownMenuItem>
                  );
                })}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/seller/add-product" className="flex items-center gap-2 w-full text-primary">
                    <Plus className="w-4 h-4" />Add Product
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className={cn('lg:pl-60 xl:pl-64', 'pb-28 lg:pb-8', 'min-h-screen')}>
        <div className="lg:hidden h-[52px]" />
        <div className="w-full overflow-x-hidden">{children}</div>
      </main>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-background/95 backdrop-blur-xl border-t border-border pb-safe shadow-xl">
        <div className="overflow-x-auto scrollbar-hide overscroll-x-contain">
          <div className="flex px-2 py-2 min-w-max gap-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              return (
                <Link key={item.name} to={item.href} className="flex-shrink-0">
                  <div className={cn(
                    'flex flex-col items-center py-2 px-3 min-w-[68px] rounded-xl relative transition-all duration-150',
                    active ? 'bg-primary text-primary-foreground shadow-brand' : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  )}>
                    <Icon className="w-4 h-4 mb-0.5 shrink-0" />
                    <span className="text-[10px] font-medium whitespace-nowrap leading-none">{item.name}</span>
                    {item.badge && (
                      <Badge className={cn('absolute -top-1 -right-1 w-[18px] h-[18px] p-0 flex items-center justify-center text-[9px] border-2 border-background',
                        (item as any).badgeVariant === 'secondary' ? 'bg-primary' : 'bg-error'
                      )}>
                        {item.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
        <div className="absolute right-0 top-0 bottom-0 w-6 bg-gradient-to-l from-background to-transparent pointer-events-none" />
      </div>
    </div>
  );
});