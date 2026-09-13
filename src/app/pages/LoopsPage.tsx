import React from 'react';
import { useState, useRef, useEffect, useCallback } from 'react';
import {
  Heart, MessageCircle, BookmarkPlus, Play,
  MoreHorizontal, Send, Eye, EyeOff, Repeat2,
  Bell, ShoppingCart,
  Home, Video, Plus, ShoppingBag, User,
  ChevronUp, ChevronDown, Menu,
  Link2, Flag, VolumeX, UserX, Sparkles,
} from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router';
import { getLoops } from '../data/posts';
import { getProductById } from '../data/products';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { SEO, SEOConfigs } from '../components/SEO';
import { CommentSheet } from '../components/CommentSheet';
import { RepostSheet } from '../components/RepostSheet';
import { EzyifyLogo } from '../components/EzyifyLogo';
import { ReferralService } from '../services/referral';
import { toast } from 'sonner';

// ── Helpers ────────────────────────────────────────────────────────────────────
function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

// ── MoreOptionsSheet ───────────────────────────────────────────────────────────
interface MoreOptionsProps {
  loop: any;
  onClose: () => void;
  onHide: (id: string) => void;
}
function MoreOptionsSheet({ loop, onClose, onHide }: MoreOptionsProps) {
  const handleCopyLink = () => {
    const url = `${window.location.origin}/loops?v=${loop.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    toast.success('Link copied!');
    onClose();
  };
  const handleMute = () => {
    toast.success(`@${loop.user.username} muted`, { description: "You won't see their content for 30 days" });
    onClose();
  };
  const handleBlock = () => {
    toast.success(`@${loop.user.username} blocked`);
    onClose();
  };
  const handleReport = () => {
    toast.success('Report submitted', { description: 'Thanks for helping keep Ezyify safe' });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[80] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
      <div
        className="relative w-full max-w-lg mx-auto bg-card rounded-t-3xl overflow-hidden shadow-2xl"
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
        onClick={e => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-9 h-1 bg-muted-foreground/25 rounded-full" />
        </div>

        {/* Preview */}
        <div className="px-4 py-3 border-b border-border/50 flex items-center gap-3">
          <img loading="lazy" src={loop.user.avatar} alt={loop.user.name}
            className="w-9 h-9 rounded-full object-cover shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-semibold text-foreground truncate">@{loop.user.username}</p>
            {loop.content.text && (
              <p className="text-[12px] text-muted-foreground line-clamp-1">{loop.content.text}</p>
            )}
          </div>
        </div>

        {/* Options */}
        <div className="px-3 pt-2 pb-1 space-y-0.5">
          <button onClick={() => onHide(loop.id)}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-muted/70 active:bg-muted transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center shrink-0">
              <EyeOff className="w-[18px] h-[18px] text-orange-500" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">Not Interested</p>
              <p className="text-[11px] text-muted-foreground/70">See less content like this</p>
            </div>
          </button>

          <button onClick={handleCopyLink}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-muted/70 active:bg-muted transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <Link2 className="w-[18px] h-[18px] text-primary" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">Copy Link</p>
              <p className="text-[11px] text-muted-foreground/70">Share this Loop</p>
            </div>
          </button>

          <button onClick={handleMute}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-muted/70 active:bg-muted transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
              <VolumeX className="w-[18px] h-[18px] text-muted-foreground" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">Mute @{loop.user.username}</p>
              <p className="text-[11px] text-muted-foreground/70">Hide their content for 30 days</p>
            </div>
          </button>

          <button onClick={handleBlock}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-muted/70 active:bg-muted transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <UserX className="w-[18px] h-[18px] text-red-500" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">Block @{loop.user.username}</p>
              <p className="text-[11px] text-muted-foreground/70">Block and stop seeing their content</p>
            </div>
          </button>

          <button onClick={handleReport}
            className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-muted/70 active:bg-muted transition-colors text-left">
            <div className="w-9 h-9 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
              <Flag className="w-[18px] h-[18px] text-red-500" />
            </div>
            <div>
              <p className="text-[14px] font-semibold text-foreground">Report</p>
              <p className="text-[11px] text-muted-foreground/70">Flag this Loop for review</p>
            </div>
          </button>
        </div>

        <div className="px-3 pb-1">
          <button onClick={onClose}
            className="w-full px-4 py-3 rounded-2xl bg-muted/60 text-[14px] font-semibold text-foreground hover:bg-muted transition-colors">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// ── LoopsPage ──────────────────────────────────────────────────────────────────
export default function LoopsPage() {
  const [currentIndex,  setCurrentIndex]  = useState(0);
  const [likedLoops,    setLikedLoops]    = useState<Set<string>>(new Set());
  const [savedLoops,    setSavedLoops]    = useState<Set<string>>(new Set());
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set());
  const [repostedLoops, setRepostedLoops] = useState<Set<string>>(new Set());
  const [hiddenLoops,   setHiddenLoops]   = useState<Set<string>>(new Set());
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [repostSheetLoop,  setRepostSheetLoop]  = useState<any | null>(null);
  const [selectedLoop,     setSelectedLoop]     = useState<any>(null);
  const [moreOptionsLoop,  setMoreOptionsLoop]  = useState<any | null>(null);
  const [loops,    setLoops]    = useState<any[] | null>(null);
  const [cartCount, setCartCount] = useState(0);
  const [showSwipeHint, setShowSwipeHint] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const navigate  = useNavigate();
  const location  = useLocation();

  // Cart sync
  useEffect(() => {
    const sync = () => {
      try {
        const raw  = localStorage.getItem('ezyify_cart');
        const cart = raw ? JSON.parse(raw) : [];
        setCartCount(cart.reduce((s: number, i: any) => s + (i.quantity || 0), 0));
      } catch {}
    };
    sync();
    window.addEventListener('storage',     sync);
    window.addEventListener('cartUpdated', sync);
    return () => {
      window.removeEventListener('storage',     sync);
      window.removeEventListener('cartUpdated', sync);
    };
  }, []);

  // Auto-hide swipe hint after 3s
  useEffect(() => {
    if (!showSwipeHint) return;
    const t = setTimeout(() => setShowSwipeHint(false), 3000);
    return () => clearTimeout(t);
  }, [showSwipeHint]);

  // Deep-link URL param: /loops?v=post-002
  useEffect(() => {
    if (!loops) return;
    const params = new URLSearchParams(location.search);
    const vid = params.get('v');
    if (vid) {
      const idx = loops.findIndex(l => l.id === vid);
      if (idx !== -1) {
        setCurrentIndex(idx);
        setTimeout(() => {
          containerRef.current?.scrollTo({ top: idx * window.innerHeight, behavior: 'instant' as ScrollBehavior });
        }, 50);
      }
    }
   
  }, [loops]);

  // Scroll navigation
  const scrollTo = (idx: number) =>
    containerRef.current?.scrollTo({ top: idx * window.innerHeight, behavior: 'smooth' });

  const nextLoop = useCallback(() => {
    if (loops && currentIndex < loops.length - 1) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      scrollTo(next);
    }
   
  }, [currentIndex, loops]);

  const prevLoop = useCallback(() => {
    if (loops && currentIndex > 0) {
      const prev = currentIndex - 1;
      setCurrentIndex(prev);
      scrollTo(prev);
    }
   
  }, [currentIndex, loops]);

  const handleScroll = () => {
    if (!containerRef.current || !loops) return;
    const idx = Math.round(containerRef.current.scrollTop / window.innerHeight);
    if (idx !== currentIndex && idx >= 0 && idx < loops.length) {
      setCurrentIndex(idx);
      if (showSwipeHint) setShowSwipeHint(false);
    }
  };

  // Interactions
  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    const wasLiked = likedLoops.has(id);
    setLikedLoops(p => { const s = new Set(p); wasLiked ? s.delete(id) : s.add(id); return s; });
    if (!wasLiked) toast.success('Liked!', { duration: 1200 });
  };

  const toggleSave = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); e.stopPropagation();
    const wasSaved = savedLoops.has(id);
    setSavedLoops(p => { const s = new Set(p); wasSaved ? s.delete(id) : s.add(id); return s; });
    toast.success(wasSaved ? 'Removed from saved' : 'Saved to collection!', { duration: 1500 });
  };

  const toggleFollow = (e: React.MouseEvent, un: string) => {
    e.preventDefault(); e.stopPropagation();
    const wasFollowing = followedUsers.has(un);
    setFollowedUsers(p => { const s = new Set(p); wasFollowing ? s.delete(un) : s.add(un); return s; });
    toast.success(wasFollowing ? `Unfollowed @${un}` : `Following @${un}!`, { duration: 1500 });
  };

  const openComments = (e: React.MouseEvent, loop: any) => {
    e.preventDefault(); e.stopPropagation();
    setSelectedLoop(loop);
    setCommentSheetOpen(true);
  };

  // Share with referral tracking
  const handleShare = (e: React.MouseEvent, loop: any) => {
    e.stopPropagation();
    let shareUrl = `${window.location.origin}/loops?v=${loop.id}`;
    const firstProduct = loop.taggedProducts?.[0] ? getProductById(loop.taggedProducts[0]) : null;
    if (firstProduct) {
      try {
        const referral = ReferralService.createReferral({
          productId: firstProduct.id,
          sellerId: firstProduct.seller.id,
          source: 'share',
        });
        shareUrl = `${window.location.origin}/loops?v=${loop.id}&ref=${referral.referralId}`;
      } catch {}
    }
    if (navigator.share) {
      navigator.share({
        title: loop.content?.text ?? 'Check this Loop on Ezyify',
        text: loop.content?.text ?? '',
        url: shareUrl,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
      toast.success('Link copied!');
    }
  };

  // Buy Now — existing Ezyify cart + checkout flow
  const handleBuyNow = (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); e.stopPropagation();
    try {
      const raw  = localStorage.getItem('ezyify_cart');
      const cart = raw ? JSON.parse(raw) : [];
      const hit  = cart.find((i: any) => i.id === productId);
      if (hit) {
        hit.quantity = (hit.quantity || 1) + 1;
      } else {
        const p = getProductById(productId);
        if (p) cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, quantity: 1 });
      }
      localStorage.setItem('ezyify_cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cartUpdated'));
      setCartCount(cart.reduce((s: number, i: any) => s + (i.quantity || 0), 0));
    } catch {}
    navigate('/cart');
  };

  // Not Interested — hides loop with undo
  const hideLoop = (id: string) => {
    setHiddenLoops(p => new Set([...p, id]));
    setMoreOptionsLoop(null);
    toast.success('Marked as not interested', {
      duration: 4500,
      action: {
        label: 'Undo',
        onClick: () => setHiddenLoops(p => { const s = new Set(p); s.delete(id); return s; }),
      },
    });
  };

  // Data load
  useEffect(() => {
    const load = () => setLoops(getLoops());
    if ('requestIdleCallback' in window) { const h = requestIdleCallback(load, { timeout: 100 }); return () => cancelIdleCallback(h); }
    const t = setTimeout(load, 16); return () => clearTimeout(t);
  }, []);

  // Keyboard nav
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') prevLoop();
      else if (e.key === 'ArrowDown') nextLoop();
    };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, [prevLoop, nextLoop]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (!loops) {
    return (
      <div className="fixed inset-0 z-[60] bg-[#0a0a0a] flex overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.03] to-transparent" />
        <div className="flex-1 relative">
          <div className="absolute inset-0 animate-pulse" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.02) 100%)' }} />
          <div className="absolute top-0 left-0 right-0 px-3 flex items-center justify-between h-12" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-white/10 animate-pulse" />
              <div className="w-20 h-5 rounded-full bg-white/10 animate-pulse" />
            </div>
            <div className="flex items-center gap-1">
              {[...Array(3)].map((_, i) => <div key={i} className="w-8 h-8 rounded-xl bg-white/10 animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />)}
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 px-4 space-y-2.5" style={{ paddingBottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-white/15 animate-pulse" />
              <div className="w-28 h-3.5 rounded-full bg-white/15 animate-pulse" />
            </div>
            <div className="w-3/4 h-3 rounded-full bg-white/10 animate-pulse" />
            <div className="w-1/2 h-3 rounded-full bg-white/[0.07] animate-pulse" />
            <div className="h-14 rounded-2xl bg-white/[0.07] animate-pulse mt-1" />
          </div>
        </div>
        <div className="absolute right-3 flex flex-col items-center gap-4" style={{ bottom: 'calc(6rem + env(safe-area-inset-bottom, 0px))' }}>
          <div className="w-12 h-12 rounded-full bg-white/15 animate-pulse" />
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex flex-col items-center gap-1" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="w-11 h-11 rounded-full bg-white/10 animate-pulse" />
              <div className="w-6 h-2 rounded-full bg-white/[0.07] animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!loops.length) {
    return (
      <div className="fixed inset-0 z-[60] bg-black flex flex-col items-center justify-center gap-4 text-white">
        <div className="w-20 h-20 rounded-full bg-white/10 flex items-center justify-center">
          <Play className="w-10 h-10 text-white/60 fill-white/60 ml-1" />
        </div>
        <p className="font-semibold text-lg">No Loops yet</p>
        <Link to="/" className="px-5 py-2 rounded-full border border-white/30 text-sm hover:bg-white/10 transition-colors">Go Home</Link>
      </div>
    );
  }

  const currentLoop = loops[currentIndex] ?? loops[0];

  return (
    <div className="fixed inset-0 z-[60] bg-black overflow-hidden">
      <SEO {...SEOConfigs.loops} />

      {/* ── TOP BAR ────────────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 z-30 pointer-events-none"
        style={{
          background: 'linear-gradient(to bottom, rgba(0,0,0,0.65) 0%, rgba(0,0,0,0.25) 60%, transparent 100%)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="flex items-center justify-between h-12 lg:h-14 px-2.5 sm:px-4 pointer-events-auto">

          {/* Center — position indicator */}
          {loops.length > 1 && (
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none select-none">
              <span className="text-white/30 text-[10px] font-medium tabular-nums tracking-wide">
                {currentIndex + 1}&thinsp;/&thinsp;{loops.length}
              </span>
            </div>
          )}

          {/* Left — Back + Brand */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => navigate(-1)}
              aria-label="Back"
              className="w-9 h-9 flex items-center justify-center rounded-xl text-white hover:bg-white/12 active:bg-white/20 transition-colors"
            >
              <Menu className="w-[18px] h-[18px]" />
            </button>
            <Link
              to="/"
              className="flex items-center gap-1.5 group ml-0.5"
              onClick={(e) => e.stopPropagation()}
            >
              <EzyifyLogo size={24} className="group-hover:scale-105 transition-transform duration-200 drop-shadow-md" />
              <span className="text-white font-semibold text-[15px] tracking-tight drop-shadow-md">
                Ezyify
              </span>
            </Link>
          </div>

          {/* Right — Messages · Notifications · Cart */}
          <div className="flex items-center gap-0.5 shrink-0">
            <Link
              to="/messages"
              aria-label="Messages"
              onClick={(e) => e.stopPropagation()}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-white hover:bg-white/12 active:bg-white/20 transition-colors"
            >
              <MessageCircle className="w-[18px] h-[18px]" />
              <span className="absolute top-[9px] right-[9px] w-[6px] h-[6px] bg-primary rounded-full border border-black/50" />
            </Link>
            <Link
              to="/notifications"
              aria-label="Notifications"
              onClick={(e) => e.stopPropagation()}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-white hover:bg-white/12 active:bg-white/20 transition-colors"
            >
              <Bell className="w-[18px] h-[18px]" />
              <span className="absolute top-[9px] right-[9px] w-[6px] h-[6px] bg-error rounded-full border border-black/50" />
            </Link>
            <Link
              to="/cart"
              aria-label="Cart"
              onClick={(e) => e.stopPropagation()}
              className="relative w-9 h-9 flex items-center justify-center rounded-xl text-white hover:bg-white/12 active:bg-white/20 transition-colors"
            >
              <ShoppingCart className="w-[18px] h-[18px]" />
              {cartCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-[16px] bg-primary text-white text-[8px] rounded-full flex items-center justify-center px-0.5 font-bold border border-black/30 tabular-nums">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>

      {/* ── SCROLLABLE LOOP ITEMS ────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="h-full overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
        onScroll={handleScroll}
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        {loops.map((loop, index) => {
          const isHidden    = hiddenLoops.has(loop.id);
          const isLiked     = likedLoops.has(loop.id)            || loop.isLiked;
          const isSaved     = savedLoops.has(loop.id)            || loop.isSaved;
          const isFollowing = followedUsers.has(loop.user.username);
          const isReposted  = repostedLoops.has(loop.id);
          const firstProduct = loop.taggedProducts?.length
            ? getProductById(loop.taggedProducts[0])
            : null;
          const isLastLoop = index === loops.length - 1;

          // Optimistic like count
          const likeCount = loop.likes + (likedLoops.has(loop.id) && !loop.isLiked ? 1 : 0);

          return (
            <div
              key={loop.id}
              className="relative w-full snap-start snap-always overflow-hidden"
              style={{ height: '100dvh' }}
            >
              {/* ── HIDDEN STATE ── */}
              {isHidden ? (
                <div className="absolute inset-0 bg-[#0a0a0a] flex flex-col items-center justify-center gap-4 z-10">
                  <div className="w-16 h-16 rounded-full bg-white/[0.06] flex items-center justify-center">
                    <EyeOff className="w-8 h-8 text-white/30" />
                  </div>
                  <p className="text-white/50 font-semibold text-[15px]">Not interested</p>
                  <button
                    onClick={() => setHiddenLoops(p => { const s = new Set(p); s.delete(loop.id); return s; })}
                    className="px-4 py-2 rounded-full border border-white/20 text-white/60 text-sm hover:bg-white/10 active:scale-95 transition-all"
                  >
                    Undo
                  </button>
                </div>
              ) : (
                <>
                  {/* ── BACKGROUND ── */}
                  <div className="absolute inset-0 bg-[#0a0a0a]">
                    {loop.content.images?.[0] && (
                      <img
                        loading={index === 0 ? 'eager' : 'lazy'}
                        src={loop.content.images[0]}
                        alt=""
                        role="presentation"
                        className="w-full h-full object-cover object-center"
                        draggable={false}
                      />
                    )}
                    {/* Bottom-weighted scrim */}
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(to bottom,' +
                          'transparent 0%,' +
                          'transparent 30%,' +
                          'rgba(0,0,0,0.12) 48%,' +
                          'rgba(0,0,0,0.52) 70%,' +
                          'rgba(0,0,0,0.88) 100%)',
                      }}
                    />
                    {/* Paused indicator for non-active slides */}
                    {index !== currentIndex && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                        <div className="w-[72px] h-[72px] bg-black/40 backdrop-blur-xl rounded-full flex items-center justify-center ring-1 ring-white/20">
                          <Play className="w-9 h-9 text-white fill-white ml-1" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ── RIGHT ACTION STACK ──────────────────────────────────── */}
                  <div
                    className="absolute right-2.5 sm:right-4 lg:right-6 z-20 flex flex-col items-center gap-3 sm:gap-3.5"
                    style={{ bottom: 'calc(5.5rem + env(safe-area-inset-bottom, 0px))' }}
                  >
                    {/* Like */}
                    <ActionBtn
                      onClick={(e) => toggleLike(e, loop.id)}
                      label={isLiked ? 'Unlike' : 'Like'}
                      count={fmt(likeCount)}
                      active={isLiked}
                      activeClass="bg-rose-500/25 border-rose-400/30 shadow-[0_0_14px_rgba(244,63,94,0.45)]"
                    >
                      <Heart className={`w-[22px] h-[22px] sm:w-6 sm:h-6 transition-all duration-200 ${
                        isLiked ? 'fill-rose-400 text-rose-400 scale-110' : 'text-white'
                      }`} />
                    </ActionBtn>

                    {/* Comment */}
                    <ActionBtn
                      onClick={(e) => openComments(e, loop)}
                      label="Comments"
                      count={fmt(loop.comments)}
                    >
                      <MessageCircle className="w-[22px] h-[22px] sm:w-6 sm:h-6 text-white" />
                    </ActionBtn>

                    {/* Repost — with referral tracking */}
                    <ActionBtn
                      onClick={(e) => { e.stopPropagation(); setRepostSheetLoop(loop); }}
                      label={isReposted ? 'Undo repost' : 'Repost'}
                      count={fmt(Math.round(loop.shares * 0.4) + (isReposted ? 1 : 0))}
                      active={isReposted}
                      activeClass="bg-emerald-500/20 border-emerald-400/30 shadow-[0_0_12px_rgba(52,211,153,0.4)]"
                    >
                      <Repeat2 className={`w-[22px] h-[22px] sm:w-6 sm:h-6 transition-colors duration-200 ${
                        isReposted ? 'text-emerald-400' : 'text-white'
                      }`} />
                    </ActionBtn>

                    {/* Share */}
                    <ActionBtn
                      onClick={(e) => handleShare(e, loop)}
                      label="Share"
                      count={fmt(loop.shares)}
                    >
                      <Send className="w-[22px] h-[22px] sm:w-6 sm:h-6 text-white" />
                    </ActionBtn>

                    {/* Save */}
                    <ActionBtn
                      onClick={(e) => toggleSave(e, loop.id)}
                      label={isSaved ? 'Unsave' : 'Save'}
                      active={isSaved}
                      activeClass="bg-primary/20 border-primary/30 shadow-[0_0_12px_rgba(var(--color-primary-rgb,99,102,241),0.4)]"
                    >
                      <BookmarkPlus className={`w-[22px] h-[22px] sm:w-6 sm:h-6 transition-all duration-200 ${
                        isSaved ? 'fill-primary text-primary scale-110' : 'text-white'
                      }`} />
                    </ActionBtn>

                    {/* ⋮ More */}
                    <ActionBtn
                      onClick={(e) => { e.stopPropagation(); setMoreOptionsLoop(loop); }}
                      label="More options"
                    >
                      <MoreHorizontal className="w-[22px] h-[22px] sm:w-6 sm:h-6 text-white" />
                    </ActionBtn>
                  </div>

                  {/* ── BOTTOM CONTENT ─────────────────────────────────────── */}
                  <div
                    className="absolute bottom-0 left-0 right-0 z-10 px-3.5 sm:px-5 lg:px-6"
                    style={{ paddingBottom: 'calc(5.75rem + env(safe-area-inset-bottom, 0px))' }}
                  >
                    <div className="max-w-[73%] sm:max-w-[68%] lg:max-w-[60%]">

                      {/* Creator row */}
                      <div className="flex items-center gap-2 mb-2">
                        <Link
                          to={`/profile/${loop.user.username}`}
                          onClick={(e) => e.stopPropagation()}
                          className="shrink-0"
                        >
                          <img
                            loading="lazy"
                            src={loop.user.avatar}
                            alt={loop.user.name}
                            className="w-7 h-7 rounded-full object-cover ring-[1.5px] ring-white/40"
                          />
                        </Link>
                        <Link
                          to={`/profile/${loop.user.username}`}
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 min-w-0 flex-1 group"
                        >
                          <span className="text-white font-bold text-[13px] sm:text-sm truncate group-hover:underline underline-offset-2 drop-shadow-md">
                            @{loop.user.username}
                          </span>
                          {loop.user.verified && (
                            <span className="shrink-0"><VerifiedBadge /></span>
                          )}
                        </Link>
                        {!isFollowing && (
                          <button
                            onClick={(e) => toggleFollow(e, loop.user.username)}
                            className="shrink-0 px-3 py-[5px] rounded-full border border-white/50 text-white text-[11px] font-semibold hover:bg-white/15 active:scale-95 transition-all whitespace-nowrap"
                          >
                            Follow
                          </button>
                        )}
                      </div>

                      {/* Caption */}
                      {loop.content.text && (
                        <p className="text-white/92 text-[13px] sm:text-sm leading-snug line-clamp-2 mb-1.5 drop-shadow-md">
                          {loop.content.text}
                        </p>
                      )}

                      {/* Views */}
                      {loop.views && (
                        <div className="flex items-center gap-1 mb-2.5">
                          <Eye className="w-3 h-3 text-white/45 shrink-0" />
                          <span className="text-white/45 text-[11px] font-medium">
                            {fmt(loop.views)} views
                          </span>
                        </div>
                      )}

                      {/* Product CTA */}
                      {firstProduct && (
                        <div className="flex items-center gap-2.5 rounded-2xl p-2.5 border border-white/[0.13] bg-black/55 backdrop-blur-xl hover:border-white/22 transition-colors">
                          <Link
                            to={`/product/${firstProduct.id}`}
                            onClick={(e) => e.stopPropagation()}
                            className="flex items-center gap-2.5 flex-1 min-w-0 group"
                          >
                            <img
                              loading="lazy"
                              src={firstProduct.image}
                              alt={firstProduct.name}
                              className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-white/50 text-[9px] font-semibold uppercase tracking-[0.08em] mb-[1px]">Featured</p>
                              <p className="text-white text-[12px] font-semibold leading-tight truncate group-hover:text-white/85 transition-colors">
                                {firstProduct.name}
                              </p>
                              <div className="flex items-baseline gap-1.5 mt-[1px]">
                                <span className="text-white font-bold text-[13px]">${firstProduct.price.toFixed(2)}</span>
                                {firstProduct.originalPrice && (
                                  <span className="text-white/35 text-[10px] line-through">${firstProduct.originalPrice.toFixed(2)}</span>
                                )}
                              </div>
                            </div>
                          </Link>
                          <button
                            onClick={(e) => handleBuyNow(e, firstProduct.id)}
                            className="shrink-0 px-3 py-[7px] rounded-[10px] text-white text-[11px] font-bold whitespace-nowrap active:scale-95 hover:opacity-90 transition-all shadow-brand"
                            style={{ background: 'var(--brand-gradient)' }}
                          >
                            Buy Now
                          </button>
                        </div>
                      )}

                      {/* All caught up — shown on last loop */}
                      {isLastLoop && (
                        <div className="flex items-center gap-2 mt-3 py-1.5 px-3 rounded-full bg-white/[0.07] backdrop-blur-sm w-fit">
                          <Sparkles className="w-3 h-3 text-white/45 shrink-0" />
                          <span className="text-white/45 text-[11px] font-medium">All caught up •</span>
                          <Link
                            to="/explore"
                            onClick={(e) => e.stopPropagation()}
                            className="text-[11px] text-primary font-semibold"
                          >
                            Explore more
                          </Link>
                        </div>
                      )}

                    </div>
                  </div>

                  {/* Desktop left navigation dots */}
                  {loops.length > 1 && (
                    <div className="hidden lg:flex absolute left-5 xl:left-8 top-1/2 -translate-y-1/2 flex-col gap-2 z-20">
                      {loops.map((_, idx) => (
                        <button
                          key={idx}
                          aria-label={`Loop ${idx + 1}`}
                          onClick={() => { setCurrentIndex(idx); scrollTo(idx); }}
                          className={`rounded-full transition-all duration-200 ${
                            idx === currentIndex
                              ? 'w-[5px] h-7 bg-white shadow-[0_0_8px_rgba(255,255,255,0.5)]'
                              : 'w-[5px] h-[5px] bg-white/35 hover:bg-white/60'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {/* ── DESKTOP PREV / NEXT ARROWS ──────────────────────────────────── */}
      <div
        className="hidden lg:flex absolute left-1/2 -translate-x-1/2 z-30 gap-3"
        style={{ bottom: 'calc(1.75rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <button
          onClick={prevLoop}
          disabled={currentIndex === 0}
          aria-label="Previous loop"
          className={`w-11 h-11 bg-black/35 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10 transition-all ${
            currentIndex === 0 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/55 hover:border-white/20 active:scale-95'
          }`}
        >
          <ChevronUp className="w-5 h-5" />
        </button>
        <button
          onClick={nextLoop}
          disabled={currentIndex === loops.length - 1}
          aria-label="Next loop"
          className={`w-11 h-11 bg-black/35 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10 transition-all ${
            currentIndex === loops.length - 1 ? 'opacity-30 cursor-not-allowed' : 'hover:bg-black/55 hover:border-white/20 active:scale-95'
          }`}
        >
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Mobile swipe hint — only on first loop, auto-hides */}
      {showSwipeHint && currentIndex === 0 && (
        <div
          className="sm:hidden absolute left-1/2 -translate-x-1/2 z-[25] pointer-events-none transition-opacity duration-500"
          style={{ bottom: 'calc(6.75rem + env(safe-area-inset-bottom, 0px))', opacity: showSwipeHint ? 1 : 0 }}
        >
          <div
            className="flex items-center gap-1.5 px-4 py-2 rounded-full text-white/75 text-[11px] font-medium"
            style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(12px)' }}
          >
            <ChevronUp className="w-3 h-3 animate-bounce" />
            Swipe up for more
          </div>
        </div>
      )}

      {/* ── MOBILE BOTTOM NAV ───────────────────────────────────────────── */}
      <div className="absolute bottom-0 left-0 right-0 z-30 lg:hidden pb-safe bg-background/97 backdrop-blur-2xl border-t border-border/60">
        <div className="flex items-center justify-around px-2 pt-2 pb-1.5">
          {([
            { name: 'Home',    path: '/',           icon: Home,      isPrimary: false },
            { name: 'Loops',   path: '/loops',      icon: Video,     isPrimary: false },
            { name: 'Create',  path: '/upload',     icon: Plus,      isPrimary: true  },
            { name: 'Shop',    path: '/shop',       icon: ShoppingBag, isPrimary: false },
            { name: 'Profile', path: '/profile/me', icon: User,      isPrimary: false },
          ] as const).map((link) => {
            const Icon    = link.icon;
            const active  = location.pathname === link.path;
            const isPrimary = link.isPrimary;
            return (
              <Link
                key={link.path}
                to={link.path}
                onClick={(e) => e.stopPropagation()}
                className="relative flex flex-col items-center gap-[3px] group min-w-[54px]"
              >
                {active && !isPrimary && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-[2.5px] rounded-full bg-primary" />
                )}
                <div
                  className={`relative p-2 rounded-[14px] transition-all duration-200 ${
                    isPrimary
                      ? '-mt-5 p-3.5 shadow-brand hover:shadow-brand-lg active:scale-[0.94]'
                      : active
                      ? 'bg-primary/10'
                      : 'group-hover:bg-muted/60 active:bg-muted'
                  }`}
                  style={isPrimary ? { background: 'var(--brand-gradient)' } : {}}
                >
                  <Icon className={`w-[20px] h-[20px] transition-colors duration-150 ${
                    isPrimary
                      ? 'text-white'
                      : active
                      ? 'text-primary'
                      : 'text-muted-foreground/80 group-hover:text-foreground'
                  }`} />
                </div>
                <span className={`text-[10px] font-medium tracking-tight transition-colors duration-150 ${
                  isPrimary ? 'text-primary' : active ? 'text-primary' : 'text-muted-foreground/70'
                }`}>
                  {link.name}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* ── SHEETS ──────────────────────────────────────────────────────── */}
      <CommentSheet
        key={selectedLoop?.id}
        open={commentSheetOpen}
        onOpenChange={setCommentSheetOpen}
        post={
          selectedLoop || { id: '', user: { name: '', avatar: '', verified: false }, content: {}, comments: 0 }
        }
      />

      {repostSheetLoop && (
        <RepostSheet
          open={!!repostSheetLoop}
          onOpenChange={(open) => { if (!open) setRepostSheetLoop(null); }}
          post={repostSheetLoop}
          isReposted={repostedLoops.has(repostSheetLoop.id)}
          onRepost={(quoteText) => {
            const id = repostSheetLoop.id;
            const wasReposted = repostedLoops.has(id);
            setRepostedLoops(p => { const s = new Set(p); wasReposted ? s.delete(id) : s.add(id); return s; });
            // Track referral for repost
            if (!wasReposted) {
              const firstProduct = repostSheetLoop.taggedProducts?.[0]
                ? getProductById(repostSheetLoop.taggedProducts[0])
                : null;
              if (firstProduct) {
                try {
                  ReferralService.createReferral({
                    productId: firstProduct.id,
                    sellerId: firstProduct.id,
                    source: 'repost',
                  });
                } catch {}
              }
            }
            toast.success(wasReposted ? 'Repost removed' : quoteText ? 'Quote reposted!' : 'Reposted!');
            setRepostSheetLoop(null);
          }}
          onUndoRepost={() => {
            setRepostedLoops(p => { const s = new Set(p); s.delete(repostSheetLoop.id); return s; });
            toast.success('Repost removed');
            setRepostSheetLoop(null);
          }}
        />
      )}

      {/* More Options Sheet */}
      {moreOptionsLoop && (
        <MoreOptionsSheet
          loop={moreOptionsLoop}
          onClose={() => setMoreOptionsLoop(null)}
          onHide={hideLoop}
        />
      )}

      <style>{`.scrollbar-hide::-webkit-scrollbar{display:none}`}</style>
    </div>
  );
}

// ── ActionBtn ──────────────────────────────────────────────────────────────────
function ActionBtn({
  children,
  onClick,
  label,
  count,
  active = false,
  activeClass = '',
}: {
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  label: string;
  count?: string;
  active?: boolean;
  activeClass?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-[3px]">
      <button
        onClick={onClick}
        aria-label={label}
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full flex items-center justify-center backdrop-blur-md border transition-all duration-150 active:scale-[0.88] hover:scale-[1.06] ${
          active && activeClass
            ? activeClass
            : 'bg-black/30 border-white/[0.09] hover:bg-black/45 hover:border-white/15'
        }`}
      >
        {children}
      </button>
      {count !== undefined && (
        <span className="text-white text-[11px] font-semibold leading-none drop-shadow-md tabular-nums">
          {count}
        </span>
      )}
    </div>
  );
}
