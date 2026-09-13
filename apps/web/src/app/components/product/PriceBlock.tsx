import { motion, useReducedMotion } from 'motion/react';
import { fadeUp } from '../../lib/motion';
import { cn } from '../ui/utils';

interface PriceBlockProps {
  price: number;
  originalPrice?: number;
  sold?: number;
  rating: number;
  reviewCount: number;
}

export function PriceBlock({
  price,
  originalPrice,
  sold,
  rating,
  reviewCount,
}: PriceBlockProps) {
  const discount = originalPrice ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;
  const reduce = useReducedMotion();

  return (
    <motion.div
      initial={reduce ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, delay: 0.1 }}
      className="space-y-4"
    >
      {/* Rating row */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map(star => (
            <span
              key={star}
              className={cn(
                'size-4 rounded-sm',
                star <= Math.floor(rating)
                  ? 'bg-amber-400'
                  : star <= Math.ceil(rating)
                  ? 'bg-gradient-to-r from-amber-400 to-transparent'
                  : 'bg-border'
              )}
            />
          ))}
        </div>
        <span className="text-sm font-semibold text-foreground">
          {rating.toFixed(1)}
        </span>
        <span className="text-sm text-foreground-secondary">
          ({reviewCount.toLocaleString()} reviews)
        </span>
        {sold && (
          <>
            <span className="text-foreground-tertiary">•</span>
            <span className="text-sm text-accent-brand font-semibold">
              {sold.toLocaleString()}+ sold
            </span>
          </>
        )}
      </div>

      {/* Price */}
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="font-display text-2xl font-bold text-foreground tabular-nums">
          ${price.toFixed(2)}
        </span>
        {originalPrice && (
          <>
            <span className="text-lg text-foreground-tertiary line-through tabular-nums">
              ${originalPrice.toFixed(2)}
            </span>
            {discount > 0 && (
              <span className="inline-block px-2.5 py-1 rounded-full text-sm font-semibold bg-accent-brand text-accent-brand-foreground">
                -{discount}%
              </span>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
