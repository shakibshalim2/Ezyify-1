import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ChevronLeft, ChevronRight, Heart, Send, X } from 'lucide-react';
import { avatarUrlFor, formatRelativeTime, useApi, useAuth, useStories, useToggleLike, type Post } from '@ezyify/core';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';
import { EmptyState } from '../components/primitives/EmptyState';
import { Field } from '../components/primitives/Field';
import { Button } from '../components/primitives/Button';

const IMAGE_DURATION = 5_000;

type StoryGroup = { username: string; author: Post['author']; stories: Post[] };

function groupStories(stories: Post[] | undefined): StoryGroup[] {
  return (stories ?? []).reduce<StoryGroup[]>((groups, story) => {
    const current = groups.find(group => group.username === story.author.username);
    if (current) current.stories.push(story);
    else groups.push({ username: story.author.username, author: story.author, stories: [story] });
    return groups;
  }, []);
}

export default function StoriesPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const storiesQuery = useStories();
  const api = useApi();
  const authStatus = useAuth(state => state.status);
  const toggleLike = useToggleLike();
  const groups = useMemo(() => groupStories(storiesQuery.data), [storiesQuery.data]);
  const [groupIndex, setGroupIndex] = useState(0);
  const [storyIndex, setStoryIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [dragY, setDragY] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    const index = groups.findIndex(group => group.username === username);
    setGroupIndex(index >= 0 ? index : 0);
    setStoryIndex(0);
    setProgress(0);
  }, [groups, username]);

  const group = groups[groupIndex];
  const currentStory = group?.stories[storyIndex];
  const close = () => navigate('/');
  const next = () => {
    if (!group) return close();
    setProgress(0);
    if (storyIndex < group.stories.length - 1) return setStoryIndex(index => index + 1);
    if (groupIndex < groups.length - 1) {
      setGroupIndex(index => index + 1);
      setStoryIndex(0);
      return;
    }
    close();
  };
  const previous = () => {
    setProgress(0);
    if (storyIndex > 0) return setStoryIndex(index => index - 1);
    if (groupIndex > 0) {
      const previousGroup = groups[groupIndex - 1];
      setGroupIndex(index => index - 1);
      setStoryIndex(Math.max(0, (previousGroup?.stories.length ?? 1) - 1));
      return;
    }
    close();
  };

  useEffect(() => {
    if (!currentStory || paused || reduce) return;
    const duration = currentStory.media[0]?.durationMs ?? IMAGE_DURATION;
    const started = Date.now() - progress * duration;
    const timer = window.setInterval(() => {
      const value = (Date.now() - started) / duration;
      if (value >= 1) {
        window.clearInterval(timer);
        next();
      } else setProgress(value);
    }, 50);
    return () => window.clearInterval(timer);
  }, [currentStory?.id, paused, reduce]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') { event.preventDefault(); next(); }
      if (event.key === 'ArrowLeft') { event.preventDefault(); previous(); }
      if (event.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [groupIndex, storyIndex, groups.length]);

  const sendReply = async () => {
    const text = message.trim();
    if (!text || !group || sending) return;
    if (authStatus !== 'authenticated') {
      navigate('/login', { state: { next: `/stories/${group.username}` } });
      return;
    }
    setSending(true);
    try {
      const conversation = await api.messaging.start(group.username);
      await api.messaging.send(conversation.id, { text });
      setMessage('');
      toast.success(`Reply sent to ${group.author.name}`);
    } catch {
      toast.error('Reply could not be sent. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (storiesQuery.isLoading) return <div className="fixed inset-0 grid place-items-center bg-black text-white">Loading stories…</div>;
  if (storiesQuery.error) return <div className="fixed inset-0 grid place-items-center bg-background p-4"><EmptyState kind="error" title="Stories are unavailable" description="Please try again in a moment." action={<Button onClick={() => void storiesQuery.refetch()}>Try again</Button>} /></div>;
  if (!currentStory || !group) return <div className="min-h-screen bg-background px-4 py-10"><EmptyState kind="search" title="No stories right now" description="Stories disappear after 24 hours. Explore fresh posts while you wait." action={<Button asChild><Link to="/">Back home</Link></Button>} /></div>;

  const media = currentStory.media[0];
  const mediaUrl = media.thumbnailUrl ?? media.url;
  const alt = currentStory.caption ? `Story by @${group.username}: ${currentStory.caption}` : `Story by @${group.username}`;
  return (
    <motion.div drag="y" dragConstraints={{ top: 0, bottom: 180 }} dragElastic={0.2} onDrag={(_, info) => setDragY(Math.max(0, info.offset.y))} onDragEnd={() => { if (dragY > 100) close(); setDragY(0); }} className="fixed inset-0 z-50 flex items-center justify-center bg-black" initial={reduce ? false : { y: 16, opacity: 0 }} animate={{ y: dragY, opacity: 1 }} transition={{ type: 'spring', stiffness: 300, damping: 25 }}>
      <SEO title={`${group.author.name}'s stories`} description="Watch stories on Ezyify" />
      <div className="absolute inset-0 overflow-hidden"><img src={mediaUrl} alt="" className="size-full scale-110 object-cover opacity-40 blur-xl" /></div>
      <div className="relative flex size-full max-w-md flex-col">
        <div className="absolute left-0 right-0 z-20 flex gap-1 px-3" style={{ top: 'calc(var(--safe-top) + 8px)' }} aria-label="Story progress">
          {group.stories.map((story, index) => <div key={story.id} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/30"><div className="h-full bg-white/90" style={{ width: `${index < storyIndex ? 100 : index === storyIndex ? Math.min(100, progress * 100) : 0}%` }} /></div>)}
        </div>
        <header className="absolute left-0 right-0 z-20 flex items-center justify-between px-4" style={{ top: 'calc(var(--safe-top) + 20px)' }}>
          <Link to={`/profile/${group.username}`} className="flex items-center gap-2"><img src={avatarUrlFor(group.author)} alt={group.author.name} className="size-10 rounded-full border-2 border-white/60 object-cover" /><div><p className="text-sm font-semibold text-white">{group.author.name}</p><p className="text-xs text-white/70">@{group.username} · {formatRelativeTime(currentStory.createdAt)}</p></div></Link>
          <button onClick={close} aria-label="Close stories" className="flex size-11 items-center justify-center rounded-full text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"><X className="size-5" /></button>
        </header>
        <div className="absolute inset-0 z-10 flex items-center justify-center">{media.type === 'video' ? <video autoPlay muted loop playsInline poster={media.thumbnailUrl ?? undefined} aria-label={alt} className="size-full object-contain"><source src={media.url} /></video> : <img src={media.url} alt={alt} className="size-full object-contain" />}<div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" /></div>
        <div className="absolute inset-y-28 left-0 z-15 flex w-[30%]" onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)}><button onClick={previous} aria-label="Previous story" className="flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"><ChevronLeft className="sr-only" /></button></div>
        <div className="absolute inset-y-28 right-0 z-15 flex w-[70%]" onPointerDown={() => setPaused(true)} onPointerUp={() => setPaused(false)}><button onClick={next} aria-label="Next story" className="flex-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"><ChevronRight className="sr-only" /></button></div>
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 pb-safe"><p className="mb-3 text-sm text-white drop-shadow">{currentStory.caption}</p><form onSubmit={event => { event.preventDefault(); void sendReply(); }} className="flex items-end gap-2"><Field label="Reply to story" hideLabel value={message} onChange={event => setMessage(event.target.value)} onFocus={() => setPaused(true)} onBlur={() => setPaused(false)} placeholder={`Reply to ${group.username}…`} containerClassName="mb-0 flex-1" className="border-white/20 bg-white/15 text-white placeholder:text-white/50 focus:border-white/40 focus:bg-white/20" /><button type="submit" disabled={!message.trim() || sending} aria-label="Send reply" className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50"><Send className="size-5" /></button><button type="button" aria-label={currentStory.engagement.isLiked ? 'Unlike story' : 'Like story'} onClick={() => { if (authStatus !== 'authenticated') { navigate('/login', { state: { next: `/stories/${group.username}` } }); return; } toggleLike.mutate({ id: currentStory.id, liked: currentStory.engagement.isLiked }); }} className={`flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/50 ${currentStory.engagement.isLiked ? 'border-like/60 bg-like/40 text-like' : 'border-white/20 bg-white/15 text-white hover:bg-white/25'}`}><Heart className={currentStory.engagement.isLiked ? 'fill-current size-5' : 'size-5'} /></button></form></div>
      </div>
    </motion.div>
  );
}
