import React, { useState } from 'react';
import {
  Heart, MessageCircle, BookmarkPlus, Send, Eye,
  MoreHorizontal, Repeat2, X, Link2, Flag, VolumeX,
} from 'lucide-react';
import { useNavigate } from 'react-router';
import { getProductById } from '../data/products';
import { VerifiedBadge } from './VerifiedBadge';
import { CommentSheet } from './CommentSheet';
import { toCorePost } from '../data/posts';
import { RepostSheet } from './RepostSheet';
import { ReferralService } from '../services/referral';
import { toast } from 'sonner';

function fmt(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

function ActionBtn({
  children, onClick, label, count, active = false, activeClass = '',
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

interface LoopViewerProps {
  loop: any;
  onClose?: () => void;
}

export function LoopViewer({ loop, onClose }: LoopViewerProps) {
  const navigate = useNavigate();
  const [isLiked,      setIsLiked]      = useState(!!loop.isLiked);
  const [isSaved,      setIsSaved]      = useState(!!loop.isSaved);
  const [isFollowing,  setIsFollowing]  = useState(false);
  const [isReposted,   setIsReposted]   = useState(false);
  const [likeCount,    setLikeCount]    = useState<number>(loop.likes ?? 0);
  const [repostCount,  setRepostCount]  = useState<number>(Math.round((loop.shares ?? 0) * 0.4));
  const [commentOpen,  setCommentOpen]  = useState(false);
  const [repostOpen,   setRepostOpen]   = useState(false);
  const [moreOpen,     setMoreOpen]     = useState(false);

  const firstProduct = (loop.taggedProducts?.length ?? 0) > 0
    ? getProductById(loop.taggedProducts[0])
    : null;

  const toggleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsLiked(prev => {
      const next = !prev;
      setLikeCount(c => next ? c + 1 : Math.max(0, c - 1));
      if (next) toast.success('Liked!', { duration: 1200 });
      return next;
    });
  };

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved(prev => {
      toast.success(!prev ? 'Saved to collection!' : 'Removed from saved', { duration: 1500 });
      return !prev;
    });
  };

  const toggleFollow = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsFollowing(prev => {
      toast.success(!prev ? `Following @${loop.user.username}!` : `Unfollowed @${loop.user.username}`, { duration: 1500 });
      return !prev;
    });
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    let shareUrl = `${window.location.origin}/loops?v=${loop.id}`;
    if (firstProduct) {
      try {
        const ref = ReferralService.createReferral({ productId: firstProduct.id, sellerId: firstProduct.id, source: 'share' });
        shareUrl = `${window.location.origin}/loops?v=${loop.id}&ref=${ref.referralId}`;
      } catch {}
    }
    if (navigator.share) {
      navigator.share({ title: loop.content?.text ?? 'Check this Loop on Ezyify', url: shareUrl }).catch(() => {});
    } else {
      navigator.clipboard.writeText(shareUrl).catch(() => {});
      toast.success('Link copied!');
    }
  };

  const handleBuyNow = (e: React.MouseEvent, productId: string) => {
    e.preventDefault(); e.stopPropagation();
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
    onClose?.();
    navigate('/cart');
  };

  const closeWithNav = (path: string) => {
    onClose?.();
    navigate(path);
  };

  return (
    <div className="relative w-full h-full bg-[#0a0a0a] overflow-hidden select-none">

      {/* ── BACKGROUND ──────────────────────────────────────────────────── */}
      <div className="absolute inset-0">
        {loop.content?.images?.[0] && (
          <img
            src={loop.content.images[0]}
            alt=""
            role="presentation"
            draggable={false}
            className="w-full h-full object-cover object-center"
          />
        )}
        {/* Bottom-weighted cinematic scrim — same as LoopsPage */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom,' +
              'rgba(0,0,0,0.32) 0%,' +
              'transparent 22%,' +
              'transparent 32%,' +
              'rgba(0,0,0,0.14) 50%,' +
              'rgba(0,0,0,0.55) 72%,' +
              'rgba(0,0,0,0.90) 100%)',
          }}
        />
      </div>

      {/* ── TOP BAR ─────────────────────────────────────────────────────── */}
      <div
        className="absolute top-0 left-0 right-0 z-30 flex items-center justify-between px-3"
        style={{ paddingTop: 'max(env(safe-area-inset-top, 0px), 10px)', paddingBottom: '8px' }}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close loop"
          className="w-9 h-9 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/10 text-white hover:bg-black/60 active:scale-[0.92] transition-all"
        >
          <X className="w-[18px] h-[18px]" />
        </button>

        {/* Creator pill — taps to profile */}
        <button
          onClick={() => closeWithNav(`/profile/${loop.user.username}`)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10 hover:bg-black/60 active:scale-[0.96] transition-all"
        >
          <img
            src={loop.user.avatar}
            alt={loop.user.name}
            className="w-5 h-5 rounded-full object-cover ring-[1.5px] ring-white/35"
          />
          <span className="text-white text-[12px] font-semibold leading-none">
            @{loop.user.username}
          </span>
          {loop.user.verified && <VerifiedBadge size="sm" />}
        </button>

        {/* Spacer to balance the close button */}
        <div className="w-9" aria-hidden />
      </div>

      {/* ── RIGHT ACTION STACK ──────────────────────────────────────────── */}
      <div
        className="absolute right-2.5 sm:right-4 lg:right-6 z-20 flex flex-col items-center gap-3 sm:gap-3.5"
        style={{ bottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <ActionBtn
          onClick={toggleLike}
          label={isLiked ? 'Unlike' : 'Like'}
          count={fmt(likeCount)}
          active={isLiked}
          activeClass="bg-rose-500/25 border-rose-400/30 shadow-[0_0_14px_rgba(244,63,94,0.45)]"
        >
          <Heart className={`w-[22px] h-[22px] sm:w-6 sm:h-6 transition-all duration-200 ${
            isLiked ? 'fill-rose-400 text-rose-400 scale-110' : 'text-white'
          }`} />
        </ActionBtn>

        <ActionBtn
          onClick={(e) => { e.stopPropagation(); setCommentOpen(true); }}
          label="Comments"
          count={fmt(loop.comments ?? 0)}
        >
          <MessageCircle className="w-[22px] h-[22px] sm:w-6 sm:h-6 text-white" />
        </ActionBtn>

        <ActionBtn
          onClick={(e) => { e.stopPropagation(); setRepostOpen(true); }}
          label={isReposted ? 'Undo repost' : 'Repost'}
          count={fmt(repostCount + (isReposted ? 1 : 0))}
          active={isReposted}
          activeClass="bg-success/20 border-success/30 shadow-[0_0_12px_color-mix(in_srgb,var(--success)_40%,transparent)]"
        >
          <Repeat2 className={`w-[22px] h-[22px] sm:w-6 sm:h-6 transition-colors duration-200 ${
            isReposted ? 'text-success' : 'text-white'
          }`} />
        </ActionBtn>

        <ActionBtn onClick={handleShare} label="Share" count={fmt(loop.shares ?? 0)}>
          <Send className="w-[22px] h-[22px] sm:w-6 sm:h-6 text-white" />
        </ActionBtn>

        <ActionBtn
          onClick={toggleSave}
          label={isSaved ? 'Unsave' : 'Save'}
          active={isSaved}
          activeClass="bg-primary/20 border-primary/30 shadow-[0_0_12px_rgba(var(--color-primary-rgb,99,102,241),0.4)]"
        >
          <BookmarkPlus className={`w-[22px] h-[22px] sm:w-6 sm:h-6 transition-all duration-200 ${
            isSaved ? 'fill-primary text-primary scale-110' : 'text-white'
          }`} />
        </ActionBtn>

        <ActionBtn
          onClick={(e) => { e.stopPropagation(); setMoreOpen(true); }}
          label="More options"
        >
          <MoreHorizontal className="w-[22px] h-[22px] sm:w-6 sm:h-6 text-white" />
        </ActionBtn>
      </div>

      {/* ── BOTTOM CONTENT ──────────────────────────────────────────────── */}
      <div
        className="absolute bottom-0 left-0 right-0 z-10 px-3.5 sm:px-5 lg:px-6"
        style={{ paddingBottom: 'calc(2.25rem + env(safe-area-inset-bottom, 0px))' }}
      >
        <div className="max-w-[73%] sm:max-w-[68%] lg:max-w-[60%]">

          {/* Creator row */}
          <div className="flex items-center gap-2 mb-2">
            <button
              onClick={() => closeWithNav(`/profile/${loop.user.username}`)}
              className="shrink-0"
            >
              <img
                src={loop.user.avatar}
                alt={loop.user.name}
                className="w-7 h-7 rounded-full object-cover ring-[1.5px] ring-white/40"
              />
            </button>
            <button
              onClick={() => closeWithNav(`/profile/${loop.user.username}`)}
              className="flex items-center gap-1 min-w-0 flex-1 group text-left"
            >
              <span className="text-white font-bold text-[13px] sm:text-sm truncate group-hover:underline underline-offset-2 drop-shadow-md">
                @{loop.user.username}
              </span>
              {loop.user.verified && (
                <span className="shrink-0"><VerifiedBadge /></span>
              )}
            </button>
            {!isFollowing && (
              <button
                onClick={toggleFollow}
                className="shrink-0 px-3 py-[5px] rounded-full border border-white/50 text-white text-[11px] font-semibold hover:bg-white/15 active:scale-95 transition-all whitespace-nowrap"
              >
                Follow
              </button>
            )}
          </div>

          {/* Caption */}
          {loop.content?.text && (
            <p className="text-white/92 text-[13px] sm:text-sm leading-snug line-clamp-3 mb-1.5 drop-shadow-md">
              {loop.content.text}
            </p>
          )}

          {/* Views */}
          {!!loop.views && (
            <div className="flex items-center gap-1 mb-2.5">
              <Eye className="w-3 h-3 text-white/45 shrink-0" />
              <span className="text-white/45 text-[11px] font-medium">
                {fmt(loop.views)} views
              </span>
            </div>
          )}

          {/* Product CTA — preserved from LoopsPage */}
          {firstProduct && (
            <div className="flex items-center gap-2.5 rounded-2xl p-2.5 border border-white/[0.13] bg-black/55 backdrop-blur-xl hover:border-white/22 transition-colors">
              <button
                onClick={() => closeWithNav(`/product/${firstProduct.id}`)}
                className="flex items-center gap-2.5 flex-1 min-w-0 group text-left"
              >
                <img
                  src={firstProduct.image}
                  alt={firstProduct.name}
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-[10px] object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-white/50 text-[9px] font-semibold uppercase tracking-[0.08em] mb-[1px]">
                    Featured
                  </p>
                  <p className="text-white text-[12px] font-semibold leading-tight truncate group-hover:text-white/85 transition-colors">
                    {firstProduct.name}
                  </p>
                  <div className="flex items-baseline gap-1.5 mt-[1px]">
                    <span className="text-white font-bold text-[13px]">
                      ${firstProduct.price.toFixed(2)}
                    </span>
                    {firstProduct.originalPrice && (
                      <span className="text-white/35 text-[10px] line-through">
                        ${firstProduct.originalPrice.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>
              </button>
              <button
                onClick={(e) => handleBuyNow(e, firstProduct.id)}
                className="shrink-0 px-3 py-[7px] rounded-[10px] text-white text-[11px] font-bold whitespace-nowrap active:scale-95 hover:opacity-90 transition-all shadow-brand"
                style={{ background: 'var(--brand-gradient)' }}
              >
                Buy Now
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── COMMENT SHEET ───────────────────────────────────────────────── */}
      <CommentSheet
        key={loop.id}
        open={commentOpen}
        onOpenChange={setCommentOpen}
        post={toCorePost(loop)}
      />

      {/* ── REPOST SHEET ────────────────────────────────────────────────── */}
      <RepostSheet
        open={repostOpen}
        onOpenChange={(open) => { if (!open) setRepostOpen(false); }}
        post={loop}
        isReposted={isReposted}
        onRepost={(quoteText) => {
          setIsReposted(true);
          setRepostCount(c => c + 1);
          if (firstProduct) {
            try {
              ReferralService.createReferral({ productId: firstProduct.id, sellerId: firstProduct.id, source: 'repost' });
            } catch {}
          }
          toast.success(quoteText ? 'Quote reposted!' : 'Reposted!');
          setRepostOpen(false);
        }}
        onUndoRepost={() => {
          setIsReposted(false);
          setRepostCount(c => Math.max(0, c - 1));
          toast.success('Repost removed');
          setRepostOpen(false);
        }}
      />

      {/* ── MORE OPTIONS SHEET ──────────────────────────────────────────── */}
      {moreOpen && (
        <div
          className="absolute inset-0 z-[80] flex items-end justify-center"
          onClick={() => setMoreOpen(false)}
        >
          <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]" />
          <div
            className="relative w-full max-w-lg mx-auto bg-card rounded-t-3xl overflow-hidden shadow-2xl"
            style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-9 h-1 bg-muted-foreground/25 rounded-full" />
            </div>
            <div className="px-3 pt-2 pb-1 space-y-0.5">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/loops?v=${loop.id}`).catch(() => {});
                  toast.success('Link copied!');
                  setMoreOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-muted/70 active:bg-muted transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Link2 className="w-[18px] h-[18px] text-primary" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-foreground">Copy Link</p>
                  <p className="text-[11px] text-muted-foreground/70">Share this Loop</p>
                </div>
              </button>
              <button
                onClick={() => {
                  toast.success(`@${loop.user.username} muted`, { description: "You won't see their content for 30 days" });
                  setMoreOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-muted/70 active:bg-muted transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                  <VolumeX className="w-[18px] h-[18px] text-muted-foreground" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-foreground">Mute @{loop.user.username}</p>
                  <p className="text-[11px] text-muted-foreground/70">Hide their content for 30 days</p>
                </div>
              </button>
              <button
                onClick={() => {
                  toast.success('Report submitted', { description: 'Thanks for helping keep Ezyify safe' });
                  setMoreOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-3.5 rounded-2xl hover:bg-muted/70 active:bg-muted transition-colors text-left"
              >
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
              <button
                onClick={() => setMoreOpen(false)}
                className="w-full px-4 py-3 rounded-2xl bg-muted/60 text-[14px] font-semibold text-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
