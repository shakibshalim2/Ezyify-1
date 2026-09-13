import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import {
  Shield,
  Server,
  Users,
  Rocket,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  Download,
  RefreshCw,
  Zap,
  Activity,
  BarChart3,
  FileText,
  Terminal,
  ChevronRight,
  Loader2
} from 'lucide-react';

interface AutomationResult {
  phase: string;
  status: 'not-started' | 'running' | 'complete' | 'failed';
  score?: number;
  timestamp?: string;
  details?: any;
}

export default function AutomatedLaunchDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  
  // Automation states
  const [securityRunning, setSecurityRunning] = useState(false);
  const [securityResult, setSecurityResult] = useState<AutomationResult | null>(null);
  
  const [infrastructureRunning, setInfrastructureRunning] = useState(false);
  const [infrastructureResult, setInfrastructureResult] = useState<AutomationResult | null>(null);
  
  const [betaInitialized, setBetaInitialized] = useState(false);
  const [betaReport, setBetaReport] = useState<any>(null);

  // Team readiness states
  const [teamReadinessReport, setTeamReadinessReport] = useState<any>(null);

  /**
   * Run Security Audit
   */
  const runSecurityAudit = async () => {
    setSecurityRunning(true);
    setSecurityResult({ phase: 'Security Audit', status: 'running' });

    try {
      // Call the global security audit function
      const report = await (window as any).runSecurityAudit();
      
      setSecurityResult({
        phase: 'Security Audit',
        status: report.overallScore >= 85 ? 'complete' : 'failed',
        score: report.overallScore,
        timestamp: report.timestamp,
        details: report
      });

    } catch (error) {
      setSecurityResult({
        phase: 'Security Audit',
        status: 'failed',
        details: { error: 'Failed to run security audit' }
      });
    } finally {
      setSecurityRunning(false);
    }
  };

  /**
   * Run Infrastructure Check
   */
  const runInfrastructureCheck = async () => {
    setInfrastructureRunning(true);
    setInfrastructureResult({ phase: 'Infrastructure', status: 'running' });

    try {
      const report = await (window as any).runInfrastructureCheck();
      
      setInfrastructureResult({
        phase: 'Infrastructure',
        status: report.healthScore >= 85 ? 'complete' : 'failed',
        score: report.healthScore,
        timestamp: report.timestamp,
        details: report
      });

    } catch (error) {
      setInfrastructureResult({
        phase: 'Infrastructure',
        status: 'failed',
        details: { error: 'Failed to run infrastructure check' }
      });
    } finally {
      setInfrastructureRunning(false);
    }
  };

  /**
   * Initialize Beta Program
   */
  const initializeBetaProgram = () => {
    try {
      (window as any).initBetaProgram();
      setBetaInitialized(true);
      
      // Get initial report
      const report = (window as any).getSoftLaunchReport();
      setBetaReport(report);

    } catch (error) {
      console.error('Failed to initialize beta program:', error);
    }
  };

  /**
   * Get Soft Launch Report
   */
  const getSoftLaunchReport = () => {
    try {
      const report = (window as any).getSoftLaunchReport();
      setBetaReport(report);
    } catch (error) {
      console.error('Failed to get soft launch report:', error);
    }
  };

  /**
   * Export Security Report
   */
  const exportSecurityReport = () => {
    try {
      (window as any).exportSecurityReport();
    } catch (error) {
      console.error('Failed to export security report:', error);
    }
  };

  /**
   * Export Infrastructure Report
   */
  const exportInfrastructureReport = () => {
    try {
      (window as any).exportInfrastructureReport();
    } catch (error) {
      console.error('Failed to export infrastructure report:', error);
    }
  };

  /**
   * Run All Automation
   */
  const runAllAutomation = async () => {
    await runSecurityAudit();
    await new Promise(resolve => setTimeout(resolve, 1000));
    await runInfrastructureCheck();
    
    if (!betaInitialized) {
      initializeBetaProgram();
    } else {
      getSoftLaunchReport();
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Zap className="w-8 h-8 text-primary" />
              <h1 className="text-3xl font-bold">Automated Launch Dashboard</h1>
            </div>
            <p className="text-muted-foreground">
              Run automated checks and monitor launch readiness
            </p>
          </div>
          
          <Button 
            onClick={runAllAutomation} 
            size="lg"
            disabled={securityRunning || infrastructureRunning}
          >
            {securityRunning || infrastructureRunning ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Running...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run All Automation
              </>
            )}
          </Button>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Shield className="w-4 h-4" />
                Security Audit
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {securityResult ? (
                    <>
                      <div className="text-2xl font-bold">
                        {securityResult.score || 0}/100
                      </div>
                      <Badge 
                        variant={securityResult.status === 'complete' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {securityResult.status}
                      </Badge>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Not run yet</div>
                  )}
                </div>
                <Button 
                  onClick={runSecurityAudit} 
                  disabled={securityRunning}
                  size="sm"
                >
                  {securityRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Server className="w-4 h-4" />
                Infrastructure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {infrastructureResult ? (
                    <>
                      <div className="text-2xl font-bold">
                        {infrastructureResult.score || 0}/100
                      </div>
                      <Badge 
                        variant={infrastructureResult.status === 'complete' ? 'default' : 'destructive'}
                        className="text-xs"
                      >
                        {infrastructureResult.status}
                      </Badge>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">Not run yet</div>
                  )}
                </div>
                <Button 
                  onClick={runInfrastructureCheck} 
                  disabled={infrastructureRunning}
                  size="sm"
                >
                  {infrastructureRunning ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Beta Program
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  {betaReport ? (
                    <>
                      <div className="text-2xl font-bold">
                        {betaReport.activeUsers}/{betaReport.totalBetaUsers}
                      </div>
                      <Badge variant="default" className="text-xs">
                        {betaReport.currentPhase} traffic
                      </Badge>
                    </>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      {betaInitialized ? 'Initialized' : 'Not initialized'}
                    </div>
                  )}
                </div>
                <Button 
                  onClick={betaInitialized ? getSoftLaunchReport : initializeBetaProgram}
                  size="sm"
                >
                  {betaInitialized ? <RefreshCw className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-5 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="beta">Beta Testing</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Alert>
            <Terminal className="w-4 h-4" />
            <AlertDescription>
              This dashboard provides a UI for running automated launch checks. All automation tools are available via console commands as well.
            </AlertDescription>
          </Alert>

          {/* Overall Status */}
          <Card>
            <CardHeader>
              <CardTitle>Automation Status</CardTitle>
              <CardDescription>Current state of automated checks</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Phase 1 */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <div>
                      <div className="font-semibold">Phase 1: Production Validation</div>
                      <div className="text-sm text-muted-foreground">93/93 pages validated</div>
                    </div>
                  </div>
                  <Badge variant="default">Complete</Badge>
                </div>

                {/* Phase 2 */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-3">
                    {securityResult?.status === 'complete' ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : securityRunning ? (
                      <Loader2 className="w-5 h-5 text-info animate-spin" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-semibold">Phase 2: Security Audit</div>
                      <div className="text-sm text-muted-foreground">
                        {securityResult 
                          ? `Score: ${securityResult.score}/100`
                          : '12 automated tests ready'}
                      </div>
                    </div>
                  </div>
                  <Badge variant={securityResult?.status === 'complete' ? 'default' : 'secondary'}>
                    {securityResult?.status || 'Ready'}
                  </Badge>
                </div>

                {/* Phase 3 */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-3">
                    {infrastructureResult?.status === 'complete' ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : infrastructureRunning ? (
                      <Loader2 className="w-5 h-5 text-info animate-spin" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-semibold">Phase 3: Infrastructure</div>
                      <div className="text-sm text-muted-foreground">
                        {infrastructureResult 
                          ? `Health: ${infrastructureResult.score}/100`
                          : '10 component checks ready'}
                      </div>
                    </div>
                  </div>
                  <Badge variant={infrastructureResult?.status === 'complete' ? 'default' : 'secondary'}>
                    {infrastructureResult?.status || 'Ready'}
                  </Badge>
                </div>

                {/* Phase 5 */}
                <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                  <div className="flex items-center gap-3">
                    {betaInitialized ? (
                      <Activity className="w-5 h-5 text-info" />
                    ) : (
                      <Clock className="w-5 h-5 text-muted-foreground" />
                    )}
                    <div>
                      <div className="font-semibold">Phase 5: Beta Testing</div>
                      <div className="text-sm text-muted-foreground">
                        {betaReport 
                          ? `${betaReport.activeUsers} active users, ${betaReport.currentPhase} traffic`
                          : 'Beta program ready to initialize'}
                      </div>
                    </div>
                  </div>
                  <Badge variant={betaInitialized ? 'default' : 'secondary'}>
                    {betaInitialized ? 'Active' : 'Ready'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Console Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                Console Commands
              </CardTitle>
              <CardDescription>Alternative: Run these commands in browser console</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-sm">
                <div className="p-3 bg-muted rounded">
                  <code>window.runSecurityAudit()</code>
                  <div className="text-xs text-muted-foreground mt-1">Run security audit</div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <code>window.runInfrastructureCheck()</code>
                  <div className="text-xs text-muted-foreground mt-1">Check infrastructure health</div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <code>window.initBetaProgram()</code>
                  <div className="text-xs text-muted-foreground mt-1">Initialize beta testing</div>
                </div>
                <div className="p-3 bg-muted rounded">
                  <code>window.getSoftLaunchReport()</code>
                  <div className="text-xs text-muted-foreground mt-1">Get beta testing report</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Shield className="w-5 h-5" />
                  Security Audit Results
                </span>
                <div className="flex gap-2">
                  <Button onClick={runSecurityAudit} disabled={securityRunning} size="sm">
                    {securityRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Running...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Audit
                      </>
                    )}
                  </Button>
                  {securityResult && (
                    <Button onClick={exportSecurityReport} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {securityResult ? (
                <div className="space-y-4">
                  {/* Score */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Overall Security Score</span>
                      <span className="text-lg font-bold">{securityResult.score}/100</span>
                    </div>
                    <Progress value={securityResult.score} className="h-3" />
                  </div>

                  {/* Summary */}
                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <div className="text-2xl font-bold text-success">
                        {securityResult.details?.passed || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Tests Passed</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <div className="text-2xl font-bold text-error">
                        {securityResult.details?.failed || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Tests Failed</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <div className="text-2xl font-bold text-warning">
                        {securityResult.details?.critical || 0}
                      </div>
                      <div className="text-xs text-muted-foreground">Critical Issues</div>
                    </div>
                  </div>

                  {/* Test Results */}
                  {securityResult.details?.results && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Test Results:</h4>
                      {securityResult.details.results.map((test: any, i: number) => (
                        <div 
                          key={i} 
                          className={`p-3 rounded-2xl border ${
                            test.passed 
                              ? 'bg-success/5 border-success/30' 
                              : 'bg-error/5 border-error/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{test.testName}</span>
                            {test.passed ? (
                              <CheckCircle2 className="w-4 h-4 text-success" />
                            ) : (
                              <XCircle className="w-4 h-4 text-error" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">{test.description}</p>
                          {test.recommendation && (
                            <p className="text-sm text-warning mt-1">
                              → {test.recommendation}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  <Alert>
                    <AlertTriangle className="w-4 h-4" />
                    <AlertDescription>
                      {securityResult.score >= 85 
                        ? '✅ Security score meets launch requirements (>85)'
                        : '⚠️ Security score below launch threshold. Fix critical issues before proceeding.'}
                    </AlertDescription>
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Shield className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No security audit run yet</p>
                  <Button onClick={runSecurityAudit}>
                    <Play className="w-4 h-4 mr-2" />
                    Run Security Audit
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Server className="w-5 h-5" />
                  Infrastructure Health
                </span>
                <div className="flex gap-2">
                  <Button onClick={runInfrastructureCheck} disabled={infrastructureRunning} size="sm">
                    {infrastructureRunning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking...
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Run Check
                      </>
                    )}
                  </Button>
                  {infrastructureResult && (
                    <Button onClick={exportInfrastructureReport} variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-2" />
                      Export
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {infrastructureResult ? (
                <div className="space-y-4">
                  {/* Health Score */}
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold">Infrastructure Health Score</span>
                      <span className="text-lg font-bold">{infrastructureResult.score}/100</span>
                    </div>
                    <Progress value={infrastructureResult.score} className="h-3" />
                  </div>

                  {/* Overall Health */}
                  <div className="text-center p-4 bg-muted rounded-xl">
                    <div className="text-2xl font-bold">
                      {infrastructureResult.details?.overallHealth?.toUpperCase() || 'UNKNOWN'}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Health Status</div>
                  </div>

                  {/* Component Status */}
                  {infrastructureResult.details?.components && (
                    <div className="space-y-2">
                      <h4 className="font-semibold">Component Status:</h4>
                      {infrastructureResult.details.components.map((component: any, i: number) => (
                        <div 
                          key={i}
                          className={`p-3 rounded-2xl border ${
                            component.status === 'healthy' 
                              ? 'bg-success/5 border-success/30'
                              : component.status === 'warning'
                              ? 'bg-warning/5 border-yellow-200'
                              : 'bg-error/5 border-error/30'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{component.component}</span>
                            <div className="flex items-center gap-2">
                              {component.responseTime && (
                                <span className="text-xs text-muted-foreground">
                                  {component.responseTime.toFixed(2)}ms
                                </span>
                              )}
                              {component.status === 'healthy' ? (
                                <CheckCircle2 className="w-4 h-4 text-success" />
                              ) : component.status === 'warning' ? (
                                <AlertTriangle className="w-4 h-4 text-warning" />
                              ) : (
                                <XCircle className="w-4 h-4 text-error" />
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Recommendations */}
                  {infrastructureResult.details?.recommendations?.length > 0 && (
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-2">Recommendations:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {infrastructureResult.details.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Server className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">No infrastructure check run yet</p>
                  <Button onClick={runInfrastructureCheck}>
                    <Play className="w-4 h-4 mr-2" />
                    Run Infrastructure Check
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Team Readiness
                </span>
                <div className="flex gap-2">
                  <Button size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Refresh
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {teamReadinessReport ? (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <div className="text-2xl font-bold">{teamReadinessReport.currentPhase}</div>
                      <div className="text-xs text-muted-foreground">Current Phase</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <div className="text-2xl font-bold">
                        {teamReadinessReport.activeUsers}/{teamReadinessReport.totalBetaUsers}
                      </div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <div className="text-2xl font-bold">{teamReadinessReport.totalFeedback}</div>
                      <div className="text-xs text-muted-foreground">Total Feedback</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <div className="text-2xl font-bold text-error">
                        {teamReadinessReport.criticalIssues}
                      </div>
                      <div className="text-xs text-muted-foreground">Critical Issues</div>
                    </div>
                  </div>

                  {/* Overall Health */}
                  <div className="text-center p-6 bg-muted rounded-xl">
                    <div className="text-3xl font-bold mb-2">
                      {teamReadinessReport.overallHealth.toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Health Status</div>
                  </div>

                  {/* Top Issues */}
                  {teamReadinessReport.topIssues?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Top Issues:</h4>
                      <div className="space-y-2">
                        {teamReadinessReport.topIssues.map((issue: any, i: number) => (
                          <div key={i} className="p-3 bg-muted rounded-xl">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{issue.title}</span>
                              <Badge variant={
                                issue.priority === 'critical' ? 'destructive' :
                                issue.priority === 'high' ? 'default' : 'secondary'
                              }>
                                {issue.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {teamReadinessReport.recommendations?.length > 0 && (
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-2">Recommendations:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {teamReadinessReport.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Ready for Next Phase */}
                  <Alert>
                    {teamReadinessReport.readyForNextPhase ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <AlertDescription>
                          ✅ Ready to increase traffic to next phase
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          ⚠️ Not ready for next phase - address critical issues first
                        </AlertDescription>
                      </>
                    )}
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    {betaInitialized 
                      ? 'Click refresh to get the latest report'
                      : 'Beta program not initialized yet'}
                  </p>
                  <Button onClick={betaInitialized ? getSoftLaunchReport : initializeBetaProgram}>
                    {betaInitialized ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Get Report
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Initialize Beta Program
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Beta Console Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Beta Testing Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2 bg-muted rounded">
                  <code>window.addBetaUser(email, name)</code>
                </div>
                <div className="p-2 bg-muted rounded">
                  <code>window.setRolloutTraffic(percentage)</code>
                </div>
                <div className="p-2 bg-muted rounded">
                  <code>window.exportBetaUsers()</code>
                </div>
                <div className="p-2 bg-muted rounded">
                  <code>window.exportBetaFeedback()</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beta Testing Tab */}
        <TabsContent value="beta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Beta Testing Program
                </span>
                <div className="flex gap-2">
                  {betaInitialized ? (
                    <Button onClick={getSoftLaunchReport} size="sm">
                      <RefreshCw className="w-4 h-4 mr-2" />
                      Refresh
                    </Button>
                  ) : (
                    <Button onClick={initializeBetaProgram} size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Initialize
                    </Button>
                  )}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {betaReport ? (
                <div className="space-y-4">
                  {/* Summary Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <div className="text-2xl font-bold">{betaReport.currentPhase}</div>
                      <div className="text-xs text-muted-foreground">Current Phase</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <div className="text-2xl font-bold">
                        {betaReport.activeUsers}/{betaReport.totalBetaUsers}
                      </div>
                      <div className="text-xs text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <div className="text-2xl font-bold">{betaReport.totalFeedback}</div>
                      <div className="text-xs text-muted-foreground">Total Feedback</div>
                    </div>
                    <div className="text-center p-4 bg-muted rounded-xl">
                      <div className="text-2xl font-bold text-error">
                        {betaReport.criticalIssues}
                      </div>
                      <div className="text-xs text-muted-foreground">Critical Issues</div>
                    </div>
                  </div>

                  {/* Overall Health */}
                  <div className="text-center p-6 bg-muted rounded-xl">
                    <div className="text-3xl font-bold mb-2">
                      {betaReport.overallHealth.toUpperCase()}
                    </div>
                    <div className="text-sm text-muted-foreground">Overall Health Status</div>
                  </div>

                  {/* Top Issues */}
                  {betaReport.topIssues?.length > 0 && (
                    <div>
                      <h4 className="font-semibold mb-2">Top Issues:</h4>
                      <div className="space-y-2">
                        {betaReport.topIssues.map((issue: any, i: number) => (
                          <div key={i} className="p-3 bg-muted rounded-xl">
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{issue.title}</span>
                              <Badge variant={
                                issue.priority === 'critical' ? 'destructive' :
                                issue.priority === 'high' ? 'default' : 'secondary'
                              }>
                                {issue.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">{issue.description}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Recommendations */}
                  {betaReport.recommendations?.length > 0 && (
                    <Alert>
                      <AlertTriangle className="w-4 h-4" />
                      <AlertDescription>
                        <div className="font-semibold mb-2">Recommendations:</div>
                        <ul className="list-disc list-inside space-y-1">
                          {betaReport.recommendations.map((rec: string, i: number) => (
                            <li key={i} className="text-sm">{rec}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Ready for Next Phase */}
                  <Alert>
                    {betaReport.readyForNextPhase ? (
                      <>
                        <CheckCircle2 className="w-4 h-4" />
                        <AlertDescription>
                          ✅ Ready to increase traffic to next phase
                        </AlertDescription>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4" />
                        <AlertDescription>
                          ⚠️ Not ready for next phase - address critical issues first
                        </AlertDescription>
                      </>
                    )}
                  </Alert>
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-4">
                    {betaInitialized 
                      ? 'Click refresh to get the latest report'
                      : 'Beta program not initialized yet'}
                  </p>
                  <Button onClick={betaInitialized ? getSoftLaunchReport : initializeBetaProgram}>
                    {betaInitialized ? (
                      <>
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Get Report
                      </>
                    ) : (
                      <>
                        <Play className="w-4 h-4 mr-2" />
                        Initialize Beta Program
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Beta Console Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Beta Testing Commands</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 font-mono text-xs">
                <div className="p-2 bg-muted rounded">
                  <code>window.addBetaUser(email, name)</code>
                </div>
                <div className="p-2 bg-muted rounded">
                  <code>window.setRolloutTraffic(percentage)</code>
                </div>
                <div className="p-2 bg-muted rounded">
                  <code>window.exportBetaUsers()</code>
                </div>
                <div className="p-2 bg-muted rounded">
                  <code>window.exportBetaFeedback()</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}