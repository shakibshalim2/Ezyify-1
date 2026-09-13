import React, { useState, useEffect, useRef } from 'react';
import { ProductCard } from './ProductCard';

interface VirtualProductGridProps {
  products: any[];
  viewMode: 'large' | 'grid';
  likedProducts: Set<string>;
  cartItems: Set<string>;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onAddToCart: (e: React.MouseEvent, id: string) => void;
}

const ITEMS_PER_PAGE = 8; // Reduced from 12 for better memory usage

export const VirtualProductGrid = React.memo(({
  products,
  viewMode,
  likedProducts,
  cartItems,
  onToggleLike,
  onAddToCart
}: VirtualProductGridProps) => {
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE);
  const loaderRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Cleanup previous observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && displayedCount < products.length) {
          setDisplayedCount(prev => Math.min(prev + ITEMS_PER_PAGE, products.length));
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observerRef.current.observe(currentLoader);
    }

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [displayedCount, products.length]);

  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE);
  }, [products]);

  const displayedProducts = products.slice(0, displayedCount);

  return (
    <>
      <div className={`grid gap-4 mb-8 ${
        viewMode === 'large' 
          ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
          : 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4'
      }`}>
        {displayedProducts.map(product => (
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

      {displayedCount < products.length && (
        <div ref={loaderRef} className="text-center py-8">
          <div className="inline-flex items-center gap-2 text-foreground-secondary">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span>Loading more...</span>
          </div>
        </div>
      )}
    </>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for better memoization
  return (
    prevProps.products === nextProps.products &&
    prevProps.viewMode === nextProps.viewMode &&
    prevProps.likedProducts === nextProps.likedProducts &&
    prevProps.cartItems === nextProps.cartItems
  );
});

VirtualProductGrid.displayName = 'VirtualProductGrid';