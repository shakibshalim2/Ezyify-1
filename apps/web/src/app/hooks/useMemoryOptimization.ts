import { useEffect, useRef } from 'react';
import { clearComponentMemory } from '../utils/memoryManager';

/**
 * Hook to optimize memory usage for components
 * Cleans up memory when component unmounts
 */
export function useMemoryOptimization(componentName: string) {
  const mounted = useRef(true);

  useEffect(() => {
    return () => {
      mounted.current = false;
      clearComponentMemory(componentName);
    };
  }, [componentName]);

  return mounted;
}

/**
 * Hook to limit array size in state
 * Prevents memory issues from large arrays
 */
export function useLimitedArray<T>(data: T[], maxSize = 50): T[] {
  return data.slice(0, maxSize);
}

/**
 * Hook to cleanup interval timers
 * Prevents memory leaks from uncleaned intervals
 */
export function useCleanupInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return;
    
    const id = setInterval(callback, delay);
    return () => clearInterval(id);
  }, [callback, delay]);
}
