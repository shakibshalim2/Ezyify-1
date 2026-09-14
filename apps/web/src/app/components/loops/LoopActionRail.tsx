import React from 'react';
import { Heart, MessageCircle, BookmarkPlus, Share2, ShoppingBag, Plus } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';

interface LoopActionRailProps {
  avatar: string;
  username: string;
  isFollowing: boolean;
  likes: number;
  isLiked: boolean;
  comments: number;
  isSaved: boolean;
  productCount: number;
  onToggleFollow: () => void;
  onToggleLike: () => void;
  onOpenComments: () => void;
  onToggleSave: () => void;
  onShare: () => void;
  onOpenProducts: () => void;
}

function ActionButton({
  icon: Icon,
  label,
  count,
  active = false,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  count?: number;
  active?: boolean;
  onClick: () => void;
}) {
  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      className="flex flex-col items-center gap-1 focus-visible:ring-2 focus-visible:ring-white/50 rounded-full outline-none"
      aria-label={label}
    >
      <div className="w-11 h-11 rounded-full bg-black/30 backdrop-blur-sm border border-white/20 flex items-center justify-center hover:bg-black/50 transition-colors">
        <Icon
          className={`w-6 h-6 ${
            active ? 'fill-like text-like' : 'text-white'
          }`}
        />
      </div>
      {count !== undefined && (
        <span className="text-white text-xs font-semibold tabular-nums leading-none">
          {count > 999 ? `${(count / 1000).toFixed(1)}K` : count}
        </span>
      )}
    </motion.button>
  );
}

export function LoopActionRail({
  avatar,
  username,
  isFollowing,
  likes,
  isLiked,
  comments,
  isSaved,
  productCount,
  onToggleFollow,
  onToggleLike,
  onOpenComments,
  onToggleSave,
  onShare,
  onOpenProducts,
}: LoopActionRailProps) {
  const reduce = useReducedMotion();

  return (
    <div className="fixed right-4 bottom-20 z-10 flex flex-col gap-4 items-center">
      {/* Follow button with badge */}
      <motion.button
        onClick={onToggleFollow}
        whileTap={reduce ? {} : { scale: 0.9 }}
        className="relative flex flex-col items-center gap-1 focus-visible:ring-2 focus-visible:ring-white/50 rounded-full outline-none"
        aria-label={isFollowing ? 'Unfollow' : 'Follow'}
      >
        <div className="w-11 h-11 rounded-full overflow-hidden border-2 border-white/40 hover:border-white transition-colors">
          <img
            loading="lazy"
            src={avatar}
            alt={username}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold border border-white/30">
          {isFollowing ? '✓' : <Plus className="w-3 h-3" />}
        </div>
      </motion.button>

      {/* Like */}
      <ActionButton
        icon={Heart}
        label="Like"
        count={likes}
        active={isLiked}
        onClick={onToggleLike}
      />

      {/* Comments */}
      <ActionButton
        icon={MessageCircle}
        label="Comment"
        count={comments}
        onClick={onOpenComments}
      />

      {/* Save */}
      <ActionButton
        icon={BookmarkPlus}
        label="Save"
        active={isSaved}
        onClick={onToggleSave}
      />

      {/* Share */}
      <ActionButton
        icon={Share2}
        label="Share"
        onClick={onShare}
      />

      {/* Shop products */}
      {productCount > 0 && (
        <ActionButton
          icon={ShoppingBag}
          label="Shop"
          count={productCount}
          onClick={onOpenProducts}
        />
      )}
    </div>
  );
}
