import { useCallback, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import {
  BookmarkPlus,
  Check,
  ChevronLeft,
  ChevronRight,
  Heart,
  MessageCircle,
  Repeat2,
  Share2,
  ShoppingBag,
  ShoppingCart,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import {
  avatarUrlFor,
  formatCompactNumber,
  formatMoney,
  useProduct,
  useProfile,
  useToggleFollow,
  useToggleLike,
  useToggleSave,
  type Post,
} from '@ezyify/core';
import { toast } from 'sonner';
import { CommentSheet } from './CommentSheet';
import { RepostSheet } from './RepostSheet';
import { VerifiedBadge } from './VerifiedBadge';
import { Img } from './primitives/Img';
import { useAddLine, useAuthed, useInCart } from '../lib/data';
import { formErrors } from '../lib/apiErrors';

function ProductTag({ id }: { id: string }) {
  const { data: product } = useProduct(id);
  const { add, pending } = useAddLine();
  const inCart = useInCart().has(id);
  if (!product) return null;
  const addToCart = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await add(id, 1);
      toast.success(`${product.name} added to cart`);
    } catch (error) {
      toast.error(formErrors(error).message ?? 'Couldn’t add this item to your cart');
    }
  };
  return (
    <div className="flex items-center gap-2 rounded-xl border border-border bg-card p-2">
      <Img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        className="size-12 rounded-lg object-cover"
      />
      <Link to={`/product/${id}`} className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold">{product.name}</p>
        <p className="text-sm font-bold text-primary">{formatMoney(product.price)}</p>
      </Link>
      <button
        type="button"
        onClick={addToCart}
        disabled={pending || !product.inStock}
        aria-label={inCart ? 'In cart' : `Add ${product.name} to cart`}
        className="flex size-10 items-center justify-center rounded-xl bg-muted text-foreground transition-colors hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
      >
        {inCart ? <Check className="size-4" /> : <ShoppingCart className="size-4" />}
      </button>
    </div>
  );
}

interface PostViewerProps {
  post: Post;
  onClose?: () => void;
}

/** Full-screen core-post lightbox used by Explore; mutations remain API-backed. */
export function PostViewer({ post, onClose }: PostViewerProps) {
  const navigate = useNavigate();
  const authed = useAuthed();
  const like = useToggleLike();
  const save = useToggleSave();
  const follow = useToggleFollow();
  const profile = useProfile(post.author.username);
  const { data: author } = profile;
  const [mediaIndex, setMediaIndex] = useState(0);
  const [commentsOpen, setCommentsOpen] = useState(false);
  const [repostOpen, setRepostOpen] = useState(false);
  const [reposted, setReposted] = useState(false);
  const lastTap = useRef(0);
  const media = post.media.map((item) => item.thumbnailUrl ?? item.url);
  const currentMedia = media[mediaIndex];
  const avatar = avatarUrlFor(post.author, 96);
  const requireAuth = () => {
    if (authed) return true;
    onClose?.();
    navigate('/login', { state: { next: `/post/${post.id}` } });
    return false;
  };
  const toggleLike = useCallback(() => {
    if (!requireAuth()) return;
    like.mutate({ id: post.id, liked: post.engagement.isLiked });
  }, [authed, post.id, post.engagement.isLiked]);
  const toggleSave = useCallback(() => {
    if (!requireAuth()) return;
    save.mutate({ id: post.id, saved: post.engagement.isSaved });
  }, [authed, post.id, post.engagement.isSaved]);
  const doubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 350 && !post.engagement.isLiked && authed)
      like.mutate({ id: post.id, liked: false });
    lastTap.current = now;
  };
  const share = async () => {
    const url = `${window.location.origin}/post/${post.id}`;
    try {
      if (navigator.share) await navigator.share({ title: `${post.author.name} on Ezyify`, url });
      else {
        await navigator.clipboard.writeText(url);
        toast.success('Link copied');
      }
    } catch {
      // Share sheets can be dismissed without an error state for the post.
    }
  };
  const openProfile = () => {
    onClose?.();
    navigate(`/profile/${post.author.username}`);
  };
  const toggleFollow = () => {
    if (!requireAuth()) return;
    follow.mutate({ username: post.author.username, following: !!author?.isFollowing });
  };

  return (
    <div className="flex h-full flex-col overflow-hidden bg-background">
      <header className="flex shrink-0 items-center gap-3 border-b border-border px-4 py-3">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close post viewer"
          className="flex size-10 items-center justify-center rounded-xl text-foreground-secondary hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" />
        </button>
        <button
          type="button"
          onClick={openProfile}
          className="flex min-w-0 flex-1 items-center gap-2.5 text-left"
        >
          <Img
            src={avatar}
            alt={`${post.author.name}'s avatar`}
            className="size-9 rounded-full object-cover"
          />
          <span className="min-w-0">
            <span className="flex items-center gap-1 truncate text-sm font-semibold">
              {post.author.name}
              {post.author.verified && <VerifiedBadge size="sm" />}
            </span>
            <span className="block truncate text-xs text-foreground-secondary">
              @{post.author.username}
            </span>
          </span>
        </button>
        <button
          type="button"
          onClick={toggleFollow}
          aria-pressed={!!author?.isFollowing}
          className="inline-flex h-9 items-center gap-1 rounded-lg border border-border px-3 text-sm font-semibold hover:bg-muted"
        >
          {author?.isFollowing ? <UserCheck className="size-4" /> : <UserPlus className="size-4" />}
          {author?.isFollowing ? 'Following' : 'Follow'}
        </button>
      </header>
      <main className="flex-1 overflow-y-auto">
        <div className="relative aspect-square bg-muted" onClick={doubleTap}>
          {currentMedia && (
            <Img
              src={currentMedia}
              alt={post.caption || `${post.author.name}'s post`}
              className="size-full object-contain"
            />
          )}
          {media.length > 1 && (
            <>
              <button
                type="button"
                onClick={() => setMediaIndex((index) => Math.max(0, index - 1))}
                disabled={mediaIndex === 0}
                aria-label="Previous image"
                className="absolute left-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 disabled:opacity-40"
              >
                <ChevronLeft className="size-5" />
              </button>
              <button
                type="button"
                onClick={() => setMediaIndex((index) => Math.min(media.length - 1, index + 1))}
                disabled={mediaIndex === media.length - 1}
                aria-label="Next image"
                className="absolute right-3 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-background/80 disabled:opacity-40"
              >
                <ChevronRight className="size-5" />
              </button>
            </>
          )}
        </div>
        <section className="space-y-4 p-4">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={toggleLike}
              aria-label={post.engagement.isLiked ? 'Unlike post' : 'Like post'}
              aria-pressed={post.engagement.isLiked}
              className={`flex size-11 items-center justify-center rounded-xl ${post.engagement.isLiked ? 'text-like' : 'text-foreground-secondary hover:bg-muted'}`}
            >
              <Heart className={`size-5 ${post.engagement.isLiked ? 'fill-current' : ''}`} />
            </button>
            <button
              type="button"
              onClick={() => setCommentsOpen(true)}
              aria-label="Open comments"
              className="flex size-11 items-center justify-center rounded-xl text-foreground-secondary hover:bg-muted"
            >
              <MessageCircle className="size-5" />
            </button>
            <button
              type="button"
              onClick={() => setRepostOpen(true)}
              aria-label="Repost"
              className="flex size-11 items-center justify-center rounded-xl text-foreground-secondary hover:bg-muted"
            >
              <Repeat2 className="size-5" />
            </button>
            <button
              type="button"
              onClick={share}
              aria-label="Share post"
              className="flex size-11 items-center justify-center rounded-xl text-foreground-secondary hover:bg-muted"
            >
              <Share2 className="size-5" />
            </button>
            <button
              type="button"
              onClick={toggleSave}
              aria-label={post.engagement.isSaved ? 'Unsave post' : 'Save post'}
              aria-pressed={post.engagement.isSaved}
              className={`ml-auto flex size-11 items-center justify-center rounded-xl ${post.engagement.isSaved ? 'text-primary' : 'text-foreground-secondary hover:bg-muted'}`}
            >
              <BookmarkPlus className={`size-5 ${post.engagement.isSaved ? 'fill-current' : ''}`} />
            </button>
          </div>
          <p className="text-sm font-semibold">
            {formatCompactNumber(post.engagement.likes)} likes ·{' '}
            {formatCompactNumber(post.engagement.comments)} comments
          </p>
          {post.caption && (
            <p className="text-sm leading-relaxed text-foreground">{post.caption}</p>
          )}
          {post.taggedProductIds.length > 0 && (
            <div className="space-y-2">
              <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-foreground-secondary">
                <ShoppingBag className="size-4" /> Tagged products
              </p>
              {post.taggedProductIds.map((id) => (
                <ProductTag key={id} id={id} />
              ))}
            </div>
          )}
        </section>
      </main>
      <CommentSheet open={commentsOpen} onOpenChange={setCommentsOpen} post={post} />
      <RepostSheet
        open={repostOpen}
        onOpenChange={setRepostOpen}
        post={{
          id: post.id,
          user: {
            name: post.author.name,
            username: post.author.username,
            avatar,
            verified: post.author.verified,
          },
          content: { text: post.caption, images: media },
        }}
        isReposted={reposted}
        onRepost={() => {
          setReposted(true);
          setRepostOpen(false);
          toast.success('Reposted to your followers');
        }}
        onUndoRepost={() => {
          setReposted(false);
          setRepostOpen(false);
          toast.success('Repost removed');
        }}
      />
    </div>
  );
}
