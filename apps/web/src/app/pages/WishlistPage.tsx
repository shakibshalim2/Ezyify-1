import { useState, useEffect, type MouseEvent } from 'react';
import { Link } from 'react-router';
import { EmptyWishlist } from '../components/EmptyStates';
import { Heart, ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { products } from '../data/products';
import { ProductCard } from '../components/shop/ProductCard';
import { toProductSummary } from '../data/products';
import { Skeleton } from '../components/ui/skeleton';
import { SEO, SEOConfigs } from '../components/SEO';
import { toast } from 'sonner';

// SKELETON FOR INSTANT UI
function WishlistSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.wishlist} />
      <div className="max-w-screen-xl mx-auto px-4 pb-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
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

export default function WishlistPage() {
  // ALL HOOKS MUST BE AT TOP LEVEL - NO CONDITIONAL HOOKS - UPDATED 2026-01-28
  const [wishlistIds, setWishlistIds] = useState<string[]>([]);
  const [cartItems, setCartItems] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(true);

  // Load wishlist and cart progressively
  useEffect(() => {
    const loadWishlistData = () => {
      const savedWishlist = localStorage.getItem('ezyify_wishlist');
      let loadedWishlistIds: string[] = [];

      if (savedWishlist) {
        try {
          loadedWishlistIds = JSON.parse(savedWishlist);
        } catch (e) {
          console.error('Failed to parse wishlist', e);
        }
      }

      const savedCart = localStorage.getItem('ezyify_cart');
      let cartItemIds: string[] = [];

      if (savedCart) {
        try {
          const cart = JSON.parse(savedCart);
          cartItemIds = cart.map((item: any) => item.id);
        } catch (e) {
          console.error('Failed to parse cart', e);
        }
      }

      setWishlistIds(loadedWishlistIds);
      setCartItems(new Set(cartItemIds));
      setIsLoading(false);
    };

    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(loadWishlistData, { timeout: 100 });
      return () => cancelIdleCallback(handle);
    } else {
      const timer = setTimeout(loadWishlistData, 16);
      return () => clearTimeout(timer);
    }
  }, []);

  // Compute wishlist products from IDs
  const wishlistProducts = products.filter((p) => wishlistIds.includes(p.id));

  const handleRemoveFromWishlist = (productId: string) => {
    const newWishlist = wishlistIds.filter((id) => id !== productId);
    setWishlistIds(newWishlist);
    localStorage.setItem('ezyify_wishlist', JSON.stringify(newWishlist));
    toast.success('Removed from wishlist');
  };

  const handleToggleLike = (e: MouseEvent, productId: string) => {
    e.preventDefault();
    e.stopPropagation();
    handleRemoveFromWishlist(productId);
  };

  const handleAddToCart = (e: MouseEvent, productId: string) => {
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
    setCartItems((prev) => new Set([...prev, productId]));
    // Dispatch custom event to update Navigation cart count
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleAddAllToCart = () => {
    const savedCart = localStorage.getItem('ezyify_cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];

    let addedCount = 0;
    wishlistIds.forEach((id) => {
      const existingItem = cart.find((item: any) => item.id === id);
      if (!existingItem) {
        cart.push({ id, quantity: 1 });
        addedCount++;
      }
    });

    if (addedCount > 0) {
      localStorage.setItem('ezyify_cart', JSON.stringify(cart));
      const ids = cart.map((item: any) => item.id);
      setCartItems(new Set(ids));
      toast.success(`${addedCount} ${addedCount === 1 ? 'item' : 'items'} added to cart`);
      // Dispatch custom event to update Navigation cart count
      window.dispatchEvent(new Event('cartUpdated'));
    } else {
      toast.info('All items already in cart');
    }
  };

  const handleClearWishlist = () => {
    if (confirm('Are you sure you want to clear your wishlist?')) {
      setWishlistIds([]);
      localStorage.setItem('ezyify_wishlist', JSON.stringify([]));
      toast.success('Wishlist cleared');
    }
  };

  // Show skeleton while loading
  if (isLoading) {
    return <WishlistSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="My Wishlist - Ezyify"
        description="View and manage your saved products on Ezyify"
      />

      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <Link
          to="/shop"
          className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shop</span>
        </Link>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="font-semibold text-foreground">
              My Wishlist ({wishlistProducts.length})
            </h1>
            <p className="text-foreground-secondary mt-1">Save your favorite products for later</p>
          </div>

          {wishlistProducts.length > 0 && (
            <div className="flex gap-3">
              <button
                onClick={handleAddAllToCart}
                className="px-4 py-2 rounded-2xl font-medium text-sm text-white shadow-brand hover:shadow-brand-lg transition-all flex items-center gap-2"
                style={{ background: 'var(--brand-gradient)' }}
              >
                <ShoppingCart className="w-4 h-4" />
                Add All to Cart
              </button>
              <button
                onClick={handleClearWishlist}
                className="px-4 py-2 border border-border rounded-xl hover:bg-muted transition-colors text-foreground font-medium flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Clear All
              </button>
            </div>
          )}
        </div>

        {wishlistProducts.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {wishlistProducts.map((product) => (
              <ProductCard key={product.id}
                product={toProductSummary(product)} />
            ))}
          </div>
        )}

        {/* Continue Shopping */}
        {wishlistProducts.length > 0 && (
          <div className="mt-12 text-center">
            <Link
              to="/shop"
              className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium"
            >
              Continue Shopping
              <ArrowLeft className="w-4 h-4 rotate-180" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
