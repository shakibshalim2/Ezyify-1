/**
 * Memory Management Utilities
 * Helps manage memory pressure in large applications
 */

let memoryCheckInterval: NodeJS.Timeout | null = null;
const subscribers: Array<(level: 'low' | 'medium' | 'high') => void> = [];

// Check current memory usage
export function checkMemoryUsage(): 'low' | 'medium' | 'high' {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    return 'low';
  }

  const memory = (performance as any).memory;
  const usedMemory = memory.usedJSHeapSize;
  const totalMemory = memory.jsHeapSizeLimit;
  const ratio = usedMemory / totalMemory;

  if (ratio > 0.75) return 'high';
  if (ratio > 0.55) return 'medium';
  return 'low';
}

// Aggressive garbage collection trigger
export function forceGarbageCollection() {
  // Clear unnecessary references
  if (typeof window !== 'undefined') {
    // Clear expired sessionStorage
    try {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith('temp_') || key.startsWith('cache_')) {
          sessionStorage.removeItem(key);
        }
      });
    } catch (e) {
      // Ignore storage errors
    }
  }
}

// Monitor memory and trigger cleanup - COMPLETELY SILENT
export function startMemoryMonitoring() {
  if (memoryCheckInterval) return;

  memoryCheckInterval = setInterval(() => {
    const level = checkMemoryUsage();
    
    // Notify subscribers silently
    subscribers.forEach(callback => {
      try {
        callback(level);
      } catch (e) {
        // Ignore callback errors
      }
    });
    
    // Auto-cleanup on high memory - COMPLETELY SILENT
    if (level === 'high') {
      forceGarbageCollection();
      
      // Import and clear data cache silently
      import('./dataManager').then(({ clearDataCache }) => {
        clearDataCache();
      }).catch(() => {
        // Ignore import errors
      });
    }
  }, 20000); // Increased to 20 seconds
}

// Stop memory monitoring
export function stopMemoryMonitoring() {
  if (memoryCheckInterval) {
    clearInterval(memoryCheckInterval);
    memoryCheckInterval = null;
  }
}

// Subscribe to memory changes
export function onMemoryChange(callback: (level: 'low' | 'medium' | 'high') => void) {
  subscribers.push(callback);
  
  return () => {
    const index = subscribers.indexOf(callback);
    if (index > -1) {
      subscribers.splice(index, 1);
    }
  };
}

// Get memory info
export function getMemoryInfo() {
  if (typeof performance === 'undefined' || !(performance as any).memory) {
    return null;
  }

  const memory = (performance as any).memory;
  return {
    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
    total: Math.round(memory.jsHeapSizeLimit / 1048576), // MB
    percentage: Math.round((memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100),
  };
}

// Clear component-specific memory
export function clearComponentMemory(componentName: string) {
  // Silent cleanup - absolutely no console output
  forceGarbageCollection();
}