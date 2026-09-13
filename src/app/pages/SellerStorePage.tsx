import { SEO } from '../components/SEO';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router';
import { mockProducts } from '../data/enhanced-mock-data';
import { 
  Star, 
  ArrowLeft, 
  UserPlus, 
  Check,
  MapPin,
  Package,
  TrendingUp,
  Shield,
  Clock,
  Grid3x3,
  List,
  Share2,
  Heart,
  CheckCircle2,
  Award,
  Truck,
  BadgeCheck,
  Filter,
  SlidersHorizontal,
  ChevronDown,
  Search,
  Phone,
  Mail,
  Globe,
  MoreVertical,
  Flag,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  Info,
  FileText,
  MapPinned,
  Store as StoreIcon,
  Users,
  Target,
  Calendar,
  ChevronRight,
  Layers
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Separator } from '../components/ui/separator';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../components/ui/dropdown-menu';
import { Progress } from '../components/ui/progress';
import { ScrollArea, ScrollBar } from '../components/ui/scroll-area';
import { Skeleton } from '../components/ui/skeleton';

// SKELETON FOR INSTANT UI
function SellerStoreSkeleton() {
  return (<div className="min-h-screen bg-background">
      {/* Cover Image Skeleton */}
      <div className="relative">
        <Skeleton className="w-full h-48 sm:h-64 md:h-80" />
        {/* Back Button */}
        <div className="absolute top-4 left-4">
          <Skeleton className="w-10 h-10 rounded-full" />
        </div>
      </div>

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Store Header Skeleton */}
        <div className="relative -mt-16 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-end gap-4">
            <Skeleton className="w-32 h-32 rounded-xl border-4 border-background" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-32 rounded-md" />
          </div>
        </div>

        {/* Tabs Skeleton */}
        <Skeleton className="h-12 w-full mb-6" />

        {/* Products Grid Skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-8 w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SellerStorePage() {
  const { storeName } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isFollowing, setIsFollowing] = useState(false);
  const [selectedTab, setSelectedTab] = useState('products');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => setIsLoading(false), { timeout: 150 });
      return () => cancelIdleCallback(handle);
    } else {
      const t = setTimeout(() => setIsLoading(false), 50);
      return () => clearTimeout(t);
    }
  }, []);

  if (isLoading) return <SellerStoreSkeleton />;

  // Mock seller data - enhanced with complete information
  const seller = {
    name: 'TechHub Store',
    username: 'techhub_official',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200',
    cover: 'https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=1200',
    rating: 4.8,
    totalReviews: 2543,
    totalProducts: 156,
    totalSales: 12400,
    followers: 45600,
    verified: true,
    sellerBadge: 'Top Rated',
    joinedDate: 'Jan 2024',
    responseRate: '< 1 hour',
    responseScore: 98,
    location: 'San Francisco, USA',
    description: 'Premium electronics and gadgets. Official reseller of top brands with genuine warranty. Fast shipping worldwide.',
    detailedDescription: 'We are a leading electronics retailer with over 10,000 satisfied customers. We specialize in authentic tech products from global brands including smartphones, laptops, accessories, and smart home devices. All our products come with official warranty and our customer service team is available 24/7 to assist you.',
    achievements: ['Top Seller', 'Fast Shipper', '1000+ Sales'],
    policies: {
      returns: '7-day easy returns',
      warranty: '1-year warranty',
      shipping: 'Free shipping on orders over $100'
    },
    contact: {
      phone: '+1 (888) 234-5678',
      email: 'support@techhub.com',
      website: 'www.techhub.com'
    },
    businessHours: 'Mon-Sat: 9:00 AM - 9:00 PM | Sun: 10:00 AM - 6:00 PM',
    status: 'active', // active, unavailable, busy
    categories: ['Electronics', 'Mobile Phones', 'Computers', 'Accessories']
  };

  // Mock reviews data
  const reviews = [
    {
      id: 1,
      user: 'Rahul Ahmed',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      rating: 5,
      date: '2 days ago',
      comment: 'Excellent seller! Product quality is top-notch and delivery was super fast. Highly recommended for electronics.',
      verified: true,
      helpful: 45,
      images: []
    },
    {
      id: 2,
      user: 'Ayesha Khan',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      rating: 5,
      date: '5 days ago',
      comment: 'Very professional seller. Got genuine product with proper warranty. Customer service is excellent!',
      verified: true,
      helpful: 32,
      images: []
    },
    {
      id: 3,
      user: 'Kabir Hassan',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      rating: 4,
      date: '1 week ago',
      comment: 'Good experience overall. Product was as described. Only minor delay in shipping but seller kept me updated.',
      verified: true,
      helpful: 18,
      images: []
    },
    {
      id: 4,
      user: 'Nusrat Jahan',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      rating: 5,
      date: '1 week ago',
      comment: 'Amazing store! This is my third purchase from TechHub. Always satisfied with the quality and service.',
      verified: true,
      helpful: 28,
      images: []
    },
    {
      id: 5,
      user: 'Tanvir Islam',
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
      rating: 5,
      date: '2 weeks ago',
      comment: 'Best tech seller online! Authentic products, competitive prices, and excellent after-sales support.',
      verified: true,
      helpful: 52,
      images: []
    }
  ];

  // Rating breakdown
  const ratingBreakdown = [
    { stars: 5, count: 2100, percentage: 83 },
    { stars: 4, count: 320, percentage: 13 },
    { stars: 3, count: 80, percentage: 3 },
    { stars: 2, count: 28, percentage: 1 },
    { stars: 1, count: 15, percentage: 0 }
  ];

  // Store Categories with product counts
  const storeCategories = [
    { id: 'all', name: 'All Products', count: 156, icon: Layers },
    { id: 'smartphones', name: 'Smartphones', count: 45, icon: Package },
    { id: 'laptops', name: 'Laptops & Computers', count: 32, icon: Package },
    { id: 'tablets', name: 'Tablets', count: 18, icon: Package },
    { id: 'accessories', name: 'Accessories', count: 28, icon: Package },
    { id: 'audio', name: 'Audio & Headphones', count: 15, icon: Package },
    { id: 'smartwatch', name: 'Smartwatches', count: 12, icon: Package },
    { id: 'gaming', name: 'Gaming', count: 6, icon: Package }
  ];

  const products = mockProducts.slice(0, 12);
  const hasProducts = products.length > 0;

  // Filter products by category and search
  let filteredProducts = products;

  // Filter by category
  if (selectedCategory !== 'all') {
    // In a real app, products would have category fields
    // For demo, we'll show all products regardless of selected category
    filteredProducts = products;
  }

  // Filter by search query
  if (searchQuery) {
    filteredProducts = filteredProducts.filter(p => 
      p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Get product count for selected category
  const selectedCategoryData = storeCategories.find(c => c.id === selectedCategory);
  const displayCount = selectedCategory === 'all' ? seller.totalProducts : selectedCategoryData?.count || 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Store — Ezyify" description="Shop from verified seller stores on the Ezyify E-Commerce Social Media Ecosystem." />
      <div className="max-w-screen-2xl mx-auto">
        {/* Store Header - Enhanced */}
        <div className="relative">
          {/* Cover Image */}
          <div className="h-48 md:h-64 overflow-hidden" style={{ background: 'var(--brand-gradient)' }}>
            <img
                      loading="lazy"
              src={seller.cover}
              alt={seller.name}
              className="w-full h-full object-cover opacity-90"
            />
            
            {/* Back Button */}
            <div className="absolute top-4 left-4">
              <Link to="/">
                <Button variant="secondary" size="sm" className="shadow-lg">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              </Link>
            </div>

            {/* Store Status Badge */}
            <div className="absolute top-4 right-4">
              {seller.status === 'active' && (
                <Badge variant="success" className="shadow-lg gap-1.5">
                  <span className="w-1.5 h-1.5 bg-success rounded-full live-badge" />
                  Store Active
                </Badge>
              )}
              {seller.status === 'unavailable' && (
                <Badge className="bg-error text-error-foreground shadow-lg">
                  Store Unavailable
                </Badge>
              )}
            </div>
          </div>

          {/* Floating Store Card */}
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="-mt-16 md:-mt-20">
              <Card className="shadow-xl">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Store Avatar with Verification */}
                    <div className="relative flex-shrink-0">
                      <Avatar className="w-24 h-24 md:w-32 md:h-32 border-4 border-background rounded-xl">
                        <AvatarImage src={seller.avatar} alt={seller.name} />
                        <AvatarFallback className="rounded-xl">{seller.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      {seller.verified && (
                        <div className="absolute -bottom-1 -right-1">
                          <VerifiedBadge variant="seller" size="xl" />
                        </div>
                      )}
                    </div>

                    {/* Store Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h1 className="text-2xl md:text-3xl font-bold text-card-foreground truncate">{seller.name}</h1>
                            {seller.verified && (
                              <Badge className="bg-primary text-primary-foreground border-0">
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Verified Seller
                              </Badge>
                            )}
                          </div>
                          <p className="text-muted-foreground mb-2">@{seller.username}</p>
                          
                          {/* Seller Achievements */}
                          <div className="flex items-center gap-2 flex-wrap mb-3">
                            {seller.achievements.map((achievement) => (
                              <Badge key={achievement} variant="secondary" className="text-sm border-0">
                                <Award className="w-3 h-3 mr-1" />
                                {achievement}
                              </Badge>
                            ))}
                          </div>

                          <p className="text-sm text-card-foreground mb-3 max-w-2xl">{seller.description}</p>

                          {/* Location & Joined */}
                          <div className="flex items-center gap-4 text-sm text-card-foreground flex-wrap">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4 text-muted-foreground" />
                              <span>{seller.location}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4 text-muted-foreground" />
                              <span>Joined {seller.joinedDate}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Users className="w-4 h-4 text-muted-foreground" />
                              <span>{(seller.followers / 1000).toFixed(1)}K followers</span>
                            </div>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex sm:flex-col gap-2 flex-shrink-0">
                          <Button
                            onClick={() => setIsFollowing(!isFollowing)}
                            variant={isFollowing ? 'secondary' : 'default'}
                            size="lg"
                            className="border-0"
                          >
                            {isFollowing ? (
                              <>
                                <Check className="w-4 h-4 mr-2" />
                                Following
                              </>
                            ) : (
                              <>
                                <UserPlus className="w-4 h-4 mr-2" />
                                Follow
                              </>
                            )}
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="outline" size="lg" className="border-border">
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Share2 className="w-4 h-4 mr-2" />
                                Share Store
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Flag className="w-4 h-4 mr-2" />
                                Report Store
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>

                      {/* Store Stats - Enhanced */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                        <div className="bg-muted/50 p-3 rounded-xl">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-4 h-4 fill-primary text-primary" />
                            <span className="font-semibold">{seller.rating}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">{seller.totalReviews.toLocaleString()} reviews</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-xl">
                          <p className="font-semibold text-lg mb-1">{seller.totalProducts}</p>
                          <p className="text-xs text-muted-foreground">Products</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-xl">
                          <p className="font-semibold text-lg mb-1">{(seller.totalSales / 1000).toFixed(1)}K</p>
                          <p className="text-xs text-muted-foreground">Total Sales</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-xl">
                          <div className="flex items-center gap-1 mb-1">
                            <Clock className="w-3 h-3 text-primary" />
                            <span className="font-semibold text-primary">{seller.responseRate}</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Response time</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-xl">
                          <div className="flex items-center gap-1 mb-1">
                            <Shield className="w-3 h-3 text-primary" />
                            <span className="font-semibold text-primary">{seller.responseScore}%</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Response rate</p>
                        </div>
                        <div className="bg-muted/50 p-3 rounded-xl">
                          <div className="flex items-center gap-1 mb-1">
                            <Truck className="w-3 h-3 text-primary" />
                            <span className="font-semibold text-primary">Fast</span>
                          </div>
                          <p className="text-xs text-muted-foreground">Shipping</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Store Policies - Trust Building */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
          <div className="grid sm:grid-cols-3 gap-3">
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="p-2 bg-muted rounded-xl">
                <CheckCircle2 className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{seller.policies.returns}</p>
                <p className="text-xs text-muted-foreground">Return policy</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="p-2 bg-muted rounded-xl">
                <Shield className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{seller.policies.warranty}</p>
                <p className="text-xs text-muted-foreground">Warranty included</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
              <div className="p-2 bg-muted rounded-xl">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-sm">{seller.policies.shipping}</p>
                <p className="text-xs text-muted-foreground">Shipping benefit</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="products">
                <Package className="w-4 h-4 mr-2" />
                Products ({seller.totalProducts})
              </TabsTrigger>
              <TabsTrigger value="reviews">
                <Star className="w-4 h-4 mr-2" />
                Reviews ({seller.totalReviews.toLocaleString()})
              </TabsTrigger>
              <TabsTrigger value="about">
                <Info className="w-4 h-4 mr-2" />
                About
              </TabsTrigger>
            </TabsList>

            {/* Products Tab */}
            <TabsContent value="products" className="space-y-6">
              {/* Category Navigation - Horizontal Scrollable */}
              <div className="relative">
                <ScrollArea className="w-full whitespace-nowrap">
                  <div className="flex gap-2 pb-4">
                    {storeCategories.map((category) => {
                      const Icon = category.icon;
                      const isActive = selectedCategory === category.id;
                      
                      return (
                        <Button
                          key={category.id}
                          variant={isActive ? 'default' : 'outline'}
                          size="sm"
                          onClick={() => {
                            setSelectedCategory(category.id);
                            setSearchQuery(''); // Clear search when changing category
                          }}
                          className={`flex-shrink-0 ${
                            isActive 
                              ? 'shadow-sm' 
                              : 'hover:bg-muted/50'
                          }`}
                        >
                          <Icon className="w-4 h-4 mr-2" />
                          <span>{category.name}</span>
                          <Badge 
                            variant="secondary" 
                            className={`ml-2 ${
                              isActive 
                                ? 'bg-primary-foreground/20' 
                                : 'bg-muted'
                            }`}
                          >
                            {category.count}
                          </Badge>
                        </Button>
                      );
                    })}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>

              {/* Active Category Indicator */}
              {selectedCategory !== 'all' && (
                <div className="flex items-center justify-between bg-muted/50 p-4 rounded-xl">
                  <div className="flex items-center gap-2">
                    <Layers className="w-5 h-5 text-primary" />
                    <div>
                      <p className="font-medium">{selectedCategoryData?.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {displayCount} {displayCount === 1 ? 'product' : 'products'} in this category
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory('all')}
                  >
                    View All Products
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              )}

              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products in this store..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="popular">Most Popular</SelectItem>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="price-low">Price: Low to High</SelectItem>
                      <SelectItem value="price-high">Price: High to Low</SelectItem>
                      <SelectItem value="rating">Highest Rated</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid3x3 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Products Display */}
              {filteredProducts.length > 0 ? (
                viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="group"
                      >
                        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full">
                          <div className="relative aspect-square bg-muted overflow-hidden">
                            <img
                      loading="lazy"
                              src={product.image}
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                            {product.badge && (
                              <Badge className="absolute top-2 left-2 bg-error text-error-foreground text-xs">
                                {product.badge}
                              </Badge>
                            )}
                            <Button
                              variant="secondary"
                              size="sm"
                              className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                              }}
                            >
                              <Heart className="w-4 h-4" />
                            </Button>
                          </div>
                          <CardContent className="p-4">
                            <h3 className="font-medium mb-2 line-clamp-2 text-sm leading-snug">{product.name}</h3>
                            <div className="flex items-baseline gap-2 mb-2">
                              <span className="text-lg font-semibold text-primary">${product.price.toLocaleString()}</span>
                              {product.originalPrice && (
                                <span className="text-xs text-muted-foreground line-through">
                                  ${product.originalPrice.toLocaleString()}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1 text-xs text-muted-foreground">
                              <Star className="w-3 h-3 fill-primary text-primary" />
                              <span className="font-medium">{product.rating}</span>
                              <span>({product.reviews})</span>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProducts.map((product) => (
                      <Link
                        key={product.id}
                        to={`/product/${product.id}`}
                        className="group"
                      >
                        <Card className="hover:shadow-lg transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl overflow-hidden flex-shrink-0 bg-muted relative">
                                <img
                      loading="lazy"
                                  src={product.image}
                                  alt={product.name}
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                />
                                {product.badge && (
                                  <Badge className="absolute top-2 left-2 bg-error text-error-foreground text-xs">
                                    {product.badge}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className="font-medium mb-2 line-clamp-2">{product.name}</h3>
                                <div className="flex items-baseline gap-2 mb-2">
                                  <span className="text-2xl font-semibold text-primary">
                                    ${product.price.toLocaleString()}
                                  </span>
                                  {product.originalPrice && (
                                    <span className="text-sm text-muted-foreground line-through">
                                      ${product.originalPrice.toLocaleString()}
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
                                  <Star className="w-4 h-4 fill-primary text-primary" />
                                  <span className="font-medium">{product.rating}</span>
                                  <span>({product.reviews} reviews)</span>
                                </div>
                                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Package className="w-3 h-3" />
                                    <span>In Stock</span>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Truck className="w-3 h-3" />
                                    <span>Fast Delivery</span>
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                  }}
                                >
                                  <Heart className="w-4 h-4 mr-2" />
                                  Save
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Link>
                    ))}
                  </div>
                )
              ) : (
                // Empty State
                <Card className="border-dashed">
                  <CardContent className="flex flex-col items-center justify-center py-16 px-4">
                    <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
                      <Package className="w-12 h-12 text-muted-foreground" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No products found</h3>
                    <p className="text-muted-foreground text-center max-w-md mb-6">
                      {searchQuery 
                        ? `No products match "${searchQuery}". Try a different search term.`
                        : 'This store currently has no products listed. Check back later!'
                      }
                    </p>
                    {searchQuery && (
                      <Button onClick={() => setSearchQuery('')} variant="outline">
                        Clear Search
                      </Button>
                    )}
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Reviews Tab */}
            <TabsContent value="reviews" className="space-y-6">
              {/* Reviews Summary */}
              <Card>
                <CardContent className="p-6">
                  <div className="grid md:grid-cols-2 gap-8">
                    {/* Overall Rating */}
                    <div className="flex flex-col items-center justify-center text-center">
                      <div className="text-6xl font-bold mb-2">{seller.rating}</div>
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-6 h-6 ${
                              star <= Math.floor(seller.rating)
                                ? 'fill-primary text-primary'
                                : 'text-muted-foreground'
                            }`}
                          />
                        ))}
                      </div>
                      <p className="text-muted-foreground">
                        Based on {seller.totalReviews.toLocaleString()} reviews
                      </p>
                    </div>

                    {/* Rating Breakdown */}
                    <div className="space-y-3">
                      {ratingBreakdown.map((item) => (
                        <div key={item.stars} className="flex items-center gap-3">
                          <div className="flex items-center gap-1 w-12">
                            <span className="text-sm font-medium">{item.stars}</span>
                            <Star className="w-3 h-3 fill-primary text-primary" />
                          </div>
                          <Progress value={item.percentage} className="flex-1 h-2" />
                          <span className="text-sm text-muted-foreground w-12 text-right">
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Individual Reviews */}
              <div className="space-y-4">
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex gap-4">
                        <Avatar className="w-12 h-12">
                          <AvatarImage src={review.avatar} alt={review.user} />
                          <AvatarFallback>{review.user.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="font-semibold">{review.user}</h4>
                                {review.verified && (
                                  <Badge variant="outline" className="bg-accent text-foreground border-border">
                                    <CheckCircle2 className="w-3 h-3 mr-1" />
                                    Verified Purchase
                                  </Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((i) => (
                                    <Star
                                      key={i}
                                      className={`w-3 h-3 ${
                                        i <= Math.floor(review.rating)
                                          ? 'fill-primary text-primary'
                                          : 'text-muted-foreground'
                                      }`}
                                    />
                                  ))}
                                </div>
                                <span className="text-sm text-muted-foreground">{review.date}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm mb-4 leading-relaxed">{review.comment}</p>
                          <div className="flex items-center gap-4">
                            <Button variant="ghost" size="sm">
                              <ThumbsUp className="w-4 h-4 mr-2" />
                              Helpful ({review.helpful})
                            </Button>
                            <Button variant="ghost" size="sm">
                              <ThumbsDown className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Load More */}
              <div className="flex justify-center">
                <Button variant="outline" size="lg">
                  Load More Reviews
                </Button>
              </div>
            </TabsContent>

            {/* About Tab */}
            <TabsContent value="about" className="space-y-6">
              {/* Store Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About {seller.name}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm leading-relaxed">{seller.detailedDescription}</p>
                  
                  <Separator />

                  {/* Categories */}
                  <div>
                    <h4 className="font-semibold mb-3">Product Categories</h4>
                    <div className="flex flex-wrap gap-2">
                      {seller.categories.map((category) => (
                        <Badge key={category} variant="outline">
                          {category}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Location */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPinned className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold">Location</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{seller.location}</p>
                  </div>

                  <Separator />

                  {/* Business Hours */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <h4 className="font-semibold">Business Hours</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{seller.businessHours}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Policies */}
              <Card>
                <CardHeader>
                  <CardTitle>Store Policies</CardTitle>
                  <CardDescription>Return, shipping, and warranty information</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent rounded-2xl mt-0.5">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Returns & Refunds</h4>
                        <p className="text-sm text-muted-foreground">
                          {seller.policies.returns}. Items must be unused and in original packaging. 
                          Contact us within 7 days of delivery to initiate a return.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent rounded-2xl mt-0.5">
                        <Shield className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Warranty</h4>
                        <p className="text-sm text-muted-foreground">
                          {seller.policies.warranty} on all products. Official manufacturer warranty with full service center support worldwide.
                        </p>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-accent rounded-2xl mt-0.5">
                        <Truck className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold mb-1">Shipping</h4>
                        <p className="text-sm text-muted-foreground">
                          {seller.policies.shipping}. We ship to all major cities within 2-3 business days. 
                          Express delivery available for urgent orders.
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Trust & Safety */}
              <Card>
                <CardHeader>
                  <CardTitle>Trust & Safety</CardTitle>
                  <CardDescription>Why shop with confidence</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="flex items-start gap-3">
                      <BadgeCheck className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Verified Seller</h4>
                        <p className="text-xs text-muted-foreground">
                          Identity and business verified by Ezyify
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Shield className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Buyer Protection</h4>
                        <p className="text-xs text-muted-foreground">
                          Your purchase is protected by our guarantee
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Award className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Top Rated</h4>
                        <p className="text-xs text-muted-foreground">
                          Consistently high ratings from customers
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <Clock className="w-5 h-5 text-primary mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-sm mb-1">Quick Response</h4>
                        <p className="text-xs text-muted-foreground">
                          Average response time under 1 hour
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}