import { useState, useEffect, useRef } from 'react';

/**
 * PROGRESSIVE DATA LOADING HOOK
 * Implements big-tech pattern: UI first, data later
 * 
 * Usage:
 * const { data, loading, error } = useProgressiveData(fetchFunction);
 * 
 * Benefits:
 * - UI renders instantly with skeleton
 * - Data loads asynchronously after mount
 * - No blocking on initial render
 * - Automatic cleanup on unmount
 */

interface ProgressiveDataOptions<T> {
  // Initial data to show while loading
  initialData?: T;
  // Delay before starting data fetch (allows UI to settle)
  delay?: number;
  // Enable/disable automatic fetching
  enabled?: boolean;
  // Cache key for avoiding redundant fetches
  cacheKey?: string;
}

interface ProgressiveDataReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Simple in-memory cache
const dataCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

export function useProgressiveData<T>(
  fetchFn: () => Promise<T> | T,
  options: ProgressiveDataOptions<T> = {}
): ProgressiveDataReturn<T> {
  const {
    initialData = null,
    delay = 0,
    enabled = true,
    cacheKey
  } = options;

  const [data, setData] = useState<T | null>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const isMountedRef = useRef(true);
  const fetchCountRef = useRef(0);

  const fetchData = async () => {
    // Check cache first
    if (cacheKey) {
      const cached = dataCache.get(cacheKey);
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        if (isMountedRef.current) {
          setData(cached.data);
          setLoading(false);
        }
        return;
      }
    }

    setLoading(true);
    setError(null);
    const currentFetch = ++fetchCountRef.current;

    try {
      // Minimum delay to allow UI to settle
      const startTime = Date.now();
      const result = await Promise.resolve(fetchFn());
      
      // Only update if this is still the latest fetch and component is mounted
      if (currentFetch === fetchCountRef.current && isMountedRef.current) {
        // Ensure minimum delay for smooth transition
        const elapsed = Date.now() - startTime;
        const remainingDelay = Math.max(0, delay - elapsed);
        
        if (remainingDelay > 0) {
          await new Promise(resolve => setTimeout(resolve, remainingDelay));
        }

        if (isMountedRef.current) {
          setData(result);
          setLoading(false);

          // Cache the result
          if (cacheKey) {
            dataCache.set(cacheKey, { data: result, timestamp: Date.now() });
          }
        }
      }
    } catch (err) {
      if (currentFetch === fetchCountRef.current && isMountedRef.current) {
        setError(err instanceof Error ? err : new Error('Failed to fetch data'));
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    isMountedRef.current = true;

    if (enabled) {
      // Use requestIdleCallback for non-blocking data fetch
      if ('requestIdleCallback' in window) {
        const handle = requestIdleCallback(() => {
          fetchData();
        }, { timeout: 100 });
        
        return () => {
          isMountedRef.current = false;
          cancelIdleCallback(handle);
        };
      } else {
        // Fallback: use setTimeout with minimal delay
        const timer = setTimeout(fetchData, 16); // ~1 frame
        return () => {
          isMountedRef.current = false;
          clearTimeout(timer);
        };
      }
    }

    return () => {
      isMountedRef.current = false;
    };
  }, [enabled, cacheKey]);

  const refetch = () => {
    if (isMountedRef.current) {
      fetchData();
    }
  };

  return {
    data,
    loading: loading && data === null,
    error,
    refetch
  };
}

/**
 * PROGRESSIVE DATA LOADER FOR STATIC/MOCK DATA
 * For data that's imported but should still load progressively
 */
export function useProgressiveStaticData<T>(
  data: T,
  options: { delay?: number } = {}
): ProgressiveDataReturn<T> {
  return useProgressiveData(
    () => Promise.resolve(data),
    { ...options, initialData: null }
  );
}

/**
 * Clear all cached data
 */
export function clearDataCache() {
  dataCache.clear();
}

/**
 * Clear specific cached data
 */
export function clearCachedData(key: string) {
  dataCache.delete(key);
}
