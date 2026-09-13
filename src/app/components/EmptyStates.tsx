import { Link } from 'react-router';
import type { ReactNode } from 'react';
import { Button } from './primitives/Button';
import { EmptyState, type EmptyKind } from './primitives/EmptyState';

export { EmptyState } from './primitives/EmptyState';

interface PresetProps {
  compact?: boolean;
  className?: string;
}

function preset(
  kind: EmptyKind,
  title: string,
  description: string,
  action?: { label: string; to: string },
  secondary?: { label: string; to: string },
) {
  return function Preset({ compact, className }: PresetProps) {
    const primary: ReactNode = action ? (
      <Button asChild variant="primary" size="md">
        <Link to={action.to}>{action.label}</Link>
      </Button>
    ) : undefined;
    const sec: ReactNode = secondary ? (
      <Button asChild variant="outline" size="md">
        <Link to={secondary.to}>{secondary.label}</Link>
      </Button>
    ) : undefined;
    return (
      <EmptyState
        kind={kind}
        title={title}
        description={description}
        action={primary}
        secondaryAction={sec}
        compact={compact}
        className={className}
      />
    );
  };
}

export const EmptyCart = preset(
  'cart',
  'Your cart is empty',
  'Add products you love and check out securely with escrow protection.',
  { label: 'Start shopping', to: '/shop' },
  { label: 'Browse deals', to: '/deals' },
);
export const EmptyOrders = preset(
  'orders',
  'No orders yet',
  'When you place an order it will show up here with live tracking.',
  { label: 'Shop now', to: '/shop' },
);
export const EmptyWishlist = preset(
  'wishlist',
  'Nothing saved yet',
  'Tap the heart on any product to keep it here for later.',
  { label: 'Discover products', to: '/shop' },
);
export const EmptyNotifications = preset(
  'notifications',
  'You’re all caught up',
  'We’ll let you know about orders, replies and live drops.',
);
export const EmptyMessages = preset(
  'messages',
  'No messages yet',
  'Start a conversation with a creator or seller.',
  { label: 'Explore creators', to: '/explore' },
);
export const EmptyFollowers = preset(
  'feed',
  'No followers yet',
  'Post Loops and stories to grow your audience.',
  { label: 'Create a post', to: '/upload' },
);
export const EmptySearch = preset(
  'search',
  'No results found',
  'Try different keywords or browse by category.',
  { label: 'Browse categories', to: '/categories' },
);
export const EmptySearchResults = EmptySearch;
export const EmptyPosts = preset(
  'feed',
  'Your feed is quiet',
  'Follow creators and pick interests to fill it with things you’ll love.',
  { label: 'Find creators', to: '/onboarding/follow-suggestions' },
  { label: 'Explore', to: '/explore' },
);
export const EmptyProducts = preset(
  'orders',
  'No products listed',
  'Add your first product to start selling on Ezyify.',
  { label: 'Add product', to: '/seller/add-product' },
);
export const EmptyContent = preset('feed', 'Nothing here yet', 'Content will appear here when available.');
export const OfflineState = preset(
  'offline',
  'You’re offline',
  'Check your connection — we’ll reload automatically when you’re back.',
);
export const ErrorState = preset(
  'error',
  'Something went wrong',
  'Please try again in a moment.',
  { label: 'Go home', to: '/' },
);
