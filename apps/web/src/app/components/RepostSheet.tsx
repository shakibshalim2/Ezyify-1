import { memo, useState } from 'react';
import { Repeat2, X, Send, Smile, CheckCircle2 } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { VisuallyHidden } from './ui/visually-hidden';
import { VerifiedBadge } from './VerifiedBadge';

const MAX_QUOTE_CHARS = 280;

interface RepostSheetPost {
  id: string;
  user: {
    name: string;
    username: string;
    avatar: string;
    verified?: boolean;
  };
  content: {
    text?: string;
    images?: string[];
  };
}

interface RepostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  post: RepostSheetPost;
  isReposted: boolean;
  onRepost: (quoteText?: string) => void;
  onUndoRepost: () => void;
}

export const RepostSheet = memo(function RepostSheet({
  open,
  onOpenChange,
  post,
  isReposted,
  onRepost,
  onUndoRepost,
}: RepostSheetProps) {
  const [mode, setMode] = useState<'options' | 'quote'>('options');
  const [quoteText, setQuoteText] = useState('');

  const charsLeft = MAX_QUOTE_CHARS - quoteText.length;
  const canPost = quoteText.trim().length > 0 && charsLeft >= 0;

  const handleClose = () => {
    onOpenChange(false);
    // Reset mode after close animation
    setTimeout(() => { setMode('options'); setQuoteText(''); }, 300);
  };

  const handleDirectRepost = () => {
    onRepost();
    handleClose();
  };

  const handleUndoRepost = () => {
    onUndoRepost();
    handleClose();
  };

  const handleQuoteSubmit = () => {
    if (canPost) {
      onRepost(quoteText.trim());
      handleClose();
    }
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="p-0 flex flex-col rounded-t-2xl" style={{ maxHeight: mode === 'quote' ? '90vh' : 'auto' }}>
        <VisuallyHidden>
          <SheetTitle>Repost {post.user.name}'s post</SheetTitle>
          <SheetDescription>Repost or quote repost this content to share it with your followers.</SheetDescription>
        </VisuallyHidden>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-1 bg-muted-foreground/25 rounded-full" />
        </div>

        {mode === 'options' ? (
          /* ── Options view ────────────────────────────────────────────────── */
          <div className="px-4 pb-6 pt-2">
            {/* Post preview */}
            <div className="flex items-start gap-3 py-3 mb-3 border-b border-border/50">
              <img
                loading="lazy"
                src={post.user.avatar}
                alt={post.user.name}
                className="w-9 h-9 rounded-full object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5 mb-0.5">
                  <span className="text-[13px] font-semibold text-foreground truncate">{post.user.name}</span>
                  {post.user.verified && <VerifiedBadge size="sm" />}
                  <span className="text-[12px] text-muted-foreground/60">@{post.user.username}</span>
                </div>
                {post.content.text && (
                  <p className="text-[13px] text-foreground/80 line-clamp-2 leading-snug">{post.content.text}</p>
                )}
              </div>
              {post.content.images?.[0] && (
                <img
                  loading="lazy"
                  src={post.content.images[0]}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover shrink-0"
                />
              )}
            </div>

            {/* Already reposted banner */}
            {isReposted && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-[13px] font-medium text-emerald-600">You reposted this</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="space-y-2">
              {isReposted ? (
                <button
                  type="button"
                  onClick={handleUndoRepost}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border/70 bg-card hover:bg-muted/50 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Repeat2 className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">Undo Repost</p>
                    <p className="text-[12px] text-muted-foreground/70">Remove from your followers' feeds</p>
                  </div>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleDirectRepost}
                  className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-emerald-500/25 bg-emerald-500/5 hover:bg-emerald-500/10 transition-colors text-left"
                >
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/15 flex items-center justify-center shrink-0">
                    <Repeat2 className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">Repost</p>
                    <p className="text-[12px] text-muted-foreground/70">Share instantly with your followers</p>
                  </div>
                </button>
              )}

              <button
                type="button"
                onClick={() => setMode('quote')}
                className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl border border-border/70 bg-card hover:bg-muted/50 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Repeat2 className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-[14px] font-semibold text-foreground">Quote Repost</p>
                  <p className="text-[12px] text-muted-foreground/70">Add your own thoughts</p>
                </div>
              </button>

              <button
                type="button"
                onClick={handleClose}
                className="w-full px-4 py-3 rounded-2xl bg-muted/50 text-[14px] font-medium text-muted-foreground hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          /* ── Quote compose view ──────────────────────────────────────────── */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Quote header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 shrink-0">
              <button
                type="button"
                onClick={() => setMode('options')}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground"
              >
                <X className="w-4 h-4" />
              </button>
              <p className="text-[14px] font-semibold text-foreground">Quote Repost</p>
              <button
                type="button"
                onClick={handleQuoteSubmit}
                disabled={!canPost || charsLeft < 0}
                className="px-4 py-1.5 rounded-full text-[13px] font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90 active:scale-[0.96]"
                style={{ background: 'var(--brand-gradient)' }}
              >
                Post
              </button>
            </div>

            {/* Compose area */}
            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
              {/* Text input */}
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 text-[14px] font-bold text-primary">
                  Y
                </div>
                <textarea
                  value={quoteText}
                  onChange={e => setQuoteText(e.target.value)}
                  placeholder="Add your thoughts…"
                  maxLength={MAX_QUOTE_CHARS + 20}
                  rows={3}
                  autoFocus
                  className="flex-1 bg-transparent resize-none text-[14px] text-foreground placeholder:text-muted-foreground/55 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Embedded original post */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 overflow-hidden">
                <div className="flex items-start gap-3 p-3">
                  <img
                    loading="lazy"
                    src={post.user.avatar}
                    alt={post.user.name}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-[12px] font-semibold text-foreground truncate">{post.user.name}</span>
                      {post.user.verified && <VerifiedBadge size="sm" />}
                      <span className="text-[11px] text-muted-foreground/60">@{post.user.username}</span>
                    </div>
                    {post.content.text && (
                      <p className="text-[12px] text-foreground/75 line-clamp-3 leading-snug">{post.content.text}</p>
                    )}
                  </div>
                  {post.content.images?.[0] && (
                    <img
                      loading="lazy"
                      src={post.content.images[0]}
                      alt=""
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Bottom bar */}
            <div className="shrink-0 border-t border-border bg-card px-4 py-3 flex items-center justify-between">
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
                <Smile className="w-[18px] h-[18px]" />
              </button>
              <span className={`text-[12px] font-medium tabular-nums ${
                charsLeft < 0 ? 'text-destructive' : charsLeft < 20 ? 'text-orange-500' : 'text-muted-foreground/50'
              }`}>
                {charsLeft}
              </span>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
});
