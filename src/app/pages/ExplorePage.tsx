import React, { useState, useEffect, useRef } from 'react';
import {
  Search, TrendingUp, Users, Play, ShoppingBag, Store, Zap,
  Heart, MessageCircle, Star, X, SlidersHorizontal, ChevronRight,
  Hash, Flame, Sparkles
} from 'lucide-react';
import { Link } from 'react-router';
import { posts, getLoops } from '../data/posts';
import { products, getTrendingProducts } from '../data/products';
import { getTopCreators } from '../data/users';
import { SEO, SEOConfigs } from '../components/SEO';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from '../components/ui/sheet';
import { VisuallyHidden } from '../components/ui/visually-hidden';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { PostViewer } from '../components/PostViewer';

// ── Types ─────────────────────────────────────────────────────────────────────
type Tab = 'all' | 'posts' | 'loops' | 'products' | 'creators' | 'stores';

const TABS: { value: Tab; label: string; icon: React.ReactNode }[] = [
  { value: 'all',      label: 'All',      icon: <Sparkles className="w-3.5 h-3.5" /> },
  { value: 'posts',    label: 'Posts',    icon: <Hash className="w-3.5 h-3.5" /> },
  { value: 'loops',    label: 'Loops',    icon: <Play className="w-3.5 h-3.5" /> },
  { value: 'products', label: 'Products', icon: <ShoppingBag className="w-3.5 h-3.5" /> },
  { value: 'creators', label: 'Creators', icon: <Users className="w-3.5 h-3.5" /> },
  { value: 'stores',   label: 'Stores',   icon: <Store className="w-3.5 h-3.5" /> },
];

const TRENDING_TAGS = [
  { label: 'Fashion',     count: '24.5K' },
  { label: 'Tech',        count: '18.2K' },
  { label: 'Beauty',      count: '15.8K' },
  { label: 'Fitness',     count: '12.1K' },
  { label: 'Food',        count: '10.9K' },
  { label: 'Travel',      count: '9.3K'  },
  { label: 'Lifestyle',   count: '8.7K'  },
  { label: 'Electronics', count: '7.4K'  },
  { label: 'Gaming',      count: '6.2K'  },
  { label: 'Home',        count: '5.8K'  },
];

const MOCK_STORES = [
  { id: 's1', username: 'techstore',    name: 'TechStore Pro',      avatar: 'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=200&h=200&fit=crop', category: 'Electronics', rating: 4.9, products: 342, followers: 28400, verified: true },
  { id: 's2', username: 'fashionhub',   name: 'Fashion Hub',        avatar: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=200&h=200&fit=crop', category: 'Fashion',     rating: 4.8, products: 215, followers: 19200, verified: true },
  { id: 's3', username: 'beautyworld',  name: 'Beauty World',       avatar: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=200&h=200&fit=crop', category: 'Beauty',      rating: 4.7, products: 128, followers: 14600, verified: false },
  { id: 's4', username: 'sportsgear',   name: 'Sports & Gear',      avatar: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=200&h=200&fit=crop', category: 'Sports',      rating: 4.6, products: 89,  followers: 8900,  verified: true },
  { id: 's5', username: 'homestyle',    name: 'HomeStyle Living',   avatar: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&h=200&fit=crop', category: 'Home',        rating: 4.8, products: 167, followers: 11200, verified: false },
  { id: 's6', username: 'groceryplus',  name: 'Grocery Plus',       avatar: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&h=200&fit=crop', category: 'Grocery',     rating: 4.5, products: 430, followers: 6700,  verified: true },
];

// ── Skeleton ──────────────────────────────────────────────────────────────────
function ExploreSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pb-4">
        <Skeleton className="h-11 w-full rounded-2xl mb-4" />
        <div className="flex gap-2 mb-6">
          {[1, 2, 3, 4, 5, 6].map(i => <Skeleton key={i} className="h-8 w-20 rounded-full" />)}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6, 7, 8].map(i => <Skeleton key={i} className="aspect-square rounded-2xl" />)}
        </div>
      </div>
    </div>
  );
}

// ── Section header ────────────────────────────────────────────────────────────
function SectionHeader({ icon, title, linkTo, linkLabel = 'See all' }: {
  icon: React.ReactNode;
  title: string;
  linkTo?: string;
  linkLabel?: string;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
          {icon}
        </div>
        <h2 className="font-semibold text-foreground">{title}</h2>
      </div>
      {linkTo && (
        <Link to={linkTo} className="flex items-center gap-0.5 text-[12px] font-semibold text-primary hover:text-primary/80 transition-colors">
          {linkLabel}<ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}

// ── Post grid tile (explore browse view — tap opens PostViewer sheet) ─────────
function PostGridTile({ post, large, onSelect }: { post: any; large?: boolean; onSelect: (p: any) => void }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(post)}
      className={`relative group rounded-2xl overflow-hidden bg-muted/30 block w-full ${large ? 'row-span-2' : ''}`}
    >
      <div className={`relative ${large ? 'aspect-[3/4]' : 'aspect-square'} overflow-hidden`}>
        <img
          loading="lazy"
          src={post.content.images?.[0] || ''}
          alt={post.content.text || ''}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200" />

        {/* Hover overlay stats */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <span className="flex items-center gap-1 text-white text-[11px] font-semibold">
            <Heart className="w-3.5 h-3.5 fill-white" />
            {post.likes >= 1000 ? `${(post.likes / 1000).toFixed(1)}K` : post.likes}
          </span>
          <span className="flex items-center gap-1 text-white text-[11px] font-semibold">
            <MessageCircle className="w-3.5 h-3.5 fill-white" />
            {post.comments}
          </span>
        </div>
      </div>

      {large && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/70 to-transparent">
          <div className="flex items-center gap-2">
            <img loading="lazy" src={post.user.avatar} alt={post.user.name} className="w-6 h-6 rounded-full object-cover border border-white/30" />
            <span className="text-white text-[11px] font-semibold truncate">{post.user.name}</span>
          </div>
        </div>
      )}
    </button>
  );
}

// ── Loop card ─────────────────────────────────────────────────────────────────
function LoopCard({ loop }: { loop: any }) {
  return (
    <Link to="/loops" className="relative group rounded-2xl overflow-hidden bg-muted/30 block aspect-[9/16] sm:aspect-[3/4]">
      <img
        loading="lazy"
        src={loop.content.images?.[0] || ''}
        alt={loop.content.text || ''}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

      {/* Loop badge */}
      <div className="absolute top-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ background: 'var(--brand-gradient)' }}>
        <Zap className="w-2.5 h-2.5" />Loop
      </div>

      {/* Stats */}
      <div className="absolute bottom-3 left-3 right-3">
        <div className="flex items-center gap-2">
          <img loading="lazy" src={loop.user.avatar} alt={loop.user.name} className="w-6 h-6 rounded-full object-cover border border-white/30 shrink-0" />
          <span className="text-white text-[11px] font-semibold truncate flex-1">{loop.user.name}</span>
        </div>
        <div className="flex items-center gap-2 mt-1.5">
          <span className="flex items-center gap-1 text-white/80 text-[10px]">
            <Heart className="w-3 h-3" />{(loop.likes / 1000).toFixed(1)}K
          </span>
          <span className="flex items-center gap-1 text-white/80 text-[10px]">
            <Play className="w-3 h-3" />{(loop.views / 1000).toFixed(1)}K
          </span>
        </div>
      </div>
    </Link>
  );
}

// ── Product card ──────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: any }) {
  const discount = product.originalPrice
    ? Math.round((1 - product.price / product.originalPrice) * 100)
    : null;
  return (
    <Link to={`/product/${product.id}`} className="bg-card border border-border rounded-2xl overflow-hidden hover:shadow-md transition-shadow group block">
      <div className="relative aspect-square overflow-hidden">
        <img loading="lazy" src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        {discount && discount >= 10 && (
          <span className="absolute top-2 left-2 bg-error text-white text-[10px] font-bold px-1.5 py-0.5 rounded-lg">-{discount}%</span>
        )}
      </div>
      <div className="p-3">
        <p className="text-[10px] text-muted-foreground truncate mb-0.5">{product.seller?.name || product.seller?.storeName}</p>
        <p className="text-[12px] font-medium text-foreground line-clamp-2 leading-tight mb-2">{product.name}</p>
        <div className="flex items-center gap-1 mb-1.5">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
          <span className="text-[11px] font-semibold text-foreground">{product.rating}</span>
          <span className="text-[10px] text-muted-foreground">({product.reviews})</span>
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className="font-bold text-primary">${product.price}</span>
          {product.originalPrice && (
            <span className="text-[11px] text-muted-foreground line-through">${product.originalPrice}</span>
          )}
        </div>
      </div>
    </Link>
  );
}

// ── Creator card ──────────────────────────────────────────────────────────────
function CreatorCard({ creator }: { creator: any }) {
  const [following, setFollowing] = useState(false);
  return (
    <div className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/profile/${creator.username}`}>
          <img loading="lazy" src={creator.avatar} alt={creator.name} className="w-12 h-12 rounded-full object-cover ring-2 ring-border/60" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Link to={`/profile/${creator.username}`} className="font-semibold text-[13px] text-foreground truncate hover:text-primary transition-colors">
              {creator.name}
            </Link>
            {creator.verified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-[11px] text-muted-foreground truncate">@{creator.username}</p>
        </div>
      </div>
      {creator.bio && (
        <p className="text-[11px] text-muted-foreground line-clamp-2 mb-3 leading-relaxed">{creator.bio}</p>
      )}
      <div className="flex items-center justify-between mb-3">
        <div className="text-center">
          <p className="text-[13px] font-bold text-foreground">{creator.followers >= 1000 ? `${(creator.followers / 1000).toFixed(0)}K` : creator.followers}</p>
          <p className="text-[10px] text-muted-foreground">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-[13px] font-bold text-foreground">{creator.posts}</p>
          <p className="text-[10px] text-muted-foreground">Posts</p>
        </div>
        <div className="text-center">
          <p className="text-[13px] font-bold text-foreground">{Math.floor(creator.followers / creator.posts / 10)}%</p>
          <p className="text-[10px] text-muted-foreground">Engage</p>
        </div>
      </div>
      <button
        onClick={() => setFollowing(f => !f)}
        className={`w-full py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 active:scale-[0.98] ${
          following
            ? 'bg-muted border border-border text-muted-foreground'
            : 'text-white'
        }`}
        style={!following ? { background: 'var(--brand-gradient)' } : {}}
      >
        {following ? 'Following' : 'Follow'}
      </button>
    </div>
  );
}

// ── Store card ────────────────────────────────────────────────────────────────
function StoreCard({ store }: { store: typeof MOCK_STORES[number] }) {
  const [following, setFollowing] = useState(false);
  return (
    <div className="bg-card border border-border rounded-2xl p-4 hover:shadow-md transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <Link to={`/seller/${store.username}`}>
          <img loading="lazy" src={store.avatar} alt={store.name} className="w-12 h-12 rounded-xl object-cover ring-2 ring-border/60" />
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <Link to={`/seller/${store.username}`} className="font-semibold text-[13px] text-foreground truncate hover:text-primary transition-colors">
              {store.name}
            </Link>
            {store.verified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-[11px] text-muted-foreground">{store.category}</p>
        </div>
      </div>
      <div className="flex items-center justify-between mb-3">
        <div className="text-center">
          <p className="text-[13px] font-bold text-foreground">{store.followers >= 1000 ? `${(store.followers / 1000).toFixed(1)}K` : store.followers}</p>
          <p className="text-[10px] text-muted-foreground">Followers</p>
        </div>
        <div className="text-center">
          <p className="text-[13px] font-bold text-foreground">{store.products}</p>
          <p className="text-[10px] text-muted-foreground">Products</p>
        </div>
        <div className="flex items-center gap-0.5 flex-col">
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            <span className="text-[13px] font-bold text-foreground">{store.rating}</span>
          </div>
          <p className="text-[10px] text-muted-foreground">Rating</p>
        </div>
      </div>
      <button
        onClick={() => setFollowing(f => !f)}
        className={`w-full py-2 rounded-xl text-[12px] font-semibold transition-all duration-150 active:scale-[0.98] ${
          following ? 'bg-muted border border-border text-muted-foreground' : 'text-white'
        }`}
        style={!following ? { background: 'var(--brand-gradient)' } : {}}
      >
        {following ? 'Following' : 'Follow Store'}
      </button>
    </div>
  );
}

// ── Main component ─────────────────────────────────────────────────────────────
export default function ExplorePage() {
  const [activeTab, setActiveTab] = useState<Tab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [explorePostSheet, setExplorePostSheet] = useState<any>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const openPost = (post: any) => setExplorePostSheet(post);

  const [pageData, setPageData] = useState<{
    posts: any[];
    loops: any[];
    products: any[];
    creators: any[];
  } | null>(null);

  useEffect(() => {
    const load = () => {
      setPageData({
        posts:    posts.filter(p => p.type === 'post').slice(0, 16),
        loops:    getLoops().slice(0, 8),
        products: getTrendingProducts(),
        creators: getTopCreators(),
      });
    };
    if ('requestIdleCallback' in window) {
      const h = requestIdleCallback(load, { timeout: 100 });
      return () => cancelIdleCallback(h);
    }
    const t = setTimeout(load, 16);
    return () => clearTimeout(t);
  }, []);

  if (!pageData) return <ExploreSkeleton />;

  const { posts: allPosts, loops: allLoops, products: allProducts, creators } = pageData;

  // Search filter
  const q = searchQuery.toLowerCase();
  const filteredPosts    = q ? allPosts.filter(p => p.user.name.toLowerCase().includes(q) || p.content.text?.toLowerCase().includes(q)) : allPosts;
  const filteredLoops    = q ? allLoops.filter(l => l.user.name.toLowerCase().includes(q) || l.content.text?.toLowerCase().includes(q)) : allLoops;
  const filteredProducts = q ? allProducts.filter(p => p.name.toLowerCase().includes(q) || p.seller?.name?.toLowerCase().includes(q)) : allProducts;
  const filteredCreators = q ? creators.filter(c => c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q)) : creators;
  const filteredStores   = q ? MOCK_STORES.filter(s => s.name.toLowerCase().includes(q) || s.category.toLowerCase().includes(q)) : MOCK_STORES;

  return (
    <div className="min-h-screen bg-background">
      <SEO {...SEOConfigs.explore} />

      {/* ── Sticky search + tabs ──────────────────────────────────────────── */}
      <div className="bg-card/95 backdrop-blur-sm border-b border-border sticky lg:!top-16 z-10" style={{ top: 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}>
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6">

          {/* Search bar */}
          <div className="py-3">
            <div className={`relative flex items-center transition-all ${searchFocused ? 'ring-2 ring-primary/20' : ''} rounded-2xl border ${searchFocused ? 'border-primary' : 'border-border'} bg-input-background`}>
              <Search className="w-4 h-4 text-muted-foreground absolute left-3.5 shrink-0" />
              <input
                ref={searchRef}
                type="text"
                placeholder="Search posts, products, creators, stores…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setSearchFocused(false)}
                className="w-full pl-10 pr-10 py-2.5 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
            {TABS.map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setActiveTab(value)}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full whitespace-nowrap text-[12px] font-semibold transition-all duration-150 shrink-0 ${
                  activeTab === value
                    ? 'text-white shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
                style={activeTab === value ? { background: 'var(--brand-gradient)' } : {}}
              >
                {icon}{label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-5 space-y-8">

        {/* ── ALL tab ─────────────────────────────────────────────────────── */}
        {activeTab === 'all' && (
          <>
            {/* Trending tags */}
            <section>
              <SectionHeader icon={<Flame className="w-4 h-4" />} title="Trending" />
              <div className="flex gap-2 flex-wrap">
                {TRENDING_TAGS.map(({ label, count }) => (
                  <button
                    key={label}
                    onClick={() => setSearchQuery(label.toLowerCase())}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card border border-border/70 text-[12px] font-medium text-foreground hover:border-primary/40 hover:bg-primary/5 hover:text-primary transition-all duration-150"
                  >
                    <span className="text-muted-foreground">#</span>{label}
                    <span className="text-[10px] text-muted-foreground">{count}</span>
                  </button>
                ))}
              </div>
            </section>

            {/* Trending Loops strip */}
            {allLoops.length > 0 && (
              <section>
                <SectionHeader icon={<Zap className="w-4 h-4" />} title="Trending Loops" linkTo="/loops" />
                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                  {allLoops.map(loop => (
                    <div key={loop.id} className="shrink-0 w-32 sm:w-40">
                      <LoopCard loop={loop} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Posts grid — featured post large, rest normal */}
            <section>
              <SectionHeader icon={<Hash className="w-4 h-4" />} title="Trending Posts" linkTo="/?tab=posts" />
              <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
                {filteredPosts.slice(0, 15).map((post, i) => (
                  <div key={post.id} className={i === 0 ? 'col-span-2 row-span-2' : ''}>
                    <PostGridTile post={post} large={i === 0} onSelect={openPost} />
                  </div>
                ))}
              </div>
            </section>

            {/* Products horizontal scroll */}
            <section>
              <SectionHeader icon={<ShoppingBag className="w-4 h-4" />} title="Featured Products" linkTo="/shop" />
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
                {filteredProducts.map(product => (
                  <div key={product.id} className="shrink-0 w-44 sm:w-52">
                    <ProductCard product={product} />
                  </div>
                ))}
              </div>
            </section>

            {/* Top Creators */}
            <section>
              <SectionHeader icon={<Users className="w-4 h-4" />} title="Top Creators" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                {filteredCreators.slice(0, 4).map(creator => (
                  <CreatorCard key={creator.id} creator={creator} />
                ))}
              </div>
            </section>

            {/* Stores */}
            <section>
              <SectionHeader icon={<Store className="w-4 h-4" />} title="Popular Stores" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredStores.slice(0, 6).map(store => (
                  <StoreCard key={store.id} store={store} />
                ))}
              </div>
            </section>
          </>
        )}

        {/* ── POSTS tab ───────────────────────────────────────────────────── */}
        {activeTab === 'posts' && (
          <section>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
              {filteredPosts.map(post => (
                <PostGridTile key={post.id} post={post} onSelect={openPost} />
              ))}
            </div>
            {filteredPosts.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                <Hash className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No posts found</p>
              </div>
            )}
          </section>
        )}

        {/* ── LOOPS tab ───────────────────────────────────────────────────── */}
        {activeTab === 'loops' && (
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredLoops.map(loop => (
                <LoopCard key={loop.id} loop={loop} />
              ))}
            </div>
            {filteredLoops.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                <Play className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No loops found</p>
              </div>
            )}
          </section>
        )}

        {/* ── PRODUCTS tab ────────────────────────────────────────────────── */}
        {activeTab === 'products' && (
          <section>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No products found</p>
              </div>
            )}
          </section>
        )}

        {/* ── CREATORS tab ────────────────────────────────────────────────── */}
        {activeTab === 'creators' && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredCreators.map(creator => (
                <CreatorCard key={creator.id} creator={creator} />
              ))}
            </div>
            {filteredCreators.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No creators found</p>
              </div>
            )}
          </section>
        )}

        {/* ── STORES tab ──────────────────────────────────────────────────── */}
        {activeTab === 'stores' && (
          <section>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredStores.map(store => (
                <StoreCard key={store.id} store={store} />
              ))}
            </div>
            {filteredStores.length === 0 && (
              <div className="py-20 text-center text-muted-foreground">
                <Store className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="font-medium">No stores found</p>
              </div>
            )}
          </section>
        )}
      </div>

      {/* PostViewer sheet — opens when tapping a grid tile */}
      <Sheet open={!!explorePostSheet} onOpenChange={open => { if (!open) setExplorePostSheet(null); }}>
        <SheetContent side="bottom" className="h-[95dvh] p-0 overflow-hidden bg-background [&>button]:hidden">
          <VisuallyHidden><SheetTitle>Post</SheetTitle></VisuallyHidden>
          <VisuallyHidden><SheetDescription>View post details, like, comment and share</SheetDescription></VisuallyHidden>
          {explorePostSheet && (
            <PostViewer post={explorePostSheet} onClose={() => setExplorePostSheet(null)} />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
