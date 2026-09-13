import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Search, SlidersHorizontal, Grid3x3, Grid } from 'lucide-react';
import { useSearchParams } from 'react-router';
import { products, categories as productCategories } from '../data/products';
import { ProductGridLoading } from '../components/LoadingStates';
import { Skeleton } from '../components/ui/skeleton';
import { EmptySearchResults } from '../components/EmptyStates';
import { SEO, SEOConfigs } from '../components/SEO';
import { ShopFilters, FilterState } from '../components/shop/ShopFilters';
import { ShopHome } from '../components/shop/ShopHome';
import { VirtualProductGrid } from '../components/shop/VirtualProductGrid';
import { toast } from 'sonner';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'New Arrivals' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Best Selling' },
];

// SKELETON FOR INSTANT UI
function ShopSkeleton({ activeView }: { activeView: 'home' | 'products' }) {
  if (activeView === 'home') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-screen-2xl mx-auto px-4 pb-6">
          <Skeleton className="h-12 w-full mb-6" />
          <div className="space-y-8">
            <Skeleton className="h-64 w-full rounded-xl" />
            <Skeleton className="h-48 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-2xl mx-auto px-4 pb-6">
        <div className="flex gap-4 mb-6">
          <Skeleton className="h-12 flex-1" />
          <Skeleton className="h-12 w-32" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <div key={i} className="bg-card border border-border rounded-2xl overflow-hidden">
              <Skeleton className="aspect-square" />
              <div className="p-4 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-6 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  
  // ALL STATE HOOKS AT THE TOP - BEFORE ANY EARLY RETURNS
  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'large' | 'grid'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [activeView, setActiveView] = useState<'home' | 'products'>('home');
  
  const [filters, setFilters] = useState<FilterState>({
    priceRange: [0, 500],
    categories: [],
    brands: [],
    ratings: [],
    inStockOnly: false,
    freeShipping: false,
    onSale: false
  });

  // PROGRESSIVE LOADING: Load shop data after initial render
  const [pageData, setPageData] = useState<{
    likedProducts: Set<string>;
    cartItems: Set<string>;
  } | null>(null);

  // These hooks MUST be called BEFORE early return
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);

  // Load shop data
  useEffect(() => {
    const loadShopData = () => {
      // Load wishlist from localStorage
      const savedWishlist = localStorage.getItem('ezyify_wishlist');
      let likedProductsData = new Set<string>();
      if (savedWishlist) {
        try {
          likedProductsData = new Set(JSON.parse(savedWishlist));
        } catch (e) {
          console.error('Failed to parse wishlist', e);
        }
      }

      // Load cart from localStorage
      const savedCart = localStorage.getItem('ezyify_cart');
      let cartItemsData = new Set<string>();
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart);
          cartItemsData = new Set(cart.map((item: any) => item.id));
        } catch (e) {
          console.error('Failed to parse cart', e);
        }
      }

      setPageData({ likedProducts: likedProductsData, cartItems: cartItemsData });
      setLikedProducts(likedProductsData);
      setCartItems(cartItemsData);
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadShopData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadShopData, 16);
      return () => clearTimeout(timer);
    }
  }, []);

  // Update view based on search/category
  useEffect(() => {
    if (categoryParam) {
      setSelectedCategory(categoryParam);
      setActiveView('products');
    } else if (searchQuery) {
      setActiveView('products');
    }
  }, [categoryParam, searchQuery]);

  // Memoize categories - MUST be before early return
  const allCategories = useMemo(() => ['All', ...productCategories], []);

  // Memoized filtered products - MUST be before early return
  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = searchQuery === '' || 
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesPrice = product.price >= filters.priceRange[0] && product.price <= filters.priceRange[1];
      const matchesBrand = filters.brands.length === 0 || filters.brands.includes(product.seller.name);
      const matchesRating = filters.ratings.length === 0 || filters.ratings.some(r => product.rating >= r);
      const matchesStock = !filters.inStockOnly || product.stock > 0;
      const matchesShipping = !filters.freeShipping || product.freeShipping;
      const matchesOnSale = !filters.onSale || (product.originalPrice && product.originalPrice > product.price);
      
      return matchesCategory && matchesSearch && matchesPrice && matchesBrand && 
             matchesRating && matchesStock && matchesShipping && matchesOnSale;
    });
  }, [selectedCategory, searchQuery, filters]);

  // Memoized sorted products - MUST be before early return
  const sortedProducts = useMemo(() => {
    const sorted = [...filteredProducts];
    
    switch (sortBy) {
      case 'newest':
        return sorted.reverse();
      case 'price-low':
        return sorted.sort((a, b) => a.price - b.price);
      case 'price-high':
        return sorted.sort((a, b) => b.price - a.price);
      case 'rating':
        return sorted.sort((a, b) => b.rating - a.rating);
      case 'popular':
        return sorted.sort((a, b) => (b.sold || 0) - (a.sold || 0));
      default:
        return sorted;
    }
  }, [filteredProducts, sortBy]);

  // ALL CALLBACKS BEFORE EARLY RETURN
  const toggleLike = useCallback((e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const savedWishlist = localStorage.getItem('ezyify_wishlist');
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    
    if (wishlist.includes(productId)) {
      const filtered = wishlist.filter((id: string) => id !== productId);
      localStorage.setItem('ezyify_wishlist', JSON.stringify(filtered));
      setLikedProducts(new Set(filtered));
      toast.success('Removed from wishlist');
    } else {
      wishlist.push(productId);
      localStorage.setItem('ezyify_wishlist', JSON.stringify(wishlist));
      setLikedProducts(new Set(wishlist));
      toast.success('Added to wishlist');
    }
  }, []);

  const addToCart = useCallback((e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    
    const savedCart = localStorage.getItem('ezyify_cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const existingItem = cart.find((item: any) => item.id === productId);
    
    if (existingItem) {
      existingItem.quantity += 1;
      toast.success('Quantity updated in cart');
    } else {
      cart.push({ id: productId, quantity: 1 });
      toast.success('Added to cart');
    }
    
    localStorage.setItem('ezyify_cart', JSON.stringify(cart));
    const ids = cart.map((item: any) => item.id);
    setCartItems(new Set(ids));
  }, []);

  const handleCategoryClick = useCallback((category: string) => {
    setSelectedCategory(category);
    setActiveView('products');
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleSearchSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('products');
    }
  }, [searchQuery]);

  const handleApplyFilters = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 300);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      priceRange: [0, 500],
      categories: [],
      brands: [],
      ratings: [],
      inStockOnly: false,
      freeShipping: false,
      onSale: false
    });
  }, []);

  const trendingProducts = useMemo(() => {
    const sorted = [...products].sort((a, b) => (b.sold || 0) - (a.sold || 0));
    return sorted.slice(0, 4);
  }, []);
  
  const featuredProducts = useMemo(() => {
    return products.filter(p => p.rating >= 4.7).slice(0, 2);
  }, []);
  
  const flashDeals = useMemo(() => {
    return products.filter(p => 
      p.originalPrice && (p.originalPrice - p.price) / p.originalPrice > 0.3
    ).slice(0, 2);
  }, []);

  // Show skeleton while loading - AFTER ALL HOOKS
  if (!pageData) {
    return <ShopSkeleton activeView={activeView} />;
  }

  // Shop Home View
  if (activeView === 'home' && !categoryParam && !searchQuery) {
    return (
      <ShopHome
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        onBrowseAll={() => setActiveView('products')}
        flashDeals={flashDeals}
        trendingProducts={trendingProducts}
        featuredProducts={featuredProducts}
        likedProducts={likedProducts}
        cartItems={cartItems}
        onToggleLike={toggleLike}
        onAddToCart={addToCart}
      />
    );
  }

  // Products List View
  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.shop} />
      
      <div className="max-w-screen-2xl mx-auto px-2 sm:px-4 lg:px-6 pb-6">
        {/* Header */}
        <div className="mb-6">
          <button
            onClick={() => {
              setActiveView('home');
              setSelectedCategory('All');
              setSearchQuery('');
              setSearchParams({});
            }}
            className="text-primary hover:text-primary/80 font-medium mb-2"
          >
            ← Back to Shop
          </button>
          <h1 className="text-foreground">
            {selectedCategory !== 'All' ? selectedCategory : searchQuery ? `Search: "${searchQuery}"` : 'All Products'}
          </h1>
        </div>

        {/* Search & Filters */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-muted text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
              />
            </div>
            <button 
              onClick={() => setShowFilters(true)}
              className="px-4 py-2.5 border border-border rounded-xl hover:bg-muted flex items-center gap-2 text-foreground font-medium"
            >
              <SlidersHorizontal className="w-5 h-5" />
              <span>Filters</span>
              {(filters.brands.length + filters.ratings.length) > 0 && (
                <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                  {filters.brands.length + filters.ratings.length}
                </span>
              )}
            </button>
          </div>

          {/* Category Pills */}
          <div className="flex gap-2 mt-4 overflow-x-auto pb-2 scrollbar-hide">
            {allCategories.map(cat => (
              <button
                key={cat}
                onClick={() => handleCategoryClick(cat)}
                className={`px-4 py-2 rounded-full whitespace-nowrap text-sm font-semibold transition-all ${
                  selectedCategory === cat
                    ? 'text-white shadow-brand'
                    : 'bg-muted text-foreground hover:bg-muted/80 border border-border'
                }`}
                style={selectedCategory === cat ? { background: 'var(--brand-gradient)' } : {}}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Sort & View */}
        <div className="bg-card border border-border rounded-2xl p-4 mb-6 flex items-center justify-between flex-wrap gap-4">
          <div className="flex gap-2 flex-wrap">
            {SORT_OPTIONS.map(option => (
              <button
                key={option.value}
                onClick={() => setSortBy(option.value)}
                className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                  sortBy === option.value 
                    ? 'bg-primary text-primary-foreground shadow-md' 
                    : 'bg-muted text-foreground hover:bg-muted/80'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
          
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground hidden sm:inline">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'product' : 'products'}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setViewMode('large')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'large' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Grid className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded-xl transition-all ${
                  viewMode === 'grid' 
                    ? 'bg-primary text-primary-foreground' 
                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                }`}
              >
                <Grid3x3 className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <ProductGridLoading count={viewMode === 'large' ? 6 : 12} />
        ) : sortedProducts.length === 0 ? (
          <div className="py-16">
            <EmptySearchResults />
          </div>
        ) : (
          <VirtualProductGrid
            products={sortedProducts}
            viewMode={viewMode}
            likedProducts={likedProducts}
            cartItems={cartItems}
            onToggleLike={toggleLike}
            onAddToCart={addToCart}
          />
        )}
      </div>

      <ShopFilters
        open={showFilters}
        onOpenChange={setShowFilters}
        filters={filters}
        onFiltersChange={setFilters}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
      />

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}