import { useState, useEffect, useMemo, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { Search, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';
import { products, categories as productCategories } from '../data/products';
import { Skeleton } from '../components/ui/skeleton';
import { EmptySearchResults } from '../components/EmptyStates';
import { SEO, SEOConfigs } from '../components/SEO';
import { Button } from '../components/primitives/Button';
import { ProductCard } from '../components/shop/ProductCard';
import { toast } from 'sonner';
import { fadeUp, staggerContainer, DURATION } from '../lib/motion';
import { cn } from '../components/ui/utils';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
  { value: 'popular', label: 'Best Selling' },
];

function PromoCarouselSlide({ slide, isActive }: { slide: any; isActive: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: DURATION.normal }}
      className={cn(
        'absolute inset-0 rounded-card overflow-hidden',
        !isActive && 'pointer-events-none',
      )}
    >
      <div className={cn('h-full flex flex-col justify-center px-6 py-8 text-white', slide.className)}>
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={isActive ? { opacity: 1, y: 0 } : undefined}
          transition={{ delay: 0.1, duration: DURATION.slow }}
        >
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">{slide.headline}</h3>
          <p className="text-sm md:text-base opacity-90 mb-4">{slide.description}</p>
          <Button size="md" variant="primary" className="w-fit">
            {slide.cta}
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FlashDealCountdown() {
  const [timeLeft, setTimeLeft] = useState('02:45:30');
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const [h, m, s] = prev.split(':').map(Number);
        let newS = s - 1, newM = m, newH = h;
        if (newS < 0) { newS = 59; newM -= 1; }
        if (newM < 0) { newM = 59; newH -= 1; }
        if (newH < 0) return '00:00:00';
        return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}:${String(newS).padStart(2, '0')}`;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="inline-flex items-center gap-2 bg-accent-brand-subtle px-3 py-1.5 rounded-xl">
      <Flame className="size-4 text-accent-brand" />
      <span className="text-xs font-semibold text-accent-brand">Flash Deal ends in</span>
      <span className="font-display font-bold text-accent-brand tabular-nums">{timeLeft}</span>
    </div>
  );
}

function CategoryTile({ cat, prefersReducedMotion }: { cat: any; prefersReducedMotion: boolean }) {
  if (prefersReducedMotion) {
    return (
      <button
        key={cat.name}
        className="group relative overflow-hidden rounded-card h-40 md:h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <img src={cat.image} alt={cat.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end items-start p-4">
          <h3 className="font-display font-semibold text-white">{cat.name}</h3>
          <p className="text-xs text-white/80">{cat.count} items</p>
        </div>
      </button>
    );
  }
  return (
    <motion.button
      key={cat.name}
      variants={fadeUp}
      className="group relative overflow-hidden rounded-card h-40 md:h-48 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <img src={cat.image} alt={cat.name} loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end items-start p-4">
        <h3 className="font-display font-semibold text-white">{cat.name}</h3>
        <p className="text-xs text-white/80">{cat.count} items</p>
      </div>
    </motion.button>
  );
}

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-card overflow-hidden border border-border">
          <Skeleton className="aspect-square" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-2/3" />
            <Skeleton className="h-5 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default function ShopPage() {
  const [searchParams] = useSearchParams();
  const categoryParam = searchParams.get('category');
  const prefersReducedMotion = useReducedMotion();

  const [selectedCategory, setSelectedCategory] = useState(categoryParam || 'All');
  const [sortBy, setSortBy] = useState('featured');
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({ minPrice: 0, maxPrice: 500, minRating: 0 });
  const [isLoading, setIsLoading] = useState(false);
  const [pageData, setPageData] = useState<any>(null);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const [carouselIndex, setCarouselIndex] = useState(0);

  const allCategories = useMemo(() => ['All', ...productCategories], []);

  const promoSlides = [
    { headline: '50% Off Electronics', description: 'Limited time only', cta: 'Shop Now', className: 'bg-brand-gradient' },
    { headline: 'New Season Fashion', description: 'Exclusive collections', cta: 'Explore', className: 'bg-brand-gradient-warm' },
    { headline: 'Beauty & Personal Care', description: 'Premium brands on sale', cta: 'Browse', className: 'bg-aurora' },
  ];

  const categoryData = [
    { name: 'Electronics', count: 234, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&h=300&fit=crop' },
    { name: 'Fashion', count: 156, image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&h=300&fit=crop' },
    { name: 'Beauty', count: 89, image: 'https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=300&h=300&fit=crop' },
    { name: 'Home', count: 145, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=300&h=300&fit=crop' },
  ];

  useEffect(() => {
    const loadShopData = () => {
      const savedWishlist = localStorage.getItem('ezyify_wishlist');
      const likedSet = new Set<string>(savedWishlist ? JSON.parse(savedWishlist) : []);

      const savedCart = localStorage.getItem('ezyify_cart');
      const cartSet = new Set<string>();
      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart);
          cart.forEach((item: any) => cartSet.add(item.id));
        } catch (e) {
          console.error('Failed to parse cart', e);
        }
      }

      setPageData({ loaded: true });
      setLikedProducts(likedSet);
      setCartItems(cartSet);
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadShopData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadShopData, 16);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const timer = setInterval(() => {
      setCarouselIndex(prev => (prev + 1) % promoSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [prefersReducedMotion, promoSlides.length]);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
      const matchesSearch = !searchQuery || product.name.toLowerCase().includes(searchQuery.toLowerCase()) || product.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPrice = product.price >= filters.minPrice && product.price <= filters.maxPrice;
      const matchesRating = product.rating >= filters.minRating;
      return matchesCategory && matchesSearch && matchesPrice && matchesRating;
    });
  }, [selectedCategory, searchQuery, filters]);

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
    const existing = cart.find((item: any) => item.id === productId);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: productId, quantity: 1 });
    }
    localStorage.setItem('ezyify_cart', JSON.stringify(cart));
    const ids = cart.map((item: any) => item.id);
    setCartItems(new Set(ids));
    toast.success('Added to cart');
  }, []);

  const flashDeals = useMemo(() => {
    return products.filter(p => p.originalPrice && (p.originalPrice - p.price) / p.originalPrice > 0.3).slice(0, 6);
  }, []);

  if (!pageData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <Skeleton className="h-12 w-full mb-6" />
          <Skeleton className="h-48 w-full rounded-card mb-6" />
          <ProductGridSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-nav">
      <SEO {...SEOConfigs.shop} />

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-2xl font-bold text-foreground">Shop</h1>
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-tertiary" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 bg-background-elevated border border-border rounded-xl text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
        </div>

        {/* Category Chips */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, x: -12 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, x: 0 }}
          transition={{ duration: DURATION.normal }}
          className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide"
        >
          {allCategories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              aria-pressed={selectedCategory === cat}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all',
                selectedCategory === cat ? 'bg-primary text-primary-foreground' : 'bg-background-elevated border border-border text-foreground hover:border-border-strong',
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        {/* Hero Promo Carousel */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ duration: DURATION.slow }}
          className="relative h-48 md:h-64 rounded-card overflow-hidden border border-border-subtle"
        >
          {promoSlides.map((slide, idx) => (
            <PromoCarouselSlide key={idx} slide={slide} isActive={idx === carouselIndex} />
          ))}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {promoSlides.map((_, idx) => (
              <motion.button
                key={idx}
                type="button"
                onClick={() => setCarouselIndex(idx)}
                aria-label={`Go to slide ${idx + 1} of ${promoSlides.length}`}
                aria-current={idx === carouselIndex ? 'true' : undefined}
                // 24×24 hit area (WCAG 2.5.8) around a small visual dot.
                className="flex h-6 w-6 items-center justify-center rounded-full"
              >
                <span className={cn('block rounded-full transition-all', idx === carouselIndex ? 'bg-white w-2 h-2' : 'bg-white/50 w-1.5 h-1.5')} />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Flash Deals */}
        {flashDeals.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                <Flame className="size-5 text-accent-brand" />
                Flash Deals
              </h2>
              <FlashDealCountdown />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
              {flashDeals.map(product => (
                <ProductCard key={product.id} product={product} size="small" isLiked={likedProducts.has(product.id)} inCart={cartItems.has(product.id)} onToggleLike={toggleLike} onAddToCart={addToCart} />
              ))}
            </div>
          </div>
        )}

        {/* Category Grid */}
        <motion.div
          initial={prefersReducedMotion ? {} : { opacity: 0, y: 12 }}
          animate={prefersReducedMotion ? {} : { opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: DURATION.slow }}
          className="space-y-3"
        >
          <h2 className="font-display text-lg font-semibold text-foreground">Browse Categories</h2>
          {prefersReducedMotion ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryData.map(cat => (
                <CategoryTile key={cat.name} cat={cat} prefersReducedMotion />
              ))}
            </div>
          ) : (
            <motion.div variants={staggerContainer(0.05)} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {categoryData.map(cat => (
                <CategoryTile key={cat.name} cat={cat} prefersReducedMotion={false} />
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* Products Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <h2 className="font-display text-lg font-semibold text-foreground">{selectedCategory !== 'All' ? selectedCategory : 'All Products'}</h2>
            <select
              value={sortBy}
              aria-label="Sort products"
              onChange={e => setSortBy(e.target.value)}
              className="px-3 py-2 bg-background-elevated border border-border rounded-xl text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {isLoading ? (
            <ProductGridSkeleton />
          ) : sortedProducts.length === 0 ? (
            <div className="py-16">
              <EmptySearchResults />
            </div>
          ) : prefersReducedMotion ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedProducts.map(product => (
                <ProductCard key={product.id} product={product} isLiked={likedProducts.has(product.id)} inCart={cartItems.has(product.id)} onToggleLike={toggleLike} onAddToCart={addToCart} />
              ))}
            </div>
          ) : (
            <motion.div variants={staggerContainer(0.03)} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {sortedProducts.map(product => (
                <motion.div key={product.id} variants={fadeUp}>
                  <ProductCard product={product} isLiked={likedProducts.has(product.id)} inCart={cartItems.has(product.id)} onToggleLike={toggleLike} onAddToCart={addToCart} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
