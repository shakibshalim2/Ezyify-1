import { useMemo, useState } from 'react';
import { Hash, Play, Search, ShoppingBag, Sparkles, Store, Users } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { Link, useNavigate } from 'react-router';
import {
  avatarUrlFor,
  flattenPages,
  formatCompactNumber,
  formatMoney,
  useCategories,
  useFeed,
  useLoops,
  useProducts,
  useToggleFollow,
  type Post,
  type ProductSummary,
  type UserSummary,
} from '@ezyify/core';
import { SEO } from '../components/SEO';
import { PostViewer } from '../components/PostViewer';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Button } from '../components/primitives/Button';
import { EmptyState } from '../components/primitives/EmptyState';
import { Img } from '../components/primitives/Img';
import { Skeleton } from '../components/primitives/Skeleton';
import { Sheet, SheetContent, SheetDescription, SheetTitle } from '../components/ui/sheet';
import { VisuallyHidden } from '../components/ui/visually-hidden';
import { fadeUp, staggerContainer } from '../lib/motion';
import { useAuthed } from '../lib/data';

function ExploreSkeleton() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-6" aria-busy>
      {[0, 1, 2].map((section) => (
        <section key={section} className="space-y-3">
          <Skeleton className="h-7 w-44" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[0, 1, 2, 3].map((item) => (
              <Skeleton key={item} className="aspect-square rounded-card" />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function CreatorCard({ creator }: { creator: UserSummary }) {
  const authed = useAuthed();
  const follow = useToggleFollow();
  const navigate = useNavigate();
  const [following, setFollowing] = useState(false);
  const onFollow = () => {
    if (!authed) return navigate('/login', { state: { next: '/explore' } });
    follow.mutate(
      { username: creator.username, following },
      { onSuccess: () => setFollowing((value) => !value) },
    );
  };
  return (
    <article className="flex min-w-64 items-center gap-3 rounded-card border border-border bg-card p-3">
      <Link to={`/profile/${creator.username}`} className="flex min-w-0 flex-1 items-center gap-3">
        <Img
          src={avatarUrlFor(creator, 96)}
          alt={`${creator.name}'s avatar`}
          loading="lazy"
          className="size-11 rounded-full object-cover"
        />
        <span className="min-w-0">
          <span className="flex items-center gap-1 truncate text-sm font-semibold">
            {creator.name}
            {creator.verified && <VerifiedBadge size="sm" />}
          </span>
          <span className="block truncate text-xs text-foreground-secondary">
            @{creator.username}
          </span>
        </span>
      </Link>
      <Button
        size="sm"
        variant={following ? 'secondary' : 'primary'}
        onClick={onFollow}
        loading={follow.isPending}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
    </article>
  );
}

function StoreCard({
  seller,
  productCount,
}: {
  seller: ProductSummary['seller'];
  productCount: number;
}) {
  return (
    <Link
      to={`/seller/${seller.username}`}
      className="group flex items-center gap-3 rounded-card border border-border bg-card p-4 transition hover:border-border-strong hover:shadow-sm"
    >
      <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
        <Store className="size-5" />
      </div>
      <span className="min-w-0">
        <span className="flex items-center gap-1 truncate font-semibold">
          {seller.name}
          {seller.verified && <VerifiedBadge size="sm" />}
        </span>
        <span className="block text-xs text-foreground-secondary">
          @{seller.username} · {productCount} {productCount === 1 ? 'product' : 'products'}
        </span>
      </span>
    </Link>
  );
}

function PostTile({ post, onSelect }: { post: Post; onSelect: (post: Post) => void }) {
  const image = post.media[0]?.thumbnailUrl ?? post.media[0]?.url;
  return (
    <button
      type="button"
      onClick={() => onSelect(post)}
      aria-label={`Open post by ${post.author.name}`}
      className="group relative aspect-square overflow-hidden rounded-card bg-muted text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      {image && (
        <Img
          src={image}
          alt={post.caption || `Post by ${post.author.name}`}
          loading="lazy"
          className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      )}
      <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent px-3 pb-2 pt-8 text-xs font-semibold text-white">
        {formatCompactNumber(post.engagement.likes)} likes
      </span>
    </button>
  );
}

export default function ExplorePage() {
  const reduce = useReducedMotion();
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [term, setTerm] = useState('');
  const postsQuery = useFeed({ kind: 'post', pageSize: 18 });
  const loopsQuery = useLoops({ pageSize: 8 });
  const productsQuery = useProducts({ sort: 'popular', pageSize: 8 });
  const categoriesQuery = useCategories();
  const posts = flattenPages(postsQuery.data);
  const loops = flattenPages(loopsQuery.data);
  const products = flattenPages(productsQuery.data);
  const needle = term.trim().toLowerCase();
  const filteredPosts = useMemo(
    () =>
      posts.filter(
        (post) =>
          !needle ||
          `${post.caption} ${post.author.name} ${post.author.username}`
            .toLowerCase()
            .includes(needle),
      ),
    [needle, posts],
  );
  const filteredLoops = useMemo(
    () =>
      loops.filter(
        (loop) => !needle || `${loop.caption} ${loop.author.name}`.toLowerCase().includes(needle),
      ),
    [needle, loops],
  );
  const filteredProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          !needle || `${product.name} ${product.seller.name}`.toLowerCase().includes(needle),
      ),
    [needle, products],
  );
  const creators = useMemo(
    () => Array.from(new Map(posts.map((post) => [post.author.username, post.author])).values()),
    [posts],
  );
  const stores = useMemo(
    () =>
      Array.from(
        products
          .reduce((all, product) => {
            const current = all.get(product.seller.username) ?? {
              seller: product.seller,
              productCount: 0,
            };
            current.productCount += 1;
            all.set(product.seller.username, current);
            return all;
          }, new Map<string, { seller: ProductSummary['seller']; productCount: number }>())
          .values(),
      ),
    [products],
  );
  const loading =
    postsQuery.isLoading ||
    loopsQuery.isLoading ||
    productsQuery.isLoading ||
    categoriesQuery.isLoading;
  const failed =
    postsQuery.isError || loopsQuery.isError || productsQuery.isError || categoriesQuery.isError;
  if (loading) return <ExploreSkeleton />;
  if (failed)
    return (
      <div className="mx-auto max-w-xl px-4">
        <EmptyState
          kind="error"
          title="Couldn’t load Explore"
          description="Check your connection and try again."
          action={
            <Button
              onClick={() => {
                void postsQuery.refetch();
                void loopsQuery.refetch();
                void productsQuery.refetch();
                void categoriesQuery.refetch();
              }}
            >
              Retry
            </Button>
          }
        />
      </div>
    );

  return (
    <div className="min-h-screen bg-background pb-nav">
      <SEO
        title="Explore — Ezyify"
        description="Discover creators, shoppable posts, Loops and verified stores."
      />
      <motion.main
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-6xl space-y-9 px-4 py-6 lg:px-6"
      >
        <motion.header variants={fadeUp} className="space-y-4">
          <div>
            <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-primary">
              <Sparkles className="size-4" /> Discover
            </p>
            <h1 className="font-display text-3xl font-bold">Find your next favourite</h1>
            <p className="mt-1 text-sm text-foreground-secondary">
              Creators, short videos and products worth sharing.
            </p>
          </div>
          <label className="flex h-11 items-center gap-2 rounded-xl border border-border bg-card px-3">
            <Search className="size-4 text-foreground-secondary" />
            <input
              value={term}
              onChange={(event) => setTerm(event.target.value)}
              placeholder="Filter what’s trending"
              aria-label="Filter explore content"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-foreground-tertiary"
            />
          </label>
        </motion.header>
        <motion.section variants={fadeUp} aria-labelledby="categories">
          <h2 id="categories" className="mb-3 font-display text-xl font-semibold">
            Browse categories
          </h2>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {(categoriesQuery.data ?? []).map((category) => (
              <Link
                key={category.id}
                to={`/shop?category=${encodeURIComponent(category.slug)}`}
                className="shrink-0 rounded-full border border-border bg-card px-4 py-2 text-sm font-medium transition hover:bg-muted"
              >
                {category.name}
                <span className="ml-1.5 text-xs text-foreground-secondary">
                  {formatCompactNumber(category.productCount)}
                </span>
              </Link>
            ))}
          </div>
        </motion.section>
        <motion.section variants={fadeUp} aria-labelledby="trending-posts">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 id="trending-posts" className="font-display text-xl font-semibold">
                Trending posts
              </h2>
              <p className="text-sm text-foreground-secondary">Fresh from the community</p>
            </div>
            <Hash className="size-5 text-primary" />
          </div>
          {filteredPosts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {filteredPosts.map((post) => (
                <PostTile key={post.id} post={post} onSelect={setSelectedPost} />
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              kind="search"
              title="No matching posts"
              description="Try a different search term."
            />
          )}
        </motion.section>
        <motion.section variants={fadeUp} aria-labelledby="loops">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 id="loops" className="font-display text-xl font-semibold">
                Loops to watch
              </h2>
              <p className="text-sm text-foreground-secondary">Quick inspiration from creators</p>
            </div>
            <Link to="/loops" className="text-sm font-semibold text-primary">
              See all
            </Link>
          </div>
          {filteredLoops.length ? (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {filteredLoops.map((loop) => {
                const image = loop.media[0]?.thumbnailUrl ?? loop.media[0]?.url;
                return (
                  <Link
                    key={loop.id}
                    to={`/loops?start=${encodeURIComponent(loop.id)}`}
                    className="group relative aspect-[9/16] w-36 shrink-0 overflow-hidden rounded-card bg-muted"
                  >
                    {image && (
                      <Img
                        src={image}
                        alt={loop.caption || `Loop by ${loop.author.name}`}
                        loading="lazy"
                        className="size-full object-cover transition-transform group-hover:scale-105"
                      />
                    )}
                    <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 to-transparent px-3 pb-3 pt-10 text-sm font-semibold text-white line-clamp-2">
                      <Play className="mr-1 inline size-3 fill-current" />
                      {loop.caption || `@${loop.author.username}`}
                    </span>
                  </Link>
                );
              })}
            </div>
          ) : (
            <EmptyState
              compact
              kind="feed"
              title="No matching Loops"
              description="New videos will appear here."
            />
          )}
        </motion.section>
        <motion.section variants={fadeUp} aria-labelledby="products">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 id="products" className="font-display text-xl font-semibold">
                Trending products
              </h2>
              <p className="text-sm text-foreground-secondary">
                Popular picks from verified sellers
              </p>
            </div>
            <ShoppingBag className="size-5 text-primary" />
          </div>
          {filteredProducts.length ? (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {filteredProducts.map((product) => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group overflow-hidden rounded-card border border-border bg-card"
                >
                  <Img
                    src={product.imageUrl}
                    alt={product.name}
                    loading="lazy"
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                  />
                  <div className="p-3">
                    <p className="line-clamp-2 text-sm font-semibold">{product.name}</p>
                    <p className="mt-1 text-sm font-bold text-primary">
                      {formatMoney(product.price)}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <EmptyState
              compact
              kind="search"
              title="No matching products"
              description="Try a different search term."
            />
          )}
        </motion.section>
        <motion.section variants={fadeUp} aria-labelledby="creators">
          <div className="mb-3 flex items-center justify-between">
            <div>
              <h2 id="creators" className="font-display text-xl font-semibold">
                Creators to follow
              </h2>
              <p className="text-sm text-foreground-secondary">Join their next recommendation</p>
            </div>
            <Users className="size-5 text-primary" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {creators.map((creator) => (
              <CreatorCard key={creator.id} creator={creator} />
            ))}
          </div>
        </motion.section>
        <motion.section variants={fadeUp} aria-labelledby="stores">
          <h2 id="stores" className="mb-3 font-display text-xl font-semibold">
            Stores to explore
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <StoreCard key={store.seller.id} {...store} />
            ))}
          </div>
        </motion.section>
      </motion.main>
      <Sheet open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <SheetContent side="bottom" className="h-[95dvh] overflow-hidden p-0 [&>button]:hidden">
          <VisuallyHidden>
            <SheetTitle>Post viewer</SheetTitle>
            <SheetDescription>View a post, its comments and tagged products.</SheetDescription>
          </VisuallyHidden>
          {selectedPost && <PostViewer post={selectedPost} onClose={() => setSelectedPost(null)} />}
        </SheetContent>
      </Sheet>
    </div>
  );
}
