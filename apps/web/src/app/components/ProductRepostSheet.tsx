import { memo, useState } from 'react';
import { Repeat2, X, Send, Smile, CheckCircle2, Tag, Star } from 'lucide-react';
import { Sheet, SheetContent, SheetTitle, SheetDescription } from './ui/sheet';
import { VisuallyHidden } from './ui/visually-hidden';
import { VerifiedBadge } from './VerifiedBadge';
import { CommissionEngine } from '../services/referral';

const MAX_QUOTE_CHARS = 280;

export interface ProductRepostSheetProduct {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  image: string;
  category?: string;
  rating?: number;
  seller: {
    name: string;
    username?: string;
    verified?: boolean;
  };
}

interface ProductRepostSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: ProductRepostSheetProduct;
  isReposted: boolean;
  onRepost: (quoteText?: string) => void;
  onUndoRepost: () => void;
}

export const ProductRepostSheet = memo(function ProductRepostSheet({
  open,
  onOpenChange,
  product,
  isReposted,
  onRepost,
  onUndoRepost,
}: ProductRepostSheetProps) {
  const [mode, setMode] = useState<'options' | 'quote'>('options');
  const [quoteText, setQuoteText] = useState('');

  const charsLeft = MAX_QUOTE_CHARS - quoteText.length;
  const canPost = quoteText.trim().length > 0 && charsLeft >= 0;
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;
  const { amount: commissionPreview, rule } = CommissionEngine.preview(product.price, product.category);
  const commissionLabel = rule.type === 'percent'
    ? `${rule.rate}% commission`
    : `$${rule.rate} fixed commission`;

  const handleClose = () => {
    onOpenChange(false);
    setTimeout(() => { setMode('options'); setQuoteText(''); }, 300);
  };

  const handleDirectRepost = () => { onRepost(); handleClose(); };
  const handleUndoRepost   = () => { onUndoRepost(); handleClose(); };
  const handleQuoteSubmit  = () => { if (canPost) { onRepost(quoteText.trim()); handleClose(); } };

  // Shared product preview card
  const ProductPreview = ({ compact = false }: { compact?: boolean }) => (
    <div className={`flex items-center gap-3 ${compact ? '' : 'py-3 mb-3 border-b border-border/50'}`}>
      <div className="relative shrink-0">
        <img
          loading="lazy"
          src={product.image}
          alt={product.name}
          className={`rounded-xl object-cover ${compact ? 'w-14 h-14' : 'w-16 h-16'}`}
        />
        {discount >= 10 && (
          <span className="absolute -top-1.5 -left-1.5 text-[9px] font-bold bg-error text-error-foreground px-1.5 py-0.5 rounded-full">
            -{discount}%
          </span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className={`font-semibold text-foreground line-clamp-2 leading-snug ${compact ? 'text-[12px]' : 'text-[13px]'}`}>
          {product.name}
        </p>
        <div className="flex items-center gap-1.5 mt-0.5">
          <span className={`font-bold text-primary ${compact ? 'text-[13px]' : 'text-[14px]'}`}>
            ${product.price}
          </span>
          {product.originalPrice && (
            <span className="text-[11px] text-muted-foreground line-through">${product.originalPrice}</span>
          )}
        </div>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[11px] text-muted-foreground">by</span>
          <span className="text-[11px] font-medium text-foreground truncate">{product.seller.name}</span>
          {product.seller.verified && <VerifiedBadge size="sm" />}
        </div>
      </div>
      <Tag className="w-4 h-4 text-muted-foreground/40 shrink-0" />
    </div>
  );

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="p-0 flex flex-col rounded-t-2xl"
        style={{ maxHeight: mode === 'quote' ? '90vh' : 'auto' }}
      >
        <VisuallyHidden>
          <SheetTitle>Repost {product.name}</SheetTitle>
          <SheetDescription>
            Share this product with your followers. You may earn a referral commission if someone buys through your repost.
          </SheetDescription>
        </VisuallyHidden>

        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1 shrink-0">
          <div className="w-9 h-1 bg-muted-foreground/25 rounded-full" />
        </div>

        {mode === 'options' ? (
          <div className="px-4 pb-6 pt-2">
            {/* Product preview */}
            <ProductPreview />

            {/* Already reposted banner */}
            {isReposted && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <p className="text-[13px] font-medium text-emerald-600">You reposted this product</p>
              </div>
            )}

            {/* Commission preview */}
            <div className="flex items-center gap-2 mb-4 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/15">
              <Star className="w-4 h-4 text-primary shrink-0" />
              <p className="text-[12px] text-foreground/80 flex-1">
                Earn up to{' '}
                <span className="font-semibold text-primary">${commissionPreview.toFixed(2)}</span>
                {' '}if someone buys through your repost
              </p>
              <span className="text-[10px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                {commissionLabel}
              </span>
            </div>

            {/* Actions */}
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
                    <p className="text-[14px] font-semibold text-foreground">Repost Product</p>
                    <p className="text-[12px] text-muted-foreground/70">Share instantly — original seller stays credited</p>
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
                  <p className="text-[12px] text-muted-foreground/70">Add your recommendation or review</p>
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
          /* ── Quote compose view ─────────────────────────────────────────── */
          <div className="flex flex-col flex-1 overflow-hidden">
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

            <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
              <div className="flex items-start gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-primary/15 flex items-center justify-center shrink-0 mt-0.5 text-[14px] font-bold text-primary">
                  Y
                </div>
                <textarea
                  value={quoteText}
                  onChange={e => setQuoteText(e.target.value)}
                  placeholder="Say why you love this product…"
                  maxLength={MAX_QUOTE_CHARS + 20}
                  rows={3}
                  autoFocus
                  className="flex-1 bg-transparent resize-none text-[14px] text-foreground placeholder:text-muted-foreground/55 focus:outline-none leading-relaxed"
                />
              </div>

              {/* Embedded product card */}
              <div className="rounded-2xl border border-border/60 bg-muted/30 overflow-hidden p-3">
                <ProductPreview compact />
              </div>
            </div>

            <div className="shrink-0 border-t border-border bg-card px-4 py-3 flex items-center justify-between">
              <button type="button" className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors text-muted-foreground">
                <Smile className="w-4 h-4" />
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
