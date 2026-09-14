import React, { useState, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  Heart, MessageCircle, Share2, BookmarkPlus, Repeat2,
  ChevronLeft, ChevronRight, X, ShoppingBag, ShoppingCart,
  Check, UserPlus, UserCheck, Zap, MoreHorizontal, Star,
} from 'lucide-react';
import { getProductById } from '../data/products';
import { VerifiedBadge } from './VerifiedBadge';
import { CommentSheet } from './CommentSheet';
import { toCorePost } from '../data/posts';
import { RepostSheet } from './RepostSheet';
import { toast } from 'sonner';

function fmtCount(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 10_000)    return `${Math.round(n / 1_000)}K`;
  if (n >= 1_000)     return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function parseCaption(
  text: string,
  renderLink: (href: string, label: string, key: number) => React.ReactNode,
): React.ReactNode[] {
  return text.split(/(#\w+|@\w+)/g).map((part, i) => {
    if (part.startsWith('#')) return renderLink(`/explore?tag=${encodeURIComponent(part)}`, part, i);
    if (part.startsWith('@')) return renderLink(`/profile/${part.slice(1)}`, part, i);
    return part;
  });
}

interface PostViewerProps {
  post: any;
  onClose?: () => void;
}

export function PostViewer({ post, onClose }: PostViewerProps) {
  const navigate = useNavigate();
  const [isLiked,       setIsLiked]       = useState(!!post.isLiked);
  const [isSaved,       setIsSaved]       = useState(!!post.isSaved);
  const [isFollowing,   setIsFollowing]   = useState(false);
  const [isReposted,    setIsReposted]    = useState(false);
  const [likeCount,     setLikeCount]     = useState<number>(post.likes ?? 0);
  const [repostCount,   setRepostCount]   = useState<number>(Math.round((post.shares ?? 0) * 0.4));
  const [carouselIdx,   setCarouselIdx]   = useState(0);
  const [expandCaption, setExpandCaption] = useState(false);
  const [justLiked,     setJustLiked]     = useState(false);
  const [cartItems,     setCartItems]     = useState<Set<string>>(new Set());
  const [commentOpen,   setCommentOpen]   = useState(false);
  const [repostOpen,    setRepostOpen]    = useState(false);

  const lastTapRef     = useRef(0);
  const touchStartXRef = useRef(0);
  const touchStartYRef = useRef(0);

  const images      = (post.content?.images ?? []) as string[];
  const hasMultiple = images.length > 1;
  const hasShop     = (post.taggedProducts?.length ?? 0) > 0;
  const isLoop      = post.type === 'loop';

  const closeWithNav = (path: string) => { onClose?.(); navigate(path); };

  const handleLike = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(prev => {
      const next = !prev;
      setLikeCount(c => next ? c + 1 : Math.max(0, c - 1));
      if (next) {
        setJustLiked(true);
        setTimeout(() => setJustLiked(false), 800);
        toast.success('Liked!', { duration: 1200 });
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
    e.stopPropagation();
    setIsSaved(prev => {
      toast.success(!prev ? 'Saved!' : 'Removed from saved', { duration: 1200 });
      return !prev;
    });
  }, []);

  const handleShare = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/post/${post.id}`;
    if (navigator.share) {
      navigator.share({ title: 'Check this on Ezyify', url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url).catch(() => {});
      toast.success('Link copied!');
    }
  }, [post.id]);

  const handleAddToCart = useCallback((e: React.MouseEvent, productId: string, productName?: string) => {
    e.stopPropagation();
    setCartItems(prev => {
      const s = new Set(prev);
      const was = s.has(productId);
      if (!was) {
        try {
          const raw  = localStorage.getItem('ezyify_cart');
          const cart = raw ? JSON.parse(raw) : [];
          const hit  = cart.find((i: any) => i.id === productId);
          if (hit) { hit.quantity = (hit.quantity || 1) + 1; }
          else {
            const p = getProductById(productId);
            if (p) cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, quantity: 1 });
          }
          localStorage.setItem('ezyify_cart', JSON.stringify(cart));
          window.dispatchEvent(new Event('cartUpdated'));
        } catch {}
      }
      was ? s.delete(productId) : s.add(productId);
      toast.success(was ? 'Removed from cart' : `${productName ?? 'Item'} added to cart!`);
      return s;
    });
  }, []);

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden">

      {/* ── HEADER ────────────────────────────────────────────────────────── */}
      <div className="shrink-0 flex items-center gap-3 px-3 sm:px-4 py-2.5 border-b border-border/50">
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Creator */}
        <button
          onClick={() => closeWithNav(`/profile/${post.user.username}`)}
          className="flex items-center gap-2.5 flex-1 min-w-0 group text-left"
        >
          <img
            loading="eager"
            src={post.user.avatar}
            alt={post.user.name}
            className="w-8 h-8 rounded-full object-cover ring-[1.5px] ring-border/60 group-hover:ring-primary/40 transition-all shrink-0"
          />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-[13px] text-foreground truncate leading-tight group-hover:text-primary transition-colors">
                {post.user.name}
              </span>
              {post.user.verified && <VerifiedBadge size="sm" />}
            </div>
            <p className="text-[11px] text-muted-foreground/60 leading-none mt-px">@{post.user.username}</p>
          </div>
        </button>

        {/* Follow */}
        <button
          type="button"
          onClick={() => setIsFollowing(prev => {
            toast.success(!prev ? `Following @${post.user.username}!` : `Unfollowed @${post.user.username}`, { duration: 1500 });
            return !prev;
          })}
          className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[12px] font-semibold transition-all duration-150 active:scale-[0.92] ${
            isFollowing
              ? 'bg-muted text-foreground/70 border border-border/70'
              : 'text-white hover:opacity-90 shadow-sm'
          }`}
          style={isFollowing ? {} : { background: 'var(--brand-gradient)' }}
        >
          {isFollowing
            ? <><UserCheck className="w-3.5 h-3.5" /><span>Following</span></>
            : <><UserPlus className="w-3.5 h-3.5" /><span>Follow</span></>
          }
        </button>

        {/* More */}
        <button
          type="button"
          aria-label="More options"
          className="shrink-0 w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
        >
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* ── SCROLLABLE BODY ───────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto overscroll-contain">

        {/* Media ─ full-width, black bg */}
        <div
          className="relative bg-black overflow-hidden"
          onClick={handleDoubleTap}
        >
          <div
            className="aspect-[4/5] sm:aspect-square relative overflow-hidden group"
            onTouchStart={hasMultiple ? e => {
              touchStartXRef.current = e.touches[0].clientX;
              touchStartYRef.current = e.touches[0].clientY;
            } : undefined}
            onTouchEnd={hasMultiple ? e => {
              const dx = e.changedTouches[0].clientX - touchStartXRef.current;
              const dy = e.changedTouches[0].clientY - touchStartYRef.current;
              if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 28) {
                e.stopPropagation();
                setCarouselIdx(prev =>
                  dx < 0 ? Math.min(prev + 1, images.length - 1) : Math.max(prev - 1, 0)
                );
              }
            } : undefined}
          >
            {/* Image track */}
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
                      alt={i === 0 ? (post.content?.text ?? '') : ''}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Loop badge */}
            {isLoop && (
              <div
                className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold text-white"
                style={{ background: 'var(--brand-gradient)' }}
              >
                <Zap className="w-3 h-3 fill-current" /> Loop
              </div>
            )}

            {/* Carousel dots */}
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

            {/* Prev / Next arrows — desktop only */}
            {hasMultiple && carouselIdx > 0 && (
              <button
                type="button"
                aria-label="Previous"
                onClick={e => { e.stopPropagation(); setCarouselIdx(p => Math.max(p - 1, 0)); }}
                className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm hidden sm:flex items-center justify-center text-white hover:bg-black/70 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
            )}
            {hasMultiple && carouselIdx < images.length - 1 && (
              <button
                type="button"
                aria-label="Next"
                onClick={e => { e.stopPropagation(); setCarouselIdx(p => Math.min(p + 1, images.length - 1)); }}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/50 backdrop-blur-sm hidden sm:flex items-center justify-center text-white hover:bg-black/70 transition-colors"
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

        {/* ── ENGAGEMENT BAR ──────────────────────────────────────────────── */}
        <div className="flex items-center gap-0.5 px-2 sm:px-3 py-1.5 border-b border-border/40">
          <button
            onClick={handleLike}
            aria-label={isLiked ? 'Unlike' : 'Like'}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 active:scale-[0.88] ${
              isLiked ? 'text-like' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Heart className={`w-[18px] h-[18px] shrink-0 transition-colors ${isLiked ? 'fill-current' : ''}`} />
            <span className="tabular-nums text-[12px]">{fmtCount(likeCount)}</span>
          </button>

          <button
            onClick={e => { e.stopPropagation(); setCommentOpen(true); }}
            aria-label="Comments"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 active:scale-[0.88]"
          >
            <MessageCircle className="w-[18px] h-[18px] shrink-0" />
            <span className="tabular-nums text-[12px]">{fmtCount(post.comments)}</span>
          </button>

          <button
            onClick={e => { e.stopPropagation(); setRepostOpen(true); }}
            aria-label={isReposted ? 'Undo repost' : 'Repost'}
            className={`flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 active:scale-[0.88] ${
              isReposted ? 'text-emerald-500 hover:bg-emerald-500/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <Repeat2 className="w-[18px] h-[18px] shrink-0" />
            <span className="tabular-nums text-[12px]">{fmtCount(repostCount)}</span>
          </button>

          <button
            onClick={handleShare}
            aria-label="Share"
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-[13px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted/60 transition-all duration-150 active:scale-[0.88]"
          >
            <Share2 className="w-[18px] h-[18px] shrink-0" />
            <span className="tabular-nums text-[12px]">{fmtCount(post.shares)}</span>
          </button>

          <button
            onClick={handleSave}
            aria-label={isSaved ? 'Unsave' : 'Save'}
            className={`ml-auto p-2 rounded-xl transition-all duration-150 active:scale-[0.88] ${
              isSaved ? 'text-primary hover:bg-primary/10' : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
            }`}
          >
            <BookmarkPlus className={`w-[18px] h-[18px] transition-colors ${isSaved ? 'fill-current' : ''}`} />
          </button>
        </div>

        {/* ── CAPTION ─────────────────────────────────────────────────────── */}
        {post.content?.text && (() => {
          const isLong = post.content.text.length > 120;
          return (
            <div className="px-4 pt-3 pb-2">
              <p className={`text-[13px] text-foreground/90 leading-[1.6] ${!expandCaption && isLong ? 'line-clamp-3' : ''}`}>
                <button
                  onClick={() => closeWithNav(`/profile/${post.user.username}`)}
                  className="font-semibold text-foreground hover:underline underline-offset-2 mr-1.5 leading-tight"
                >
                  {post.user.name}
                </button>
                {parseCaption(post.content.text, (href, label, key) => (
                  <Link
                    key={key}
                    to={href}
                    onClick={e => { e.stopPropagation(); onClose?.(); }}
                    className="text-primary/75 hover:text-primary font-medium transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </p>
              {isLong && (
                <button
                  type="button"
                  onClick={e => { e.preventDefault(); e.stopPropagation(); setExpandCaption(p => !p); }}
                  className="text-[12px] text-muted-foreground hover:text-foreground mt-0.5 transition-colors"
                >
                  {expandCaption ? 'Show less' : '... more'}
                </button>
              )}
              {post.timestamp && (
                <p className="text-[11px] text-muted-foreground/50 mt-2">{post.timestamp}</p>
              )}
            </div>
          );
        })()}

        {/* ── TAGGED PRODUCTS ─────────────────────────────────────────────── */}
        {hasShop && (
          <div className="px-4 pt-1 pb-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
              <ShoppingBag className="w-3 h-3" /> Tagged Products
            </p>
            <div className="space-y-2">
              {post.taggedProducts.map((pid: string) => {
                const product = getProductById(pid);
                if (!product) return null;
                const inCart = cartItems.has(pid);
                return (
                  <div
                    key={pid}
                    className="flex items-center gap-3 p-2.5 rounded-2xl border border-border/60 bg-muted/25 hover:bg-muted/50 transition-colors"
                  >
                    <button
                      onClick={() => closeWithNav(`/product/${pid}`)}
                      className="flex items-center gap-3 flex-1 min-w-0 text-left"
                    >
                      <img
                        loading="lazy"
                        src={product.image}
                        alt={product.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-foreground truncate">{product.name}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[14px] font-bold text-primary">${product.price.toFixed(2)}</span>
                          {product.originalPrice && (
                            <span className="text-[11px] text-muted-foreground line-through">${product.originalPrice.toFixed(2)}</span>
                          )}
                        </div>
                        {product.rating && (
                          <div className="flex items-center gap-1 mt-0.5">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="text-[11px] text-muted-foreground">{product.rating}</span>
                          </div>
                        )}
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={e => handleAddToCart(e, pid, product.name)}
                      aria-label={inCart ? 'Remove from cart' : 'Add to cart'}
                      className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
                        inCart
                          ? 'bg-emerald-500/15 text-emerald-600'
                          : 'bg-muted hover:bg-primary/10 text-muted-foreground hover:text-primary'
                      }`}
                    >
                      {inCart ? <Check className="w-4 h-4" /> : <ShoppingCart className="w-4 h-4" />}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Safe-area spacer */}
        <div style={{ height: 'max(env(safe-area-inset-bottom, 0px), 12px)' }} />
      </div>

      {/* ── COMMENT SHEET ───────────────────────────────────────────────────── */}
      <CommentSheet
        key={post.id}
        open={commentOpen}
        onOpenChange={setCommentOpen}
        post={toCorePost(post)}
      />

      {/* ── REPOST SHEET ────────────────────────────────────────────────────── */}
      <RepostSheet
        open={repostOpen}
        onOpenChange={open => { if (!open) setRepostOpen(false); }}
        post={post}
        isReposted={isReposted}
        onRepost={quoteText => {
          setIsReposted(true);
          setRepostCount(c => c + 1);
          toast.success(quoteText ? 'Quote reposted!' : 'Reposted to your followers!');
          setRepostOpen(false);
        }}
        onUndoRepost={() => {
          setIsReposted(false);
          setRepostCount(c => Math.max(0, c - 1));
          toast.success('Repost removed');
          setRepostOpen(false);
        }}
      />
    </div>
  );
}
