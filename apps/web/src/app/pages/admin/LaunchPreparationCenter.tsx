import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Checkbox } from '../../components/ui/checkbox';
import { Slider } from '../../components/ui/slider';
import {
  Shield,
  Server,
  Users,
  Rocket,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Clock,
  TrendingUp,
  Activity,
  Database,
  Lock,
  Bell,
  FileCheck,
  PlayCircle,
  PauseCircle,
  Radio,
  Zap,
  Target,
  BarChart3,
  Settings,
  Upload,
  Download,
  Eye,
  EyeOff
} from 'lucide-react';

// Phase status type
type PhaseStatus = 'not-started' | 'in-progress' | 'complete' | 'blocked';

interface Phase {
  id: string;
  name: string;
  status: PhaseStatus;
  progress: number;
  tasks: Task[];
  estimatedDays: number;
}

interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  critical: boolean;
  assignee?: string;
  dueDate?: string;
}

export default function LaunchPreparationCenter() {
  const [activeTab, setActiveTab] = useState('overview');
  const [trafficPercentage, setTrafficPercentage] = useState([1]);
  const [rolloutStatus, setRolloutStatus] = useState<'paused' | 'running'>('paused');

  // Phase 1: Production Validation
  const [validationPhase, setValidationPhase] = useState<Phase>({
    id: 'validation',
    name: 'Production Validation',
    status: 'complete',
    progress: 100,
    estimatedDays: 1,
    tasks: [
      { id: 'v1', title: 'Infrastructure Tests', description: 'CDN, DNS, SSL/TLS validation', completed: true, critical: true },
      { id: 'v2', title: 'RUM Collection (100+ sessions)', description: 'Real user monitoring data', completed: true, critical: true },
      { id: 'v3', title: 'Chaos Engineering Tests', description: 'Failure scenario validation', completed: true, critical: true },
      { id: 'v4', title: 'Business Flow Validation', description: 'Critical user journeys', completed: true, critical: true },
      { id: 'v5', title: 'Performance Baseline Lock', description: 'P95 metrics locked', completed: true, critical: true },
    ],
  });

  // Phase 2: Security & Compliance
  const [securityPhase, setSecurityPhase] = useState<Phase>({
    id: 'security',
    name: 'Security & Compliance',
    status: 'not-started',
    progress: 0,
    estimatedDays: 7,
    tasks: [
      { id: 's1', title: 'Security Audit', description: 'XSS, CSRF, SQL injection testing', completed: false, critical: true },
      { id: 's2', title: 'Penetration Testing', description: 'External security assessment', completed: false, critical: true },
      { id: 's3', title: 'GDPR Compliance', description: 'Data privacy verification', completed: false, critical: true },
      { id: 's4', title: 'PCI-DSS Validation', description: 'Payment security compliance', completed: false, critical: false },
      { id: 's5', title: 'Vulnerability Scan', description: 'Automated security scanning', completed: false, critical: true },
      { id: 's6', title: 'SSL/TLS Configuration', description: 'Certificate validation', completed: false, critical: true },
      { id: 's7', title: 'API Security Review', description: 'Rate limiting, authentication', completed: false, critical: true },
      { id: 's8', title: 'Privacy Policy Update', description: 'Legal compliance', completed: false, critical: true },
    ],
  });

  // Phase 3: Infrastructure Setup
  const [infrastructurePhase, setInfrastructurePhase] = useState<Phase>({
    id: 'infrastructure',
    name: 'Infrastructure Setup',
    status: 'not-started',
    progress: 0,
    estimatedDays: 5,
    tasks: [
      { id: 'i1', title: 'CDN Configuration', description: 'Production CDN setup', completed: false, critical: true },
      { id: 'i2', title: 'Load Balancer Setup', description: 'Traffic distribution', completed: false, critical: true },
      { id: 'i3', title: 'Database Replication', description: 'Master-slave setup', completed: false, critical: true },
      { id: 'i4', title: 'Backup Automation', description: 'Daily automated backups', completed: false, critical: true },
      { id: 'i5', title: 'Monitoring Dashboards', description: 'Grafana/Datadog setup', completed: false, critical: true },
      { id: 'i6', title: 'Alert Configuration', description: 'PagerDuty/Slack alerts', completed: false, critical: true },
      { id: 'i7', title: 'SSL Certificates', description: 'Production certificates', completed: false, critical: true },
      { id: 'i8', title: 'DNS Configuration', description: 'Production DNS records', completed: false, critical: true },
    ],
  });

  // Phase 4: Team Readiness
  const [teamPhase, setTeamPhase] = useState<Phase>({
    id: 'team',
    name: 'Team Readiness',
    status: 'not-started',
    progress: 0,
    estimatedDays: 3,
    tasks: [
      { id: 't1', title: 'Support Team Training', description: 'Customer support onboarding', completed: false, critical: true },
      { id: 't2', title: 'Operations Runbook Review', description: 'Team walkthrough', completed: false, critical: true },
      { id: 't3', title: 'Incident Response Drill', description: 'Practice emergency scenarios', completed: false, critical: true },
      { id: 't4', title: 'On-Call Schedule', description: 'Engineer rotation setup', completed: false, critical: true },
      { id: 't5', title: 'Communication Channels', description: 'Slack/Discord setup', completed: false, critical: true },
      { id: 't6', title: 'Documentation Review', description: 'All team members trained', completed: false, critical: true },
    ],
  });

  // Phase 5: Soft Launch
  const [softLaunchPhase, setSoftLaunchPhase] = useState<Phase>({
    id: 'softlaunch',
    name: 'Soft Launch',
    status: 'not-started',
    progress: 0,
    estimatedDays: 14,
    tasks: [
      { id: 'sl1', title: 'Beta User Recruitment', description: '100-500 beta testers', completed: false, critical: true },
      { id: 'sl2', title: '1% Traffic Rollout', description: 'Initial traffic test', completed: false, critical: true },
      { id: 'sl3', title: '5% Traffic Rollout', description: 'Expanded testing', completed: false, critical: true },
      { id: 'sl4', title: '10% Traffic Rollout', description: 'Wider audience', completed: false, critical: true },
      { id: 'sl5', title: 'Feedback Collection', description: 'User feedback analysis', completed: false, critical: true },
      { id: 'sl6', title: 'Issue Resolution', description: 'Bug fixes and improvements', completed: false, critical: true },
      { id: 'sl7', title: 'Performance Monitoring', description: 'Real-world metrics', completed: false, critical: true },
    ],
  });

  const phases = [validationPhase, securityPhase, infrastructurePhase, teamPhase, softLaunchPhase];
  
  const overallProgress = phases.reduce((acc, phase) => acc + phase.progress, 0) / phases.length;
  const completedPhases = phases.filter(p => p.status === 'complete').length;
  const totalTasks = phases.reduce((acc, phase) => acc + phase.tasks.length, 0);
  const completedTasks = phases.reduce((acc, phase) => acc + phase.tasks.filter(t => t.completed).length, 0);

  const toggleTask = (phaseId: string, taskId: string) => {
    const updatePhase = (phase: Phase) => {
      if (phase.id !== phaseId) return phase;
      
      const updatedTasks = phase.tasks.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      
      const completedCount = updatedTasks.filter(t => t.completed).length;
      const progress = (completedCount / updatedTasks.length) * 100;
      
      let status: PhaseStatus = 'not-started';
      if (progress === 100) status = 'complete';
      else if (progress > 0) status = 'in-progress';
      
      return { ...phase, tasks: updatedTasks, progress, status };
    };

    if (phaseId === 'validation') setValidationPhase(updatePhase);
    else if (phaseId === 'security') setSecurityPhase(updatePhase);
    else if (phaseId === 'infrastructure') setInfrastructurePhase(updatePhase);
    else if (phaseId === 'team') setTeamPhase(updatePhase);
    else if (phaseId === 'softlaunch') setSoftLaunchPhase(updatePhase);
  };

  const getStatusColor = (status: PhaseStatus) => {
    switch (status) {
      case 'complete': return 'bg-success';
      case 'in-progress': return 'bg-info';
      case 'blocked': return 'bg-error';
      default: return 'bg-border';
    }
  };

  const getStatusIcon = (status: PhaseStatus) => {
    switch (status) {
      case 'complete': return <CheckCircle2 className="w-4 h-4" />;
      case 'in-progress': return <Clock className="w-4 h-4" />;
      case 'blocked': return <XCircle className="w-4 h-4" />;
      default: return <AlertTriangle className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Rocket className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">Launch Preparation Center</h1>
        </div>
        <p className="text-muted-foreground">
          Orchestrate all pre-launch phases and monitor launch readiness
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Overall Launch Progress</span>
            <Badge variant={overallProgress === 100 ? 'default' : 'secondary'}>
              {completedPhases}/{phases.length} Phases Complete
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Total Progress</span>
                <span className="text-sm text-muted-foreground">{Math.round(overallProgress)}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-2xl font-bold text-primary">{completedPhases}/{phases.length}</div>
                <div className="text-xs text-muted-foreground">Phases Done</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-2xl font-bold text-primary">{completedTasks}/{totalTasks}</div>
                <div className="text-xs text-muted-foreground">Tasks Done</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-2xl font-bold text-primary">
                  {phases.reduce((acc, p) => acc + p.estimatedDays, 0)}
                </div>
                <div className="text-xs text-muted-foreground">Total Days Est.</div>
              </div>
              <div className="text-center p-4 bg-muted rounded-xl">
                <div className="text-2xl font-bold text-primary">
                  {overallProgress === 100 ? '🚀' : '⏳'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {overallProgress === 100 ? 'Ready!' : 'In Progress'}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-2 md:grid-cols-6 mb-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="softlaunch">Soft Launch</TabsTrigger>
          <TabsTrigger value="rollout">Rollout Control</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Alert>
            <Rocket className="w-4 h-4" />
            <AlertDescription>
              Track all pre-launch phases and ensure everything is ready before going live.
              Current phase: <strong>{phases.find(p => p.status === 'in-progress')?.name || 'All Complete!'}</strong>
            </AlertDescription>
          </Alert>

          {/* Phase Timeline */}
          <Card>
            <CardHeader>
              <CardTitle>Launch Timeline</CardTitle>
              <CardDescription>All phases and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {phases.map((phase, index) => (
                  <div key={phase.id} className="relative">
                    {/* Timeline connector */}
                    {index < phases.length - 1 && (
                      <div className="absolute left-6 top-12 bottom-0 w-0.5 bg-border" />
                    )}
                    
                    <div className="flex gap-4">
                      {/* Phase icon */}
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getStatusColor(phase.status)} text-white z-10`}>
                        {getStatusIcon(phase.status)}
                      </div>

                      {/* Phase details */}
                      <div className="flex-1 pb-8">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold">{phase.name}</h3>
                          <Badge variant={phase.status === 'complete' ? 'default' : 'secondary'}>
                            {phase.status}
                          </Badge>
                        </div>
                        
                        <div className="mb-2">
                          <div className="flex justify-between text-sm mb-1">
                            <span className="text-muted-foreground">
                              {phase.tasks.filter(t => t.completed).length}/{phase.tasks.length} tasks
                            </span>
                            <span className="text-muted-foreground">{Math.round(phase.progress)}%</span>
                          </div>
                          <Progress value={phase.progress} className="h-2" />
                        </div>

                        <div className="text-sm text-muted-foreground">
                          Estimated: {phase.estimatedDays} {phase.estimatedDays === 1 ? 'day' : 'days'}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Critical Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-warning" />
                Critical Tasks Remaining
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {phases.flatMap(phase => 
                  phase.tasks.filter(t => t.critical && !t.completed).map(task => (
                    <div key={task.id} className="flex items-center gap-3 p-3 bg-muted rounded-xl">
                      <AlertTriangle className="w-4 h-4 text-warning" />
                      <div className="flex-1">
                        <div className="font-medium">{task.title}</div>
                        <div className="text-sm text-muted-foreground">{task.description}</div>
                      </div>
                      <Badge variant="outline">{phases.find(p => p.tasks.includes(task))?.name}</Badge>
                    </div>
                  ))
                )}
                {phases.every(phase => phase.tasks.filter(t => t.critical).every(t => t.completed)) && (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle2 className="w-12 h-12 mx-auto mb-2 text-success" />
                    <p>All critical tasks complete! 🎉</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="w-5 h-5" />
                Security & Compliance
              </CardTitle>
              <CardDescription>
                Ensure platform security before launch ({securityPhase.tasks.filter(t => t.completed).length}/{securityPhase.tasks.length} complete)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {securityPhase.tasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask('security', task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                        {task.critical && <Badge variant="destructive" className="text-xs">Critical</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Shield className="w-4 h-4" />
            <AlertDescription>
              All security tasks must be completed before soft launch. Critical tasks are mandatory for production.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Infrastructure Tab */}
        <TabsContent value="infrastructure" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="w-5 h-5" />
                Infrastructure Setup
              </CardTitle>
              <CardDescription>
                Production infrastructure configuration ({infrastructurePhase.tasks.filter(t => t.completed).length}/{infrastructurePhase.tasks.length} complete)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {infrastructurePhase.tasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask('infrastructure', task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                        {task.critical && <Badge variant="destructive" className="text-xs">Critical</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Server className="w-4 h-4" />
            <AlertDescription>
              Infrastructure must be production-ready and tested before accepting real user traffic.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Team Readiness
              </CardTitle>
              <CardDescription>
                Prepare team for launch ({teamPhase.tasks.filter(t => t.completed).length}/{teamPhase.tasks.length} complete)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {teamPhase.tasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask('team', task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                        {task.critical && <Badge variant="destructive" className="text-xs">Critical</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Users className="w-4 h-4" />
            <AlertDescription>
              All team members must be trained and ready to handle production incidents and user support.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Soft Launch Tab */}
        <TabsContent value="softlaunch" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5" />
                Soft Launch
              </CardTitle>
              <CardDescription>
                Gradual user rollout and testing ({softLaunchPhase.tasks.filter(t => t.completed).length}/{softLaunchPhase.tasks.length} complete)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {softLaunchPhase.tasks.map(task => (
                  <div key={task.id} className="flex items-start gap-3 p-3 bg-muted rounded-xl hover:bg-muted/80 transition-colors">
                    <Checkbox
                      checked={task.completed}
                      onCheckedChange={() => toggleTask('softlaunch', task.id)}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </span>
                        {task.critical && <Badge variant="destructive" className="text-xs">Critical</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{task.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Activity className="w-4 h-4" />
            <AlertDescription>
              Monitor metrics closely during soft launch. Be ready to rollback if critical issues are detected.
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* Rollout Control Tab */}
        <TabsContent value="rollout" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5" />
                Traffic Rollout Control
              </CardTitle>
              <CardDescription>
                Control real-time traffic percentage to production
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Rollout Status */}
              <div className="flex items-center justify-between p-4 bg-muted rounded-xl">
                <div>
                  <div className="font-semibold">Rollout Status</div>
                  <div className="text-sm text-muted-foreground">
                    {rolloutStatus === 'running' ? 'Traffic is flowing' : 'Rollout paused'}
                  </div>
                </div>
                <Button
                  variant={rolloutStatus === 'running' ? 'destructive' : 'default'}
                  onClick={() => setRolloutStatus(rolloutStatus === 'running' ? 'paused' : 'running')}
                >
                  {rolloutStatus === 'running' ? (
                    <>
                      <PauseCircle className="w-4 h-4 mr-2" />
                      Pause Rollout
                    </>
                  ) : (
                    <>
                      <PlayCircle className="w-4 h-4 mr-2" />
                      Start Rollout
                    </>
                  )}
                </Button>
              </div>

              {/* Traffic Percentage */}
              <div>
                <div className="flex justify-between mb-4">
                  <label className="font-semibold">Traffic Percentage</label>
                  <Badge variant="outline" className="text-lg">
                    {trafficPercentage[0]}%
                  </Badge>
                </div>
                <Slider
                  value={trafficPercentage}
                  onValueChange={setTrafficPercentage}
                  max={100}
                  step={1}
                  className="mb-2"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>0% (None)</span>
                  <span>25%</span>
                  <span>50%</span>
                  <span>75%</span>
                  <span>100% (Full)</span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                {[1, 5, 10, 25, 50, 75, 100].map(percent => (
                  <Button
                    key={percent}
                    variant={trafficPercentage[0] === percent ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setTrafficPercentage([percent])}
                  >
                    {percent}%
                  </Button>
                ))}
              </div>

              {/* Rollout Guidelines */}
              <Alert>
                <Target className="w-4 h-4" />
                <AlertDescription>
                  <strong>Recommended Rollout:</strong> 1% → 5% → 10% → 25% → 50% → 100%<br />
                  Monitor for 24-48 hours at each level before increasing.
                </AlertDescription>
              </Alert>

              {/* Current Metrics (Simulated) */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-muted rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">Active Users</div>
                  <div className="text-2xl font-bold">
                    {rolloutStatus === 'running' ? Math.round(1000 * (trafficPercentage[0] / 100)) : 0}
                  </div>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">Error Rate</div>
                  <div className="text-2xl font-bold text-success">0.8%</div>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">P95 LCP</div>
                  <div className="text-2xl font-bold text-success">1.2s</div>
                </div>
                <div className="p-4 bg-muted rounded-xl">
                  <div className="text-xs text-muted-foreground mb-1">Server Load</div>
                  <div className="text-2xl font-bold">{Math.round(35 * (trafficPercentage[0] / 100))}%</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Emergency Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="w-5 h-5" />
                Emergency Controls
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="destructive" className="w-full" size="lg">
                <XCircle className="w-4 h-4 mr-2" />
                Emergency Rollback to 0%
              </Button>
              <Button variant="outline" className="w-full">
                <Download className="w-4 h-4 mr-2" />
                Export Current Metrics
              </Button>
              <Button variant="outline" className="w-full">
                <Bell className="w-4 h-4 mr-2" />
                Alert Engineering Team
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
