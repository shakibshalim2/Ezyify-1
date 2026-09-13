import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  TrendingUp, Eye, Heart, MessageCircle, ShoppingBag, DollarSign,
  Users, Video, Calendar, ArrowUpRight, Target, Sparkles, Repeat2
} from 'lucide-react';
import { ReferralService } from '../../services/referral';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';

// Skeleton Component
function CreatorDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header Skeleton */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div className="flex-1">
            <Skeleton className="h-9 w-64 mb-2" />
            <Skeleton className="h-5 w-80" />
          </div>
          <div className="flex gap-3">
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-10 w-32" />
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <Skeleton className="w-8 h-8 rounded-xl" />
                  <Skeleton className="w-16 h-5 rounded-full" />
                </div>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-7 w-32" />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content Skeleton */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-24 rounded-xl" />
                  ))}
                </div>
                <Skeleton className="h-64 rounded-xl" />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-48" />
              </CardHeader>
              <CardContent className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-32 rounded-xl" />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Skeleton */}
          <div className="space-y-6">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardHeader>
                  <Skeleton className="h-6 w-32" />
                </CardHeader>
                <CardContent className="space-y-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreatorDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7d');
  const navigate = useNavigate();

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Mock data
  const stats = {
    totalEarnings: 456.00,
    thisMonthEarnings: 124.50,
    totalViews: 256000,
    totalFollowers: 23400,
    engagementRate: 8.5,
    totalPosts: 128,
    totalCommissions: 85.00,
    pendingPayouts: 23.00
  };

  const recentPosts = [
    {
      id: '1',
      image: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=300',
      views: 12500,
      likes: 1230,
      comments: 145,
      sales: 23,
      earnings: 11.50
    },
    {
      id: '2',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300',
      views: 9800,
      likes: 890,
      comments: 67,
      sales: 18,
      earnings: 9.20
    },
    {
      id: '3',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=300',
      views: 15200,
      likes: 1450,
      comments: 189,
      sales: 31,
      earnings: 15.80
    }
  ];

  const topProducts = [
    {
      id: '1',
      name: 'Premium Wireless Headphones',
      image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
      sales: 45,
      commission: 22.50,
      conversionRate: 5.2
    },
    {
      id: '2',
      name: 'Smart Watch Pro',
      image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
      sales: 38,
      commission: 38.00,
      conversionRate: 4.8
    },
    {
      id: '3',
      name: 'Wireless Earbuds',
      image: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=100',
      sales: 52,
      commission: 15.60,
      conversionRate: 6.1
    }
  ];

  // Show skeleton while loading
  if (isLoading) {
    return <CreatorDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Creator Dashboard — Ezyify" description="Track your content performance, earnings, and analytics on Ezyify." />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-semibold text-foreground">Creator Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Track your performance and earnings</p>
          </div>
          <div className="flex gap-3">
            <Link to="/upload">
              <Button>
                <Sparkles className="w-4 h-4 mr-2" />
                Create Content
              </Button>
            </Link>
            <Link to="/live-schedule">
              <Button variant="outline">
                <Video className="w-4 h-4 mr-2" />
                Go Live
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
          {[
            { icon: DollarSign, label: 'Total Earnings', value: `$${stats.totalEarnings.toLocaleString()}`, trend: '+12.5%', accent: 'bg-success/10 text-success' },
            { icon: Eye, label: 'Total Views', value: `${(stats.totalViews / 1000).toFixed(1)}K`, trend: '+8.3%', accent: 'bg-primary/10 text-primary' },
            { icon: Users, label: 'Followers', value: `${(stats.totalFollowers / 1000).toFixed(1)}K`, trend: '+15.2%', accent: 'bg-info/10 text-info' },
            { icon: Target, label: 'Engagement Rate', value: `${stats.engagementRate}%`, trend: '+2.1%', accent: 'bg-warning/10 text-warning' },
          ].map(({ icon: Icon, label, value, trend, accent }) => (
            <Card key={label}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <Badge variant="success" className="text-[10px] px-1.5">{trend}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                <p className="text-xl font-bold text-foreground tracking-tight">{value}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Earnings Overview */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Earnings Overview</CardTitle>
                  <select
                    value={dateRange}
                    onChange={(e) => setDateRange(e.target.value)}
                    className="text-sm border border-border rounded-xl px-3 py-1.5 bg-input-background outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-4 mb-6">
                  <div className="p-4 bg-accent rounded-2xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">This Month</p>
                    <p className="text-2xl font-bold text-foreground">${stats.thisMonthEarnings.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-accent rounded-2xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Commissions</p>
                    <p className="text-2xl font-bold text-foreground">${stats.totalCommissions.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-accent rounded-2xl border border-border">
                    <p className="text-sm text-muted-foreground mb-1">Pending</p>
                    <p className="text-2xl font-bold text-foreground">${stats.pendingPayouts.toLocaleString()}</p>
                  </div>
                </div>

                {/* Chart placeholder */}
                <div className="h-64 bg-muted/50 rounded-xl flex items-center justify-center border border-border">
                  <p className="text-muted-foreground">Earnings Chart</p>
                </div>
              </CardContent>
            </Card>

            {/* Top Performing Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Top Performing Posts</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentPosts.map((post) => (
                    <div
                      key={post.id}
                      className="flex gap-4 p-4 bg-muted rounded-xl hover:bg-accent transition-colors"
                    >
                      <img
                      loading="lazy"
                        src={post.image}
                        alt="Post"
                        className="w-24 h-24 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                          <div>
                            <p className="text-xs text-muted-foreground">Views</p>
                            <p className="font-medium text-foreground">{(post.views / 1000).toFixed(1)}K</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Likes</p>
                            <p className="font-medium text-foreground">{post.likes}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Sales</p>
                            <p className="font-medium text-foreground">{post.sales}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Earned</p>
                            <p className="font-medium text-primary">${post.earnings}</p>
                          </div>
                        </div>
                        <Button size="sm" variant="outline" onClick={() => navigate(`/post/${post.id}`)}>
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link to="/upload">
                  <Button variant="outline" className="w-full justify-start">
                    <Sparkles className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </Link>
                <Link to="/live-schedule">
                  <Button variant="outline" className="w-full justify-start">
                    <Video className="w-4 h-4 mr-2" />
                    Schedule Live
                  </Button>
                </Link>
                <Link to="/affiliate-manager">
                  <Button variant="outline" className="w-full justify-start">
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Manage Products
                  </Button>
                </Link>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate('/wallet')}>
                  <DollarSign className="w-4 h-4 mr-2" />
                  Request Payout
                </Button>
              </CardContent>
            </Card>

            {/* Top Products */}
            <Card>
              <CardHeader>
                <CardTitle>Top Products</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {topProducts.map((product, index) => (
                    <div key={product.id} className="flex gap-3 items-start">
                      <div className="w-8 h-8 rounded-full bg-accent text-foreground flex items-center justify-center flex-shrink-0 text-sm font-bold">
                        {index + 1}
                      </div>
                      <img
                      loading="lazy"
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground line-clamp-1">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{product.sales} sales</p>
                        <p className="text-sm font-medium text-primary">
                          ${product.commission}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <Link to="/affiliate-manager">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View All Products
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Referral Performance */}
            {(() => {
              const earnings = ReferralService.getEarningsSummary();
              const totalEarned = earnings.pendingAmount + earnings.confirmedAmount + earnings.paidAmount;
              return (
                <Card>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Repeat2 className="w-3.5 h-3.5 text-emerald-600" />
                      </div>
                      <CardTitle>Referral Performance</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div className="bg-muted/60 rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Total Earned</p>
                        <p className="font-bold text-foreground">${totalEarned.toFixed(2)}</p>
                      </div>
                      <div className="bg-muted/60 rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Pending</p>
                        <p className="font-bold text-warning">${earnings.pendingAmount.toFixed(2)}</p>
                      </div>
                      <div className="bg-muted/60 rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Clicks</p>
                        <p className="font-bold text-foreground">{earnings.totalClicks}</p>
                      </div>
                      <div className="bg-muted/60 rounded-xl p-3">
                        <p className="text-[10px] text-muted-foreground mb-0.5">Referred Sales</p>
                        <p className="font-bold text-foreground">{earnings.totalSales}</p>
                      </div>
                    </div>
                    <Link to="/wallet">
                      <Button variant="outline" size="sm" className="w-full">
                        <DollarSign className="w-3.5 h-3.5 mr-1.5" />
                        View Earnings
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })()}

            {/* Growth Tips */}
            <Card className="bg-accent border-border">
              <CardHeader>
                <CardTitle>💡 Growth Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="text-sm space-y-2 text-foreground">
                  <li>• Post consistently (3-5 times/week)</li>
                  <li>• Use trending hashtags</li>
                  <li>• Tag relevant products</li>
                  <li>• Engage with your audience</li>
                  <li>• Go live regularly</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}