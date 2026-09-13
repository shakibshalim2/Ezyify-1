import { RefreshCw } from 'lucide-react';

interface PullToRefreshIndicatorProps {
  pullDistance: number;
  isRefreshing: boolean;
  threshold?: number;
}

export function PullToRefreshIndicator({
  pullDistance,
  isRefreshing,
  threshold = 80,
}: PullToRefreshIndicatorProps) {
  const progress = Math.min(pullDistance / threshold, 1);
  const isThresholdReached = pullDistance >= threshold;

  if (pullDistance === 0 && !isRefreshing) return null;

  return (
    <div
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center pointer-events-none"
      style={{ height: `${Math.min(pullDistance, 100)}px` }}
    >
      <div className="bg-background/95 backdrop-blur-sm border rounded-full px-6 py-3 shadow-lg">
        <div className="flex items-center gap-3">
          <RefreshCw
            className={`w-5 h-5 transition-colors ${
              isThresholdReached ? 'text-primary' : 'text-muted-foreground'
            } ${isRefreshing ? 'animate-spin' : ''}`}
            style={!isRefreshing ? { transform: `rotate(${progress * 180}deg)` } : undefined}
          />
          <span
            className={`text-sm font-medium transition-colors ${
              isThresholdReached ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {isRefreshing
              ? 'Refreshing...'
              : isThresholdReached
              ? 'Release to refresh'
              : 'Pull to refresh'}
          </span>
        </div>
      </div>
    </div>
  );
}
