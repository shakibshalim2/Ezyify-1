import { useEffect, useState, useCallback } from 'react';

interface UsePullToRefreshOptions {
  onRefresh: () => Promise<void>;
  enabled?: boolean;
  threshold?: number;
  maxPullDistance?: number;
}

export function usePullToRefresh({
  onRefresh,
  enabled = true,
  threshold = 80,
  maxPullDistance = 150
}: UsePullToRefreshOptions) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [canPull, setCanPull] = useState(false);

  const handleRefresh = useCallback(async () => {
    if (isRefreshing) return;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setIsRefreshing(false);
      setPullDistance(0);
    }
  }, [onRefresh, isRefreshing]);

  useEffect(() => {
    if (!enabled) return;

    let touchStartY = 0;
    let touchStartScrollY = 0;
    let rafId: number | null = null;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-to-refresh when at the top of the page
      if (window.scrollY === 0) {
        touchStartY = e.touches[0].clientY;
        touchStartScrollY = window.scrollY;
        setCanPull(true);
      } else {
        setCanPull(false);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!canPull || touchStartY === 0) return;
      if (window.scrollY > 0) {
        setCanPull(false);
        setPullDistance(0);
        return;
      }

      const touchY = e.touches[0].clientY;
      const distance = touchY - touchStartY;

      if (distance > 0) {
        // Prevent default scrolling behavior when pulling down
        e.preventDefault();
        
        // Apply resistance curve - gets harder to pull as distance increases
        const resistanceFactor = 0.5;
        const adjustedDistance = distance * resistanceFactor;
        const clampedDistance = Math.min(adjustedDistance, maxPullDistance);
        
        if (rafId) {
          cancelAnimationFrame(rafId);
        }
        
        rafId = requestAnimationFrame(() => {
          setPullDistance(clampedDistance);
        });
      }
    };

    const handleTouchEnd = async () => {
      if (!canPull) return;
      
      if (pullDistance >= threshold && !isRefreshing) {
        await handleRefresh();
      } else {
        setPullDistance(0);
      }
      
      touchStartY = 0;
      touchStartScrollY = 0;
      setCanPull(false);
    };

    document.addEventListener('touchstart', handleTouchStart, { passive: true });
    document.addEventListener('touchmove', handleTouchMove, { passive: false });
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
      if (rafId) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [enabled, canPull, pullDistance, threshold, maxPullDistance, isRefreshing, handleRefresh]);

  return {
    isRefreshing,
    pullDistance,
    isPulling: pullDistance > 0,
    isThresholdReached: pullDistance >= threshold
  };
}
