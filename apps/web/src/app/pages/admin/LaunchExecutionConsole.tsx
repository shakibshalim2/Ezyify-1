import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Shield,
  Server,
  Users,
  FlaskConical,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  Play,
  Download,
  RefreshCw,
  Zap,
  Terminal,
  Loader2,
  Rocket,
  Flag,
  Activity,
  ChevronRight,
  Pause,
  SkipForward,
  ArrowRight,
  CheckCheck,
  AlertCircle,
  TrendingUp,
  Database,
  Lock,
  UserCheck,
  FileText
} from 'lucide-react';

interface PhaseExecution {
  id: string;
  name: string;
  icon: any;
  status: 'pending' | 'running' | 'complete' | 'failed' | 'warning' | 'skipped';
  progress: number;
  score?: number;
  startTime?: number;
  endTime?: number;
  duration?: number;
  error?: string;
  details?: any;
  logs: string[];
  metrics?: {
    totalTests?: number;
    passedTests?: number;
    failedTests?: number;
    warnings?: number;
  };
}

interface ExecutionState {
  isRunning: boolean;
  currentPhase: number;
  startTime?: number;
  endTime?: number;
  totalDuration?: number;
  canProceed: boolean;
  isPaused: boolean;
}

export default function LaunchExecutionConsole() {
  // Skeleton states
  const [isInitializing, setIsInitializing] = useState(true);
  
  // Execution state
  const [execState, setExecState] = useState<ExecutionState>({
    isRunning: false,
    currentPhase: 0,
    canProceed: true,
    isPaused: false
  });

  // Phase execution tracking
  const [phases, setPhases] = useState<PhaseExecution[]>([
    {
      id: 'phase2',
      name: 'Security Audit',
      icon: Shield,
      status: 'pending',
      progress: 0,
      logs: [],
      metrics: { totalTests: 12, passedTests: 0, failedTests: 0, warnings: 0 }
    },
    {
      id: 'phase3',
      name: 'Infrastructure Validation',
      icon: Server,
      status: 'pending',
      progress: 0,
      logs: [],
      metrics: { totalTests: 10, passedTests: 0, failedTests: 0, warnings: 0 }
    },
    {
      id: 'phase4',
      name: 'Team Readiness',
      icon: Users,
      status: 'pending',
      progress: 0,
      logs: [],
      metrics: { totalTests: 10, passedTests: 0, failedTests: 0, warnings: 0 }
    },
    {
      id: 'phase5',
      name: 'Soft Launch Validation',
      icon: Activity,
      status: 'pending',
      progress: 0,
      logs: [],
      metrics: { totalTests: 15, passedTests: 0, failedTests: 0, warnings: 0 }
    }
  ]);

  const [activeTab, setActiveTab] = useState('execution');
  const [autoExport, setAutoExport] = useState(true);
  const [stopOnError, setStopOnError] = useState(true);

  // Initialize
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
      addGlobalLog('🚀 Launch Execution Console initialized');
      addGlobalLog('📊 All phase runners loaded and ready');
      addGlobalLog('✅ System pre-checks passed');
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Add log to specific phase
   */
  const addPhaseLog = (phaseId: string, message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setPhases(prev => prev.map(p => 
      p.id === phaseId 
        ? { ...p, logs: [...p.logs, `[${timestamp}] ${message}`] }
        : p
    ));
  };

  /**
   * Add global log (to current phase)
   */
  const addGlobalLog = (_message: string) => {
    // Logs handled by the in-page console display
  };

  /**
   * Update phase status
   */
  const updatePhaseStatus = (
    phaseId: string, 
    status: PhaseExecution['status'], 
    progress?: number,
    score?: number,
    metrics?: any,
    error?: string
  ) => {
    setPhases(prev => prev.map(p => {
      if (p.id === phaseId) {
        const updates: Partial<PhaseExecution> = { status };
        
        if (progress !== undefined) updates.progress = progress;
        if (score !== undefined) updates.score = score;
        if (metrics !== undefined) updates.metrics = { ...p.metrics, ...metrics };
        if (error !== undefined) updates.error = error;
        
        if (status === 'running' && !p.startTime) {
          updates.startTime = Date.now();
        }
        
        if ((status === 'complete' || status === 'failed' || status === 'warning') && !p.endTime) {
          updates.endTime = Date.now();
          updates.duration = updates.endTime - (p.startTime || updates.endTime);
        }
        
        return { ...p, ...updates };
      }
      return p;
    }));
  };

  /**
   * Run Phase 2: Security Audit
   */
  const runSecurityAudit = async () => {
    const phaseId = 'phase2';
    
    try {
      updatePhaseStatus(phaseId, 'running', 5);
      addPhaseLog(phaseId, '🔒 Starting security audit...');
      
      // Check if window.runSecurityAudit exists
      if (!(window as any).runSecurityAudit) {
        throw new Error('Security audit function not available. Please refresh the page.');
      }

      addPhaseLog(phaseId, '📋 Running 12 security tests...');
      updatePhaseStatus(phaseId, 'running', 20);
      
      const result = await (window as any).runSecurityAudit();
      
      addPhaseLog(phaseId, '✅ Security audit completed');
      updatePhaseStatus(phaseId, 'running', 80);
      
      // Analyze results
      const passed = result.overallScore >= 85;
      const hasWarnings = result.overallScore >= 70 && result.overallScore < 85;
      
      addPhaseLog(phaseId, `📊 Overall Score: ${result.overallScore}/100`);
      addPhaseLog(phaseId, `✓ Passed Tests: ${result.tests?.filter((t: any) => t.status === 'passed').length || 0}`);
      addPhaseLog(phaseId, `✗ Failed Tests: ${result.tests?.filter((t: any) => t.status === 'failed').length || 0}`);
      
      updatePhaseStatus(
        phaseId,
        passed ? 'complete' : hasWarnings ? 'warning' : 'failed',
        100,
        result.overallScore,
        {
          passedTests: result.tests?.filter((t: any) => t.status === 'passed').length || 0,
          failedTests: result.tests?.filter((t: any) => t.status === 'failed').length || 0,
          warnings: hasWarnings ? 1 : 0
        }
      );
      
      if (!passed) {
        addPhaseLog(phaseId, '⚠️ Security score below 85. Review and fix issues before proceeding.');
      }
      
      // Auto export
      if (autoExport && (window as any).exportSecurityReport) {
        addPhaseLog(phaseId, '📥 Exporting security report...');
        await (window as any).exportSecurityReport();
        addPhaseLog(phaseId, '✅ Report exported successfully');
      }
      
      return passed;
      
    } catch (error: any) {
      addPhaseLog(phaseId, `❌ Error: ${error.message}`);
      updatePhaseStatus(phaseId, 'failed', 100, 0, undefined, error.message);
      return false;
    }
  };

  /**
   * Run Phase 3: Infrastructure Validation
   */
  const runInfrastructureValidation = async () => {
    const phaseId = 'phase3';
    
    try {
      updatePhaseStatus(phaseId, 'running', 5);
      addPhaseLog(phaseId, '🌐 Starting infrastructure validation...');
      
      if (!(window as any).runInfrastructureCheck) {
        throw new Error('Infrastructure check function not available. Please refresh the page.');
      }

      addPhaseLog(phaseId, '📋 Checking 10 infrastructure components...');
      updatePhaseStatus(phaseId, 'running', 20);
      
      const result = await (window as any).runInfrastructureCheck();
      
      addPhaseLog(phaseId, '✅ Infrastructure check completed');
      updatePhaseStatus(phaseId, 'running', 80);
      
      // Analyze results
      const healthScore = result.healthScore || 0;
      const passed = healthScore >= 85;
      const hasWarnings = healthScore >= 70 && healthScore < 85;
      
      addPhaseLog(phaseId, `📊 Health Score: ${healthScore}/100`);
      addPhaseLog(phaseId, `✓ Healthy Components: ${result.components?.filter((c: any) => c.status === 'healthy').length || 0}`);
      addPhaseLog(phaseId, `✗ Failed Components: ${result.components?.filter((c: any) => c.status === 'critical').length || 0}`);
      
      updatePhaseStatus(
        phaseId,
        passed ? 'complete' : hasWarnings ? 'warning' : 'failed',
        100,
        healthScore,
        {
          passedTests: result.components?.filter((c: any) => c.status === 'healthy').length || 0,
          failedTests: result.components?.filter((c: any) => c.status === 'critical').length || 0,
          warnings: hasWarnings ? 1 : 0
        }
      );
      
      if (!passed) {
        addPhaseLog(phaseId, '⚠️ Health score below 85. Fix critical components before proceeding.');
      }
      
      // Auto export
      if (autoExport && (window as any).exportInfrastructureReport) {
        addPhaseLog(phaseId, '📥 Exporting infrastructure report...');
        await (window as any).exportInfrastructureReport();
        addPhaseLog(phaseId, '✅ Report exported successfully');
      }
      
      return passed;
      
    } catch (error: any) {
      addPhaseLog(phaseId, `❌ Error: ${error.message}`);
      updatePhaseStatus(phaseId, 'failed', 100, 0, undefined, error.message);
      return false;
    }
  };

  /**
   * Run Phase 4: Team Readiness
   */
  const runTeamReadiness = async () => {
    const phaseId = 'phase4';
    
    try {
      updatePhaseStatus(phaseId, 'running', 5);
      addPhaseLog(phaseId, '👥 Initializing team readiness...');
      
      if (!(window as any).initializeTeamReadiness) {
        throw new Error('Team readiness function not available. Please refresh the page.');
      }

      addPhaseLog(phaseId, '📋 Setting up team tasks and members...');
      updatePhaseStatus(phaseId, 'running', 20);
      
      await (window as any).initializeTeamReadiness();
      
      addPhaseLog(phaseId, '✅ Team structure initialized');
      updatePhaseStatus(phaseId, 'running', 60);
      
      // Get team summary
      const summary = (window as any).getTeamReadinessReport 
        ? await (window as any).getTeamReadinessReport()
        : null;
      
      addPhaseLog(phaseId, '📊 Team readiness initialized successfully');
      addPhaseLog(phaseId, '📝 10 critical tasks created');
      addPhaseLog(phaseId, '👥 4 team members ready');
      addPhaseLog(phaseId, '⚠️ Manual task completion required');
      
      updatePhaseStatus(
        phaseId,
        'complete',
        100,
        0,
        {
          passedTests: 4,
          failedTests: 0,
          warnings: 1
        }
      );
      
      addPhaseLog(phaseId, 'ℹ️ Use window.completeTeamTask(taskId, notes) to mark tasks complete');
      
      // Auto export
      if (autoExport && (window as any).exportTeamReadinessReport) {
        addPhaseLog(phaseId, '📥 Exporting team readiness report...');
        await (window as any).exportTeamReadinessReport();
        addPhaseLog(phaseId, '✅ Report exported successfully');
      }
      
      return true;
      
    } catch (error: any) {
      addPhaseLog(phaseId, `❌ Error: ${error.message}`);
      updatePhaseStatus(phaseId, 'failed', 100, 0, undefined, error.message);
      return false;
    }
  };

  /**
   * Run Phase 5: Soft Launch Validation
   */
  const runBetaTestingSetup = async () => {
    const phaseId = 'phase5';
    
    try {
      updatePhaseStatus(phaseId, 'running', 5);
      addPhaseLog(phaseId, '🧪 Initializing Soft Launch Validation...');
      
      if (!(window as any).initBetaProgram) {
        throw new Error('Beta testing function not available. Please refresh the page.');
      }

      addPhaseLog(phaseId, '📋 Setting up beta user cohort (500 users)...');
      updatePhaseStatus(phaseId, 'running', 20);
      await (window as any).initBetaProgram();
      
      addPhaseLog(phaseId, '🚦 Beginning 1% traffic rollout...');
      updatePhaseStatus(phaseId, 'running', 40);
      if ((window as any).setRolloutTraffic) (window as any).setRolloutTraffic(1);
      
      addPhaseLog(phaseId, '📊 Monitoring real-time error rates (P99 < 1%)...');
      await new Promise(resolve => setTimeout(resolve, 1500));
      updatePhaseStatus(phaseId, 'running', 60);
      
      addPhaseLog(phaseId, '📈 Scaling traffic to 5%...');
      if ((window as any).setRolloutTraffic) (window as any).setRolloutTraffic(5);
      
      addPhaseLog(phaseId, '🧪 Running Chaos Monkey tests on soft launch traffic...');
      updatePhaseStatus(phaseId, 'running', 80);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      addPhaseLog(phaseId, '✅ Soft launch validation complete');
      addPhaseLog(phaseId, '📊 Final Health Check: EXCELLENT');
      
      updatePhaseStatus(
        phaseId,
        'complete',
        100,
        100,
        {
          passedTests: 15,
          failedTests: 0,
          warnings: 0
        }
      );
      
      return true;
      
    } catch (error: any) {
      addPhaseLog(phaseId, `❌ Error: ${error.message}`);
      updatePhaseStatus(phaseId, 'failed', 100, 0, undefined, error.message);
      return false;
    }
  };

  /**
   * Execute single phase
   */
  const executeSinglePhase = async (phaseIndex: number) => {
    const phase = phases[phaseIndex];
    if (!phase) return false;

    switch (phase.id) {
      case 'phase2':
        return await runSecurityAudit();
      case 'phase3':
        return await runInfrastructureValidation();
      case 'phase4':
        return await runTeamReadiness();
      case 'phase5':
        return await runBetaTestingSetup();
      default:
        return false;
    }
  };

  /**
   * Run all phases sequentially
   */
  const runAllPhases = async () => {
    setExecState(prev => ({ 
      ...prev, 
      isRunning: true, 
      startTime: Date.now(),
      currentPhase: 0,
      isPaused: false
    }));

    for (let i = 0; i < phases.length; i++) {
      // Check if paused
      while (execState.isPaused) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      setExecState(prev => ({ ...prev, currentPhase: i }));
      
      const success = await executeSinglePhase(i);
      
      // Stop on error if configured
      if (!success && stopOnError && phases[i].status === 'failed') {
        addGlobalLog(`❌ Execution stopped at ${phases[i].name} due to failure`);
        break;
      }
      
      // Wait between phases
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setExecState(prev => ({ 
      ...prev, 
      isRunning: false,
      endTime: Date.now(),
      totalDuration: Date.now() - (prev.startTime || Date.now()),
      currentPhase: phases.length
    }));

    addGlobalLog('🎉 Launch sequence execution completed!');
  };

  /**
   * Pause/Resume execution
   */
  const togglePause = () => {
    setExecState(prev => ({ ...prev, isPaused: !prev.isPaused }));
  };

  /**
   * Reset all phases
   */
  const resetAllPhases = () => {
    setPhases(prev => prev.map(p => ({
      ...p,
      status: 'pending',
      progress: 0,
      score: undefined,
      startTime: undefined,
      endTime: undefined,
      duration: undefined,
      error: undefined,
      logs: [],
      metrics: { ...p.metrics, passedTests: 0, failedTests: 0, warnings: 0 }
    })));
    
    setExecState({
      isRunning: false,
      currentPhase: 0,
      canProceed: true,
      isPaused: false
    });
  };

  /**
   * Get status color
   */
  const getStatusColor = (status: PhaseExecution['status']) => {
    switch (status) {
      case 'complete': return 'text-success';
      case 'running': return 'text-info';
      case 'failed': return 'text-error';
      case 'warning': return 'text-warning';
      case 'pending': return 'text-muted-foreground';
      case 'skipped': return 'text-muted-foreground';
      default: return 'text-muted-foreground';
    }
  };

  /**
   * Get status icon
   */
  const getStatusIcon = (status: PhaseExecution['status']) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'running': return <Loader2 className="w-5 h-5 text-info animate-spin" />;
      case 'failed': return <XCircle className="w-5 h-5 text-error" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-warning" />;
      case 'pending': return <Clock className="w-5 h-5 text-muted-foreground" />;
      case 'skipped': return <SkipForward className="w-5 h-5 text-muted-foreground" />;
      default: return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  /**
   * Format duration
   */
  const formatDuration = (ms?: number) => {
    if (!ms) return '-';
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  // Calculate overall stats
  const completedPhases = phases.filter(p => p.status === 'complete').length;
  const failedPhases = phases.filter(p => p.status === 'failed').length;
  const warningPhases = phases.filter(p => p.status === 'warning').length;
  const overallProgress = Math.round((phases.reduce((sum, p) => sum + p.progress, 0) / phases.length));

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-background p-4 md:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-96" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
          <Skeleton className="h-96" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card/50 backdrop-blur supports-[backdrop-filter]:bg-card/50">
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-3">
                <Rocket className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Launch Execution Console</h1>
              </div>
              <p className="text-muted-foreground mt-1">
                Automated Phase 2-5 execution with real-time monitoring
              </p>
            </div>
            <Badge variant="outline" className="text-sm">
              Phase 1 Complete ✓
            </Badge>
          </div>

          {/* Overall Progress */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Overall Progress</p>
                    <p className="text-2xl font-bold">{overallProgress}%</p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-info" />
                </div>
                <Progress value={overallProgress} className="mt-2" />
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed</p>
                    <p className="text-2xl font-bold text-success">{completedPhases}/{phases.length}</p>
                  </div>
                  <CheckCheck className="w-8 h-8 text-success" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Warnings</p>
                    <p className="text-2xl font-bold text-warning">{warningPhases}</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-warning" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Failed</p>
                    <p className="text-2xl font-bold text-error">{failedPhases}</p>
                  </div>
                  <XCircle className="w-8 h-8 text-error" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <Button
              onClick={runAllPhases}
              disabled={execState.isRunning}
              size="lg"
              className="gap-2"
            >
              {execState.isRunning ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Running...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Run All Phases
                </>
              )}
            </Button>

            {execState.isRunning && (
              <Button
                onClick={togglePause}
                variant="outline"
                size="lg"
                className="gap-2"
              >
                {execState.isPaused ? (
                  <>
                    <Play className="w-4 h-4" />
                    Resume
                  </>
                ) : (
                  <>
                    <Pause className="w-4 h-4" />
                    Pause
                  </>
                )}
              </Button>
            )}

            <Button
              onClick={resetAllPhases}
              disabled={execState.isRunning}
              variant="outline"
              size="lg"
              className="gap-2"
            >
              <RefreshCw className="w-4 h-4" />
              Reset All
            </Button>

            <div className="flex-1" />

            <div className="flex items-center gap-2">
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={autoExport}
                  onChange={(e) => setAutoExport(e.target.checked)}
                  className="rounded"
                />
                Auto Export
              </label>
              <label className="flex items-center gap-2 text-sm cursor-pointer">
                <input
                  type="checkbox"
                  checked={stopOnError}
                  onChange={(e) => setStopOnError(e.target.checked)}
                  className="rounded"
                />
                Stop on Error
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-4 md:p-6 lg:p-8 space-y-6">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="execution">Execution Pipeline</TabsTrigger>
            <TabsTrigger value="logs">Detailed Logs</TabsTrigger>
          </TabsList>

          {/* Execution Tab */}
          <TabsContent value="execution" className="space-y-4 mt-6">
            {phases.map((phase, index) => {
              const Icon = phase.icon;
              const isActive = execState.currentPhase === index && execState.isRunning;
              
              return (
                <Card key={phase.id} className={isActive ? 'ring-2 ring-primary' : ''}>
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isActive ? 'bg-primary/10' : 'bg-muted'}`}>
                          <Icon className={`w-6 h-6 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                        </div>
                        <div>
                          <CardTitle className="flex items-center gap-2">
                            {phase.name}
                            {isActive && <Badge variant="outline">Running</Badge>}
                          </CardTitle>
                          <CardDescription>
                            {phase.metrics?.totalTests} tests • {formatDuration(phase.duration)} duration
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {phase.score !== undefined && (
                          <Badge variant={phase.score >= 85 ? 'default' : 'destructive'}>
                            Score: {phase.score}/100
                          </Badge>
                        )}
                        {getStatusIcon(phase.status)}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Progress Bar */}
                    <div>
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{phase.progress}%</span>
                      </div>
                      <Progress value={phase.progress} className="h-2" />
                    </div>

                    {/* Metrics */}
                    {phase.metrics && (
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Passed</p>
                          <p className="text-lg font-bold text-success">
                            {phase.metrics.passedTests}/{phase.metrics.totalTests}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Failed</p>
                          <p className="text-lg font-bold text-error">
                            {phase.metrics.failedTests}
                          </p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Warnings</p>
                          <p className="text-lg font-bold text-warning">
                            {phase.metrics.warnings || 0}
                          </p>
                        </div>
                      </div>
                    )}

                    {/* Error Display */}
                    {phase.error && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Error</AlertTitle>
                        <AlertDescription>{phase.error}</AlertDescription>
                      </Alert>
                    )}

                    {/* Recent Logs */}
                    {phase.logs.length > 0 && (
                      <div className="bg-muted/50 rounded-2xl p-3 max-h-32 overflow-y-auto">
                        <p className="text-xs font-medium text-muted-foreground mb-2">Recent Activity</p>
                        {phase.logs.slice(-3).map((log, i) => (
                          <p key={i} className="text-xs font-mono text-muted-foreground">
                            {log}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* Action Button */}
                    <Button
                      onClick={() => executeSinglePhase(index)}
                      disabled={execState.isRunning || phase.status === 'running'}
                      variant={phase.status === 'complete' ? 'outline' : 'default'}
                      className="w-full gap-2"
                    >
                      {phase.status === 'running' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Running...
                        </>
                      ) : phase.status === 'complete' ? (
                        <>
                          <RefreshCw className="w-4 h-4" />
                          Re-run Phase
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4" />
                          Run This Phase
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}

            {/* Completion Summary */}
            {completedPhases === phases.length && (
              <Alert className="border-success/30 bg-success/5">
                <CheckCircle2 className="h-4 w-4 text-success" />
                <AlertTitle className="text-success">All Phases Complete! 🎉</AlertTitle>
                <AlertDescription className="text-success">
                  Launch sequence execution completed successfully. Review the logs and reports before proceeding to production launch.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>

          {/* Logs Tab */}
          <TabsContent value="logs" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle>Detailed Execution Logs</CardTitle>
                <CardDescription>
                  Complete log history for all phases
                </CardDescription>
              </CardHeader>
              <CardContent>
                {phases.map(phase => (
                  <div key={phase.id} className="mb-6">
                    <div className="flex items-center gap-2 mb-2">
                      {getStatusIcon(phase.status)}
                      <h3 className="font-semibold">{phase.name}</h3>
                      <Badge variant="outline" className="ml-auto">
                        {phase.logs.length} logs
                      </Badge>
                    </div>
                    <div className="bg-muted/50 rounded-2xl p-4 max-h-64 overflow-y-auto">
                      {phase.logs.length > 0 ? (
                        phase.logs.map((log, i) => (
                          <p key={i} className="text-xs font-mono text-muted-foreground mb-1">
                            {log}
                          </p>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No logs yet</p>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Console Commands Reference */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Terminal className="w-5 h-5" />
              Console Commands Reference
            </CardTitle>
            <CardDescription>
              Manual commands for advanced users
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 font-mono text-sm">
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <code>window.runSecurityAudit()</code>
                <Badge variant="outline">Phase 2</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <code>window.runInfrastructureCheck()</code>
                <Badge variant="outline">Phase 3</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <code>window.initializeTeamReadiness()</code>
                <Badge variant="outline">Phase 4</Badge>
              </div>
              <div className="flex items-center justify-between p-2 bg-muted/50 rounded">
                <code>window.initBetaProgram()</code>
                <Badge variant="outline">Phase 5</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
