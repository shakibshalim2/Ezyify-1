import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Progress } from '../../components/ui/progress';
import { 
  Activity, 
  Zap, 
  Server, 
  Globe, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react';
import { apiLatencyTracker } from '../../utils/apiLatencyTracker';
import { 
  runInfrastructureValidation, 
  formatValidationReport,
  type InfrastructureCheck 
} from '../../utils/infrastructureValidator';
import {
  checkBudget,
  checkGlobalThresholds,
  getPerformanceScore,
  formatBudgetReport,
  PERFORMANCE_BUDGETS,
  GLOBAL_THRESHOLDS,
} from '../../utils/performanceBudget';
import { getPageLoadMetrics, checkPerformanceThresholds } from '../../utils/performanceMonitor';
import { 
  getStoredRUMMetrics, 
  getAverageMetrics,
  detectPerformanceDegradation,
  getPerformanceScore as getRUMScore,
} from '../../utils/realUserMonitoring';

export default function PerformanceVerificationDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRunning, setIsRunning] = useState(false);
  const [apiStats, setApiStats] = useState<any>(null);
  const [infraReport, setInfraReport] = useState<any>(null);
  const [webVitals, setWebVitals] = useState<any>(null);
  const [rumData, setRumData] = useState<any>(null);
  const [budgetCheck, setBudgetCheck] = useState<any>(null);

  // Load all performance data
  const loadPerformanceData = async () => {
    setIsRunning(true);

    try {
      // 1. API Latency Stats
      const latencyStats = apiLatencyTracker.getLatencyStats();
      const slowestEndpoints = apiLatencyTracker.getSlowestEndpoints(5);
      const unreliableEndpoints = apiLatencyTracker.getUnreliableEndpoints(95);
      const thresholdCheck = apiLatencyTracker.checkThresholds();
      
      setApiStats({
        overall: latencyStats,
        slowest: slowestEndpoints,
        unreliable: unreliableEndpoints,
        thresholdCheck,
      });

      // 2. Infrastructure Validation
      const infraValidation = await runInfrastructureValidation();
      setInfraReport(infraValidation);

      // 3. Web Vitals
      const vitals = await getPageLoadMetrics();
      const vitalsCheck = checkPerformanceThresholds(vitals);
      
      setWebVitals({
        metrics: vitals,
        check: vitalsCheck,
      });

      // 4. RUM Data
      const rumMetrics = getStoredRUMMetrics();
      const avgMetrics = getAverageMetrics();
      const rumScore = getRUMScore(avgMetrics);
      
      setRumData({
        totalSessions: rumMetrics.length,
        avgMetrics,
        score: rumScore,
      });

      // 5. Budget Check
      const currentRoute = window.location.pathname;
      const budgetResult = checkBudget(currentRoute, {
        fcp: vitals.firstContentfulPaint,
        lcp: vitals.largestContentfulPaint,
        cls: vitals.cumulativeLayoutShift,
        fid: vitals.firstInputDelay,
      });
      
      const globalResult = checkGlobalThresholds({
        fcp: vitals.firstContentfulPaint,
        lcp: vitals.largestContentfulPaint,
        cls: vitals.cumulativeLayoutShift,
        fid: vitals.firstInputDelay,
        apiLatencyP95: latencyStats.p95,
      });

      const perfScore = getPerformanceScore(currentRoute, {
        fcp: vitals.firstContentfulPaint,
        lcp: vitals.largestContentfulPaint,
        cls: vitals.cumulativeLayoutShift,
        fid: vitals.firstInputDelay,
      });

      setBudgetCheck({
        budget: budgetResult,
        global: globalResult,
        score: perfScore,
      });

    } catch (error) {
      console.error('Performance data loading failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    loadPerformanceData();
  }, []);

  const exportAllData = () => {
    const data = {
      timestamp: new Date().toISOString(),
      apiStats,
      infrastructure: infraReport,
      webVitals,
      rumData,
      budgetCheck,
      latencyReport: apiLatencyTracker.getSummaryReport(),
      infraReport: infraReport ? formatValidationReport(infraReport) : '',
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `performance-report-${Date.now()}.json`;
    a.click();
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-success';
    if (score >= 70) return 'text-warning';
    return 'text-error';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-success">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-warning">Good</Badge>;
    return <Badge className="bg-error">Needs Improvement</Badge>;
  };

  return (
    <div className="min-h-screen bg-muted/50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Performance Verification Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              End-to-end performance validation and monitoring
            </p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={loadPerformanceData} 
              disabled={isRunning}
              variant="outline"
            >
              <RefreshCw className={`size-4 mr-2 ${isRunning ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Button onClick={exportAllData}>
              <Download className="size-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Overall Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">API Performance</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {apiStats?.overall.p95.toFixed(0) || '--'}ms
                  </div>
                  <p className="text-xs text-muted-foreground">P95 Latency</p>
                </div>
                <Activity className="size-8 text-info" />
              </div>
              {apiStats && (
                <div className="mt-2">
                  {apiStats.thresholdCheck.passed ? (
                    <Badge className="bg-success">All Endpoints OK</Badge>
                  ) : (
                    <Badge className="bg-error">
                      {apiStats.thresholdCheck.violations.length} Violations
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Infrastructure</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {infraReport?.score.toFixed(0) || '--'}%
                  </div>
                  <p className="text-xs text-muted-foreground">Health Score</p>
                </div>
                <Server className="size-8 text-primary" />
              </div>
              {infraReport && (
                <div className="mt-2">
                  {infraReport.passed ? (
                    <Badge className="bg-success">All Checks Passed</Badge>
                  ) : (
                    <Badge className="bg-warning">Some Issues</Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Core Web Vitals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-2xl font-bold">
                    {webVitals?.metrics.firstContentfulPaint.toFixed(0) || '--'}ms
                  </div>
                  <p className="text-xs text-muted-foreground">FCP</p>
                </div>
                <Zap className="size-8 text-warning" />
              </div>
              {webVitals && (
                <div className="mt-2">
                  {webVitals.check.passed ? (
                    <Badge className="bg-success">Excellent</Badge>
                  ) : (
                    <Badge className="bg-warning">
                      {webVitals.check.warnings.length} Warnings
                    </Badge>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Overall Score</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <div className={`text-2xl font-bold ${getScoreColor(budgetCheck?.score || 0)}`}>
                    {budgetCheck?.score.toFixed(0) || '--'}/100
                  </div>
                  <p className="text-xs text-muted-foreground">Performance Score</p>
                </div>
                <Globe className="size-8 text-success" />
              </div>
              {budgetCheck && (
                <div className="mt-2">
                  {getScoreBadge(budgetCheck.score)}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid grid-cols-5 w-full">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="api">API Performance</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
            <TabsTrigger value="vitals">Web Vitals</TabsTrigger>
            <TabsTrigger value="budget">Budget Check</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Summary</CardTitle>
                <CardDescription>
                  Quick overview of all performance metrics
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Performance Summary */}
                {apiStats && (
                  <div>
                    <h3 className="font-semibold mb-3">API Performance</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">P50 Latency</p>
                        <p className="text-2xl font-bold">{apiStats.overall.p50.toFixed(0)}ms</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">P95 Latency</p>
                        <p className="text-2xl font-bold">{apiStats.overall.p95.toFixed(0)}ms</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Success Rate</p>
                        <p className="text-2xl font-bold">{apiStats.overall.successRate.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Web Vitals Summary */}
                {webVitals && (
                  <div>
                    <h3 className="font-semibold mb-3">Core Web Vitals</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">FCP</p>
                        <p className="text-2xl font-bold">
                          {webVitals.metrics.firstContentfulPaint.toFixed(0)}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">LCP</p>
                        <p className="text-2xl font-bold">
                          {webVitals.metrics.largestContentfulPaint.toFixed(0)}ms
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">CLS</p>
                        <p className="text-2xl font-bold">
                          {webVitals.metrics.cumulativeLayoutShift.toFixed(3)}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Infrastructure Summary */}
                {infraReport && (
                  <div>
                    <h3 className="font-semibold mb-3">Infrastructure Health</h3>
                    <Progress value={infraReport.score} className="mb-2" />
                    <p className="text-sm text-muted-foreground">
                      {infraReport.checks.filter((c: InfrastructureCheck) => c.passed).length}/{infraReport.checks.length} checks passed
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* API Performance Tab */}
          <TabsContent value="api" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>API Latency Analysis</CardTitle>
                <CardDescription>
                  P50, P95, P99 latencies for all endpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiStats && (
                  <div className="space-y-6">
                    {/* Slowest Endpoints */}
                    {apiStats.slowest.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Slowest Endpoints (P95)</h3>
                        <div className="space-y-2">
                          {apiStats.slowest.map((endpoint: any, index: number) => (
                            <div key={index} className="flex items-center justify-between p-3 border rounded">
                              <div>
                                <p className="font-medium">{endpoint.endpoint}</p>
                                <p className="text-sm text-muted-foreground">{endpoint.count} calls</p>
                              </div>
                              <div className="text-right">
                                <p className="text-lg font-bold">{endpoint.p95.toFixed(0)}ms</p>
                                {endpoint.p95 > 500 && (
                                  <Badge className="bg-error">Slow</Badge>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Unreliable Endpoints */}
                    {apiStats.unreliable.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Unreliable Endpoints (&lt; 95% success)</h3>
                        <div className="space-y-2">
                          {apiStats.unreliable.map((endpoint: any, index: number) => (
                            <Alert key={index} className="border-error/30">
                              <AlertTriangle className="size-4 text-error" />
                              <AlertDescription>
                                <strong>{endpoint.endpoint}</strong> - {endpoint.successRate.toFixed(1)}% success rate ({endpoint.count} calls)
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Threshold Violations */}
                    {!apiStats.thresholdCheck.passed && (
                      <div>
                        <h3 className="font-semibold mb-3">Threshold Violations</h3>
                        <div className="space-y-2">
                          {apiStats.thresholdCheck.violations.map((v: any, index: number) => (
                            <Alert key={index} className="border-yellow-200">
                              <AlertTriangle className="size-4 text-warning" />
                              <AlertDescription>
                                <strong>{v.endpoint}</strong> - {v.metric.toUpperCase()}: {v.actual.toFixed(0)}ms exceeds {v.threshold}ms
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Infrastructure Validation</CardTitle>
                <CardDescription>
                  CDN, caching, network, and browser checks
                </CardDescription>
              </CardHeader>
              <CardContent>
                {infraReport && (
                  <div className="space-y-3">
                    {infraReport.checks.map((check: InfrastructureCheck, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded">
                        <div className="flex items-center gap-3">
                          {check.passed ? (
                            <CheckCircle2 className="size-5 text-success" />
                          ) : (
                            <XCircle className="size-5 text-error" />
                          )}
                          <div>
                            <p className="font-medium">{check.name}</p>
                            <p className="text-sm text-muted-foreground">{check.message}</p>
                          </div>
                        </div>
                        {check.passed ? (
                          <Badge className="bg-success">Passed</Badge>
                        ) : (
                          <Badge className="bg-error">Failed</Badge>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Web Vitals Tab */}
          <TabsContent value="vitals" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Core Web Vitals</CardTitle>
                <CardDescription>
                  Google's performance metrics for user experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                {webVitals && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 border rounded">
                        <p className="text-sm text-muted-foreground mb-1">First Contentful Paint</p>
                        <p className="text-3xl font-bold mb-1">
                          {webVitals.metrics.firstContentfulPaint.toFixed(0)}ms
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &lt; 1800ms</p>
                      </div>
                      
                      <div className="p-4 border rounded">
                        <p className="text-sm text-muted-foreground mb-1">Largest Contentful Paint</p>
                        <p className="text-3xl font-bold mb-1">
                          {webVitals.metrics.largestContentfulPaint.toFixed(0)}ms
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &lt; 2500ms</p>
                      </div>
                      
                      <div className="p-4 border rounded">
                        <p className="text-sm text-muted-foreground mb-1">Cumulative Layout Shift</p>
                        <p className="text-3xl font-bold mb-1">
                          {webVitals.metrics.cumulativeLayoutShift.toFixed(3)}
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &lt; 0.1</p>
                      </div>
                      
                      <div className="p-4 border rounded">
                        <p className="text-sm text-muted-foreground mb-1">First Input Delay</p>
                        <p className="text-3xl font-bold mb-1">
                          {webVitals.metrics.firstInputDelay.toFixed(0)}ms
                        </p>
                        <p className="text-xs text-muted-foreground">Target: &lt; 100ms</p>
                      </div>
                    </div>

                    {!webVitals.check.passed && (
                      <Alert className="border-yellow-200">
                        <AlertTriangle className="size-4 text-warning" />
                        <AlertDescription>
                          <strong>Performance Warnings:</strong>
                          <ul className="mt-2 space-y-1">
                            {webVitals.check.warnings.map((warning: string, index: number) => (
                              <li key={index} className="text-sm">• {warning}</li>
                            ))}
                          </ul>
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Budget Check Tab */}
          <TabsContent value="budget" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Performance Budget Check</CardTitle>
                <CardDescription>
                  Current page metrics vs. defined budgets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {budgetCheck && (
                  <div className="space-y-6">
                    {/* Score */}
                    <div className="text-center p-6 border rounded">
                      <p className="text-sm text-muted-foreground mb-2">Overall Score</p>
                      <p className={`text-5xl font-bold ${getScoreColor(budgetCheck.score)}`}>
                        {budgetCheck.score.toFixed(0)}/100
                      </p>
                      <div className="mt-3">
                        {getScoreBadge(budgetCheck.score)}
                      </div>
                    </div>

                    {/* Budget Violations */}
                    {budgetCheck.budget.violations.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Budget Violations</h3>
                        <div className="space-y-2">
                          {budgetCheck.budget.violations.map((v: any, index: number) => (
                            <Alert key={index} className="border-error/30">
                              <XCircle className="size-4 text-error" />
                              <AlertDescription>
                                <strong>{v.metric}</strong>: {v.actual.toFixed(0)} exceeds budget of {v.budget.toFixed(0)} by {v.exceeded.toFixed(0)}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Global Threshold Violations */}
                    {budgetCheck.global.violations.length > 0 && (
                      <div>
                        <h3 className="font-semibold mb-3">Global Threshold Violations</h3>
                        <div className="space-y-2">
                          {budgetCheck.global.violations.map((v: any, index: number) => (
                            <Alert key={index} className="border-yellow-200">
                              <AlertTriangle className="size-4 text-warning" />
                              <AlertDescription>
                                <strong>{v.metric}</strong>: {v.actual.toFixed(1)} exceeds global threshold of {v.threshold.toFixed(1)}
                              </AlertDescription>
                            </Alert>
                          ))}
                        </div>
                      </div>
                    )}

                    {budgetCheck.budget.passed && budgetCheck.global.passed && (
                      <Alert className="border-success/30">
                        <CheckCircle2 className="size-4 text-success" />
                        <AlertDescription>
                          All performance budgets met! 🎉
                        </AlertDescription>
                      </Alert>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}