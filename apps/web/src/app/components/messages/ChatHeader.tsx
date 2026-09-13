import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Phone, Video, MoreVertical } from 'lucide-react';
import { Button } from '../primitives/Button';
import { VerifiedBadge } from '../VerifiedBadge';

interface ChatHeaderProps {
  avatar: string;
  name: string;
  status: 'Online' | string;
  verified: boolean;
  userType: 'user' | 'seller' | 'creator';
  onBack?: () => void;
  onCall?: () => void;
  onVideo?: () => void;
  onMore?: () => void;
  isMobile?: boolean;
}

export function ChatHeader({
  avatar,
  name,
  status,
  verified,
  userType,
  onBack,
  onCall,
  onVideo,
  onMore,
  isMobile = false,
}: ChatHeaderProps) {
  return (
    <div className="h-16 flex items-center justify-between px-4 border-b border-border bg-background sticky top-0 z-20">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {isMobile && onBack && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onBack}
            className="flex-shrink-0 size-11 -ml-2 flex items-center justify-center text-foreground hover:bg-muted rounded-lg transition-colors"
            aria-label="Back to conversations"
          >
            <ArrowLeft className="size-5" />
          </motion.button>
        )}

        {/* Avatar and info */}
        <img
          src={avatar}
          alt={name}
          className="size-10 rounded-full object-cover flex-shrink-0"
          loading="lazy"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <h2 className="text-base font-semibold text-foreground truncate">{name}</h2>
            {verified && (
              <VerifiedBadge
                variant={userType === 'seller' ? 'seller' : 'user'}
                size="sm"
              />
            )}
          </div>
          <p className="text-xs text-foreground-secondary">{status}</p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <Button
          variant="ghost"
          size="icon"
          onClick={onCall}
          aria-label="Call"
        >
          <Phone className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onVideo}
          aria-label="Video call"
        >
          <Video className="size-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={onMore}
          aria-label="More options"
        >
          <MoreVertical className="size-5" />
        </Button>
      </div>
    </div>
  );
}
