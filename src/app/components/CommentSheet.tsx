import { memo } from 'react';
import React, { useState, useRef, useMemo } from 'react';
import { X, Heart, Send, Smile, CornerDownRight, ShoppingBag, Star } from 'lucide-react';
import { Link } from 'react-router';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { VisuallyHidden } from './ui/visually-hidden';
import { VerifiedBadge } from './VerifiedBadge';
import { getProductById } from '../data/products';

interface Comment {
  id: string;
  user: {
    username: string;
    name: string;
    avatar: string;
    verified: boolean;
  };
  text: string;
  likes: number;
  timestamp: string;
  isLiked?: boolean;
}

interface CommentSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: {
    id: string;
    user: {
      name: string;
      avatar: string;
      verified?: boolean;
    };
    content: {
      text?: string;
      images?: string[];
    };
    comments: number;
    taggedProducts?: string[];
  };
}

// Mock comments — in production these come from API per post ID
const getMockComments = (postId: string): Comment[] => [
  {
    id: `${postId}-c1`,
    user: { username: 'sarah_j', name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', verified: false },
    text: 'Love this! Where did you get that? 😍',
    likes: 45,
    timestamp: '2h ago',
    isLiked: false,
  },
  {
    id: `${postId}-c2`,
    user: { username: 'mike_design', name: 'Mike Chen', avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150', verified: true },
    text: 'This is absolutely stunning! The quality looks amazing 🔥',
    likes: 89,
    timestamp: '4h ago',
    isLiked: true,
  },
  {
    id: `${postId}-c3`,
    user: { username: 'emma_style', name: 'Emma Wilson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', verified: false },
    text: 'Need this in my life right now!',
    likes: 23,
    timestamp: '5h ago',
    isLiked: false,
  },
  {
    id: `${postId}-c4`,
    user: { username: 'alex_t', name: 'Alex Turner', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', verified: true },
    text: 'Great content as always! Keep it up 👏',
    likes: 27,
    timestamp: '6h ago',
    isLiked: false,
  },
  {
    id: `${postId}-c5`,
    user: { username: 'lisa_m', name: 'Lisa Martinez', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', verified: false },
    text: "Just ordered mine! Can't wait 🎉",
    likes: 34,
    timestamp: '8h ago',
    isLiked: false,
  },
];

export const CommentSheet = memo(function CommentSheet({ open, onOpenChange, post }: CommentSheetProps) {
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const [localComments, setLocalComments] = useState<Comment[]>(() => getMockComments(post.id));
  const inputRef = useRef<HTMLInputElement>(null);

  const taggedProductObjects = useMemo(() =>
    (post.taggedProducts ?? [])
      .map(id => getProductById(id))
      .filter(Boolean) as NonNullable<ReturnType<typeof getProductById>>[],
    [post.taggedProducts]
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const trimmed = commentText.trim();
    if (!trimmed) return;
    setLocalComments(prev => [...prev, {
      id: Date.now().toString(),
      user: { username: 'you', name: 'You', avatar: 'https://images.unsplash.com/photo-1758521541720-1809f58388c2?w=50', verified: false },
      text: trimmed,
      likes: 0,
      timestamp: 'just now',
      isLiked: false,
    }]);
    setCommentText('');
    setReplyingTo(null);
  };

  const handleReply = (username: string) => {
    setReplyingTo(username);
    setCommentText(`@${username} `);
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  const cancelReply = () => {
    setReplyingTo(null);
    // Remove @username prefix if it's still exactly the reply prefix
    setCommentText(prev => prev === `@${replyingTo} ` ? '' : prev);
  };

  const toggleCommentLike = (commentId: string) => {
    setLikedComments(prev => {
      const s = new Set(prev);
      s.has(commentId) ? s.delete(commentId) : s.add(commentId);
      return s;
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[90vh] sm:h-[85vh] p-0 flex flex-col">
        <VisuallyHidden>
          <SheetTitle>Comments on {post.user.name}'s post</SheetTitle>
        </VisuallyHidden>
        <VisuallyHidden>
          <SheetDescription>
            View and add comments. {post.comments} {post.comments === 1 ? 'comment' : 'comments'} total.
          </SheetDescription>
        </VisuallyHidden>

        {/* Header with post preview */}
        <div className="flex-shrink-0 border-b border-border bg-card">
          <div className="flex justify-center py-2 sm:hidden">
            <div className="w-10 h-1 bg-muted-foreground/30 rounded-full" />
          </div>
          <div className="p-4 flex items-start gap-3">
            <img loading="lazy" src={post.user.avatar} alt={post.user.name}
              className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="font-semibold text-foreground">{post.user.name}</span>
                {post.user.verified && <VerifiedBadge />}
              </div>
              {post.content.text && (
                <p className="text-sm text-foreground line-clamp-2">{post.content.text}</p>
              )}
            </div>
            {post.content.images?.[0] && (
              <img loading="lazy" src={post.content.images[0]} alt=""
                className="w-12 h-12 rounded object-cover flex-shrink-0" />
            )}
          </div>
          <div className="px-4 pb-3">
            <p className="text-sm text-muted-foreground font-medium">
              {post.comments.toLocaleString()} {post.comments === 1 ? 'comment' : 'comments'}
            </p>
          </div>
        </div>

        {/* Tagged Products — before comments */}
        {taggedProductObjects.length > 0 && (
          <div className="flex-shrink-0 border-b border-border bg-muted/30 px-4 py-3">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide mb-2.5 flex items-center gap-1.5">
              <ShoppingBag className="w-3.5 h-3.5" /> Tagged Products
            </p>
            <div className="space-y-2">
              {taggedProductObjects.map(product => (
                <Link
                  key={product.id}
                  to={`/product/${product.id}`}
                  onClick={() => onOpenChange(false)}
                  className="flex items-center gap-3 p-2 rounded-xl hover:bg-card/80 active:bg-card/80 transition-colors group"
                >
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted flex-shrink-0">
                    <img
                      loading="lazy"
                      src={product.image}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground line-clamp-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-sm font-bold text-primary">${product.price}</span>
                      <div className="flex items-center gap-0.5">
                        <Star className="w-3 h-3 fill-primary text-primary" />
                        <span className="text-xs text-muted-foreground">{product.rating}</span>
                      </div>
                    </div>
                  </div>
                  <ShoppingBag className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Comments list */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {localComments.map((item) => {
            const isLiked = likedComments.has(item.id) || item.isLiked;
            return (
              <div key={item.id} className="flex items-start gap-3">
                <img loading="lazy" src={item.user.avatar} alt={item.user.name}
                  className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="bg-muted rounded-2xl px-4 py-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm text-foreground">{item.user.name}</span>
                      {item.user.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-sm text-foreground break-words">{item.text}</p>
                  </div>
                  <div className="flex items-center gap-4 mt-1.5 px-4">
                    <span className="text-xs text-muted-foreground">{item.timestamp}</span>
                    <button
                      onClick={() => toggleCommentLike(item.id)}
                      className={`text-xs font-medium transition-colors ${
                        isLiked ? 'text-error' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {isLiked ? 'Liked' : 'Like'}
                    </button>
                    <button
                      onClick={() => handleReply(item.user.username)}
                      className="text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
                    >
                      Reply
                    </button>
                    {(isLiked || item.likes > 0) && (
                      <div className="flex items-center gap-1">
                        <Heart className="w-3 h-3 fill-red-500 text-error" />
                        <span className="text-xs text-muted-foreground">
                          {likedComments.has(item.id) && !item.isLiked
                            ? item.likes + 1
                            : item.likes}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {localComments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-muted-foreground text-sm">No comments yet</p>
              <p className="text-muted-foreground text-xs mt-1">Be the first to comment!</p>
            </div>
          )}
        </div>

        {/* Comment input */}
        <div className="flex-shrink-0 border-t border-border bg-card pb-safe">
          {/* Replying-to indicator */}
          {replyingTo && (
            <div className="flex items-center justify-between px-4 pt-2 pb-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CornerDownRight className="w-3 h-3" />
                <span>Replying to <span className="font-semibold text-foreground">@{replyingTo}</span></span>
              </div>
              <button onClick={cancelReply} className="text-muted-foreground hover:text-foreground transition-colors">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
          <form onSubmit={handleSubmit} className="flex items-center gap-2 p-4 pt-2">
            <button
              type="button"
              className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-muted transition-colors flex-shrink-0"
            >
              <Smile className="w-5 h-5 text-muted-foreground" />
            </button>
            <input
              ref={inputRef}
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder={replyingTo ? `Reply to @${replyingTo}…` : 'Add a comment...'}
              className="flex-1 bg-input-background border border-border rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary placeholder:text-muted-foreground transition-all"
            />
            <button
              type="submit"
              disabled={!commentText.trim()}
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
