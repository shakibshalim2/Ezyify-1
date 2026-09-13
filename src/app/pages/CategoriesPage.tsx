import React, { useState, useEffect } from 'react';
import { Search, ChevronRight } from 'lucide-react';
import { Link } from 'react-router';
import { SEO } from '../components/SEO';
import { shopCategories } from '../components/shop/ShopCategories';
import { Skeleton } from '../components/ui/skeleton';

export default function CategoriesPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Load categories progressively
  useEffect(() => {
    const loadCategories = () => {
      setCategories(shopCategories);
      setIsLoading(false);
    };

    // Progressive loading: Use requestIdleCallback for non-critical work
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadCategories(), { timeout: 100 });
    } else {
      setTimeout(loadCategories, 0);
    }
  }, []);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="All Categories - Shop by Category"
        description="Browse all product categories on Ezyify. Find exactly what you're looking for across electronics, fashion, beauty, home, and more."
        keywords="categories, shop categories, product categories, browse products"
      />

      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/shop" className="text-primary hover:text-primary/80 font-medium mb-4 inline-block">
            ← Back to Shop
          </Link>
          <h1 className="font-semibold text-foreground">All Categories</h1>
          <p className="text-muted-foreground text-lg">
            {isLoading ? (
              <Skeleton className="h-6 w-64" />
            ) : (
              `Browse through ${categories.length} categories to find exactly what you need`
            )}
          </p>
        </div>

        {/* Search */}
        <div className="mb-8 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-card text-foreground border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Categories Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="bg-card border border-border rounded-2xl overflow-hidden">
                <Skeleton className="aspect-video" />
                <div className="p-4">
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-muted-foreground text-lg">No categories found matching "{searchQuery}"</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCategories.map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${category.name}`}
                className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 hover:border-border-strong transition-all duration-200"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img
                      loading="lazy"
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/75" />
                  <div className="absolute bottom-4 left-4 text-white">
                    <div className="mb-1.5 [&_svg]:text-white [&_svg]:w-5 [&_svg]:h-5">{category.icon}</div>
                    <h3 className="font-bold text-lg drop-shadow-sm">{category.name}</h3>
                  </div>
                </div>
                <div className="p-4 flex items-center justify-between">
                  <div>
                    <p className="text-muted-foreground text-sm">{category.count} products available</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}