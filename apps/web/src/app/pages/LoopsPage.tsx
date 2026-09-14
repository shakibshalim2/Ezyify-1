import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { ChevronLeft, Search, VolumeX, Volume2 } from 'lucide-react';
import { getLoops } from '../data/posts';
import { getProductById } from '../data/products';
import { SEO, SEOConfigs } from '../components/SEO';
import { CommentSheet } from '../components/CommentSheet';
import { toCorePost } from '../data/posts';
import { LoopProgressBar } from '../components/loops/LoopProgressBar';
import { LoopCaption } from '../components/loops/LoopCaption';
import { LoopActionRail } from '../components/loops/LoopActionRail';
import { ShoppableProductSheet } from '../components/loops/ShoppableProductSheet';
import { toast } from 'sonner';

export default function LoopsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reduce = useReducedMotion();

  const loops = getLoops();
  const startingIndex = Math.max(
    0,
    loops.findIndex(l => l.id === searchParams.get('v'))
  );

  const [currentIndex, setCurrentIndex] = useState(startingIndex);
  const [isMuted, setIsMuted] = useState(false);
  const [likedLoops, setLikedLoops] = useState<Set<string>>(new Set());
  const [savedLoops, setSavedLoops] = useState<Set<string>>(new Set());
  const [followingLoops, setFollowingLoops] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState<'following' | 'for-you'>('for-you');
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [hiddenLoops, setHiddenLoops] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const loopRefs = useRef<(HTMLDivElement | null)[]>([]);

  const currentLoop = loops[currentIndex];
  const filteredLoops = tab === 'following'
    ? loops.filter(l => followingLoops.has(l.user.id))
    : loops;

  // Hide hidden loops from display
  const displayedLoops = filteredLoops.filter(l => !hiddenLoops.has(l.id));

  // Auto-progress through loop
  useEffect(() => {
    const duration = 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next loop
          const nextIdx = currentIndex + 1;
          if (nextIdx < displayedLoops.length) {
            setCurrentIndex(nextIdx);
          }
          return 0;
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentIndex, displayedLoops.length]);

  // Snap scroll behavior
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleScroll = () => {
      const scrollTop = container.scrollTop;
      const viewportHeight = container.clientHeight;
      const newIndex = Math.round(scrollTop / viewportHeight);
      if (newIndex !== currentIndex) {
        setCurrentIndex(newIndex);
        setProgress(0);
      }
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        const newIdx = Math.max(0, currentIndex - 1);
        setCurrentIndex(newIdx);
        setProgress(0);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        const newIdx = Math.min(displayedLoops.length - 1, currentIndex + 1);
        setCurrentIndex(newIdx);
        setProgress(0);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, displayedLoops.length]);

  const handleToggleLike = useCallback(() => {
    setLikedLoops(prev => {
      const next = new Set(prev);
      if (next.has(currentLoop.id)) {
        next.delete(currentLoop.id);
      } else {
        next.add(currentLoop.id);
      }
      return next;
    });
  }, [currentLoop.id]);

  const handleToggleSave = useCallback(() => {
    setSavedLoops(prev => {
      const next = new Set(prev);
      if (next.has(currentLoop.id)) {
        next.delete(currentLoop.id);
      } else {
        next.add(currentLoop.id);
      }
      return next;
    });
  }, [currentLoop.id]);

  const handleToggleFollow = useCallback(() => {
    setFollowingLoops(prev => {
      const next = new Set(prev);
      if (next.has(currentLoop.user.id)) {
        next.delete(currentLoop.user.id);
        toast.success(`Unfollowed @${currentLoop.user.username}`);
      } else {
        next.add(currentLoop.user.id);
        toast.success(`Following @${currentLoop.user.username}`);
      }
      return next;
    });
  }, [currentLoop.user.id, currentLoop.user.username]);

  const handleShare = useCallback(() => {
    const url = `${window.location.origin}/loops?v=${currentLoop.id}`;
    navigator.clipboard.writeText(url).catch(() => {});
    toast.success('Link copied!');
  }, [currentLoop.id]);

  return (
    <div className="fixed inset-0 bg-black overflow-hidden">
      <SEO {...SEOConfigs.loops} />

      {/* Full-height snap scroll container */}
      <div
        ref={containerRef}
        className="h-dvh overflow-y-scroll snap-y snap-mandatory scrollbar-hide"
      >
        {displayedLoops.map((loop, idx) => (
          <motion.div
            key={loop.id}
            ref={el => (loopRefs.current[idx] = el)}
            className="relative h-dvh w-full snap-start flex items-center justify-center overflow-hidden"
            initial={reduce ? {} : { opacity: 0 }}
            animate={idx === currentIndex ? { opacity: 1 } : { opacity: 0.5 }}
            transition={{ duration: 0.3 }}
          >
            {/* Video/Image fill */}
            <img
              loading="lazy"
              src={loop.content.video || loop.content.images?.[0] || ''}
              alt={loop.content.text ? `Loop by @${loop.user.username}: ${loop.content.text}` : `Loop by @${loop.user.username}`}
              className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/30 z-[5]" />

            {/* Top overlay with tabs and search */}
            <div className="absolute left-0 right-0 z-20 px-4 flex items-center justify-between" style={{ top: 'calc(var(--safe-top) + 12px)' }}>
              <button
                onClick={() => navigate(-1)}
                className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white/50 outline-none"
                aria-label="Back"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {/* Following | For You tabs */}
              <div className="flex gap-1 bg-black/30 backdrop-blur-md rounded-full p-1" role="tablist">
                {(['following', 'for-you'] as const).map(t => (
                  <button
                    key={t}
                    role="tab"
                    aria-selected={tab === t}
                    onClick={() => setTab(t)}
                    className={`h-9 px-4 rounded-full text-sm font-semibold transition-all ${
                      tab === t
                        ? 'bg-white/90 text-black'
                        : 'text-white/80 hover:text-white'
                    }`}
                  >
                    {t === 'following' ? 'Following' : 'For You'}
                  </button>
                ))}
              </div>

              {/* Search icon */}
              <button
                onClick={() => navigate('/search')}
                className="w-11 h-11 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors focus-visible:ring-2 focus-visible:ring-white/50 outline-none"
                aria-label="Search"
              >
                <Search className="w-5 h-5" />
              </button>
            </div>

            {/* Mute toggle at bottom right of progress bar area */}
            <div className="absolute bottom-2 right-4 z-20">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center text-white hover:bg-black/50 transition-colors focus-visible:ring-2 focus-visible:ring-white/50 outline-none"
                aria-label={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted ? (
                  <VolumeX className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Caption block - bottom left */}
            <LoopCaption
              username={loop.user.username}
              verified={loop.user.verified}
              text={loop.content.text}
              sound={`Original sound`}
            />

            {/* Action rail - right side */}
            {idx === currentIndex && (
              <LoopActionRail
                avatar={loop.user.avatar}
                username={loop.user.username}
                isFollowing={followingLoops.has(loop.user.id)}
                likes={loop.likes}
                isLiked={likedLoops.has(loop.id)}
                comments={loop.comments}
                isSaved={savedLoops.has(loop.id)}
                productCount={loop.taggedProducts?.length || 0}
                onToggleFollow={handleToggleFollow}
                onToggleLike={handleToggleLike}
                onOpenComments={() => setCommentSheetOpen(true)}
                onToggleSave={handleToggleSave}
                onShare={handleShare}
                onOpenProducts={() => setProductSheetOpen(true)}
              />
            )}

            {/* Progress bar */}
            {idx === currentIndex && (
              <LoopProgressBar progress={progress} />
            )}
          </motion.div>
        ))}
      </div>

      {/* Comment sheet */}
      <CommentSheet
        open={commentSheetOpen}
        onOpenChange={setCommentSheetOpen}
        post={toCorePost(currentLoop)}
      />

      {/* Product sheet */}
      <ShoppableProductSheet
        open={productSheetOpen}
        onOpenChange={setProductSheetOpen}
        productIds={currentLoop.taggedProducts || []}
      />
    </div>
  );
}
