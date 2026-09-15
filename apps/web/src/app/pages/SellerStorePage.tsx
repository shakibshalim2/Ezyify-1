import { useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  Calendar,
  CheckCircle2,
  Clock3,
  MapPin,
  MessageCircle,
  PackageCheck,
  ShieldCheck,
  Star,
} from 'lucide-react';
import {
  avatarUrlFor,
  flattenPages,
  formatCompactNumber,
  useAuth,
  useLoops,
  useProducts,
  useProfile,
  useToggleFollow,
} from '@ezyify/core';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { ProductCard } from '../components/shop/ProductCard';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { EmptyState } from '../components/primitives/EmptyState';
import { Img } from '../components/primitives/Img';
import { Skeleton } from '../components/primitives/Skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { fadeUp, staggerContainer } from '../lib/motion';
import { formErrors } from '../lib/apiErrors';

function StoreSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-4 px-4 py-6" aria-busy>
      <Skeleton className="aspect-[16/9] w-full rounded-card lg:h-56" />
      <div className="flex gap-4">
        <Skeleton className="size-24 rounded-card" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-7 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <Skeleton key={item} className="aspect-[.72] rounded-card" />
        ))}
      </div>
    </div>
  );
}

export default function SellerStorePage() {
  const { storeName } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const authed = useAuth((state) => state.status === 'authenticated');
  const profile = useProfile(storeName);
  const [sort, setSort] = useState<'popular' | 'newest' | 'price_asc' | 'price_desc' | 'rating'>(
    'popular',
  );
  const productsQuery = useProducts(
    storeName ? { seller: storeName, sort, pageSize: 24 } : { pageSize: 24 },
  );
  const loopsQuery = useLoops(storeName ? { author: storeName, pageSize: 8 } : { pageSize: 8 });
  const follow = useToggleFollow();
  const products = flattenPages(productsQuery.data);
  const loops = flattenPages(loopsQuery.data);
  const rating = useMemo(() => {
    const reviews = products.reduce((total, product) => total + product.reviewCount, 0);
    return {
      reviews,
      value: reviews
        ? products.reduce((total, product) => total + product.rating * product.reviewCount, 0) /
          reviews
        : null,
    };
  }, [products]);
  const seller = profile.data;
  if (profile.isLoading) return <StoreSkeleton />;
  if (profile.isError || !seller)
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <EmptyState
          kind="search"
          title="Store not found"
          description="This seller may no longer be available, or the link is incorrect."
          action={
            <Button asChild>
              <Link to="/shop">Browse shop</Link>
            </Button>
          }
        />
      </div>
    );
  const joined = new Date(seller.createdAt).toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });
  const onFollow = () => {
    if (!authed) return navigate('/login', { state: { next: `/seller/${seller.username}` } });
    follow.mutate(
      { username: seller.username, following: !!seller.isFollowing },
      {
        onError: (error) =>
          toast.error(formErrors(error).message ?? 'Couldn’t update follow status'),
      },
    );
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`${seller.name} — Ezyify`} description={`Shop from ${seller.name} on Ezyify.`} />
      <motion.main
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-8"
      >
        <motion.div variants={fadeUp} className="relative overflow-hidden rounded-card bg-muted">
          <div className="aspect-[16/9] bg-gradient-to-br from-primary/25 via-muted to-accent-brand/20 lg:h-56 lg:aspect-auto">
            {seller.coverUrl && (
              <Img
                src={seller.coverUrl}
                alt={`${seller.name} store cover`}
                loading="lazy"
                className="size-full object-cover"
              />
            )}
          </div>
          <Link to="/shop">
            <Button
              aria-label="Back to shop"
              variant="secondary"
              size="icon"
              className="absolute left-3 top-3"
            >
              <ArrowLeft />
            </Button>
          </Link>
        </motion.div>
        <motion.section variants={fadeUp} className="relative -mt-10 mb-6 px-2 lg:-mt-12">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
            <Img
              src={avatarUrlFor(seller, 160)}
              alt={`${seller.name}'s avatar`}
              loading="lazy"
              className="size-24 rounded-card border-4 border-background object-cover shadow-md lg:size-28"
            />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="font-display text-2xl font-bold">{seller.name}</h1>
                {seller.verified && <VerifiedBadge size="sm" />}
              </div>
              <p className="mt-1 text-sm text-foreground-secondary">@{seller.username}</p>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-foreground-secondary">
                {rating.value !== null && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="size-4 fill-warning text-warning" />
                    {rating.value.toFixed(1)} ({formatCompactNumber(rating.reviews)})
                  </span>
                )}
                <span>{formatCompactNumber(seller.followers)} followers</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={onFollow} loading={follow.isPending}>
                {seller.isFollowing ? 'Following' : 'Follow'}
              </Button>
              <Button asChild variant="outline" leftIcon={<MessageCircle />}>
                <Link to={`/messages?with=${encodeURIComponent(seller.username)}`}>Message</Link>
              </Button>
            </div>
          </div>
        </motion.section>
        <motion.div variants={fadeUp} className="mb-6 grid grid-cols-3 gap-2">
          <Card className="p-3 text-center">
            <ShieldCheck className="mx-auto size-5 text-success" />
            <p className="mt-1 text-xs font-semibold">Escrow protected</p>
          </Card>
          <Card className="p-3 text-center">
            <Clock3 className="mx-auto size-5 text-primary" />
            <p className="mt-1 text-xs font-semibold">Secure checkout</p>
          </Card>
          <Card className="p-3 text-center">
            <PackageCheck className="mx-auto size-5 text-accent-brand" />
            <p className="mt-1 text-xs font-semibold">Seller verified</p>
          </Card>
        </motion.div>
        <motion.div variants={fadeUp}>
          <Tabs defaultValue="products">
            <TabsList className="mb-5 grid h-11 w-full grid-cols-3">
              <TabsTrigger value="products">Products</TabsTrigger>
              <TabsTrigger value="loops">Loops</TabsTrigger>
              <TabsTrigger value="about">About</TabsTrigger>
            </TabsList>
            <TabsContent value="products" className="mt-0">
              <div className="mb-4 flex items-center justify-between gap-3">
                <p className="text-sm text-foreground-secondary">
                  {productsQuery.isLoading ? 'Loading products…' : `${products.length} products`}
                </p>
                <label className="flex items-center gap-2 text-sm font-medium">
                  Sort{' '}
                  <select
                    value={sort}
                    onChange={(event) => setSort(event.target.value as typeof sort)}
                    className="rounded-lg border border-border bg-card px-2 py-1.5 text-sm"
                  >
                    <option value="popular">Popular</option>
                    <option value="newest">Newest</option>
                    <option value="rating">Top rated</option>
                    <option value="price_asc">Price: low to high</option>
                    <option value="price_desc">Price: high to low</option>
                  </select>
                </label>
              </div>
              {productsQuery.isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                  {[0, 1, 2, 3].map((item) => (
                    <Skeleton key={item} className="aspect-[.72] rounded-card" />
                  ))}
                </div>
              ) : productsQuery.isError ? (
                <EmptyState
                  kind="error"
                  title="Couldn’t load products"
                  description="Try again in a moment."
                  action={<Button onClick={() => void productsQuery.refetch()}>Retry</Button>}
                />
              ) : products.length ? (
                <>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                  {productsQuery.hasNextPage && (
                    <div className="mt-6 flex justify-center">
                      <Button
                        variant="outline"
                        loading={productsQuery.isFetchingNextPage}
                        onClick={() => void productsQuery.fetchNextPage()}
                      >
                        Load more products
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <EmptyState
                  kind="orders"
                  title="No products listed"
                  description="This seller has no products available right now."
                />
              )}
            </TabsContent>
            <TabsContent value="loops" className="mt-0">
              {loopsQuery.isLoading ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {[0, 1, 2, 3].map((item) => (
                    <Skeleton key={item} className="aspect-[9/16] rounded-card" />
                  ))}
                </div>
              ) : loopsQuery.isError ? (
                <EmptyState
                  kind="error"
                  title="Couldn’t load Loops"
                  description="Try again in a moment."
                  action={<Button onClick={() => void loopsQuery.refetch()}>Retry</Button>}
                />
              ) : loops.length ? (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {loops.map((loop) => {
                    const image = loop.media[0]?.thumbnailUrl ?? loop.media[0]?.url;
                    return (
                      <Link
                        key={loop.id}
                        to={`/loops?start=${encodeURIComponent(loop.id)}`}
                        className="group relative aspect-[9/16] overflow-hidden rounded-card bg-muted"
                      >
                        {image && (
                          <Img
                            src={image}
                            alt={loop.caption || `Loop by ${seller.name}`}
                            loading="lazy"
                            className="size-full object-cover transition-transform group-hover:scale-105"
                          />
                        )}
                        <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-10 text-sm font-semibold text-white line-clamp-2">
                          {loop.caption || 'Watch Loop'}
                        </span>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <EmptyState
                  kind="feed"
                  title="No Loops yet"
                  description="New creator content will appear here."
                />
              )}
            </TabsContent>
            <TabsContent value="about" className="mt-0">
              <Card className="max-w-2xl space-y-5">
                <div>
                  <h2 className="font-display text-lg font-semibold">About {seller.name}</h2>
                  {seller.bio && (
                    <p className="mt-2 text-sm leading-relaxed text-foreground-secondary">
                      {seller.bio}
                    </p>
                  )}
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  {seller.location && (
                    <p className="flex items-center gap-2 text-sm">
                      <MapPin className="size-4 text-primary" />
                      {seller.location}
                    </p>
                  )}
                  <p className="flex items-center gap-2 text-sm">
                    <Calendar className="size-4 text-primary" />
                    Selling since {joined}
                  </p>
                  {seller.verified && (
                    <p className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="size-4 text-success" />
                      Verified business
                    </p>
                  )}
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </motion.main>
    </div>
  );
}
