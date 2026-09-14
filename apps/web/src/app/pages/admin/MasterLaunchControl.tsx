import { useState, useEffect } from 'react';
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
  Target,
  Terminal,
  Loader2,
  TrendingUp,
  Award,
  Flag
} from 'lucide-react';

interface PhaseStatus {
  id: string;
  name: string;
  status: 'complete' | 'running' | 'ready' | 'blocked';
  progress: number;
  score?: number;
  details?: any;
}

export default function MasterLaunchControl() {
  const [activeTab, setActiveTab] = useState('overview');
  const [overallProgress, setOverallProgress] = useState(20);
  
  // Phase states
  const [phases, setPhases] = useState<PhaseStatus[]>([
    {
      id: 'phase1',
      name: 'Production Validation',
      status: 'complete',
      progress: 100,
      score: 100
    },
    {
      id: 'phase2',
      name: 'Security Audit',
      status: 'ready',
      progress: 0
    },
    {
      id: 'phase3',
      name: 'Infrastructure',
      status: 'ready',
      progress: 0
    },
    {
      id: 'phase4',
      name: 'Team Readiness',
      status: 'ready',
      progress: 0
    },
    {
      id: 'phase5',
      name: 'Beta Testing',
      status: 'ready',
      progress: 0
    }
  ]);

  // Auto-refresh overall progress
  useEffect(() => {
    const completedPhases = phases.filter(p => p.status === 'complete').length;
    const newProgress = Math.round((completedPhases / phases.length) * 100);
    setOverallProgress(newProgress);
  }, [phases]);

  /**
   * Run complete launch sequence
   */
  const runCompleteSequence = async () => {
    try {
      
      // Phase 2: Security
      updatePhaseStatus('phase2', 'running');
      const securityReport = await (window as any).runSecurityAudit();
      updatePhaseStatus('phase2', securityReport.overallScore >= 85 ? 'complete' : 'blocked', securityReport.overallScore);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Phase 3: Infrastructure
      updatePhaseStatus('phase3', 'running');
      const infraReport = await (window as any).runInfrastructureCheck();
      updatePhaseStatus('phase3', infraReport.healthScore >= 85 ? 'complete' : 'blocked', infraReport.healthScore);
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Phase 4: Team Readiness (manual check)
      const teamReport = (window as any).getTeamReadinessReport?.();
      if (teamReport) {
        updatePhaseStatus('phase4', teamReport.readyForLaunch ? 'complete' : 'ready', teamReport.overallReadiness);
      }
      
      // Phase 5: Beta (manual initialization required)
      
    } catch (error) {
      console.error('❌ Launch sequence error:', error);
    }
  };

  /**
   * Update phase status
   */
  const updatePhaseStatus = (phaseId: string, status: any, score?: number) => {
    setPhases(prev => prev.map(phase => {
      if (phase.id === phaseId) {
        let progress = phase.progress;
        
        if (status === 'complete') {
          progress = 100;
        } else if (status === 'running') {
          progress = 50;
        } else if (status === 'blocked') {
          progress = score || 50;
        }
        
        return { ...phase, status, progress, score };
      }
      return phase;
    }));
  };

  /**
   * Get phase icon
   */
  const getPhaseIcon = (status: string) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'running':
        return <Loader2 className="w-5 h-5 text-info animate-spin" />;
      case 'blocked':
        return <XCircle className="w-5 h-5 text-error" />;
      default:
        return <Clock className="w-5 h-5 text-muted-foreground" />;
    }
  };

  /**
   * Get status badge variant
   */
  const getBadgeVariant = (status: string) => {
    switch (status) {
      case 'complete':
        return 'default';
      case 'running':
        return 'secondary';
      case 'blocked':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Hero Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Rocket className="w-10 h-10 text-primary" />
              <div>
                <h1 className="text-4xl font-bold">Master Launch Control</h1>
                <p className="text-muted-foreground text-lg">
                  Complete automation system for Ezyify platform launch
                </p>
              </div>
            </div>
          </div>
          
          <Button 
            onClick={runCompleteSequence} 
            size="lg"
            className="h-14 px-8"
          >
            <Zap className="w-5 h-5 mr-2" />
            Run Full Sequence
          </Button>
        </div>

        {/* Overall Progress */}
        <Card className="bg-primary/5">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="text-sm text-muted-foreground">Overall Launch Progress</div>
                <div className="text-4xl font-bold">{overallProgress}%</div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Phases Complete</div>
                <div className="text-4xl font-bold">
                  {phases.filter(p => p.status === 'complete').length}/{phases.length}
                </div>
              </div>
            </div>
            <Progress value={overallProgress} className="h-4" />
            <div className="mt-4 flex items-center gap-2">
              {overallProgress === 100 ? (
                <Badge variant="default" className="text-sm">
                  <Award className="w-3 h-3 mr-1" />
                  Ready to Launch!
                </Badge>
              ) : overallProgress >= 60 ? (
                <Badge variant="secondary" className="text-sm">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Good Progress
                </Badge>
              ) : (
                <Badge variant="outline" className="text-sm">
                  <Target className="w-3 h-3 mr-1" />
                  In Progress
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Phase Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mt-6">
          {phases.map((phase, index) => (
            <Card 
              key={phase.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                phase.status === 'complete' ? 'border-success' :
                phase.status === 'running' ? 'border-info' :
                phase.status === 'blocked' ? 'border-error' : ''
              }`}
              onClick={() => setActiveTab(`phase${index + 1}`)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between mb-2">
                  <Badge variant="outline" className="text-xs">
                    Phase {index + 1}
                  </Badge>
                  {getPhaseIcon(phase.status)}
                </div>
                <CardTitle className="text-sm">{phase.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={phase.progress} className="h-2 mb-2" />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">{phase.progress}%</span>
                  {phase.score && (
                    <span className="text-xs font-semibold">{phase.score}/100</span>
                  )}
                </div>
                <Badge variant={getBadgeVariant(phase.status)} className="text-xs mt-2">
                  {phase.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="phase1">Phase 1</TabsTrigger>
          <TabsTrigger value="phase2">Phase 2</TabsTrigger>
          <TabsTrigger value="phase3">Phase 3</TabsTrigger>
          <TabsTrigger value="phase4">Phase 4</TabsTrigger>
          <TabsTrigger value="phase5">Phase 5</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Alert>
            <Terminal className="w-4 h-4" />
            <AlertDescription>
              This is the master control center for your complete launch automation. All phases can be managed from here.
            </AlertDescription>
          </Alert>

          {/* Quick Start Guide */}
          <Card>
            <CardHeader>
              <CardTitle>🚀 Quick Start Guide</CardTitle>
              <CardDescription>Follow these steps to launch Ezyify</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                  <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                  <div>
                    <div className="font-semibold">Step 1: Production Validation ✅</div>
                    <div className="text-sm text-muted-foreground">
                      93 pages validated, 100+ sessions collected, chaos tests passed
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                  <Play className="w-5 h-5 text-info mt-0.5" />
                  <div>
                    <div className="font-semibold">Step 2: Security Audit</div>
                    <div className="text-sm text-muted-foreground">
                      Run: <code className="text-xs bg-background px-1 rounded">window.runSecurityAudit()</code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                  <Play className="w-5 h-5 text-info mt-0.5" />
                  <div>
                    <div className="font-semibold">Step 3: Infrastructure Check</div>
                    <div className="text-sm text-muted-foreground">
                      Run: <code className="text-xs bg-background px-1 rounded">window.runInfrastructureCheck()</code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                  <Users className="w-5 h-5 text-info mt-0.5" />
                  <div>
                    <div className="font-semibold">Step 4: Team Readiness</div>
                    <div className="text-sm text-muted-foreground">
                      Run: <code className="text-xs bg-background px-1 rounded">window.initializeTeamReadiness()</code>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                  <Rocket className="w-5 h-5 text-info mt-0.5" />
                  <div>
                    <div className="font-semibold">Step 5: Beta Testing</div>
                    <div className="text-sm text-muted-foreground">
                      Run: <code className="text-xs bg-background px-1 rounded">window.initBetaProgram()</code>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* All Console Commands */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Terminal className="w-5 h-5" />
                All Console Commands
              </CardTitle>
              <CardDescription>Complete reference for all automation tools</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Phase 1: Validation</h4>
                  <div className="p-2 bg-muted rounded font-mono text-xs">
                    <code>window.runFullProductionValidation()</code>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Phase 2: Security</h4>
                  <div className="p-2 bg-muted rounded font-mono text-xs space-y-1">
                    <div><code>window.runSecurityAudit()</code></div>
                    <div><code>window.exportSecurityReport()</code></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Phase 3: Infrastructure</h4>
                  <div className="p-2 bg-muted rounded font-mono text-xs space-y-1">
                    <div><code>window.runInfrastructureCheck()</code></div>
                    <div><code>window.exportInfrastructureReport()</code></div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Phase 4: Team</h4>
                  <div className="p-2 bg-muted rounded font-mono text-xs space-y-1">
                    <div><code>window.initializeTeamReadiness()</code></div>
                    <div><code>window.printTeamSummary()</code></div>
                    <div><code>window.exportTeamReadinessReport()</code></div>
                  </div>
                </div>
                
                <div className="space-y-2 md:col-span-2">
                  <h4 className="font-semibold text-sm">Phase 5: Beta Testing</h4>
                  <div className="p-2 bg-muted rounded font-mono text-xs space-y-1 grid grid-cols-2 gap-2">
                    <div><code>window.initBetaProgram()</code></div>
                    <div><code>window.getSoftLaunchReport()</code></div>
                    <div><code>window.addBetaUser(email, name)</code></div>
                    <div><code>window.setRolloutTraffic(percent)</code></div>
                    <div><code>window.exportBetaUsers()</code></div>
                    <div><code>window.exportBetaFeedback()</code></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phase Tabs */}
        {[1, 2, 3, 4, 5].map(num => (
          <TabsContent key={num} value={`phase${num}`} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Phase {num}: {phases[num - 1].name}</span>
                  <Badge variant={getBadgeVariant(phases[num - 1].status)}>
                    {phases[num - 1].status}
                  </Badge>
                </CardTitle>
                <CardDescription>
                  {num === 1 && 'Comprehensive platform validation and baseline collection'}
                  {num === 2 && 'Automated security testing and vulnerability scanning'}
                  {num === 3 && 'Infrastructure health checks and component validation'}
                  {num === 4 && 'Team preparation and operational readiness'}
                  {num === 5 && 'Gradual beta rollout and user feedback collection'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  {getPhaseIcon(phases[num - 1].status)}
                  <div className="mt-4 text-lg font-semibold">
                    {phases[num - 1].status === 'complete' ? (
                      '✅ Phase Complete!'
                    ) : phases[num - 1].status === 'running' ? (
                      '⚙️ Phase Running...'
                    ) : phases[num - 1].status === 'blocked' ? (
                      '❌ Phase Blocked - Fix Issues'
                    ) : (
                      '⏳ Ready to Start'
                    )}
                  </div>
                  <div className="mt-2 text-muted-foreground">
                    Progress: {phases[num - 1].progress}%
                  </div>
                  {phases[num - 1].score && (
                    <div className="mt-2">
                      Score: <span className="font-bold">{phases[num - 1].score}/100</span>
                    </div>
                  )}
                  
                  <div className="mt-6">
                    <Button 
                      variant="outline"
                      onClick={() => {
                        if (num === 2) (window as any).runSecurityAudit?.();
                        if (num === 3) (window as any).runInfrastructureCheck?.();
                        if (num === 4) (window as any).initializeTeamReadiness?.();
                        if (num === 5) (window as any).initBetaProgram?.();
                      }}
                    >
                      <Play className="w-4 h-4 mr-2" />
                      {num === 1 ? 'Already Complete' : `Run Phase ${num}`}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Launch Readiness Footer */}
      <Card className="mt-6">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Flag className="w-5 h-5 text-primary" />
              <div>
                <div className="font-semibold">Launch Readiness Status</div>
                <div className="text-sm text-muted-foreground">
                  {overallProgress === 100 
                    ? '🎉 All systems go! Ready for production launch.'
                    : `${phases.filter(p => p.status === 'complete').length} of ${phases.length} phases complete`
                  }
                </div>
              </div>
            </div>
            
            {overallProgress === 100 && (
              <Button size="lg" className="bg-success hover:bg-success/90">
                <Rocket className="w-4 h-4 mr-2" />
                Launch to Production
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
