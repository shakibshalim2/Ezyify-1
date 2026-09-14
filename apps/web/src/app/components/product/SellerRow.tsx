import { UserPlus, UserCheck } from 'lucide-react';
import { Link } from 'react-router';
import { Avatar, AvatarImage, AvatarFallback } from '../ui/avatar';
import { VerifiedBadge } from '../VerifiedBadge';
import { Button } from '../primitives/Button';
import { motion, useReducedMotion } from 'motion/react';
import { springSnappy } from '../../lib/motion';

interface SellerRowProps {
  seller: {
    id: string;
    name: string;
    avatar: string;
    verified?: boolean;
    username?: string;
  };
  isFollowing: boolean;
  onToggleFollow: () => void;
}

export function SellerRow({ seller, isFollowing, onToggleFollow }: SellerRowProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? {} : { opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24 }}
      className="flex items-center justify-between p-4 bg-background-elevated rounded-card border border-border"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Avatar className="size-14 shrink-0">
          <AvatarImage src={seller.avatar} alt={seller.name} />
          <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5 gap-y-0">
            {seller.username ? (
              <Link to={`/profile/${seller.username}`} className="font-semibold text-foreground truncate hover:underline">{seller.name}</Link>
            ) : (
              <h3 className="font-semibold text-foreground truncate">{seller.name}</h3>
            )}
            {seller.verified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-xs text-foreground-secondary">{seller.verified ? 'Verified seller' : 'Seller'}</p>
        </div>
      </div>
      <motion.div
        whileTap={reduce ? {} : { scale: 0.95 }}
        transition={springSnappy}
        className="shrink-0 ml-2"
      >
        <Button
          variant={isFollowing ? 'ghost' : 'primary'}
          size="icon"
          onClick={onToggleFollow}
          aria-label={isFollowing ? `Unfollow ${seller.name}` : `Follow ${seller.name}`}
          aria-pressed={isFollowing}
        >
          {isFollowing ? (
            <UserCheck className="size-5" />
          ) : (
            <UserPlus className="size-5" />
          )}
        </Button>
      </motion.div>
    </motion.div>
  );
}
