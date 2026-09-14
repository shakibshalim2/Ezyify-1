import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import {
  ArrowLeft,
  Bookmark,
  Heart,
  MessageCircle,
  MoreHorizontal,
  Send,
  Share2,
  ShoppingBag,
} from 'lucide-react';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { FollowButton } from '../components/FollowButton';
import { ImageWithFallback } from '../components/figma/ImageWithFallback';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { EmptyState } from '../components/primitives/EmptyState';
import { Field } from '../components/primitives/Field';
import { Skeleton } from '../components/primitives/Skeleton';
import { mockPosts, mockProducts } from '../data/enhanced-mock-data';
import { posts as feedPosts } from '../data/posts';
import { products as catalogProducts } from '../data/products';
import { fadeUp, staggerContainer } from '../lib/motion';

function PostSkeleton() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-6">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <Skeleton className="aspect-[4/5] w-full rounded-card" />
        <Card className="space-y-5">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-40 w-full" />
        </Card>
      </div>
    </div>
  );
}

const comments = [
  {
    id: '1',
    name: 'Sofia Rose',
    handle: '@sofiarose',
    text: 'The details are so good. Added it to my wishlist!',
    time: '18m',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
  },
  {
    id: '2',
    name: 'Jordan Lee',
    handle: '@jordancreates',
    text: 'Need the full styling breakdown please.',
    time: '42m',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
  },
];

interface PostView {
  id: string;
  author: { username: string; avatar: string; verified: boolean };
  content: { text: string; media: { url: string | string[] } };
  engagement: { likes: number; comments: number; shares: number; saves: number };
  taggedProducts: string[];
  timestamp: string;
  hashtags: string[];
}

/** The feed and explore pages link to `data/posts` ids while the rich mock set lives in
 *  `enhanced-mock-data`; normalise both shapes so any linked post opens. */
function resolvePost(id?: string): PostView | undefined {
  if (!id) return undefined;
  const rich = mockPosts.find(item => item.id === id);
  if (rich) return rich;
  const feed = feedPosts.find(item => item.id === id);
  if (!feed) return undefined;
  const text = feed.content.text ?? '';
  return {
    id: feed.id,
    author: { username: feed.user.username, avatar: feed.user.avatar, verified: feed.user.verified },
    content: { text, media: { url: feed.content.images?.[0] ?? feed.content.video ?? '' } },
    engagement: { likes: feed.likes, comments: feed.comments, shares: feed.shares, saves: 0 },
    taggedProducts: feed.taggedProducts ?? [],
    timestamp: feed.timestamp,
    hashtags: (text.match(/#\w+/g) ?? []).map(t => t.slice(1)),
  };
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [liked, setLiked] = useState(false);
  const [saved, setSaved] = useState(false);
  const [message, setMessage] = useState('');
  const [thread, setThread] = useState(comments);
  const post = useMemo(() => resolvePost(id), [id]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setFailed(!post);
      setLoading(false);
    }, 120);
    return () => window.clearTimeout(timer);
  }, [post]);

  if (loading) return <PostSkeleton />;
  if (failed || !post)
    return (
      <div className="min-h-screen bg-background px-4 py-10">
        <SEO title="Post not found — Ezyify" description="This post is unavailable." />
        <EmptyState
          kind="error"
          title="This post is unavailable"
          description="It may have been removed or the link is incorrect."
          action={
            <Button asChild>
              <Link to="/explore">Explore posts</Link>
            </Button>
          }
        />
      </div>
    );

  const media = Array.isArray(post.content.media.url)
    ? post.content.media.url[0]
    : post.content.media.url;
  const tagged = [...mockProducts, ...catalogProducts]
    .filter(product => post.taggedProducts.includes(product.id))
    .slice(0, 4)
    .map(product => ({ id: product.id, name: product.name, price: product.price, image: product.image }));
  const submitComment = () => {
    if (!message.trim()) return;
    setThread((current) => [
      ...current,
      {
        id: String(Date.now()),
        name: 'You',
        handle: '@you',
        text: message.trim(),
        time: 'now',
        avatar: 'https://images.unsplash.com/photo-1632163506775-db3341414ffb?w=100',
      },
    ]);
    setMessage('');
    toast.success('Comment posted');
  };

  return (
    <div className="min-h-screen bg-background">
      <SEO title={`@${post.author.username} on Ezyify`} description={post.content.text} />
      <motion.main
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-8"
      >
        <motion.div variants={fadeUp} className="mb-4 flex items-center justify-between lg:hidden">
          <Button aria-label="Go back" variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft />
          </Button>
          <Button aria-label="More post options" variant="ghost" size="icon">
            <MoreHorizontal />
          </Button>
        </motion.div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <motion.section variants={fadeUp} className="space-y-3 lg:sticky lg:top-20">
            <div className="relative overflow-hidden rounded-card bg-muted">
              <ImageWithFallback
                src={media}
                alt={`Post by ${post.author.username}`}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
              <div className="absolute bottom-3 left-3 flex max-w-[calc(100%-1.5rem)] gap-2 overflow-x-auto">
                {tagged.slice(0, 2).map((product) => (
                  <Link
                    key={product.id}
                    to={`/product/${product.id}`}
                    className="inline-flex shrink-0 items-center gap-2 rounded-full bg-card/95 px-3 py-2 text-xs font-semibold text-foreground shadow-lg backdrop-blur"
                  >
                    <ShoppingBag className="size-3.5 text-primary" />
                    {product.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-between rounded-card border border-border bg-card p-2">
              <div className="flex items-center gap-1">
                <Button
                  aria-label={liked ? 'Unlike post' : 'Like post'}
                  variant="ghost"
                  size="icon"
                  onClick={() => setLiked((v) => !v)}
                  className={liked ? 'text-error' : ''}
                >
                  <Heart className={liked ? 'fill-error text-error animate-heart-pop' : ''} />
                </Button>
                <Button
                  aria-label="Jump to comments"
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    document.getElementById('comments')?.scrollIntoView({ behavior: 'smooth' })
                  }
                >
                  <MessageCircle />
                </Button>
                <Button
                  aria-label="Share post"
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    navigator.clipboard?.writeText(window.location.href);
                    toast.success('Post link copied');
                  }}
                >
                  <Share2 />
                </Button>
              </div>
              <Button
                aria-label={saved ? 'Remove from saved' : 'Save post'}
                variant="ghost"
                size="icon"
                onClick={() => {
                  setSaved((v) => !v);
                  toast.success(saved ? 'Removed from saved' : 'Saved for later');
                }}
                className={saved ? 'text-primary' : ''}
              >
                <Bookmark className={saved ? 'fill-current' : ''} />
              </Button>
            </div>
          </motion.section>

          <motion.aside variants={fadeUp} className="min-w-0 space-y-5">
            <Card className="space-y-4">
              <div className="flex items-start gap-3">
                <Link to={`/profile/${post.author.username}`}>
                  <ImageWithFallback
                    src={post.author.avatar}
                    alt=""
                    loading="lazy"
                    className="size-11 rounded-full object-cover"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/profile/${post.author.username}`}
                    className="flex items-center gap-1 font-semibold text-foreground"
                  >
                    <span className="truncate">@{post.author.username}</span>
                    {post.author.verified && <VerifiedBadge size="sm" />}
                  </Link>
                  <p className="text-xs text-foreground-secondary">{post.timestamp}</p>
                </div>
                <FollowButton username={post.author.username} variant="compact" />
              </div>
              <p className="text-sm leading-relaxed text-foreground">
                {post.content.text.split(/(#[\w]+)/g).map((part, index) =>
                  part.startsWith('#') ? (
                    <span key={index} className="font-medium text-primary">
                      {part}
                    </span>
                  ) : (
                    part
                  ),
                )}
              </p>
              <div className="flex gap-4 text-xs text-foreground-secondary">
                <span>{(post.engagement.likes / 1000).toFixed(1)}K likes</span>
                <span>{post.engagement.comments} comments</span>
                <span>{post.engagement.saves} saves</span>
              </div>
            </Card>
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-semibold">Shop the post</h2>
                <Link className="text-sm font-medium text-primary" to="/shop">
                  See all
                </Link>
              </div>
              {tagged.length ? (
                <div className="flex gap-3 overflow-x-auto pb-1">
                  {tagged.map((product) => (
                    <Link
                      key={product.id}
                      to={`/product/${product.id}`}
                      className="w-40 shrink-0 overflow-hidden rounded-card border border-border bg-card"
                    >
                      <ImageWithFallback
                        src={product.image}
                        alt=""
                        loading="lazy"
                        className="aspect-square w-full object-cover"
                      />
                      <div className="space-y-1 p-3">
                        <p className="line-clamp-2 text-sm font-medium">{product.name}</p>
                        <p className="font-display font-bold tabular-nums text-accent-brand">
                          ${product.price}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  kind="orders"
                  title="No products tagged"
                  description="This creator has not linked any products to this post."
                />
              )}
            </section>
            <section id="comments" className="space-y-3">
              <h2 className="font-display text-lg font-semibold">
                Comments <span className="text-foreground-secondary">{thread.length}</span>
              </h2>
              {thread.length ? (
                <div className="space-y-4">
                  {thread.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <ImageWithFallback
                        src={item.avatar}
                        alt=""
                        loading="lazy"
                        className="size-9 rounded-full object-cover"
                      />
                      <div className="min-w-0">
                        <p className="text-sm">
                          <span className="font-semibold">{item.name}</span>{' '}
                          <span className="text-foreground-secondary">{item.handle}</span>
                        </p>
                        <p className="text-sm text-foreground-secondary">{item.text}</p>
                        <p className="mt-1 text-xs text-foreground-tertiary">{item.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  compact
                  kind="feed"
                  title="Start the conversation"
                  description="Be the first to leave a thoughtful comment."
                />
              )}
            </section>
          </motion.aside>
        </div>
      </motion.main>
      <form
        onSubmit={(event) => {
          event.preventDefault();
          submitComment();
        }}
        className="sticky bottom-[calc(var(--nav-height)+var(--safe-bottom))] z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:bottom-0"
      >
        <div className="mx-auto flex max-w-7xl items-end gap-2">
          <Field
            label="Add a comment"
            hideLabel
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Add a comment…"
            containerClassName="flex-1"
          />
          <Button aria-label="Post comment" type="submit" size="icon" disabled={!message.trim()}>
            <Send />
          </Button>
        </div>
      </form>
    </div>
  );
}
