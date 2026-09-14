import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import {
  Heart, MessageCircle, Share2, BookmarkPlus, Play, ShoppingBag,
  MoreVertical, Star, UserPlus, UserCheck, Camera, TrendingUp,
  Store, Users, ChevronRight, ChevronLeft, Zap, Radio, Flame, Tag, Clock,
  ShoppingCart, Sparkles, Check, Repeat2
} from 'lucide-react';
import { Link } from 'react-router';
import { posts, getLoops } from '../data/posts';
import { getProductById, getTrendingProducts } from '../data/products';
import { FeedLoading } from '../components/LoadingStates';
import { EmptyPosts } from '../components/EmptyStates';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { SEO } from '../components/SEO';
import { PostCard } from '../components/PostCard';
import { HeroBanner } from '../components/home/HeroBanner';
import { useMemoryOptimization } from '../hooks/useMemoryOptimization';
import { usePullToRefresh } from '../hooks/usePullToRefresh';
import { PullToRefreshIndicator } from '../components/PullToRefreshIndicator';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000)    return `${Math.round(n / 1_000)}K`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}
function discountPct(price: number, original?: number): number | null {
  if (!original || original <= price) return null;
  const pct = Math.round((1 - price / original) * 100);
  return pct >= 10 ? pct : null;
}
function parseCaption(
  text: string,
  renderLink: (href: string, label: string, key: number) => React.ReactNode
): React.ReactNode[] {
  return text.split(/(#\w+|@\w+)/g).map((part, i) => {
    if (part.startsWith('#')) return renderLink(`/explore?tag=${encodeURIComponent(part)}`, part, i);
    if (part.startsWith('@')) return renderLink(`/profile/${part.slice(1)}`, part, i);
    return part;
  });
}

// ─── Constants (outside component to avoid re-creation) ───────────────────────
const FLASH_SALE_ENDS = Date.now() + 2 * 3_600_000 + 34 * 60_000 + 22 * 1_000;
const FLASH_PRODUCT_IDS = ['prod-001', 'prod-002', 'prod-007', 'prod-004'];

const LIVE_STREAMS = [
  { id: 'live-1', username: 'stylehub_official', name: 'StyleHub', avatar: 'https://images.unsplash.com/photo-1623594675959-02360202d4d6?w=200', thumbnail: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=400', viewers: 1247, title: 'Summer Flash Sale 🔥', badge: 'Shopping', verified: true },
  { id: 'live-2', username: 'fashionista_maya', name: 'Maya Chen', avatar: 'https://images.unsplash.com/photo-1507611268508-bf74edce9029?w=200', thumbnail: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400', viewers: 892, title: 'Fall Fashion Haul 🍂', badge: 'Fashion', verified: true },
  { id: 'live-3', username: 'tech_reviews_pro', name: 'Alex Kumar', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', thumbnail: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=400', viewers: 2341, title: 'iPhone Unboxing 📱', badge: 'Tech', verified: true },
  { id: 'live-4', username: 'beauty_by_rania', name: 'Rania Hassan', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200', thumbnail: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=400', viewers: 567, title: 'Makeup Tutorial 💄', badge: 'Beauty', verified: true },
];

const TRENDING_TAGS = [
  { tag: '#StyleHaul', posts: '128K' },
  { tag: '#TechDeals', posts: '94K' },
  { tag: '#BeautyRoutine', posts: '71K' },
  { tag: '#HomeDecor', posts: '58K' },
  { tag: '#FitnessGoals', posts: '112K' },
  { tag: '#SummerSale', posts: '203K' },
  { tag: '#NewArrivals', posts: '67K' },
  { tag: '#FoodieLife', posts: '89K' },
];

const RECOMMENDED_CREATORS = [
  { id: 'c1', username: 'fashionista_maya', name: 'Maya Chen', avatar: 'https://images.unsplash.com/photo-1507611268508-bf74edce9029?w=200', category: 'Fashion', followers: 128400, verified: true },
  { id: 'c2', username: 'tech_reviews_pro', name: 'Alex Kumar', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', category: 'Tech', followers: 94200, verified: true },
  { id: 'c3', username: 'lifestyle_luna', name: 'Luna Park', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200', category: 'Lifestyle', followers: 76800, verified: false },
  { id: 'c4', username: 'fitness_marco', name: 'Marco Silva', avatar: 'https://images.unsplash.com/photo-1567013127542-490d757e51fc?w=200', category: 'Fitness', followers: 58300, verified: true },
  { id: 'c5', username: 'beauty_by_rania', name: 'Rania Hassan', avatar: 'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=200', category: 'Beauty', followers: 112000, verified: true },
];

const RECOMMENDED_STORES = [
  { id: 's1', username: 'techstore', name: 'TechStore', avatar: 'https://images.unsplash.com/photo-1556155092-490a1ba16284?w=80', category: 'Electronics', rating: 4.8, products: 342, verified: true },
  { id: 's2', username: 'fashionhub', name: 'Fashion Hub', avatar: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=80', category: 'Fashion', rating: 4.7, products: 218, verified: true },
  { id: 's3', username: 'beautyworld', name: 'Beauty World', avatar: 'https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=80', category: 'Beauty', rating: 4.9, products: 156, verified: false },
  { id: 's4', username: 'homestyle', name: 'Home Style', avatar: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=80', category: 'Home', rating: 4.6, products: 289, verified: true },
];

const CREATOR_FEATURE = {
  user: { id: 'user-005', username: 'fashionista_maya', name: 'Maya Chen', avatar: 'https://images.unsplash.com/photo-1507611268508-bf74edce9029?w=200', verified: true, followers: '128.4K', bio: 'Fashion & Lifestyle Creator' },
  products: ['prod-004', 'prod-005', 'prod-006'],
  caption: "My current favorites — curated just for you ✨",
};

// Live users shown with red ring in story bar
const LIVE_USERNAMES = new Set(['stylehub_official', 'fashionista_maya', 'tech_reviews_pro']);

const CATEGORY_DATA = [
  { icon: '📱', label: 'Electronics', count: '2.1K', href: '/shop?cat=Electronics' },
  { icon: '👗', label: 'Fashion',     count: '4.8K', href: '/shop?cat=Fashion' },
  { icon: '💄', label: 'Beauty',      count: '1.9K', href: '/shop?cat=Beauty' },
  { icon: '🏠', label: 'Home',        count: '1.2K', href: '/shop?cat=Home' },
  { icon: '⚽', label: 'Sports',      count: '890',  href: '/shop?cat=Sports' },
  { icon: '📚', label: 'Books',       count: '540',  href: '/shop?cat=Books' },
  { icon: '🍕', label: 'Food',        count: '1.1K', href: '/shop?cat=Food' },
  { icon: '🌿', label: 'Health',      count: '780',  href: '/shop?cat=Health' },
];

const COMMUNITY_REVIEWS = [
  { id: 'cr-1', username: 'priya_patel99', name: 'Priya Patel', avatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200', product: 'Wireless Headphones', productId: 'prod-001', rating: 5, text: 'Absolutely love these! Sound quality is incredible and they arrived in just 2 days 🎧', likes: 234, verified: false, replies: undefined },
  { id: 'cr-2', username: 'jamie_thomas_', name: 'Jamie Thomas', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200', product: null, productId: null, rating: null, text: 'Anyone tried the new Smart Watch? Debating between this and the fitness tracker 🤔', likes: 89, verified: false, replies: 24 },
  { id: 'cr-3', username: 'leo_wong_tech', name: 'Leo Wong', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200', product: 'Smart Watch', productId: 'prod-002', rating: 4, text: 'Great watch, battery life is impressive. Minor complaint: syncing takes a moment ⌚', likes: 156, verified: true, replies: undefined },
];

type FeedItemType = 'post' | 'loop-card' | 'products' | 'creator-products' | 'loop-strip' | 'recommended' | 'live-strip' | 'trending-tags' | 'flash-sale' | 'community' | 'categories' | 'following-header';
type FeedFilter = 'foryou' | 'following' | 'trending';

// ─── Main component ───────────────────────────────────────────────────────────
export default function HomePage() {
  useMemoryOptimization('HomePage');

  const [likedPosts,     setLikedPosts]     = useState<Set<string>>(new Set());
  const [justLiked,      setJustLiked]      = useState<Set<string>>(new Set());
  const [savedPosts,     setSavedPosts]     = useState<Set<string>>(new Set());
  const [followedUsers,  setFollowedUsers]  = useState<Set<string>>(new Set());
  const [cartItems,      setCartItems]      = useState<Set<string>>(new Set());
  const [isLoading,      setIsLoading]      = useState(false);
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [selectedPost,   setSelectedPost]   = useState<any>(null);
  const [refreshKey,     setRefreshKey]     = useState(0);
  const [activeRecTab,   setActiveRecTab]   = useState<'creators' | 'stores'>('creators');
  const [activeFilter,        setActiveFilter]        = useState<FeedFilter>('foryou');
  const [countdown,           setCountdown]           = useState('');
  const [newPostsAvailable,   setNewPostsAvailable]   = useState(false);
  const [repostedPosts,       setRepostedPosts]       = useState<Set<string>>(new Set());
  const [repostCounts,        setRepostCounts]        = useState<Record<string, number>>({});
  const [repostSheetPost,     setRepostSheetPost]     = useState<any | null>(null);

  const [carouselIdx,      setCarouselIdx]      = useState<Record<string, number>>({});
  const [expandedCaptions, setExpandedCaptions] = useState<Set<string>>(new Set());

  const lastTapRef      = useRef<Record<string, number>>({});
  const feedTopRef      = useRef<HTMLDivElement>(null);
  const touchStartXRef  = useRef<Record<string, number>>({});
  const touchStartYRef  = useRef<Record<string, number>>({});

  const [feedData, setFeedData] = useState<{
    posts: any[]; loops: any[]; products: any[];
  } | null>(null);

  // ── Data loading ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const load = () => {
      setFeedData({
        posts:    posts.slice(0, 14),          // includes loop + post types
        loops:    getLoops().slice(0, 6),
        products: getTrendingProducts().slice(0, 8),
      });
    };
    if ('requestIdleCallback' in window) {
      const h = requestIdleCallback(load, { timeout: 100 });
      return () => cancelIdleCallback(h);
    }
    const t = setTimeout(load, 16);
    return () => clearTimeout(t);
  }, [refreshKey]);

  // ── Flash sale countdown ──────────────────────────────────────────────────────
  useEffect(() => {
    const update = () => {
      const diff = FLASH_SALE_ENDS - Date.now();
      if (diff <= 0) { setCountdown('Ended'); return; }
      const h = Math.floor(diff / 3_600_000);
      const m = Math.floor((diff % 3_600_000) / 60_000);
      const s = Math.floor((diff % 60_000) / 1_000);
      setCountdown(`${h}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`);
    };
    update();
    const t = setInterval(update, 1000);
    return () => clearInterval(t);
  }, []);

  // ── New posts notification ────────────────────────────────────────────────────
  useEffect(() => {
    const t = setTimeout(() => setNewPostsAvailable(true), 12_000);
    return () => clearTimeout(t);
  }, [activeFilter]);

  // ── Pull-to-refresh ────────────────────────────────────────────────────────────
  const { pullDistance, isRefreshing } = usePullToRefresh({
    onRefresh: async () => {
      await new Promise(r => setTimeout(r, 900));
      setRefreshKey(k => k + 1);
    },
    enabled: true,
    threshold: 80,
  });

  // ── Feed rhythm ────────────────────────────────────────────────────────────────
  const feedItems = useMemo(() => {
    if (!feedData) return [];
    const { posts: rp, loops: lp, products: pp } = feedData;
    const f: { type: FeedItemType; data: any; id: string }[] = [];

    if (activeFilter === 'foryou') {
      // Live Now
      f.push({ type: 'live-strip',    data: LIVE_STREAMS,  id: 'live-strip-1' });
      // Trending tags
      f.push({ type: 'trending-tags', data: TRENDING_TAGS, id: 'tags-1' });
      // Posts 0–1
      if (rp[0]) f.push({ type: 'post', data: rp[0], id: `p-${rp[0].id}` });
      if (rp[1]) f.push({ type: 'post', data: rp[1], id: `p-${rp[1].id}` });
      // Loop spotlight
      if (lp[0]) f.push({ type: 'loop-card', data: lp[0], id: `lc-${lp[0].id}` });
      // Posts 2–3
      if (rp[2]) f.push({ type: 'post', data: rp[2], id: `p-${rp[2].id}` });
      if (rp[3]) f.push({ type: 'post', data: rp[3], id: `p-${rp[3].id}` });
      // Category discovery
      f.push({ type: 'categories', data: null, id: 'cat-1' });
      // Trending products (2)
      if (pp.length >= 2) f.push({ type: 'products', data: pp.slice(0, 2), id: 'pr-0' });
      // Flash sale
      f.push({ type: 'flash-sale', data: FLASH_PRODUCT_IDS, id: 'flash-1' });
      // Posts 4–5
      if (rp[4]) f.push({ type: 'post', data: rp[4], id: `p-${rp[4].id}` });
      if (rp[5]) f.push({ type: 'post', data: rp[5], id: `p-${rp[5].id}` });
      // Creator picks
      f.push({ type: 'creator-products', data: CREATOR_FEATURE, id: 'creator-products-1' });
      // Posts 6–7
      if (rp[6]) f.push({ type: 'post', data: rp[6], id: `p-${rp[6].id}` });
      if (rp[7]) f.push({ type: 'post', data: rp[7], id: `p-${rp[7].id}` });
      // Community reviews
      f.push({ type: 'community', data: COMMUNITY_REVIEWS, id: 'community-1' });
      // Trending loops strip
      if (lp.length >= 3) f.push({ type: 'loop-strip', data: lp.slice(1, 4), id: 'loop-strip-1' });
      // Recommended
      f.push({ type: 'recommended', data: { creators: RECOMMENDED_CREATORS, stores: RECOMMENDED_STORES }, id: 'rec-1' });
      // Posts 8–9
      if (rp[8]) f.push({ type: 'post', data: rp[8],  id: `p-${rp[8].id}` });
      if (rp[9]) f.push({ type: 'post', data: rp[9],  id: `p-${rp[9].id}` });
      // More products
      if (pp.length >= 4) f.push({ type: 'products', data: pp.slice(2, 4), id: 'pr-2' });
      // Posts 10–11
      if (rp[10]) f.push({ type: 'post', data: rp[10], id: `p-${rp[10].id}` });
      if (rp[11]) f.push({ type: 'post', data: rp[11], id: `p-${rp[11].id}` });
    }

    if (activeFilter === 'following') {
      // Context header
      f.push({ type: 'following-header', data: null, id: 'following-hdr' });
      // Social-first feed for followed accounts
      if (rp[0])  f.push({ type: 'post', data: rp[0],  id: `p-${rp[0].id}` });
      if (rp[2])  f.push({ type: 'post', data: rp[2],  id: `p-${rp[2].id}` });
      if (rp[3])  f.push({ type: 'post', data: rp[3],  id: `p-${rp[3].id}` });
      // Creator picks mid-feed
      f.push({ type: 'creator-products', data: CREATOR_FEATURE, id: 'creator-products-f1' });
      if (lp[0])  f.push({ type: 'loop-card', data: lp[0], id: `lc-${lp[0].id}` });
      if (rp[6])  f.push({ type: 'post', data: rp[6],  id: `p-${rp[6].id}` });
      if (rp[7])  f.push({ type: 'post', data: rp[7],  id: `p-${rp[7].id}` });
      // Community discussions
      f.push({ type: 'community', data: COMMUNITY_REVIEWS, id: 'community-f1' });
      if (rp[9])  f.push({ type: 'post', data: rp[9],  id: `p-${rp[9].id}` });
      if (rp[10]) f.push({ type: 'post', data: rp[10], id: `p-${rp[10].id}` });
      if (lp.length >= 2) f.push({ type: 'loop-strip', data: lp.slice(1, 4), id: 'loop-strip-1' });
      if (rp[11]) f.push({ type: 'post', data: rp[11], id: `p-${rp[11].id}` });
      if (rp[12]) f.push({ type: 'post', data: rp[12], id: `p-${rp[12].id}` });
    }

    if (activeFilter === 'trending') {
      // Posts sorted by popularity first, then commerce sections
      const sorted = [...rp].sort((a, b) => b.likes - a.likes);
      f.push({ type: 'trending-tags', data: TRENDING_TAGS, id: 'tags-trend-1' });
      sorted.slice(0, 3).forEach(p => f.push({ type: 'post', data: p, id: `p-${p.id}` }));
      // Trending products after seeing posts
      if (pp.length >= 4) f.push({ type: 'products', data: pp.slice(0, 4), id: 'pr-trend-0' });
      if (lp[0]) f.push({ type: 'loop-card', data: lp[0], id: `lc-${lp[0].id}` });
      sorted.slice(3, 6).forEach(p => f.push({ type: 'post', data: p, id: `p-${p.id}` }));
      f.push({ type: 'flash-sale', data: FLASH_PRODUCT_IDS, id: 'flash-trend-1' });
      if (lp.length >= 3) f.push({ type: 'loop-strip', data: lp.slice(1, 4), id: 'loop-strip-1' });
      sorted.slice(6, 9).forEach(p => f.push({ type: 'post', data: p, id: `p-${p.id}` }));
    }

    return f.filter(i => i.data !== undefined);
  }, [feedData, activeFilter]);

  // ── Handlers ──────────────────────────────────────────────────────────────────
  const toggleLike = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setLikedPosts(prev => {
      const s = new Set(prev);
      const nowLiked = !s.has(id);
      nowLiked ? s.add(id) : s.delete(id);
      if (nowLiked) {
        setJustLiked(j => { const jj = new Set(j); jj.add(id); return jj; });
        setTimeout(() => setJustLiked(j => { const jj = new Set(j); jj.delete(id); return jj; }), 500);
      }
      return s;
    });
  }, []);

  const toggleSave = useCallback((e: React.MouseEvent, id: string) => {
    e.preventDefault();
    setSavedPosts(prev => {
      const s = new Set(prev);
      const nowSaved = !s.has(id);
      nowSaved ? s.add(id) : s.delete(id);
      if (nowSaved) toast.success('Saved to collection');
      return s;
    });
  }, []);

  const toggleFollow = useCallback((e: React.MouseEvent, username: string) => {
    e.preventDefault();
    e.stopPropagation();
    setFollowedUsers(prev => {
      const s = new Set(prev);
      const nowFollowing = !s.has(username);
      nowFollowing ? s.add(username) : s.delete(username);
      if (nowFollowing) toast.success(`Following @${username}`);
      return s;
    });
  }, []);

  const addToCart = useCallback((e: React.MouseEvent, productId: string, productName?: string) => {
    e.preventDefault();
    e.stopPropagation();
    let cart: any[] = [];
    try { const saved = localStorage.getItem('ezyify_cart'); cart = saved ? JSON.parse(saved) : []; } catch { cart = []; }
    const existing = cart.find((item: any) => item.id === productId);
    if (existing) { existing.quantity += 1; } else { cart.push({ id: productId, quantity: 1 }); }
    localStorage.setItem('ezyify_cart', JSON.stringify(cart));
    setCartItems(prev => { const s = new Set(prev); s.add(productId); return s; });
    toast.success(productName ? `Added "${productName}" to cart` : 'Added to cart');
    setTimeout(() => setCartItems(prev => { const s = new Set(prev); s.delete(productId); return s; }), 1800);
  }, []);

  const openComments = useCallback((e: React.MouseEvent, post: any) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedPost(post);
    setCommentSheetOpen(true);
  }, []);

  const handleShare = useCallback((e: React.MouseEvent, postId: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: 'Check this on Ezyify', url: `${window.location.origin}/post/${postId}` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${postId}`).catch(() => {});
      toast.success('Link copied!');
    }
  }, []);

  const handleDoubleTap = useCallback((e: React.MouseEvent, post: any) => {
    const now = Date.now();
    const last = lastTapRef.current[post.id] || 0;
    if (now - last < 350 && !likedPosts.has(post.id)) {
      toggleLike(e, post.id);
    }
    lastTapRef.current[post.id] = now;
  }, [likedPosts, toggleLike]);

  const openRepostSheet = useCallback((e: React.MouseEvent, post: any) => {
    e.preventDefault();
    e.stopPropagation();
    setRepostSheetPost(post);
  }, []);

  const handleRepost = useCallback((post: any, quoteText?: string) => {
    const alreadyReposted = repostedPosts.has(post.id);
    setRepostedPosts(prev => {
      const s = new Set(prev);
      alreadyReposted ? s.delete(post.id) : s.add(post.id);
      return s;
    });
    setRepostCounts(prev => {
      const base = prev[post.id] ?? Math.round((post.shares ?? 0) * 0.4);
      return { ...prev, [post.id]: Math.max(0, base + (alreadyReposted ? -1 : 1)) };
    });
    if (!alreadyReposted) {
      toast.success(quoteText ? 'Quote reposted to your followers!' : 'Reposted to your followers!');
    } else {
      toast.success('Repost removed');
    }
  }, [repostedPosts]);

  const handleUndoRepost = useCallback((post: any) => {
    handleRepost(post);
  }, [handleRepost]);

  const handleLoadMore = useCallback(() => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1400);
  }, []);

  // ── Loading / Empty ────────────────────────────────────────────────────────────
  if (!feedData) {
    return (
      <div className="min-h-screen bg-background">
        <div className="lg:max-w-2xl lg:mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-6">
          <FeedLoading count={3} />
        </div>
      </div>
    );
  }
  if (feedItems.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full"><EmptyPosts /></div>
      </div>
    );
  }

  // ── Stories data ───────────────────────────────────────────────────────────────
  const seenUsernames = new Set<string>(['me']);
  const storyUsers = [
    { name: 'Your Story', username: 'me', avatar: 'https://images.unsplash.com/photo-1649589244330-09ca58e4fa64?w=200', isYou: true, isLive: false, hasStory: false },
    ...posts
      .filter(p => { if (seenUsernames.has(p.user.username)) return false; seenUsernames.add(p.user.username); return true; })
      .slice(0, 9)
      .map(p => ({
        name: p.user.name,
        username: p.user.username,
        avatar: p.user.avatar,
        isYou: false,
        isLive: LIVE_USERNAMES.has(p.user.username),
        hasStory: true,
      })),
  ];

  // ── Render: Post card (delegates to shared PostCard component) ───────────────
  const renderPost = (post: any, key: string, delay: number) => (
    <PostCard key={key} post={post} animationDelay={delay} />
  );
  // ── Render: Loop spotlight card ────────────────────────────────────────────────
  const renderLoopCard = (loop: any, key: string, delay: number) => (
    <Link
      key={key}
      to="/loops"
      className="block relative rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="aspect-[16/9] sm:aspect-[21/9] relative overflow-hidden">
        {loop.content.images?.[0] && (
          <img loading="lazy" src={loop.content.images[0]} alt={loop.content.text || ''} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        )}
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
            <img loading="lazy" src={loop.user.avatar} alt={loop.user.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-white/30 shrink-0" />
            <div>
              <div className="flex items-center gap-1">
                <span className="text-[13px] font-semibold text-white">{loop.user.name}</span>
                {loop.user.verified && <VerifiedBadge size="sm" />}
              </div>
              {loop.views && <span className="text-[11px] text-white/65">{fmtCount(loop.views)} views</span>}
            </div>
          </div>
          {loop.content.text && (
            <p className="text-[13px] text-white/90 line-clamp-1 leading-snug">{loop.content.text}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between px-4 py-3 bg-black/85 dark:bg-zinc-900/90">
        <div className="flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-white/60" />
          <span className="text-[12px] font-semibold text-white/85">Watch Loops</span>
          <span className="text-[11px] text-white/55">Short videos from creators</span>
        </div>
        <span className="text-[12px] font-semibold text-white/90 flex items-center gap-1">
          Watch now <ChevronRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </Link>
  );

  // ── Render: Live Now strip ─────────────────────────────────────────────────────
  const renderLiveStrip = (streams: typeof LIVE_STREAMS, key: string, delay: number) => (
    <div
      key={key}
      className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-error-subtle flex items-center justify-center shrink-0">
            <Radio className="w-[15px] h-[15px] text-error" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <p className="text-[13px] font-semibold text-foreground leading-tight">Live Now</p>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-error animate-pulse" />
                <span className="text-[10px] font-semibold text-error">{streams.length} LIVE</span>
              </span>
            </div>
            <p className="text-[11px] text-foreground-secondary mt-0.5 leading-none">Watch live streams from creators &amp; stores</p>
          </div>
        </div>
        <Link to="/live-shopping" className="text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors flex items-center gap-0.5">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-hide px-3 py-3">
        <div className="flex gap-2.5 min-w-max">
          {streams.map(stream => (
            <Link
              key={stream.id}
              to={`/live/${stream.id}`}
              className="group relative w-[148px] sm:w-[168px] shrink-0 rounded-xl overflow-hidden"
            >
              <div className="aspect-[4/5] relative overflow-hidden bg-muted/50">
                <img loading="lazy" src={stream.thumbnail} alt={stream.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                {/* Live badge */}
                <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-1 rounded-full bg-error text-error-foreground text-[10px] font-black">
                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  LIVE
                </div>

                {/* Viewer count */}
                <div className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-white text-[10px] font-medium" style={{ background: 'rgba(0,0,0,0.55)' }}>
                  <Users className="w-3 h-3" />
                  {fmtCount(stream.viewers)}
                </div>

                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>

                {/* Bottom info */}
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <img src={stream.avatar} alt={stream.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-white/40 shrink-0" />
                    <span className="text-[10px] font-semibold text-white truncate">{stream.name}</span>
                    {stream.verified && <VerifiedBadge size="sm" />}
                  </div>
                  <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-snug">{stream.title}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Render: Trending tags ──────────────────────────────────────────────────────
  const renderTrendingTags = (tags: typeof TRENDING_TAGS, key: string, delay: number) => (
    <div
      key={key}
      className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Flame className="w-[14px] h-[14px] text-primary" />
          </div>
          <p className="text-[13px] font-semibold text-foreground">Trending</p>
        </div>
        <Link to="/explore" className="text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors flex items-center gap-0.5">
          Explore <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="overflow-x-auto scrollbar-hide px-3 py-2.5">
        <div className="flex gap-2 min-w-max">
          {tags.map(({ tag, posts: cnt }) => (
            <Link
              key={tag}
              to={`/explore?tag=${encodeURIComponent(tag)}`}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/50 border border-border/60 hover:bg-muted hover:border-border transition-all duration-150 group"
            >
              <Tag className="w-3 h-3 text-primary/70 shrink-0 group-hover:text-primary transition-colors" />
              <span className="text-[12px] font-medium text-foreground/80 group-hover:text-foreground transition-colors">{tag.slice(1)}</span>
              <span className="text-[10px] text-foreground-secondary font-medium">{cnt}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Render: Trending products ──────────────────────────────────────────────────
  const renderProductCard = (products: any[], key: string, delay: number) => (
    <div
      key={key}
      className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <TrendingUp className="w-[15px] h-[15px] text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground leading-tight">Trending Products</p>
            <p className="text-[11px] text-foreground-secondary mt-0.5 leading-none">Picked for you today</p>
          </div>
        </div>
        <Link to="/shop" className="text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors flex items-center gap-0.5">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-2 p-2.5">
        {products.map((product: any) => {
          const pct = discountPct(product.price, product.originalPrice);
          const inCart = cartItems.has(product.id);
          return (
            <Link
              key={product.id}
              to={`/product/${product.id}`}
              className="group rounded-xl overflow-hidden border border-border/50 bg-background hover:border-border hover:shadow-sm transition-all duration-200"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-muted/40">
                <img loading="lazy" src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                {pct && (
                  <span className="absolute top-2 left-2 bg-error text-error-foreground px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none">
                    -{pct}%
                  </span>
                )}
                <button
                  type="button"
                  onClick={e => addToCart(e, product.id, product.name)}
                  aria-label="Add to cart"
                  className={`absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
                    inCart ? 'bg-emerald-500 opacity-100' : 'bg-white sm:opacity-0 sm:group-hover:opacity-100 opacity-90 hover:bg-primary hover:text-white'
                  }`}
                >
                  {inCart ? <Check className="w-3.5 h-3.5 text-white" /> : <ShoppingCart className="w-3.5 h-3.5 text-foreground" />}
                </button>
              </div>
              <div className="p-2.5">
                <h4 className="text-[12px] font-medium text-foreground line-clamp-2 mb-1.5 leading-snug">{product.name}</h4>
                <div className="flex items-baseline gap-1.5 mb-1">
                  <span className="text-[13px] font-bold text-foreground">${product.price}</span>
                  {product.originalPrice && <span className="text-[11px] text-foreground-secondary line-through">${product.originalPrice}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                  <span className="text-[11px] font-medium text-foreground/70">{product.rating}</span>
                  {product.sold && <span className="text-[11px] text-foreground-secondary">· {fmtCount(product.sold)} sold</span>}
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );

  // ── Render: Flash Sale ─────────────────────────────────────────────────────────
  const renderFlashSale = (productIds: string[], key: string, delay: number) => {
    const saleProducts = productIds.map(id => getProductById(id)).filter(Boolean) as any[];
    if (saleProducts.length === 0) return null;

    return (
      <div
        key={key}
        className="border border-orange-500/20 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in bg-gradient-to-br from-orange-500/5 via-card to-card"
        style={{ animationDelay: `${delay}ms` }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-orange-500/15">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-orange-500/15 flex items-center justify-center shrink-0">
              <Zap className="w-[15px] h-[15px] text-orange-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-[13px] font-semibold text-foreground leading-tight">Flash Sale</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600">HOT</span>
              </div>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-foreground-secondary shrink-0" />
                <span className="text-[11px] text-foreground-secondary tabular-nums">
                  Ends in <span className="font-semibold text-orange-600">{countdown || '—'}</span>
                </span>
              </div>
            </div>
          </div>
          <Link to="/deals" className="text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors flex items-center gap-0.5">
            All deals <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 gap-2 p-2.5">
          {saleProducts.map((product: any) => {
            const pct = discountPct(product.price, product.originalPrice);
            const inCart = cartItems.has(product.id);
            return (
              <Link
                key={product.id}
                to={`/product/${product.id}`}
                className="group rounded-xl overflow-hidden border border-orange-500/15 bg-background hover:border-orange-500/30 hover:shadow-sm transition-all duration-200"
              >
                <div className="aspect-[4/3] relative overflow-hidden bg-muted/40">
                  <img loading="lazy" src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                  {pct && (
                    <span className="absolute top-2 left-2 text-accent-brand-foreground px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none bg-accent-brand">
                      -{pct}%
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={e => addToCart(e, product.id, product.name)}
                    aria-label="Add to cart"
                    className={`absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
                      inCart ? 'bg-emerald-500 opacity-100' : 'bg-white sm:opacity-0 sm:group-hover:opacity-100 opacity-90'
                    }`}
                  >
                    {inCart ? <Check className="w-3.5 h-3.5 text-white" /> : <ShoppingCart className="w-3.5 h-3.5 text-foreground" />}
                  </button>
                </div>
                <div className="p-2.5">
                  <h4 className="text-[12px] font-medium text-foreground line-clamp-2 mb-1 leading-snug">{product.name}</h4>
                  <div className="flex items-baseline gap-1.5 mb-1">
                    <span className="text-[13px] font-bold text-orange-600">${product.price}</span>
                    {product.originalPrice && <span className="text-[11px] text-foreground-secondary line-through">${product.originalPrice}</span>}
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="text-[11px] font-medium text-foreground/70">{product.rating}</span>
                    {product.sold && <span className="text-[11px] text-foreground-secondary">· {fmtCount(product.sold)} sold</span>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Shop All footer */}
        <div className="px-3 pb-3">
          <Link
            to="/deals"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-orange-500/25 bg-orange-500/5 hover:bg-orange-500/10 transition-colors text-[13px] font-semibold text-orange-600"
          >
            <Zap className="w-3.5 h-3.5" />
            Shop All Flash Deals
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    );
  };

  // ── Render: Creator products ───────────────────────────────────────────────────
  const renderCreatorProducts = (feature: typeof CREATOR_FEATURE, key: string, delay: number) => {
    const { user, products: pids, caption } = feature;
    const creatorProducts = pids.map(id => getProductById(id)).filter(Boolean);
    const isFollowing = followedUsers.has(user.username);

    return (
      <div
        key={key}
        className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in"
        style={{ animationDelay: `${delay}ms` }}
      >
        <div className="flex items-center justify-between gap-3 px-4 py-3.5 border-b border-border/50">
          <Link to={`/profile/${user.username}`} className="flex items-center gap-2.5 min-w-0 group">
            <div className="story-ring-gradient p-[2px] rounded-full shrink-0">
              <div className="bg-card p-[2px] rounded-full">
                <img loading="lazy" src={user.avatar} alt={user.name} className="w-10 h-10 rounded-full object-cover" />
              </div>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-semibold text-[13px] text-foreground truncate">{user.name}</span>
                {user.verified && <VerifiedBadge size="sm" />}
                <span className="text-[9px] font-bold px-1.5 py-[2px] rounded-full bg-primary/10 text-primary leading-none">Creator</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-foreground-secondary">{user.followers} followers</span>
                <span className="text-foreground-secondary text-[10px]">·</span>
                <span className="text-[11px] text-foreground-secondary">{user.bio}</span>
              </div>
            </div>
          </Link>
          <button
            type="button"
            onClick={e => toggleFollow(e, user.username)}
            className={`shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 active:scale-[0.92] ${
              isFollowing ? 'bg-muted text-foreground/80 border border-border/70' : 'text-white shadow-sm hover:opacity-90'
            }`}
            style={isFollowing ? {} : { background: 'var(--brand-gradient)' }}
          >
            {isFollowing ? <><UserCheck className="w-3.5 h-3.5" /><span className="ml-1">Following</span></> : <><UserPlus className="w-3.5 h-3.5" /><span className="ml-1">Follow</span></>}
          </button>
        </div>

        {caption && <p className="px-4 pt-3 pb-1 text-[13px] text-foreground/85 leading-snug">{caption}</p>}

        <div className="overflow-x-auto scrollbar-hide px-3 py-3">
          <div className="flex gap-2.5 min-w-max">
            {creatorProducts.map((product: any) => {
              const pct = discountPct(product.price, product.originalPrice);
              const inCart = cartItems.has(product.id);
              return (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  className="group w-[148px] shrink-0 rounded-xl overflow-hidden border border-border/50 bg-background hover:border-border hover:shadow-sm transition-all duration-200"
                >
                  <div className="aspect-square relative overflow-hidden bg-muted/40">
                    <img loading="lazy" src={product.image} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                    {pct && (
                      <span className="absolute top-1.5 left-1.5 bg-error text-error-foreground px-1.5 py-0.5 rounded-md text-[10px] font-bold leading-none">-{pct}%</span>
                    )}
                    <button
                      type="button"
                      onClick={e => addToCart(e, product.id, product.name)}
                      aria-label={inCart ? 'In cart' : 'Add to cart'}
                      className={`absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all duration-200 ${
                        inCart ? 'bg-emerald-500 opacity-100' : 'bg-white/90 sm:opacity-0 sm:group-hover:opacity-100 opacity-90'
                      }`}
                    >
                      {inCart ? <Check className="w-3.5 h-3.5 text-white" /> : <ShoppingCart className="w-3.5 h-3.5 text-foreground" />}
                    </button>
                  </div>
                  <div className="p-2.5">
                    <h4 className="text-[12px] font-medium text-foreground line-clamp-2 mb-1 leading-snug">{product.name}</h4>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-[13px] font-bold text-foreground">${product.price}</span>
                      {product.originalPrice && <span className="text-[10px] text-foreground-secondary line-through">${product.originalPrice}</span>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                      <span className="text-[11px] text-foreground/65">{product.rating}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
            <Link
              to={`/profile/${user.username}`}
              className="w-[120px] shrink-0 rounded-xl border border-dashed border-border bg-muted/30 hover:bg-muted/50 hover:border-border transition-all duration-200 flex flex-col items-center justify-center gap-2 px-3 py-4"
            >
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Store className="w-4 h-4 text-primary" />
              </div>
              <span className="text-[11px] font-semibold text-primary text-center leading-tight">All Picks</span>
            </Link>
          </div>
        </div>
      </div>
    );
  };

  // ── Render: Trending loops strip ───────────────────────────────────────────────
  const renderLoopStrip = (loops: any[], key: string, delay: number) => (
    <div
      key={key}
      className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Play className="w-[14px] h-[14px] text-primary fill-primary" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground leading-tight">Trending Loops</p>
            <p className="text-[11px] text-foreground-secondary mt-0.5 leading-none">Short videos picked for you</p>
          </div>
        </div>
        <Link to="/loops" className="text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors flex items-center gap-0.5">
          Watch all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto scrollbar-hide px-3 py-3">
        <div className="flex gap-2.5 min-w-max">
          {loops.map((loop: any) => (
            <Link
              key={loop.id}
              to="/loops"
              className="group w-[132px] sm:w-[152px] shrink-0 rounded-xl overflow-hidden"
            >
              <div className="aspect-[9/16] relative overflow-hidden bg-muted/50">
                {loop.content.images?.[0] && (
                  <img loading="lazy" src={loop.content.images[0]} alt={loop.content.text || ''} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/78 via-transparent to-black/10" />
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center" style={{ background: 'rgba(255,255,255,0.22)', backdropFilter: 'blur(8px)' }}>
                    <Play className="w-5 h-5 text-white fill-white ml-0.5" />
                  </div>
                </div>
                {loop.views && (
                  <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md text-white text-[9px] font-bold tabular-nums" style={{ background: 'rgba(0,0,0,0.55)' }}>
                    {fmtCount(loop.views)}
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 px-2 py-2.5">
                  <div className="flex items-center gap-1.5 mb-1">
                    <img loading="lazy" src={loop.user.avatar} alt={loop.user.name} className="w-5 h-5 rounded-full object-cover ring-1 ring-white/30 shrink-0" />
                    <span className="text-[10px] font-semibold text-white/90 truncate">{loop.user.name.split(' ')[0]}</span>
                  </div>
                  {loop.content.text && (
                    <p className="text-[10px] text-white/75 line-clamp-2 leading-snug">{loop.content.text}</p>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Render: Following header ───────────────────────────────────────────────────
  const renderFollowingHeader = (key: string) => (
    <div key={key} className="flex items-center justify-between px-1 animate-feed-in">
      <div className="flex items-center gap-2">
        <div className="flex -space-x-1.5">
          {RECOMMENDED_CREATORS.slice(0, 3).map(c => (
            <img key={c.id} src={c.avatar} alt={c.name} className="w-6 h-6 rounded-full object-cover ring-2 ring-background" />
          ))}
        </div>
        <span className="text-[12px] text-foreground-secondary">Posts from people you follow</span>
      </div>
      <Link to="/explore" className="text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors flex items-center gap-0.5">
        Discover <ChevronRight className="w-3.5 h-3.5" />
      </Link>
    </div>
  );

  // ── Render: Category discovery strip ──────────────────────────────────────────
  const renderCategoryStrip = (key: string, delay: number) => (
    <div
      key={key}
      className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-4 py-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <Store className="w-[13px] h-[13px] text-primary" />
          </div>
          <p className="text-[13px] font-semibold text-foreground">Shop by Category</p>
        </div>
        <Link to="/shop" className="text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors flex items-center gap-0.5">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="overflow-x-auto scrollbar-hide px-3 py-3">
        <div className="flex gap-2.5 min-w-max">
          {CATEGORY_DATA.map(({ icon, label, count, href }) => (
            <Link
              key={label}
              to={href}
              className="flex flex-col items-center gap-1.5 w-[68px] shrink-0 group"
            >
              <div className="w-[52px] h-[52px] rounded-2xl bg-muted/50 border border-border/60 flex items-center justify-center text-[22px] group-hover:bg-muted group-hover:scale-[1.06] transition-all duration-200 shadow-sm">
                {icon}
              </div>
              <div className="text-center">
                <p className="text-[10px] font-semibold text-foreground/80 group-hover:text-foreground transition-colors leading-tight">{label}</p>
                <p className="text-[9px] text-foreground-secondary tabular-nums">{count}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  // ── Render: Community reviews ──────────────────────────────────────────────────
  const renderCommunitySection = (reviews: typeof COMMUNITY_REVIEWS, key: string, delay: number) => (
    <div
      key={key}
      className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-4 py-3.5 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-violet-500/10 flex items-center justify-center shrink-0">
            <Users className="w-[14px] h-[14px] text-violet-500" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground leading-tight">Community</p>
            <p className="text-[11px] text-foreground-secondary mt-0.5 leading-none">Real reviews &amp; discussions</p>
          </div>
        </div>
        <Link to="/explore" className="text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors flex items-center gap-0.5">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="px-3 pt-2 pb-3 space-y-1.5">
        {reviews.map(review => (
          <div key={review.id} className="flex gap-3 p-2.5 rounded-xl hover:bg-muted/30 transition-colors duration-150 cursor-default">
            <img loading="lazy" src={review.avatar} alt={review.name} className="w-9 h-9 rounded-full object-cover shrink-0 mt-0.5" />
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[12px] font-semibold text-foreground leading-tight">{review.name}</span>
                  {review.verified && <VerifiedBadge size="sm" />}
                </div>
                {review.rating !== null && (
                  <div className="flex items-center gap-0.5 shrink-0">
                    {Array.from({ length: review.rating! }).map((_, i) => (
                      <Star key={i} className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                )}
              </div>
              {review.product && review.productId && (
                <Link
                  to={`/product/${review.productId}`}
                  onClick={e => e.stopPropagation()}
                  className="inline-flex items-center gap-1 mb-1.5 px-2 py-0.5 rounded-full bg-muted/50 border border-border/50 hover:bg-muted transition-colors"
                >
                  <ShoppingBag className="w-2.5 h-2.5 text-primary/70 shrink-0" />
                  <span className="text-[10px] font-medium text-foreground/70">{review.product}</span>
                </Link>
              )}
              <p className="text-[12px] text-foreground/80 leading-snug">{review.text}</p>
              <div className="flex items-center gap-3 mt-1.5">
                <button type="button" className="flex items-center gap-1 text-[11px] text-foreground-secondary hover:text-like transition-colors">
                  <Heart className="w-3 h-3" /><span>{review.likes}</span>
                </button>
                {review.replies !== undefined && review.replies !== null && (
                  <button type="button" className="flex items-center gap-1 text-[11px] text-foreground-secondary hover:text-foreground transition-colors">
                    <MessageCircle className="w-3 h-3" /><span>{review.replies} replies</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        <Link to="/explore" className="flex items-center justify-center gap-1 pt-2 pb-1 text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors border-t border-border/40 mt-1">
          Join the conversation <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );

  // ── Render: Recommended ────────────────────────────────────────────────────────
  const renderRecommended = (data: { creators: typeof RECOMMENDED_CREATORS; stores: typeof RECOMMENDED_STORES }, key: string, delay: number) => (
    <div
      key={key}
      className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-border/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Sparkles className="w-[15px] h-[15px] text-primary" />
          </div>
          <div>
            <p className="text-[13px] font-semibold text-foreground leading-tight">Recommended For You</p>
            <p className="text-[11px] text-foreground-secondary mt-0.5 leading-none">Based on your interests</p>
          </div>
        </div>
        <Link to="/explore" className="text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors flex items-center gap-0.5">
          See all <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/50">
        {(['creators', 'stores'] as const).map(tab => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveRecTab(tab)}
            className={`px-3.5 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 ${
              activeRecTab === tab
                ? 'text-white shadow-sm'
                : 'bg-muted text-foreground-secondary hover:bg-muted/80 hover:text-foreground'
            }`}
            style={activeRecTab === tab ? { background: 'var(--brand-gradient)' } : {}}
          >
            {tab === 'creators' ? 'Creators' : 'Stores'}
          </button>
        ))}
      </div>

      {/* Creators */}
      {activeRecTab === 'creators' && (
        <div className="px-3 pt-1.5 pb-3 space-y-1">
          {data.creators.map(creator => {
            const isFollowing = followedUsers.has(creator.username);
            return (
              <div key={creator.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors duration-150">
                <Link to={`/profile/${creator.username}`} className="flex items-center gap-3 min-w-0 flex-1">
                  <div className="story-ring-gradient p-[2px] rounded-full shrink-0">
                    <div className="bg-card p-[1.5px] rounded-full">
                      <img loading="lazy" src={creator.avatar} alt={creator.name} className="w-10 h-10 rounded-full object-cover" />
                    </div>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className="font-semibold text-[13px] text-foreground truncate">{creator.name}</span>
                      {creator.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[11px] text-primary font-medium">{creator.category}</span>
                      <span className="text-foreground-secondary text-[10px]">·</span>
                      <span className="text-[11px] text-foreground-secondary">{fmtCount(creator.followers)} followers</span>
                    </div>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={e => toggleFollow(e, creator.username)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-150 active:scale-[0.92] ${
                    isFollowing ? 'bg-muted text-foreground/75 border border-border/70' : 'text-white'
                  }`}
                  style={isFollowing ? {} : { background: 'var(--brand-gradient)' }}
                >
                  {isFollowing ? 'Following' : 'Follow'}
                </button>
              </div>
            );
          })}
          <Link to="/explore" className="flex items-center justify-center gap-1 pt-2 pb-1 text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors border-t border-border/40 mt-1">
            Discover more creators <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Stores */}
      {activeRecTab === 'stores' && (
        <div className="px-3 pt-1.5 pb-3 space-y-1">
          {data.stores.map(store => (
            <div key={store.id} className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/40 transition-colors duration-150">
              <Link to={`/seller/${store.username}`} className="flex items-center gap-3 min-w-0 flex-1">
                <img loading="lazy" src={store.avatar} alt={store.name} className="w-10 h-10 rounded-xl object-cover ring-[1.5px] ring-border/60 shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1 mb-0.5">
                    <span className="font-semibold text-[13px] text-foreground truncate">{store.name}</span>
                    {store.verified && <VerifiedBadge variant="seller" size="sm" />}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] text-foreground-secondary">{store.category}</span>
                    <span className="text-foreground-secondary text-[10px]">·</span>
                    <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400 shrink-0" />
                    <span className="text-[11px] text-foreground/65 font-medium">{store.rating}</span>
                    <span className="text-foreground-secondary text-[10px]">·</span>
                    <span className="text-[11px] text-foreground-secondary">{store.products} products</span>
                  </div>
                </div>
              </Link>
              <Link
                to={`/seller/${store.username}`}
                className="shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold text-white shadow-sm hover:opacity-90 transition-all duration-150 active:scale-[0.92] bg-brand-gradient"
              >
                Visit
              </Link>
            </div>
          ))}
          <Link to="/explore" className="flex items-center justify-center gap-1 pt-2 pb-1 text-[12px] font-semibold text-primary hover:text-primary/75 transition-colors border-t border-border/40 mt-1">
            Browse all stores <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}
    </div>
  );

  // ── Main render ────────────────────────────────────────────────────────────────
  let feedDelay = 0;

  return (
    <div className="min-h-screen bg-background">
      <SEO
        title="Home Feed – Discover & Connect"
        description="Your personalized Ezyify feed. Discover trending posts, loops, products, creators, and stores in one social commerce experience."
        keywords="social feed, content discovery, trending posts, creator content, online shopping"
      />

      <PullToRefreshIndicator pullDistance={pullDistance} isRefreshing={isRefreshing} threshold={80} />

      <div className="lg:max-w-2xl lg:mx-auto px-0 sm:px-4 lg:px-6 py-0 sm:py-4 lg:py-6">

        {/* ─── Stories bar ──────────────────────────────────────────────────── */}
        <div className="bg-card border-y sm:border border-border/60 sm:rounded-2xl px-3 py-3 mb-3 sm:mb-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-3 sm:gap-4 min-w-max">
            {storyUsers.map((story, i) => (
              <Link
                key={story.username}
                to={story.isYou ? '/upload' : `/stories/${story.username}`}
                className="flex flex-col items-center gap-1.5 shrink-0 group"
              >
                <div className={`relative p-[2.5px] rounded-full transition-transform duration-200 group-hover:scale-[1.06] ${
                  story.isYou
                    ? 'ring-[1.5px] ring-border/50 bg-transparent'
                    : story.isLive
                    ? ''
                    : 'story-ring-gradient'
                }`}
                style={story.isLive ? { background: 'linear-gradient(135deg, var(--error) 0%, var(--orange-500) 100%)' } : {}}
                >
                  <div className="bg-card p-[2px] rounded-full">
                    <img
                      loading={i < 5 ? 'eager' : 'lazy'}
                      src={story.avatar}
                      alt={story.name}
                      className="w-[50px] h-[50px] rounded-full object-cover"
                    />
                  </div>
                  {story.isYou && (
                    <div className="absolute -bottom-0.5 -right-0.5 w-[18px] h-[18px] rounded-full flex items-center justify-center border-[2px] border-card bg-brand-gradient">
                      <Camera className="w-2.5 h-2.5 text-white" />
                    </div>
                  )}
                  {story.isLive && !story.isYou && (
                    <div className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 px-1.5 py-px rounded-full bg-error text-error-foreground text-[8px] font-black leading-none whitespace-nowrap border border-card">
                      LIVE
                    </div>
                  )}
                </div>
                <span className={`text-[11px] max-w-[54px] truncate text-center leading-tight transition-colors ${
                  story.isYou
                    ? 'font-semibold text-primary'
                    : story.isLive
                    ? 'font-semibold text-error'
                    : 'font-medium text-foreground-secondary group-hover:text-foreground'
                }`}>
                  {story.isYou ? 'Add Story' : story.name.split(' ')[0]}
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* ─── Hero ─────────────────────────────────────────────────────────── */}
        {activeFilter === 'foryou' && (
          <HeroBanner
            liveCount={LIVE_STREAMS.length}
            featuredImage={feedData?.products?.[0]?.image}
            featuredName={feedData?.products?.[0]?.name}
          />
        )}

        {/* ─── Feed filter tabs ──────────────────────────────────────────────── */}
        <div ref={feedTopRef} className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide px-3.5 sm:px-0 mb-3 sm:mb-4">
          {([
            { id: 'foryou',    label: 'For You',   icon: Sparkles },
            { id: 'following', label: 'Following', icon: Users },
            { id: 'trending',  label: 'Trending',  icon: Flame },
          ] as { id: FeedFilter; label: string; icon: typeof Sparkles }[]).map(tab => {
            const active = activeFilter === tab.id;
            const TabIcon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                aria-pressed={active}
                onClick={() => { setActiveFilter(tab.id); setNewPostsAvailable(false); }}
                className={`shrink-0 inline-flex h-9 items-center gap-1.5 px-4 rounded-full text-[13px] font-semibold transition-all duration-150 active:scale-[0.95] tap-highlight-none ${
                  active
                    ? 'bg-brand-gradient text-white shadow-brand'
                    : 'bg-card border border-border/60 text-foreground-secondary hover:text-foreground hover:border-border'
                }`}
              >
                <TabIcon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            );
          })}
          <Link
            to="/live-shopping"
            className="shrink-0 inline-flex h-9 items-center gap-1.5 px-4 rounded-full text-[13px] font-semibold bg-error-subtle border border-error/20 text-error hover:bg-error/15 transition-all duration-150"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-error live-badge shrink-0" />
            Live
          </Link>
        </div>

        {/* ─── New posts notification ────────────────────────────────────────── */}
        {newPostsAvailable && (
          <button
            type="button"
            onClick={() => {
              setNewPostsAvailable(false);
              setRefreshKey(k => k + 1);
              feedTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }}
            className="w-full mb-3 sm:mb-4 py-2.5 rounded-2xl text-[13px] font-semibold text-white flex items-center justify-center gap-2 shadow-md hover:opacity-90 active:scale-[0.98] transition-all duration-150 bg-brand-gradient"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
            New posts available — tap to refresh
          </button>
        )}

        {/* ─── Feed ─────────────────────────────────────────────────────────── */}
        <div className="space-y-3 sm:space-y-4">
          {feedItems.map(item => {
            const delay = Math.min(feedDelay++ * 30, 260);
            switch (item.type) {
              case 'post':             return renderPost(item.data, item.id, delay);
              case 'loop-card':        return renderLoopCard(item.data, item.id, delay);
              case 'products':         return renderProductCard(item.data, item.id, delay);
              case 'flash-sale':       return renderFlashSale(item.data, item.id, delay);
              case 'creator-products': return renderCreatorProducts(item.data, item.id, delay);
              case 'loop-strip':       return renderLoopStrip(item.data, item.id, delay);
              case 'recommended':      return renderRecommended(item.data, item.id, delay);
              case 'live-strip':       return renderLiveStrip(item.data, item.id, delay);
              case 'trending-tags':    return renderTrendingTags(item.data, item.id, delay);
              case 'community':         return renderCommunitySection(item.data, item.id, delay);
              case 'categories':        return renderCategoryStrip(item.id, delay);
              case 'following-header':  return renderFollowingHeader(item.id);
              default: return null;
            }
          })}
        </div>

        {/* Inline skeleton while loading more */}
        {isLoading && <div className="mt-4"><FeedLoading count={2} /></div>}

        {/* ─── Load more ────────────────────────────────────────────────────── */}
        <div className="mt-8 pb-24 sm:pb-10 flex flex-col items-center gap-3">
          <div className="w-full max-w-xs h-px bg-gradient-to-r from-transparent via-border to-transparent mb-1" />
          <button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
            className="group inline-flex items-center gap-2 px-8 py-2.5 rounded-full border border-border/60 bg-card text-[13px] font-semibold text-foreground/75 hover:text-foreground hover:border-border hover:bg-muted/50 hover:shadow-sm transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isLoading ? (
              <><span className="w-3.5 h-3.5 border-2 border-muted-foreground/30 border-t-foreground/70 rounded-full animate-spin" />Loading…</>
            ) : (
              <>Load more posts<span className="text-foreground-secondary group-hover:text-foreground-secondary transition-colors">↓</span></>
            )}
          </button>
        </div>
      </div>

    </div>
  );
}
