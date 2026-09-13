import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { 
  CheckCircle2, Circle, AlertCircle, XCircle, Rocket, Clock, 
  Shield, Database, Zap, Users, DollarSign, FileText, Settings,
  TrendingUp, Package, Code, Server, Globe, Lock, Bell, Activity,
  ArrowRight, Play, Pause, RefreshCw, Download, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

type SystemStatus = 'ready' | 'warning' | 'error' | 'pending';

interface SystemCheck {
  id: string;
  name: string;
  status: SystemStatus;
  progress: number;
  description: string;
  lastChecked: string;
  category: string;
}

export default function LaunchControlCenter() {
  const [isLive, setIsLive] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  const launchDate = new Date('2026-02-25T00:00:00');
  const today = new Date();
  const daysRemaining = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const hoursRemaining = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60));
  const totalProgress = Math.max(0, Math.min(100, ((365 - daysRemaining) / 365) * 100));

  // System checks
  const systemChecks: SystemCheck[] = [
    // Frontend Systems
    {
      id: 'frontend-pages',
      name: 'Frontend Pages',
      status: 'ready',
      progress: 100,
      description: '86 pages fully functional',
      lastChecked: '2 min ago',
      category: 'frontend'
    },
    {
      id: 'frontend-components',
      name: 'UI Components',
      status: 'ready',
      progress: 100,
      description: 'All components tested and responsive',
      lastChecked: '5 min ago',
      category: 'frontend'
    },
    {
      id: 'frontend-routing',
      name: 'Routing System',
      status: 'ready',
      progress: 100,
      description: 'All routes configured and working',
      lastChecked: '3 min ago',
      category: 'frontend'
    },
    {
      id: 'frontend-theme',
      name: 'Theme System',
      status: 'ready',
      progress: 100,
      description: 'Dark/Light modes fully implemented',
      lastChecked: '8 min ago',
      category: 'frontend'
    },

    // Payment Systems
    {
      id: 'payment-escrow',
      name: 'Escrow System',
      status: 'ready',
      progress: 100,
      description: 'All escrow flows audited and verified',
      lastChecked: '1 min ago',
      category: 'payment'
    },
    {
      id: 'payment-wallet',
      name: 'Wallet Management',
      status: 'ready',
      progress: 100,
      description: 'Balance separation implemented',
      lastChecked: '4 min ago',
      category: 'payment'
    },
    {
      id: 'payment-refund',
      name: 'Refund System',
      status: 'ready',
      progress: 100,
      description: 'Full refund flow validated',
      lastChecked: '6 min ago',
      category: 'payment'
    },
    {
      id: 'payment-commission',
      name: 'Commission Engine',
      status: 'ready',
      progress: 100,
      description: 'Hidden from buyers, transparent to sellers',
      lastChecked: '3 min ago',
      category: 'payment'
    },

    // Backend Integration
    {
      id: 'backend-api-specs',
      name: 'API Specifications',
      status: 'ready',
      progress: 100,
      description: '22 endpoints fully documented',
      lastChecked: '10 min ago',
      category: 'backend'
    },
    {
      id: 'backend-integration',
      name: 'Backend Integration',
      status: 'warning',
      progress: 75,
      description: 'Ready for connection - awaiting backend team',
      lastChecked: '15 min ago',
      category: 'backend'
    },
    {
      id: 'backend-database',
      name: 'Database Schema',
      status: 'warning',
      progress: 80,
      description: 'Schema designed - pending final review',
      lastChecked: '20 min ago',
      category: 'backend'
    },

    // Security & Compliance
    {
      id: 'security-kyc',
      name: 'KYC Verification',
      status: 'ready',
      progress: 100,
      description: 'KYC flow implemented for sellers',
      lastChecked: '5 min ago',
      category: 'security'
    },
    {
      id: 'security-auth',
      name: 'Authentication',
      status: 'ready',
      progress: 100,
      description: 'Login, signup, OTP flows complete',
      lastChecked: '7 min ago',
      category: 'security'
    },
    {
      id: 'security-privacy',
      name: 'Privacy Compliance',
      status: 'ready',
      progress: 100,
      description: 'Privacy policy and consent flows ready',
      lastChecked: '12 min ago',
      category: 'security'
    },

    // Documentation
    {
      id: 'docs-technical',
      name: 'Technical Docs',
      status: 'ready',
      progress: 100,
      description: '22 comprehensive documents created',
      lastChecked: '30 min ago',
      category: 'documentation'
    },
    {
      id: 'docs-api',
      name: 'API Documentation',
      status: 'ready',
      progress: 100,
      description: 'Complete API specs and examples',
      lastChecked: '25 min ago',
      category: 'documentation'
    },

    // Testing & QA
    {
      id: 'qa-manual',
      name: 'Manual Testing',
      status: 'warning',
      progress: 60,
      description: 'User flows tested - edge cases pending',
      lastChecked: '1 hour ago',
      category: 'qa'
    },
    {
      id: 'qa-integration',
      name: 'Integration Tests',
      status: 'pending',
      progress: 40,
      description: 'Awaiting backend integration',
      lastChecked: '2 hours ago',
      category: 'qa'
    },
    {
      id: 'qa-performance',
      name: 'Performance Testing',
      status: 'warning',
      progress: 70,
      description: 'Load testing scheduled',
      lastChecked: '1 hour ago',
      category: 'qa'
    },

    // Infrastructure
    {
      id: 'infra-hosting',
      name: 'Hosting Setup',
      status: 'pending',
      progress: 30,
      description: 'Production environment configuration pending',
      lastChecked: '3 hours ago',
      category: 'infrastructure'
    },
    {
      id: 'infra-cdn',
      name: 'CDN Configuration',
      status: 'pending',
      progress: 20,
      description: 'CDN setup for global distribution',
      lastChecked: '4 hours ago',
      category: 'infrastructure'
    },
    {
      id: 'infra-monitoring',
      name: 'Monitoring Tools',
      status: 'warning',
      progress: 50,
      description: 'Error tracking and analytics setup',
      lastChecked: '2 hours ago',
      category: 'infrastructure'
    }
  ];

  const categorizeChecks = (category: string) => 
    systemChecks.filter(check => check.category === category);

  const getStatusIcon = (status: SystemStatus) => {
    switch (status) {
      case 'ready':
        return <CheckCircle2 className="h-5 w-5 text-success" />;
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-warning" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-error" />;
      case 'pending':
        return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: SystemStatus) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-success">Ready</Badge>;
      case 'warning':
        return <Badge variant="default" className="bg-warning">Warning</Badge>;
      case 'error':
        return <Badge variant="destructive">Error</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const overallStats = {
    ready: systemChecks.filter(c => c.status === 'ready').length,
    warning: systemChecks.filter(c => c.status === 'warning').length,
    error: systemChecks.filter(c => c.status === 'error').length,
    pending: systemChecks.filter(c => c.status === 'pending').length,
    total: systemChecks.length,
    readyPercent: Math.round((systemChecks.filter(c => c.status === 'ready').length / systemChecks.length) * 100)
  };

  const isGoForLaunch = overallStats.ready >= 18 && overallStats.error === 0;

  useEffect(() => {
    if (autoRefresh) {
      const interval = setInterval(() => {
        setLastUpdate(new Date());
      }, 30000); // Update every 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto px-4 pb-8 max-w-7xl">

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold mb-2 text-brand-gradient">
                🚀 Launch Control Center
              </h1>
              <p className="text-muted-foreground text-lg">
                Ezyify Platform — Mission Control Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                variant={autoRefresh ? "default" : "outline"}
                size="sm"
                onClick={() => setAutoRefresh(!autoRefresh)}
              >
                {autoRefresh ? <Pause className="h-4 w-4 mr-2" /> : <Play className="h-4 w-4 mr-2" />}
                {autoRefresh ? 'Auto Refresh ON' : 'Auto Refresh OFF'}
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh Now
              </Button>
            </div>
          </div>

          {/* Countdown Banner */}
          <div className="relative overflow-hidden rounded-xl border border-info/30 bg-gradient-to-r from-primary/10 via-primary/5 to-card p-6 backdrop-blur">
            <div className="relative z-10">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-5xl font-bold text-info mb-2">{daysRemaining}</div>
                  <div className="text-sm text-muted-foreground">Days to Launch</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-primary mb-2">{hoursRemaining % 24}</div>
                  <div className="text-sm text-muted-foreground">Hours</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-pink-400 mb-2">{overallStats.readyPercent}%</div>
                  <div className="text-sm text-muted-foreground">Systems Ready</div>
                </div>
                <div className="text-center">
                  <div className="text-5xl font-bold text-success mb-2">{overallStats.ready}/{overallStats.total}</div>
                  <div className="text-sm text-muted-foreground">Checks Passed</div>
                </div>
              </div>
              <div className="mt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Launch Readiness</span>
                  <span className="text-sm font-bold text-white">{overallStats.readyPercent}%</span>
                </div>
                <Progress value={overallStats.readyPercent} className="h-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Go/No-Go Status */}
        <Alert className={`mb-6 ${isGoForLaunch ? 'border-success/50 bg-success/5' : 'border-warning/30 bg-warning/8'}`}>
          <Activity className="h-5 w-5" />
          <AlertTitle className="text-lg font-bold">
            {isGoForLaunch ? '✅ GO FOR LAUNCH' : '⚠️ NOT READY FOR LAUNCH'}
          </AlertTitle>
          <AlertDescription>
            {isGoForLaunch ? (
              <span>All critical systems are operational. Platform is ready for production deployment.</span>
            ) : (
              <span>
                {overallStats.error > 0 && `${overallStats.error} critical errors must be resolved. `}
                {overallStats.warning > 0 && `${overallStats.warning} warnings require attention. `}
                {overallStats.pending > 0 && `${overallStats.pending} systems are still pending.`}
              </span>
            )}
          </AlertDescription>
        </Alert>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="bg-success/5 border-success/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Ready</p>
                  <p className="text-3xl font-bold text-success">{overallStats.ready}</p>
                </div>
                <CheckCircle2 className="h-10 w-10 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-warning/5 border-warning/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Warnings</p>
                  <p className="text-3xl font-bold text-warning">{overallStats.warning}</p>
                </div>
                <AlertCircle className="h-10 w-10 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-error/5 border-error/30">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Errors</p>
                  <p className="text-3xl font-bold text-error">{overallStats.error}</p>
                </div>
                <XCircle className="h-10 w-10 text-error" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-3xl font-bold text-muted-foreground">{overallStats.pending}</p>
                </div>
                <Circle className="h-10 w-10 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* System Checks Tabs */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-7 bg-muted">
            <TabsTrigger value="all">All Systems</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="payment">Payment</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="security">Security</TabsTrigger>
            <TabsTrigger value="qa">QA</TabsTrigger>
            <TabsTrigger value="infrastructure">Infrastructure</TabsTrigger>
          </TabsList>

          {/* All Systems */}
          <TabsContent value="all" className="space-y-4">
            {systemChecks.map((check) => (
              <Card key={check.id} className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                      {getStatusIcon(check.status)}
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <h4 className="font-semibold text-white">{check.name}</h4>
                          {getStatusBadge(check.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">{check.description}</p>
                        <p className="text-xs text-muted-foreground">Last checked: {check.lastChecked}</p>
                      </div>
                    </div>
                    <div className="text-right ml-4">
                      <p className="text-2xl font-bold text-white">{check.progress}%</p>
                    </div>
                  </div>
                  <Progress value={check.progress} className="h-2" />
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Frontend Tab */}
          <TabsContent value="frontend" className="space-y-4">
            <Card className="bg-info/5 border-info/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-info">
                  <Code className="h-5 w-5" />
                  Frontend Systems Status
                </CardTitle>
                <CardDescription>All user-facing components and pages</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorizeChecks('frontend').map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-semibold text-white">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">{check.progress}%</span>
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payment Tab */}
          <TabsContent value="payment" className="space-y-4">
            <Card className="bg-success/5 border-success/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-success">
                  <DollarSign className="h-5 w-5" />
                  Payment Systems Status
                </CardTitle>
                <CardDescription>Escrow, wallet, refunds, and commission engine</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorizeChecks('payment').map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-semibold text-white">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">{check.progress}%</span>
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Backend Tab */}
          <TabsContent value="backend" className="space-y-4">
            <Card className="bg-primary/5 border-primary/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-primary">
                  <Server className="h-5 w-5" />
                  Backend Integration Status
                </CardTitle>
                <CardDescription>API specifications and backend readiness</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorizeChecks('backend').map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-semibold text-white">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">{check.progress}%</span>
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-4">
            <Card className="bg-error/5 border-error/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-error">
                  <Shield className="h-5 w-5" />
                  Security & Compliance Status
                </CardTitle>
                <CardDescription>Authentication, KYC, and privacy compliance</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorizeChecks('security').map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-semibold text-white">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">{check.progress}%</span>
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* QA Tab */}
          <TabsContent value="qa" className="space-y-4">
            <Card className="bg-warning/5 border-warning/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <Activity className="h-5 w-5" />
                  Quality Assurance Status
                </CardTitle>
                <CardDescription>Testing coverage and validation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorizeChecks('qa').map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-semibold text-white">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">{check.progress}%</span>
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Infrastructure Tab */}
          <TabsContent value="infrastructure" className="space-y-4">
            <Card className="bg-warning/5 border-warning/30">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-warning">
                  <Globe className="h-5 w-5" />
                  Infrastructure Status
                </CardTitle>
                <CardDescription>Hosting, CDN, and monitoring setup</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {categorizeChecks('infrastructure').map((check) => (
                  <div key={check.id} className="flex items-center justify-between p-3 border border-border rounded-xl">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(check.status)}
                      <div>
                        <p className="font-semibold text-white">{check.name}</p>
                        <p className="text-sm text-muted-foreground">{check.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-white">{check.progress}%</span>
                      {getStatusBadge(check.status)}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Critical Actions */}
        <Card className="mt-8 bg-info/5 border-info/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-info">
              <Rocket className="h-5 w-5" />
              Critical Actions Before Launch
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success" />
                  <span className="text-white">Complete backend API integration</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <span className="text-white">Run full integration test suite</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Circle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-white">Configure production hosting</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Circle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-white">Set up CDN and SSL certificates</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <Circle className="h-5 w-5 text-muted-foreground" />
                  <span className="text-white">Enable monitoring and error tracking</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-xl hover:bg-muted transition-colors">
                <div className="flex items-center gap-3">
                  <AlertCircle className="h-5 w-5 text-warning" />
                  <span className="text-white">Conduct load testing</span>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer Actions */}
        <div className="mt-8 flex flex-wrap gap-4 justify-center">
          <Link to="/platform-overview">
            <Button size="lg" variant="outline" className="gap-2">
              <ArrowRight className="h-5 w-5" />
              Platform Overview
            </Button>
          </Link>
          <Link to="/admin/pre-deployment-checker">
            <Button size="lg" variant="outline" className="gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Pre-Deployment Checker
            </Button>
          </Link>
          <Link to="/admin/payment-system-status">
            <Button size="lg" variant="outline" className="gap-2">
              <Shield className="h-5 w-5" />
              Payment System Status
            </Button>
          </Link>
          <Button size="lg" className="gap-2 text-white shadow-brand" style={{ background: 'var(--brand-gradient)' }}>
            <Download className="h-5 w-5" />
            Export Launch Report
          </Button>
        </div>
      </div>
    </div>
  );
}
