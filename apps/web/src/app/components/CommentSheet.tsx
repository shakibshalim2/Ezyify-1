import { memo, useRef, useState, type FormEvent } from 'react';
import { Send, ShoppingBag, Star } from 'lucide-react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { avatarUrlFor, formatCompactNumber, formatMoney, formatRelativeTime, useAddComment, useComments, useProduct, type Comment, type Post } from '@ezyify/core';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { VisuallyHidden } from './ui/visually-hidden';
import { VerifiedBadge } from './VerifiedBadge';
import { QueryError } from './QueryError';
import { Button } from './primitives/Button';
import { useAuthed, useInfiniteList } from '../lib/data';
import { formErrors } from '../lib/apiErrors';
import { Img } from './primitives/Img';

interface CommentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: Post;
}

const avatar = (u: { avatarUrl: string | null; name: string }) => avatarUrlFor(u, 64);

function TaggedProduct({ id, onNavigate }: { id: string; onNavigate: () => void }) {
  const { data: product } = useProduct(id);
  if (!product) return null;
  return (
    <Link to={`/product/${product.id}`} onClick={onNavigate} className="flex items-center gap-3 p-2 rounded-xl hover:bg-card/80 active:bg-card/80 transition-colors group">
      <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
        <Img loading="lazy" src={product.imageUrl} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">{product.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-sm font-bold text-primary">{formatMoney(product.price)}</span>
          <div className="flex items-center gap-0.5">
            <Star className="w-3 h-3 fill-primary text-primary" />
            <span className="text-xs text-muted-foreground">{product.rating.toFixed(1)}</span>
          </div>
        </div>
      </div>
      <ShoppingBag className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
    </Link>
  );
}

function CommentRow({ c, onReply }: { c: Comment; onReply: (username: string) => void }) {
  return (
    <div className="flex items-start gap-3">
      <Link to={`/profile/${c.author.username}`}>
        <Img loading="lazy" src={avatar(c.author)} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-muted rounded-2xl px-4 py-2.5">
          <div className="flex items-center gap-2 mb-1">
            <Link to={`/profile/${c.author.username}`} className="font-semibold text-sm text-foreground hover:underline">{c.author.name}</Link>
            {c.author.verified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-sm text-foreground break-words">{c.text}</p>
        </div>
        <div className="flex items-center gap-4 mt-1.5 px-4">
          <span className="text-xs text-muted-foreground">{formatRelativeTime(c.createdAt)}</span>
          <button type="button" onClick={() => onReply(c.author.username)} className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors">
            Reply
          </button>
          {c.likes > 0 && <span className="text-xs text-muted-foreground">{formatCompactNumber(c.likes)} likes</span>}
        </div>
      </div>
    </div>
  );
}

/** Comments for a post, loaded on open; posting requires sign-in. */
export const CommentSheet = memo(function CommentSheet({ open, onOpenChange, post }: CommentSheetProps) {
  const navigate = useNavigate();
  const authed = useAuthed();
  const comments = useComments(open ? post.id : undefined);
  const add = useAddComment(post.id);
  const { items, loadMore, hasMore, loadingMore } = useInfiniteList<Comment>(comments);
  const [text, setText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const image = post.media[0]?.thumbnailUrl ?? post.media[0]?.url;

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    if (!authed) {
      onOpenChange(false);
      navigate('/login', { state: { next: `/post/${post.id}` } });
      return;
    }
    add.mutate(trimmed, {
      onSuccess: () => setText(''),
      onError: err => toast.error(formErrors(err).message ?? 'Comment not posted'),
    });
  };

  const reply = (username: string) => {
    setText(`@${username} `);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] p-0 flex flex-col">
        <VisuallyHidden>
          <SheetTitle>Comments on {post.author.name}'s post</SheetTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <SheetDescription>
            View and add comments. {post.engagement.comments} {post.engagement.comments === 1 ? 'comment' : 'comments'} total.
          </SheetDescription>
        </VisuallyHidden>

        <div className="flex-shrink-0 border-b border-border bg-card">
          <div className="flex justify-center py-2 sm:hidden">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
          <div className="p-4 flex items-start gap-3">
            <Img loading="lazy" src={avatar(post.author)} alt="" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground">{post.author.name}</span>
                {post.author.verified && <VerifiedBadge />}
              </div>
              {post.caption && <p className="text-sm text-foreground line-clamp-2">{post.caption}</p>}
            </div>
            {image && <Img loading="lazy" src={image} alt="" className="w-12 h-12 rounded object-cover flex-shrink-0" />}
          </div>
          <div className="px-4 pb-3">
            <p className="text-sm text-muted-foreground font-medium">
              {post.engagement.comments.toLocaleString()} {post.engagement.comments === 1 ? 'comment' : 'comments'}
            </p>
          </div>
        </div>

        {post.taggedProductIds.length > 0 && (
          <div className="flex-shrink-0 border-b border-border bg-muted/30 px-4 py-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> Tagged products
            </p>
            <div className="space-y-2">
              {post.taggedProductIds.slice(0, 3).map(id => (
                <TaggedProduct key={id} id={id} onNavigate={() => onOpenChange(false)} />
              ))}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {comments.isLoading ? (
            <div className="space-y-4" aria-busy>
              {[0, 1, 2].map(i => (
                <div key={i} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
                  <div className="h-14 flex-1 rounded-2xl bg-muted animate-pulse" />
                </div>
              ))}
            </div>
          ) : comments.error ? (
            <QueryError error={comments.error} onRetry={() => void comments.refetch()} compact />
          ) : items.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No comments yet</p>
              <p className="text-muted-foreground text-xs mt-1">Be the first to comment!</p>
            </div>
          ) : (
            <>
              {items.map(c => <CommentRow key={c.id} c={c} onReply={reply} />)}
              {hasMore && (
                <div className="flex justify-center">
                  <Button variant="ghost" size="sm" loading={loadingMore} onClick={loadMore}>Load more</Button>
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex-shrink-0 border-t border-border bg-card pb-safe">
          <form onSubmit={submit} className="flex items-center gap-2 p-4">
            <input
              ref={inputRef}
              type="text"
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder={authed ? 'Add a comment…' : 'Sign in to comment'}
              aria-label="Add a comment"
              maxLength={1000}
              className="flex-1 bg-input-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground transition-all"
            />
            <button
              type="submit"
              disabled={!text.trim() || add.isPending}
              aria-label="Post comment"
              className="w-11 h-11 flex items-center justify-center rounded-full text-white shadow-brand hover:shadow-brand-lg transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              style={{ background: 'var(--brand-gradient)' }}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
});
