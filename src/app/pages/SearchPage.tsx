import { useState, useEffect } from 'react';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Link, useLocation } from 'react-router';
import { Search, X, TrendingUp, Clock, Filter, Hash, Tag, Star, Heart, Play } from 'lucide-react';
import { mockProducts, mockPosts, categoryData } from '../data/enhanced-mock-data';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Skeleton } from '../components/ui/skeleton';
import { SEO, SEOConfigs } from '../components/SEO';

// SKELETON FOR INSTANT UI
function SearchSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 pb-6">
        <Skeleton className="h-12 w-full mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="aspect-square rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const queryParam = searchParams.get('q');
  
  const [searchQuery, setSearchQuery] = useState(queryParam || '');
  const [activeTab, setActiveTab] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterPrice, setFilterPrice] = useState('all');
  const [filterSort, setFilterSort] = useState('relevant');
  const [recentSearches, setRecentSearches] = useState<string[]>([
    'Premium T-Shirt', 'Leather Bag', 'Gaming Keyboard'
  ]);

  // PROGRESSIVE LOADING: Load data after initial render
  const [pageData, setPageData] = useState<{
    trendingSearches: string[];
    trendingHashtags: any[];
    filteredProducts: any[];
    filteredPosts: any[];
    filteredUsers: any[];
  } | null>(null);

  // Update search when URL query changes
  useEffect(() => {
    if (queryParam) {
      setSearchQuery(queryParam);
    }
  }, [queryParam]);

  // Load search data progressively
  useEffect(() => {
    const loadSearchData = () => {
      // Mock trending searches
      const trendingSearches = [
        'Wireless Earbuds',
        'Winter Fashion',
        'Smart Watch',
        'Home Decor',
        'Fitness Gear',
        'Beauty Products'
      ];

      // Mock hashtags
      const trendingHashtags = [
        { tag: 'Fashion', count: 245000 },
        { tag: 'Tech', count: 189000 },
        { tag: 'HomeDecor', count: 156000 },
        { tag: 'Fitness', count: 134000 },
        { tag: 'Beauty', count: 98000 }
      ];

      // Search results
      let filteredProducts = searchQuery
        ? mockProducts.filter(p =>
            p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
          )
        : [];

      // Apply category filter
      if (filterCategory !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.category.toLowerCase() === filterCategory.toLowerCase());
      }

      // Apply price filter
      if (filterPrice === 'under50') filteredProducts = filteredProducts.filter(p => p.price < 50);
      else if (filterPrice === '50to100') filteredProducts = filteredProducts.filter(p => p.price >= 50 && p.price <= 100);
      else if (filterPrice === '100to200') filteredProducts = filteredProducts.filter(p => p.price > 100 && p.price <= 200);
      else if (filterPrice === 'over200') filteredProducts = filteredProducts.filter(p => p.price > 200);

      // Apply sort
      if (filterSort === 'newest') filteredProducts = [...filteredProducts].reverse();
      else if (filterSort === 'price_asc') filteredProducts = [...filteredProducts].sort((a, b) => a.price - b.price);
      else if (filterSort === 'price_desc') filteredProducts = [...filteredProducts].sort((a, b) => b.price - a.price);
      else if (filterSort === 'rating') filteredProducts = [...filteredProducts].sort((a, b) => b.rating - a.rating);

      const filteredPosts = searchQuery
        ? mockPosts.filter(post => 
            post.content.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.hashtags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
            post.author.username.toLowerCase().includes(searchQuery.toLowerCase())
          )
        : [];

      const filteredUsers = searchQuery
        ? mockPosts
            .filter(post => 
              post.author.username.toLowerCase().includes(searchQuery.toLowerCase())
            )
            .map(post => post.author)
            .filter((user, index, self) => 
              index === self.findIndex(u => u.username === user.username)
            )
        : [];

      setPageData({
        trendingSearches,
        trendingHashtags,
        filteredProducts,
        filteredPosts,
        filteredUsers
      });
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadSearchData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadSearchData, 16);
      return () => clearTimeout(timer);
    }
  }, [searchQuery, filterCategory, filterPrice, filterSort]);

  if (!pageData) {
    return <SearchSkeleton />;
  }

  const { trendingSearches, trendingHashtags, filteredProducts, filteredPosts, filteredUsers } = pageData;

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query && !recentSearches.includes(query)) {
      setRecentSearches([query, ...recentSearches.slice(0, 4)]);
    }
  };

  const clearRecentSearch = (query: string) => {
    setRecentSearches(recentSearches.filter(s => s !== query));
  };

  return (
    <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <SEO {...SEOConfigs.search} />
      <div className="max-w-7xl mx-auto px-4 pb-6">
        {/* Search Header */}
        <div className="mb-6">
          <div className="flex gap-3 mb-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search products, posts, users..."
                className="w-full pl-12 pr-10 py-3 bg-card text-foreground border border-border rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground"
                autoFocus
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2"
                >
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              )}
            </div>
            <Button 
              variant="outline"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2"
            >
              <Filter className="w-5 h-5" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
          </div>

          {/* Filters Panel */}
          {showFilters && (
            <div className="bg-card rounded-2xl p-4 mb-4 border border-border">
              <h3 className="font-medium text-foreground mb-3">Filters</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Category</label>
                  <select value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)} className="w-full px-3.5 py-2 bg-input-background text-foreground border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="all">All Categories</option>
                    {categoryData.filter(c => c.id !== 'all').map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Price Range</label>
                  <select value={filterPrice} onChange={(e) => setFilterPrice(e.target.value)} className="w-full px-3.5 py-2 bg-input-background text-foreground border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="all">All Prices</option>
                    <option value="under50">Under $50</option>
                    <option value="50to100">$50 - $100</option>
                    <option value="100to200">$100 - $200</option>
                    <option value="over200">Over $200</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Sort By</label>
                  <select value={filterSort} onChange={(e) => setFilterSort(e.target.value)} className="w-full px-3.5 py-2 bg-input-background text-foreground border border-border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all">
                    <option value="relevant">Most Relevant</option>
                    <option value="newest">Newest First</option>
                    <option value="price_asc">Price: Low to High</option>
                    <option value="price_desc">Price: High to Low</option>
                    <option value="rating">Best Rating</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search Results or Suggestions */}
        {!searchQuery ? (
          <div className="space-y-6">
            {/* Recent Searches */}
            {recentSearches.length > 0 && (
              <div className="bg-card border border-border rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-foreground flex items-center gap-2">
                    <Clock className="w-5 h-5 text-muted-foreground" />
                    Recent Searches
                  </h2>
                  <button 
                    onClick={() => setRecentSearches([])}
                    className="text-sm text-primary hover:underline"
                  >
                    Clear All
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((query, idx) => (
                    <div
                      key={idx}
                      className="flex items-center gap-2 bg-muted hover:bg-muted/80 rounded-full px-4 py-2 transition-colors group"
                    >
                      <button
                        onClick={() => handleSearch(query)}
                        className="flex items-center gap-2 text-foreground"
                      >
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{query}</span>
                      </button>
                      <button
                        onClick={() => clearRecentSearch(query)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trending Searches */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-foreground mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Trending Searches
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {trendingSearches.map((query, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(query)}
                    className="flex items-center gap-2 bg-accent hover:bg-accent/80 rounded-xl px-4 py-3 transition-colors text-foreground"
                  >
                    <TrendingUp className="w-4 h-4 text-primary" />
                    <span>{query}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Trending Hashtags */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-foreground mb-4 flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" />
                Trending Hashtags
              </h2>
              <div className="space-y-3">
                {trendingHashtags.map((hashtag, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSearch(`#${hashtag.tag}`)}
                    className="w-full flex items-center justify-between p-3 hover:bg-muted rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center text-foreground">
                        #{idx + 1}
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-foreground">#{hashtag.tag}</p>
                        <p className="text-sm text-muted-foreground">{(hashtag.count / 1000).toFixed(0)}K posts</p>
                      </div>
                    </div>
                    <TrendingUp className="w-5 h-5 text-primary" />
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Categories */}
            <div className="bg-card border border-border rounded-2xl p-6">
              <h2 className="text-foreground mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-primary" />
                Popular Categories
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categoryData.filter(c => c.id !== 'all').map(category => (
                  <Link
                    key={category.id}
                    to={`/shop?category=${category.id}`}
                    className="group relative aspect-square rounded-2xl overflow-hidden hover:shadow-lg transition-shadow"
                  >
                    <img
                      loading="lazy" 
                      src={category.image} 
                      alt={category.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <p className="font-medium mb-0.5">{category.name}</p>
                      <p className="text-xs text-white/75">{category.count} products</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Search Results */
          <div>
            {/* Results Count */}
            <div className="mb-6">
              <p className="text-muted-foreground">
                Found {filteredProducts.length + filteredPosts.length + filteredUsers.length} results for "{searchQuery}"
              </p>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
              <TabsList className="grid w-full grid-cols-4 bg-card">
                <TabsTrigger value="all">
                  All ({filteredProducts.length + filteredPosts.length + filteredUsers.length})
                </TabsTrigger>
                <TabsTrigger value="products">
                  Products ({filteredProducts.length})
                </TabsTrigger>
                <TabsTrigger value="posts">
                  Posts ({filteredPosts.length})
                </TabsTrigger>
                <TabsTrigger value="users">
                  Users ({filteredUsers.length})
                </TabsTrigger>
              </TabsList>

              {/* All Results */}
              <TabsContent value="all" className="mt-6 space-y-6">
                {/* Users */}
                {filteredUsers.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="text-foreground mb-4">Users</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {filteredUsers.slice(0, 4).map((user, idx) => (
                        <Link
                          key={idx}
                          to={`/profile/${user.username}`}
                          className="flex items-center gap-3 p-3 hover:bg-muted rounded-xl transition-colors"
                        >
                          <img
                      loading="lazy"
                            src={user.avatar}
                            alt={user.username}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-1">
                              <p className="font-medium text-foreground">{user.username}</p>
                              {user.verified && <VerifiedBadge size="sm" />}
                            </div>
                            <p className="text-sm text-muted-foreground">@{user.username}</p>
                          </div>
                          <Button size="sm" variant="outline">Follow</Button>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Products */}
                {filteredProducts.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="text-foreground mb-4">Products</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                      {filteredProducts.slice(0, 8).map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.id}`}
                          className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
                        >
                          <div className="aspect-square relative overflow-hidden">
                            {product.badge && (
                              <Badge className="absolute top-2 left-2 z-10 bg-error text-error-foreground">
                                {product.badge}
                              </Badge>
                            )}
                            <img
                      loading="lazy" 
                              src={product.image} 
                              alt={product.name}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                          </div>
                          <div className="p-3">
                            <p className="text-sm text-muted-foreground mb-1">{product.seller}</p>
                            <h3 className="font-medium text-foreground mb-2 line-clamp-2">{product.name}</h3>
                            <div className="flex items-center gap-1 mb-2">
                              <Star className="w-4 h-4 fill-primary text-primary" />
                              <span className="text-sm text-foreground">{product.rating}</span>
                            </div>
                            <p className="text-foreground">${product.price}</p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Posts */}
                {filteredPosts.length > 0 && (
                  <div className="bg-card border border-border rounded-2xl p-6">
                    <h3 className="text-foreground mb-4">Posts</h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {filteredPosts.slice(0, 8).map(post => {
                        const imageUrl = typeof post.content.media.url === 'string' 
                          ? post.content.media.url 
                          : post.content.media.url[0];
                        
                        return (
                          <Link
                            key={post.id}
                            to={`/post/${post.id}`}
                            className="relative aspect-square rounded-2xl overflow-hidden group"
                          >
                            <img
                      loading="lazy" 
                              src={imageUrl} 
                              alt={post.content.text}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                            <div className="absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <div className="text-foreground flex items-center gap-4">
                                <div className="flex items-center gap-1">
                                  <Heart className="w-5 h-5 fill-foreground" />
                                  <span>{(post.engagement.likes / 1000).toFixed(1)}K</span>
                                </div>
                              </div>
                            </div>
                            {post.content.media.type === 'video' && (
                              <div className="absolute top-2 right-2">
                                <Play className="w-6 h-6 text-foreground drop-shadow-lg" />
                              </div>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {filteredProducts.length === 0 && filteredPosts.length === 0 && filteredUsers.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-foreground mb-2">No results found</h3>
                    <p className="text-muted-foreground">Try adjusting your search or filters</p>
                  </div>
                )}
              </TabsContent>

              {/* Products Tab */}
              <TabsContent value="products" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {filteredProducts.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-lg transition-shadow group"
                    >
                      <div className="aspect-square relative overflow-hidden">
                        {product.badge && (
                          <Badge className="absolute top-2 left-2 z-10 bg-error text-error-foreground">
                            {product.badge}
                          </Badge>
                        )}
                        <img
                      loading="lazy" 
                          src={product.image} 
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                      </div>
                      <div className="p-3">
                        <p className="text-sm text-muted-foreground mb-1">{product.seller}</p>
                        <h3 className="font-medium text-foreground mb-2 line-clamp-2">{product.name}</h3>
                        <div className="flex items-center gap-1 mb-2">
                          <Star className="w-4 h-4 fill-primary text-primary" />
                          <span className="text-sm text-foreground">{product.rating}</span>
                        </div>
                        <p className="text-foreground">${product.price}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>

              {/* Posts Tab */}
              <TabsContent value="posts" className="mt-6">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {filteredPosts.map(post => {
                    const imageUrl = typeof post.content.media.url === 'string' 
                      ? post.content.media.url 
                      : post.content.media.url[0];
                    
                    return (
                      <Link
                        key={post.id}
                        to={`/post/${post.id}`}
                        className="relative aspect-square rounded-2xl overflow-hidden group"
                      >
                        <img
                      loading="lazy" 
                          src={imageUrl} 
                          alt={post.content.text}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                        />
                        <div className="absolute inset-0 bg-muted/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <div className="text-foreground flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <Heart className="w-5 h-5 fill-foreground" />
                              <span>{(post.engagement.likes / 1000).toFixed(1)}K</span>
                            </div>
                          </div>
                        </div>
                        {post.content.media.type === 'video' && (
                          <div className="absolute top-2 right-2">
                            <Play className="w-6 h-6 text-foreground drop-shadow-lg" />
                          </div>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </TabsContent>

              {/* Users Tab */}
              <TabsContent value="users" className="mt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredUsers.map((user, idx) => (
                    <Link
                      key={idx}
                      to={`/profile/${user.username}`}
                      className="bg-card border border-border rounded-2xl p-4 hover:shadow-lg transition-shadow flex items-center gap-4"
                    >
                      <img
                      loading="lazy"
                        src={user.avatar}
                        alt={user.username}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-1 mb-1">
                          <p className="font-medium text-foreground">{user.username}</p>
                          {user.verified && <VerifiedBadge size="sm" />}
                        </div>
                        <p className="text-muted-foreground mb-2">@{user.username}</p>
                        <Button size="sm" variant="outline">Follow</Button>
                      </div>
                    </Link>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>
    </div>
  );
}