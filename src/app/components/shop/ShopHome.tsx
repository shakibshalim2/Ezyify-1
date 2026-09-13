import React from 'react';
import { Link } from 'react-router';
import { Search, Zap, TrendingUp, Sparkles } from 'lucide-react';
import { SEO, SEOConfigs } from '../SEO';
import { ShopCategories } from './ShopCategories';
import { ProductCard } from './ProductCard';

interface ShopHomeProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
  onBrowseAll: () => void;
  flashDeals: any[];
  trendingProducts: any[];
  featuredProducts: any[];
  likedProducts: Set<string>;
  cartItems: Set<string>;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onAddToCart: (e: React.MouseEvent, id: string) => void;
}

export const ShopHome = React.memo(({ 
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onBrowseAll,
  flashDeals,
  trendingProducts,
  featuredProducts,
  likedProducts,
  cartItems,
  onToggleLike,
  onAddToCart
}: ShopHomeProps) => {
  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.shop} />
      
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2">Shop</h1>
          <p className="text-muted-foreground text-lg">Discover amazing products from verified creators and sellers</p>
        </div>

        {/* Search Bar */}
        <form onSubmit={onSearchSubmit} className="mb-8">
          <div className="relative max-w-3xl mx-auto">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search for products, brands, or categories..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-card text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-muted-foreground text-lg shadow-sm"
            />
          </div>
        </form>

        {/* Featured Categories */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-foreground">Shop by Category</h2>
            <Link to="/categories" className="text-primary hover:text-primary/80 font-medium">
              View All
            </Link>
          </div>
          <ShopCategories variant="grid" limit={4} />
        </div>

        {/* Flash Deals */}
        {flashDeals.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2.5 rounded-xl bg-error/10">
                <Zap className="w-5 h-5 text-error" />
              </div>
              <div>
                <h2 className="font-bold text-foreground">Flash Deals</h2>
                <p className="text-xs text-muted-foreground">Limited time offers!</p>
              </div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {flashDeals.slice(0, 2).map(product => (
                <ProductCard 
                  key={product.id} 
                  product={product} 
                  size="small"
                  isLiked={likedProducts.has(product.id)}
                  inCart={cartItems.has(product.id)}
                  onToggleLike={onToggleLike}
                  onAddToCart={onAddToCart}
                />
              ))}
            </div>
          </div>
        )}

        {/* Trending Products */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-warning/10">
              <TrendingUp className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Trending Now</h2>
              <p className="text-xs text-muted-foreground">Most popular this week</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {trendingProducts.slice(0, 4).map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                isLiked={likedProducts.has(product.id)}
                inCart={cartItems.has(product.id)}
                onToggleLike={onToggleLike}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>

        {/* Featured Products */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2.5 rounded-xl bg-primary/10">
              <Sparkles className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-bold text-foreground">Featured Products</h2>
              <p className="text-xs text-muted-foreground">Hand-picked for you</p>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredProducts.slice(0, 2).map(product => (
              <ProductCard 
                key={product.id} 
                product={product}
                isLiked={likedProducts.has(product.id)}
                inCart={cartItems.has(product.id)}
                onToggleLike={onToggleLike}
                onAddToCart={onAddToCart}
              />
            ))}
          </div>
        </div>

        {/* Quick Category Links */}
        <div className="rounded-3xl p-8 text-center border border-border" style={{ background: 'var(--brand-gradient-subtle)' }}>
          <h2 className="font-bold text-foreground mb-3">Ready to Explore More?</h2>
          <p className="text-sm text-muted-foreground mb-6">Browse thousands of products across all categories</p>
          <button
            onClick={onBrowseAll}
            className="px-8 py-3 rounded-full text-sm font-semibold text-white shadow-brand hover:shadow-brand-lg transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{ background: 'var(--brand-gradient)' }}
          >
            Browse All Products
          </button>
        </div>
      </div>
    </div>
  );
});

ShopHome.displayName = 'ShopHome';