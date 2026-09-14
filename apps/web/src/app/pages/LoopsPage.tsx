import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, Search, Volume2, VolumeX } from 'lucide-react';
import { avatarUrlFor, flattenPages, formatCompactNumber, useAuth, useLoops, useToggleFollow, useToggleLike, useToggleSave, type Post } from '@ezyify/core';
import { toast } from 'sonner';
import { SEO, SEOConfigs } from '../components/SEO';
import { CommentSheet } from '../components/CommentSheet';
import { EmptyContent } from '../components/EmptyStates';
import { Skeleton } from '../components/primitives/Skeleton';
import { QueryError } from '../components/QueryError';
import { LoopProgressBar } from '../components/loops/LoopProgressBar';
import { LoopCaption } from '../components/loops/LoopCaption';
import { LoopActionRail } from '../components/loops/LoopActionRail';
import { ShoppableProductSheet } from '../components/loops/ShoppableProductSheet';

function LoopsSkeleton() {
  return <div className="fixed inset-0 bg-background p-4"><Skeleton className="h-full w-full rounded-card" /></div>;
}

export default function LoopsPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const reduce = useReducedMotion();
  const loopsQuery = useLoops();
  const authStatus = useAuth(state => state.status);
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const toggleFollow = useToggleFollow();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [progress, setProgress] = useState(0);
  const [tab, setTab] = useState<'following' | 'for-you'>('for-you');
  const [commentSheetOpen, setCommentSheetOpen] = useState(false);
  const [productSheetOpen, setProductSheetOpen] = useState(false);
  const [following, setFollowing] = useState<Set<string>>(new Set());
  const containerRef = useRef<HTMLDivElement>(null);

  const allLoops = flattenPages<Post>(loopsQuery.data);
  const startId = searchParams.get('start') ?? searchParams.get('v');
  const orderedLoops = useMemo(() => {
    const start = startId ? allLoops.find(loop => loop.id === startId) : undefined;
    return start ? [start, ...allLoops.filter(loop => loop.id !== start.id)] : allLoops;
  }, [allLoops, startId]);
  const displayedLoops = tab === 'following' ? orderedLoops.filter(loop => following.has(loop.author.username)) : orderedLoops;
  const currentLoop = displayedLoops[currentIndex];

  useEffect(() => {
    setCurrentIndex(index => Math.min(index, Math.max(0, displayedLoops.length - 1)));
  }, [displayedLoops.length]);

  useEffect(() => {
    if (!currentLoop || reduce) return;
    const timer = window.setInterval(() => {
      setProgress(value => {
        if (value < 100) return value + 1;
        if (currentIndex < displayedLoops.length - 1) setCurrentIndex(currentIndex + 1);
        return 0;
      });
    }, 50);
    return () => window.clearInterval(timer);
  }, [currentIndex, currentLoop, displayedLoops.length, reduce]);

  useEffect(() => {
    if (currentIndex === displayedLoops.length - 1 && loopsQuery.hasNextPage && !loopsQuery.isFetchingNextPage) {
      void loopsQuery.fetchNextPage();
    }
  }, [currentIndex, displayedLoops.length, loopsQuery]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const onScroll = () => {
      const index = Math.round(container.scrollTop / container.clientHeight);
      if (index !== currentIndex) {
        setCurrentIndex(index);
        setProgress(0);
      }
    };
    container.addEventListener('scroll', onScroll, { passive: true });
    return () => container.removeEventListener('scroll', onScroll);
  }, [currentIndex]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowUp' && event.key !== 'ArrowDown') return;
      event.preventDefault();
      const delta = event.key === 'ArrowDown' ? 1 : -1;
      const next = Math.min(Math.max(0, currentIndex + delta), Math.max(0, displayedLoops.length - 1));
      setCurrentIndex(next);
      setProgress(0);
      containerRef.current?.children[next]?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [currentIndex, displayedLoops.length, reduce]);

  const requireAuth = useCallback((next: string) => {
    if (authStatus === 'authenticated') return true;
    navigate('/login', { state: { next } });
    return false;
  }, [authStatus, navigate]);

  const share = useCallback(async (loop: Post) => {
    const url = `${window.location.origin}/loops?start=${loop.id}`;
    try {
      if (navigator.share) await navigator.share({ title: `Loop by ${loop.author.name}`, url });
      else await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      // Sharing can be cancelled by the user.
    }
  }, []);

  if (loopsQuery.isLoading && !allLoops.length) return <LoopsSkeleton />;
  if (loopsQuery.error && !allLoops.length) return <div className="fixed inset-0 grid place-items-center bg-background p-4"><QueryError error={loopsQuery.error} onRetry={() => void loopsQuery.refetch()} /></div>;
  if (!allLoops.length) return <div className="fixed inset-0 grid place-items-center bg-background p-4"><EmptyContent /></div>;

  return (
    <div className="fixed inset-0 overflow-hidden bg-black">
      <SEO {...SEOConfigs.loops} />
      <div ref={containerRef} className="h-dvh snap-y snap-mandatory overflow-y-scroll scrollbar-hide">
        {displayedLoops.map((loop, index) => {
          const media = loop.media[0];
          const active = index === currentIndex;
          const description = loop.caption ? `Loop by @${loop.author.username}: ${loop.caption}` : `Loop by @${loop.author.username}`;
          return (
            <motion.article
              key={loop.id}
              className="relative flex h-dvh w-full snap-start items-center justify-center overflow-hidden"
              initial={reduce ? false : { opacity: 0 }}
              animate={{ opacity: active ? 1 : 0.5 }}
              transition={{ duration: 0.3 }}
              aria-label={description}
            >
              {media.type === 'video' ? (
                <video autoPlay={active} muted={isMuted} loop playsInline poster={media.thumbnailUrl ?? undefined} aria-label={description} className="absolute inset-0 size-full object-cover">
                  <source src={media.url} />
                </video>
              ) : (
                <img src={media.url} alt={description} className="absolute inset-0 size-full object-cover" />
              )}
              <div className="absolute inset-0 z-[5] bg-gradient-to-t from-black/70 via-transparent to-black/30" />
              <div className="absolute left-0 right-0 z-20 flex items-center justify-between px-4" style={{ top: 'calc(var(--safe-top) + 12px)' }}>
                <button onClick={() => navigate(-1)} className="flex size-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50" aria-label="Back"><ChevronLeft className="size-5" /></button>
                <div className="flex gap-1 rounded-full bg-black/30 p-1 backdrop-blur-md" role="tablist">
                  {(['following', 'for-you'] as const).map(value => <button key={value} role="tab" aria-selected={tab === value} onClick={() => { setTab(value); setCurrentIndex(0); }} className={`h-9 rounded-full px-4 text-sm font-semibold transition-all ${tab === value ? 'bg-white/90 text-black' : 'text-white/80 hover:text-white'}`}>{value === 'following' ? 'Following' : 'For You'}</button>)}
                </div>
                <button onClick={() => navigate('/search')} className="flex size-11 items-center justify-center rounded-full bg-white/20 text-white backdrop-blur-sm transition-colors hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50" aria-label="Search"><Search className="size-5" /></button>
              </div>
              <div className="absolute bottom-2 right-4 z-20"><button onClick={() => setIsMuted(value => !value)} className="flex size-11 items-center justify-center rounded-full border border-white/20 bg-black/30 text-white backdrop-blur-sm transition-colors hover:bg-black/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50" aria-label={isMuted ? 'Unmute' : 'Mute'}>{isMuted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}</button></div>
              <LoopCaption username={loop.author.username} verified={loop.author.verified} text={`${loop.caption} ${loop.hashtags.map(tag => `#${tag}`).join(' ')}`} sound="Original sound" />
              {active && <LoopActionRail avatar={avatarUrlFor(loop.author)} username={loop.author.username} isFollowing={following.has(loop.author.username)} likes={loop.engagement.likes} isLiked={loop.engagement.isLiked} comments={loop.engagement.comments} isSaved={loop.engagement.isSaved} productCount={loop.taggedProductIds.length} onToggleFollow={() => { if (!requireAuth(`/loops?start=${loop.id}`)) return; const isFollowing = following.has(loop.author.username); setFollowing(items => { const next = new Set(items); isFollowing ? next.delete(loop.author.username) : next.add(loop.author.username); return next; }); toggleFollow.mutate({ username: loop.author.username, following: isFollowing }); }} onToggleLike={() => { if (requireAuth(`/loops?start=${loop.id}`)) toggleLike.mutate({ id: loop.id, liked: loop.engagement.isLiked }); }} onOpenComments={() => setCommentSheetOpen(true)} onToggleSave={() => { if (requireAuth(`/loops?start=${loop.id}`)) toggleSave.mutate({ id: loop.id, saved: loop.engagement.isSaved }); }} onShare={() => void share(loop)} onOpenProducts={() => setProductSheetOpen(true)} />}
              {active && <LoopProgressBar progress={progress} />}
              {active && <span className="sr-only">{formatCompactNumber(loop.engagement.views ?? 0)} views</span>}
            </motion.article>
          );
        })}
        {tab === 'following' && !displayedLoops.length && <div className="grid h-dvh place-items-center bg-background p-4"><EmptyContent /></div>}
      </div>
      {currentLoop && <CommentSheet open={commentSheetOpen} onOpenChange={setCommentSheetOpen} post={currentLoop} />}
      {currentLoop && <ShoppableProductSheet open={productSheetOpen} onOpenChange={setProductSheetOpen} productIds={currentLoop.taggedProductIds} />}
    </div>
  );
}
