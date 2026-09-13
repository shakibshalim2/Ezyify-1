import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Filter,
  TrendingUp,
  DollarSign,
  ShoppingBag,
  Star,
  MoreVertical,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Download,
  ThumbsUp,
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Separator } from '../../components/ui/separator';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { SellerLayout } from '../../components/SellerLayout';

export default function SellerCustomers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // PROGRESSIVE LOADING: Load customer data after initial render
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

  // Mock data
  const stats = {
    totalCustomers: 2543,
    newThisMonth: 234,
    repeatCustomers: 1876,
    repeatRate: 73.8,
    avgLifetimeValue: 285.40
  };

  const topCustomers = [
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah.j@email.com',
      avatar: 'https://i.pravatar.cc/150?img=1',
      totalOrders: 45,
      totalSpent: 1256.00,
      lastOrder: '2 days ago',
      status: 'vip'
    },
    {
      id: '2',
      name: 'Mike Chen',
      email: 'mike.c@email.com',
      phone: '+1 (555) 234-5678',
      avatar: 'https://i.pravatar.cc/150?img=2',
      totalOrders: 32,
      totalSpent: 894.00,
      lastOrder: '5 days ago',
      status: 'regular'
    },
    {
      id: '3',
      name: 'Emma Williams',
      email: 'emma.w@email.com',
      phone: '+1 (555) 345-6789',
      avatar: 'https://i.pravatar.cc/150?img=3',
      totalOrders: 28,
      totalSpent: 762.00,
      lastOrder: '1 week ago',
      status: 'regular'
    }
  ];

  const recentReviews = [
    {
      id: 1,
      customer: 'Sarah Ahmed',
      avatar: 'https://i.pravatar.cc/150?img=1',
      product: 'Premium Wireless Headphones',
      rating: 5,
      comment: 'Excellent product! Sound quality is amazing and delivery was super fast.',
      date: '2 hours ago',
      helpful: 12
    },
    {
      id: 2,
      customer: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=4',
      product: 'Smart Watch Pro',
      rating: 4,
      comment: 'Good product overall. Battery life could be better but satisfied with the purchase.',
      date: '5 hours ago',
      helpful: 8
    },
    {
      id: 3,
      customer: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?img=5',
      product: 'Bluetooth Speaker',
      rating: 3,
      comment: 'Average quality. Expected better bass. Packaging was good though.',
      date: '1 day ago',
      helpful: 3
    },
    {
      id: 4,
      customer: 'David Chen',
      avatar: 'https://i.pravatar.cc/150?img=6',
      product: 'Laptop Stand',
      rating: 5,
      comment: 'Perfect! Exactly what I needed for my home office setup.',
      date: '2 days ago',
      helpful: 15
    }
  ];

  const ratingDistribution = [
    { stars: 5, count: 1543, percentage: 60.7 },
    { stars: 4, count: 685, percentage: 26.9 },
    { stars: 3, count: 203, percentage: 8.0 },
    { stars: 2, count: 76, percentage: 3.0 },
    { stars: 1, count: 36, percentage: 1.4 }
  ];

  const customerSegments = [
    { name: 'VIP Customers', count: 156, value: 24500.00, color: 'bg-primary/10' },
    { name: 'Repeat Buyers', count: 1876, value: 38900.00, color: 'bg-primary' },
    { name: 'One-time Buyers', count: 511, value: 8900.00, color: 'bg-muted-foreground' }
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 space-y-6">
          <div className="h-8 bg-muted animate-pulse rounded w-48" />
          <div className="grid gap-6 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted animate-pulse rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
      <SEO title="Customers — Ezyify Seller" description="Manage and analyze your customer base on Ezyify." />
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="mb-1 text-xl sm:text-2xl">Customer Management</h1>
            <p className="text-sm text-muted-foreground">Manage customer relationships and reviews</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Button variant="outline" size="sm" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Total Customers</p>
                <Users className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xl sm:text-2xl font-semibold">{stats.totalCustomers.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  +{stats.newThisMonth} this month
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Repeat Customers</p>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xl sm:text-2xl font-semibold">{stats.repeatCustomers.toLocaleString()}</p>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {stats.repeatRate}% retention rate
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Avg. Lifetime Value</p>
                <ShoppingBag className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-xl sm:text-2xl font-semibold">${stats.avgLifetimeValue.toLocaleString()}</p>
                <p className="text-sm text-success">+12.3% vs last month</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-muted-foreground">Avg. Rating</p>
                <Star className="w-4 h-4 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="text-xl sm:text-2xl font-semibold">4.8</p>
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${star <= 4 ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
                      />
                    ))}
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">From 2,543 reviews</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="customers" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-auto">
            <TabsTrigger value="customers">Top Customers</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* Top Customers */}
          <TabsContent value="customers" className="space-y-4">
            <Card>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <CardTitle>Top Customers</CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                      <Input
                        placeholder="Search customers..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-9 w-full sm:w-64"
                      />
                    </div>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-2" />
                      Filter
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map((customer) => (
                    <div key={customer.id}>
                      <div className="flex items-start gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={customer.avatar} alt={customer.name} />
                          <AvatarFallback>{customer.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-medium">{customer.name}</p>
                            {customer.status === 'vip' && (
                              <Badge variant="secondary" className="text-xs">VIP</Badge>
                            )}
                          </div>
                          <div className="space-y-1 text-sm text-muted-foreground">
                            <div className="flex items-center gap-4 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {customer.email}
                              </span>
                              {customer.phone && (
                                <span className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {customer.phone}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-sm">
                            <span>
                              <span className="font-medium text-foreground">{customer.totalOrders}</span> orders
                            </span>
                            <span>
                              <span className="font-medium text-foreground">${customer.totalSpent.toLocaleString()}</span> total spent
                            </span>
                            <span className="text-muted-foreground">Last order: {customer.lastOrder}</span>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>View Profile</DropdownMenuItem>
                            <DropdownMenuItem>View Orders</DropdownMenuItem>
                            <DropdownMenuItem>Send Message</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      {topCustomers.indexOf(customer) < topCustomers.length - 1 && (
                        <Separator className="mt-4" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Reviews */}
          <TabsContent value="reviews" className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-3">
              {/* Rating Distribution */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle>Rating Distribution</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {ratingDistribution.map((rating) => (
                    <div key={rating.stars} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                          <span className="font-medium">{rating.stars}</span>
                        </div>
                        <span className="text-muted-foreground">{rating.count}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <Progress value={rating.percentage} className="flex-1" />
                        <span className="text-xs text-muted-foreground w-12 text-right">
                          {rating.percentage}%
                        </span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Recent Reviews */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Recent Reviews</CardTitle>
                    <Button variant="outline" size="sm">View All</Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {recentReviews.map((review) => (
                      <div key={review.id}>
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.avatar} alt={review.customer} />
                            <AvatarFallback>{review.customer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <div>
                                <p className="font-medium text-sm">{review.customer}</p>
                                <p className="text-xs text-muted-foreground">{review.product}</p>
                              </div>
                              <span className="text-xs text-muted-foreground">{review.date}</span>
                            </div>
                            <div className="flex mb-2">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                  key={star}
                                  className={`w-3 h-3 ${
                                    star <= review.rating
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-muted-foreground/30'
                                  }`}
                                />
                              ))}
                            </div>
                            <p className="text-sm text-muted-foreground">{review.comment}</p>
                            <div className="flex items-center gap-4 mt-3">
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                Helpful ({review.helpful})
                              </Button>
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                <MessageSquare className="w-3 h-3 mr-1" />
                                Reply
                              </Button>
                            </div>
                          </div>
                        </div>
                        {recentReviews.indexOf(review) < recentReviews.length - 1 && (
                          <Separator className="mt-6" />
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights */}
          <TabsContent value="insights" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Segments</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {customerSegments.map((segment) => (
                    <div key={segment.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{segment.name}</p>
                        <Badge variant="outline">{segment.count} customers</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Total value: ${segment.value.toLocaleString()}
                      </p>
                      <Progress value={(segment.count / stats.totalCustomers) * 100} />
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Customer Satisfaction</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Your customer satisfaction score is excellent! Keep up the great work.
                    </AlertDescription>
                  </Alert>
                  
                  <div className="space-y-4 mt-4">
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                      <div>
                        <p className="text-sm text-muted-foreground">Response Time</p>
                        <p className="text-xl font-semibold">2.3 hrs</p>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">Excellent</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                      <div>
                        <p className="text-sm text-muted-foreground">Resolution Rate</p>
                        <p className="text-xl font-semibold">94.2%</p>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success">Great</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 border border-border rounded-xl">
                      <div>
                        <p className="text-sm text-muted-foreground">Customer Retention</p>
                        <p className="text-xl font-semibold">73.8%</p>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">Good</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </SellerLayout>
  );
}