import { Heart, MessageCircle, ShoppingCart, Check } from 'lucide-react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { Button } from '../primitives/Button';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { springSnappy } from '../../lib/motion';

interface StickyActionBarProps {
  productId: string;
  isInWishlist: boolean;
  isInCart: boolean;
  onToggleWishlist: () => void;
  onBuyNow: () => void;
  onAddToCart: () => void;
}

export function StickyActionBar({
  productId,
  isInWishlist,
  isInCart,
  onToggleWishlist,
  onBuyNow,
  onAddToCart,
}: StickyActionBarProps) {
  const [showAdded, setShowAdded] = useState(false);
  const reduce = useReducedMotion();

  const handleAddToCart = () => {
    onAddToCart();
    setShowAdded(true);
    setTimeout(() => setShowAdded(false), 1200);
  };

  return (
    <motion.div
      initial={reduce ? {} : { y: 80 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3, type: 'spring', damping: 25 }}
      className="fixed inset-x-0 bottom-[calc(var(--nav-height)+var(--safe-bottom))] lg:static bg-background-elevated border-t border-border px-4 py-3 space-y-2.5"
    >
      {/* Icon buttons row */}
      <div className="flex gap-2.5">
        <motion.button
          type="button"
          onClick={onToggleWishlist}
          whileTap={reduce ? {} : { scale: 0.95 }}
          transition={springSnappy}
          aria-label={isInWishlist ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-pressed={isInWishlist}
          className="size-11 rounded-xl border border-border bg-background flex items-center justify-center text-foreground hover:bg-background-elevated transition-colors"
        >
          <Heart
            className={`size-5 ${isInWishlist ? 'fill-like text-like' : ''}`}
          />
        </motion.button>
        <motion.button
          type="button"
          onClick={() => toast.success('Chat feature coming soon')}
          whileTap={reduce ? {} : { scale: 0.95 }}
          transition={springSnappy}
          aria-label="Chat with seller"
          className="size-11 rounded-xl border border-border bg-background flex items-center justify-center text-foreground hover:bg-background-elevated transition-colors"
        >
          <MessageCircle className="size-5" />
        </motion.button>

        {/* Add to cart button with morph */}
        <AnimatePresence mode="wait" initial={false}>
          {showAdded ? (
            <motion.button
              key="added"
              type="button"
              disabled
              initial={reduce ? {} : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduce ? {} : { scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex-1 h-11 rounded-xl bg-success text-success-foreground flex items-center justify-center gap-2 font-semibold text-sm focus-visible:ring-2 focus-visible:ring-ring outline-none"
            >
              <Check className="size-4" strokeWidth={3} />
              Added
            </motion.button>
          ) : (
            <motion.button
              key="add"
              type="button"
              onClick={handleAddToCart}
              initial={reduce ? {} : { scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={reduce ? {} : { scale: 0.8, opacity: 0 }}
              whileTap={reduce ? {} : { scale: 0.95 }}
              transition={springSnappy}
              aria-label="Add to cart"
              className="flex-1 h-11 rounded-xl border border-border bg-background text-foreground hover:border-border-strong transition-colors font-semibold text-sm inline-flex items-center justify-center gap-2 focus-visible:ring-2 focus-visible:ring-ring outline-none"
            >
              <ShoppingCart className="size-[18px]" />
              Add to cart
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* Buy now button */}
      <motion.div
        whileTap={reduce ? {} : { scale: 0.98 }}
        transition={springSnappy}
      >
        <Button
          variant="gradient"
          size="lg"
          fullWidth
          onClick={onBuyNow}
        >
          Buy now
        </Button>
      </motion.div>
    </motion.div>
  );
}
