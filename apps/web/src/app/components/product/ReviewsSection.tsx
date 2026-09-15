import { useState } from 'react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Star, BadgeCheck, Store } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, avatarUrlFor, formatTimeAgo, useAuth, useCreateReview, useProductReviews, type Review } from '@ezyify/core';
import { VerifiedBadge } from '../VerifiedBadge';
import { Card } from '../ui/card';
import { Button } from '../primitives/Button';
import { Skeleton } from '../primitives/Skeleton';
import { Img } from '../primitives/Img';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../ui/utils';

interface ReviewsSectionProps {
  productId: string;
  /** Aggregate from the product payload so the header renders before reviews load. */
  fallback: { average: number; total: number };
}

export function Stars({ value, size = 'size-3.5', label }: { value: number; size?: string; label?: string }) {
  return (
    <div className="flex gap-0.5" role="img" aria-label={label ?? `${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map(star => (
        <Star key={star} className={cn(size, star <= Math.round(value) ? 'fill-warning text-warning' : 'text-border')} aria-hidden />
      ))}
    </div>
  );
}

function StarPicker({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <div role="radiogroup" aria-label="Your rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          role="radio"
          aria-checked={value === star}
          aria-label={`${star} star${star > 1 ? 's' : ''}`}
          onMouseEnter={() => setHover(star)}
          onFocus={() => setHover(star)}
          onBlur={() => setHover(0)}
          onClick={() => onChange(star)}
          className="rounded-md p-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          <Star className={cn('size-7 transition-colors', star <= shown ? 'fill-warning text-warning' : 'text-border')} aria-hidden />
        </button>
      ))}
    </div>
  );
}

function WriteReview({ productId, onDone }: { productId: string; onDone: () => void }) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const create = useCreateReview(productId);
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rating) return setError('Pick a star rating first');
    setError(null);
    create.mutate(
      { rating, ...(text.trim() ? { text: text.trim() } : {}) },
      {
        onSuccess: () => { toast.success('Thanks — your review is live'); onDone(); },
        onError: err => setError(formErrors(err).message ?? formErrors(err).fields.text ?? 'Could not post your review'),
      },
    );
  };
  return (
    <Card className="p-4">
      <form onSubmit={submit} className="space-y-3" noValidate>
        <p className="font-semibold text-sm text-foreground">Write a review</p>
        <StarPicker value={rating} onChange={setRating} />
        <label className="block">
          <span className="sr-only">Your review</span>
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            rows={3}
            maxLength={2000}
            placeholder="What did you like? What could be better? (optional)"
            className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </label>
        {error && <p className="text-xs text-error" role="alert">{error}</p>}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={create.isPending}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={create.isPending}>Post review</Button>
        </div>
      </form>
    </Card>
  );
}

export function ReviewCard({ review, compact }: { review: Review; compact?: boolean }) {
  return (
    <Card className={cn(compact ? 'p-3' : 'p-4')} data-testid={`review-${review.id}`}>
      <div className="flex gap-3">
        <Img src={avatarUrlFor(review.user, 80)} alt="" className="size-10 rounded-full object-cover flex-shrink-0" loading="lazy" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-1 flex-wrap">
            <Link to={`/profile/${review.user.username}`} className="font-semibold text-sm text-foreground hover:underline">{review.user.name}</Link>
            {review.user.verified && <VerifiedBadge size="sm" />}
            {review.verifiedPurchase && (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success-subtle px-1.5 py-0.5 rounded-md"><BadgeCheck className="size-3" aria-hidden />Verified purchase</span>
            )}
          </div>
          <div className="flex items-center gap-2 mb-2">
            <Stars value={review.rating} size="size-3" />
            <time className="text-xs text-foreground-secondary" dateTime={review.createdAt}>{formatTimeAgo(review.createdAt)}</time>
          </div>
          {review.text && <p className="text-sm text-foreground leading-relaxed">{review.text}</p>}
          {review.reply && (
            <div className="mt-3 rounded-xl bg-background-elevated p-3 text-sm">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground-secondary mb-1"><Store className="size-3.5" aria-hidden />Seller reply · <time dateTime={review.reply.at}>{formatTimeAgo(review.reply.at)}</time></p>
              <p className="text-foreground">{review.reply.text}</p>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Product reviews on `GET /products/:id/reviews` with the one-per-buyer review form. */
export function ReviewsSection({ productId, fallback }: ReviewsSectionProps) {
  const reduce = useReducedMotion();
  const status = useAuth(s => s.status);
  const me = useAuth(s => s.user);
  const [writing, setWriting] = useState(false);
  const reviews = useProductReviews(productId, { pageSize: 10 });
  const stats = reviews.data?.stats ?? { average: fallback.average, total: fallback.total, distribution: undefined };
  const list = reviews.data?.items ?? [];
  const mine = me ? list.find(r => r.user.id === me.id) : undefined;
  const alreadyReviewed = !!mine;
  const canWrite = status === 'authenticated' && !alreadyReviewed;

  return (
    <motion.div id="reviews" initial={reduce ? {} : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="font-display text-lg font-semibold text-foreground">Customer reviews</h2>
        {canWrite && !writing && <Button variant="outline" size="sm" onClick={() => setWriting(true)}>Write a review</Button>}
        {status === 'anonymous' && <Button variant="ghost" size="sm" asChild><Link to="/login" state={{ next: `/product/${productId}` }}>Sign in to review</Link></Button>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <div className="p-4 space-y-2 text-center">
            <div className="text-3xl font-display font-bold text-foreground tabular-nums">{stats.total ? stats.average.toFixed(1) : '—'}</div>
            <div className="flex justify-center"><Stars value={stats.average} label={`Average ${stats.average.toFixed(1)} out of 5`} /></div>
            <p className="text-xs text-foreground-secondary">{stats.total.toLocaleString()} {stats.total === 1 ? 'review' : 'reviews'}</p>
          </div>
        </Card>
        <Card>
          <div className="p-4 space-y-1.5">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.distribution?.[String(rating) as '1' | '2' | '3' | '4' | '5'] ?? 0;
              const percentage = stats.total > 0 && stats.distribution ? (count / stats.total) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2 text-xs">
                  <span className="w-6 font-semibold text-foreground tabular-nums">{rating}★</span>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    {reviews.isLoading ? <Skeleton className="h-full w-1/2" /> : (
                      <motion.div initial={reduce ? false : { width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: 0.6, delay: 0.1 }} className="h-full bg-primary rounded-full" />
                    )}
                  </div>
                  <span className="w-8 text-right text-foreground-secondary tabular-nums">{count > 0 ? `${Math.round(percentage)}%` : '—'}</span>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      {writing && <WriteReview productId={productId} onDone={() => setWriting(false)} />}

      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="space-y-4">
        {reviews.isLoading ? (
          <div className="space-y-3" aria-busy>{[1, 2].map(i => <Skeleton key={i} className="h-24" />)}</div>
        ) : reviews.isError ? (
          <p className="text-sm text-foreground-secondary">
            {reviews.error instanceof ApiError ? reviews.error.message : 'Reviews are unavailable right now.'}{' '}
            <button type="button" className="text-primary hover:underline" onClick={() => void reviews.refetch()}>Retry</button>
          </p>
        ) : list.length === 0 ? (
          <p className="rounded-card border border-dashed border-border px-4 py-6 text-center text-sm text-foreground-secondary">
            No written reviews yet{canWrite ? ' — be the first.' : ' — be the first after your order is delivered.'}
          </p>
        ) : (
          list.map(review => (
            <motion.div key={review.id} variants={fadeUp}><ReviewCard review={review} /></motion.div>
          ))
        )}
      </motion.div>
      {reviews.data?.pagination.hasMore && <p className="text-xs text-foreground-secondary">Showing the {list.length} most recent of {stats.total} reviews.</p>}
    </motion.div>
  );
}
