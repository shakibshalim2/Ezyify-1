/**
 * Performance Testing Utility
 * Comprehensive performance measurement and reporting
 */

export interface PerformanceReport {
  timestamp: number;
  url: string;
  metrics: {
    // Navigation Timing
    ttfb: number; // Time to First Byte
    domContentLoaded: number;
    loadComplete: number;
    
    // Paint Timing
    fcp: number; // First Contentful Paint
    lcp: number; // Largest Contentful Paint
    
    // Interactivity
    fid: number; // First Input Delay
    tti: number; // Time to Interactive
    tbt: number; // Total Blocking Time
    
    // Visual Stability
    cls: number; // Cumulative Layout Shift
    
    // Resource Loading
    resources: {
      total: number;
      scripts: number;
      stylesheets: number;
      images: number;
      fonts: number;
    };
    
    // Memory (Chrome only)
    memory?: {
      usedJSHeapSize: number;
      totalJSHeapSize: number;
      jsHeapSizeLimit: number;
    };
  };
  scores: {
    fcp: 'good' | 'ok' | 'poor';
    lcp: 'good' | 'ok' | 'poor';
    fid: 'good' | 'ok' | 'poor';
    cls: 'good' | 'ok' | 'poor';
    overall: 'good' | 'ok' | 'poor';
  };
}

class PerformanceTester {
  private observers: PerformanceObserver[] = [];
  private metrics: Partial<PerformanceReport['metrics']> = {};
  
  /**
   * Initialize performance monitoring
   */
  init() {
    if (typeof window === 'undefined') return;
    
    this.measureNavigationTiming();
    this.measurePaintTiming();
    this.observeLCP();
    this.observeFID();
    this.observeCLS();
    this.measureResources();
    this.measureMemory();
  }
  
  /**
   * Measure Navigation Timing API metrics
   */
  private measureNavigationTiming() {
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      
      if (navigation) {
        this.metrics.ttfb = navigation.responseStart - navigation.requestStart;
        this.metrics.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.fetchStart;
        this.metrics.loadComplete = navigation.loadEventEnd - navigation.fetchStart;
      }
    } catch (error) {
      console.warn('Navigation timing not available:', error);
    }
  }
  
  /**
   * Measure Paint Timing
   */
  private measurePaintTiming() {
    try {
      const paintEntries = performance.getEntriesByType('paint');
      
      paintEntries.forEach((entry) => {
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
        }
      });
    } catch (error) {
      console.warn('Paint timing not available:', error);
    }
  }
  
  /**
   * Observe Largest Contentful Paint
   */
  private observeLCP() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1] as any;
        this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
      });
      
      observer.observe({ entryTypes: ['largest-contentful-paint'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('LCP observation failed:', error);
    }
  }
  
  /**
   * Observe First Input Delay
   */
  private observeFID() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          this.metrics.fid = entry.processingStart - entry.startTime;
        });
      });
      
      observer.observe({ entryTypes: ['first-input'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('FID observation failed:', error);
    }
  }
  
  /**
   * Observe Cumulative Layout Shift
   */
  private observeCLS() {
    if (!('PerformanceObserver' in window)) return;
    
    try {
      let clsValue = 0;
      
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
            this.metrics.cls = clsValue;
          }
        }
      });
      
      observer.observe({ entryTypes: ['layout-shift'] });
      this.observers.push(observer);
    } catch (error) {
      console.warn('CLS observation failed:', error);
    }
  }
  
  /**
   * Measure resource loading
   */
  private measureResources() {
    try {
      const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[];
      
      this.metrics.resources = {
        total: resources.length,
        scripts: resources.filter(r => r.initiatorType === 'script').length,
        stylesheets: resources.filter(r => r.initiatorType === 'css' || r.initiatorType === 'link').length,
        images: resources.filter(r => r.initiatorType === 'img').length,
        fonts: resources.filter(r => r.initiatorType === 'css' && r.name.includes('font')).length,
      };
    } catch (error) {
      console.warn('Resource measurement failed:', error);
    }
  }
  
  /**
   * Measure memory usage (Chrome only)
   */
  private measureMemory() {
    try {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        this.metrics.memory = {
          usedJSHeapSize: memory.usedJSHeapSize,
          totalJSHeapSize: memory.totalJSHeapSize,
          jsHeapSizeLimit: memory.jsHeapSizeLimit,
        };
      }
    } catch (error) {
      console.warn('Memory measurement not available:', error);
    }
  }
  
  /**
   * Calculate performance scores based on Core Web Vitals thresholds
   */
  private calculateScores(): PerformanceReport['scores'] {
    const fcpScore = this.getScore(this.metrics.fcp || 0, 1800, 3000);
    const lcpScore = this.getScore(this.metrics.lcp || 0, 2500, 4000);
    const fidScore = this.getScore(this.metrics.fid || 0, 100, 300);
    const clsScore = this.getScore(this.metrics.cls || 0, 0.1, 0.25);
    
    // Calculate overall score
    const scores = [fcpScore, lcpScore, fidScore, clsScore];
    const goodCount = scores.filter(s => s === 'good').length;
    const poorCount = scores.filter(s => s === 'poor').length;
    
    let overall: 'good' | 'ok' | 'poor';
    if (goodCount >= 3) overall = 'good';
    else if (poorCount >= 2) overall = 'poor';
    else overall = 'ok';
    
    return {
      fcp: fcpScore,
      lcp: lcpScore,
      fid: fidScore,
      cls: clsScore,
      overall,
    };
  }
  
  /**
   * Get score based on thresholds
   */
  private getScore(value: number, goodThreshold: number, poorThreshold: number): 'good' | 'ok' | 'poor' {
    if (value <= goodThreshold) return 'good';
    if (value <= poorThreshold) return 'ok';
    return 'poor';
  }
  
  /**
   * Generate comprehensive performance report
   */
  generateReport(): PerformanceReport {
    return {
      timestamp: Date.now(),
      url: window.location.href,
      metrics: {
        ttfb: this.metrics.ttfb || 0,
        domContentLoaded: this.metrics.domContentLoaded || 0,
        loadComplete: this.metrics.loadComplete || 0,
        fcp: this.metrics.fcp || 0,
        lcp: this.metrics.lcp || 0,
        fid: this.metrics.fid || 0,
        tti: this.metrics.tti || 0,
        tbt: this.metrics.tbt || 0,
        cls: this.metrics.cls || 0,
        resources: this.metrics.resources || { total: 0, scripts: 0, stylesheets: 0, images: 0, fonts: 0 },
        memory: this.metrics.memory,
      },
      scores: this.calculateScores(),
    };
  }
  
  /**
   * Log report to console
   */
  logReport() {
    const report = this.generateReport();
    
    console.group('🚀 Performance Report');
    console.log('URL:', report.url);
    console.log('Timestamp:', new Date(report.timestamp).toISOString());
    
    console.group('📊 Core Web Vitals');
    console.log(`FCP: ${Math.round(report.metrics.fcp)}ms (${report.scores.fcp})`);
    console.log(`LCP: ${Math.round(report.metrics.lcp)}ms (${report.scores.lcp})`);
    console.log(`FID: ${Math.round(report.metrics.fid)}ms (${report.scores.fid})`);
    console.log(`CLS: ${report.metrics.cls.toFixed(3)} (${report.scores.cls})`);
    console.groupEnd();
    
    console.group('⏱️ Timing Metrics');
    console.log(`TTFB: ${Math.round(report.metrics.ttfb)}ms`);
    console.log(`DOM Content Loaded: ${Math.round(report.metrics.domContentLoaded)}ms`);
    console.log(`Load Complete: ${Math.round(report.metrics.loadComplete)}ms`);
    console.groupEnd();
    
    console.group('📦 Resources');
    console.log(`Total: ${report.metrics.resources.total}`);
    console.log(`Scripts: ${report.metrics.resources.scripts}`);
    console.log(`Stylesheets: ${report.metrics.resources.stylesheets}`);
    console.log(`Images: ${report.metrics.resources.images}`);
    console.log(`Fonts: ${report.metrics.resources.fonts}`);
    console.groupEnd();
    
    if (report.metrics.memory) {
      console.group('💾 Memory Usage');
      console.log(`Used: ${(report.metrics.memory.usedJSHeapSize / 1048576).toFixed(2)} MB`);
      console.log(`Total: ${(report.metrics.memory.totalJSHeapSize / 1048576).toFixed(2)} MB`);
      console.log(`Limit: ${(report.metrics.memory.jsHeapSizeLimit / 1048576).toFixed(2)} MB`);
      console.groupEnd();
    }
    
    console.log(`🎯 Overall Score: ${report.scores.overall.toUpperCase()}`);
    console.groupEnd();
    
    return report;
  }
  
  /**
   * Cleanup observers
   */
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
  }
}

// Export singleton instance
export const performanceTester = new PerformanceTester();

/**
 * Initialize performance testing
 * Call this in your app initialization
 */
export function initPerformanceTesting() {
  if (typeof window === 'undefined') return;
  
  // Initialize tester
  performanceTester.init();
  
  // Log report after page load
  window.addEventListener('load', () => {
    setTimeout(() => {
      performanceTester.logReport();
    }, 3000); // Wait 3s for all metrics to be collected
  });
  
  // Allow manual report generation via console
  if (window.location.hostname === 'localhost') {
    (window as any).__performanceReport = () => performanceTester.logReport();
    console.log('💡 Tip: Run __performanceReport() in console to see performance metrics');
  }
}

/**
 * Compare two performance reports
 */
export function compareReports(before: PerformanceReport, after: PerformanceReport) {
  const improvement = (metric: keyof PerformanceReport['metrics']) => {
    const beforeValue = before.metrics[metric] as number;
    const afterValue = after.metrics[metric] as number;
    
    if (!beforeValue || !afterValue) return null;
    
    const diff = beforeValue - afterValue;
    const percentage = ((diff / beforeValue) * 100).toFixed(1);
    
    return {
      before: beforeValue,
      after: afterValue,
      diff,
      percentage: `${percentage}%`,
      improved: diff > 0,
    };
  };
  
  return {
    fcp: improvement('fcp'),
    lcp: improvement('lcp'),
    fid: improvement('fid'),
    cls: improvement('cls'),
    ttfb: improvement('ttfb'),
    domContentLoaded: improvement('domContentLoaded'),
    loadComplete: improvement('loadComplete'),
  };
}
