import React, { useState } from 'react';
import { Link } from 'react-router';
import { Heart, Star, ShoppingCart, Check } from 'lucide-react';
import { toast } from 'sonner';
import { discountPercent, formatCompactNumber, formatMoney, type ProductSummary } from '@ezyify/core';
import { useAddLine, useInCart } from '../../lib/data';
import { useWishlist } from '../../lib/wishlist';
import { formErrors } from '../../lib/apiErrors';

interface ProductCardProps {
  product: ProductSummary & { soldCount?: number };
  size?: 'normal' | 'small';
}

const BADGE_LABEL: Record<NonNullable<ProductSummary['badge']>, string> = { new: 'New', sale: 'Sale', bestseller: 'Bestseller', limited: 'Limited', live: 'Live' };

/** Catalog card: add-to-cart hits the server cart when signed in and the guest cart otherwise; wishlist stays local. */
export const ProductCard = React.memo(({ product, size = 'normal' }: ProductCardProps) => {
  const discount = discountPercent(product.price, product.compareAtPrice);
  const inCart = useInCart().has(product.id);
  const { add, pending } = useAddLine();
  const { has, toggle } = useWishlist();
  const isLiked = has(product.id);
  const [justAdded, setJustAdded] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (pending) return;
    try {
      await add(product.id, 1);
      setJustAdded(true);
      window.setTimeout(() => setJustAdded(false), 1500);
      toast.success('Added to cart');
    } catch (err) {
      toast.error(formErrors(err).message ?? 'Couldn’t add to cart');
    }
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
    toast.success(isLiked ? 'Removed from wishlist' : 'Added to wishlist');
  };

  const added = inCart || justAdded;

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative bg-card border border-border rounded-card overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-border-strong active:translate-y-0 tap-highlight-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative overflow-hidden aspect-square bg-muted">
        {discount !== null && discount > 0 ? (
          <div className="absolute top-2.5 left-2.5 z-10 bg-accent-brand text-accent-brand-foreground text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">-{discount}%</div>
        ) : product.badge ? (
          <div className="absolute top-2.5 left-2.5 z-10 bg-primary text-primary-foreground text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">{BADGE_LABEL[product.badge]}</div>
        ) : null}

        <img src={product.imageUrl} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" />

        <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 transition-all duration-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 focus-within:opacity-100 focus-within:translate-y-0">
          <button
            type="button"
            onClick={handleToggleLike}
            aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={isLiked}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md border transition-all duration-150 active:scale-90 ${isLiked ? 'bg-like text-white border-transparent' : 'bg-card border-border hover:border-like/30 hover:bg-like/5'}`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            type="button"
            onClick={handleAddToCart}
            aria-label={added ? 'In cart' : `Add ${product.name} to cart`}
            disabled={!product.inStock || pending}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md border transition-all duration-150 active:scale-90 disabled:opacity-60 ${added ? 'bg-primary text-primary-foreground border-transparent shadow-brand' : 'bg-card border-border hover:border-primary/30 hover:bg-primary/5'}`}
          >
            {added ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5 text-foreground-secondary" />}
          </button>
        </div>

        {product.inStock && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            <button type="button" onClick={handleAddToCart} disabled={pending} className="w-full h-11 text-xs font-semibold text-white bg-brand-gradient transition-all duration-150 inline-flex items-center justify-center gap-1.5">
              {added ? <><Check className="w-3.5 h-3.5" /> Added to cart</> : 'Quick add'}
            </button>
          </div>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-sm font-semibold text-foreground bg-card border border-border px-3 py-1 rounded-full shadow-sm">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-[11px] text-foreground-tertiary truncate">{product.seller.name}</p>
        <h3 className={`font-medium text-foreground line-clamp-2 leading-snug ${size === 'small' ? 'text-xs' : 'text-sm'}`}>{product.name}</h3>
        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3 fill-amber-400 text-warning shrink-0" />
          <span className="text-xs font-medium text-foreground tabular-nums">{product.rating.toFixed(1)}</span>
          <span className="text-xs text-foreground-tertiary">({formatCompactNumber(product.reviewCount)})</span>
          {(product.soldCount ?? 0) > 500 && <span className="text-[10px] font-semibold text-accent-brand ml-auto">{formatCompactNumber(product.soldCount!)} sold</span>}
        </div>
        <div className="flex items-baseline gap-1.5 mt-auto pt-1">
          <span className={`font-display font-bold tabular-nums text-foreground ${size === 'small' ? 'text-base' : 'text-lg'}`}>{formatMoney(product.price)}</span>
          {product.compareAtPrice && <span className="text-xs text-foreground-tertiary line-through tabular-nums">{formatMoney(product.compareAtPrice)}</span>}
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';
