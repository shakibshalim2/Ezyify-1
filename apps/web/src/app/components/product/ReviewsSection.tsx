import { Star, ThumbsUp } from 'lucide-react';
import { Link } from 'react-router';
import { motion, useReducedMotion } from 'motion/react';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { VerifiedBadge } from '../VerifiedBadge';
import { Card } from '../ui/card';
import { fadeUp, staggerContainer } from '../../lib/motion';
import { cn } from '../ui/utils';

interface Review {
  id: string;
  user: {
    name: string;
    avatar: string;
    verified?: boolean;
  };
  rating: number;
  text: string;
  date: string;
  helpful: number;
}

interface ReviewsSectionProps {
  reviews: Review[];
  stats: {
    average: number;
    total: number;
    /** Omitted when the API only exposes the aggregate. */
    distribution?: Record<number, number>;
  };
}

export function ReviewsSection({ reviews, stats }: ReviewsSectionProps) {
  const reduce = useReducedMotion();
  const firstThree = reviews.slice(0, 3);
  const hasMore = reviews.length > 3;

  return (
    <motion.div
      initial={reduce ? {} : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      <h2 className="font-display text-lg font-semibold text-foreground">Customer Reviews</h2>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Overall rating */}
        <Card>
          <div className="p-4 space-y-2 text-center">
            <div className="text-3xl font-display font-bold text-foreground">
              {stats.average.toFixed(1)}
            </div>
            <div className="flex justify-center gap-0.5 mb-2">
              {[1, 2, 3, 4, 5].map(star => (
                <span
                  key={star}
                  className={cn(
                    'size-3.5 rounded-sm',
                    star <= Math.floor(stats.average)
                      ? 'bg-amber-400'
                      : star <= Math.ceil(stats.average)
                      ? 'bg-gradient-to-r from-amber-400 to-transparent'
                      : 'bg-border'
                  )}
                />
              ))}
            </div>
            <p className="text-xs text-foreground-secondary">
              {stats.total.toLocaleString()} reviews
            </p>
          </div>
        </Card>

        {/* Distribution */}
        {stats.distribution && <Card>
          <div className="p-4 space-y-1.5">
            {[5, 4, 3, 2, 1].map(rating => {
              const count = stats.distribution?.[rating] || 0;
              const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
              return (
                <div key={rating} className="flex items-center gap-2 text-xs">
                  <span className="w-6 font-semibold text-foreground">{rating}★</span>
                  <div className="flex-1 h-1.5 bg-border rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6, delay: 0.1 }}
                      className="h-full bg-primary rounded-full"
                    />
                  </div>
                  <span className="w-8 text-right text-foreground-secondary">
                    {count > 0 ? `${Math.round(percentage)}%` : '—'}
                  </span>
                </div>
              );
            })}
          </div>
        </Card>}
      </div>

      {/* Individual reviews */}
      <motion.div
        variants={staggerContainer(reduce ? 0 : 0.05)}
        initial="hidden"
        animate="visible"
        className="space-y-4"
      >
        {reviews.length === 0 && (
          <p className="rounded-card border border-dashed border-border px-4 py-6 text-center text-sm text-foreground-secondary">
            No written reviews yet — be the first after your order is delivered.
          </p>
        )}
        {firstThree.map(review => (
          <motion.div key={review.id} variants={fadeUp}>
            <Card className="p-4">
              <div className="flex gap-3">
                <Avatar className="size-10 flex-shrink-0">
                  <AvatarImage src={review.user.avatar} alt={review.user.name} />
                  <AvatarFallback>{review.user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="font-semibold text-sm text-foreground">
                      {review.user.name}
                    </span>
                    {review.user.verified && <VerifiedBadge size="sm" />}
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex gap-0.5">
                      {[1, 2, 3, 4, 5].map(star => (
                        <span
                          key={star}
                          className={cn(
                            'size-3 rounded-sm',
                            star <= review.rating
                              ? 'bg-amber-400'
                              : 'bg-border'
                          )}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-foreground-secondary">{review.date}</span>
                  </div>
                  <p className="text-sm text-foreground leading-relaxed mb-2">
                    {review.text}
                  </p>
                  <button className="flex items-center gap-1.5 text-xs font-medium text-foreground-secondary hover:text-primary transition-colors">
                    <ThumbsUp className="size-3.5" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>

      {/* See all link */}
      {hasMore && (
        <motion.div initial={reduce ? {} : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Link
            to="#reviews"
            className="text-sm font-semibold text-primary hover:text-primary-hover transition-colors inline-flex items-center gap-1.5"
          >
            See all reviews ({reviews.length})
          </Link>
        </motion.div>
      )}
    </motion.div>
  );
}
