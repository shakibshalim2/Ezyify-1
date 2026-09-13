import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Check, Clock3, Heart, ShoppingCart, Star, Tag, TrendingUp, Zap } from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { EmptyState } from '../components/primitives/EmptyState';
import { Skeleton } from '../components/primitives/Skeleton';
import { products } from '../data/products';
import { fadeUp, staggerContainer } from '../lib/motion';

function DealSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[.72] rounded-card" />
      ))}
    </div>
  );
}
function DealCard({
  product,
  liked,
  cart,
  onLike,
  onCart,
}: {
  product: any;
  liked: boolean;
  cart: boolean;
  onLike: () => void;
  onCart: () => void;
}) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : 0;
  return (
    <Card padding="none" interactive className="group overflow-hidden">
      <Link to={`/product/${product.id}`}>
        <div className="relative aspect-square bg-muted">
          <ImageWithFallback
            src={product.image}
            alt={product.name}
            loading="lazy"
            className="size-full object-cover transition-transform group-hover:scale-105"
          />
          {discount > 0 && (
            <span className="absolute left-2 top-2 rounded-full bg-error px-2 py-1 text-[11px] font-bold text-error-foreground">
              -{discount}%
            </span>
          )}
          <div className="absolute right-2 top-2 flex flex-col gap-2">
            <Button
              aria-label="Toggle wishlist"
              variant="secondary"
              size="icon-sm"
              onClick={(event) => {
                event.preventDefault();
                onLike();
              }}
              className={liked ? 'text-error' : ''}
            >
              <Heart className={liked ? 'fill-error' : ''} />
            </Button>
            <Button
              aria-label="Add item to cart"
              variant={cart ? 'primary' : 'secondary'}
              size="icon-sm"
              onClick={(event) => {
                event.preventDefault();
                onCart();
              }}
            >
              {cart ? <Check /> : <ShoppingCart />}
            </Button>
          </div>
        </div>
        <div className="space-y-1.5 p-3">
          <p className="truncate text-xs text-foreground-secondary">{product.seller.name}</p>
          <h3 className="line-clamp-2 text-sm font-semibold">{product.name}</h3>
          <div className="flex items-center gap-1 text-xs">
            <Star className="size-3 fill-warning text-warning" />
            {product.rating}
          </div>
          <p className="font-display text-lg font-bold tabular-nums text-accent-brand">
            ${product.price}{' '}
            {product.originalPrice && (
              <span className="ml-1 text-xs font-normal text-foreground-tertiary line-through">
                ${product.originalPrice}
              </span>
            )}
          </p>
        </div>
      </Link>
    </Card>
  );
}
export default function DealsPage() {
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Set<string>>(new Set());
  const deals = useMemo(() => products.filter((product) => product.originalPrice).slice(0, 12), []);
  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), 110);
    return () => clearTimeout(timer);
  }, []);
  const add = (id: string) => {
    setCart((current) => new Set(current).add(id));
    toast.success('Added to cart');
  };
  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Deals — Ezyify"
        description="Discover limited-time deals and best-selling products."
      />
      <motion.main
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl space-y-8 px-4 py-6 lg:px-6 lg:py-8"
      >
        <motion.header
          variants={fadeUp}
          className="overflow-hidden rounded-sheet bg-brand-gradient p-6 text-white sm:p-8"
        >
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold">
              <Zap className="size-4" />
              Limited time offers
            </div>
            <h1 className="font-display text-3xl font-bold">Deals worth sharing</h1>
            <p className="mt-2 text-sm text-white/85">
              Curated prices on products creators and shoppers love.
            </p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-background/15 px-3 py-2 text-sm font-semibold">
              <Clock3 className="size-4" />
              New flash drops daily
            </div>
          </div>
        </motion.header>
        <motion.section variants={fadeUp} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-display text-xl font-semibold">Flash deals</h2>
              <p className="text-sm text-foreground-secondary">Save more while stock lasts.</p>
            </div>
            <Tag className="size-6 text-accent-brand" />
          </div>
          {loading ? (
            <DealSkeleton />
          ) : deals.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {deals.map((product) => (
                <DealCard
                  key={product.id}
                  product={product}
                  liked={liked.has(product.id)}
                  cart={cart.has(product.id)}
                  onLike={() =>
                    setLiked((current) => {
                      const next = new Set(current);
                      next.has(product.id) ? next.delete(product.id) : next.add(product.id);
                      return next;
                    })
                  }
                  onCart={() => add(product.id)}
                />
              ))}
            </div>
          ) : (
            <EmptyState
              kind="orders"
              title="No deals just yet"
              description="New offers land every day. Browse the shop instead."
              action={
                <Button asChild>
                  <Link to="/shop">Browse shop</Link>
                </Button>
              }
            />
          )}
        </motion.section>
        <motion.section variants={fadeUp}>
          <Card variant="featured" className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <TrendingUp className="size-8 text-primary" />
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold">Watchlist price alerts</h2>
              <p className="text-sm text-foreground-secondary">
                Save an item and we will let you know when its price drops.
              </p>
            </div>
            <Button asChild variant="outline">
              <Link to="/wishlist">View wishlist</Link>
            </Button>
          </Card>
        </motion.section>
      </motion.main>
    </div>
  );
}
