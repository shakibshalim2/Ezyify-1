import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowLeft, Bookmark, Heart, MapPin, MessageCircle, MoreHorizontal, Send, Share2 } from 'lucide-react';
import { avatarUrlFor, flattenPages, formatCompactNumber, formatRelativeTime, useAddComment, useAuth, useComments, usePost, useToggleFollow, useToggleLike, useToggleSave, useProduct, type Comment, type Post } from '@ezyify/core';
import { toast } from 'sonner';
import { SEO } from '../components/SEO';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { ProductCard } from '../components/shop/ProductCard';
import { Img } from '../components/primitives/Img';
import { Button } from '../components/primitives/Button';
import { Card } from '../components/primitives/Card';
import { EmptyState } from '../components/primitives/EmptyState';
import { Field } from '../components/primitives/Field';
import { Skeleton } from '../components/primitives/Skeleton';
import { QueryError } from '../components/QueryError';
import { formErrors } from '../lib/apiErrors';
import { fadeUp, staggerContainer } from '../lib/motion';

function PostSkeleton() {
  return <div className="mx-auto max-w-7xl px-4 py-6"><div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]"><Skeleton className="aspect-[4/5] w-full rounded-card" /><Card className="space-y-5"><Skeleton className="h-12 w-full" /><Skeleton className="h-20 w-full" /><Skeleton className="h-40 w-full" /></Card></div></div>;
}

function TaggedProduct({ id }: { id: string }) {
  const product = useProduct(id);
  if (!product.data) return product.isLoading ? <Skeleton className="h-48 rounded-card" /> : null;
  return <ProductCard product={product.data} size="small" />;
}

function CommentRow({ comment }: { comment: Comment }) {
  return (
    <article className="flex gap-3">
      <Link to={`/profile/${comment.author.username}`}><Img src={avatarUrlFor(comment.author)} alt="" loading="lazy" className="size-9 rounded-full object-cover" /></Link>
      <div className="min-w-0">
        <p className="text-sm"><Link to={`/profile/${comment.author.username}`} className="font-semibold hover:underline">{comment.author.name}</Link> <span className="text-foreground-secondary">@{comment.author.username}</span></p>
        <p className="text-sm text-foreground-secondary">{comment.text}</p>
        <p className="mt-1 text-xs text-foreground-tertiary">{formatRelativeTime(comment.createdAt)}{comment.likes > 0 ? ` · ${formatCompactNumber(comment.likes)} likes` : ''}</p>
      </div>
    </article>
  );
}

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const postQuery = usePost(id);
  const commentsQuery = useComments(id);
  const addComment = useAddComment(id ?? '');
  const authStatus = useAuth(state => state.status);
  const toggleLike = useToggleLike();
  const toggleSave = useToggleSave();
  const toggleFollow = useToggleFollow();
  const [message, setMessage] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const post = postQuery.data;
  const comments = flattenPages<Comment>(commentsQuery.data);
  const productIds = useMemo(() => post?.taggedProductIds ?? [], [post?.taggedProductIds]);

  const requireAuth = () => {
    if (authStatus === 'authenticated') return true;
    navigate('/login', { state: { next: `/post/${id ?? ''}` } });
    return false;
  };
  const share = async () => {
    if (!post) return;
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: `${post.author.name} on Ezyify`, text: post.caption, url });
      else await navigator.clipboard.writeText(url);
      toast.success('Link copied');
    } catch {
      // Sharing can be cancelled by the user.
    }
  };
  const submitComment = (event: FormEvent) => {
    event.preventDefault();
    const text = message.trim();
    if (!text) return;
    if (!requireAuth()) return;
    addComment.mutate(text, { onSuccess: () => { setMessage(''); toast.success('Comment posted'); }, onError: error => toast.error(formErrors(error).message ?? 'Comment not posted') });
  };

  if (postQuery.isLoading) return <PostSkeleton />;
  if (postQuery.error || !post) {
    return <div className="min-h-screen bg-background px-4 py-10"><SEO title="Post not found" description="This post is unavailable." /><EmptyState kind="search" title="This post is unavailable" description="It may have been removed or the link is incorrect." action={<Button asChild><Link to="/explore">Explore posts</Link></Button>} /></div>;
  }

  const media = post.media[0];
  const description = post.caption || `Post by ${post.author.name}`;
  return (
    <div className="min-h-screen bg-background">
      <SEO title={`@${post.author.username} on Ezyify`} description={post.caption} type="article" author={post.author.name} publishedTime={post.createdAt} tags={post.hashtags} image={media.thumbnailUrl ?? media.url} />
      <motion.main variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="mx-auto max-w-7xl px-4 py-4 lg:px-6 lg:py-8">
        <motion.div variants={fadeUp} className="mb-4 flex items-center justify-between lg:hidden"><Button aria-label="Go back" variant="ghost" size="icon" onClick={() => navigate(-1)}><ArrowLeft /></Button><Button aria-label="Report post" variant="ghost" size="icon" onClick={() => navigate(`/report-problem?type=post&id=${post.id}`)}><MoreHorizontal /></Button></motion.div>
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px] lg:items-start">
          <motion.section variants={fadeUp} className="space-y-3 lg:sticky lg:top-20">
            <div className="relative overflow-hidden rounded-card bg-muted">
              {media.type === 'video' ? <video controls playsInline poster={media.thumbnailUrl ?? undefined} aria-label={description} className="aspect-[4/5] w-full object-cover"><source src={media.url} /></video> : <Img src={media.url} alt={description} loading="eager" className="aspect-[4/5] w-full object-cover" />}
            </div>
            <div className="flex items-center justify-between rounded-card border border-border bg-card p-3 lg:hidden">
              <span className="text-sm text-foreground-secondary">{formatCompactNumber(post.engagement.likes)} likes</span>
              <div className="flex gap-1"><Button aria-label={post.engagement.isLiked ? 'Unlike post' : 'Like post'} variant="ghost" size="icon" onClick={() => requireAuth() && toggleLike.mutate({ id: post.id, liked: post.engagement.isLiked })}><Heart className={post.engagement.isLiked ? 'fill-like text-like' : ''} /></Button><Button aria-label={post.engagement.isSaved ? 'Unsave post' : 'Save post'} variant="ghost" size="icon" onClick={() => requireAuth() && toggleSave.mutate({ id: post.id, saved: post.engagement.isSaved })}><Bookmark className={post.engagement.isSaved ? 'fill-current' : ''} /></Button><Button aria-label="Share post" variant="ghost" size="icon" onClick={() => void share()}><Share2 /></Button></div>
            </div>
          </motion.section>
          <motion.aside variants={fadeUp} className="space-y-5">
            <Card className="space-y-4">
              <div className="flex items-start gap-3"><Link to={`/profile/${post.author.username}`}><Img src={avatarUrlFor(post.author)} alt={post.author.name} loading="lazy" className="size-11 rounded-full object-cover" /></Link><div className="min-w-0 flex-1"><div className="flex items-center gap-1"><Link to={`/profile/${post.author.username}`} className="font-semibold hover:underline">{post.author.name}</Link>{post.author.verified && <VerifiedBadge size="sm" />}</div><p className="text-sm text-foreground-secondary">@{post.author.username} · {formatRelativeTime(post.createdAt)}</p></div><Button size="sm" variant={isFollowing ? 'outline' : 'primary'} onClick={() => { if (!requireAuth()) return; setIsFollowing(value => !value); toggleFollow.mutate({ username: post.author.username, following: isFollowing }); }}>{isFollowing ? 'Following' : 'Follow'}</Button></div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground">{post.caption}</p>
              {post.hashtags.length > 0 && <div className="flex flex-wrap gap-2">{post.hashtags.map(tag => <Link key={tag} to={`/search?q=${encodeURIComponent(tag)}`} className="text-sm font-medium text-primary hover:underline">#{tag}</Link>)}</div>}
              {post.location && <p className="flex items-center gap-1 text-sm text-foreground-secondary"><MapPin className="size-4" />{post.location}</p>}
              <div className="hidden items-center justify-between border-t border-border pt-3 lg:flex"><div className="flex gap-4 text-sm text-foreground-secondary"><span>{formatCompactNumber(post.engagement.likes)} likes</span><span>{formatCompactNumber(post.engagement.comments)} comments</span></div><div className="flex gap-1"><Button aria-label={post.engagement.isLiked ? 'Unlike post' : 'Like post'} variant="ghost" size="icon" onClick={() => requireAuth() && toggleLike.mutate({ id: post.id, liked: post.engagement.isLiked })}><Heart className={post.engagement.isLiked ? 'fill-like text-like' : ''} /></Button><Button aria-label={post.engagement.isSaved ? 'Unsave post' : 'Save post'} variant="ghost" size="icon" onClick={() => requireAuth() && toggleSave.mutate({ id: post.id, saved: post.engagement.isSaved })}><Bookmark className={post.engagement.isSaved ? 'fill-current' : ''} /></Button><Button aria-label="Share post" variant="ghost" size="icon" onClick={() => void share()}><Share2 /></Button><Button aria-label="Report post" variant="ghost" size="icon" onClick={() => navigate(`/report-problem?type=post&id=${post.id}`)}><MoreHorizontal /></Button></div></div>
            </Card>
            <section className="space-y-3"><h2 className="font-display text-lg font-semibold">Tagged products</h2>{productIds.length ? <div className="grid grid-cols-2 gap-3">{productIds.map(productId => <TaggedProduct key={productId} id={productId} />)}</div> : <EmptyState compact kind="orders" title="No products tagged" description="This creator has not linked any products to this post." />}</section>
            <section id="comments" className="space-y-3"><h2 className="font-display text-lg font-semibold">Comments <span className="text-foreground-secondary">{post.engagement.comments}</span></h2>{commentsQuery.isLoading ? <div className="space-y-4">{[1, 2, 3].map(item => <Skeleton key={item} className="h-12 w-full" />)}</div> : commentsQuery.error ? <QueryError error={commentsQuery.error} onRetry={() => void commentsQuery.refetch()} /> : comments.length ? <div className="space-y-4">{comments.map(comment => <CommentRow key={comment.id} comment={comment} />)}</div> : <EmptyState compact kind="feed" title="Start the conversation" description="Be the first to leave a thoughtful comment." />}</section>
          </motion.aside>
        </div>
      </motion.main>
      <form onSubmit={submitComment} className="sticky bottom-[calc(var(--nav-height)+var(--safe-bottom))] z-20 border-t border-border bg-background/95 px-4 py-3 backdrop-blur lg:bottom-0"><div className="mx-auto flex max-w-7xl items-end gap-2"><Field label="Add a comment" hideLabel value={message} onChange={event => setMessage(event.target.value)} placeholder={authStatus === 'authenticated' ? 'Add a comment…' : 'Sign in to comment'} containerClassName="flex-1" /><Button aria-label="Post comment" type="submit" size="icon" disabled={!message.trim() || addComment.isPending}><Send /></Button></div></form>
    </div>
  );
}
