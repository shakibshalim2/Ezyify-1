import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import {
  BarChart3,
  TrendingUp,
  DollarSign,
  Users,
  ShoppingCart,
  Activity,
  Eye,
  MousePointer,
  Clock,
  Target,
  Zap,
  AlertTriangle,
  CheckCircle2,
  ArrowUp,
  ArrowDown,
  Filter,
  Download,
  Settings,
  LineChart,
  PieChart,
  TrendingDown,
  Percent,
  RefreshCw,
  Calendar,
  MapPin,
  Smartphone,
  Monitor,
  Globe,
  Share2,
  Heart,
  MessageSquare,
  Star,
  Package,
  CreditCard,
  Repeat
} from 'lucide-react';
import { toast } from 'sonner';

interface AnalyticsMetric {
  id: string;
  name: string;
  value: string | number;
  change: number;
  changeType: 'up' | 'down';
  icon: any;
  color: string;
  prefix?: string;
  suffix?: string;
}

interface RevenueBreakdown {
  category: string;
  amount: number;
  percentage: number;
  color: string;
}

interface UserBehavior {
  metric: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

interface FunnelStage {
  stage: string;
  users: number;
  conversionRate: number;
  dropoff: number;
}

interface ABTest {
  id: string;
  name: string;
  status: 'running' | 'completed' | 'paused';
  variants: Array<{
    name: string;
    traffic: number;
    conversions: number;
    conversionRate: number;
    isWinner: boolean;
  }>;
  startDate: string;
  sampleSize: number;
  confidence: number;
}

interface TopProduct {
  id: string;
  name: string;
  category: string;
  revenue: number;
  units: number;
  growth: number;
}

interface UserSegment {
  name: string;
  count: number;
  percentage: number;
  avgRevenue: number;
  color: string;
}

export default function AnalyticsBusinessIntelligence() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('7d');
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Key metrics
  const [metrics, setMetrics] = useState<AnalyticsMetric[]>([
    {
      id: 'revenue',
      name: 'Total Revenue',
      value: '৳2.45M',
      change: 18.5,
      changeType: 'up',
      icon: DollarSign,
      color: 'text-success'
    },
    {
      id: 'orders',
      name: 'Total Orders',
      value: '12,458',
      change: 12.3,
      changeType: 'up',
      icon: ShoppingCart,
      color: 'text-info'
    },
    {
      id: 'users',
      name: 'Active Users',
      value: '8,742',
      change: 24.7,
      changeType: 'up',
      icon: Users,
      color: 'text-primary'
    },
    {
      id: 'aov',
      name: 'Avg Order Value',
      value: '৳1,847',
      change: 5.2,
      changeType: 'up',
      icon: Target,
      color: 'text-warning'
    },
    {
      id: 'conversion',
      name: 'Conversion Rate',
      value: '3.8%',
      change: 0.4,
      changeType: 'up',
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      id: 'retention',
      name: 'Retention Rate',
      value: '68%',
      change: -2.1,
      changeType: 'down',
      icon: Repeat,
      color: 'text-like'
    }
  ]);

  // Revenue breakdown
  const [revenueBreakdown, setRevenueBreakdown] = useState<RevenueBreakdown[]>([
    { category: 'Fashion', amount: 892000, percentage: 36.4, color: 'bg-info' },
    { category: 'Electronics', amount: 612000, percentage: 25.0, color: 'bg-primary/10' },
    { category: 'Home & Living', amount: 428000, percentage: 17.5, color: 'bg-success' },
    { category: 'Beauty', amount: 318000, percentage: 13.0, color: 'bg-pink-500' },
    { category: 'Others', amount: 200000, percentage: 8.1, color: 'bg-muted-foreground' }
  ]);

  // User behavior
  const [userBehavior, setUserBehavior] = useState<UserBehavior[]>([
    { metric: 'Session Duration', value: '8m 24s', change: 12.5, trend: 'up' },
    { metric: 'Pages per Session', value: '5.7', change: 8.3, trend: 'up' },
    { metric: 'Bounce Rate', value: '32.4%', change: -5.2, trend: 'up' },
    { metric: 'Time to Purchase', value: '2.3 days', change: -18.6, trend: 'up' },
    { metric: 'Cart Abandonment', value: '42.8%', change: -3.4, trend: 'up' },
    { metric: 'Return Rate', value: '4.2%', change: -1.1, trend: 'up' }
  ]);

  // Funnel data
  const [funnel, setFunnel] = useState<FunnelStage[]>([
    { stage: 'Visitors', users: 45000, conversionRate: 100, dropoff: 0 },
    { stage: 'Product Views', users: 32400, conversionRate: 72.0, dropoff: 28.0 },
    { stage: 'Add to Cart', users: 18500, conversionRate: 57.1, dropoff: 42.9 },
    { stage: 'Checkout Started', users: 12800, conversionRate: 69.2, dropoff: 30.8 },
    { stage: 'Payment', users: 9600, conversionRate: 75.0, dropoff: 25.0 },
    { stage: 'Order Complete', users: 8742, conversionRate: 91.1, dropoff: 8.9 }
  ]);

  // A/B tests
  const [abTests, setABTests] = useState<ABTest[]>([
    {
      id: 'test-1',
      name: 'Checkout Flow Optimization',
      status: 'running',
      variants: [
        { name: 'Control (3-step)', traffic: 50, conversions: 1240, conversionRate: 3.2, isWinner: false },
        { name: 'Variant A (1-step)', traffic: 50, conversions: 1487, conversionRate: 3.8, isWinner: true }
      ],
      startDate: '2026-02-18',
      sampleSize: 78000,
      confidence: 97.5
    },
    {
      id: 'test-2',
      name: 'Product Page Layout',
      status: 'running',
      variants: [
        { name: 'Control', traffic: 33, conversions: 892, conversionRate: 4.1, isWinner: false },
        { name: 'Variant A (Gallery)', traffic: 33, conversions: 1024, conversionRate: 4.7, isWinner: true },
        { name: 'Variant B (Video)', traffic: 34, conversions: 986, conversionRate: 4.5, isWinner: false }
      ],
      startDate: '2026-02-20',
      sampleSize: 65000,
      confidence: 94.2
    },
    {
      id: 'test-3',
      name: 'Pricing Display Strategy',
      status: 'completed',
      variants: [
        { name: 'Control (Standard)', traffic: 50, conversions: 2145, conversionRate: 5.2, isWinner: false },
        { name: 'Variant A (Discount)', traffic: 50, conversions: 2687, conversionRate: 6.5, isWinner: true }
      ],
      startDate: '2026-02-10',
      sampleSize: 82000,
      confidence: 99.1
    }
  ]);

  // Top products
  const [topProducts, setTopProducts] = useState<TopProduct[]>([
    { id: '1', name: 'Premium Wireless Earbuds', category: 'Electronics', revenue: 245000, units: 487, growth: 32.5 },
    { id: '2', name: 'Designer Handbag Collection', category: 'Fashion', revenue: 198000, units: 124, growth: 28.3 },
    { id: '3', name: 'Smart Fitness Tracker', category: 'Electronics', revenue: 187000, units: 623, growth: 45.2 },
    { id: '4', name: 'Organic Skincare Set', category: 'Beauty', revenue: 156000, units: 892, growth: 18.7 },
    { id: '5', name: 'Modern Coffee Table', category: 'Home & Living', revenue: 142000, units: 178, growth: 22.1 }
  ]);

  // User segments
  const [userSegments, setUserSegments] = useState<UserSegment[]>([
    { name: 'Power Buyers', count: 847, percentage: 9.7, avgRevenue: 12450, color: 'bg-primary/10' },
    { name: 'Regular Customers', count: 2456, percentage: 28.1, avgRevenue: 3200, color: 'bg-info' },
    { name: 'Occasional Shoppers', count: 3842, percentage: 43.9, avgRevenue: 850, color: 'bg-success' },
    { name: 'First-time Buyers', count: 1597, percentage: 18.3, avgRevenue: 420, color: 'bg-warning' }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 800);

    // Auto-refresh data
    let refreshInterval: NodeJS.Timeout;
    if (autoRefresh) {
      refreshInterval = setInterval(() => {
        // Data refresh would happen here
      }, 30000); // Refresh every 30 seconds
    }

    return () => {
      clearTimeout(timer);
      if (refreshInterval) clearInterval(refreshInterval);
    };
  }, [autoRefresh]);

  const handleSimulateScale = () => {
    setFunnel(prev => prev.map(stage => ({
      ...stage,
      users: Math.round(stage.users * 1.5)
    })));
    setMetrics(prev => prev.map(metric => {
      if (metric.id === 'revenue') return { ...metric, value: `৳${(parseFloat(metric.value.toString().replace('৳', '').replace('M', '')) * 1.5).toFixed(2)}M` };
      if (metric.id === 'orders') return { ...metric, value: Math.round(parseInt(metric.value.toString().replace(',', '')) * 1.5).toLocaleString() };
      return metric;
    }));
    toast.success('Simulated 1.5x Platform Scale!', {
      description: 'Traffic and revenue projected across all funnels.'
    });
  };

  const handleExportReport = () => {
    toast.success('Exporting analytics report...', {
      description: 'Your report will be ready in a few moments'
    });
  };

  const handleABTestAction = (testId: string, action: 'pause' | 'resume' | 'finalize') => {
    setABTests(prev => prev.map(test =>
      test.id === testId
        ? {
            ...test,
            status: action === 'pause' ? 'paused' : action === 'resume' ? 'running' : 'completed'
          }
        : test
    ));
    toast.success(`Test ${action}d successfully`);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      running: <Badge className="bg-success">Running</Badge>,
      paused: <Badge className="bg-warning">Paused</Badge>,
      completed: <Badge variant="secondary">Completed</Badge>
    };
    return variants[status] || <Badge>{status}</Badge>;
  };

  if (isInitializing) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <BarChart3 className="w-8 h-8 text-info" />
            Analytics & Business Intelligence
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time insights and performance metrics
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="px-4 py-2 border rounded-xl"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="custom">Custom Range</option>
          </select>
          
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto-Refresh On' : 'Auto-Refresh Off'}
          </Button>
          
          <Button variant="outline" onClick={handleExportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configure
          </Button>
        </div>
      </div>

      {/* Real-time Alert */}
      {autoRefresh && (
        <Alert>
          <Activity className="h-4 w-4 animate-pulse" />
          <AlertTitle>Live Data Mode</AlertTitle>
          <AlertDescription>
            Dashboard is automatically refreshing every 30 seconds. Last update: Just now
          </AlertDescription>
        </Alert>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                <Badge variant={metric.changeType === 'up' ? 'default' : 'secondary'}>
                  {metric.changeType === 'up' ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(metric.change)}%
                </Badge>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="behavior">User Behavior</TabsTrigger>
          <TabsTrigger value="funnel">Funnel Analysis</TabsTrigger>
          <TabsTrigger value="abtest">A/B Testing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Trend</CardTitle>
                <CardDescription>Daily revenue for the last 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-around gap-2">
                  {[320000, 285000, 412000, 398000, 456000, 423000, 512000].map((value, idx) => {
                    const maxValue = 512000;
                    const height = (value / maxValue) * 100;
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center">
                        <div className="text-xs text-muted-foreground mb-2">
                          ৳{(value / 1000).toFixed(0)}k
                        </div>
                        <div
                          className="w-full rounded-t-lg transition-all hover:opacity-80" 
                          style={{ background: "var(--brand-gradient)", height: `${height}%` }}
                        />
                        <div className="text-xs text-muted-foreground mt-2">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][idx]}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your customers are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Smartphone className="w-4 h-4 text-info" />
                        <span className="text-sm">Mobile</span>
                      </div>
                      <span className="text-sm font-semibold">58%</span>
                    </div>
                    <Progress value={58} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Monitor className="w-4 h-4 text-primary" />
                        <span className="text-sm">Desktop</span>
                      </div>
                      <span className="text-sm font-semibold">35%</span>
                    </div>
                    <Progress value={35} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Globe className="w-4 h-4 text-success" />
                        <span className="text-sm">Tablet</span>
                      </div>
                      <span className="text-sm font-semibold">7%</span>
                    </div>
                    <Progress value={7} />
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t space-y-3">
                  <h4 className="font-semibold text-sm">Geographic Distribution</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Dhaka</span>
                      <span className="font-semibold">42%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Chittagong</span>
                      <span className="font-semibold">18%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Sylhet</span>
                      <span className="font-semibold">12%</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Others</span>
                      <span className="font-semibold">28%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Top Performing Products</CardTitle>
              <CardDescription>Best sellers by revenue (last 7 days)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topProducts.map((product, idx) => (
                  <div key={product.id} className="flex items-center justify-between p-3 border rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: "var(--brand-gradient)" }}>
                        #{idx + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.category}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <p className="text-sm text-muted-foreground">Revenue</p>
                        <p className="font-semibold">৳{(product.revenue / 1000).toFixed(0)}k</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Units</p>
                        <p className="font-semibold">{product.units}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Growth</p>
                        <p className="font-semibold text-success">+{product.growth}%</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Revenue by Category</CardTitle>
                <CardDescription>Distribution across product categories</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueBreakdown.map((item) => (
                    <div key={item.category}>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm font-medium">{item.category}</span>
                        <span className="text-sm font-semibold">
                          ৳{(item.amount / 1000).toFixed(0)}k ({item.percentage}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3">
                        <div
                          className={`${item.color} h-3 rounded-full transition-all`}
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Segments by Revenue</CardTitle>
                <CardDescription>Customer segmentation and value</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {userSegments.map((segment) => (
                    <div key={segment.name} className="border rounded-2xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${segment.color}`} />
                          <span className="font-medium">{segment.name}</span>
                        </div>
                        <Badge>{segment.count.toLocaleString()} users</Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-2">
                        <div>
                          <p className="text-xs text-muted-foreground">Percentage</p>
                          <p className="text-lg font-semibold">{segment.percentage}%</p>
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Avg Revenue</p>
                          <p className="text-lg font-semibold">৳{segment.avgRevenue.toLocaleString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Revenue Metrics Breakdown</CardTitle>
              <CardDescription>Detailed revenue analysis</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Gross Revenue</p>
                    <p className="text-2xl font-bold mt-2">৳2.45M</p>
                    <p className="text-xs text-success mt-1">+18.5% vs last period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Net Revenue</p>
                    <p className="text-2xl font-bold mt-2">৳2.21M</p>
                    <p className="text-xs text-success mt-1">+16.2% vs last period</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Platform Fee</p>
                    <p className="text-2xl font-bold mt-2">৳240K</p>
                    <p className="text-xs text-muted-foreground mt-1">9.8% commission</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Refunds</p>
                    <p className="text-2xl font-bold mt-2">৳42K</p>
                    <p className="text-xs text-warning mt-1">1.7% of gross revenue</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* User Behavior Tab */}
        <TabsContent value="behavior" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Behavior Metrics</CardTitle>
              <CardDescription>How users interact with your platform</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {userBehavior.map((behavior) => (
                  <Card key={behavior.metric}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm text-muted-foreground">{behavior.metric}</p>
                        <Badge variant={behavior.trend === 'up' ? 'default' : 'secondary'}>
                          {behavior.trend === 'up' ? (
                            <ArrowUp className="w-3 h-3 mr-1" />
                          ) : behavior.trend === 'down' ? (
                            <ArrowDown className="w-3 h-3 mr-1" />
                          ) : null}
                          {Math.abs(behavior.change)}%
                        </Badge>
                      </div>
                      <p className="text-3xl font-bold">{behavior.value}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Popular Features</CardTitle>
                <CardDescription>Most used platform features</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { feature: 'Product Search', usage: 87, icon: Target },
                    { feature: 'Live Shopping', usage: 72, icon: Activity },
                    { feature: 'Wishlist', usage: 68, icon: Heart },
                    { feature: 'Share Products', usage: 54, icon: Share2 },
                    { feature: 'Reviews & Ratings', usage: 48, icon: Star },
                    { feature: 'Messaging', usage: 42, icon: MessageSquare }
                  ].map((item) => (
                    <div key={item.feature}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <item.icon className="w-4 h-4 text-info" />
                          <span className="text-sm">{item.feature}</span>
                        </div>
                        <span className="text-sm font-semibold">{item.usage}%</span>
                      </div>
                      <Progress value={item.usage} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>User Engagement</CardTitle>
                <CardDescription>Activity patterns and trends</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Daily Active Users</span>
                      <span className="text-sm font-semibold">6,842 (78%)</span>
                    </div>
                    <Progress value={78} className="bg-success" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Weekly Active Users</span>
                      <span className="text-sm font-semibold">8,124 (93%)</span>
                    </div>
                    <Progress value={93} className="bg-info" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Monthly Active Users</span>
                      <span className="text-sm font-semibold">8,742 (100%)</span>
                    </div>
                    <Progress value={100} className="bg-primary/10" />
                  </div>

                  <div className="pt-4 border-t space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg Sessions per User</span>
                      <span className="font-semibold">4.2 /day</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Peak Usage Time</span>
                      <span className="font-semibold">8-10 PM</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Returning Users</span>
                      <span className="font-semibold">68%</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Funnel Analysis Tab */}
        <TabsContent value="funnel" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Conversion Funnel</span>
                <Button size="sm" variant="outline" onClick={handleSimulateScale}>
                  <TrendingUp className="w-4 h-4 mr-2 text-info" />
                  Simulate 1.5x Scale
                </Button>
              </CardTitle>
              <CardDescription>User journey from visit to purchase</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {funnel.map((stage, idx) => (
                  <div key={stage.stage} className="relative">
                    <div className="flex items-center justify-between p-4 border rounded-xl bg-info/8">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-info text-white flex items-center justify-center font-semibold text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold">{stage.stage}</p>
                          <p className="text-sm text-muted-foreground">
                            {stage.users.toLocaleString()} users
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-success">
                          {stage.conversionRate.toFixed(1)}%
                        </p>
                        {stage.dropoff > 0 && (
                          <p className="text-xs text-error">
                            -{stage.dropoff.toFixed(1)}% dropoff
                          </p>
                        )}
                      </div>
                    </div>
                    {idx < funnel.length - 1 && (
                      <div className="flex justify-center my-2">
                        <ArrowDown className="w-6 h-6 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t">
                <h4 className="font-semibold mb-4">Funnel Insights</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>High Dropoff Alert</AlertTitle>
                    <AlertDescription>
                      42.9% users abandon cart before checkout
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <CheckCircle2 className="h-4 w-4" />
                    <AlertTitle>Strong Performance</AlertTitle>
                    <AlertDescription>
                      91.1% payment completion rate
                    </AlertDescription>
                  </Alert>
                  <Alert>
                    <TrendingUp className="h-4 w-4" />
                    <AlertTitle>Opportunity</AlertTitle>
                    <AlertDescription>
                      Optimize product pages for 28% more engagement
                    </AlertDescription>
                  </Alert>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* A/B Testing Tab */}
        <TabsContent value="abtest" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>A/B Tests</CardTitle>
                  <CardDescription>Active experiments and results</CardDescription>
                </div>
                <Button>
                  <Zap className="w-4 h-4 mr-2" />
                  Create New Test
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {abTests.map((test) => (
                  <div key={test.id} className="border rounded-2xl p-4 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{test.name}</h3>
                          {getStatusBadge(test.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Started: {test.startDate} • Sample: {test.sampleSize.toLocaleString()} users •
                          Confidence: {test.confidence}%
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {test.status === 'running' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleABTestAction(test.id, 'pause')}
                            >
                              Pause
                            </Button>
                            {test.confidence >= 95 && (
                              <Button
                                size="sm"
                                onClick={() => handleABTestAction(test.id, 'finalize')}
                              >
                                Finalize Winner
                              </Button>
                            )}
                          </>
                        )}
                        {test.status === 'paused' && (
                          <Button size="sm" onClick={() => handleABTestAction(test.id, 'resume')}>
                            Resume
                          </Button>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      {test.variants.map((variant) => (
                        <div
                          key={variant.name}
                          className={`p-3 border rounded-xl ${
                            variant.isWinner ? 'border-success/50 bg-success/5' : ''
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{variant.name}</span>
                              {variant.isWinner && (
                                <Badge className="bg-success">
                                  <TrendingUp className="w-3 h-3 mr-1" />
                                  Winner
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm text-muted-foreground">{variant.traffic}% traffic</span>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Conversions</p>
                              <p className="font-semibold">{variant.conversions.toLocaleString()}</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Conversion Rate</p>
                              <p className="font-semibold text-success">{variant.conversionRate}%</p>
                            </div>
                            <div>
                              <p className="text-muted-foreground">Improvement</p>
                              <p className="font-semibold">
                                {variant.isWinner
                                  ? `+${(
                                      ((variant.conversionRate -
                                        Math.min(...test.variants.map((v) => v.conversionRate))) /
                                        Math.min(...test.variants.map((v) => v.conversionRate))) *
                                      100
                                    ).toFixed(1)}%`
                                  : '-'}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {test.confidence >= 95 && test.status === 'running' && (
                      <Alert>
                        <CheckCircle2 className="h-4 w-4" />
                        <AlertTitle>Statistical Significance Reached</AlertTitle>
                        <AlertDescription>
                          This test has reached {test.confidence}% confidence. You can now finalize the winner.
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
