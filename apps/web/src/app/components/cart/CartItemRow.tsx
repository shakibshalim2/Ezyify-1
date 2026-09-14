import { motion, useMotionValue, useReducedMotion, useTransform, type PanInfo } from 'motion/react';
import { Heart, Minus, Plus, Trash2 } from 'lucide-react';
import { Link } from 'react-router';
import { formatMoney, type CartItem } from '@ezyify/core';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { cn } from '../ui/utils';

interface CartItemRowProps {
  item: CartItem;
  /** Variant name resolved by the caller (server cart lines only carry the id). */
  variantLabel?: string | null;
  onQuantityChange: (delta: number) => void;
  onRemove: () => void;
  onSaveForLater?: () => void;
  busy?: boolean;
}

const REVEAL = 88;

/**
 * Cart line: quantity stepper, save‑for‑later and remove are always visible (touch‑friendly).
 * On touch, swiping left reveals a red delete zone; a fast/long swipe deletes directly.
 */
export function CartItemRow({ item, variantLabel, onQuantityChange, onRemove, onSaveForLater, busy }: CartItemRowProps) {
  const { product } = item;
  const reduce = useReducedMotion();
  // Swipe-to-delete is a touch idiom; on pointer devices the drag layer would swallow button clicks.
  const coarse = typeof window !== 'undefined' && window.matchMedia?.('(pointer: coarse)').matches;
  const draggable = !reduce && coarse;
  const x = useMotionValue(0);
  const deleteOpacity = useTransform(x, [-REVEAL, -20, 0], [1, 0.4, 0]);
  const deleteScale = useTransform(x, [-REVEAL, 0], [1, 0.6]);

  const onDragEnd = (_: unknown, info: PanInfo) => {
    if (info.offset.x < -160 || info.velocity.x < -700) onRemove();
  };

  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0, transition: { duration: 0.22 } }}
      transition={{ duration: 0.24 }}
      className="relative overflow-hidden border-b border-border last:border-b-0"
    >
      {/* Delete zone revealed by swipe */}
      <motion.button
        type="button"
        onClick={onRemove}
        aria-label={`Remove ${product.name}`}
        style={{ opacity: deleteOpacity }}
        className="absolute inset-y-0 right-0 flex w-[88px] items-center justify-center bg-destructive text-destructive-foreground"
      >
        <motion.span style={{ scale: deleteScale }}>
          <Trash2 className="size-5" />
        </motion.span>
      </motion.button>

      <motion.div
        drag={draggable ? 'x' : false}
        dragConstraints={{ left: -REVEAL, right: 0 }}
        dragElastic={0.12}
        dragSnapToOrigin={false}
        onDragEnd={onDragEnd}
        style={{ x }}
        className="relative flex gap-3 bg-card p-3 sm:p-4"
      >
        <Link to={`/product/${product.id}`} className="relative size-[88px] shrink-0 overflow-hidden rounded-xl bg-muted">
          <ImageWithFallback src={product.imageUrl} alt="" loading="lazy" className="size-full object-cover" />
          {product.badge && (
            <span className="absolute left-1.5 top-1.5 rounded-md bg-accent-brand px-1.5 py-0.5 text-[10px] font-bold uppercase text-accent-brand-foreground">
              {product.badge}
            </span>
          )}
        </Link>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground">{product.name}</h3>
              <p className="mt-0.5 text-xs text-foreground-tertiary">{product.seller.name}{variantLabel ? ` · ${variantLabel}` : ''}</p>
            </div>
            <button
              type="button"
              onClick={onRemove}
              aria-label={`Remove ${product.name}`}
              className="-mr-1 -mt-1 flex size-9 shrink-0 items-center justify-center rounded-lg text-foreground-tertiary transition hover:bg-muted hover:text-error"
            >
              <Trash2 className="size-4" />
            </button>
          </div>

          <div className="mt-auto flex items-center justify-between gap-2">
            <div className="min-w-0">
              <p className="font-display text-base font-bold tabular-nums text-foreground">
                {formatMoney({ amount: product.price.amount * item.quantity, currency: product.price.currency })}
              </p>
              {item.quantity > 1 && (
                <p className="text-[11px] font-medium tabular-nums text-foreground-tertiary">
                  {formatMoney(product.price)} each
                </p>
              )}
            </div>
            <div className="flex items-center rounded-full border border-border bg-background-elevated">
              <button
                type="button"
                onClick={() => onQuantityChange(-1)}
                disabled={busy}
                aria-label="Decrease quantity"
                className="flex size-10 items-center justify-center rounded-full text-foreground-secondary transition hover:bg-muted hover:text-foreground"
              >
                <Minus className="size-4" />
              </button>
              <span className="w-6 text-center text-sm font-semibold tabular-nums">{item.quantity}</span>
              <button
                type="button"
                onClick={() => onQuantityChange(1)}
                disabled={busy || item.quantity >= 99}
                aria-label="Increase quantity"
                className="flex size-10 items-center justify-center rounded-full text-foreground-secondary transition hover:bg-muted hover:text-foreground"
              >
                <Plus className="size-4" />
              </button>
            </div>
          </div>

          {onSaveForLater && (
            <button
              type="button"
              onClick={onSaveForLater}
              className={cn(
                'inline-flex h-8 w-fit items-center gap-1.5 rounded-full px-2.5 text-xs font-medium text-foreground-secondary transition hover:bg-muted hover:text-foreground',
              )}
            >
              <Heart className="size-3.5" />
              Save for later
            </button>
          )}
        </div>
      </motion.div>
    </motion.li>
  );
}
