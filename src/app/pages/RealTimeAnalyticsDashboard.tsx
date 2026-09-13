import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { 
  Activity, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  ShoppingCart, 
  DollarSign,
  Eye,
  Heart,
  MessageSquare,
  Package,
  Clock,
  AlertCircle,
  CheckCircle,
  BarChart3,
  PieChart,
  LineChart,
  Zap,
  RefreshCw,
  Download,
  Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { LineChart as RechartsLine, Line, AreaChart, Area, BarChart, Bar, PieChart as RechartsPie, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function RealTimeAnalyticsDashboard() {
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [isLive, setIsLive] = useState(true);

  // Simulate real-time updates
  useEffect(() => {
    if (!isLive) return;
    
    const interval = setInterval(() => {
      setLastUpdate(new Date());
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive]);

  // Mock real-time data
  const realtimeMetrics = {
    activeUsers: 2847,
    activeUsersChange: +12.5,
    ordersToday: 156,
    ordersChange: +8.3,
    revenueToday: 18456.78,
    revenueChange: +15.2,
    conversionRate: 3.42,
    conversionChange: +0.8,
  };

  const hourlyData = Array.from({ length: 24 }, (_, i) => ({
    hour: `${i}:00`,
    users: Math.floor(Math.random() * 500) + 200,
    orders: Math.floor(Math.random() * 50) + 10,
    revenue: Math.floor(Math.random() * 2000) + 500,
  }));

  const categoryData = [
    { name: 'Electronics', value: 35, revenue: 12450 },
    { name: 'Fashion', value: 28, revenue: 9850 },
    { name: 'Beauty', value: 18, revenue: 6340 },
    { name: 'Home', value: 12, revenue: 4220 },
    { name: 'Sports', value: 7, revenue: 2450 },
  ];

  const topProducts = [
    { name: 'Wireless Headphones', sales: 45, revenue: 5625, trend: '+12%' },
    { name: 'Smart Watch', sales: 38, revenue: 11382, trend: '+8%' },
    { name: 'Running Shoes', sales: 32, revenue: 2879, trend: '+15%' },
    { name: 'Laptop Stand', sales: 28, revenue: 1540, trend: '+5%' },
    { name: 'Phone Case', sales: 24, revenue: 599, trend: '-3%' },
  ];

  const COLORS = ['#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981'];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border sticky lg:!top-16 z-10" style={{ top: 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <Activity className="w-8 h-8 text-info" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground dark:text-white">
                    Real-Time Analytics
                  </h1>
                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex items-center gap-1">
                      {isLive && (
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-success"></span>
                        </span>
                      )}
                      <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                        {isLive ? 'Live' : 'Paused'} • Last updated: {lastUpdate.toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsLive(!isLive)}
              >
                {isLive ? (
                  <>
                    <Clock className="w-4 h-4 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Resume
                  </>
                )}
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Calendar className="w-4 h-4 mr-2" />
                Date Range
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8 space-y-6">
        {/* Real-time Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Active Users</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-1">
                  {realtimeMetrics.activeUsers.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">
                    +{realtimeMetrics.activeUsersChange}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last hour</span>
                </div>
              </div>
              <div className="bg-info/10 p-3 rounded-xl">
                <Users className="w-6 h-6 text-info" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Orders Today</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-1">
                  {realtimeMetrics.ordersToday}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">
                    +{realtimeMetrics.ordersChange}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs yesterday</span>
                </div>
              </div>
              <div className="bg-primary/10 p-3 rounded-xl">
                <ShoppingCart className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Revenue Today</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-1">
                  ${realtimeMetrics.revenueToday.toLocaleString()}
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">
                    +{realtimeMetrics.revenueChange}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs yesterday</span>
                </div>
              </div>
              <div className="bg-success/10 p-3 rounded-xl">
                <DollarSign className="w-6 h-6 text-success" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground dark:text-muted-foreground">Conversion Rate</p>
                <p className="text-3xl font-bold text-foreground dark:text-white mt-1">
                  {realtimeMetrics.conversionRate}%
                </p>
                <div className="flex items-center gap-1 mt-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-sm text-success">
                    +{realtimeMetrics.conversionChange}%
                  </span>
                  <span className="text-xs text-muted-foreground">vs last week</span>
                </div>
              </div>
              <div className="bg-warning/10 p-3 rounded-xl">
                <TrendingUp className="w-6 h-6 text-warning" />
              </div>
            </div>
          </Card>
        </div>

        {/* Charts Section */}
        <Tabs defaultValue="hourly" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="hourly">Hourly Trends</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="products">Top Products</TabsTrigger>
            <TabsTrigger value="engagement">Engagement</TabsTrigger>
          </TabsList>

          <TabsContent value="hourly" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Last 24 Hours Activity</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
                  <Area type="monotone" dataKey="orders" stackId="2" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Revenue by Hour</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="revenue" fill="#10b981" />
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Sales by Category</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsPie>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={(entry) => entry.name}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPie>
                </ResponsiveContainer>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Category Performance</h3>
                <div className="space-y-4">
                  {categoryData.map((category, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{category.name}</span>
                        <span className="text-sm text-muted-foreground dark:text-muted-foreground">
                          ${category.revenue.toLocaleString()}
                        </span>
                      </div>
                      <Progress value={category.value} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="products" className="space-y-4">
            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">Top Selling Products</h3>
              <div className="space-y-4">
                {topProducts.map((product, index) => (
                  <div key={index} className="flex items-center justify-between p-4 bg-muted rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: "var(--brand-gradient)" }}>
                        #{index + 1}
                      </div>
                      <div>
                        <p className="font-medium">{product.name}</p>
                        <p className="text-sm text-muted-foreground dark:text-muted-foreground">
                          {product.sales} sales • ${product.revenue.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={product.trend.startsWith('+') ? 'default' : 'destructive'}>
                      {product.trend}
                    </Badge>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="engagement" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Eye className="w-5 h-5 text-info" />
                  <h3 className="font-semibold">Page Views</h3>
                </div>
                <p className="text-3xl font-bold">45,678</p>
                <p className="text-sm text-success mt-1">+18.3% from yesterday</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Heart className="w-5 h-5 text-error" />
                  <h3 className="font-semibold">Likes</h3>
                </div>
                <p className="text-3xl font-bold">12,456</p>
                <p className="text-sm text-success mt-1">+12.7% from yesterday</p>
              </Card>

              <Card className="p-6">
                <div className="flex items-center gap-3 mb-4">
                  <MessageSquare className="w-5 h-5 text-primary" />
                  <h3 className="font-semibold">Comments</h3>
                </div>
                <p className="text-3xl font-bold">3,892</p>
                <p className="text-sm text-success mt-1">+8.5% from yesterday</p>
              </Card>
            </div>

            <Card className="p-6">
              <h3 className="text-lg font-semibold mb-4">User Engagement Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={hourlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hour" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card>
          </TabsContent>
        </Tabs>

        {/* System Health */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-info" />
            System Health
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">API Response Time</span>
                <Badge variant="default">Good</Badge>
              </div>
              <p className="text-2xl font-bold">245ms</p>
              <Progress value={75} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">Server Load</span>
                <Badge variant="default">Normal</Badge>
              </div>
              <p className="text-2xl font-bold">42%</p>
              <Progress value={42} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">Error Rate</span>
                <Badge variant="default">Low</Badge>
              </div>
              <p className="text-2xl font-bold">0.03%</p>
              <Progress value={3} className="h-2" />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground dark:text-muted-foreground">Uptime</span>
                <Badge variant="default">Excellent</Badge>
              </div>
              <p className="text-2xl font-bold">99.98%</p>
              <Progress value={99.98} className="h-2" />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}