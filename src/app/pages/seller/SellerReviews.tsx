import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Star,
  MessageSquare,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Progress } from '../../components/ui/progress';
import { Separator } from '../../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '../../components/ui/dropdown-menu';
import { Skeleton } from '../../components/ui/skeleton';
import { SellerLayout } from '../../components/SellerLayout';

export default function SellerReviews() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRating, setFilterRating] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');

  // PROGRESSIVE LOADING: Load reviews data after initial render
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
    overallRating: 4.8,
    totalReviews: 2543,
    ratingChange: 0.3,
    responseRate: 94.2,
    avgResponseTime: '2.3 hrs',
    newReviews: 28
  };

  const ratingDistribution = [
    { stars: 5, count: 1543, percentage: 60.7 },
    { stars: 4, count: 685, percentage: 26.9 },
    { stars: 3, count: 203, percentage: 8.0 },
    { stars: 2, count: 76, percentage: 3.0 },
    { stars: 1, count: 36, percentage: 1.4 }
  ];

  const reviews = [
    {
      id: '1',
      customer: 'Sarah Ahmed',
      avatar: 'https://i.pravatar.cc/150?img=1',
      product: 'Premium Wireless Headphones',
      productImage: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=100',
      rating: 5,
      date: '2 hours ago',
      verified: true,
      comment: 'Excellent product! Sound quality is amazing and delivery was super fast. The seller was very responsive to my questions. Highly recommend!',
      helpful: 12,
      replied: false,
      status: 'new'
    },
    {
      id: '2',
      customer: 'John Doe',
      avatar: 'https://i.pravatar.cc/150?img=4',
      product: 'Smart Watch Pro',
      productImage: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=100',
      rating: 4,
      date: '5 hours ago',
      verified: true,
      comment: 'Good product overall. Battery life could be better but satisfied with the purchase. Packaging was excellent.',
      helpful: 8,
      replied: true,
      reply: 'Thank you for your feedback! We appreciate your review and will work on battery optimization in future versions.',
      replyDate: '3 hours ago',
      status: 'replied'
    },
    {
      id: '3',
      customer: 'Emma Wilson',
      avatar: 'https://i.pravatar.cc/150?img=5',
      product: 'Bluetooth Speaker',
      productImage: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=100',
      rating: 3,
      date: '1 day ago',
      verified: false,
      comment: 'Average quality. Expected better bass. Packaging was good though.',
      helpful: 3,
      replied: false,
      status: 'pending'
    },
    {
      id: '4',
      customer: 'David Chen',
      avatar: 'https://i.pravatar.cc/150?img=6',
      product: 'Laptop Stand',
      productImage: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=100',
      rating: 5,
      date: '2 days ago',
      verified: true,
      comment: 'Perfect! Exactly what I needed for my home office setup. Sturdy and well-designed.',
      helpful: 15,
      replied: true,
      reply: 'Thank you so much! We\'re thrilled you love it!',
      replyDate: '1 day ago',
      status: 'replied'
    },
    {
      id: '5',
      customer: 'Lisa Park',
      avatar: 'https://i.pravatar.cc/150?img=7',
      product: 'USB-C Hub',
      productImage: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=100',
      rating: 2,
      date: '3 days ago',
      verified: true,
      comment: 'Not working properly. Connection drops frequently. Disappointed.',
      helpful: 5,
      replied: true,
      reply: 'We\'re sorry to hear this. Please contact our support team for a replacement. We\'ll make this right!',
      replyDate: '2 days ago',
      status: 'resolved'
    }
  ];

  const handleReply = (_reviewId: string) => {
    if (replyText.trim()) {
      toast.success('Reply posted successfully.');
    }
    setReplyingTo(null);
    setReplyText('');
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'w-3 h-3',
      md: 'w-4 h-4',
      lg: 'w-5 h-5'
    };

    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating
                ? 'fill-amber-400 text-amber-400'
                : 'text-muted-foreground/30'
            }`}
          />
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <div className="grid gap-4 md:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <SellerLayout>
      <div className="max-w-screen-2xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 space-y-4 sm:space-y-6">
      <SEO title="Reviews — Ezyify Seller" description="View and respond to customer reviews for your Ezyify store." />
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4">
          <div>
            <h1 className="mb-1 text-xl sm:text-2xl">Product Reviews</h1>
            <p className="text-sm text-muted-foreground">Manage and respond to customer reviews</p>
          </div>
          {stats.newReviews > 0 && (
            <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20">
              {stats.newReviews} new reviews
            </Badge>
          )}
        </div>

        {/* Key Metrics */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-warning/10 rounded-xl">
                  <Star className="w-5 h-5 text-warning" />
                </div>
                <Badge variant="outline" className="bg-success/10 text-success border-success/20">
                  +{stats.ratingChange}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground">Overall Rating</p>
              <div className="flex items-center gap-2 mt-1">
                <p className="text-2xl font-semibold">{stats.overallRating}</p>
                {renderStars(Math.floor(stats.overallRating), 'sm')}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                From {stats.totalReviews.toLocaleString()} reviews
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-info/10 rounded-xl">
                  <MessageSquare className="w-5 h-5 text-info" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Response Rate</p>
              <p className="text-2xl font-semibold mt-1">{stats.responseRate}%</p>
              <Progress value={stats.responseRate} className="h-1.5 mt-2" />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <Clock className="w-5 h-5 text-primary" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Avg. Response Time</p>
              <p className="text-2xl font-semibold mt-1">{stats.avgResponseTime}</p>
              <Badge variant="outline" className="bg-success/10 text-success border-success/20 mt-2 text-xs">
                Excellent
              </Badge>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <div className="p-2 bg-success/10 rounded-xl">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-semibold mt-1">{stats.totalReviews.toLocaleString()}</p>
              <p className="text-xs text-success mt-1">
                +{stats.newReviews} this week
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Rating Distribution */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle>Rating Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {ratingDistribution.map((rating) => (
                <div key={rating.stars} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      {renderStars(rating.stars, 'sm')}
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

          {/* Reviews List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <CardTitle className="flex-1">Customer Reviews</CardTitle>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1 sm:flex-initial">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="Search reviews..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-9 w-full sm:w-64"
                    />
                  </div>
                  <Select value={filterRating} onValueChange={setFilterRating}>
                    <SelectTrigger className="w-32">
                      <Filter className="w-4 h-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Ratings</SelectItem>
                      <SelectItem value="5">5 Stars</SelectItem>
                      <SelectItem value="4">4 Stars</SelectItem>
                      <SelectItem value="3">3 Stars</SelectItem>
                      <SelectItem value="2">2 Stars</SelectItem>
                      <SelectItem value="1">1 Star</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all" className="space-y-4">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="all">All</TabsTrigger>
                  <TabsTrigger value="new">
                    New
                    <Badge variant="secondary" className="ml-2 text-xs">
                      {reviews.filter(r => r.status === 'new').length}
                    </Badge>
                  </TabsTrigger>
                  <TabsTrigger value="pending">Pending</TabsTrigger>
                  <TabsTrigger value="replied">Replied</TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="space-y-6 mt-6">
                  {reviews.map((review) => (
                    <div key={review.id}>
                      <div className="space-y-4">
                        {/* Review Header */}
                        <div className="flex items-start gap-3">
                          <Avatar className="w-10 h-10">
                            <AvatarImage src={review.avatar} alt={review.customer} />
                            <AvatarFallback>{review.customer.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <p className="font-medium text-sm">{review.customer}</p>
                                  {review.verified && (
                                    <Badge variant="outline" className="text-xs bg-success/10 text-success border-success/20">
                                      <CheckCircle2 className="w-3 h-3 mr-1" />
                                      Verified
                                    </Badge>
                                  )}
                                  {review.status === 'new' && (
                                    <Badge className="text-xs bg-info text-white">New</Badge>
                                  )}
                                </div>
                                <p className="text-xs text-muted-foreground">{review.date}</p>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                    <MoreVertical className="w-4 h-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem>View Product</DropdownMenuItem>
                                  <DropdownMenuItem>View Customer</DropdownMenuItem>
                                  <DropdownMenuItem className="text-destructive">Report Review</DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>

                            {/* Product Info */}
                            <div className="flex items-center gap-2 mb-2">
                              <img loading="lazy" 
                                src={review.productImage} 
                                alt={review.product}
                                className="w-10 h-10 rounded object-cover"
                              />
                              <p className="text-sm text-muted-foreground truncate">{review.product}</p>
                            </div>

                            {/* Rating */}
                            {renderStars(review.rating, 'sm')}

                            {/* Comment */}
                            <p className="text-sm text-muted-foreground mt-2">{review.comment}</p>

                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-3">
                              <Button variant="ghost" size="sm" className="h-8 text-xs">
                                <ThumbsUp className="w-3 h-3 mr-1" />
                                Helpful ({review.helpful})
                              </Button>
                              {!review.replied && (
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 text-xs"
                                  onClick={() => setReplyingTo(review.id)}
                                >
                                  <MessageSquare className="w-3 h-3 mr-1" />
                                  Reply
                                </Button>
                              )}
                            </div>

                            {/* Seller Reply */}
                            {review.replied && review.reply && (
                              <div className="mt-4 p-3 bg-muted rounded-2xl border-l-2 border-primary">
                                <div className="flex items-center gap-2 mb-2">
                                  <div className="w-6 h-6 rounded-full" style={{ background: "var(--brand-gradient)" }}>
                                    <span className="text-[10px] text-white font-medium">S</span>
                                  </div>
                                  <p className="text-xs font-medium">Seller Response</p>
                                  <span className="text-xs text-muted-foreground">• {review.replyDate}</span>
                                </div>
                                <p className="text-sm">{review.reply}</p>
                              </div>
                            )}

                            {/* Reply Form */}
                            {replyingTo === review.id && (
                              <div className="mt-4 space-y-3">
                                <Textarea
                                  placeholder="Write your response..."
                                  value={replyText}
                                  onChange={(e) => setReplyText(e.target.value)}
                                  rows={3}
                                />
                                <div className="flex items-center gap-2">
                                  <Button size="sm" onClick={() => handleReply(review.id)}>
                                    Send Reply
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => {
                                      setReplyingTo(null);
                                      setReplyText('');
                                    }}
                                  >
                                    Cancel
                                  </Button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      {reviews.indexOf(review) < reviews.length - 1 && (
                        <Separator className="mt-6" />
                      )}
                    </div>
                  ))}
                </TabsContent>

                <TabsContent value="new" className="space-y-6">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Filter view: New reviews only
                  </p>
                </TabsContent>

                <TabsContent value="pending" className="space-y-6">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Filter view: Pending responses
                  </p>
                </TabsContent>

                <TabsContent value="replied" className="space-y-6">
                  <p className="text-sm text-muted-foreground text-center py-8">
                    Filter view: Replied reviews
                  </p>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </SellerLayout>
  );
}