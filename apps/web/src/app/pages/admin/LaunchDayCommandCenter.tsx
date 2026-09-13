import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import {
  Rocket,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Users,
  Phone,
  MessageSquare,
  Shield,
  Activity,
  TrendingUp,
  AlertCircle,
  PlayCircle,
  PauseCircle,
  StopCircle,
  RefreshCw,
  Download,
  Bell,
  Zap,
  Server,
  Database,
  Globe,
  Lock,
  UserCheck,
  Settings,
  ChevronRight,
  Flag,
  FileText
} from 'lucide-react';
import { toast } from 'sonner';

interface ChecklistItem {
  id: string;
  category: string;
  item: string;
  status: 'pending' | 'in-progress' | 'complete' | 'blocked' | 'failed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee: string;
  timeEstimate: string;
  dependencies?: string[];
  notes?: string;
}

interface TeamMember {
  id: string;
  name: string;
  role: string;
  status: 'online' | 'busy' | 'offline';
  currentTask?: string;
  contact: {
    phone: string;
    email: string;
    slack?: string;
  };
}

interface CrisisScenario {
  id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium';
  trigger: string;
  responseProtocol: string[];
  escalationPath: string[];
  estimatedResolutionTime: string;
  teamRequired: string[];
}

interface GoNoGoCheck {
  id: string;
  category: string;
  check: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  details: string;
  blocker: boolean;
  lastChecked?: string;
}

export default function LaunchDayCommandCenter() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [launchStatus, setLaunchStatus] = useState<'pre-launch' | 'launching' | 'live' | 'rollback'>('pre-launch');
  const [countdown, setCountdown] = useState<number>(0);
  const [activeTab, setActiveTab] = useState('overview');

  // Launch checklist
  const [checklist, setChecklist] = useState<ChecklistItem[]>([
    {
      id: 'check-1',
      category: 'Infrastructure',
      item: 'Verify all production servers are running',
      status: 'complete',
      priority: 'critical',
      assignee: 'DevOps Team',
      timeEstimate: '5 min'
    },
    {
      id: 'check-2',
      category: 'Infrastructure',
      item: 'Confirm CDN is properly configured',
      status: 'complete',
      priority: 'critical',
      assignee: 'DevOps Team',
      timeEstimate: '5 min'
    },
    {
      id: 'check-3',
      category: 'Infrastructure',
      item: 'Validate database replication',
      status: 'complete',
      priority: 'critical',
      assignee: 'Database Admin',
      timeEstimate: '10 min'
    },
    {
      id: 'check-4',
      category: 'Security',
      item: 'SSL certificates valid and up to date',
      status: 'complete',
      priority: 'critical',
      assignee: 'Security Team',
      timeEstimate: '5 min'
    },
    {
      id: 'check-5',
      category: 'Security',
      item: 'WAF rules activated',
      status: 'complete',
      priority: 'critical',
      assignee: 'Security Team',
      timeEstimate: '5 min'
    },
    {
      id: 'check-6',
      category: 'Security',
      item: 'Rate limiting configured',
      status: 'complete',
      priority: 'high',
      assignee: 'Security Team',
      timeEstimate: '5 min'
    },
    {
      id: 'check-7',
      category: 'Monitoring',
      item: 'All monitoring dashboards active',
      status: 'complete',
      priority: 'critical',
      assignee: 'SRE Team',
      timeEstimate: '10 min'
    },
    {
      id: 'check-8',
      category: 'Monitoring',
      item: 'Alert channels configured and tested',
      status: 'complete',
      priority: 'critical',
      assignee: 'SRE Team',
      timeEstimate: '10 min'
    },
    {
      id: 'check-9',
      category: 'Monitoring',
      item: 'Performance baselines locked',
      status: 'complete',
      priority: 'high',
      assignee: 'SRE Team',
      timeEstimate: '5 min'
    },
    {
      id: 'check-10',
      category: 'Application',
      item: 'Payment gateway integration verified',
      status: 'in-progress',
      priority: 'critical',
      assignee: 'Backend Team',
      timeEstimate: '15 min'
    },
    {
      id: 'check-11',
      category: 'Application',
      item: 'Escrow system operational',
      status: 'in-progress',
      priority: 'critical',
      assignee: 'Backend Team',
      timeEstimate: '10 min'
    },
    {
      id: 'check-12',
      category: 'Application',
      item: 'Email/SMS notifications working',
      status: 'pending',
      priority: 'high',
      assignee: 'Backend Team',
      timeEstimate: '10 min'
    },
    {
      id: 'check-13',
      category: 'Content',
      item: 'Landing page content finalized',
      status: 'complete',
      priority: 'high',
      assignee: 'Marketing Team',
      timeEstimate: '30 min'
    },
    {
      id: 'check-14',
      category: 'Content',
      item: 'Legal pages published',
      status: 'complete',
      priority: 'critical',
      assignee: 'Legal Team',
      timeEstimate: '10 min'
    },
    {
      id: 'check-15',
      category: 'Support',
      item: 'Customer support team briefed',
      status: 'complete',
      priority: 'high',
      assignee: 'Support Lead',
      timeEstimate: '20 min'
    },
    {
      id: 'check-16',
      category: 'Support',
      item: 'FAQ and help docs published',
      status: 'complete',
      priority: 'medium',
      assignee: 'Support Team',
      timeEstimate: '15 min'
    },
    {
      id: 'check-17',
      category: 'Marketing',
      item: 'Social media posts scheduled',
      status: 'pending',
      priority: 'high',
      assignee: 'Social Media Team',
      timeEstimate: '20 min'
    },
    {
      id: 'check-18',
      category: 'Marketing',
      item: 'Press release ready',
      status: 'pending',
      priority: 'medium',
      assignee: 'PR Team',
      timeEstimate: '10 min'
    }
  ]);

  // Team members
  const [team, setTeam] = useState<TeamMember[]>([
    {
      id: 'team-1',
      name: 'Sarah Chen',
      role: 'Launch Commander',
      status: 'online',
      currentTask: 'Monitoring overall launch status',
      contact: { phone: '+880 1XXX-XXXXXX', email: 'sarah@ezyify.com', slack: '@sarah' }
    },
    {
      id: 'team-2',
      name: 'Rajesh Kumar',
      role: 'DevOps Lead',
      status: 'online',
      currentTask: 'Infrastructure verification',
      contact: { phone: '+880 1XXX-XXXXXX', email: 'rajesh@ezyify.com', slack: '@rajesh' }
    },
    {
      id: 'team-3',
      name: 'Emily Rodriguez',
      role: 'Backend Lead',
      status: 'busy',
      currentTask: 'Payment gateway testing',
      contact: { phone: '+880 1XXX-XXXXXX', email: 'emily@ezyify.com', slack: '@emily' }
    },
    {
      id: 'team-4',
      name: 'Michael Zhang',
      role: 'Frontend Lead',
      status: 'online',
      currentTask: 'UI final checks',
      contact: { phone: '+880 1XXX-XXXXXX', email: 'michael@ezyify.com', slack: '@michael' }
    },
    {
      id: 'team-5',
      name: 'Priya Sharma',
      role: 'Security Lead',
      status: 'online',
      currentTask: 'Security audit complete',
      contact: { phone: '+880 1XXX-XXXXXX', email: 'priya@ezyify.com', slack: '@priya' }
    },
    {
      id: 'team-6',
      name: 'David Thompson',
      role: 'Support Lead',
      status: 'online',
      currentTask: 'Team briefing',
      contact: { phone: '+880 1XXX-XXXXXX', email: 'david@ezyify.com', slack: '@david' }
    },
    {
      id: 'team-7',
      name: 'Lisa Park',
      role: 'Marketing Lead',
      status: 'online',
      currentTask: 'Campaign preparation',
      contact: { phone: '+880 1XXX-XXXXXX', email: 'lisa@ezyify.com', slack: '@lisa' }
    },
    {
      id: 'team-8',
      name: 'Ahmed Hassan',
      role: 'SRE Lead',
      status: 'online',
      currentTask: 'Monitoring setup',
      contact: { phone: '+880 1XXX-XXXXXX', email: 'ahmed@ezyify.com', slack: '@ahmed' }
    }
  ]);

  // Crisis scenarios
  const [crisisScenarios] = useState<CrisisScenario[]>([
    {
      id: 'crisis-1',
      name: 'Complete Site Outage',
      severity: 'critical',
      trigger: '> 50% of health checks failing',
      responseProtocol: [
        'Activate incident commander',
        'Notify all team leads via SMS and Slack',
        'Start war room meeting within 2 minutes',
        'Begin rollback procedure if needed',
        'Post status page update',
        'Notify key stakeholders'
      ],
      escalationPath: ['SRE Lead → DevOps Lead → CTO → CEO'],
      estimatedResolutionTime: '5-15 minutes',
      teamRequired: ['DevOps', 'SRE', 'Backend']
    },
    {
      id: 'crisis-2',
      name: 'Payment Gateway Failure',
      severity: 'critical',
      trigger: 'Payment success rate < 80%',
      responseProtocol: [
        'Switch to backup payment provider',
        'Pause all checkout flows',
        'Notify finance team',
        'Start investigation',
        'Update users via in-app notification',
        'Monitor transaction logs'
      ],
      escalationPath: ['Backend Lead → CTO → CFO'],
      estimatedResolutionTime: '10-30 minutes',
      teamRequired: ['Backend', 'Finance', 'Support']
    },
    {
      id: 'crisis-3',
      name: 'Database Performance Degradation',
      severity: 'high',
      trigger: 'Query latency > 500ms P95',
      responseProtocol: [
        'Enable read replica routing',
        'Identify slow queries',
        'Apply query optimizations',
        'Scale database resources if needed',
        'Monitor replication lag',
        'Review connection pool settings'
      ],
      escalationPath: ['Database Admin → DevOps Lead → CTO'],
      estimatedResolutionTime: '15-45 minutes',
      teamRequired: ['DevOps', 'Backend', 'SRE']
    },
    {
      id: 'crisis-4',
      name: 'Security Breach Attempt',
      severity: 'critical',
      trigger: 'WAF alerts or anomalous traffic patterns',
      responseProtocol: [
        'Activate security team',
        'Block suspicious IPs immediately',
        'Review access logs',
        'Check for data exfiltration',
        'Notify legal if needed',
        'Document incident'
      ],
      escalationPath: ['Security Lead → CISO → CEO → Legal'],
      estimatedResolutionTime: '30-120 minutes',
      teamRequired: ['Security', 'DevOps', 'Legal']
    },
    {
      id: 'crisis-5',
      name: 'CDN Performance Issues',
      severity: 'high',
      trigger: 'Page load time > 3 seconds',
      responseProtocol: [
        'Switch CDN region if available',
        'Verify cache hit rates',
        'Check origin server health',
        'Adjust cache policies',
        'Contact CDN support',
        'Monitor global performance'
      ],
      escalationPath: ['DevOps Lead → SRE Lead → CTO'],
      estimatedResolutionTime: '10-30 minutes',
      teamRequired: ['DevOps', 'SRE']
    },
    {
      id: 'crisis-6',
      name: 'Viral Traffic Spike',
      severity: 'medium',
      trigger: 'Traffic > 500% of baseline',
      responseProtocol: [
        'Activate auto-scaling',
        'Enable aggressive caching',
        'Rate limit non-critical endpoints',
        'Monitor infrastructure costs',
        'Prepare capacity expansion',
        'Notify marketing team'
      ],
      escalationPath: ['SRE Lead → DevOps Lead → CTO'],
      estimatedResolutionTime: '20-60 minutes',
      teamRequired: ['SRE', 'DevOps', 'Backend']
    }
  ]);

  // Go/No-Go checks
  const [goNoGoChecks, setGoNoGoChecks] = useState<GoNoGoCheck[]>([
    {
      id: 'go-1',
      category: 'Performance',
      check: 'All pages load in < 2 seconds',
      status: 'pass',
      details: 'P95: 1.2s, P99: 1.8s',
      blocker: true,
      lastChecked: '2 min ago'
    },
    {
      id: 'go-2',
      category: 'Performance',
      check: 'Zero long tasks (> 50ms)',
      status: 'pass',
      details: 'No blocking tasks detected',
      blocker: true,
      lastChecked: '2 min ago'
    },
    {
      id: 'go-3',
      category: 'Performance',
      check: 'Lighthouse score > 95',
      status: 'pass',
      details: 'Current score: 98/100',
      blocker: true,
      lastChecked: '5 min ago'
    },
    {
      id: 'go-4',
      category: 'Security',
      check: 'SSL certificate valid',
      status: 'pass',
      details: 'Valid until: Feb 1, 2027',
      blocker: true,
      lastChecked: '1 min ago'
    },
    {
      id: 'go-5',
      category: 'Security',
      check: 'Security headers configured',
      status: 'pass',
      details: 'All headers present and correct',
      blocker: true,
      lastChecked: '1 min ago'
    },
    {
      id: 'go-6',
      category: 'Security',
      check: 'No known vulnerabilities',
      status: 'pass',
      details: '0 critical, 0 high, 2 low',
      blocker: true,
      lastChecked: '10 min ago'
    },
    {
      id: 'go-7',
      category: 'Infrastructure',
      check: 'All services healthy',
      status: 'pass',
      details: '12/12 services operational',
      blocker: true,
      lastChecked: '30 sec ago'
    },
    {
      id: 'go-8',
      category: 'Infrastructure',
      check: 'Database replication lag < 100ms',
      status: 'pass',
      details: 'Current lag: 45ms',
      blocker: true,
      lastChecked: '1 min ago'
    },
    {
      id: 'go-9',
      category: 'Infrastructure',
      check: 'CDN cache warmed',
      status: 'pass',
      details: 'Cache hit rate: 96%',
      blocker: false,
      lastChecked: '3 min ago'
    },
    {
      id: 'go-10',
      category: 'Functionality',
      check: 'Payment processing working',
      status: 'warning',
      details: 'Test mode - needs production verification',
      blocker: true,
      lastChecked: '5 min ago'
    },
    {
      id: 'go-11',
      category: 'Functionality',
      check: 'User authentication working',
      status: 'pass',
      details: 'Login/Signup tested successfully',
      blocker: true,
      lastChecked: '3 min ago'
    },
    {
      id: 'go-12',
      category: 'Functionality',
      check: 'Notifications delivery working',
      status: 'warning',
      details: 'SMS delivery: 98%, Email: 100%',
      blocker: false,
      lastChecked: '4 min ago'
    },
    {
      id: 'go-13',
      category: 'Monitoring',
      check: 'All monitoring dashboards active',
      status: 'pass',
      details: 'RUM, APM, Logs all operational',
      blocker: true,
      lastChecked: '30 sec ago'
    },
    {
      id: 'go-14',
      category: 'Monitoring',
      check: 'Alert rules configured',
      status: 'pass',
      details: '24 alert rules active',
      blocker: true,
      lastChecked: '2 min ago'
    },
    {
      id: 'go-15',
      category: 'Team',
      check: 'All team members online',
      status: 'pass',
      details: '8/8 team leads available',
      blocker: true,
      lastChecked: 'Just now'
    },
    {
      id: 'go-16',
      category: 'Team',
      check: 'Support team ready',
      status: 'pass',
      details: '6 agents online',
      blocker: true,
      lastChecked: '1 min ago'
    },
    {
      id: 'go-17',
      category: 'Legal',
      check: 'Terms & privacy published',
      status: 'pass',
      details: 'All legal pages live',
      blocker: true,
      lastChecked: '10 min ago'
    },
    {
      id: 'go-18',
      category: 'Legal',
      check: 'Data protection compliance',
      status: 'pass',
      details: 'GDPR/local laws compliant',
      blocker: true,
      lastChecked: '15 min ago'
    }
  ]);

  useEffect(() => {
    // Simulate initialization
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 800);

    // Set launch countdown (example: 25 Feb 2026)
    const launchDate = new Date('2026-02-25T00:00:00+06:00').getTime();
    const updateCountdown = () => {
      const now = Date.now();
      const diff = launchDate - now;
      setCountdown(Math.max(0, diff));
    };
    
    updateCountdown();
    const countdownInterval = setInterval(updateCountdown, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(countdownInterval);
    };
  }, []);

  const formatCountdown = (milliseconds: number) => {
    const days = Math.floor(milliseconds / (1000 * 60 * 60 * 24));
    const hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((milliseconds % (1000 * 60)) / 1000);
    return { days, hours, minutes, seconds };
  };

  const handleLaunch = () => {
    // Check if all blockers are resolved
    const hasBlockers = goNoGoChecks.some(check => check.blocker && check.status !== 'pass');
    
    if (hasBlockers) {
      toast.error('Cannot launch', {
        description: 'Please resolve all blocker issues first'
      });
      return;
    }

    setLaunchStatus('launching');
    toast.success('Launch sequence initiated!', {
      description: 'Deploying to production...'
    });

    // Simulate launch process
    setTimeout(() => {
      setLaunchStatus('live');
      toast.success('🚀 Ezyify is now LIVE!', {
        description: 'Platform successfully launched'
      });
    }, 5000);
  };

  const handleRollback = () => {
    setLaunchStatus('rollback');
    toast.warning('Initiating rollback', {
      description: 'Rolling back to previous stable version'
    });
  };

  const handleChecklistToggle = (id: string) => {
    setChecklist(prev => prev.map(item => 
      item.id === id 
        ? { ...item, status: item.status === 'complete' ? 'pending' : 'complete' }
        : item
    ));
  };

  const handleRunCheck = (id: string) => {
    setGoNoGoChecks(prev => prev.map(check =>
      check.id === id
        ? { ...check, status: 'pass', lastChecked: 'Just now' }
        : check
    ));
    toast.success('Check executed successfully: Status PASS');
  };

  const [activeCrisis, setActiveCrisis] = useState<string | null>(null);

  const handleActivateCrisis = (id: string) => {
    setActiveCrisis(id);
    const crisis = crisisScenarios.find(c => c.id === id);
    toast.error(`CRISIS ACTIVATED: ${crisis?.name}`, {
      description: 'Response protocols initiated. Team leads notified.',
      duration: 10000,
    });
  };

  const handleResolveCrisis = () => {
    setActiveCrisis(null);
    toast.success('Crisis Resolved', {
      description: 'System returning to normal operational state.'
    });
  };

  const calculateProgress = () => {
    const completed = checklist.filter(item => item.status === 'complete').length;
    return Math.round((completed / checklist.length) * 100);
  };

  const calculateGoNoGoScore = () => {
    const passed = goNoGoChecks.filter(check => check.status === 'pass').length;
    return Math.round((passed / goNoGoChecks.length) * 100);
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      'pass': <Badge className="bg-success"><CheckCircle2 className="w-3 h-3 mr-1" />Pass</Badge>,
      'fail': <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Fail</Badge>,
      'warning': <Badge className="bg-warning"><AlertTriangle className="w-3 h-3 mr-1" />Warning</Badge>,
      'pending': <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>,
      'complete': <Badge className="bg-success"><CheckCircle2 className="w-3 h-3 mr-1" />Complete</Badge>,
      'in-progress': <Badge className="bg-info"><Activity className="w-3 h-3 mr-1" />In Progress</Badge>,
      'blocked': <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Blocked</Badge>
    };
    return variants[status] || <Badge variant="secondary">{status}</Badge>;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'critical': 'text-error',
      'high': 'text-warning',
      'medium': 'text-warning',
      'low': 'text-info'
    };
    return colors[priority] || 'text-muted-foreground';
  };

  if (isInitializing) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-32 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
          <Skeleton className="h-40" />
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  const time = formatCountdown(countdown);
  const progress = calculateProgress();
  const goNoGoScore = calculateGoNoGoScore();
  const hasBlockers = goNoGoChecks.some(check => check.blocker && check.status !== 'pass');

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Rocket className="w-8 h-8 text-info" />
            Launch Day Command Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Ezyify Launch - 25 February 2026
          </p>
        </div>
        
        <div className="flex gap-3">
          {launchStatus === 'pre-launch' && (
            <Button 
              size="lg" 
              onClick={handleLaunch}
              disabled={hasBlockers}
              className="text-white shadow-brand" style={{ background: 'var(--brand-gradient)' }}
            >
              <Rocket className="w-5 h-5 mr-2" />
              INITIATE LAUNCH
            </Button>
          )}
          
          {launchStatus === 'launching' && (
            <Button size="lg" disabled>
              <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
              Launching...
            </Button>
          )}
          
          {launchStatus === 'live' && (
            <>
              <Badge className="text-lg px-4 py-2 bg-success">
                <Activity className="w-5 h-5 mr-2" />
                🚀 LIVE
              </Badge>
              <Button variant="destructive" size="lg" onClick={handleRollback}>
                <StopCircle className="w-5 h-5 mr-2" />
                Emergency Rollback
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Countdown Timer */}
      <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-info/20">
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-8">
            {countdown > 0 ? (
              <>
                <div className="text-center">
                  <div className="text-4xl font-bold">{time.days}</div>
                  <div className="text-sm text-muted-foreground">Days</div>
                </div>
                <div className="text-4xl">:</div>
                <div className="text-center">
                  <div className="text-4xl font-bold">{time.hours}</div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="text-4xl">:</div>
                <div className="text-center">
                  <div className="text-4xl font-bold">{time.minutes}</div>
                  <div className="text-sm text-muted-foreground">Minutes</div>
                </div>
                <div className="text-4xl">:</div>
                <div className="text-center">
                  <div className="text-4xl font-bold">{time.seconds}</div>
                  <div className="text-sm text-muted-foreground">Seconds</div>
                </div>
              </>
            ) : (
              <div className="text-3xl font-bold text-success">
                🚀 Launch Time!
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Checklist Progress</p>
                <p className="text-3xl font-bold mt-1">{progress}%</p>
              </div>
              <CheckCircle2 className="w-10 h-10 text-success" />
            </div>
            <Progress value={progress} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Go/No-Go Score</p>
                <p className="text-3xl font-bold mt-1">{goNoGoScore}%</p>
              </div>
              <Flag className="w-10 h-10 text-info" />
            </div>
            <Progress value={goNoGoScore} className="mt-4" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Team Status</p>
                <p className="text-3xl font-bold mt-1">{team.filter(m => m.status === 'online').length}/{team.length}</p>
              </div>
              <Users className="w-10 h-10 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">All leads online</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">System Health</p>
                <p className="text-3xl font-bold mt-1 text-success">100%</p>
              </div>
              <Activity className="w-10 h-10 text-success" />
            </div>
            <p className="text-sm text-muted-foreground mt-2">All systems operational</p>
          </CardContent>
        </Card>
      </div>

      {/* Crisis Banner */}
      {activeCrisis && (
        <Alert variant="destructive" className="animate-pulse border-2 shadow-lg">
          <AlertCircle className="h-6 w-6" />
          <div className="flex-1">
            <AlertTitle className="text-xl font-bold">🚨 ACTIVE CRISIS: {crisisScenarios.find(c => c.id === activeCrisis)?.name}</AlertTitle>
            <AlertDescription className="text-lg">
              Status: SEVERE IMPACT DETECTED. Protocols are being executed by the response team.
              <div className="mt-4 flex gap-4">
                <Button variant="outline" className="bg-card text-error border-error/30 hover:bg-error/5" onClick={handleResolveCrisis}>
                  Mark as Resolved
                </Button>
                <Button variant="secondary" onClick={() => setActiveTab('crisis')}>
                  View Protocol Details
                </Button>
              </div>
            </AlertDescription>
          </div>
        </Alert>
      )}

      {/* Blockers Alert */}
      {hasBlockers && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Launch Blockers Detected</AlertTitle>
          <AlertDescription>
            {goNoGoChecks.filter(c => c.blocker && c.status !== 'pass').length} critical issues must be resolved before launch
          </AlertDescription>
        </Alert>
      )}

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="checklist">Checklist</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="crisis">Crisis Response</TabsTrigger>
          <TabsTrigger value="go-no-go">Go/No-Go</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Launch Readiness Summary</CardTitle>
                <CardDescription>Overall status of launch preparation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Infrastructure</span>
                    <Badge className="bg-success">Ready</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Security</span>
                    <Badge className="bg-success">Ready</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Application</span>
                    <Badge className="bg-warning">In Progress</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Monitoring</span>
                    <Badge className="bg-success">Ready</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Team</span>
                    <Badge className="bg-success">Ready</Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Content</span>
                    <Badge className="bg-success">Ready</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest updates and actions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Performance baseline locked</p>
                      <p className="text-xs text-muted-foreground">2 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">All monitoring dashboards activated</p>
                      <p className="text-xs text-muted-foreground">5 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Activity className="w-5 h-5 text-info mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Payment gateway integration in progress</p>
                      <p className="text-xs text-muted-foreground">8 minutes ago</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">Security audit completed</p>
                      <p className="text-xs text-muted-foreground">15 minutes ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Checklist Tab */}
        <TabsContent value="checklist" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pre-Launch Checklist</CardTitle>
              <CardDescription>
                Complete all items before launch • {checklist.filter(i => i.status === 'complete').length}/{checklist.length} completed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(
                  checklist.reduce((acc, item) => {
                    if (!acc[item.category]) acc[item.category] = [];
                    acc[item.category].push(item);
                    return acc;
                  }, {} as Record<string, ChecklistItem[]>)
                ).map(([category, items]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="font-semibold text-sm mt-4">{category}</h3>
                    {items.map(item => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-3 border rounded-xl hover:bg-accent"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={item.status === 'complete'}
                            onChange={() => handleChecklistToggle(item.id)}
                            className="w-5 h-5"
                          />
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.item}</p>
                            <div className="flex items-center gap-3 mt-1">
                              <span className="text-xs text-muted-foreground">{item.assignee}</span>
                              <span className="text-xs text-muted-foreground">• {item.timeEstimate}</span>
                              <span className={`text-xs font-medium ${getPriorityColor(item.priority)}`}>
                                {item.priority.toUpperCase()}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(item.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Coordination</CardTitle>
              <CardDescription>Launch team members and their current status</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {team.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold" style={{ background: "var(--brand-gradient)" }}>
                          {member.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className={`absolute bottom-0 right-0 w-4 h-4 rounded-full border-2 border-white ${
                          member.status === 'online' ? 'bg-success' :
                          member.status === 'busy' ? 'bg-warning' :
                          'bg-muted-foreground'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold">{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                        {member.currentTask && (
                          <p className="text-xs text-info mt-1">{member.currentTask}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline">
                        <Phone className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="outline">
                        <MessageSquare className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Crisis Response Tab */}
        <TabsContent value="crisis" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Crisis Response Protocols</CardTitle>
              <CardDescription>Pre-defined scenarios and response procedures</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {crisisScenarios.map(scenario => (
                  <div key={scenario.id} className="border rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{scenario.name}</h3>
                          <Badge variant={
                            scenario.severity === 'critical' ? 'destructive' :
                            scenario.severity === 'high' ? 'default' :
                            'secondary'
                          }>
                            {scenario.severity}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          <strong>Trigger:</strong> {scenario.trigger}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        {activeCrisis === scenario.id ? (
                          <Button size="sm" variant="outline" onClick={handleResolveCrisis}>
                            <CheckCircle2 className="w-4 h-4 mr-2 text-success" />
                            Resolve Crisis
                          </Button>
                        ) : (
                          <Button 
                            size="sm" 
                            variant={scenario.severity === 'critical' ? 'destructive' : 'default'}
                            onClick={() => handleActivateCrisis(scenario.id)}
                            disabled={activeCrisis !== null}
                          >
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            ACTIVATE PROTOCOL
                          </Button>
                        )}
                        <Button size="sm" variant="ghost">
                          <FileText className="w-4 h-4 mr-2" />
                          View Full Protocol
                        </Button>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Response Protocol:</p>
                      <ol className="text-sm space-y-1">
                        {scenario.responseProtocol.map((step, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="font-semibold">{idx + 1}.</span>
                            <span>{step}</span>
                          </li>
                        ))}
                      </ol>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Resolution Time</p>
                        <p className="font-medium">{scenario.estimatedResolutionTime}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Teams Required</p>
                        <p className="font-medium">{scenario.teamRequired.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Escalation</p>
                        <p className="font-medium text-xs">{scenario.escalationPath[0]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Go/No-Go Tab */}
        <TabsContent value="go-no-go" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Go/No-Go Decision Framework</CardTitle>
              <CardDescription>
                Critical checks that must pass before launch • {goNoGoChecks.filter(c => c.status === 'pass').length}/{goNoGoChecks.length} passed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {Object.entries(
                  goNoGoChecks.reduce((acc, check) => {
                    if (!acc[check.category]) acc[check.category] = [];
                    acc[check.category].push(check);
                    return acc;
                  }, {} as Record<string, GoNoGoCheck[]>)
                ).map(([category, checks]) => (
                  <div key={category} className="space-y-2">
                    <h3 className="font-semibold text-sm mt-4">{category}</h3>
                    {checks.map(check => (
                      <div
                        key={check.id}
                        className={`flex items-center justify-between p-3 border rounded-xl ${
                          check.blocker && check.status !== 'pass' ? 'border-error/50 bg-error/5' : ''
                        }`}
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium">{check.check}</p>
                            {check.blocker && (
                              <Badge variant="destructive" className="text-xs">Blocker</Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{check.details}</p>
                          {check.lastChecked && (
                            <p className="text-xs text-muted-foreground mt-1">Last checked: {check.lastChecked}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          {getStatusBadge(check.status)}
                          <Button size="sm" variant="outline" onClick={() => handleRunCheck(check.id)}>
                            <RefreshCw className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
