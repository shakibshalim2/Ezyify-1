import React, { useState, useEffect } from 'react';
import { Activity, Zap, Clock, AlertTriangle, CheckCircle, TrendingUp, BarChart3, Bell, Users, Wifi, Monitor } from 'lucide-react';

export default function PerformanceMonitoringDashboard() {
  const [longTaskStats, setLongTaskStats] = useState<any>(null);
  const [rumMetrics, setRumMetrics] = useState<any>(null);
  const [rumAnalytics, setRumAnalytics] = useState<any>(null);
  const [rumAlerts, setRumAlerts] = useState<any[]>([]);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [activeTab, setActiveTab] = useState<'long-tasks' | 'rum-analytics' | 'alerts'>('long-tasks');

  useEffect(() => {
    // Activate Production RUM on mount - DISABLED FOR PERFORMANCE LOCK
    // DO NOT auto-activate RUM - use manual activation only
    // if (typeof (window as any).activateProductionRUM === 'function') {
    //   (window as any).activateProductionRUM();
    // }
    
    updateStats();

    if (autoRefresh) {
      const interval = setInterval(updateStats, 5000);
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const updateStats = () => {
    // Get long task stats
    if (typeof (window as any).getLongTaskStats === 'function') {
      const stats = (window as any).getLongTaskStats();
      setLongTaskStats(stats);
    }

    // Get RUM metrics (if available)
    if (typeof (window as any).getRUMMetrics === 'function') {
      const metrics = (window as any).getRUMMetrics();
      setRumMetrics(metrics);
    }

    // Get Production RUM analytics
    if (typeof (window as any).getRUMAnalytics === 'function') {
      const analytics = (window as any).getRUMAnalytics();
      setRumAnalytics(analytics);
    }

    // Get RUM alerts
    if (typeof (window as any).getRUMAlerts === 'function') {
      const alerts = (window as any).getRUMAlerts();
      setRumAlerts(alerts || []);
    }
  };

  const runValidation = () => {
    if (typeof (window as any).validateLongTasks === 'function') {
      (window as any).validateLongTasks();
    }
  };

  const resetStats = () => {
    if (typeof (window as any).resetLongTaskValidator === 'function') {
      (window as any).resetLongTaskValidator();
      updateStats();
    }
  };

  const clearRUMAlerts = () => {
    const rum = (window as any).getProductionRUM?.();
    if (rum && typeof rum.clearAlerts === 'function') {
      rum.clearAlerts();
      setRumAlerts([]);
    }
  };

  const exportRUMReport = () => {
    const rum = (window as any).getProductionRUM?.();
    if (rum && typeof rum.exportReport === 'function') {
      const report = rum.exportReport();
      const blob = new Blob([report], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `rum-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const getStatusColor = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return 'text-success';
    if (value <= thresholds.warning) return 'text-warning';
    return 'text-error';
  };

  const getStatusIcon = (value: number, thresholds: { good: number; warning: number }) => {
    if (value <= thresholds.good) return <CheckCircle className="w-5 h-5 text-success" />;
    if (value <= thresholds.warning) return <AlertTriangle className="w-5 h-5 text-warning" />;
    return <AlertTriangle className="w-5 h-5 text-error" />;
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Activity className="w-8 h-8 text-primary" />
              Performance Monitoring Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Real-time performance validation and long task detection
            </p>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded"
              />
              Auto-refresh (5s)
            </label>
            <button
              onClick={updateStats}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors"
            >
              Refresh Now
            </button>
          </div>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Total Tasks</span>
              <BarChart3 className="w-5 h-5 text-info" />
            </div>
            <div className="text-3xl font-bold text-foreground">
              {longTaskStats?.totalTasks || 0}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Long Tasks (&gt;50ms)</span>
              <Zap className="w-5 h-5 text-warning" />
            </div>
            <div className={`text-3xl font-bold ${getStatusColor(longTaskStats?.longTasks || 0, { good: 0, warning: 3 })}`}>
              {longTaskStats?.longTasks || 0}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Max Duration</span>
              <Clock className="w-5 h-5 text-warning" />
            </div>
            <div className={`text-3xl font-bold ${getStatusColor(longTaskStats?.maxDuration || 0, { good: 50, warning: 100 })}`}>
              {longTaskStats?.maxDuration?.toFixed(0) || 0}ms
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-muted-foreground text-sm">Status</span>
              <TrendingUp className="w-5 h-5 text-success" />
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(longTaskStats?.longTasks || 0, { good: 0, warning: 3 })}
              <span className={`text-lg font-bold ${getStatusColor(longTaskStats?.longTasks || 0, { good: 0, warning: 3 })}`}>
                {(longTaskStats?.longTasks || 0) === 0 ? 'Excellent' : 
                 (longTaskStats?.longTasks || 0) <= 3 ? 'Good' : 'Needs Work'}
              </span>
            </div>
          </div>
        </div>

        {/* Long Task Details */}
        {longTaskStats && longTaskStats.tasks && longTaskStats.tasks.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Detected Long Tasks
            </h2>
            <div className="space-y-2">
              {longTaskStats.tasks.map((task: any, idx: number) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-xl"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-mono text-muted-foreground">#{idx + 1}</span>
                    <div>
                      <div className="font-medium text-foreground">
                        {task.duration.toFixed(2)}ms
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Started at {task.startTime.toFixed(2)}ms
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-muted-foreground font-mono">
                    {task.attribution || 'unknown'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* No Long Tasks - Success State */}
        {longTaskStats && (!longTaskStats.tasks || longTaskStats.tasks.length === 0) && (
          <div className="bg-success/10 border border-success/20 rounded-2xl p-8 text-center">
            <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-success mb-2">
              🎉 No Long Tasks Detected!
            </h2>
            <p className="text-muted-foreground">
              Your application is running smoothly with excellent performance.
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={runValidation}
            className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors font-medium"
          >
            Run Full Validation
          </button>
          <button
            onClick={resetStats}
            className="px-6 py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-colors font-medium"
          >
            Reset Statistics
          </button>
        </div>

        {/* Performance Thresholds */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Performance Thresholds</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-success/8 border border-success/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-5 h-5 text-success" />
                <span className="font-medium text-success">Excellent</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 0 long tasks</li>
                <li>• All tasks &lt;50ms</li>
                <li>• Instant UI response</li>
              </ul>
            </div>

            <div className="p-4 bg-warning/8 border border-warning/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                <span className="font-medium text-warning">Good</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 1-3 long tasks</li>
                <li>• Max task &lt;100ms</li>
                <li>• Minor delays possible</li>
              </ul>
            </div>

            <div className="p-4 bg-error/8 border border-error/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-5 h-5 text-error" />
                <span className="font-medium text-error">Needs Work</span>
              </div>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• 4+ long tasks</li>
                <li>• Tasks &gt;100ms</li>
                <li>• Noticeable UI lag</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Console Commands */}
        <div className="bg-card border border-border rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4">Console Commands</h2>
          <div className="space-y-2 font-mono text-sm">
            <div className="p-3 bg-muted rounded">
              <code className="text-primary">window.validateLongTasks()</code>
              <span className="text-muted-foreground ml-2">- Run validation report</span>
            </div>
            <div className="p-3 bg-muted rounded">
              <code className="text-primary">window.getLongTaskStats()</code>
              <span className="text-muted-foreground ml-2">- Get current statistics</span>
            </div>
            <div className="p-3 bg-muted rounded">
              <code className="text-primary">window.resetLongTaskValidator()</code>
              <span className="text-muted-foreground ml-2">- Reset monitoring</span>
            </div>
          </div>
        </div>

        {/* Optimization Tips */}
        <div className="bg-info/10 border border-info/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
            💡 Optimization Tips
          </h2>
          <ul className="space-y-2 text-muted-foreground">
            <li>• Use <code className="text-primary">requestIdleCallback</code> for heavy operations</li>
            <li>• Split large tasks into micro-tasks (&lt;50ms each)</li>
            <li>• Defer non-critical initialization to idle time</li>
            <li>• Use async <code className="text-primary">import()</code> instead of synchronous <code className="text-primary">require()</code></li>
            <li>• Batch component definitions and load progressively</li>
            <li>• Monitor console for RUM warnings during development</li>
          </ul>
        </div>

        {/* Production RUM Analytics */}
        {rumAnalytics && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
                📊 Production RUM Analytics
              </h2>
              <button
                onClick={exportRUMReport}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-colors text-sm"
              >
                Export Report
              </button>
            </div>

            {/* RUM Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-muted/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Users className="w-4 h-4 text-info" />
                  <span className="text-xs text-muted-foreground">Sessions</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {rumAnalytics.totalSessions || 0}
                </div>
                <div className="text-xs text-success mt-1">
                  {rumAnalytics.activeSessions || 0} active
                </div>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 text-success" />
                  <span className="text-xs text-muted-foreground">Score</span>
                </div>
                <div className={`text-2xl font-bold ${
                  rumAnalytics.performanceScore >= 90 ? 'text-success' :
                  rumAnalytics.performanceScore >= 75 ? 'text-warning' : 'text-error'
                }`}>
                  {rumAnalytics.performanceScore?.toFixed(0) || 0}
                </div>
                <div className="text-xs text-muted-foreground mt-1">/ 100</div>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Monitor className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Devices</span>
                </div>
                <div className="text-sm text-foreground space-y-1">
                  <div>📱 {rumAnalytics.deviceBreakdown?.mobile || 0}</div>
                  <div>💻 {rumAnalytics.deviceBreakdown?.desktop || 0}</div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Wifi className="w-4 h-4 text-warning" />
                  <span className="text-xs text-muted-foreground">Network</span>
                </div>
                <div className="text-sm text-foreground space-y-1">
                  <div>4G: {rumAnalytics.networkBreakdown?.['4g'] || 0}</div>
                  <div>3G: {rumAnalytics.networkBreakdown?.['3g'] || 0}</div>
                </div>
              </div>

              <div className="bg-muted/50 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bell className="w-4 h-4 text-error" />
                  <span className="text-xs text-muted-foreground">Alerts</span>
                </div>
                <div className="text-2xl font-bold text-foreground">
                  {rumAlerts.length || 0}
                </div>
                <div className="text-xs text-error mt-1">
                  {rumAlerts.filter(a => a.severity === 'critical').length || 0} critical
                </div>
              </div>
            </div>

            {/* Core Web Vitals - P50/P95/P99 */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-muted/30 rounded-2xl p-4">
                <div className="text-sm font-medium text-muted-foreground mb-3">FCP (First Contentful Paint)</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>P50:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p50Metrics?.fcp?.toFixed(0) || 0}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>P95:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p95Metrics?.fcp?.toFixed(0) || 0}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>P99:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p99Metrics?.fcp?.toFixed(0) || 0}ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-2xl p-4">
                <div className="text-sm font-medium text-muted-foreground mb-3">LCP (Largest Contentful Paint)</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>P50:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p50Metrics?.lcp?.toFixed(0) || 0}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>P95:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p95Metrics?.lcp?.toFixed(0) || 0}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>P99:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p99Metrics?.lcp?.toFixed(0) || 0}ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-2xl p-4">
                <div className="text-sm font-medium text-muted-foreground mb-3">FID (First Input Delay)</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>P50:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p50Metrics?.fid?.toFixed(0) || 0}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>P95:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p95Metrics?.fid?.toFixed(0) || 0}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>P99:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p99Metrics?.fid?.toFixed(0) || 0}ms</span>
                  </div>
                </div>
              </div>

              <div className="bg-muted/30 rounded-2xl p-4">
                <div className="text-sm font-medium text-muted-foreground mb-3">TTFB (Time to First Byte)</div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>P50:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p50Metrics?.ttfb?.toFixed(0) || 0}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>P95:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p95Metrics?.ttfb?.toFixed(0) || 0}ms</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>P99:</span>
                    <span className="font-mono font-bold">{rumAnalytics.p99Metrics?.ttfb?.toFixed(0) || 0}ms</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* RUM Alerts */}
        {rumAlerts && rumAlerts.length > 0 && (
          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Bell className="w-5 h-5 text-error" />
                Performance Alerts ({rumAlerts.length})
              </h2>
              <button
                onClick={clearRUMAlerts}
                className="px-3 py-1.5 text-sm bg-muted text-foreground rounded hover:bg-muted/80 transition-colors"
              >
                Clear All
              </button>
            </div>
            
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {rumAlerts.slice(-20).reverse().map((alert: any) => (
                <div
                  key={alert.id}
                  className={`p-3 rounded-2xl border ${
                    alert.severity === 'critical' ? 'bg-error/10 border-error/20' :
                    alert.severity === 'warning' ? 'bg-warning/10 border-warning/20' :
                    'bg-info/10 border-info/20'
                  }`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                          alert.severity === 'critical' ? 'bg-error text-error-foreground' :
                          alert.severity === 'warning' ? 'bg-warning text-warning-foreground' :
                          'bg-info text-white'
                        }`}>
                          {alert.severity.toUpperCase()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <div className="text-sm text-foreground font-medium">
                        {alert.message}
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Type: {alert.type} | Metric: {alert.metric}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}