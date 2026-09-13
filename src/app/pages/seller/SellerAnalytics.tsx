import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  ShoppingCart, 
  DollarSign,
  Users,
  Package,
  MapPin,
  Calendar,
  Download,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { SellerLayout } from '../../components/SellerLayout';

export default function SellerAnalytics() {
  const [dateRange, setDateRange] = useState('30days');
  const [isLoading, setIsLoading] = useState(true);

  // PROGRESSIVE LOADING: Load analytics data after initial render
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

  // Mock analytics data
  const metrics = {
    totalViews: 45600,
    viewsChange: 12.5,
    totalClicks: 8932,
    clicksChange: -3.2,
    conversionRate: 3.8,
    conversionChange: 1.2,
    avgOrderValue: 32.50,
    avgOrderChange: 8.7,
    totalRevenue: 1856.00,
    revenueChange: 15.3
  };

  const topProducts = [
    { id: 1, name: 'Premium Wireless Headphones', views: 5432, sales: 234, revenue: 10530.00, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100' },
    { id: 2, name: 'Smart Watch Pro', views: 4321, sales: 189, revenue: 22680.00, image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100' },
    { id: 3, name: 'Bluetooth Speaker', views: 3876, sales: 156, revenue: 4680.00, image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100' },
    { id: 4, name: 'Laptop Stand', views: 2987, sales: 143, revenue: 2857.00, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100' },
    { id: 5, name: 'USB-C Hub', views: 2654, sales: 98, revenue: 1960.00, image: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=100' }
  ];

  const trafficSources = [
    { source: 'Search', visitors: 18234, percentage: 40, color: 'bg-primary' },
    { source: 'Social Media', visitors: 13675, percentage: 30, color: 'bg-chart-1' },
    { source: 'Direct', visitors: 9117, percentage: 20, color: 'bg-chart-2' },
    { source: 'Referral', visitors: 4558, percentage: 10, color: 'bg-chart-3' }
  ];

  const topLocations = [
    { city: 'New York', orders: 234, revenue: 784.50 },
    { city: 'Los Angeles', orders: 156, revenue: 523.00 },
    { city: 'Chicago', orders: 89, revenue: 298.50 },
    { city: 'Houston', orders: 67, revenue: 224.50 },
    { city: 'Miami', orders: 45, revenue: 151.00 }
  ];

  const customerBehavior = [
    { metric: 'Average Session Duration', value: '5m 23s', change: 8.3 },
    { metric: 'Pages Per Session', value: '4.2', change: 12.1 },
    { metric: 'Bounce Rate', value: '42.3%', change: -5.6 },
    { metric: 'Cart Abandonment Rate', value: '67.8%', change: -3.2 }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded w-48" />
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-2xl" />
            ))}
          </div>
          <div className="h-96 bg-muted animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
      <SEO title="Analytics — Ezyify Seller" description="View detailed analytics and insights for your Ezyify seller store." />
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-foreground">Analytics & Insights</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track your store performance and customer behaviour</p>
          </div>
          <div className="flex items-center gap-2">
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger className="w-[160px]">
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7days">Last 7 days</SelectItem>
                <SelectItem value="30days">Last 30 days</SelectItem>
                <SelectItem value="90days">Last 90 days</SelectItem>
                <SelectItem value="12months">Last 12 months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-5">
          {[
            { label: 'Total Views', value: metrics.totalViews.toLocaleString(), change: metrics.viewsChange, icon: Eye, accent: 'text-primary bg-primary/10' },
            { label: 'Total Clicks', value: metrics.totalClicks.toLocaleString(), change: metrics.clicksChange, icon: ShoppingCart, accent: 'text-primary bg-primary/10' },
            { label: 'Conversion', value: `${metrics.conversionRate}%`, change: metrics.conversionChange, icon: TrendingUp, accent: 'text-success bg-success/10' },
            { label: 'Avg. Order', value: `$${metrics.avgOrderValue}`, change: metrics.avgOrderChange, icon: DollarSign, accent: 'text-warning bg-warning/10' },
          ].map((m) => {
            const Icon = m.icon;
            const isUp = m.change >= 0;
            return (
              <Card key={m.label} className="col-span-1">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-xs font-medium text-muted-foreground">{m.label}</p>
                    <div className={`w-7 h-7 rounded-xl flex items-center justify-center ${m.accent}`}>
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                  </div>
                  <p className="text-xl font-bold text-foreground tracking-tight">{m.value}</p>
                  <div className={`flex items-center gap-1 mt-1 text-xs font-semibold ${isUp ? 'text-success' : 'text-error'}`}>
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {isUp ? '+' : ''}{m.change}% vs last period
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Card className="col-span-2 lg:col-span-1">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-medium text-muted-foreground">Total Revenue</p>
                <div className="w-7 h-7 rounded-xl bg-success/10 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-success" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground tracking-tight">${metrics.totalRevenue.toLocaleString()}</p>
              <div className="flex items-center gap-1 mt-1 text-xs font-semibold text-success">
                <TrendingUp className="w-3 h-3" />
                +{metrics.revenueChange}% vs last period
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="space-y-4 sm:space-y-6">
          <TabsList className="grid w-full grid-cols-4 h-auto rounded-2xl p-1">
            <TabsTrigger value="products" className="text-xs sm:text-sm rounded-xl">Products</TabsTrigger>
            <TabsTrigger value="traffic" className="text-xs sm:text-sm rounded-xl">Traffic</TabsTrigger>
            <TabsTrigger value="locations" className="text-xs sm:text-sm rounded-xl">Locations</TabsTrigger>
            <TabsTrigger value="behavior" className="text-xs sm:text-sm rounded-xl">Behaviour</TabsTrigger>
          </TabsList>

          {/* Products Analytics */}
          <TabsContent value="products" className="space-y-4">
            <Card>
              <CardHeader className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                  <CardTitle className="text-base sm:text-lg">Top Performing Products</CardTitle>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:ml-auto">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input placeholder="Search products..." className="pl-9 w-full sm:w-64" />
                    </div>
                    <Button variant="outline" size="sm" className="w-full sm:w-auto">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 pt-0">
                <div className="space-y-4">
                  {topProducts.map((product, index) => (
                    <div key={product.id}>
                      <div className="flex items-start sm:items-center gap-2 sm:gap-4">
                        <span className="text-xs sm:text-sm font-medium text-muted-foreground w-5 sm:w-6 flex-shrink-0 mt-1 sm:mt-0">#{index + 1}</span>
                        <img loading="lazy" 
                          src={product.image} 
                          alt={product.name}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm sm:text-base font-medium truncate">{product.name}</p>
                          <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-muted-foreground mt-1">
                            <span className="flex items-center gap-1">
                              <Eye className="w-3 h-3" />
                              <span className="hidden sm:inline">{product.views.toLocaleString()} views</span>
                              <span className="sm:hidden">{product.views.toLocaleString()}</span>
                            </span>
                            <span className="flex items-center gap-1">
                              <Package className="w-3 h-3" />
                              {product.sales}
                            </span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-semibold">${product.revenue.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground hidden sm:block">Revenue</p>
                        </div>
                      </div>
                      {index < topProducts.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Traffic Analytics */}
          <TabsContent value="traffic" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {trafficSources.map((source) => (
                    <div key={source.source} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">{source.source}</span>
                        <span className="text-muted-foreground">{source.visitors.toLocaleString()} visitors</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={source.percentage} className="flex-1" />
                        <span className="text-sm font-medium w-12 text-right">{source.percentage}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Behavior Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customerBehavior.map((item) => (
                    <div key={item.metric} className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{item.metric}</p>
                        <p className="text-xl font-semibold mt-1">{item.value}</p>
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${item.change >= 0 ? 'text-success' : 'text-error'}`}>
                        {item.change >= 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : (
                          <TrendingDown className="w-4 h-4" />
                        )}
                        <span>{Math.abs(item.change)}%</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Location Analytics */}
          <TabsContent value="locations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Top Locations</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topLocations.map((location, index) => (
                    <div key={location.city}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-muted-foreground w-6">#{index + 1}</span>
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">{location.city}</p>
                            <p className="text-sm text-muted-foreground">{location.orders} orders</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">${location.revenue.toLocaleString()}</p>
                          <p className="text-sm text-muted-foreground">Revenue</p>
                        </div>
                      </div>
                      {index < topLocations.length - 1 && <Separator className="mt-4" />}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Behavior Analytics */}
          <TabsContent value="behavior" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Customer Journey Insights</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-muted rounded-xl">
                    <p className="text-sm text-muted-foreground mb-2">Most Common Path to Purchase</p>
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">Home Page</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline">Category Browse</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline">Product View</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline">Add to Cart</Badge>
                      <span className="text-muted-foreground">→</span>
                      <Badge variant="outline">Checkout</Badge>
                    </div>
                  </div>

                  <Separator />

                  <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 border border-border rounded-xl">
                      <p className="text-2xl font-semibold">67%</p>
                      <p className="text-sm text-muted-foreground mt-1">Of users browse before buying</p>
                    </div>
                    <div className="p-4 border border-border rounded-xl">
                      <p className="text-2xl font-semibold">2.3</p>
                      <p className="text-sm text-muted-foreground mt-1">Average products viewed per session</p>
                    </div>
                    <div className="p-4 border border-border rounded-xl">
                      <p className="text-2xl font-semibold">78%</p>
                      <p className="text-sm text-muted-foreground mt-1">Mobile vs desktop traffic</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SellerLayout>
  );
}