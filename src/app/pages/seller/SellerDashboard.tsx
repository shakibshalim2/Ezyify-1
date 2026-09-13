import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import {
  DollarSign,
  Package,
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingBag,
  ArrowUpRight,
  AlertCircle,
  Star,
  Eye,
  Clock,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Skeleton } from '../../components/ui/skeleton';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { SellerLayout } from '../../components/SellerLayout';

// SKELETON FOR INSTANT UI
function DashboardSkeleton() {
  return (
    <SellerLayout>
      <div className="space-y-6 p-4 sm:p-6">
        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardHeader className="pb-3">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-32 mb-2" />
                <Skeleton className="h-3 w-20" />
              </CardContent>
            </Card>
          ))}
        </div>
        
        {/* Alerts Skeleton */}
        <Skeleton className="h-24 w-full" />
        
        {/* Recent Orders Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}

export default function SellerDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError] = useState(false);

  // PROGRESSIVE LOADING: Simulate data loading
  useEffect(() => {
    const loadData = () => {
      setIsLoading(false);
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadData, 16);
      return () => clearTimeout(timer);
    }
  }, []);

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Real-time business status data - designed for 5-second scan
  const todayStats = {
    revenue: 125.00,
    revenueChange: 18.5,
    orders: 8,
    ordersChange: 12,
    views: 1245,
    viewsChange: 23.4,
    conversion: 3.8
  };

  const thisWeekStats = {
    revenue: 452.00,
    orders: 34,
    pending: 12,
    processing: 8,
    shipped: 14
  };

  const overallStats = {
    totalRevenue: 1856.00,
    revenueChange: 18.2,
    totalOrders: 342,
    ordersChange: 12.5,
    totalProducts: 156,
    productsChange: 8.3,
    activeProducts: 142,
    lowStock: 5,
    avgRating: 4.8,
    ratingChange: 0.3,
    totalReviews: 2543,
    newReviews: 8,
    storeViews: 45600,
    viewsChange: 15.4,
    conversionRate: 3.2
  };

  // Critical alerts - requires immediate action
  const criticalAlerts = [
    { type: 'urgent', message: '12 orders need to be shipped today', action: 'Ship Now', link: '/seller/orders', count: 12 },
    { type: 'warning', message: '5 products low in stock', action: 'Restock', link: '/seller/products', count: 5 }
  ];

  // Good news - positive updates
  const positiveUpdates = [
    { type: 'success', message: 'Your store rating increased to 4.8⭐', action: 'View', link: '/seller/reviews' },
    { type: 'info', message: '8 new 5-star reviews received', action: 'Read', link: '/seller/reviews' }
  ];

  const recentOrders = [
    { id: 'EZY12345678', customer: 'Sarah Ahmed', product: 'Premium Wireless Headphones', amount: 45.00, status: 'pending', time: '2 min ago', urgent: true },
    { id: 'EZY12345679', customer: 'Mike Rahman', product: 'Smart Watch Pro', amount: 120.00, status: 'processing', time: '15 min ago', urgent: false },
    { id: 'EZY12345680', customer: 'Emma Khan', product: 'Wireless Earbuds', amount: 25.00, status: 'shipped', time: '1 hour ago', urgent: false },
    { id: 'EZY12345681', customer: 'John Doe', product: 'Laptop Stand', amount: 18.00, status: 'delivered', time: '3 hours ago', urgent: false }
  ];

  const topProducts = [
    { id: '1', name: 'Premium Wireless Headphones', image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100', sold: 145, revenue: 6525.00, stock: 23, trend: 'up', change: 12 },
    { id: '2', name: 'Smart Watch Pro', image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100', sold: 98, revenue: 11760.00, stock: 15, trend: 'up', change: 8 },
    { id: '3', name: 'Wireless Earbuds', image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100', sold: 234, revenue: 5850.00, stock: 45, trend: 'down', change: -3 }
  ];

  const statusConfig = {
    pending: { color: 'bg-warning/10 text-warning border-warning/20', label: 'Pending', icon: Clock },
    processing: { color: 'bg-info/10 text-info border-info/20', label: 'Processing', icon: Package },
    shipped: { color: 'bg-primary/10 text-primary border-primary/20', label: 'Shipped', icon: TrendingUp },
    delivered: { color: 'bg-success/10 text-success border-success/20', label: 'Delivered', icon: CheckCircle2 }
  };

  // Error State
  if (hasError) {
    return (
      <SellerLayout>
        <div className="flex items-center justify-center p-4 min-h-[60vh]">
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center space-y-4">
              <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto">
                <XCircle className="w-8 h-8 text-error" />
              </div>
              <div>
                <h2 className="text-xl font-semibold mb-2">Unable to Load Dashboard</h2>
                <p className="text-muted-foreground">
                  We're having trouble connecting. Please check your internet and try again.
                </p>
              </div>
              <Button onClick={() => window.location.reload()} className="w-full">
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </SellerLayout>
    );
  }

  // Empty State - New Seller
  const isEmpty = overallStats.totalOrders === 0;
  if (isEmpty) {
    return (
      <SellerLayout>
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-8">
          {/* Welcome Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl" style={{ background: "var(--brand-gradient)" }}>
              <ShoppingBag className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-3xl">Welcome to Your Seller Dashboard!</h1>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              You're all set! Let's get your first product listed and start selling.
            </p>
          </div>

          {/* Quick Start Guide */}
          <div className="grid gap-6 md:grid-cols-3 max-w-5xl mx-auto">
            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10" />
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <Package className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">1. Add Products</h3>
                  <p className="text-sm text-muted-foreground">
                    Upload your first product with photos and details
                  </p>
                </div>
                <Link to="/seller/products" className="block">
                  <Button className="w-full">
                    Add Your First Product
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10" />
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <Users className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">2. Set Up Store</h3>
                  <p className="text-sm text-muted-foreground">
                    Customize your store profile and settings
                  </p>
                </div>
                <Link to="/seller/settings" className="block">
                  <Button variant="outline" className="w-full">
                    Configure Store
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/10 rounded-full -mr-10 -mt-10" />
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mx-auto">
                  <TrendingUp className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-2">3. Get Support</h3>
                  <p className="text-sm text-muted-foreground">
                    Learn tips and best practices to grow
                  </p>
                </div>
                <Link to="/seller/support" className="block">
                  <Button variant="outline" className="w-full">
                    View Resources
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

          {/* KYC Alert */}
          <Alert className="max-w-3xl mx-auto border-info/30 bg-info/10">
            <AlertCircle className="h-5 w-5 text-info" />
            <AlertDescription className="ml-2">
              <span className="font-medium">Complete KYC verification to start selling.</span> It only takes 5 minutes.
              <Link to="/seller/kyc-verification" className="ml-2 text-primary hover:underline font-medium">
                Verify Now →
              </Link>
            </AlertDescription>
          </Alert>
        </div>
      </SellerLayout>
    );
  }

  // Normal State - Active Seller (World-Class UX)
  return (
    <SellerLayout>
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
      <SEO title="Seller Dashboard — Ezyify" description="Manage your Ezyify seller store — orders, products, analytics, and earnings." />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Business Overview</h1>
              <Badge variant="success" className="gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-success live-badge" />
                Live
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              Today: <span className="font-semibold text-foreground">${todayStats.revenue.toLocaleString()}</span>
              <span className="mx-1.5 text-border">·</span>
              <span className="font-semibold text-foreground">{todayStats.orders}</span> orders
              <span className="hidden sm:inline">
                <span className="mx-1.5 text-border">·</span>
                <span className="font-semibold text-foreground">{todayStats.views.toLocaleString()}</span> views
              </span>
            </p>
          </div>
          <Link to="/seller/add-product">
            <Button size="sm" className="gap-2 shrink-0">
              <Plus className="w-4 h-4" />
              Add Product
            </Button>
          </Link>
        </div>

        {/* Critical Alerts */}
        {criticalAlerts.length > 0 && (
          <div className="space-y-2">
            {criticalAlerts.map((alert, index) => (
              <div key={index} className={`flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border text-sm ${
                alert.type === 'urgent'
                  ? 'bg-error/8 border-error/20'
                  : 'bg-warning/8 border-warning/20'
              }`}>
                <div className="flex items-center gap-3 min-w-0">
                  <AlertTriangle className={`w-4 h-4 shrink-0 ${alert.type === 'urgent' ? 'text-error' : 'text-warning'}`} />
                  <Badge variant={alert.type === 'urgent' ? 'destructive' : 'warning'} className="shrink-0">{alert.count}</Badge>
                  <span className="font-medium text-foreground truncate">{alert.message}</span>
                </div>
                <Link to={alert.link} className="shrink-0">
                  <Button size="sm" variant={alert.type === 'urgent' ? 'destructive' : 'outline'} className="gap-1 min-h-[44px] text-xs px-3">
                    {alert.action}
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Today's Performance — 5 Second Scan */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Today's Revenue",
              value: `$${todayStats.revenue.toLocaleString()}`,
              change: todayStats.revenueChange,
              sub: `Week: $${thisWeekStats.revenue.toLocaleString()}`,
              icon: DollarSign,
              accent: 'bg-success/10 text-success',
              border: 'border-success/20',
            },
            {
              label: "Today's Orders",
              value: todayStats.orders,
              change: todayStats.ordersChange,
              sub: `Week: ${thisWeekStats.orders} orders`,
              icon: ShoppingBag,
              accent: 'bg-primary/10 text-primary',
              border: 'border-primary/20',
            },
            {
              label: 'Store Views',
              value: todayStats.views.toLocaleString(),
              change: todayStats.viewsChange,
              sub: `Conversion: ${todayStats.conversion}%`,
              icon: Eye,
              accent: 'bg-purple/10 text-purple',
              border: 'border-purple/20',
            },
            {
              label: 'Store Rating',
              value: `${overallStats.avgRating} ★`,
              change: overallStats.ratingChange,
              sub: `${overallStats.newReviews} new reviews`,
              icon: Star,
              accent: 'bg-warning/10 text-warning',
              border: 'border-warning/20',
            },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.label} className={`border-2 ${stat.border} hover:shadow-lg transition-all duration-200`}>
                <CardContent className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2 rounded-xl ${stat.accent}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex items-center gap-1 text-xs font-semibold text-success">
                      <TrendingUp className="w-3 h-3" />
                      {stat.change}%
                    </div>
                  </div>
                  <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className="text-2xl font-bold text-foreground tracking-tight">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1.5">{stat.sub}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Positive Updates */}
        {positiveUpdates.length > 0 && (
          <div className="grid gap-2 sm:gap-3 md:grid-cols-2">
            {positiveUpdates.map((update, index) => (
              <div key={index} className="flex items-center justify-between gap-3 px-4 py-3 rounded-2xl border bg-success/8 border-success/20 text-sm">
                <div className="flex items-center gap-2.5 min-w-0">
                  <CheckCircle2 className="w-4 h-4 text-success shrink-0" />
                  <span className="text-foreground truncate">{update.message}</span>
                </div>
                <Link to={update.link} className="shrink-0">
                  <Button size="sm" variant="ghost" className="gap-1 min-h-[44px] text-xs text-success hover:bg-success/10 px-3">
                    {update.action}
                    <ChevronRight className="w-3 h-3" />
                  </Button>
                </Link>
              </div>
            ))}
          </div>
        )}

        {/* Main Content - Two Column Layout */}
        <div className="grid gap-4 sm:gap-6 lg:grid-cols-3">
          {/* Left: Recent Orders - 2/3 width */}
          <div className="lg:col-span-2 space-y-4 sm:space-y-6">
            {/* Recent Orders */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
                  <div>
                    <CardTitle className="text-base sm:text-lg">Recent Orders</CardTitle>
                    <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                      {thisWeekStats.pending} pending • {thisWeekStats.processing} processing
                    </p>
                  </div>
                  <Link to="/seller/orders">
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      View All
                      <ArrowUpRight className="w-4 h-4 ml-1" />
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="px-3 sm:px-6">
                <div className="space-y-3">
                  {recentOrders.map((order, index) => {
                    const StatusIcon = statusConfig[order.status as keyof typeof statusConfig].icon;
                    return (
                      <div key={order.id}>
                        <div className="flex items-start sm:items-center justify-between gap-3">
                          <div className="flex items-start sm:items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div className={`p-1.5 sm:p-2 rounded-xl ${statusConfig[order.status as keyof typeof statusConfig].color}`}>
                              <StatusIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className="text-xs sm:text-sm font-medium truncate">#{order.id}</p>
                                {order.urgent && (
                                  <Badge className="bg-destructive text-destructive-foreground text-xs px-1.5 py-0">Urgent</Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate">{order.customer}</p>
                              <p className="text-xs text-muted-foreground truncate hidden sm:block">{order.product}</p>
                              <p className="text-xs text-muted-foreground">{order.time}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm sm:text-base font-semibold">${order.amount.toLocaleString()}</p>
                            <Badge 
                              variant="outline" 
                              className={`${statusConfig[order.status as keyof typeof statusConfig].color} text-xs mt-1`}
                            >
                              {statusConfig[order.status as keyof typeof statusConfig].label}
                            </Badge>
                          </div>
                        </div>
                        {index < recentOrders.length - 1 && <Separator className="mt-3" />}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
              <Link to="/seller/add-product">
                <Button variant="outline" className="w-full h-auto py-3 sm:py-4 justify-start">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-medium">Add Product</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">List new items</p>
                  </div>
                </Button>
              </Link>
              <Link to="/seller/analytics">
                <Button variant="outline" className="w-full h-auto py-3 sm:py-4 justify-start">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 mr-2 sm:mr-3" />
                  <div className="text-left">
                    <p className="text-xs sm:text-sm font-medium">View Analytics</p>
                    <p className="text-xs text-muted-foreground hidden sm:block">Detailed insights</p>
                  </div>
                </Button>
              </Link>
            </div>
          </div>

          {/* Right: Quick Stats - 1/3 width */}
          <div className="space-y-4 sm:space-y-6">
            {/* This Week Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">This Week</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Revenue</span>
                  <span className="text-sm sm:text-base font-semibold">${thisWeekStats.revenue.toLocaleString()}</span>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Total Orders</span>
                  <span className="text-sm sm:text-base font-semibold">{thisWeekStats.orders}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2">
                  <div className="text-center p-2 bg-warning/10 rounded-xl">
                    <p className="text-xs text-muted-foreground">Pending</p>
                    <p className="text-base sm:text-lg font-semibold">{thisWeekStats.pending}</p>
                  </div>
                  <div className="text-center p-2 bg-info/10 rounded-xl">
                    <p className="text-xs text-muted-foreground">Processing</p>
                    <p className="text-base sm:text-lg font-semibold">{thisWeekStats.processing}</p>
                  </div>
                  <div className="text-center p-2 bg-primary/10 rounded-xl">
                    <p className="text-xs text-muted-foreground">Shipped</p>
                    <p className="text-base sm:text-lg font-semibold">{thisWeekStats.shipped}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base sm:text-lg">Top Products</CardTitle>
                  <Link to="/seller/products">
                    <Button variant="ghost" size="sm" className="h-8 text-xs">
                      View All
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 sm:space-y-4">
                {topProducts.map((product, index) => (
                  <div key={product.id} className="flex items-center gap-2 sm:gap-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full text-white" style={{ background: "var(--brand-gradient)" }}>
                      {index + 1}
                    </div>
                    <img loading="lazy"
                      src={product.image}
                      alt={product.name}
                      className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl object-cover flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium truncate">{product.name}</p>
                      <p className="text-xs text-muted-foreground">{product.sold} sold</p>
                    </div>
                    <div className="text-right">
                      {product.trend === 'up' ? (
                        <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-success ml-auto mb-1" />
                      ) : (
                        <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-error ml-auto mb-1" />
                      )}
                      <p className="text-xs text-muted-foreground">
                        {product.change > 0 ? '+' : ''}{product.change}%
                      </p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Store Health */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base sm:text-lg">Store Health</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Products</span>
                  <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                    {overallStats.activeProducts} active
                  </Badge>
                </div>
                {overallStats.lowStock > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Low Stock</span>
                    <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">
                      {overallStats.lowStock} items
                    </Badge>
                  </div>
                )}
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <span className="text-sm sm:text-base font-medium flex items-center gap-1">{overallStats.avgRating}<Star className="w-4 h-4 fill-amber-400 text-amber-400" /></span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Reviews</span>
                  <span className="text-sm sm:text-base font-medium">{overallStats.totalReviews}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </SellerLayout>
  );
}