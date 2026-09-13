import React, { useState } from 'react';
import { UserPlus, UserCheck, UserMinus } from 'lucide-react';

interface FollowButtonProps {
  username?: string;
  initialFollowing?: boolean;
  variant?: 'default' | 'compact' | 'icon';
  className?: string;
}

export function FollowButton({
  username,
  initialFollowing = false,
  variant = 'default',
  className = '',
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialFollowing);
  const [isHovered, setIsHovered] = useState(false);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsFollowing(!isFollowing);
  };

  const baseStyle = 'inline-flex items-center justify-center gap-1.5 font-semibold transition-all duration-150 select-none active:scale-[0.96] rounded-full cursor-pointer';

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        title={isFollowing ? 'Unfollow' : 'Follow'}
        className={`${baseStyle} w-9 h-9 ${
          isFollowing
            ? 'bg-muted text-muted-foreground hover:bg-error/10 hover:text-error border border-border'
            : 'text-white shadow-brand hover:shadow-brand-lg'
        } ${className}`}
        style={!isFollowing ? { background: 'var(--brand-gradient)' } : {}}
      >
        {isFollowing && isHovered ? <UserMinus className="w-4 h-4" /> : isFollowing ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
      </button>
    );
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`${baseStyle} px-3 py-1.5 text-xs ${
          isFollowing
            ? 'bg-muted text-foreground border border-border hover:border-error/30 hover:text-error hover:bg-error/5'
            : 'text-white shadow-brand hover:shadow-brand-lg'
        } ${className}`}
        style={!isFollowing ? { background: 'var(--brand-gradient)' } : {}}
      >
        {isFollowing && isHovered ? (
          <><UserMinus className="w-3.5 h-3.5" />Unfollow</>
        ) : isFollowing ? (
          <><UserCheck className="w-3.5 h-3.5" />Following</>
        ) : (
          <><UserPlus className="w-3.5 h-3.5" />Follow</>
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`${baseStyle} px-4 py-2 text-sm ${
        isFollowing
          ? 'bg-muted text-foreground border border-border hover:border-error/30 hover:text-error hover:bg-error/5'
          : 'text-white shadow-brand hover:shadow-brand-lg'
      } ${className}`}
      style={!isFollowing ? { background: 'var(--brand-gradient)' } : {}}
    >
      {isFollowing && isHovered ? (
        <><UserMinus className="w-4 h-4" />Unfollow</>
      ) : isFollowing ? (
        <><UserCheck className="w-4 h-4" />Following</>
      ) : (
        <><UserPlus className="w-4 h-4" />Follow</>
      )}
    </button>
  );
}
