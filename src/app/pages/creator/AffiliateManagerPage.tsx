import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Search, Filter, TrendingUp, DollarSign, ShoppingBag, Star, ExternalLink } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { mockProducts } from '../../data/enhanced-mock-data';

// Skeleton Component
function AffiliateManagerSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-64 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Skeleton className="w-8 h-8 rounded-2xl" />
                  <div className="flex-1">
                    <Skeleton className="h-4 w-24 mb-1" />
                    <Skeleton className="h-7 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-80" />
        </div>

        {/* Search Skeleton */}
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-24" />
        </div>

        {/* Products List Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="flex gap-6">
                  <Skeleton className="w-24 h-24 rounded-2xl" />
                  <div className="flex-1 space-y-3">
                    <Skeleton className="h-6 w-64" />
                    <Skeleton className="h-5 w-32" />
                    <Skeleton className="h-20 rounded-2xl" />
                  </div>
                  <Skeleton className="w-32 h-10" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

interface AffiliateProduct {
  productId: string;
  clicks: number;
  sales: number;
  earnings: number;
  conversionRate: number;
  addedDate: string;
}

const mockAffiliateProducts = [
  {
    productId: mockProducts[0].id,
    clicks: 1250,
    sales: 45,
    earnings: 22.50,
    conversionRate: 3.6,
    addedDate: '2023-12-15'
  },
  {
    productId: mockProducts[1].id,
    clicks: 980,
    sales: 38,
    earnings: 38.00,
    conversionRate: 3.9,
    addedDate: '2023-12-20'
  },
  {
    productId: mockProducts[2].id,
    clicks: 1580,
    sales: 52,
    earnings: 15.60,
    conversionRate: 3.3,
    addedDate: '2024-01-01'
  }
];

export default function AffiliateManagerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [discoverQuery, setDiscoverQuery] = useState('');
  const [selectedTab, setSelectedTab] = useState('my-products');

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const totalEarnings = mockAffiliateProducts.reduce((sum, p) => sum + p.earnings, 0);
  const totalSales = mockAffiliateProducts.reduce((sum, p) => sum + p.sales, 0);
  const totalClicks = mockAffiliateProducts.reduce((sum, p) => sum + p.clicks, 0);
  const avgConversion = mockAffiliateProducts.reduce((sum, p) => sum + p.conversionRate, 0) / mockAffiliateProducts.length;

  const myProducts = mockAffiliateProducts.map(ap => ({
    ...mockProducts.find(p => p.id === ap.productId)!,
    ...ap
  })).filter(p => !searchQuery || p.name.toLowerCase().includes(searchQuery.toLowerCase()));

  const availableProducts = mockProducts.filter(
    p => !mockAffiliateProducts.find(ap => ap.productId === p.id)
  ).filter(p => !discoverQuery || p.name.toLowerCase().includes(discoverQuery.toLowerCase())).slice(0, 12);

  // Show skeleton while loading
  if (isLoading) {
    return <AffiliateManagerSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Affiliate Manager — Ezyify Creator" description="Manage your affiliate products and track commissions on Ezyify." />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Performance Dashboard</h1>
          <p className="text-muted-foreground">Track your shared product performance</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <DollarSign className="w-8 h-8 text-primary bg-accent p-2 rounded-2xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Earnings</p>
                  <p className="text-2xl font-bold">${totalEarnings.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <ShoppingBag className="w-8 h-8 text-primary bg-accent p-2 rounded-2xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Sales</p>
                  <p className="text-2xl font-bold">{totalSales}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8 text-primary bg-accent p-2 rounded-2xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Total Clicks</p>
                  <p className="text-2xl font-bold">{totalClicks.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Star className="w-8 h-8 text-warning bg-warning/10 p-2 rounded-2xl" />
                <div>
                  <p className="text-sm text-muted-foreground">Avg Conversion</p>
                  <p className="text-2xl font-bold">{avgConversion.toFixed(1)}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList>
            <TabsTrigger value="my-products">
              My Shared Products ({myProducts.length})
            </TabsTrigger>
            <TabsTrigger value="discover">
              Discover Products
            </TabsTrigger>
          </TabsList>

          {/* My Products Tab */}
          <TabsContent value="my-products" className="mt-6">
            {/* Search & Filter */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search your products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Products List */}
            <div className="space-y-4">
              {myProducts.map((product) => (
                <Card key={product.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex gap-6">
                      {/* Product Image */}
                      <Link
                        to={`/product/${product.id}`}
                        className="w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 bg-muted"
                      >
                        <img
                      loading="lazy"
                          src={product.image}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </Link>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <Link to={`/product/${product.id}`}>
                          <h3 className="mb-2 hover:text-primary">{product.name}</h3>
                        </Link>
                        <div className="flex items-center gap-4 mb-3">
                          <span className="font-medium">${product.price.toLocaleString()}</span>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-4 gap-4 p-4 bg-muted rounded-xl">
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Clicks</p>
                            <p className="font-medium text-foreground">{product.clicks}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Sales</p>
                            <p className="font-medium text-foreground">{product.sales}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Conversion</p>
                            <p className="font-medium text-foreground">{product.conversionRate}%</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground mb-1">Earnings</p>
                            <p className="font-medium text-primary">
                              ${product.earnings.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col gap-2">
                        <Link to={`/product/${product.id}`}>
                          <Button size="sm" variant="outline" className="w-full">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View Product
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Discover Tab */}
          <TabsContent value="discover" className="mt-6">
            {/* Search */}
            <div className="flex gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search products to share..."
                  value={discoverQuery}
                  onChange={(e) => setDiscoverQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filter
              </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {availableProducts.map((product) => (
                <Card key={product.id} className="group hover:shadow-lg transition-shadow">
                  <div className="relative aspect-square bg-muted overflow-hidden">
                    <Link to={`/product/${product.id}`}>
                      <img
                      loading="lazy"
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </Link>
                    {product.badge && (
                      <Badge className="absolute top-2 left-2" variant="destructive">
                        {product.badge}
                      </Badge>
                    )}
                  </div>
                  <CardContent className="p-4">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-sm mb-2 line-clamp-2 hover:text-primary">
                        {product.name}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-medium">${product.price.toLocaleString()}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                          ${product.originalPrice.toLocaleString()}
                        </span>
                      )}
                    </div>
                    <Link to={`/product/${product.id}`} className="block">
                      <Button size="sm" className="w-full">
                        View Product
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        {/* Tips */}
        <Card className="mt-8 bg-accent border-border">
          <CardHeader>
            <CardTitle>💡 Sharing Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="text-sm space-y-2 text-foreground">
              <li>• Share products you genuinely like and use</li>
              <li>• Create authentic content showcasing product benefits</li>
              <li>• Share products in multiple posts and stories</li>
              <li>• Use product tags in your regular content</li>
              <li>• Track which products perform best with your audience</li>
              <li>• Build trust with your followers through honest recommendations</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}