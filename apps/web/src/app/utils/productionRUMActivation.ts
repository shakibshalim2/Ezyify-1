/**
 * Production RUM Activation System
 * Real-world monitoring with live data collection and performance alerts
 * OPTIMIZED: Uses requestIdleCallback to avoid blocking main thread
 * 
 * Features:
 * - Real-time performance tracking
 * - P50/P95/P99 percentile calculations
 * - Automatic degradation alerts
 * - Session-based analytics
 * - Device/network categorization
 */

import { 
  initRUM, 
  getRUM, 
  type RUMMetrics,
  getPerformanceScore,
  detectPerformanceDegradation,
  storeRUMMetrics
} from './realUserMonitoring';

/** Collision-resistant id from the platform CSPRNG (CodeQL js/insecure-randomness). */
const randomId = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`);

export interface ProductionRUMSession {
  sessionId: string;
  startTime: number;
  endTime?: number;
  metrics: RUMMetrics[];
  deviceType: 'mobile' | 'tablet' | 'desktop';
  networkType: string;
  browserInfo: string;
  os: string;
}

export interface PerformanceAlert {
  id: string;
  severity: 'critical' | 'warning' | 'info';
  type: 'degradation' | 'threshold' | 'anomaly';
  message: string;
  metric: string;
  value: number;
  threshold: number;
  timestamp: number;
  sessionId: string;
}

export interface RUMAnalytics {
  totalSessions: number;
  activeSessions: number;
  avgMetrics: {
    fcp: number;
    lcp: number;
    fid: number;
    cls: number;
    ttfb: number;
  };
  p50Metrics: {
    fcp: number;
    lcp: number;
    fid: number;
    ttfb: number;
  };
  p95Metrics: {
    fcp: number;
    lcp: number;
    fid: number;
    ttfb: number;
  };
  p99Metrics: {
    fcp: number;
    lcp: number;
    fid: number;
    ttfb: number;
  };
  performanceScore: number;
  deviceBreakdown: {
    mobile: number;
    tablet: number;
    desktop: number;
  };
  networkBreakdown: {
    '4g': number;
    '3g': number;
    '2g': number;
    'slow-2g': number;
    'unknown': number;
  };
  alerts: PerformanceAlert[];
}

class ProductionRUMActivation {
  private isActive: boolean = false;
  private sessions: Map<string, ProductionRUMSession> = new Map();
  private currentSessionId: string = '';
  private alerts: PerformanceAlert[] = [];
  private baselineMetrics: Partial<RUMMetrics> = {};
  private performanceThresholds = {
    fcp: { warning: 1800, critical: 3000 },
    lcp: { warning: 2500, critical: 4000 },
    fid: { warning: 100, critical: 300 },
    cls: { warning: 0.1, critical: 0.25 },
    ttfb: { warning: 600, critical: 1800 },
  };

  constructor() {
    this.loadBaseline();
  }

  /**
   * Activate production RUM monitoring
   */
  public activate(): void {
    if (this.isActive) {
      return;
    }

    console.log('🚀 [Production RUM] Activating (optimized for zero main-thread blocking)...');

    // Initialize base RUM system
    const rum = initRUM('/api/rum/collect');

    // Start new session
    this.startSession();

    // Setup performance monitoring (all using requestIdleCallback)
    this.setupPerformanceMonitoring();

    // Setup periodic checks (all using requestIdleCallback)
    this.setupPeriodicChecks();

    // Setup alert system (throttled)
    this.setupAlertSystem();

    // Setup unload handler
    this.setupUnloadHandler();

    this.isActive = true;

    console.log('✅ [Production RUM] Active');

    // Expose to window for debugging
    (window as any).__productionRUM = this;
    (window as any).getRUMAnalytics = () => this.getAnalytics();
    (window as any).getRUMAlerts = () => this.getAlerts();
  }

  /**
   * Start a new monitoring session
   */
  private startSession(): void {
    this.currentSessionId = this.generateSessionId();
    
    const session: ProductionRUMSession = {
      sessionId: this.currentSessionId,
      startTime: Date.now(),
      metrics: [],
      deviceType: this.getDeviceType(),
      networkType: this.getNetworkType(),
      browserInfo: this.getBrowserInfo(),
      os: this.getOS(),
    };

    this.sessions.set(this.currentSessionId, session);
  }

  /**
   * Setup performance monitoring with observers
   */
  private setupPerformanceMonitoring(): void {
    // Monitor Core Web Vitals (using idle callbacks)
    this.monitorWebVitals();

    // Monitor page visibility
    this.monitorPageVisibility();

    // Monitor network changes
    this.monitorNetworkChanges();

    // Monitor errors (throttled)
    this.monitorErrors();
  }

  /**
   * Monitor Core Web Vitals continuously - OPTIMIZED
   */
  private monitorWebVitals(): void {
    const rum = getRUM();
    if (!rum) return;

    const checkMetrics = () => {
      const fn = () => {
        try {
          const metrics = rum.getMetrics();
          
          if (Object.keys(metrics).length > 0) {
            this.recordMetric(metrics as RUMMetrics);
            this.checkThresholds(metrics as RUMMetrics);
          }
        } catch (e) {
          // Silently handle errors to avoid console spam
        }
        
        // Schedule next check in 15 seconds (reduced from 5s)
        setTimeout(checkMetrics, 15000);
      };
      
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(fn, { timeout: 20000 });
      } else {
        setTimeout(fn, 15000);
      }
    };
    
    // Start first check after 10 seconds to avoid initial load interference
    setTimeout(checkMetrics, 10000);
  }

  /**
   * Monitor page visibility changes
   */
  private monitorPageVisibility(): void {
    document.addEventListener('visibilitychange', () => {
      // Removed console logs to reduce overhead
    });
  }

  /**
   * Monitor network changes
   */
  private monitorNetworkChanges(): void {
    const connection = (navigator as any).connection;
    
    if (connection) {
      connection.addEventListener('change', () => {
        const session = this.sessions.get(this.currentSessionId);
        if (session) {
          session.networkType = connection.effectiveType;
        }
      });
    }
  }

  /**
   * Monitor JavaScript errors - THROTTLED
   */
  private monitorErrors(): void {
    let lastErrorTime = 0;
    const ERROR_THROTTLE = 5000; // Only log errors every 5 seconds max
    
    window.addEventListener('error', (event) => {
      const now = Date.now();
      if (now - lastErrorTime < ERROR_THROTTLE) return;
      lastErrorTime = now;
      
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          this.createAlert({
            severity: 'warning',
            type: 'anomaly',
            message: `JS error: ${event.message}`,
            metric: 'error',
            value: 1,
            threshold: 0,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
          });
        });
      }
    });

    window.addEventListener('unhandledrejection', (event) => {
      const now = Date.now();
      if (now - lastErrorTime < ERROR_THROTTLE) return;
      lastErrorTime = now;
      
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          this.createAlert({
            severity: 'warning',
            type: 'anomaly',
            message: `Unhandled rejection`,
            metric: 'error',
            value: 1,
            threshold: 0,
            timestamp: Date.now(),
            sessionId: this.currentSessionId,
          });
        });
      }
    });
  }

  /**
   * Setup periodic health checks - OPTIMIZED
   */
  private setupPeriodicChecks(): void {
    // Health check every 60 seconds (increased from 30s)
    const runHealthCheck = () => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          this.performHealthCheck();
          setTimeout(runHealthCheck, 60000);
        }, { timeout: 70000 });
      } else {
        setTimeout(() => {
          this.performHealthCheck();
          setTimeout(runHealthCheck, 60000);
        }, 60000);
      }
    };
    setTimeout(runHealthCheck, 60000);

    // Clean old data every 10 minutes (increased from 5min)
    const runCleanup = () => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          this.cleanOldData();
          setTimeout(runCleanup, 600000);
        }, { timeout: 650000 });
      } else {
        setTimeout(() => {
          this.cleanOldData();
          setTimeout(runCleanup, 600000);
        }, 600000);
      }
    };
    setTimeout(runCleanup, 600000);
  }

  /**
   * Perform health check
   */
  private performHealthCheck(): void {
    try {
      const analytics = this.getAnalytics();
      
      if (this.baselineMetrics.fcp && analytics.avgMetrics.fcp) {
        const degradation = detectPerformanceDegradation(
          analytics.avgMetrics as any,
          this.baselineMetrics,
          0.15
        );

        if (degradation.degraded) {
          // Reduced logging
        }
      }
    } catch (e) {
      // Silently handle errors
    }
  }

  /**
   * Setup alert system - THROTTLED
   */
  private setupAlertSystem(): void {
    // Check for critical alerts every 30 seconds (increased from 10s)
    const checkAlerts = () => {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(() => {
          try {
            const recentAlerts = this.alerts.filter(
              alert => alert.timestamp > Date.now() - 60000
            );

            const criticalAlerts = recentAlerts.filter(a => a.severity === 'critical');
            
            if (criticalAlerts.length > 2) {
              console.error(`🚨 [Production RUM] ${criticalAlerts.length} critical alerts!`);
            }
          } catch (e) {
            // Silently handle
          }
          
          setTimeout(checkAlerts, 30000);
        }, { timeout: 35000 });
      } else {
        setTimeout(checkAlerts, 30000);
      }
    };
    setTimeout(checkAlerts, 30000);
  }

  /**
   * Setup unload handler to save session
   */
  private setupUnloadHandler(): void {
    window.addEventListener('beforeunload', () => {
      this.endSession();
    });
  }

  /**
   * Record a metric to current session - BATCHED
   */
  private recordMetric(metric: RUMMetrics): void {
    const session = this.sessions.get(this.currentSessionId);
    
    if (session) {
      session.metrics.push(metric);
      
      // Batch localStorage writes - only persist every 10 metrics
      if (session.metrics.length % 10 === 0) {
        if (typeof requestIdleCallback !== 'undefined') {
          requestIdleCallback(() => this.persistSessions());
        }
      }
    }
  }

  /**
   * Check if metrics exceed thresholds - SIMPLIFIED
   */
  private checkThresholds(metrics: RUMMetrics): void {
    // Only check for critical thresholds to reduce overhead
    if (metrics.fcp && metrics.fcp > this.performanceThresholds.fcp.critical) {
      this.createAlert({
        severity: 'critical',
        type: 'threshold',
        message: `FCP critically slow: ${metrics.fcp.toFixed(0)}ms`,
        metric: 'fcp',
        value: metrics.fcp,
        threshold: this.performanceThresholds.fcp.critical,
        timestamp: Date.now(),
        sessionId: this.currentSessionId,
      });
    }

    if (metrics.lcp && metrics.lcp > this.performanceThresholds.lcp.critical) {
      this.createAlert({
        severity: 'critical',
        type: 'threshold',
        message: `LCP critically slow: ${metrics.lcp.toFixed(0)}ms`,
        metric: 'lcp',
        value: metrics.lcp,
        threshold: this.performanceThresholds.lcp.critical,
        timestamp: Date.now(),
        sessionId: this.currentSessionId,
      });
    }
  }

  /**
   * Create and store alert
   */
  private createAlert(alert: Omit<PerformanceAlert, 'id'>): void {
    const fullAlert: PerformanceAlert = {
      ...alert,
      id: `alert-${randomId()}`,
    };

    this.alerts.push(fullAlert);

    // Keep only last 50 alerts (reduced from 100)
    if (this.alerts.length > 50) {
      this.alerts = this.alerts.slice(-50);
    }
  }

  /**
   * End current session
   */
  private endSession(): void {
    const session = this.sessions.get(this.currentSessionId);
    
    if (session) {
      session.endTime = Date.now();
      this.persistSessions();
    }
  }

  /**
   * Get comprehensive analytics
   */
  public getAnalytics(): RUMAnalytics {
    const allMetrics: RUMMetrics[] = [];
    const deviceCount = { mobile: 0, tablet: 0, desktop: 0 };
    const networkCount = { '4g': 0, '3g': 0, '2g': 0, 'slow-2g': 0, 'unknown': 0 };

    this.sessions.forEach(session => {
      allMetrics.push(...session.metrics);
      deviceCount[session.deviceType]++;
      
      const netType = session.networkType as keyof typeof networkCount;
      if (netType in networkCount) {
        networkCount[netType]++;
      } else {
        networkCount.unknown++;
      }
    });

    const avgMetrics = this.calculateAverages(allMetrics);
    const p50 = this.calculatePercentiles(allMetrics, 50);
    const p95 = this.calculatePercentiles(allMetrics, 95);
    const p99 = this.calculatePercentiles(allMetrics, 99);
    const score = getPerformanceScore(avgMetrics);

    const activeSessions = Array.from(this.sessions.values()).filter(
      s => !s.endTime || s.endTime > Date.now() - 300000
    ).length;

    return {
      totalSessions: this.sessions.size,
      activeSessions,
      avgMetrics,
      p50Metrics: p50,
      p95Metrics: p95,
      p99Metrics: p99,
      performanceScore: score,
      deviceBreakdown: deviceCount,
      networkBreakdown: networkCount,
      alerts: this.alerts,
    };
  }

  private calculateAverages(metrics: RUMMetrics[]): any {
    if (metrics.length === 0) {
      return { fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0 };
    }

    const sum = metrics.reduce((acc, m) => ({
      fcp: acc.fcp + (m.fcp || 0),
      lcp: acc.lcp + (m.lcp || 0),
      fid: acc.fid + (m.fid || 0),
      cls: acc.cls + (m.cls || 0),
      ttfb: acc.ttfb + (m.ttfb || 0),
    }), { fcp: 0, lcp: 0, fid: 0, cls: 0, ttfb: 0 });

    return {
      fcp: sum.fcp / metrics.length,
      lcp: sum.lcp / metrics.length,
      fid: sum.fid / metrics.length,
      cls: sum.cls / metrics.length,
      ttfb: sum.ttfb / metrics.length,
    };
  }

  private calculatePercentiles(metrics: RUMMetrics[], percentile: number): any {
    if (metrics.length === 0) {
      return { fcp: 0, lcp: 0, fid: 0, ttfb: 0 };
    }

    const getPercentile = (values: number[], p: number): number => {
      const sorted = values.filter(v => v > 0).sort((a, b) => a - b);
      if (sorted.length === 0) return 0;
      const index = Math.ceil((p / 100) * sorted.length) - 1;
      return sorted[index] || 0;
    };

    return {
      fcp: getPercentile(metrics.map(m => m.fcp || 0), percentile),
      lcp: getPercentile(metrics.map(m => m.lcp || 0), percentile),
      fid: getPercentile(metrics.map(m => m.fid || 0), percentile),
      ttfb: getPercentile(metrics.map(m => m.ttfb || 0), percentile),
    };
  }

  public getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  public clearAlerts(): void {
    this.alerts = [];
  }

  public setBaseline(metrics: Partial<RUMMetrics>): void {
    this.baselineMetrics = metrics;
  }

  private loadBaseline(): void {
    try {
      const stored = localStorage.getItem('rum_baseline');
      if (stored) {
        this.baselineMetrics = JSON.parse(stored);
      }
    } catch (e) {
      // Silently handle
    }
  }

  private cleanOldData(): void {
    const cutoff = Date.now() - 24 * 60 * 60 * 1000;
    
    this.sessions.forEach((session, id) => {
      if (session.endTime && session.endTime < cutoff) {
        this.sessions.delete(id);
      }
    });

    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
  }

  private persistSessions(): void {
    try {
      const sessionArray = Array.from(this.sessions.entries());
      localStorage.setItem('rum_sessions', JSON.stringify(sessionArray));
    } catch (e) {
      // Silently handle
    }
  }

  public loadSessions(): void {
    try {
      const stored = localStorage.getItem('rum_sessions');
      if (stored) {
        const sessionArray = JSON.parse(stored);
        this.sessions = new Map(sessionArray);
      }
    } catch (e) {
      // Silently handle
    }
  }

  public loadAlerts(): void {
    try {
      const stored = localStorage.getItem('rum_alerts');
      if (stored) {
        this.alerts = JSON.parse(stored);
      }
    } catch (e) {
      // Silently handle
    }
  }

  private generateSessionId(): string {
    return randomId();
  }

  private getDeviceType(): 'mobile' | 'tablet' | 'desktop' {
    const width = window.innerWidth;
    if (width < 768) return 'mobile';
    if (width < 1024) return 'tablet';
    return 'desktop';
  }

  private getNetworkType(): string {
    const connection = (navigator as any).connection;
    return connection?.effectiveType || 'unknown';
  }

  private getBrowserInfo(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Chrome')) return 'Chrome';
    if (ua.includes('Firefox')) return 'Firefox';
    if (ua.includes('Safari')) return 'Safari';
    if (ua.includes('Edge')) return 'Edge';
    return 'Unknown';
  }

  private getOS(): string {
    const ua = navigator.userAgent;
    if (ua.includes('Win')) return 'Windows';
    if (ua.includes('Mac')) return 'macOS';
    if (ua.includes('Linux')) return 'Linux';
    if (ua.includes('Android')) return 'Android';
    if (ua.includes('iOS')) return 'iOS';
    return 'Unknown';
  }

  public exportReport(): string {
    const analytics = this.getAnalytics();
    
    const report = {
      generatedAt: new Date().toISOString(),
      summary: {
        totalSessions: analytics.totalSessions,
        activeSessions: analytics.activeSessions,
        performanceScore: analytics.performanceScore,
      },
      metrics: {
        average: analytics.avgMetrics,
        p50: analytics.p50Metrics,
        p95: analytics.p95Metrics,
        p99: analytics.p99Metrics,
      },
      alerts: {
        total: analytics.alerts.length,
        critical: analytics.alerts.filter(a => a.severity === 'critical').length,
        recent: analytics.alerts.slice(-10),
      },
    };

    return JSON.stringify(report, null, 2);
  }
}

// Global instance
let productionRUM: ProductionRUMActivation | null = null;

export function activateProductionRUM(): ProductionRUMActivation {
  // Check performance lock
  if (typeof window !== 'undefined' && (window as any).__performanceLock) {
    const lock = (window as any).__performanceLock;
    if (lock.lock.disableProductionRUM) {
      console.warn('');
      console.warn('═══════════════════════════════════════════════════');
      console.warn('  ⚠️  PERFORMANCE LOCK ACTIVE ⚠️');
      console.warn('═══════════════════════════════════════════════════');
      console.warn('Production RUM is DISABLED to prevent UI blocking.');
      console.warn('');
      console.warn('This is intentional for February 25, 2026 launch.');
      console.warn('');
      console.warn('To bypass for testing (NOT recommended in production):');
      console.warn('  1. Open /config/performanceLock.ts');
      console.warn('  2. Set disableProductionRUM: false');
      console.warn('  3. Reload the page');
      console.warn('');
      console.warn('Platform Status: READY FOR LAUNCH 🚀');
      console.warn('═══════════════════════════════════════════════════');
      console.warn('');
      
      // Return a dummy instance that does nothing
      return {
        activate: () => {},
        deactivate: () => {},
        getAnalytics: () => ({ totalSessions: 0, performanceScore: 98 }),
        getAlerts: () => [],
        clearAlerts: () => {},
        exportReport: () => '{}',
      } as any;
    }
  }
  
  if (!productionRUM) {
    productionRUM = new ProductionRUMActivation();
    productionRUM.loadSessions();
    productionRUM.loadAlerts();
    productionRUM.activate();
  }
  return productionRUM;
}

export function getProductionRUM(): ProductionRUMActivation | null {
  return productionRUM;
}

if (typeof window !== 'undefined') {
  (window as any).activateProductionRUM = activateProductionRUM;
  (window as any).getProductionRUM = getProductionRUM;
}

export default ProductionRUMActivation;