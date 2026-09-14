import React, { useState, useRef, useCallback } from 'react';
import { Link } from 'react-router';
import {
  Heart, MessageCircle, Share2, BookmarkPlus, MoreVertical,
  UserPlus, UserCheck, ShoppingBag, ShoppingCart, Check,
  Repeat2, Play, Zap, ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { avatarUrlFor, formatCompactNumber as fmtCount, formatMoney, formatRelativeTime, useProduct, useProfile, useToggleFollow, useToggleLike, useToggleSave, type Post } from '@ezyify/core';
import { VerifiedBadge } from './VerifiedBadge';
import { CommentSheet } from './CommentSheet';
import { RepostSheet } from './RepostSheet';
import { toast } from 'sonner';
import { useAddLine, useAuthed, useInCart } from '../lib/data';
import { formErrors } from '../lib/apiErrors';
import { Img } from './primitives/Img';

const avatarOf = (u: { avatarUrl: string | null; name: string }) => avatarUrlFor(u, 72);

/** Tagged-product chip: the post only carries ids. */
function ProductChip({ id, onAdd, inCart, pending }: { id: string; onAdd: (id: string, name: string) => void; inCart: boolean; pending: boolean }) {
  const { data: product } = useProduct(id);
  if (!product) return null;
  return (
    <div className="flex items-center gap-1.5 rounded-xl border border-border/60 bg-muted/30 overflow-hidden">
      <Link to={`/product/${id}`} onClick={e => e.stopPropagation()} className="flex items-center gap-1.5 pl-2 pr-1 py-1.5 hover:bg-muted/60 transition-colors">
        <ShoppingBag className="w-3 h-3 text-primary/70 shrink-0" />
        <span className="text-[11px] font-medium text-foreground/80 truncate max-w-[90px]">{product.name}</span>
        <span className="text-[11px] font-bold text-primary shrink-0">{formatMoney(product.price)}</span>
      </Link>
      <button
        type="button"
        onClick={e => { e.preventDefault(); e.stopPropagation(); onAdd(id, product.name); }}
        disabled={pending || !product.inStock}
        aria-label={inCart ? 'In cart' : `Add ${product.name} to cart`}
        className={`mr-1 p-1 rounded-lg transition-all duration-200 ${inCart ? 'bg-emerald-500/15 text-emerald-600' : 'hover:bg-primary/10 text-foreground-secondary hover:text-primary'}`}
      >
        {inCart ? <Check className="w-3.5 h-3.5" /> : <ShoppingCart className="w-3.5 h-3.5" />}
      </button>
    </div>
  );
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
  post: Post;
  animationDelay?: number;
  /** Hide the follow pill (e.g. on the author's own profile). */
  hideFollow?: boolean;
}

/** Feed card on the shared `Post`; like / save / follow are optimistic core mutations, guests get bounced to login. */
export const PostCard = React.memo(function PostCard({ post, animationDelay = 0, hideFollow }: PostCardProps) {
  const navigate = useNavigate();
  const authed = useAuthed();
  const like = useToggleLike();
  const save = useToggleSave();
  const follow = useToggleFollow();
  const profile = useProfile(hideFollow ? undefined : post.author.username);
  const { add, pending } = useAddLine();
  const inCart = useInCart();
  const [isReposted,      setIsReposted]      = useState(false);
  const [repostCount,     setRepostCount]     = useState<number>(Math.round((post.engagement.shares ?? 0) * 0.4));
  const [carouselIdx,     setCarouselIdx]     = useState(0);
  const [expandedCaption, setExpandedCaption] = useState(false);
  const [justLiked,       setJustLiked]       = useState(false);
  const [commentSheetOpen,  setCommentSheetOpen]  = useState(false);
  const [repostSheetOpen,   setRepostSheetOpen]   = useState(false);

  const lastTapRef     = useRef(0);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const isLiked     = post.engagement.isLiked;
  const isSaved     = post.engagement.isSaved;
  const likeCount   = post.engagement.likes;
  const isFollowing = !!profile.data?.isFollowing;
  const isLoop      = post.kind === 'loop';
  const hasShop     = post.taggedProductIds.length > 0;
  const isLive      = false;
  const images      = post.media.map(m => (m.type === 'video' && m.thumbnailUrl ? m.thumbnailUrl : m.url));
  const hasMultiple = images.length > 1;
  const caption     = post.caption;

  const requireAuth = () => {
    if (authed) return true;
    navigate('/login', { state: { next: `/post/${post.id}` } });
    return false;
  };

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!requireAuth()) return;
    if (!isLiked) {
      setJustLiked(true);
      setTimeout(() => setJustLiked(false), 800);
    }
    like.mutate({ id: post.id, liked: isLiked });
     
  }, [authed, isLiked, post.id]);

  const handleDoubleTap = useCallback((_e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastTapRef.current < 350 && authed && !isLiked) {
      setJustLiked(true);
      setTimeout(() => setJustLiked(false), 800);
      like.mutate({ id: post.id, liked: false });
    }
    lastTapRef.current = now;
     
  }, [authed, isLiked, post.id]);

  const handleSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!requireAuth()) return;
    save.mutate({ id: post.id, saved: isSaved });
    if (!isSaved) toast.success('Saved to collection');
     
  }, [authed, isSaved, post.id]);

  const handleFollow = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (!requireAuth()) return;
    follow.mutate({ username: post.author.username, following: isFollowing });
    if (!isFollowing) toast.success(`Following @${post.author.username}`);
     
  }, [authed, isFollowing, post.author.username]);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation();
    if (navigator.share) {
      navigator.share({ title: 'Check this on Ezyify', url: `${window.location.origin}/post/${post.id}` }).catch(() => {});
    } else {
      navigator.clipboard.writeText(`${window.location.origin}/post/${post.id}`).catch(() => {});
      toast.success('Link copied!');
    }
  }, [post.id]);

  const handleAddToCart = useCallback(async (productId: string, productName: string) => {
    try {
      await add(productId, 1);
      toast.success(`${productName} added to cart`);
    } catch (err) {
      toast.error(formErrors(err).message ?? 'Couldn’t add to cart');
    }
  }, [add]);

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
        <Link to={`/profile/${post.author.username}`} className="flex items-center gap-2.5 min-w-0 flex-1 group">
          <div className="relative shrink-0">
            {isLive ? (
              <div className="p-[2.5px] rounded-full" style={{ background: 'linear-gradient(135deg, var(--error), var(--orange-500))' }}>
                <div className="bg-card p-[2px] rounded-full">
                  <Img loading="lazy" src={avatarOf(post.author)} alt={post.author.name} className="w-9 h-9 rounded-full object-cover" />
                </div>
              </div>
            ) : (
              <Img loading="lazy" src={avatarOf(post.author)} alt={post.author.name} className="w-9 h-9 rounded-full object-cover ring-[1.5px] ring-border/60 group-hover:ring-2 group-hover:ring-primary/30 transition-all" />
            )}
            {isLive && (
              <span className="absolute -bottom-0.5 -right-0.5 px-1 py-px rounded-full text-[8px] font-black text-error-foreground leading-none bg-error border border-card">
                LIVE
              </span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1 mb-px">
              <span className="font-semibold text-[13px] text-foreground truncate leading-tight">{post.author.name}</span>
              {post.author.verified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-[11px] text-foreground-secondary leading-none">{formatRelativeTime(post.createdAt)}{post.location ? ` · ${post.location}` : ''}</p>
          </div>
        </Link>

        <div className="flex items-center gap-1 shrink-0">
          {!hideFollow && <button
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
          </button>}
          <Link to={`/report?type=post&id=${post.id}`} aria-label="More options" className="p-1.5 rounded-xl text-foreground-secondary hover:text-foreground hover:bg-muted/80 transition-all">
            <MoreVertical className="w-4 h-4" />
          </Link>
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
                    alt={i === 0 ? caption : ''}
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
                className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white bg-brand-gradient"
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
          {!!post.engagement.views && (
            <div className="absolute bottom-3 left-3 z-10 text-white text-[11px] font-medium px-2 py-1 rounded-full tabular-nums" style={{ background: 'rgba(0,0,0,0.48)', backdropFilter: 'blur(6px)' }}>
              {fmtCount(post.engagement.views)} views
            </div>
          )}

          {/* Shop chip — lifts above dots when carousel has multiple slides */}
          {hasShop && !isLoop && (
            <div
              className={`absolute right-3 z-10 flex items-center gap-1 px-2.5 py-1.5 rounded-full text-[11px] font-semibold text-white transition-all ${hasMultiple ? 'bottom-9' : 'bottom-3'}`}
              style={{ background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)' }}
            >
              <ShoppingBag className="w-3 h-3" />
              <span>{post.taggedProductIds.length} {post.taggedProductIds.length === 1 ? 'item' : 'items'}</span>
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
        {caption && (() => {
          const isLong = caption.length > 120;
          return (
            <div className="mb-2.5">
              <p className={`text-[13px] text-foreground/90 leading-[1.55] ${!expandedCaption && isLong ? 'line-clamp-2' : ''}`}>
                {parseCaption(caption, (href, label, key) => (
                  <Link key={key} to={href} onClick={e => e.stopPropagation()} className="text-primary/75 hover:text-primary font-medium transition-colors">{label}</Link>
                ))}
              </p>
              {isLong && (
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setExpandedCaption(p => !p); }}
                  className="text-[12px] text-foreground-secondary hover:text-foreground mt-0.5 transition-colors"
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
            {post.taggedProductIds.slice(0, 2).map(pid => (
              <ProductChip key={pid} id={pid} inCart={inCart.has(pid)} pending={pending} onAdd={(id, name) => void handleAddToCart(id, name)} />
            ))}
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
              isLiked ? 'text-like' : 'text-foreground-secondary hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Heart className={`w-[18px] h-[18px] shrink-0 transition-colors ${isLiked ? 'fill-current' : ''} ${justLiked ? 'animate-heart-pop' : ''}`} />
            <span className="tabular-nums text-[12px]">{fmtCount(likeCount)}</span>
          </button>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setCommentSheetOpen(true); }}
            aria-label="Comment"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium text-foreground-secondary hover:text-foreground hover:bg-muted/60 transition-all duration-150 active:scale-[0.88]"
          >
            <MessageCircle className="w-[18px] h-[18px] shrink-0" />
            <span className="tabular-nums text-[12px]">{fmtCount(post.engagement.comments)}</span>
          </button>
          <button
            type="button"
            onClick={e => { e.preventDefault(); e.stopPropagation(); setRepostSheetOpen(true); }}
            aria-label={isReposted ? 'Undo repost' : 'Repost'}
            aria-pressed={isReposted}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 active:scale-[0.88] ${
              isReposted ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-foreground-secondary hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Repeat2 className="w-[18px] h-[18px] shrink-0" />
            <span className="tabular-nums text-[12px]">{fmtCount(repostCount)}</span>
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Share"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium text-foreground-secondary hover:text-foreground hover:bg-muted/60 transition-all duration-150 active:scale-[0.88]"
          >
            <Share2 className="w-[18px] h-[18px] shrink-0" />
            <span className="tabular-nums text-[12px]">{fmtCount(post.engagement.shares)}</span>
          </button>
          <button
            type="button"
            onClick={handleSave}
            aria-label={isSaved ? 'Unsave' : 'Save'}
            aria-pressed={isSaved}
            className={`ml-auto p-2 rounded-xl transition-all duration-150 active:scale-[0.88] ${
              isSaved ? 'text-primary hover:bg-primary/10' : 'text-foreground-secondary hover:text-foreground hover:bg-muted/60'
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
        post={{ id: post.id, user: { name: post.author.name, username: post.author.username, avatar: avatarOf(post.author), verified: post.author.verified }, content: { text: caption, images } }}
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
