import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Clock3, Tag, TrendingUp, Zap } from 'lucide-react';
import { flattenPages, useProducts } from '@ezyify/core';
import { SEO } from '../components/SEO';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { EmptyState } from '../components/primitives/EmptyState';
import { Skeleton } from '../components/primitives/Skeleton';
import { ProductCard } from '../components/shop/ProductCard';
import { fadeUp, staggerContainer } from '../lib/motion';

function DealSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" aria-busy>
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton key={i} className="aspect-[.72] rounded-card" />
      ))}
    </div>
  );
}

/** Deals = catalog products with a compare‑at price, via `GET /products?onSale=true`. */
export default function DealsPage() {
  const reduce = useReducedMotion();
  const deals = useProducts({ onSale: true, sort: 'popular', pageSize: 24 });
  const items = flattenPages(deals.data);

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Deals — Today’s best offers" description="Limited-time deals and flash sales from sellers on Ezyify, all protected by escrow." />
      <motion.main variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="mx-auto max-w-7xl space-y-8 px-4 py-6 lg:px-6 lg:py-8">
        <motion.header variants={fadeUp} className="overflow-hidden rounded-sheet bg-brand-gradient p-6 text-white sm:p-8">
          <div className="max-w-xl">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-background/15 px-3 py-1 text-xs font-semibold">
              <Zap className="size-4" aria-hidden />
              Limited time offers
            </div>
            <h1 className="font-display text-3xl font-bold">Deals worth sharing</h1>
            <p className="mt-2 text-sm text-white/85">Curated prices on products creators and shoppers love — every order escrow‑protected.</p>
            <div className="mt-5 inline-flex items-center gap-2 rounded-xl bg-background/15 px-3 py-2 text-sm font-semibold">
              <Clock3 className="size-4" aria-hidden />
              New flash drops daily
            </div>
          </div>
        </motion.header>

        <motion.section variants={fadeUp} className="space-y-4" aria-labelledby="flash-deals">
          <div className="flex items-center justify-between">
            <div>
              <h2 id="flash-deals" className="font-display text-xl font-semibold">Flash deals</h2>
              <p className="text-sm text-foreground-secondary">Save more while stock lasts.</p>
            </div>
            <Tag className="size-6 text-accent-brand" aria-hidden />
          </div>

          {deals.isLoading ? (
            <DealSkeleton />
          ) : deals.isError ? (
            <EmptyState
              kind="error"
              title="Couldn’t load deals"
              description="Check your connection and try again."
              action={<Button onClick={() => deals.refetch()}>Retry</Button>}
            />
          ) : items.length ? (
            <>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                {items.map(product => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
              {deals.hasNextPage && (
                <div className="flex justify-center pt-2">
                  <Button variant="outline" onClick={() => deals.fetchNextPage()} loading={deals.isFetchingNextPage}>
                    Load more deals
                  </Button>
                </div>
              )}
            </>
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
            <TrendingUp className="size-8 text-primary" aria-hidden />
            <div className="flex-1">
              <h2 className="font-display text-lg font-semibold">Your wishlist</h2>
              <p className="text-sm text-foreground-secondary">Save an item from any deal and find it again in one tap.</p>
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
