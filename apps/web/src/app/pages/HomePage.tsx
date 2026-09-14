import { useMemo, useRef, useState } from 'react';
import { Camera, ChevronRight, Check, Flame, Play, ShoppingCart, Sparkles, Star, Store, TrendingUp, Users, UserPlus, UserCheck, Zap } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { discountPercent, formatCompactNumber as fmtCount, formatMoney, useAuth, useCategories, useFeed, useLoops, useProducts, useStories, useToggleFollow, type Category, type Post, type ProductSummary } from '@ezyify/core';
import { FeedLoading } from '../components/LoadingStates';
import { EmptyPosts } from '../components/EmptyStates';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { SEO } from '../components/SEO';
import { PostCard } from '../components/PostCard';
import { HeroBanner } from '../components/home/HeroBanner';
import { QueryError } from '../components/QueryError';
import { useMemoryOptimization } from '../hooks/useMemoryOptimization';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '../components/PullToRefreshIndicator';
import { useAddLine, useAuthed, useInCart, useInfiniteList } from '../lib/data';
import { formErrors } from '../lib/apiErrors';

type FeedFilter = 'foryou' | 'following' | 'trending';
type FeedItem =
  | { type: 'post'; id: string; post: Post }
  | { type: 'loop-card'; id: string; loop: Post }
  | { type: 'loop-strip'; id: string; loops: Post[] }
  | { type: 'products'; id: string; products: ProductSummary[]; title: string; subtitle: string }
  | { type: 'categories'; id: string }
  | { type: 'creators'; id: string; creators: Post['author'][] }
  | { type: 'following-header'; id: string };

const CATEGORY_ICON: Record<string, string> = { fashion: '👗', beauty: '💄', tech: '📱', home: '🏠', fitness: '🏋️', food: '🍕', sports: '⚽', books: '📚', health: '🌿' };
const avatarOf = (u: { avatarUrl: string | null; name: string }) => u.avatarUrl ?? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(u.name)}`;

/** Interleaves posts with commerce/discovery sections so the feed keeps its rhythm regardless of page size. */
function buildFeed(filter: FeedFilter, posts: Post[], loops: Post[], products: ProductSummary[], creators: Post['author'][]): FeedItem[] {
  const f: FeedItem[] = [];
  const ordered = filter === 'trending' ? [...posts].sort((a, b) => b.engagement.likes - a.engagement.likes) : posts;
  if (filter === 'following') f.push({ type: 'following-header', id: 'following-hdr' });
  ordered.forEach((p, i) => {
    f.push({ type: 'post', id: `p-${p.id}`, post: p });
    if (filter === 'following') return;
    if (i === 1 && loops[0]) f.push({ type: 'loop-card', id: `lc-${loops[0].id}`, loop: loops[0] });
    if (i === 3) f.push({ type: 'categories', id: 'cat-1' });
    if (i === 3 && products.length >= 2) f.push({ type: 'products', id: 'pr-0', products: products.slice(0, 4), title: 'Trending products', subtitle: 'Picked for you today' });
    if (i === 5 && loops.length >= 2) f.push({ type: 'loop-strip', id: 'loop-strip-1', loops: loops.slice(1, 5) });
    if (i === 7 && creators.length) f.push({ type: 'creators', id: 'rec-1', creators });
    if (i === 9 && products.length >= 6) f.push({ type: 'products', id: 'pr-2', products: products.slice(4, 8), title: 'Deals under the radar', subtitle: 'More from sellers you browse' });
  });
  // Short feeds still get the discovery rails.
  if (filter !== 'following' && ordered.length <= 3) {
    if (loops[0] && !f.some(x => x.type === 'loop-card')) f.push({ type: 'loop-card', id: `lc-${loops[0].id}`, loop: loops[0] });
    if (products.length >= 2 && !f.some(x => x.type === 'products')) f.push({ type: 'products', id: 'pr-0', products: products.slice(0, 4), title: 'Trending products', subtitle: 'Picked for you today' });
  }
  return f;
}

function ProductTile({ product }: { product: ProductSummary }) {
  const pct = discountPercent(product.price, product.compareAtPrice);
  const inCart = useInCart().has(product.id);
  const { add, pending } = useAddLine();
  const onAdd = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await add(product.id, 1);
      toast.success(`Added "${product.name}" to cart`);
    } catch (err) {
      toast.error(formErrors(err).message ?? 'Couldn’t add to cart');
    }
  };
  return (
    <Link to={`/product/${product.id}`} className="group rounded-xl overflow-hidden border border-border/50 bg-background hover:border-border hover:shadow-sm transition-all duration-200">
      <div className="aspect-[4/3] relative overflow-hidden bg-muted/40">
        <img loading="lazy" src={product.imageUrl} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
        {pct !== null && pct > 0 && <span className="absolute top-2 left-2 bg-error text-error-foreground px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none">-{pct}%</span>}
        <button
          type="button"
          onClick={onAdd}
          disabled={pending || !product.inStock}
          aria-label={inCart ? 'In cart' : `Add ${product.name} to cart`}
          className={`absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${inCart ? 'bg-emerald-500 opacity-100' : 'bg-white sm:opacity-0 sm:group-hover:opacity-100 opacity-90 hover:bg-primary hover:text-white'}`}
        >
          {inCart ? <Check className="w-3.5 h-3.5 text-white" /> : <ShoppingCart className="w-3.5 h-3.5 text-foreground" />}
        </button>
      </div>
      <div className="p-2.5">
        <h4 className="text-[12px] font-medium text-foreground line-clamp-2 mb-1.5 leading-snug">{product.name}</h4>
        <div className="flex items-baseline gap-1.5 mb-1">
          <span className="text-[13px] font-bold text-foreground">{formatMoney(product.price)}</span>
          {product.compareAtPrice && <span className="text-[11px] text-foreground-secondary line-through">{formatMoney(product.compareAtPrice)}</span>}
        </div>
        <div className="flex items-center gap-1">
          <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
          <span className="text-[11px] font-medium text-foreground/70">{product.rating.toFixed(1)}</span>
          <span className="text-[11px] text-foreground-secondary">· {fmtCount(product.reviewCount)} reviews</span>
        </div>
      </div>
    </Link>
  );
}

function CreatorRow({ creator }: { creator: Post['author'] }) {
  const navigate = useNavigate();
  const authed = useAuthed();
  const follow = useToggleFollow();
  const [following, setFollowing] = useState(false);
  const toggle = () => {
    if (!authed) return navigate('/login', { state: { next: '/' } });
    follow.mutate({ username: creator.username, following });
    setFollowing(v => !v);
    if (!following) toast.success(`Following @${creator.username}`);
  };
  return (
    <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors duration-150">
      <Link to={`/profile/${creator.username}`} className="flex items-center gap-3 min-w-0 flex-1">
        <div className="story-ring-gradient p-[2px] rounded-full shrink-0">
          <div className="bg-card p-[1.5px] rounded-full">
            <img loading="lazy" src={avatarOf(creator)} alt="" className="w-10 h-10 rounded-full object-cover" />
          </div>
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1 mb-0.5">
            <span className="font-semibold text-[13px] text-foreground truncate">{creator.name}</span>
            {creator.verified && <VerifiedBadge size="sm" />}
          </div>
          <span className="text-[11px] text-foreground-secondary">@{creator.username}{creator.role === 'seller' ? ' · Seller' : creator.role === 'creator' ? ' · Creator' : ''}</span>
        </div>
      </Link>
      <button
        type="button"
        onClick={toggle}
        aria-pressed={following}
        className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-150 active:scale-[0.92] inline-flex items-center gap-1 ${following ? 'bg-muted text-foreground/70 border border-border/70' : 'text-white shadow-sm hover:opacity-90'}`}
        style={following ? {} : { background: 'var(--brand-gradient)' }}
      >
        {following ? <><UserCheck className="w-3 h-3" /> Following</> : <><UserPlus className="w-3 h-3" /> Follow</>}
      </button>
    </div>
  );
}

const SectionHeader = ({ icon: Icon, title, subtitle, to, cta }: { icon: typeof Zap; title: string; subtitle?: string; to: string; cta: string }) => (
  <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
    <div className="flex items-center gap-2.5">
      <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
        <Icon className="w-[15px] h-[15px] text-primary" />
      </div>
      <div>
        <p className="text-[13px] font-semibold text-foreground leading-tight">{title}</p>
        {subtitle && <p className="text-[11px] text-foreground-secondary mt-0.5 leading-none">{subtitle}</p>}
      </div>
    </div>
    <Link to={to} className="text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors flex items-center gap-0.5">
      {cta} <ChevronRight className="w-3.5 h-3.5" />
    </Link>
  </div>
);

export default function HomePage() {
  useMemoryOptimization('HomePage');
  const authed = useAuthed();
  const me = useAuth(s => s.user);
  const [filter, setFilter] = useState<FeedFilter>('foryou');
  const feedTopRef = useRef<HTMLDivElement>(null);

  const feed = useFeed(filter === 'following' && me ? { author: undefined } : {});
  const loops = useLoops();
  const stories = useStories();
  const products = useProducts({ pageSize: 8 });
  const categories = useCategories();
  const { items: posts, loadMore, hasMore, loadingMore } = useInfiniteList<Post>(feed);
  const loopItems = useMemo(() => loops.data?.pages[0]?.items ?? [], [loops.data]);
  const productItems = useMemo(() => products.data?.pages[0]?.items ?? [], [products.data]);

  const { pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await Promise.all([feed.refetch(), loops.refetch(), stories.refetch()]);
    },
    enabled: true,
    threshold: 80,
  });

  const storyUsers = useMemo(() => {
    const seen = new Map<string, Post['author']>();
    for (const s of stories.data ?? []) if (!seen.has(s.author.id)) seen.set(s.author.id, s.author);
    return [...seen.values()];
  }, [stories.data]);

  const creators = useMemo(() => {
    const seen = new Map<string, Post['author']>();
    for (const p of [...loopItems, ...posts]) if (p.author.id !== me?.id && !seen.has(p.author.id)) seen.set(p.author.id, p.author);
    return [...seen.values()].slice(0, 5);
  }, [loopItems, posts, me?.id]);

  const feedItems = useMemo(() => buildFeed(filter, posts, loopItems, productItems, creators), [filter, posts, loopItems, productItems, creators]);
  let delayIdx = 0;

  const renderCategories = (key: string, delay: number) => (
    <div key={key} className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in" style={{ animationDelay: `${delay}ms` }}>
      <SectionHeader icon={Store} title="Shop by category" to="/shop" cta="See all" />
      <div className="overflow-x-auto scrollbar-hide px-3 py-3">
        <div className="flex gap-2.5 min-w-max">
          {(categories.data ?? []).map((c: Category) => (
            <Link key={c.id} to={`/shop?category=${c.slug}`} className="flex flex-col items-center gap-1.5 w-[68px] shrink-0 group">
              <div className="w-[52px] h-[52px] rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center text-[22px] group-hover:bg-muted group-hover:scale-[1.06] transition-all duration-200 shadow-sm">{CATEGORY_ICON[c.slug] ?? '🛍️'}</div>
              <div className="text-center">
                <p className="text-[10px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors leading-tight">{c.name}</p>
                <p className="text-[9px] text-foreground-secondary tabular-nums">{c.productCount}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  const renderLoopCard = (loop: Post, key: string, delay: number) => {
    const m = loop.media[0];
    return (
      <Link key={key} to={`/loops?v=${loop.id}`} className="block relative rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in group" style={{ animationDelay: `${delay}ms` }}>
        <div className="aspect-[16/9] sm:aspect-[21/9] relative overflow-hidden">
          <img loading="lazy" src={m.thumbnailUrl ?? m.url} alt={loop.caption} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-bold text-white bg-brand-gradient">
            <Zap className="w-3 h-3 fill-current" />Loops
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full flex items-center justify-center transition-transform duration-200 group-hover:scale-[1.1]" style={{ background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)' }}>
              <Play className="w-7 h-7 sm:w-9 sm:h-9 text-white fill-white ml-1" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-4 py-4">
            <div className="flex items-center gap-2.5 mb-1.5">
              <img loading="lazy" src={avatarOf(loop.author)} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30 shrink-0" />
              <div>
                <div className="flex items-center gap-1">
                  <span className="text-[13px] font-semibold text-white">{loop.author.name}</span>
                  {loop.author.verified && <VerifiedBadge size="sm" />}
                </div>
                {!!loop.engagement.views && <span className="text-[11px] text-white/65">{fmtCount(loop.engagement.views)} views</span>}
              </div>
            </div>
            {loop.caption && <p className="text-[13px] text-white/90 line-clamp-1 leading-snug">{loop.caption}</p>}
          </div>
        </div>
        <div className="flex items-center justify-between px-4 py-3 bg-black/85 dark:bg-zinc-900/90">
          <div className="flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-white/60" />
            <span className="text-[12px] font-semibold text-white/85">Watch Loops</span>
            <span className="text-[11px] text-white/55">Short videos from creators</span>
          </div>
          <span className="text-[12px] font-semibold text-white/90 flex items-center gap-1">Watch now <ChevronRight className="w-3.5 h-3.5" /></span>
        </div>
      </Link>
    );
  };

  const renderLoopStrip = (items: Post[], key: string, delay: number) => (
    <div key={key} className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in" style={{ animationDelay: `${delay}ms` }}>
      <SectionHeader icon={Play} title="Trending Loops" subtitle="Short videos picked for you" to="/loops" cta="Watch all" />
      <div className="overflow-x-auto scrollbar-hide px-3 py-3">
        <div className="flex gap-2.5 min-w-max">
          {items.map(loop => {
            const m = loop.media[0];
            return (
              <Link key={loop.id} to={`/loops?v=${loop.id}`} className="group w-[132px] sm:w-[152px] shrink-0 rounded-xl overflow-hidden">
                <div className="aspect-[9/16] relative overflow-hidden bg-muted/50">
                  <img loading="lazy" src={m.thumbnailUrl ?? m.url} alt={loop.caption} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-transparent to-black/10" />
                  {!!loop.engagement.views && (
                    <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-white text-[9px] font-bold tabular-nums" style={{ background: 'rgba(0,0,0,0.55)' }}>{fmtCount(loop.engagement.views)}</div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 px-2 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <img loading="lazy" src={avatarOf(loop.author)} alt="" className="w-5 h-5 rounded-full object-cover ring-1 ring-white/30 shrink-0" />
                      <span className="text-[10px] font-semibold text-white/90 truncate">{loop.author.name.split(' ')[0]}</span>
                    </div>
                    {loop.caption && <p className="text-[10px] text-white/75 line-clamp-2 leading-snug">{loop.caption}</p>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderProducts = (item: Extract<FeedItem, { type: 'products' }>, delay: number) => (
    <div key={item.id} className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in" style={{ animationDelay: `${delay}ms` }}>
      <SectionHeader icon={TrendingUp} title={item.title} subtitle={item.subtitle} to="/shop" cta="See all" />
      <div className="grid grid-cols-2 gap-2 p-2.5">
        {item.products.map(p => <ProductTile key={p.id} product={p} />)}
      </div>
    </div>
  );

  const renderCreators = (list: Post['author'][], key: string, delay: number) => (
    <div key={key} className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in" style={{ animationDelay: `${delay}ms` }}>
      <SectionHeader icon={Sparkles} title="Recommended for you" subtitle="Creators and sellers you might like" to="/explore" cta="See all" />
      <div className="px-3 pt-1.5 pb-3 space-y-1">
        {list.map(c => <CreatorRow key={c.id} creator={c} />)}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Home Feed – Discover & Connect" description="Your personalized Ezyify feed. Discover trending posts, loops, products, creators, and stores in one social commerce experience." keywords="social feed, content discovery, trending posts, creator content, online shopping" />
      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} threshold={80} />

      <div className="lg:max-w-2xl lg:mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-4 lg:py-6">
        <div className="bg-card border-y sm:border border-border/60 sm:rounded-2xl px-3 py-3 mb-3 sm:mb-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 sm:gap-4 min-w-max">
            <Link to={authed ? '/upload' : '/login'} className="flex flex-col items-center gap-1.5 shrink-0 group">
              <div className="relative p-[2.5px] rounded-full ring-[1.5px] ring-border/50 transition-transform duration-200 group-hover:scale-[1.06]">
                <div className="bg-card p-[2px] rounded-full">
                  <img src={me ? avatarOf(me) : `https://api.dicebear.com/7.x/initials/svg?seed=you`} alt="" className="w-[50px] h-[50px] rounded-full object-cover" />
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-[2px] border-card bg-brand-gradient">
                  <Camera className="w-2.5 h-2.5 text-white" />
                </div>
              </div>
              <span className="text-[11px] max-w-[54px] truncate text-center leading-tight font-semibold text-primary">Add story</span>
            </Link>
            {stories.isLoading && !storyUsers.length && [0, 1, 2, 3, 4].map(i => <div key={i} className="w-[58px] h-[58px] rounded-full bg-muted animate-pulse shrink-0" />)}
            {storyUsers.map((u, i) => (
              <Link key={u.id} to={`/stories/${u.username}`} className="flex flex-col items-center gap-1.5 shrink-0 group">
                <div className="relative p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-[1.06] story-ring-gradient">
                  <div className="bg-card p-[2px] rounded-full">
                    <img loading={i < 5 ? 'eager' : 'lazy'} src={avatarOf(u)} alt={u.name} className="w-[50px] h-[50px] rounded-full object-cover" />
                  </div>
                </div>
                <span className="text-[11px] max-w-[54px] truncate text-center leading-tight font-medium text-foreground-secondary group-hover:text-foreground transition-colors">{u.name.split(' ')[0]}</span>
              </Link>
            ))}
          </div>
        </div>

        {filter === 'foryou' && <HeroBanner liveCount={0} featuredImage={productItems[0]?.imageUrl} featuredName={productItems[0]?.name} />}

        <div ref={feedTopRef} className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-3.5 sm:px-0 mb-3 sm:mb-4" role="group" aria-label="Feed filter">
          {([
            { id: 'foryou', label: 'For You', icon: Sparkles },
            { id: 'following', label: 'Following', icon: Users },
            { id: 'trending', label: 'Trending', icon: Flame },
          ] as { id: FeedFilter; label: string; icon: typeof Sparkles }[]).map(tab => {
            const active = filter === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(tab.id)}
                className={`shrink-0 inline-flex h-9 items-center gap-1.5 px-4 rounded-full text-[13px] font-semibold transition-all duration-150 active:scale-[0.95] tap-highlight-none ${active ? 'bg-brand-gradient text-white shadow-brand' : 'bg-card border border-border/60 text-foreground-secondary hover:text-foreground hover:border-border'}`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
          <Link to="/live-shopping" className="shrink-0 inline-flex h-9 items-center gap-1.5 px-4 rounded-full text-[13px] font-semibold bg-error-subtle border border-error/20 text-error hover:bg-error/15 transition-all duration-150">
            <span className="w-1.5 h-1.5 rounded-full bg-error live-badge shrink-0" />
            Live
          </Link>
        </div>

        {filter === 'following' && !authed && (
          <div className="mb-4 rounded-2xl border border-dashed border-border bg-card px-4 py-6 text-center">
            <p className="font-display text-base font-semibold text-foreground">Follow creators to build your feed</p>
            <p className="mt-1 text-sm text-foreground-secondary">Sign in to see posts from people you follow.</p>
            <Link to="/login" className="mt-3 inline-flex h-9 items-center rounded-full bg-brand-gradient px-4 text-[13px] font-semibold text-white">Sign in</Link>
          </div>
        )}

        {feed.isLoading ? (
          <FeedLoading count={3} />
        ) : feed.error ? (
          <QueryError error={feed.error} onRetry={() => void feed.refetch()} />
        ) : feedItems.length === 0 ? (
          <EmptyPosts />
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {feedItems.map(item => {
              const delay = Math.min(delayIdx++ * 30, 260);
              switch (item.type) {
                case 'post':
                  return <PostCard key={item.id} post={item.post} animationDelay={delay} hideFollow={item.post.author.id === me?.id} />;
                case 'loop-card':
                  return renderLoopCard(item.loop, item.id, delay);
                case 'loop-strip':
                  return renderLoopStrip(item.loops, item.id, delay);
                case 'products':
                  return renderProducts(item, delay);
                case 'categories':
                  return renderCategories(item.id, delay);
                case 'creators':
                  return renderCreators(item.creators, item.id, delay);
                case 'following-header':
                  return (
                    <div key={item.id} className="flex items-center gap-2 px-3.5 sm:px-0 text-[12px] text-foreground-secondary">
                      <Users className="w-3.5 h-3.5" /> Latest from creators you follow
                    </div>
                  );
                default:
                  return null;
              }
            })}
          </div>
        )}

        {loadingMore && <div className="mt-4"><FeedLoading count={1} /></div>}

        {hasMore && !feed.isLoading && (
          <div className="mt-8 pb-24 sm:pb-10 flex flex-col items-center gap-3">
            <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border to-transparent mb-1" />
            <button
              type="button"
              onClick={loadMore}
              disabled={loadingMore}
              className="group inline-flex items-center gap-2 px-8 py-2.5 rounded-full border border-border/60 bg-card text-[13px] font-semibold text-foreground/75 hover:text-foreground hover:border-border hover:bg-muted/50 hover:shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Load more posts<span className="text-foreground-secondary">↓</span>
            </button>
          </div>
        )}
        {!hasMore && !feed.isLoading && feedItems.length > 0 && <div className="pb-24 sm:pb-10 pt-8 text-center text-[12px] text-foreground-tertiary">You’re all caught up ✨</div>}
      </div>
    </div>
  );
}
