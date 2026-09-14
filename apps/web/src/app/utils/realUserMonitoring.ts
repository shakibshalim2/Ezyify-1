
/** Collision-resistant id from the platform CSPRNG (CodeQL js/insecure-randomness). */
const randomId = () => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  // Very old WebViews: still CSPRNG-backed via getRandomValues (no Math.random fallback).
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Array.from(bytes, (b: number) => b.toString(16).padStart(2, '0')).join('');
};

/**
 * Real User Monitoring (RUM) Implementation
 * Tracks actual user experience metrics in production
 * 
 * ⚠️ PERFORMANCE LOCK ACTIVE - February 25, 2026 Launch
 * This module is DISABLED at startup to prevent UI blocking.
 * Use window.activateProductionRUM() for manual activation only.
 * 
 * Based on Google Web Vitals and industry best practices
 */

export interface RUMMetrics {
  // Core Web Vitals
  fcp: number;  // First Contentful Paint
  lcp: number;  // Largest Contentful Paint
  fid: number;  // First Input Delay
  cls: number;  // Cumulative Layout Shift
  ttfb: number; // Time to First Byte
  tti: number;  // Time to Interactive
  
  // Custom metrics
  skeletonTime: number;     // Time to skeleton display
  dataLoadTime: number;     // Time to data loaded
  interactionReady: number; // Time until interactive
  
  // Device & Network
  deviceType: 'mobile' | 'tablet' | 'desktop';
  connection: string;
  
  // User context
  userId?: string;
  sessionId: string;
  pageUrl: string;
  timestamp: number;
}

interface PerformanceEntry {
  name: string;
  duration: number;
  startTime: number;
}

class RealUserMonitoring {
  private metrics: Partial<RUMMetrics> = {};
  private sessionId: string;
  private observers: PerformanceObserver[] = [];
  private beaconEndpoint: string;
  
  constructor(beaconEndpoint: string = '/api/rum') {
    this.beaconEndpoint = beaconEndpoint;
    this.sessionId = this.generateSessionId();
    // DO NOT call initializeMonitoring() - performance lock prevents it
  }
  
  private generateSessionId(): string {
    return randomId();
  }
  
  public mark(name: string): void {
    try {
      performance.mark(name);
    } catch (e) {
      // Silent
    }
  }
  
  public measure(name: string, startMark: string, endMark: string): void {
    try {
      performance.measure(name, startMark, endMark);
    } catch (e) {
      // Silent
    }
  }
  
  public getMetrics(): Partial<RUMMetrics> {
    return { ...this.metrics };
  }
  
  public sendMetric(metric: any): void {
    // Disabled - performance lock
  }
  
  public sendBeacon(): void {
    // Disabled - performance lock
  }
  
  public destroy(): void {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Global RUM instance
let rumInstance: RealUserMonitoring | null = null;

/**
 * Initialize RUM monitoring
 * 
 * ⚠️ PERFORMANCE LOCK - DISABLED AT STARTUP
 * This function is available but should ONLY be called manually for testing.
 * DO NOT auto-initialize to prevent UI blocking long tasks.
 */
export function initRUM(beaconEndpoint?: string): RealUserMonitoring {
  // Check performance lock
  if (typeof window !== 'undefined' && (window as any).__performanceLock) {
    const lock = (window as any).__performanceLock;
    if (lock.lock.disableProductionRUM) {
      console.warn('[RUM] ⚠️ PERFORMANCE LOCK ACTIVE - RUM initialization blocked');
      console.warn('[RUM] To manually activate: window.activateProductionRUM()');
      
      // Return a dummy instance that does nothing
      return {
        destroy: () => {},
        mark: () => {},
        measure: () => {},
        sendMetric: () => {},
        sendBeacon: () => {},
        getMetrics: () => ({}),
      } as any;
    }
  }
  
  if (!rumInstance) {
    rumInstance = new RealUserMonitoring(beaconEndpoint);
    
    // Expose globally for debugging
    (window as any).__rum = rumInstance;
    
    console.log('[RUM] Real User Monitoring initialized');
  }
  
  return rumInstance;
}

/**
 * Get RUM instance
 */
export function getRUM(): RealUserMonitoring | null {
  return rumInstance;
}

/**
 * Mark skeleton displayed
 */
export function markSkeletonDisplayed(componentName: string): void {
  rumInstance?.mark(`skeleton-${componentName}`);
}

/**
 * Mark data loaded
 */
export function markDataLoaded(componentName: string): void {
  rumInstance?.mark(`data-loaded-${componentName}`);
}

/**
 * Measure skeleton to data time
 */
export function measureSkeletonToData(componentName: string): void {
  rumInstance?.measure(
    `skeleton-to-data-${componentName}`,
    `skeleton-${componentName}`,
    `data-loaded-${componentName}`
  );
}

/**
 * Track custom event
 */
export function trackEvent(eventName: string, data?: any): void {
  rumInstance?.sendMetric({
    type: 'custom-event',
    event: eventName,
    ...data,
  });
}

/**
 * Track error
 */
export function trackError(error: Error, context?: any): void {
  rumInstance?.sendMetric({
    type: 'error',
    message: error.message,
    stack: error.stack,
    ...context,
  });
}

/**
 * Track API call
 */
export function trackAPICall(endpoint: string, duration: number, status: number): void {
  rumInstance?.sendMetric({
    type: 'api-call',
    endpoint,
    duration,
    status,
  });
}

/**
 * Generate session ID (exported for other modules)
 */
export function generateSessionId(): string {
  return randomId();
}

/**
 * Get device category (exported for other modules)
 */
export function getDeviceCategory(): 'mobile' | 'tablet' | 'desktop' {
  const width = window.innerWidth;
  if (width < 768) return 'mobile';
  if (width < 1024) return 'tablet';
  return 'desktop';
}

/**
 * Get network type (exported for other modules)
 */
export function getNetworkType(): string {
  const nav: any = navigator;
  if (nav.connection) {
    return nav.connection.effectiveType || 'unknown';
  }
  return 'unknown';
}

/**
 * Store RUM metrics (for compatibility)
 */
export function storeRUMMetrics(metrics: Partial<RUMMetrics>): void {
  // Store in localStorage for offline analysis
  try {
    const stored = localStorage.getItem('rum_metrics') || '[]';
    const existing = JSON.parse(stored);
    existing.push({
      ...metrics,
      timestamp: Date.now(),
    });
    // Keep only last 100 entries
    const trimmed = existing.slice(-100);
    localStorage.setItem('rum_metrics', JSON.stringify(trimmed));
  } catch (e) {
    console.warn('[RUM] Failed to store metrics:', e);
  }
}

/**
 * Get stored RUM metrics (for analysis)
 */
export function getStoredRUMMetrics(): Array<Partial<RUMMetrics>> {
  try {
    const stored = localStorage.getItem('rum_metrics') || '[]';
    return JSON.parse(stored);
  } catch (e) {
    console.warn('[RUM] Failed to retrieve metrics:', e);
    return [];
  }
}

/**
 * Get average metrics from stored data
 */
export function getAverageMetrics(): Partial<RUMMetrics> {
  const stored = getStoredRUMMetrics();
  
  if (stored.length === 0) {
    return {};
  }
  
  const sum = stored.reduce((acc, metric) => {
    return {
      fcp: (acc.fcp || 0) + (metric.fcp || 0),
      lcp: (acc.lcp || 0) + (metric.lcp || 0),
      fid: (acc.fid || 0) + (metric.fid || 0),
      cls: (acc.cls || 0) + (metric.cls || 0),
      ttfb: (acc.ttfb || 0) + (metric.ttfb || 0),
      tti: (acc.tti || 0) + (metric.tti || 0),
    };
  }, {} as any);
  
  const count = stored.length;
  
  return {
    fcp: sum.fcp / count,
    lcp: sum.lcp / count,
    fid: sum.fid / count,
    cls: sum.cls / count,
    ttfb: sum.ttfb / count,
    tti: sum.tti / count,
  };
}

/**
 * Get performance score (0-100) based on Web Vitals
 */
export function getPerformanceScore(metrics: Partial<RUMMetrics>): number {
  let score = 100;
  
  // FCP scoring (target: <1000ms)
  if (metrics.fcp) {
    if (metrics.fcp > 3000) score -= 20;
    else if (metrics.fcp > 1800) score -= 10;
    else if (metrics.fcp > 1000) score -= 5;
  }
  
  // LCP scoring (target: <2500ms)
  if (metrics.lcp) {
    if (metrics.lcp > 4000) score -= 20;
    else if (metrics.lcp > 2500) score -= 10;
    else if (metrics.lcp > 1800) score -= 5;
  }
  
  // FID scoring (target: <100ms)
  if (metrics.fid) {
    if (metrics.fid > 300) score -= 15;
    else if (metrics.fid > 100) score -= 7;
  }
  
  // CLS scoring (target: <0.1)
  if (metrics.cls) {
    if (metrics.cls > 0.25) score -= 15;
    else if (metrics.cls > 0.1) score -= 7;
  }
  
  // TTFB scoring (target: <600ms)
  if (metrics.ttfb) {
    if (metrics.ttfb > 1800) score -= 10;
    else if (metrics.ttfb > 600) score -= 5;
  }
  
  return Math.max(0, Math.min(100, score));
}

/**
 * Detect performance degradation by comparing with baseline
 */
export function detectPerformanceDegradation(
  current: Partial<RUMMetrics>,
  baseline: Partial<RUMMetrics>,
  threshold: number = 0.2 // 20% degradation threshold
): {
  degraded: boolean;
  issues: string[];
} {
  const issues: string[] = [];
  
  // Check FCP
  if (current.fcp && baseline.fcp) {
    const degradation = (current.fcp - baseline.fcp) / baseline.fcp;
    if (degradation > threshold) {
      issues.push(`FCP degraded by ${(degradation * 100).toFixed(1)}%`);
    }
  }
  
  // Check LCP
  if (current.lcp && baseline.lcp) {
    const degradation = (current.lcp - baseline.lcp) / baseline.lcp;
    if (degradation > threshold) {
      issues.push(`LCP degraded by ${(degradation * 100).toFixed(1)}%`);
    }
  }
  
  // Check FID
  if (current.fid && baseline.fid) {
    const degradation = (current.fid - baseline.fid) / baseline.fid;
    if (degradation > threshold) {
      issues.push(`FID degraded by ${(degradation * 100).toFixed(1)}%`);
    }
  }
  
  // Check CLS
  if (current.cls && baseline.cls) {
    const degradation = (current.cls - baseline.cls) / baseline.cls;
    if (degradation > threshold) {
      issues.push(`CLS degraded by ${(degradation * 100).toFixed(1)}%`);
    }
  }
  
  // Check TTFB
  if (current.ttfb && baseline.ttfb) {
    const degradation = (current.ttfb - baseline.ttfb) / baseline.ttfb;
    if (degradation > threshold) {
      issues.push(`TTFB degraded by ${(degradation * 100).toFixed(1)}%`);
    }
  }
  
  return {
    degraded: issues.length > 0,
    issues,
  };
}

export default RealUserMonitoring;
