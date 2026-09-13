import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, TrendingUp } from 'lucide-react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';

interface PerformanceMetrics {
  fcp: number | null; // First Contentful Paint
  lcp: number | null; // Largest Contentful Paint
  fid: number | null; // First Input Delay
  cls: number | null; // Cumulative Layout Shift
  ttfb: number | null; // Time to First Byte
  domContentLoaded: number | null;
  loadComplete: number | null;
  memoryUsage: number | null;
}

/**
 * Real-time Performance Monitor
 * Displays actual performance metrics from the browser
 */
export function PerformanceMonitor() {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fcp: null,
    lcp: null,
    fid: null,
    cls: null,
    ttfb: null,
    domContentLoaded: null,
    loadComplete: null,
    memoryUsage: null,
  });
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Only show in development or when ?performance=true is in URL
    const shouldShow = 
      window.location.hostname === 'localhost' || 
      window.location.search.includes('performance=true');
    
    setIsVisible(shouldShow);
    if (!shouldShow) return;

    // Measure performance metrics
    const measurePerformance = () => {
      try {
        // Get navigation timing
        const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        
        if (navigation) {
          setMetrics(prev => ({
            ...prev,
            ttfb: navigation.responseStart - navigation.requestStart,
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.fetchStart,
            loadComplete: navigation.loadEventEnd - navigation.fetchStart,
          }));
        }

        // Get paint timing
        const paintEntries = performance.getEntriesByType('paint');
        paintEntries.forEach((entry) => {
          if (entry.name === 'first-contentful-paint') {
            setMetrics(prev => ({ ...prev, fcp: entry.startTime }));
          }
        });

        // Get LCP using PerformanceObserver
        if ('PerformanceObserver' in window) {
          try {
            const lcpObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              const lastEntry = entries[entries.length - 1] as any;
              setMetrics(prev => ({ ...prev, lcp: lastEntry.renderTime || lastEntry.loadTime }));
            });
            lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });

            // FID observer
            const fidObserver = new PerformanceObserver((list) => {
              const entries = list.getEntries();
              entries.forEach((entry: any) => {
                setMetrics(prev => ({ ...prev, fid: entry.processingStart - entry.startTime }));
              });
            });
            fidObserver.observe({ entryTypes: ['first-input'] });

            // CLS observer
            let clsValue = 0;
            const clsObserver = new PerformanceObserver((list) => {
              for (const entry of list.getEntries() as any[]) {
                if (!entry.hadRecentInput) {
                  clsValue += entry.value;
                  setMetrics(prev => ({ ...prev, cls: clsValue }));
                }
              }
            });
            clsObserver.observe({ entryTypes: ['layout-shift'] });
          } catch (e) {
            console.log('Performance Observer not fully supported');
          }
        }

        // Get memory usage (Chrome only)
        if ('memory' in performance) {
          const memory = (performance as any).memory;
          setMetrics(prev => ({
            ...prev,
            memoryUsage: memory.usedJSHeapSize / 1048576, // Convert to MB
          }));
        }
      } catch (error) {
        console.error('Performance measurement error:', error);
      }
    };

    // Measure immediately
    measurePerformance();

    // Measure after load
    window.addEventListener('load', () => {
      setTimeout(measurePerformance, 0);
      setTimeout(measurePerformance, 1000);
      setTimeout(measurePerformance, 3000);
    });

    // Update memory usage periodically
    const memoryInterval = setInterval(() => {
      if ('memory' in performance) {
        const memory = (performance as any).memory;
        setMetrics(prev => ({
          ...prev,
          memoryUsage: memory.usedJSHeapSize / 1048576,
        }));
      }
    }, 5000);

    return () => clearInterval(memoryInterval);
  }, []);

  if (!isVisible) return null;

  const getScoreColor = (value: number | null, metric: string): string => {
    if (value === null) return 'bg-muted';
    
    switch (metric) {
      case 'fcp':
        return value < 1800 ? 'bg-success' : value < 3000 ? 'bg-warning' : 'bg-error';
      case 'lcp':
        return value < 2500 ? 'bg-success' : value < 4000 ? 'bg-warning' : 'bg-error';
      case 'fid':
        return value < 100 ? 'bg-success' : value < 300 ? 'bg-warning' : 'bg-error';
      case 'cls':
        return value < 0.1 ? 'bg-success' : value < 0.25 ? 'bg-warning' : 'bg-error';
      default:
        return 'bg-info';
    }
  };

  const formatValue = (value: number | null, unit: string = 'ms'): string => {
    if (value === null) return '---';
    if (unit === 'MB') return `${value.toFixed(1)} MB`;
    if (unit === 'score') return value.toFixed(3);
    return `${Math.round(value)} ms`;
  };

  return (
    <div className="fixed bottom-20 lg:bottom-4 right-4 z-50 max-w-sm">
      <Card className="bg-background/95 backdrop-blur-xl border-2 border-primary/20 shadow-2xl">
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-primary" />
              <h3 className="font-semibold">Performance Monitor</h3>
            </div>
            <Badge variant="outline" className="gap-1">
              <Zap className="w-3 h-3" />
              Live
            </Badge>
          </div>

          {/* Core Web Vitals */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              Core Web Vitals
            </h4>
            
            <div className="grid grid-cols-2 gap-2">
              {/* FCP */}
              <div className="bg-card border border-border rounded-xl p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">FCP</span>
                  <div className={`w-2 h-2 rounded-full ${getScoreColor(metrics.fcp, 'fcp')}`} />
                </div>
                <p className="text-sm font-semibold">{formatValue(metrics.fcp)}</p>
              </div>

              {/* LCP */}
              <div className="bg-card border border-border rounded-xl p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">LCP</span>
                  <div className={`w-2 h-2 rounded-full ${getScoreColor(metrics.lcp, 'lcp')}`} />
                </div>
                <p className="text-sm font-semibold">{formatValue(metrics.lcp)}</p>
              </div>

              {/* FID */}
              <div className="bg-card border border-border rounded-xl p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">FID</span>
                  <div className={`w-2 h-2 rounded-full ${getScoreColor(metrics.fid, 'fid')}`} />
                </div>
                <p className="text-sm font-semibold">{formatValue(metrics.fid)}</p>
              </div>

              {/* CLS */}
              <div className="bg-card border border-border rounded-xl p-2">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-muted-foreground">CLS</span>
                  <div className={`w-2 h-2 rounded-full ${getScoreColor(metrics.cls, 'cls')}`} />
                </div>
                <p className="text-sm font-semibold">{formatValue(metrics.cls, 'score')}</p>
              </div>
            </div>
          </div>

          {/* Additional Metrics */}
          <div className="space-y-2">
            <h4 className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Loading Metrics
            </h4>
            
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">TTFB</span>
                <span className="font-medium">{formatValue(metrics.ttfb)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">DOM Content Loaded</span>
                <span className="font-medium">{formatValue(metrics.domContentLoaded)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Load Complete</span>
                <span className="font-medium">{formatValue(metrics.loadComplete)}</span>
              </div>
              {metrics.memoryUsage !== null && (
                <div className="flex justify-between text-xs">
                  <span className="text-muted-foreground">Memory Usage</span>
                  <span className="font-medium">{formatValue(metrics.memoryUsage, 'MB')}</span>
                </div>
              )}
            </div>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-3 pt-2 border-t border-border">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-success" />
              <span className="text-xs text-muted-foreground">Good</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-warning" />
              <span className="text-xs text-muted-foreground">OK</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-error" />
              <span className="text-xs text-muted-foreground">Poor</span>
            </div>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground">
            Add ?performance=true to URL to enable in production
          </p>
        </div>
      </Card>
    </div>
  );
}

/**
 * Lightweight Performance Badge
 * Shows simplified performance status
 */
export function PerformanceBadge() {
  const [fcp, setFcp] = useState<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const shouldShow = 
      window.location.hostname === 'localhost' || 
      window.location.search.includes('performance=true');
    
    setIsVisible(shouldShow);
    if (!shouldShow) return;

    const paintEntries = performance.getEntriesByType('paint');
    paintEntries.forEach((entry) => {
      if (entry.name === 'first-contentful-paint') {
        setFcp(entry.startTime);
      }
    });
  }, []);

  if (!isVisible || fcp === null) return null;

  const isGood = fcp < 1800;
  const isOk = fcp >= 1800 && fcp < 3000;

  return (
    <Badge 
      variant={isGood ? 'default' : isOk ? 'secondary' : 'destructive'}
      className="fixed top-20 right-4 z-50 gap-1"
    >
      <Zap className="w-3 h-3" />
      FCP: {Math.round(fcp)}ms
    </Badge>
  );
}
