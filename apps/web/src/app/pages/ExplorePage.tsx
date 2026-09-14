import { useState, useMemo } from 'react';
import { Search, Hash, Play, ShoppingBag, Users, Store, Sparkles, Heart, MessageCircle, Star, Eye } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { posts, getLoops } from '../data/posts';
import { products } from '../data/products';
import { getTopCreators } from '../data/users';
import { SEO, SEOConfigs } from '../components/SEO';
import { Skeleton } from '../components/ui/skeleton';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { VisuallyHidden } from '../components/ui/visually-hidden';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { PostViewer } from '../components/PostViewer';
import { Button } from '../components/primitives/Button';
import { fadeUp, staggerContainer, springSnappy, DURATION, EASE_EMPHASIZED } from '../lib/motion';
import { cn } from '../components/ui/utils';

type Tab = 'all' | 'posts' | 'loops' | 'products' | 'creators' | 'stores';

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: 'all', label: 'All', icon: <Sparkles className="size-4" /> },
  { value: 'posts', label: 'Posts', icon: <Hash className="size-4" /> },
  { value: 'loops', label: 'Loops', icon: <Play className="size-4" /> },
  { value: 'products', label: 'Products', icon: <ShoppingBag className="size-4" /> },
  { value: 'creators', label: 'Creators', icon: <Users className="size-4" /> },
  { value: 'stores', label: 'Stores', icon: <Store className="size-4" /> },
];

const TRENDING_TAGS = [
  { label: 'Fashion', count: '24.5K' },
  { label: 'Tech', count: '18.2K' },
  { label: 'Beauty', count: '15.8K' },
  { label: 'Fitness', count: '12.1K' },
  { label: 'Food', count: '10.9K' },
];

const MOCK_STORES = [
  { id: 's1', username: 'techstore', name: 'TechStore Pro', avatar: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop', category: 'Electronics', rating: 4.9, products: 342, followers: 28400, verified: true },
  { id: 's2', username: 'fashionhub', name: 'Fashion Hub', avatar: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&h=200&fit=crop', category: 'Fashion', rating: 4.8, products: 215, followers: 19200, verified: true },
  { id: 's3', username: 'beautyworld', name: 'Beauty World', avatar: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop', category: 'Beauty', rating: 4.7, products: 128, followers: 14600, verified: false },
];

function ExploreSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        <Skeleton className="h-11 w-full rounded-xl" />
        <div className="flex gap-2">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-8 w-16 rounded-full" />)}
        </div>
        <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
            <Skeleton key={i} className="aspect-square rounded-card w-full mb-3 break-inside-avoid" />
          ))}
        </div>
      </div>
    </div>
  );
}

function LoopGridTile({ loop, onSelect }: { loop: any; onSelect: (l: any) => void }) {
  return (
    <motion.button
      type="button"
      onClick={() => onSelect(loop)}
      whileTap={{ scale: 0.97 }}
      transition={springSnappy}
      className="group relative overflow-hidden rounded-card focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aspect-[9/16]"
    >
      <img src={loop.thumbnail} alt={loop.title} loading="lazy" className="w-full h-full object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

      {/* Play badge */}
      <div className="absolute top-3 right-3 bg-black/60 rounded-full p-1.5 backdrop-blur-sm">
        <Play className="size-3 fill-white text-white" />
      </div>

      {/* View count overlay */}
      <div className="absolute bottom-3 left-3 right-3 flex items-center gap-1 text-white text-xs font-semibold opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity">
        <Eye className="size-3" />
        {loop.views >= 1000 ? `${(loop.views / 1000).toFixed(1)}K` : loop.views}
      </div>
    </motion.button>
  );
}

function ProductGridTile({ product }: { product: any }) {
  return (
    <Link
      to={`/product/${product.id}`}
      className="group relative overflow-hidden rounded-card bg-card border border-border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aspect-square"
    >
      <img src={product.image} alt={product.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />

      {/* Price chip */}
      <div className="absolute bottom-3 left-3 bg-black/70 text-white px-2 py-1 rounded-lg text-xs font-semibold tabular-nums backdrop-blur-sm">
        ${product.price}
      </div>
    </Link>
  );
}

function CreatorCard({ creator }: { creator: any }) {
  const [following, setFollowing] = useState(false);
  return (
    <motion.div
      variants={fadeUp}
      className="bg-card border border-border rounded-card p-4 space-y-3"
    >
      <Link to={`/creator/${creator.id}`} className="flex items-center gap-3">
        <img src={creator.avatar} alt={creator.name} loading="lazy" className="size-12 rounded-full object-cover ring-2 ring-border" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1 mb-0.5">
            <h3 className="font-semibold text-foreground text-sm truncate">{creator.name}</h3>
            {creator.verified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-xs text-foreground-secondary">@{creator.username}</p>
        </div>
      </Link>

      <p className="text-xs text-foreground-secondary">{creator.followers >= 1000 ? `${(creator.followers / 1000).toFixed(1)}K` : creator.followers} followers</p>

      <Button
        size="sm"
        variant={following ? 'secondary' : 'primary'}
        className="w-full"
        onClick={() => setFollowing(!following)}
      >
        {following ? 'Following' : 'Follow'}
      </Button>
    </motion.div>
  );
}

function StoreCard({ store }: { store: (typeof MOCK_STORES)[number] }) {
  return (
    <motion.div variants={fadeUp} className="bg-card border border-border rounded-card overflow-hidden">
      {/* Cover image */}
      <div className="relative bg-gradient-to-br from-primary/20 to-accent-brand/20 aspect-video">
        <img src={store.avatar} alt={store.name} loading="lazy" className="w-full h-full object-cover opacity-30 absolute inset-0" />
      </div>

      <div className="p-4 space-y-3">
        <Link to={`/seller/${store.username}`} className="flex items-center gap-3">
          <img src={store.avatar} alt={store.name} loading="lazy" className="size-10 rounded-lg object-cover ring-2 ring-background" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <h3 className="font-semibold text-foreground text-sm truncate">{store.name}</h3>
              {store.verified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-xs text-foreground-secondary">{store.category}</p>
          </div>
        </Link>

        <div className="flex justify-between text-xs">
          <div>
            <p className="font-semibold text-foreground">{store.followers >= 1000 ? `${(store.followers / 1000).toFixed(1)}K` : store.followers}</p>
            <p className="text-foreground-secondary">Followers</p>
          </div>
          <div>
            <p className="font-semibold text-foreground flex items-center gap-0.5">
              <Star className="size-3 fill-amber-400 text-amber-400" />
              {store.rating}
            </p>
            <p className="text-foreground-secondary">Rating</p>
          </div>
        </div>

        <Button asChild size="sm" variant="primary" className="w-full">
          <Link to={`/seller/${store.username}`}>Visit Store</Link>
        </Button>
      </div>
    </motion.div>
  );
}

export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [explorePostSheet, setExplorePostSheet] = useState<any>(null);
  const prefersReducedMotion = useReducedMotion();

  const loops = useMemo(() => {
    const rawLoops = getLoops();
    return rawLoops.slice(0, 12).map((loop: any, idx: number) => ({
      id: loop.id || `loop-${idx}`,
      title: loop.content?.text || 'Untitled',
      thumbnail: loop.content?.images?.[0] || 'https://images.unsplash.com/photo-1611339555312-e607c25352ca?w=300&h=400&fit=crop',
      views: loop.views || Math.floor(Math.random() * 100000),
    }));
  }, []);

  const filteredPosts = useMemo(() => {
    return posts.filter(
      p =>
        !searchQuery ||
        p.content.text?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const filteredLoops = useMemo(() => {
    return loops.filter(
      l =>
        !searchQuery ||
        l.title.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, loops]);

  const filteredProducts = useMemo(() => {
    return products.filter(
      p =>
        !searchQuery ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const filteredCreators = useMemo(() => {
    return getTopCreators().filter(
      c =>
        !searchQuery ||
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.username.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const filteredStores = useMemo(() => {
    return MOCK_STORES.filter(
      s =>
        !searchQuery ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.category.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery]);

  const allContent = useMemo(() => {
    const combined: Array<{ type: string; data: any }> = [
      ...filteredPosts.slice(0, 4).map(p => ({ type: 'post', data: p })),
      ...filteredLoops.slice(0, 4).map(l => ({ type: 'loop', data: l })),
      ...filteredProducts.slice(0, 4).map(p => ({ type: 'product', data: p })),
      ...filteredCreators.slice(0, 2).map(c => ({ type: 'creator', data: c })),
    ];
    return combined;
  }, [filteredPosts, filteredLoops, filteredProducts, filteredCreators]);

  // For SSR compatibility, return skeleton if loops aren't ready
  if (!loops.length) {
    return <ExploreSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background pb-nav">
      <SEO {...SEOConfigs.explore} />

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-6">
        {/* Header */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: -8 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: DURATION.normal }}
          className="space-y-3"
        >
          <h1 className="font-display text-2xl font-bold text-foreground">Explore</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-foreground-tertiary" />
            <input
              type="text"
              placeholder="Search posts, creators, products..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-background-elevated border border-border rounded-xl text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </motion.div>

        {/* Sticky Tab Bar */}
        <motion.div
          initial={prefersReducedMotion ? undefined : { opacity: 0, y: -4 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1, y: 0 }}
          className="sticky top-0 z-10 flex gap-1 overflow-x-auto bg-background pb-3 scrollbar-hide -mx-4 px-4"
        >
          {TABS.map(tab => (
            <motion.button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="relative px-3 py-2 text-sm font-semibold text-foreground-secondary whitespace-nowrap transition-colors hover:text-foreground"
              layout="position"
            >
              <div className="flex items-center gap-1.5">
                {tab.icon}
                {tab.label}
              </div>
              <AnimatePresence>
                {activeTab === tab.value && (
                  <motion.div
                    layoutId="tab-underline"
                    className="absolute -bottom-3 left-0 right-0 h-1 bg-primary rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </AnimatePresence>
            </motion.button>
          ))}
        </motion.div>

        {/* Trending Tags (above grid) */}
        {!searchQuery && (
          <motion.div
            initial={prefersReducedMotion ? undefined : { opacity: 0 }}
            animate={prefersReducedMotion ? undefined : { opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="flex flex-wrap gap-2"
          >
            {TRENDING_TAGS.map(tag => (
              <button
                key={tag.label}
                onClick={() => setSearchQuery(tag.label)}
                className="px-3 py-1.5 bg-background-elevated border border-border rounded-full text-xs font-medium text-foreground hover:border-border-strong transition-colors"
              >
                #{tag.label}
                <span className="text-foreground-tertiary ml-1">{tag.count}</span>
              </button>
            ))}
          </motion.div>
        )}

        {/* Content Grid */}
        <motion.div
          key={activeTab}
          initial={prefersReducedMotion ? undefined : { opacity: 0 }}
          animate={prefersReducedMotion ? undefined : { opacity: 1 }}
          transition={{ duration: DURATION.normal }}
        >
          {activeTab === 'all' && (
            <motion.div
              variants={staggerContainer(0.03)}
              initial={prefersReducedMotion ? undefined : 'hidden'}
              animate={prefersReducedMotion ? undefined : 'visible'}
              className="space-y-6"
            >
              {/* Posts section */}
              {filteredPosts.length > 0 && (
                <div className="space-y-2">
                  <h2 className="font-display text-sm font-semibold text-foreground-secondary">Posts</h2>
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
                    {filteredPosts.slice(0, 4).map(post => (
                      <motion.button
                        key={post.id}
                        variants={fadeUp}
                        onClick={() => setExplorePostSheet(post)}
                        className="group relative overflow-hidden rounded-card mb-3 break-inside-avoid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aspect-[4/5] block w-full"
                      >
                        <img
                          src={post.content.images?.[0] || ''}
                          alt={post.content.text || ''}
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-3 left-3 right-3 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                          <span className="flex items-center gap-1 text-white text-xs font-semibold">
                            <Heart className="size-3 fill-white" />
                            {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}
                          </span>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Loops section */}
              {filteredLoops.length > 0 && (
                <div className="space-y-2">
                  <h2 className="font-display text-sm font-semibold text-foreground-secondary">Loops</h2>
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
                    {filteredLoops.slice(0, 4).map(loop => (
                      <motion.div key={loop.id} variants={fadeUp} className="mb-3 break-inside-avoid">
                        <LoopGridTile loop={loop} onSelect={() => {}} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Products section */}
              {filteredProducts.length > 0 && (
                <div className="space-y-2">
                  <h2 className="font-display text-sm font-semibold text-foreground-secondary">Products</h2>
                  <div className="columns-2 md:columns-3 lg:columns-4 gap-3">
                    {filteredProducts.slice(0, 4).map(product => (
                      <motion.div key={product.id} variants={fadeUp} className="mb-3 break-inside-avoid">
                        <ProductGridTile product={product} />
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* Creators section */}
              {filteredCreators.length > 0 && (
                <div className="space-y-3">
                  <h2 className="font-display text-sm font-semibold text-foreground-secondary">Creators</h2>
                  <motion.div
                    variants={staggerContainer(0.05)}
                    initial={prefersReducedMotion ? undefined : 'hidden'}
                    animate={prefersReducedMotion ? undefined : 'visible'}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  >
                    {filteredCreators.slice(0, 3).map(creator => (
                      <CreatorCard key={creator.id} creator={creator} />
                    ))}
                  </motion.div>
                </div>
              )}
            </motion.div>
          )}

          {activeTab === 'posts' && filteredPosts.length > 0 && (
            <motion.div
              variants={staggerContainer(0.03)}
              initial={prefersReducedMotion ? undefined : 'hidden'}
              animate={prefersReducedMotion ? undefined : 'visible'}
              className="columns-2 md:columns-3 lg:columns-4 gap-3"
            >
              {filteredPosts.map(post => (
                <motion.button
                  key={post.id}
                  variants={fadeUp}
                  onClick={() => setExplorePostSheet(post)}
                  className="group relative overflow-hidden rounded-card mb-3 break-inside-avoid focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring aspect-[4/5] block w-full"
                >
                  <img src={post.content.images?.[0] || ''} alt="" loading="lazy" className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
              ))}
            </motion.div>
          )}

          {activeTab === 'loops' && filteredLoops.length > 0 && (
            <motion.div
              variants={staggerContainer(0.03)}
              initial={prefersReducedMotion ? undefined : 'hidden'}
              animate={prefersReducedMotion ? undefined : 'visible'}
              className="columns-2 md:columns-3 lg:columns-4 gap-3"
            >
              {filteredLoops.map(loop => (
                <motion.div key={loop.id} variants={fadeUp} className="mb-3 break-inside-avoid">
                  <LoopGridTile loop={loop} onSelect={() => {}} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'products' && filteredProducts.length > 0 && (
            <motion.div
              variants={staggerContainer(0.03)}
              initial={prefersReducedMotion ? undefined : 'hidden'}
              animate={prefersReducedMotion ? undefined : 'visible'}
              className="columns-2 md:columns-3 lg:columns-4 gap-3"
            >
              {filteredProducts.map(product => (
                <motion.div key={product.id} variants={fadeUp} className="mb-3 break-inside-avoid">
                  <ProductGridTile product={product} />
                </motion.div>
              ))}
            </motion.div>
          )}

          {activeTab === 'creators' && filteredCreators.length > 0 && (
            <motion.div
              variants={staggerContainer(0.05)}
              initial={prefersReducedMotion ? undefined : 'hidden'}
              animate={prefersReducedMotion ? undefined : 'visible'}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredCreators.map(creator => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </motion.div>
          )}

          {activeTab === 'stores' && (
            <motion.div
              variants={staggerContainer(0.05)}
              initial={prefersReducedMotion ? undefined : 'hidden'}
              animate={prefersReducedMotion ? undefined : 'visible'}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {filteredStores.map(store => (
                <StoreCard key={store.id} store={store} />
              ))}
            </motion.div>
          )}

          {/* Empty state */}
          {activeTab !== 'all' &&
            ((activeTab === 'posts' && filteredPosts.length === 0) ||
              (activeTab === 'loops' && filteredLoops.length === 0) ||
              (activeTab === 'products' && filteredProducts.length === 0) ||
              (activeTab === 'creators' && filteredCreators.length === 0) ||
              (activeTab === 'stores' && filteredStores.length === 0)) && (
              <div className="py-16 text-center">
                <p className="text-foreground-secondary">No {activeTab} found</p>
              </div>
            )}
        </motion.div>
      </div>

      {/* Post Viewer Sheet */}
      <Sheet open={!!explorePostSheet} onOpenChange={open => !open && setExplorePostSheet(null)}>
        <SheetContent side="bottom" className="h-[95dvh] p-0 overflow-hidden bg-background [&>button]:hidden">
          <VisuallyHidden>
            <SheetTitle>Post</SheetTitle>
          </VisuallyHidden>
          <VisuallyHidden>
            <SheetDescription>View post details</SheetDescription>
          </VisuallyHidden>
          {explorePostSheet && <PostViewer post={explorePostSheet} onClose={() => setExplorePostSheet(null)} />}
        </SheetContent>
      </Sheet>

      <style>{`
        .scrollbar-hide::-webkit-scrollbar { display: none; }
        .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
