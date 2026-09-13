import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router';
import { Zap, TrendingUp, Tag, Clock, Star, Heart, ShoppingCart, Check } from 'lucide-react';
import { products } from '../data/products';
import { SEO } from '../components/SEO';
import { toast } from 'sonner';
import { Skeleton } from '../components/ui/skeleton';

// ── Section header reused across Flash, Daily, Best Sellers ──────────────────
function SectionHeader({
  icon: Icon,
  iconBg,
  iconColor,
  title,
  subtitle,
  badge,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 mb-5 p-4 rounded-2xl border border-border bg-card">
      <div className={`p-2.5 rounded-xl ${iconBg}`}>
        <Icon className={`w-5 h-5 ${iconColor}`} />
      </div>
      <div className="flex-1 min-w-0">
        <h2 className="font-bold text-foreground">{title}</h2>
        <p className="text-xs text-muted-foreground">{subtitle}</p>
      </div>
      {badge}
    </div>
  );
}

// ── Product card — defined outside page to avoid remount on every render ──────
interface DealCardProps {
  product: any;
  isLiked: boolean;
  inCart: boolean;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onAddToCart: (e: React.MouseEvent, id: string) => void;
}

function DealCard({ product, isLiked, inCart, onToggleLike, onAddToCart }: DealCardProps) {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card border border-border rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-0.5 hover:border-border-strong transition-all duration-200"
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {discount > 0 && (
          <div className="absolute top-2 left-2 bg-error text-error-foreground text-[11px] font-bold px-2 py-0.5 rounded-full z-10">
            -{discount}%
          </div>
        )}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-400"
        />
        <div className="absolute top-2 right-2 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
          <button
            onClick={(e) => onToggleLike(e, product.id)}
            aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md border transition-all active:scale-90 ${
              isLiked ? 'bg-like text-white border-transparent' : 'bg-card border-border hover:bg-like/5'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={(e) => onAddToCart(e, product.id)}
            aria-label={inCart ? 'In cart' : 'Add to cart'}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md border transition-all active:scale-90 ${
              inCart ? 'bg-primary text-primary-foreground border-transparent' : 'bg-card border-border hover:bg-primary/5'
            }`}
          >
            {inCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5 text-muted-foreground" />}
          </button>
        </div>
      </div>

      <div className="p-3">
        <p className="text-[11px] text-muted-foreground truncate mb-0.5">{product.seller.name}</p>
        <h3 className="font-medium text-foreground mb-2 line-clamp-2 text-sm leading-snug">{product.name}</h3>

        <div className="flex items-center gap-1.5 mb-2">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
          <span className="text-xs font-medium text-foreground">{product.rating}</span>
          <span className="text-xs text-muted-foreground">({product.reviews.toLocaleString()})</span>
        </div>

        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-foreground">${product.price}</span>
          {product.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">${product.originalPrice}</span>
          )}
        </div>
        {product.originalPrice && (
          <p className="text-xs text-success font-semibold mt-0.5">
            Save ${(product.originalPrice - product.price).toFixed(2)}
          </p>
        )}
      </div>
    </Link>
  );
}

// ── Skeleton grid ─────────────────────────────────────────────────────────────
function DealsSkeleton({ cols = 6, count = 6 }: { cols?: number; count?: number }) {
  return (
    <div className={`grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-${cols} gap-4`}>
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-64 rounded-2xl" />
      ))}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
function useCountdown(targetSeconds: number) {
  const [remaining, setRemaining] = useState(targetSeconds);
  useEffect(() => {
    const tick = setInterval(() => setRemaining(s => Math.max(0, s - 1)), 1000);
    return () => clearInterval(tick);
  }, []);
  const h = Math.floor(remaining / 3600).toString().padStart(2, '0');
  const m = Math.floor((remaining % 3600) / 60).toString().padStart(2, '0');
  const s = (remaining % 60).toString().padStart(2, '0');
  return `${h}:${m}:${s}`;
}

export default function DealsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [flashDeals, setFlashDeals] = useState<any[]>([]);
  const [dailyDeals, setDailyDeals] = useState<any[]>([]);
  const [bestSellers, setBestSellers] = useState<any[]>([]);
  const [likedProducts, setLikedProducts] = useState<Set<string>>(new Set());
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const flashCountdown = useCountdown(23 * 3600 + 45 * 60 + 12);

  useEffect(() => {
    const loadData = () => {
      const savedWishlist = localStorage.getItem('ezyify_wishlist');
      if (savedWishlist) {
        try { setLikedProducts(new Set(JSON.parse(savedWishlist))); } catch { /* silent */ }
      }
      const savedCart = localStorage.getItem('ezyify_cart');
      if (savedCart) {
        try { setCartItems(new Set((JSON.parse(savedCart) as any[]).map(i => i.id))); } catch { /* silent */ }
      }

      setFlashDeals(products.filter(p =>
        p.originalPrice && (p.originalPrice - p.price) / p.originalPrice >= 0.3
      ));
      setDailyDeals(products.filter(p =>
        p.originalPrice &&
        (p.originalPrice - p.price) / p.originalPrice >= 0.2 &&
        (p.originalPrice - p.price) / p.originalPrice < 0.3
      ));
      setBestSellers(
        [...products].filter(p => p.sold && p.sold > 500).sort((a, b) => (b.sold || 0) - (a.sold || 0)).slice(0, 12)
      );
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

  const toggleLike = useCallback((e: React.MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    const wishlist = (() => { try { return JSON.parse(localStorage.getItem('ezyify_wishlist') || '[]'); } catch { return []; } })();
    if (wishlist.includes(productId)) {
      const next = wishlist.filter((id: string) => id !== productId);
      localStorage.setItem('ezyify_wishlist', JSON.stringify(next));
      setLikedProducts(new Set(next));
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
    const cart = (() => { try { return JSON.parse(localStorage.getItem('ezyify_cart') || '[]'); } catch { return []; } })();
    const existing = cart.find((i: any) => i.id === productId);
    if (existing) {
      existing.quantity += 1;
      toast.success('Quantity updated in cart');
    } else {
      cart.push({ id: productId, quantity: 1 });
      toast.success('Added to cart');
    }
    localStorage.setItem('ezyify_cart', JSON.stringify(cart));
    setCartItems(new Set(cart.map((i: any) => i.id)));
    window.dispatchEvent(new Event('cartUpdated'));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Deals & Offers — Best Discounts"
        description="Discover amazing deals, flash sales, and discounts on Ezyify. Save big on your favorite products from verified sellers."
        keywords="deals, offers, discounts, flash sales, shopping deals"
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Page header */}
        <div className="mb-8">
          <Link to="/shop" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground text-sm font-medium mb-4 transition-colors">
            ← Back to Shop
          </Link>
          <h1 className="font-semibold text-foreground mb-1">Deals & Offers</h1>
          <p className="text-sm text-muted-foreground">Limited-time offers and exclusive discounts — save up to 50%</p>
        </div>

        {/* Flash Deals */}
        <div className="mb-12">
          <SectionHeader
            icon={Zap}
            iconBg="bg-error/10"
            iconColor="text-error"
            title="Flash Deals"
            subtitle="30%+ off — Limited time only!"
            badge={
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-error/8 border border-error/20 rounded-xl shrink-0">
                <Clock className="w-3.5 h-3.5 text-error" />
                <span className="text-xs font-semibold text-error">Ends in {flashCountdown}</span>
              </div>
            }
          />
          {isLoading ? (
            <DealsSkeleton cols={6} count={6} />
          ) : flashDeals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {flashDeals.map(p => (
                <DealCard
                  key={p.id}
                  product={p}
                  isLiked={likedProducts.has(p.id)}
                  inCart={cartItems.has(p.id)}
                  onToggleLike={toggleLike}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No flash deals right now — check back soon!</p>
          )}
        </div>

        {/* Daily Deals */}
        <div className="mb-12">
          <SectionHeader
            icon={Tag}
            iconBg="bg-primary/10"
            iconColor="text-primary"
            title="Daily Deals"
            subtitle="Today's special offers — 20–30% off"
          />
          {isLoading ? (
            <DealsSkeleton cols={5} count={5} />
          ) : dailyDeals.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {dailyDeals.map(p => (
                <DealCard
                  key={p.id}
                  product={p}
                  isLiked={likedProducts.has(p.id)}
                  inCart={cartItems.has(p.id)}
                  onToggleLike={toggleLike}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground py-8 text-center">No daily deals today — check back tomorrow!</p>
          )}
        </div>

        {/* Best Sellers */}
        <div>
          <SectionHeader
            icon={TrendingUp}
            iconBg="bg-success/10"
            iconColor="text-success"
            title="Best Sellers"
            subtitle="Most popular products with great prices"
          />
          {isLoading ? (
            <DealsSkeleton cols={4} count={8} />
          ) : bestSellers.length > 0 && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {bestSellers.map(p => (
                <DealCard
                  key={p.id}
                  product={p}
                  isLiked={likedProducts.has(p.id)}
                  inCart={cartItems.has(p.id)}
                  onToggleLike={toggleLike}
                  onAddToCart={addToCart}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
