import React from 'react';
import { Link } from 'react-router';
import { Heart, Star, ShoppingCart, Check } from 'lucide-react';

interface ProductCardProps {
  product: any;
  size?: 'normal' | 'small';
  isLiked: boolean;
  inCart: boolean;
  onToggleLike: (e: React.MouseEvent, id: string) => void;
  onAddToCart: (e: React.MouseEvent, id: string) => void;
}

export const ProductCard = React.memo(({
  product,
  size = 'normal',
  isLiked,
  inCart,
  onToggleLike,
  onAddToCart,
}: ProductCardProps) => {
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const savedCart = localStorage.getItem('ezyify_cart');
    const cart = savedCart ? JSON.parse(savedCart) : [];
    const existing = cart.find((item: any) => item.id === product.id);
    if (existing) {
      existing.quantity += 1;
    } else {
      cart.push({ id: product.id, quantity: 1 });
    }
    localStorage.setItem('ezyify_cart', JSON.stringify(cart));
    onAddToCart(e, product.id);
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleToggleLike = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const savedWishlist = localStorage.getItem('ezyify_wishlist');
    const wishlist = savedWishlist ? JSON.parse(savedWishlist) : [];
    if (isLiked) {
      localStorage.setItem('ezyify_wishlist', JSON.stringify(wishlist.filter((id: string) => id !== product.id)));
    } else {
      wishlist.push(product.id);
      localStorage.setItem('ezyify_wishlist', JSON.stringify(wishlist));
    }
    onToggleLike(e, product.id);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative bg-card border border-border rounded-card overflow-hidden flex flex-col transition-all duration-200 hover:shadow-xl hover:-translate-y-1 hover:border-border-strong active:translate-y-0 tap-highlight-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {/* Image wrapper */}
      <div className="relative overflow-hidden aspect-square bg-muted">
        {/* Discount badge */}
        {discount > 0 && (
          <div className="absolute top-2.5 left-2.5 z-10 bg-accent-brand text-accent-brand-foreground text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
            -{discount}%
          </div>
        )}

        {/* Product image */}
        <img
          src={product.image}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-400 group-hover:scale-105"
        />

        {/* Overlay actions — appear on hover */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-2 transition-all duration-200 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0">
          <button
            onClick={handleToggleLike}
            aria-label={isLiked ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md border transition-all duration-150 active:scale-90 ${
              isLiked
                ? 'bg-like text-white border-transparent'
                : 'bg-card border-border hover:border-like/30 hover:bg-like/5'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
          <button
            onClick={handleAddToCart}
            aria-label={inCart ? 'In cart' : 'Add to cart'}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shadow-md border transition-all duration-150 active:scale-90 ${
              inCart
                ? 'bg-primary text-primary-foreground border-transparent shadow-brand'
                : 'bg-card border-border hover:border-primary/30 hover:bg-primary/5'
            }`}
          >
            {inCart
              ? <Check className="w-3.5 h-3.5" />
              : <ShoppingCart className="w-3.5 h-3.5 text-foreground-secondary" />
            }
          </button>
        </div>

        {/* Quick add bar — slides up on hover */}
        {product.inStock !== false && (
          <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
            <button
              onClick={handleAddToCart}
              className="w-full h-11 text-xs font-semibold text-white bg-brand-gradient transition-all duration-150 inline-flex items-center justify-center gap-1.5"
            >
              {inCart ? <><Check className="w-3.5 h-3.5" /> Added to cart</> : 'Quick add'}
            </button>
          </div>
        )}

        {/* Out of stock overlay */}
        {product.inStock === false && (
          <div className="absolute inset-0 bg-background/70 backdrop-blur-sm flex items-center justify-center">
            <span className="text-sm font-semibold text-foreground bg-card border border-border px-3 py-1 rounded-full shadow-sm">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-[11px] text-foreground-tertiary truncate">{product.seller?.name}</p>

        <h3 className={`font-medium text-foreground line-clamp-2 leading-snug ${
          size === 'small' ? 'text-xs' : 'text-sm'
        }`}>
          {product.name}
        </h3>

        <div className="flex items-center gap-1.5">
          <Star className="w-3 h-3 fill-amber-400 text-warning shrink-0" />
          <span className="text-xs font-medium text-foreground tabular-nums">{Number(product.rating).toFixed(1)}</span>
          <span className="text-xs text-foreground-tertiary">({product.reviews?.toLocaleString()})</span>
          {product.sold > 500 && (
            <span className="text-[10px] font-semibold text-accent-brand ml-auto">{product.sold}+ sold</span>
          )}
        </div>

        <div className="flex items-baseline gap-1.5 mt-auto pt-1">
          <span className={`font-display font-bold tabular-nums text-foreground ${size === 'small' ? 'text-base' : 'text-lg'}`}>
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-xs text-foreground-tertiary line-through tabular-nums">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
});

ProductCard.displayName = 'ProductCard';
