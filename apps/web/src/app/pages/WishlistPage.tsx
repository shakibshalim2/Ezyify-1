import { useMemo } from 'react';
import { Link } from 'react-router';
import { useQueries } from '@tanstack/react-query';
import { ShoppingCart, Trash2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { queryKeys, useApi } from '@ezyify/core';
import { EmptyWishlist } from '../components/EmptyStates';
import { ProductCard } from '../components/shop/ProductCard';
import { Button } from '../components/primitives/Button';
import { Skeleton } from '../components/primitives/Skeleton';
import { SEO, SEOConfigs } from '../components/SEO';
import { useWishlist } from '../lib/wishlist';
import { useAddLine, useInCart } from '../lib/data';

function WishlistSkeleton() {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4" aria-busy>
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="bg-card border border-border rounded-card overflow-hidden">
          <Skeleton className="aspect-square" />
          <div className="p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Wishlist ids live on the device (`lib/wishlist`); products resolve through the catalog API like the guest cart. */
export default function WishlistPage() {
  const api = useApi();
  const { ids, toggle } = useWishlist();
  const inCart = useInCart();
  const { add } = useAddLine();

  const queries = useQueries({
    queries: ids.map(id => ({ queryKey: queryKeys.product(id), queryFn: () => api.catalog.product(id), staleTime: 60_000 })),
  });
  const loading = ids.length > 0 && queries.some(q => q.isLoading);
  const products = useMemo(() => queries.flatMap(q => (q.data ? [q.data] : [])), [queries]);

  const addAll = async () => {
    const missing = products.filter(p => !inCart.has(p.id));
    if (missing.length === 0) return toast.info('Everything here is already in your cart');
    try {
      await Promise.all(missing.map(p => add(p.id, 1)));
      toast.success(`${missing.length} ${missing.length === 1 ? 'item' : 'items'} added to cart`);
    } catch {
      toast.error("Couldn't add everything — please try again");
    }
  };

  const clearAll = () => {
    ids.forEach(toggle);
    toast.success('Wishlist cleared');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.wishlist} />
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 pb-6">
        <Link to="/shop" className="inline-flex items-center gap-2 text-foreground-secondary hover:text-foreground mb-4 transition-colors">
          <ArrowLeft className="w-4 h-4" aria-hidden />
          <span>Back to Shop</span>
        </Link>

        <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">
              My Wishlist{ids.length > 0 && <span className="text-foreground-tertiary font-normal"> · {ids.length}</span>}
            </h1>
            <p className="text-foreground-secondary mt-1">Saved on this device — sign in on the same browser to keep them.</p>
          </div>

          {products.length > 0 && (
            <div className="flex gap-3">
              <Button variant="primary" size="md" onClick={addAll} leftIcon={<ShoppingCart className="w-4 h-4" aria-hidden />}>
                Add all to cart
              </Button>
              <Button variant="outline" size="md" onClick={clearAll} leftIcon={<Trash2 className="w-4 h-4" aria-hidden />}>
                Clear
              </Button>
            </div>
          )}
        </div>

        {loading ? (
          <WishlistSkeleton />
        ) : products.length === 0 ? (
          <EmptyWishlist />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {products.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}

        {products.length > 0 && (
          <div className="mt-12 text-center">
            <Link to="/shop" className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-medium">
              Continue shopping
              <ArrowLeft className="w-4 h-4 rotate-180" aria-hidden />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
