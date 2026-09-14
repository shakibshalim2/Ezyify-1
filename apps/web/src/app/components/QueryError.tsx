import { ApiError } from '@ezyify/core';
import { RefreshCw, WifiOff } from 'lucide-react';
import { EmptyState } from './primitives/EmptyState';
import { Button } from './primitives/Button';

/** Error state for a failed query: friendlier copy for offline / auth, always with a retry. */
export function QueryError({ error, onRetry, compact }: { error: unknown; onRetry?: () => void; compact?: boolean }) {
  const offline = error instanceof ApiError && error.code === 'NETWORK_ERROR';
  const unauthorized = error instanceof ApiError && error.status === 401;
  const title = offline ? 'You’re offline' : unauthorized ? 'Sign in to continue' : 'Something went wrong';
  const description = offline
    ? 'Check your connection and try again.'
    : unauthorized
      ? 'Your session has ended. Sign in again to pick up where you left off.'
      : error instanceof ApiError
        ? error.message
        : 'Please try again in a moment.';
  return (
    <EmptyState
      kind={offline ? 'offline' : 'error'}
      compact={compact}
      title={title}
      description={description}
      illustration={offline ? <WifiOff className="size-10 text-foreground-tertiary" aria-hidden /> : undefined}
      action={
        onRetry && !unauthorized ? (
          <Button variant="primary" size="md" onClick={onRetry}>
            <RefreshCw className="size-4" /> Try again
          </Button>
        ) : unauthorized ? (
          <Button variant="primary" size="md" asChild>
            <a href="/login">Sign in</a>
          </Button>
        ) : undefined
      }
    />
  );
}
