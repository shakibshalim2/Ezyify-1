import { useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Link } from 'react-router';
import { Star, MessageCircle, Reply, BadgeCheck, Store } from 'lucide-react';
import { toast } from 'sonner';
import { ApiError, avatarUrlFor, formatTimeAgo, useAuth, useReplyReview, useSellerReviews, type SellerReview } from '@ezyify/core';
import { Button } from '../../components/primitives/Button';
import { Card } from '../../components/primitives/Card';
import { Skeleton } from '../../components/primitives/Skeleton';
import { EmptyState } from '../../components/primitives/EmptyState';
import { Img } from '../../components/primitives/Img';
import { QueryError } from '../../components/QueryError';
import { SellerLayout } from '../../components/SellerLayout';
import { SEO, SEOConfigs } from '../../components/SEO';
import { VerifiedBadge } from '../../components/VerifiedBadge';
import { Stars } from '../../components/product/ReviewsSection';
import { formErrors } from '../../lib/apiErrors';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../../components/ui/utils';

const FILTERS = [
  ['all', 'All'],
  ['unreplied', 'Awaiting reply'],
  ['low', '3★ and below'],
] as const;
type Filter = (typeof FILTERS)[number][0];

function ReplyBox({ review, onDone }: { review: SellerReview; onDone: () => void }) {
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const reply = useReplyReview();
  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (text.trim().length < 2) return setError('Write a short reply');
    setError(null);
    reply.mutate({ reviewId: review.id, text: text.trim() }, {
      onSuccess: () => { toast.success(`Replied to ${review.user.name}`); onDone(); },
      onError: err => setError(formErrors(err).message ?? formErrors(err).fields.text ?? 'Could not post reply'),
    });
  };
  return (
    <form onSubmit={submit} className="mt-3 space-y-2" noValidate>
      <label className="block">
        <span className="sr-only">Your reply</span>
        <textarea
          autoFocus
          value={text}
          onChange={e => setText(e.target.value)}
          rows={3}
          maxLength={1000}
          placeholder={`Reply publicly to ${review.user.name.split(' ')[0]}…`}
          className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-foreground-tertiary focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </label>
      {error && <p className="text-xs text-error" role="alert">{error}</p>}
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs text-foreground-tertiary">Replies are public and notify the buyer. Keep it kind and specific.</p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="sm" onClick={onDone} disabled={reply.isPending}>Cancel</Button>
          <Button type="submit" variant="primary" size="sm" loading={reply.isPending}>Post reply</Button>
        </div>
      </div>
    </form>
  );
}

function SellerReviewCard({ review }: { review: SellerReview }) {
  const [replying, setReplying] = useState(false);
  return (
    <Card variant="default" padding="md" data-testid={`seller-review-${review.id}`}>
      <div className="flex gap-3">
        <Img src={avatarUrlFor(review.user, 80)} alt="" className="size-10 rounded-full object-cover flex-shrink-0" loading="lazy" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div className="min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <Link to={`/profile/${review.user.username}`} className="font-semibold text-sm text-foreground hover:underline">{review.user.name}</Link>
                {review.user.verified && <VerifiedBadge size="sm" />}
                {review.verifiedPurchase && <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success-subtle px-1.5 py-0.5 rounded-md"><BadgeCheck className="size-3" aria-hidden />Verified purchase</span>}
              </div>
              <div className="flex items-center gap-2 mt-1">
                <Stars value={review.rating} size="size-3" />
                <time className="text-xs text-foreground-secondary" dateTime={review.createdAt}>{formatTimeAgo(review.createdAt)}</time>
              </div>
            </div>
            <Link to={`/product/${review.product.id}`} className="flex items-center gap-2 text-xs text-foreground-secondary hover:text-foreground min-w-0 max-w-56">
              <Img src={review.product.imageUrl} alt="" className="size-8 rounded-md object-cover shrink-0" loading="lazy" />
              <span className="truncate">{review.product.name}</span>
            </Link>
          </div>
          {review.text && <p className="text-sm text-foreground leading-relaxed mt-2">{review.text}</p>}
          {review.reply ? (
            <div className="mt-3 rounded-xl bg-background-elevated p-3 text-sm">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-foreground-secondary mb-1"><Store className="size-3.5" aria-hidden />Your reply · <time dateTime={review.reply.at}>{formatTimeAgo(review.reply.at)}</time></p>
              <p className="text-foreground">{review.reply.text}</p>
            </div>
          ) : replying ? (
            <ReplyBox review={review} onDone={() => setReplying(false)} />
          ) : (
            <Button variant="outline" size="sm" className="mt-3" leftIcon={<Reply className="size-4" aria-hidden />} onClick={() => setReplying(true)}>
              Reply
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

/** Seller reviews on `GET /seller/reviews` with public replies. */
export default function SellerReviews() {
  const reduce = useReducedMotion();
  const status = useAuth(s => s.status);
  const [filter, setFilter] = useState<Filter>('all');
  const [page, setPage] = useState(1);
  useEffect(() => setPage(1), [filter]);
  const reviews = useSellerReviews({ filter, page, pageSize: 20 });
  const data = reviews.data;
  const stats = data?.stats;

  return (
    <SellerLayout>
      <SEO {...SEOConfigs.reviews} />
      <motion.div variants={staggerContainer(reduce ? 0 : 0.05)} initial="hidden" animate="visible" className="space-y-6">
        <motion.div variants={fadeUp}>
          <h1 className="font-display text-2xl font-semibold text-foreground">Reviews</h1>
          <p className="text-sm text-foreground-secondary mt-1">Every review on your products. Replies are public and reach the buyer instantly.</p>
        </motion.div>

        {status === 'anonymous' || (reviews.error instanceof ApiError && reviews.error.code === 'UNAUTHORIZED') ? (
          <EmptyState kind="orders" title="Sign in to see reviews" description="Your product ratings and buyer feedback live here." action={<Button asChild><Link to="/login" state={{ next: '/seller/reviews' }}>Sign in</Link></Button>} />
        ) : reviews.isError && reviews.error instanceof ApiError && reviews.error.code === 'FORBIDDEN' ? (
          <EmptyState kind="orders" title="Seller account required" description="Open a store to collect and answer reviews." action={<Button variant="gradient" asChild><Link to="/sell-on-ezyify">Open a store</Link></Button>} />
        ) : (
          <>
            <motion.div variants={fadeUp} className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4" data-testid="reviews-stats">
              <Card variant="default" padding="md">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-primary-subtle flex items-center justify-center shrink-0"><Star className="size-5 text-primary fill-primary" aria-hidden /></div>
                  <div>
                    <p className="text-xs text-foreground-secondary">Average rating</p>
                    {stats ? <p className="font-display font-bold text-2xl text-foreground tabular-nums">{stats.total ? stats.average.toFixed(1) : '—'}</p> : <Skeleton className="h-8 w-12 mt-1" />}
                  </div>
                </div>
              </Card>
              <Card variant="default" padding="md">
                <div className="flex items-center gap-3">
                  <div className="size-10 rounded-lg bg-info-subtle flex items-center justify-center shrink-0"><MessageCircle className="size-5 text-info" aria-hidden /></div>
                  <div>
                    <p className="text-xs text-foreground-secondary">Total reviews</p>
                    {stats ? <p className="font-display font-bold text-2xl text-foreground tabular-nums">{stats.total}</p> : <Skeleton className="h-8 w-12 mt-1" />}
                  </div>
                </div>
              </Card>
              <Card variant="default" padding="md">
                <div className="flex items-center gap-3">
                  <div className={cn('size-10 rounded-lg flex items-center justify-center shrink-0', stats?.awaitingReply ? 'bg-warning-subtle' : 'bg-success-subtle')}><Reply className={cn('size-5', stats?.awaitingReply ? 'text-warning' : 'text-success')} aria-hidden /></div>
                  <div>
                    <p className="text-xs text-foreground-secondary">Awaiting reply</p>
                    {stats ? <p className="font-display font-bold text-2xl text-foreground tabular-nums">{stats.awaitingReply}</p> : <Skeleton className="h-8 w-12 mt-1" />}
                    {stats && stats.total > 0 && <p className="text-xs text-foreground-tertiary">{Math.round(stats.replyRate * 100)}% reply rate</p>}
                  </div>
                </div>
              </Card>
              <Card variant="default" padding="md">
                <p className="text-xs text-foreground-secondary mb-2">Distribution</p>
                {stats ? (
                  <div className="space-y-1">
                    {[5, 4, 3, 2, 1].map(r => {
                      const n = stats.distribution[String(r) as '1' | '2' | '3' | '4' | '5'] ?? 0;
                      return (
                        <div key={r} className="flex items-center gap-2 text-[11px]">
                          <span className="w-5 tabular-nums text-foreground">{r}★</span>
                          <div className="flex-1 h-1 bg-border rounded-full overflow-hidden"><div className="h-full bg-primary rounded-full" style={{ width: `${stats.total ? (n / stats.total) * 100 : 0}%` }} /></div>
                          <span className="w-4 text-right tabular-nums text-foreground-secondary">{n}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : <Skeleton className="h-16" />}
              </Card>
            </motion.div>

            <motion.div variants={fadeUp} className="flex gap-2 overflow-x-auto pb-1" role="group" aria-label="Filter reviews">
              {FILTERS.map(([id, label]) => (
                <button key={id} type="button" onClick={() => setFilter(id)} aria-pressed={filter === id} className={cn('px-4 py-2 rounded-full font-medium text-sm whitespace-nowrap transition-all', filter === id ? 'bg-primary text-primary-foreground' : 'bg-card border border-border text-foreground hover:bg-card-hover')}>
                  {label}
                  {id === 'unreplied' && stats?.awaitingReply ? <span className="ml-2 inline-flex items-center justify-center min-w-5 h-5 px-1 rounded-full text-xs font-semibold bg-foreground/10 tabular-nums">{stats.awaitingReply}</span> : null}
                </button>
              ))}
            </motion.div>

            <motion.div variants={fadeUp} role="region" aria-live="polite" aria-label="Review list">
              {reviews.isLoading ? (
                <div className="space-y-3" aria-busy>{[1, 2, 3].map(i => <Skeleton key={i} className="h-28" />)}</div>
              ) : reviews.isError || !data ? (
                <QueryError error={reviews.error} onRetry={() => void reviews.refetch()} />
              ) : data.items.length === 0 ? (
                <EmptyState kind="orders" title={filter === 'all' ? 'No reviews yet' : filter === 'unreplied' ? 'All caught up' : 'No low ratings'} description={filter === 'all' ? 'Reviews appear here once buyers rate your products.' : filter === 'unreplied' ? 'Every review has a reply. Nice.' : 'Nothing rated 3★ or below.'} compact />
              ) : (
                <div className={cn('space-y-3', reviews.isPlaceholderData && 'opacity-60 transition-opacity')}>
                  {data.items.map(r => <SellerReviewCard key={r.id} review={r} />)}
                  {data.pagination.total > data.pagination.pageSize && (
                    <div className="flex items-center justify-between pt-2 text-sm text-foreground-secondary">
                      <span>{(data.pagination.page - 1) * data.pagination.pageSize + 1}–{Math.min(data.pagination.page * data.pagination.pageSize, data.pagination.total)} of {data.pagination.total}</span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" disabled={data.pagination.page === 1} onClick={() => setPage(p => p - 1)}>Previous</Button>
                        <Button variant="outline" size="sm" disabled={!data.pagination.hasMore} onClick={() => setPage(p => p + 1)}>Next</Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </>
        )}
      </motion.div>
    </SellerLayout>
  );
}
