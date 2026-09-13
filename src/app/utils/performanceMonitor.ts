/**
 * EZYIFY Performance Monitoring Utilities
 * Track and optimize escrow system performance
 */

// Performance metric types
interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  metadata?: Record<string, any>;
}

interface PageLoadMetrics {
  pageLoadTime: number;
  domContentLoaded: number;
  firstContentfulPaint: number;
  largestContentfulPaint: number;
  timeToInteractive: number;
  cumulativeLayoutShift: number;
  firstInputDelay: number;
}

// Performance thresholds (in milliseconds)
const PERFORMANCE_THRESHOLDS = {
  PAGE_LOAD: 2000,           // 2 seconds
  API_RESPONSE: 500,         // 500ms
  DATABASE_QUERY: 100,       // 100ms
  COMPONENT_RENDER: 16,      // 16ms (60fps)
  TIME_TO_INTERACTIVE: 3000, // 3 seconds
  FIRST_CONTENTFUL_PAINT: 1500, // 1.5 seconds
  LARGEST_CONTENTFUL_PAINT: 2500, // 2.5 seconds
  CUMULATIVE_LAYOUT_SHIFT: 0.1,   // 0.1 score
  FIRST_INPUT_DELAY: 100,    // 100ms
} as const;

// Metrics storage
const metrics: PerformanceMetric[] = [];
const MAX_METRICS_STORED = 100;

/**
 * Record a performance metric
 */
export function recordMetric(
  name: string,
  value: number,
  unit: 'ms' | 'bytes' | 'count' = 'ms',
  metadata?: Record<string, any>
): void {
  const metric: PerformanceMetric = {
    name,
    value,
    unit,
    timestamp: Date.now(),
    metadata
  };

  metrics.push(metric);

  // Keep only recent metrics
  if (metrics.length > MAX_METRICS_STORED) {
    metrics.shift();
  }

  // Log in development
  if (process.env.NODE_ENV === 'development') {
    const formattedValue = unit === 'ms' ? `${value.toFixed(2)}ms` : `${value}${unit}`;
    console.log(`⚡ Performance: ${name} = ${formattedValue}`, metadata || '');
  }

  // Send to analytics in production
  if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined') {
    if ((window as any).gtag) {
      (window as any).gtag('event', 'timing_complete', {
        name: name,
        value: Math.round(value),
        event_category: 'Performance',
        ...metadata
      });
    }
  }
}

/**
 * Measure function execution time
 */
export function measureExecutionTime<T>(
  name: string,
  fn: () => T,
  metadata?: Record<string, any>
): T {
  const startTime = performance.now();
  const result = fn();
  const endTime = performance.now();
  const duration = endTime - startTime;

  recordMetric(name, duration, 'ms', metadata);

  return result;
}

/**
 * Measure async function execution time
 */
export async function measureAsyncExecutionTime<T>(
  name: string,
  fn: () => Promise<T>,
  metadata?: Record<string, any>
): Promise<T> {
  const startTime = performance.now();
  const result = await fn();
  const endTime = performance.now();
  const duration = endTime - startTime;

  recordMetric(name, duration, 'ms', metadata);

  return result;
}

/**
 * Create a performance marker
 */
export function mark(name: string): void {
  if (typeof window !== 'undefined' && window.performance && window.performance.mark) {
    window.performance.mark(name);
  }
}

/**
 * Measure time between two markers
 */
export function measure(
  name: string,
  startMark: string,
  endMark: string
): number | null {
  if (typeof window !== 'undefined' && window.performance && window.performance.measure) {
    try {
      window.performance.measure(name, startMark, endMark);
      const measure = window.performance.getEntriesByName(name)[0] as PerformanceMeasure;
      if (measure) {
        recordMetric(name, measure.duration, 'ms');
        return measure.duration;
      }
    } catch (error) {
      console.warn('Performance measurement failed:', error);
    }
  }
  return null;
}

/**
 * Track API call performance
 */
export async function trackAPICall<T>(
  endpoint: string,
  apiCall: () => Promise<T>
): Promise<T> {
  return measureAsyncExecutionTime(
    `API Call: ${endpoint}`,
    apiCall,
    { endpoint, type: 'api' }
  );
}

/**
 * Track component render time
 */
export function trackComponentRender(componentName: string, renderFn: () => void): void {
  measureExecutionTime(
    `Component Render: ${componentName}`,
    renderFn,
    { component: componentName, type: 'render' }
  );
}

/**
 * Get page load metrics (Web Vitals)
 */
export function getPageLoadMetrics(): Promise<PageLoadMetrics> {
  return new Promise((resolve) => {
    if (typeof window === 'undefined') {
      resolve({
        pageLoadTime: 0,
        domContentLoaded: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        timeToInteractive: 0,
        cumulativeLayoutShift: 0,
        firstInputDelay: 0
      });
      return;
    }

    // Wait for page load
    window.addEventListener('load', () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        const metrics: PageLoadMetrics = {
          pageLoadTime: navigation ? navigation.loadEventEnd - navigation.fetchStart : 0,
          domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.fetchStart : 0,
          firstContentfulPaint: 0,
          largestContentfulPaint: 0,
          timeToInteractive: 0,
          cumulativeLayoutShift: 0,
          firstInputDelay: 0
        };

        // First Contentful Paint
        const fcp = paint.find(entry => entry.name === 'first-contentful-paint');
        if (fcp) {
          metrics.firstContentfulPaint = fcp.startTime;
          recordMetric('First Contentful Paint', fcp.startTime, 'ms');
        }

        // Largest Contentful Paint
        if ('PerformanceObserver' in window) {
          try {
            const lcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1] as any;
              if (lastEntry && lastEntry.renderTime) {
                metrics.largestContentfulPaint = lastEntry.renderTime;
                recordMetric('Largest Contentful Paint', lastEntry.renderTime, 'ms');
              }
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
          } catch (e) {
            // Observer not supported
          }

          // First Input Delay
          try {
            const fidObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              entries.forEach((entry: any) => {
                if (entry.processingStart) {
                  const fid = entry.processingStart - entry.startTime;
                  metrics.firstInputDelay = fid;
                  recordMetric('First Input Delay', fid, 'ms');
                }
              });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });
          } catch (e) {
            // Observer not supported
          }

          // Cumulative Layout Shift
          try {
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries()) {
                if (!(entry as any).hadRecentInput) {
                  clsValue += (entry as any).value;
                }
              }
              metrics.cumulativeLayoutShift = clsValue;
              recordMetric('Cumulative Layout Shift', clsValue, 'count');
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
          } catch (e) {
            // Observer not supported
          }
        }

        resolve(metrics);
      }, 0);
    });
  });
}

/**
 * Check if metrics meet performance thresholds
 */
export function checkPerformanceThresholds(metrics: PageLoadMetrics): {
  passed: boolean;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (metrics.pageLoadTime > PERFORMANCE_THRESHOLDS.PAGE_LOAD) {
    warnings.push(`Page load time (${metrics.pageLoadTime.toFixed(0)}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.PAGE_LOAD}ms)`);
  }

  if (metrics.firstContentfulPaint > PERFORMANCE_THRESHOLDS.FIRST_CONTENTFUL_PAINT) {
    warnings.push(`First Contentful Paint (${metrics.firstContentfulPaint.toFixed(0)}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.FIRST_CONTENTFUL_PAINT}ms)`);
  }

  if (metrics.largestContentfulPaint > PERFORMANCE_THRESHOLDS.LARGEST_CONTENTFUL_PAINT) {
    warnings.push(`Largest Contentful Paint (${metrics.largestContentfulPaint.toFixed(0)}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.LARGEST_CONTENTFUL_PAINT}ms)`);
  }

  if (metrics.timeToInteractive > PERFORMANCE_THRESHOLDS.TIME_TO_INTERACTIVE) {
    warnings.push(`Time to Interactive (${metrics.timeToInteractive.toFixed(0)}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.TIME_TO_INTERACTIVE}ms)`);
  }

  if (metrics.cumulativeLayoutShift > PERFORMANCE_THRESHOLDS.CUMULATIVE_LAYOUT_SHIFT) {
    warnings.push(`Cumulative Layout Shift (${metrics.cumulativeLayoutShift.toFixed(3)}) exceeds threshold (${PERFORMANCE_THRESHOLDS.CUMULATIVE_LAYOUT_SHIFT})`);
  }

  if (metrics.firstInputDelay > PERFORMANCE_THRESHOLDS.FIRST_INPUT_DELAY) {
    warnings.push(`First Input Delay (${metrics.firstInputDelay.toFixed(0)}ms) exceeds threshold (${PERFORMANCE_THRESHOLDS.FIRST_INPUT_DELAY}ms)`);
  }

  return {
    passed: warnings.length === 0,
    warnings
  };
}

/**
 * Get all recorded metrics
 */
export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Get metrics by name
 */
export function getMetricsByName(name: string): PerformanceMetric[] {
  return metrics.filter(m => m.name === name);
}

/**
 * Get average metric value
 */
export function getAverageMetric(name: string): number {
  const namedMetrics = getMetricsByName(name);
  if (namedMetrics.length === 0) return 0;
  
  const sum = namedMetrics.reduce((acc, m) => acc + m.value, 0);
  return sum / namedMetrics.length;
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metrics.length = 0;
}

/**
 * Export metrics for analysis
 */
export function exportMetrics(): string {
  return JSON.stringify(metrics, null, 2);
}

/**
 * Track memory usage
 */
export function getMemoryUsage(): {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  percentUsed: number;
} | null {
  if (typeof window !== 'undefined' && (performance as any).memory) {
    const memory = (performance as any).memory;
    const percentUsed = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;

    recordMetric('Memory Usage', percentUsed, 'count', {
      usedMB: (memory.usedJSHeapSize / 1048576).toFixed(2),
      totalMB: (memory.totalJSHeapSize / 1048576).toFixed(2),
      limitMB: (memory.jsHeapSizeLimit / 1048576).toFixed(2)
    });

    return {
      usedJSHeapSize: memory.usedJSHeapSize,
      totalJSHeapSize: memory.totalJSHeapSize,
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      percentUsed
    };
  }
  return null;
}

/**
 * Monitor memory usage periodically
 */
export function startMemoryMonitoring(intervalMs: number = 30000): () => void {
  const interval = setInterval(() => {
    const memory = getMemoryUsage();
    if (memory && memory.percentUsed > 90) {
      console.warn('⚠️ High memory usage detected:', memory.percentUsed.toFixed(1) + '%');
    }
  }, intervalMs);

  return () => clearInterval(interval);
}

/**
 * Performance budget checker
 */
export interface PerformanceBudget {
  pageLoad?: number;
  apiResponse?: number;
  componentRender?: number;
  bundleSize?: number;
}

export function checkPerformanceBudget(
  actual: Record<string, number>,
  budget: PerformanceBudget
): {
  passed: boolean;
  violations: string[];
} {
  const violations: string[] = [];

  if (budget.pageLoad && actual.pageLoad > budget.pageLoad) {
    violations.push(`Page load (${actual.pageLoad}ms) exceeds budget (${budget.pageLoad}ms)`);
  }

  if (budget.apiResponse && actual.apiResponse > budget.apiResponse) {
    violations.push(`API response (${actual.apiResponse}ms) exceeds budget (${budget.apiResponse}ms)`);
  }

  if (budget.componentRender && actual.componentRender > budget.componentRender) {
    violations.push(`Component render (${actual.componentRender}ms) exceeds budget (${budget.componentRender}ms)`);
  }

  if (budget.bundleSize && actual.bundleSize > budget.bundleSize) {
    violations.push(`Bundle size (${actual.bundleSize}KB) exceeds budget (${budget.bundleSize}KB)`);
  }

  return {
    passed: violations.length === 0,
    violations
  };
}

/**
 * React hook for performance tracking
 */
export function usePerformanceTracking(componentName: string) {
  if (typeof window === 'undefined') return;

  const startTime = performance.now();

  return () => {
    const endTime = performance.now();
    const renderTime = endTime - startTime;
    recordMetric(`Component: ${componentName}`, renderTime, 'ms', {
      component: componentName
    });

    if (renderTime > PERFORMANCE_THRESHOLDS.COMPONENT_RENDER) {
      console.warn(
        `⚠️ Slow component render: ${componentName} took ${renderTime.toFixed(2)}ms`
      );
    }
  };
}

/**
 * Initialize performance monitoring
 */
export function initializePerformanceMonitoring(): void {
  if (typeof window === 'undefined') return;

  // Track page load metrics
  getPageLoadMetrics().then(metrics => {
    const check = checkPerformanceThresholds(metrics);
    
    if (!check.passed) {
      console.warn('⚠️ Performance issues detected:', check.warnings);
    } else {
      console.log('✅ All performance metrics within thresholds');
    }
  });

  // Start memory monitoring
  startMemoryMonitoring();

  // Log performance summary every 5 minutes
  setInterval(() => {
    console.log('📊 Performance Summary:', {
      totalMetrics: metrics.length,
      averagePageLoad: getAverageMetric('Page Load').toFixed(0) + 'ms',
      memory: getMemoryUsage()
    });
  }, 300000); // 5 minutes
}

// Export all utilities
export default {
  recordMetric,
  measureExecutionTime,
  measureAsyncExecutionTime,
  mark,
  measure,
  trackAPICall,
  trackComponentRender,
  getPageLoadMetrics,
  checkPerformanceThresholds,
  getMetrics,
  getMetricsByName,
  getAverageMetric,
  clearMetrics,
  exportMetrics,
  getMemoryUsage,
  startMemoryMonitoring,
  checkPerformanceBudget,
  usePerformanceTracking,
  initializePerformanceMonitoring
};
