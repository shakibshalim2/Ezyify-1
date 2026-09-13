import { Package, ShoppingBag, MessageCircle, Heart, UserPlus, Image, AlertCircle, Search, Bell, Inbox } from 'lucide-react';
import { Button } from './ui/button';
import { Link } from 'react-router';
import { ReactNode } from 'react';
import { cn } from './ui/utils';

interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description: string;
  actionLabel?: string;
  actionLink?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  secondaryLink?: string;
  variant?: 'default' | 'compact';
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionLink,
  onAction,
  secondaryLabel,
  secondaryLink,
  variant = 'default',
  className,
}: EmptyStateProps) {
  return (
    <div className={cn(
      'flex flex-col items-center justify-center text-center',
      variant === 'compact' ? 'py-10 px-4' : 'py-16 px-6',
      className
    )}>
      {/* Icon container */}
      <div className={cn(
        'rounded-3xl bg-muted flex items-center justify-center mb-5 shadow-inset',
        variant === 'compact' ? 'w-16 h-16' : 'w-20 h-20'
      )}>
        {icon}
      </div>

      {/* Text */}
      <h3 className={cn(
        'font-semibold text-foreground mb-2',
        variant === 'compact' ? 'text-base' : 'text-lg'
      )}>
        {title}
      </h3>
      <p className={cn(
        'text-muted-foreground leading-relaxed max-w-xs',
        variant === 'compact' ? 'text-xs' : 'text-sm'
      )}>
        {description}
      </p>

      {/* Actions */}
      {(actionLabel || secondaryLabel) && (
        <div className="flex items-center gap-3 mt-6">
          {actionLabel && (
            actionLink ? (
              <Link to={actionLink}>
                <Button size="sm" className="gap-2">{actionLabel}</Button>
              </Link>
            ) : (
              <Button size="sm" onClick={onAction} className="gap-2">{actionLabel}</Button>
            )
          )}
          {secondaryLabel && secondaryLink && (
            <Link to={secondaryLink}>
              <Button size="sm" variant="outline">{secondaryLabel}</Button>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Specific empty states ─────────────────────────────────────────

export function EmptyCart() {
  return (
    <EmptyState
      icon={<ShoppingBag className="w-9 h-9 text-muted-foreground" />}
      title="Your cart is empty"
      description="You haven't added any products yet. Start shopping and add your favorites."
      actionLabel="Start Shopping"
      actionLink="/shop"
      secondaryLabel="Browse Deals"
      secondaryLink="/deals"
    />
  );
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={<Package className="w-9 h-9 text-muted-foreground" />}
      title="No orders yet"
      description="You haven't placed any orders. Explore products and place your first order."
      actionLabel="Shop Now"
      actionLink="/shop"
    />
  );
}

export function EmptyWishlist() {
  return (
    <EmptyState
      icon={<Heart className="w-9 h-9 text-muted-foreground" />}
      title="Your wishlist is empty"
      description="Save your favorite products for later by tapping the heart icon."
      actionLabel="Discover Products"
      actionLink="/shop"
    />
  );
}

export function EmptyNotifications() {
  return (
    <EmptyState
      icon={<Bell className="w-9 h-9 text-muted-foreground" />}
      title="All caught up"
      description="No new notifications right now. We'll let you know when something happens."
    />
  );
}

export function EmptyMessages() {
  return (
    <EmptyState
      icon={<MessageCircle className="w-9 h-9 text-muted-foreground" />}
      title="No messages yet"
      description="Start a conversation with a creator or seller."
    />
  );
}

export function EmptyFollowers() {
  return (
    <EmptyState
      icon={<UserPlus className="w-9 h-9 text-muted-foreground" />}
      title="No followers yet"
      description="Create engaging content and grow your audience."
    />
  );
}

export function EmptySearch() {
  return (
    <EmptyState
      icon={<Search className="w-9 h-9 text-muted-foreground" />}
      title="No results found"
      description="No matches for your search. Try different keywords or browse categories."
      actionLabel="Browse Categories"
      actionLink="/categories"
    />
  );
}

export const EmptySearchResults = EmptySearch;

export function EmptyPosts() {
  return (
    <EmptyState
      icon={<Image className="w-9 h-9 text-muted-foreground" />}
      title="No posts yet"
      description="No content here yet. Create your first post and share it with your followers."
      actionLabel="Create Post"
      actionLink="/upload"
    />
  );
}

export function EmptyProducts() {
  return (
    <EmptyState
      icon={<Package className="w-9 h-9 text-muted-foreground" />}
      title="No products listed"
      description="Add your first product to start selling on Ezyify."
      actionLabel="Add Product"
      actionLink="/seller/add-product"
    />
  );
}

export function EmptyContent() {
  return (
    <EmptyState
      icon={<Inbox className="w-9 h-9 text-muted-foreground" />}
      title="Nothing here yet"
      description="Content will appear here when available."
    />
  );
}
