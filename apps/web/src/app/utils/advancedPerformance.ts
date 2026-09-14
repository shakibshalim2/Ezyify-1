// Advanced Performance Optimization Utilities for EZYIFY
// Includes code splitting, lazy loading, caching, and performance monitoring

// ==========================================
// 1. Advanced Code Splitting
// ==========================================

export const prefetchRoute = (routePath: string) => {
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = routePath;
  document.head.appendChild(link);
};

export const preloadCriticalAssets = (assets: string[]) => {
  assets.forEach(asset => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = asset.endsWith('.css') ? 'style' : asset.endsWith('.js') ? 'script' : 'image';
    link.href = asset;
    document.head.appendChild(link);
  });
};

// ==========================================
// 2. Resource Hints
// ==========================================

export const addResourceHints = () => {
  // DNS Prefetch for external domains
  const dnsPrefetch = ['https://images.unsplash.com', 'https://api.ezyify.app'];
  dnsPrefetch.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'dns-prefetch';
    link.href = domain;
    document.head.appendChild(link);
  });

  // Preconnect to critical domains
  const preconnect = ['https://api.ezyify.app', 'https://cdn.ezyify.app'];
  preconnect.forEach(domain => {
    const link = document.createElement('link');
    link.rel = 'preconnect';
    link.href = domain;
    link.crossOrigin = 'anonymous';
    document.head.appendChild(link);
  });
};

// ==========================================
// 3. Image Optimization
// ==========================================

const isUnsplashUrl = (src: string) => {
  try {
    const host = new URL(src, 'https://ezyify.app').hostname;
    return host === 'unsplash.com' || host.endsWith('.unsplash.com');
  } catch {
    return false;
  }
};

export const optimizeImage = (src: string, options: {
  width?: number;
  quality?: number;
  format?: 'webp' | 'avif' | 'jpg';
} = {}) => {
  const { width, quality = 85, format = 'webp' } = options;
  
  // If using Unsplash or similar service
  if (isUnsplashUrl(src)) {
    let optimizedUrl = src;
    if (width) optimizedUrl += `&w=${width}`;
    optimizedUrl += `&q=${quality}&fm=${format}&fit=crop`;
    return optimizedUrl;
  }
  
  return src;
};

// Lazy load images with Intersection Observer
export const lazyLoadImages = () => {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute('data-src');
          observer.unobserve(img);
        }
      }
    });
  }, {
    rootMargin: '50px 0px',
    threshold: 0.01
  });

  document.querySelectorAll('img[data-src]').forEach(img => {
    imageObserver.observe(img);
  });
};

// ==========================================
// 4. Cache Management
// ==========================================

export class CacheManager {
  private cache: Map<string, { data: any; timestamp: number; ttl: number }>;

  constructor() {
    this.cache = new Map();
  }

  set(key: string, data: any, ttl: number = 300000) { // 5 minutes default
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): any | null {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > cached.ttl;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  clear() {
    this.cache.clear();
  }

  clearExpired() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key);
      }
    }
  }
}

export const cacheManager = new CacheManager();

// Auto-clear expired cache every 5 minutes
setInterval(() => {
  cacheManager.clearExpired();
}, 300000);

// ==========================================
// 5. API Request Batching
// ==========================================

export class RequestBatcher {
  private queue: Array<{ url: string; resolve: Function; reject: Function }> = [];
  private batchTimeout: NodeJS.Timeout | null = null;

  add(url: string): Promise<any> {
    return new Promise((resolve, reject) => {
      this.queue.push({ url, resolve, reject });
      
      if (!this.batchTimeout) {
        this.batchTimeout = setTimeout(() => this.flush(), 50);
      }
    });
  }

  private async flush() {
    const batch = [...this.queue];
    this.queue = [];
    this.batchTimeout = null;

    // Group by same URL
    const grouped = batch.reduce((acc, item) => {
      if (!acc[item.url]) acc[item.url] = [];
      acc[item.url].push(item);
      return acc;
    }, {} as Record<string, typeof batch>);

    // Fetch each unique URL once
    for (const [url, requests] of Object.entries(grouped)) {
      try {
        const response = await fetch(url);
        const data = await response.json();
        requests.forEach(req => req.resolve(data));
      } catch (error) {
        requests.forEach(req => req.reject(error));
      }
    }
  }
}

export const requestBatcher = new RequestBatcher();

// ==========================================
// 6. Virtual Scrolling Helper
// ==========================================

export const calculateVirtualScrollRange = (
  scrollTop: number,
  containerHeight: number,
  itemHeight: number,
  totalItems: number,
  overscan: number = 3
) => {
  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  return { startIndex, endIndex };
};

// ==========================================
// 7. Debounce & Throttle
// ==========================================

export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ==========================================
// 8. Web Worker Helper
// ==========================================

export const createWorker = (workerFunction: Function) => {
  const blob = new Blob([`(${workerFunction.toString()})()`], {
    type: 'application/javascript',
  });
  const url = URL.createObjectURL(blob);
  return new Worker(url);
};

// ==========================================
// 9. Service Worker Updates
// ==========================================

export const checkForUpdates = async () => {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      registration.update();
    }
  }
};

// Check for updates every hour
setInterval(checkForUpdates, 3600000);

// ==========================================
// 10. Bundle Size Analyzer
// ==========================================

export const analyzeBundleSize = () => {
  const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
  
  const analysis = {
    totalSize: 0,
    byType: {} as Record<string, number>,
    largestResources: [] as Array<{ name: string; size: number; type: string }>,
  };

  resources.forEach(resource => {
    const size = resource.transferSize || 0;
    const type = resource.initiatorType;
    
    analysis.totalSize += size;
    analysis.byType[type] = (analysis.byType[type] || 0) + size;
    
    analysis.largestResources.push({
      name: resource.name,
      size,
      type,
    });
  });

  analysis.largestResources.sort((a, b) => b.size - a.size);
  analysis.largestResources = analysis.largestResources.slice(0, 10);

  return analysis;
};

// ==========================================
// 11. Critical CSS Extraction
// ==========================================

export const extractCriticalCSS = () => {
  const criticalElements = document.querySelectorAll('header, nav, main > *:first-child');
  const criticalCSS: string[] = [];

  criticalElements.forEach(element => {
    const styles = window.getComputedStyle(element);
    // Extract only critical properties
    const critical = {
      display: styles.display,
      position: styles.position,
      width: styles.width,
      height: styles.height,
      margin: styles.margin,
      padding: styles.padding,
    };
    criticalCSS.push(JSON.stringify(critical));
  });

  return criticalCSS;
};

// ==========================================
// 12. Adaptive Loading Based on Network
// ==========================================

export const getNetworkQuality = (): 'slow' | 'medium' | 'fast' => {
  const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
  
  if (!connection) return 'medium';

  const effectiveType = connection.effectiveType;
  
  if (effectiveType === '4g') return 'fast';
  if (effectiveType === '3g') return 'medium';
  return 'slow';
};

export const shouldLoadHighQuality = (): boolean => {
  const quality = getNetworkQuality();
  const saveData = (navigator as any).connection?.saveData;
  
  return quality === 'fast' && !saveData;
};

// ==========================================
// 13. Performance Budget Checker
// ==========================================

export const checkPerformanceBudget = () => {
  const budget = {
    FCP: 1800, // First Contentful Paint (ms)
    LCP: 2500, // Largest Contentful Paint (ms)
    FID: 100,  // First Input Delay (ms)
    CLS: 0.1,  // Cumulative Layout Shift
    TTI: 3800, // Time to Interactive (ms)
  };

  const metrics: Record<string, number> = {};
  let passed = true;

  const observer = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
      if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
        metrics.FCP = entry.startTime;
        if (entry.startTime > budget.FCP) passed = false;
      }
      if (entry.entryType === 'largest-contentful-paint') {
        metrics.LCP = entry.startTime;
        if (entry.startTime > budget.LCP) passed = false;
      }
    }
  });

  observer.observe({ entryTypes: ['paint', 'largest-contentful-paint'] });

  return { budget, metrics, passed };
};

// ==========================================
// 14. Preload Next Page
// ==========================================

export const preloadNextPage = (nextRoute: string) => {
  // Prefetch data for the next page using link prefetch
  const link = document.createElement('link');
  link.rel = 'prefetch';
  link.href = `/api${nextRoute}`;
  document.head.appendChild(link);
  
  // Note: Dynamic route prefetching is handled by React Router's lazy loading
  console.log('Prefetching data for:', nextRoute);
};

// ==========================================
// 15. Initialize All Optimizations
// ==========================================

export const initializeOptimizations = () => {
  // Add resource hints
  addResourceHints();

  // Setup lazy loading
  lazyLoadImages();

  // Check performance budget
  checkPerformanceBudget();

  // Log bundle size in development (disabled for compatibility)
  // Note: Enable this in environments that support import.meta.env
  try {
    if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      setTimeout(() => {
        const analysis = analyzeBundleSize();
        console.log('📦 Bundle Analysis:', {
          totalSize: `${(analysis.totalSize / 1024).toFixed(2)} KB`,
          byType: Object.entries(analysis.byType).map(([type, size]) => 
            `${type}: ${(size / 1024).toFixed(2)} KB`
          ),
          largestResources: analysis.largestResources.slice(0, 5).map(r => 
            `${r.name.split('/').pop()}: ${(r.size / 1024).toFixed(2)} KB`
          ),
        });
      }, 2000);
    }
  } catch (error) {
    // Silently fail if bundle analysis is not available
  }
};