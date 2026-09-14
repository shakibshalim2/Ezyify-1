import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, Flame } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { discountPercent, useCategories, useProducts, type Category, type ProductSummary } from '@ezyify/core';
import { Skeleton } from '../components/ui/skeleton';
import { EmptySearchResults } from '../components/EmptyStates';
import { QueryError } from '../components/QueryError';
import { SEO, SEOConfigs } from '../components/SEO';
import { Button } from '../components/primitives/Button';
import { ProductCard } from '../components/shop/ProductCard';
import { useDebounced } from '../hooks/useDebounced';
import { useInfiniteList } from '../lib/data';
import { fadeUp, staggerContainer, DURATION } from '../lib/motion';
import { cn } from '../components/ui/utils';
import { Img } from '../components/primitives/Img';

type Sort = NonNullable<Parameters<typeof useProducts>[0]>['sort'];
const SORT_OPTIONS: { value: NonNullable<Sort>; label: string }[] = [
  { value: 'popular', label: 'Best Selling' },
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

const PROMO_SLIDES = [
  { headline: 'Up to 50% off tech', description: 'Limited time only', cta: 'Shop tech', to: '/shop?category=tech', className: 'bg-brand-gradient' },
  { headline: 'New season fashion', description: 'Exclusive collections', cta: 'Explore', to: '/shop?category=fashion', className: 'bg-brand-gradient-warm' },
  { headline: 'Beauty & personal care', description: 'Premium brands on sale', cta: 'Browse', to: '/shop?category=beauty', className: 'bg-aurora' },
];

function PromoCarouselSlide({ slide, isActive }: { slide: (typeof PROMO_SLIDES)[number]; isActive: boolean }) {
  return (
    <motion.div
      initial={false}
      animate={{ opacity: isActive ? 1 : 0, scale: isActive ? 1 : 0.95 }}
      transition={{ duration: DURATION.normal }}
      className={cn('absolute inset-0 rounded-card overflow-hidden', !isActive && 'pointer-events-none')}
      aria-hidden={!isActive}
    >
      <div className={cn('h-full flex flex-col justify-center px-6 py-8 text-white', slide.className)}>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={isActive ? { opacity: 1, y: 0 } : undefined} transition={{ delay: 0.1, duration: DURATION.slow }}>
          <h3 className="font-display text-2xl md:text-3xl font-bold mb-2">{slide.headline}</h3>
          <p className="text-sm md:text-base opacity-90 mb-4">{slide.description}</p>
          <Button size="md" variant="primary" className="w-fit" asChild>
            <Link to={slide.to} tabIndex={isActive ? 0 : -1}>{slide.cta}</Link>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}

function FlashDealCountdown() {
  // Flash window ends at the next local midnight — deterministic without a promotions API.
  const [left, setLeft] = useState(0);
  useEffect(() => {
    const tick = () => {
      const end = new Date();
      end.setHours(24, 0, 0, 0);
      setLeft(Math.max(0, end.getTime() - Date.now()));
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, []);
  const h = Math.floor(left / 3_600_000);
  const m = Math.floor((left % 3_600_000) / 60_000);
  const s = Math.floor((left % 60_000) / 1000);
  return (
    <div className="inline-flex items-center gap-2 bg-accent-brand-subtle px-3 py-1.5 rounded-xl">
      <Flame className="size-4 text-accent-brand" />
      <span className="text-xs font-semibold text-accent-brand">Flash deals end in</span>
      <span className="font-display font-bold text-accent-brand tabular-nums">
        {String(h).padStart(2, '0')}:{String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
      </span>
    </div>
  );
}

function CategoryTile({ cat, onSelect, reduce }: { cat: Category; onSelect: () => void; reduce: boolean }) {
  const Comp = reduce ? 'button' : motion.button;
  return (
    <Comp
      type="button"
      onClick={onSelect}
      {...(!reduce ? { variants: fadeUp } : {})}
      className="group relative overflow-hidden rounded-card h-40 md:h-48 bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {cat.imageUrl && <Img src={cat.imageUrl} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end items-start p-4">
        <h3 className="font-display font-semibold text-white">{cat.name}</h3>
        <p className="text-xs text-white/80">{cat.productCount} item{cat.productCount === 1 ? '' : 's'}</p>
      </div>
    </Comp>
  );
}

function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" aria-busy>
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
  const [params, setParams] = useSearchParams();
  const reduce = !!useReducedMotion();
  const category = params.get('category') ?? '';
  const [sortBy, setSortBy] = useState<NonNullable<Sort>>('popular');
  const [searchQuery, setSearchQuery] = useState(params.get('q') ?? '');
  const q = useDebounced(searchQuery.trim(), 300);
  const [carouselIndex, setCarouselIndex] = useState(0);

  const categories = useCategories();
  const products = useProducts({ ...(category ? { category } : {}), ...(q ? { q } : {}), sort: sortBy, pageSize: 24 });
  const { items, loadMore, hasMore, loadingMore } = useInfiniteList<ProductSummary>(products);
  // Deals rail: the biggest discounts across the catalog, independent of the active filter.
  const deals = useProducts({ pageSize: 50 });
  const flashDeals = useMemo(
    () =>
      (deals.data?.pages[0]?.items ?? [])
        .map(p => ({ p, d: discountPercent(p.price, p.compareAtPrice) ?? 0 }))
        .filter(x => x.d >= 30)
        .sort((a, b) => b.d - a.d)
        .slice(0, 6)
        .map(x => x.p),
    [deals.data],
  );

  const setCategory = (slug: string) => {
    const next = new URLSearchParams(params);
    if (slug) next.set('category', slug);
    else next.delete('category');
    setParams(next, { replace: true });
  };

  useEffect(() => {
    if (reduce) return;
    const timer = setInterval(() => setCarouselIndex(prev => (prev + 1) % PROMO_SLIDES.length), 5000);
    return () => clearInterval(timer);
  }, [reduce]);

  const activeCategory = categories.data?.find(c => c.slug === category);
  const chips = [{ slug: '', name: 'All' }, ...(categories.data ?? []).map(c => ({ slug: c.slug, name: c.name }))];

  return (
    <div className="min-h-screen bg-background pb-nav">
      <SEO {...SEOConfigs.shop} />

      <div className="max-w-7xl mx-auto px-4 py-4 space-y-6">
        <div className="flex flex-col gap-3">
          <h1 className="font-display text-2xl font-bold text-foreground">Shop</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-tertiary" />
            <input
              type="search"
              aria-label="Search products"
              placeholder="Search products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background-elevated border border-border rounded-xl text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <motion.div initial={reduce ? {} : { opacity: 0, x: -12 }} animate={reduce ? {} : { opacity: 1, x: 0 }} transition={{ duration: DURATION.normal }} className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide" role="group" aria-label="Categories">
          {chips.map(c => (
            <button
              key={c.slug}
              type="button"
              onClick={() => setCategory(c.slug)}
              aria-pressed={category === c.slug}
              className={cn(
                'px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all',
                category === c.slug ? 'bg-primary text-primary-foreground' : 'bg-background-elevated border border-border text-foreground hover:border-border-strong',
              )}
            >
              {c.name}
            </button>
          ))}
        </motion.div>

        {!q && !category && (
          <>
            <motion.div initial={reduce ? {} : { opacity: 0, y: 12 }} animate={reduce ? {} : { opacity: 1, y: 0 }} transition={{ duration: DURATION.slow }} className="relative h-48 md:h-64 rounded-card overflow-hidden border border-border-subtle">
              {PROMO_SLIDES.map((slide, idx) => (
                <PromoCarouselSlide key={idx} slide={slide} isActive={idx === carouselIndex} />
              ))}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                {PROMO_SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCarouselIndex(idx)}
                    aria-label={`Go to slide ${idx + 1} of ${PROMO_SLIDES.length}`}
                    aria-current={idx === carouselIndex ? 'true' : undefined}
                    className="flex h-6 w-6 items-center justify-center rounded-full"
                  >
                    <span className={cn('block rounded-full transition-all', idx === carouselIndex ? 'bg-white w-2 h-2' : 'bg-white/50 w-1.5 h-1.5')} />
                  </button>
                ))}
              </div>
            </motion.div>

            {flashDeals.length > 0 && (
              <section className="space-y-3" aria-labelledby="flash-deals">
                <div className="flex items-center justify-between">
                  <h2 id="flash-deals" className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
                    <Flame className="size-5 text-accent-brand" />
                    Flash Deals
                  </h2>
                  <FlashDealCountdown />
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
                  {flashDeals.map(product => (
                    <ProductCard key={product.id} product={product} size="small" />
                  ))}
                </div>
              </section>
            )}

            <motion.section initial={reduce ? {} : { opacity: 0, y: 12 }} animate={reduce ? {} : { opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: DURATION.slow }} className="space-y-3" aria-labelledby="browse-categories">
              <h2 id="browse-categories" className="font-display text-lg font-semibold text-foreground">Browse Categories</h2>
              {categories.isLoading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{[0, 1, 2, 3].map(i => <Skeleton key={i} className="h-40 md:h-48 rounded-card" />)}</div>
              ) : (
                <motion.div variants={reduce ? undefined : staggerContainer(0.05)} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {(categories.data ?? []).filter(c => c.productCount > 0).slice(0, 4).map(cat => (
                    <CategoryTile key={cat.id} cat={cat} reduce={reduce} onSelect={() => setCategory(cat.slug)} />
                  ))}
                </motion.div>
              )}
            </motion.section>
          </>
        )}

        <section className="space-y-4" aria-labelledby="products-heading">
          <div className="flex items-center justify-between gap-4">
            <h2 id="products-heading" className="font-display text-lg font-semibold text-foreground">
              {q ? `Results for “${q}”` : activeCategory ? activeCategory.name : 'All Products'}
              {products.data && <span className="ml-2 text-sm font-normal text-foreground-secondary">{products.data.pages[0].pagination.total}</span>}
            </h2>
            <select
              value={sortBy}
              aria-label="Sort products"
              onChange={e => setSortBy(e.target.value as NonNullable<Sort>)}
              className="px-3 py-2 bg-background-elevated border border-border rounded-xl text-foreground text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {SORT_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {products.isLoading ? (
            <ProductGridSkeleton />
          ) : products.error ? (
            <QueryError error={products.error} onRetry={() => void products.refetch()} />
          ) : items.length === 0 ? (
            <div className="py-16">
              <EmptySearchResults />
            </div>
          ) : (
            <>
              <motion.div variants={reduce ? undefined : staggerContainer(0.03)} initial="hidden" animate="visible" className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {items.map(product => (
                  <motion.div key={product.id} variants={reduce ? undefined : fadeUp}>
                    <ProductCard product={product} />
                  </motion.div>
                ))}
              </motion.div>
              {hasMore && (
                <div className="flex justify-center pt-2">
                  <Button variant="secondary" size="lg" loading={loadingMore} onClick={loadMore}>
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
