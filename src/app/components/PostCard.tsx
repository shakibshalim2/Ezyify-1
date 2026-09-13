import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import {
  Heart, MessageCircle, Share2, BookmarkPlus, MoreVertical,
  UserPlus, UserCheck, ShoppingBag, ShoppingCart, Check,
  Repeat2, Play, Zap, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { getProductById } from '../data/products';
import { VerifiedBadge } from './VerifiedBadge';
import { CommentSheet } from './CommentSheet';
import { RepostSheet } from './RepostSheet';
import { toast } from 'sonner';

const LIVE_USERNAMES = new Set(['stylehub_official', 'fashionista_maya', 'tech_reviews_pro']);

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000)    return `${Math.round(n / 1_000)}K`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
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

interface PostCardProps {
  post: any;
  animationDelay?: number;
}

export const PostCard = React.memo(function PostCard({ post, animationDelay = 0 }: PostCardProps) {
  const [isLiked,         setIsLiked]         = useState(!!post.isLiked);
  const [isSaved,         setIsSaved]         = useState(!!post.isSaved);
  const [isFollowing,     setIsFollowing]     = useState(false);
  const [isReposted,      setIsReposted]      = useState(false);
  const [likeCount,       setLikeCount]       = useState<number>(post.likes ?? 0);
  const [repostCount,     setRepostCount]     = useState<number>(Math.round((post.shares ?? 0) * 0.4));
  const [carouselIdx,     setCarouselIdx]     = useState(0);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [justLiked,       setJustLiked]       = useState(false);
  const [cartItems,       setCartItems]       = useState<Set<string>>(new Set());
  const [commentSheetOpen,  setCommentSheetOpen]  = useState(false);
  const [repostSheetOpen,   setRepostSheetOpen]   = useState(false);

  const lastTapRef     = useRef(0);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const isLoop      = post.type === 'loop';
  const hasShop     = (post.taggedProducts?.length ?? 0) > 0;
  const isLive      = LIVE_USERNAMES.has(post.user?.username ?? '');
  const images      = (post.content?.images ?? []) as string[];
  const hasMultiple = images.length > 1;

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsLiked(prev => {
      const next = !prev;
      setLikeCount(c => next ? c + 1 : Math.max(0, c - 1));
      if (next) {
        setJustLiked(true);
        setTimeout(() => setJustLiked(false), 800);
      }
      return next;
    });
  }, []);

  const handleDoubleTap = useCallback((e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350) {
      setIsLiked(prev => {
        if (!prev) {
          setLikeCount(c => c + 1);
          setJustLiked(true);
          setTimeout(() => setJustLiked(false), 800);
          return true;
        }
        return prev;
      });
    }
    lastTapRef.current = now;
  }, []);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsSaved(prev => !prev);
  }, []);

  const handleFollow = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setIsFollowing(prev => !prev);
  }, []);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: 'Check this on Ezyify', url: `${window.location.origin}/post/${post.id}` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`).catch(() => {});
      toast.success('Link copied!');
    }
  }, [post.id]);

  const handleAddToCart = useCallback((e: React.MouseEvent, productId: string, productName?: string) => {
    e.preventDefault(); e.stopPropagation();
    setCartItems(prev => {
      const s = new Set(prev);
      const was = s.has(productId);
      was ? s.delete(productId) : s.add(productId);
      toast.success(was ? 'Removed from cart' : `${productName ?? 'Item'} added to cart!`);
      return s;
    });
  }, []);

  const goPrev = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCarouselIdx(prev => Math.max(prev - 1, 0));
  }, []);

  const goNext = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    setCarouselIdx(prev => Math.min(prev + 1, images.length - 1));
  }, [images.length]);

  return (
    <article
      className="bg-card border border-border/60 rounded-xl sm:rounded-2xl overflow-hidden animate-feed-in"
      style={{ animationDelay: `${animationDelay}ms` }}
    >
      {/* Reposted-by-you bar */}
      {isReposted && (
        <div className="flex items-center gap-1.5 px-3.5 pt-2.5 pb-0">
          <Repeat2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
          <span className="text-[11px] font-semibold text-emerald-600">You reposted</span>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between gap-2.5 px-3.5 pt-3 pb-2.5">
        <Link to={`/profile/${post.user.username}`} className="flex items-center gap-2.5 min-w-0 flex-1 group">
          <div className="relative shrink-0">
            {isLive ? (
              <div className="p-[2.5px] rounded-full" style={{ background: 'linear-gradient(135deg,#ef4444,#f97316)' }}>
                <div className="bg-card p-[2px] rounded-full">
                  <img loading="lazy" src={post.user.avatar} alt={post.user.name} className="w-9 h-9 rounded-full object-cover" />
                </div>
              </div>
            ) : (
              <img loading="lazy" src={post.user.avatar} alt={post.user.name} className="w-9 h-9 rounded-full object-cover ring-[1.5px] ring-border/60 group-hover:ring-2 group-hover:ring-primary/30 transition-all" />
            )}
            {isLive && (
              <span className="absolute -bottom-0.5 -right-0.5 px-1 py-px rounded-full text-[8px] font-black text-white leading-none bg-red-500 border border-card">
                LIVE
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 mb-px">
              <span className="font-semibold text-[13px] text-foreground truncate leading-tight">{post.user.name}</span>
              {post.user.verified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-[11px] text-muted-foreground/70 leading-none">{post.timestamp}</p>
          </div>
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={handleFollow}
            aria-label={isFollowing ? 'Unfollow' : 'Follow'}
            className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold transition-all duration-150 active:scale-[0.92] ${
              isFollowing
                ? 'bg-muted text-foreground/70 border border-border/70'
                : 'text-white shadow-sm hover:opacity-90'
            }`}
            style={isFollowing ? {} : { background: 'var(--brand-gradient)' }}
          >
            {isFollowing
              ? <><UserCheck className="w-3 h-3" /><span className="ml-0.5">Following</span></>
              : <><UserPlus className="w-3 h-3" /><span className="ml-0.5">Follow</span></>}
          </button>
          <button type="button" aria-label="More" className="p-1.5 rounded-xl text-muted-foreground/60 hover:text-foreground hover:bg-muted/80 transition-all">
            <MoreVertical className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Media — swipeable carousel, no navigation on tap */}
      <div
        className="block relative overflow-hidden group bg-muted/40"
        onClick={handleDoubleTap}
      >
        <div
          className="aspect-[4/5] sm:aspect-[4/3] relative overflow-hidden"
          onTouchStart={hasMultiple ? e => {
            const t = e.touches[0];
            touchStartXRef.current = t.clientX;
            touchStartYRef.current = t.clientY;
          } : undefined}
          onTouchEnd={hasMultiple ? e => {
            const t = e.changedTouches[0];
            const dx = t.clientX - touchStartXRef.current;
            const dy = t.clientY - touchStartYRef.current;
            if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 28) {
              e.stopPropagation();
              setCarouselIdx(prev =>
                dx < 0 ? Math.min(prev + 1, images.length - 1) : Math.max(prev - 1, 0)
              );
            }
          } : undefined}
        >
          {/* Sliding image track */}
          {images.length > 0 && (
            <div
              className="absolute inset-0 flex transition-transform duration-300 ease-out will-change-transform"
              style={{ transform: `translateX(-${carouselIdx * 100}%)` }}
            >
              {images.map((src: string, i: number) => (
                <div key={i} className="min-w-full h-full flex-shrink-0">
                  <img
                    loading={i === 0 ? 'eager' : 'lazy'}
                    src={src}
                    alt={i === 0 ? (post.content?.text || '') : ''}
                    className={`w-full h-full object-cover ${!hasMultiple ? 'transition-transform duration-500 ease-out group-hover:scale-[1.025]' : ''}`}
                  />
                </div>
              ))}
            </div>
          )}

          {/* Loop badge + play hover overlay */}
          {isLoop && (
            <>
              <div
                className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
                style={{ background: 'var(--brand-gradient)' }}
              >
                <Zap className="w-3 h-3 fill-current" /> Loop
              </div>
              <div className="absolute inset-0 flex items-center justify-center bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <div className="w-14 h-14 rounded-full flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(10px)' }}>
                  <Play className="w-6 h-6 text-white fill-white ml-0.5" />
                </div>
              </div>
            </>
          )}

          {/* Views badge */}
          {post.views && (
            <div className="absolute bottom-3 left-3 z-10 text-white text-[11px] font-medium px-2 py-1 rounded-full tabular-nums" style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(6px)' }}>
              {fmtCount(post.views)} views
            </div>
          )}

          {/* Shop chip — lifts above dots when carousel has multiple slides */}
          {hasShop && !isLoop && (
            <div
              className={`absolute right-3 z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-white transition-all ${hasMultiple ? 'bottom-9' : 'bottom-3'}`}
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>{post.taggedProducts.length} {post.taggedProducts.length === 1 ? 'item' : 'items'}</span>
            </div>
          )}

          {/* Carousel dot indicators */}
          {hasMultiple && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 pointer-events-none">
              {images.map((_: string, i: number) => (
                <div
                  key={i}
                  className={`rounded-full transition-all duration-200 ${
                    i === carouselIdx ? 'w-[18px] h-[6px] bg-white shadow-sm' : 'w-[6px] h-[6px] bg-white/50'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Desktop prev/next arrows — hover only, hidden on mobile */}
          {hasMultiple && carouselIdx > 0 && (
            <button
              type="button"
              aria-label="Previous image"
              onClick={goPrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-black/70 hidden sm:flex"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          {hasMultiple && carouselIdx < images.length - 1 && (
            <button
              type="button"
              aria-label="Next image"
              onClick={goNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity duration-150 hover:bg-black/70 hidden sm:flex"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Double-tap heart animation */}
          {justLiked && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <Heart className="w-20 h-20 text-like fill-current animate-heart-pop drop-shadow-xl" />
            </div>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="px-3.5 pt-2.5 pb-3">
        {/* Caption with inline expand */}
        {post.content?.text && (() => {
          const isLong = post.content.text.length > 120;
          return (
            <div className="mb-2.5">
              <p className={`text-[13px] text-foreground/90 leading-[1.55] ${!expandedCaption && isLong ? 'line-clamp-2' : ''}`}>
                {parseCaption(post.content.text, (href, label, key) => (
                  <Link key={key} to={href} onClick={e => e.stopPropagation()} className="text-primary/75 hover:text-primary font-medium transition-colors">{label}</Link>
                ))}
              </p>
              {isLong && (
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setExpandedCaption(p => !p); }}
                  className="text-[12px] text-muted-foreground hover:text-foreground mt-0.5 transition-colors"
                >
                  {expandedCaption ? 'Less' : '... More'}
                </button>
              )}
            </div>
          );
        })()}

        {/* Tagged products — inline chips before actions */}
        {hasShop && (
          <div className="mb-2.5 flex flex-wrap gap-1.5">
            {post.taggedProducts.slice(0, 2).map((pid: string) => {
              const product = getProductById(pid);
              if (!product) return null;
              const inCart = cartItems.has(pid);
              return (
                <div key={pid} className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
                  <Link
                    to={`/product/${pid}`}
                    onClick={e => e.stopPropagation()}
                    className="flex items-center gap-1.5 pl-2 pr-1 py-1.5 hover:bg-muted/60 transition-colors"
                  >
                    <ShoppingBag className="w-3 h-3 text-primary/70 shrink-0" />
                    <span className="text-[11px] font-medium text-foreground/80 truncate max-w-[90px]">{product.name}</span>
                    <span className="text-[11px] font-bold text-primary shrink-0">${product.price}</span>
                  </Link>
                  <button
                    type="button"
                    onClick={e => handleAddToCart(e, pid, product.name)}
                    aria-label="Add to cart"
                    className={`mr-1 p-1 rounded-lg transition-all duration-200 ${inCart ? 'bg-emerald-500/15 text-emerald-600' : 'hover:bg-primary/10 text-muted-foreground hover:text-primary'}`}
                  >
                    {inCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Engagement action bar */}
        <div className="flex items-center gap-0.5 -mx-1 pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={handleLike}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            aria-pressed={isLiked}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 active:scale-[0.88] ${
              isLiked ? 'text-like' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Heart className={`w-[18px] h-[18px] shrink-0 transition-colors ${isLiked ? 'fill-current' : ''} ${justLiked ? 'animate-heart-pop' : ''}`} />
            <span className="tabular-nums text-[12px]">{fmtCount(likeCount)}</span>
          </button>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setCommentSheetOpen(true); }}
            aria-label="Comment"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 active:scale-[0.88]"
          >
            <MessageCircle className="w-[18px] h-[18px] shrink-0" />
            <span className="tabular-nums text-[12px]">{fmtCount(post.comments)}</span>
          </button>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setRepostSheetOpen(true); }}
            aria-label={isReposted ? 'Undo repost' : 'Repost'}
            aria-pressed={isReposted}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 active:scale-[0.88] ${
              isReposted ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Repeat2 className="w-[18px] h-[18px] shrink-0" />
            <span className="tabular-nums text-[12px]">{fmtCount(repostCount)}</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 active:scale-[0.88]"
          >
            <Share2 className="w-[18px] h-[18px] shrink-0" />
            <span className="tabular-nums text-[12px]">{fmtCount(post.shares)}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? 'Unsave' : 'Save'}
            aria-pressed={isSaved}
            className={`ml-auto p-2 rounded-xl transition-all duration-150 active:scale-[0.88] ${
              isSaved ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <BookmarkPlus className={`w-[18px] h-[18px] transition-colors ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Comments sheet — inline, no navigation */}
      <CommentSheet
        open={commentSheetOpen}
        onOpenChange={setCommentSheetOpen}
        post={post}
      />

      {/* Repost sheet */}
      <RepostSheet
        open={repostSheetOpen}
        onOpenChange={setRepostSheetOpen}
        post={post}
        isReposted={isReposted}
        onRepost={quoteText => {
          setIsReposted(true);
          setRepostCount(prev => prev + 1);
          setRepostSheetOpen(false);
          toast.success(quoteText ? 'Quote reposted to your followers!' : 'Reposted to your followers!');
        }}
        onUndoRepost={() => {
          setIsReposted(false);
          setRepostCount(prev => Math.max(0, prev - 1));
          setRepostSheetOpen(false);
          toast.success('Repost removed');
        }}
      />
    </article>
  );
});
