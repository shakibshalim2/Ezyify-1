import { useState, useEffect } from 'react';
import { Rocket, Calendar, CheckCircle, Clock, Users, DollarSign, TrendingUp, AlertCircle, Zap, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';

// Skeleton Component
function LaunchDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="h-8 w-64" />
          </div>
          <Skeleton className="h-6 w-96" />
        </div>

        {/* Countdown Card Skeleton */}
        <Card className="mb-8">
          <CardContent className="p-8">
            <div className="text-center space-y-4">
              <Skeleton className="h-8 w-64 mx-auto" />
              <Skeleton className="h-20 w-32 mx-auto" />
              <Skeleton className="h-6 w-48 mx-auto" />
              <div className="flex justify-center gap-8">
                <Skeleton className="h-12 w-32" />
                <Skeleton className="h-12 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Cards Skeleton */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {[1, 2].map((i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-48 mb-2" />
                <Skeleton className="h-4 w-32" />
              </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-4 w-full" />
                <div className="grid grid-cols-3 gap-2">
                  {[1, 2, 3].map((j) => (
                    <Skeleton key={j} className="h-20 rounded" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Milestones Skeleton */}
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-20 rounded-xl" />
            ))}
          </CardContent>
        </Card>

        {/* Risk Assessment Skeleton */}
        <Card className="mb-8">
          <CardHeader>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </CardContent>
        </Card>

        {/* Business Metrics Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-64 mb-2" />
            <Skeleton className="h-4 w-96" />
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32 rounded-xl" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LaunchDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);
  // ... existing code ...

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const [currentDate] = useState(new Date('2026-01-21'));

  // Show skeleton while loading
  if (isLoading) {
    return <LaunchDashboardSkeleton />;
  }

  const launchDate = new Date('2026-02-25');
  const daysUntilLaunch = Math.ceil((launchDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24));

  // Launch milestones
  const milestones = [
    {
      id: 1,
      name: 'Frontend Development',
      status: 'complete',
      dueDate: '2026-01-21',
      progress: 100,
      owner: 'Frontend Team',
      critical: true
    },
    {
      id: 2,
      name: 'Backend API Development',
      status: 'in-progress',
      dueDate: '2026-02-04',
      progress: 0,
      owner: 'Backend Team',
      critical: true
    },
    {
      id: 3,
      name: 'Payment Gateway Integration',
      status: 'pending',
      dueDate: '2026-02-11',
      progress: 0,
      owner: 'DevOps Team',
      critical: true
    },
    {
      id: 4,
      name: 'Integration Testing',
      status: 'pending',
      dueDate: '2026-02-11',
      progress: 0,
      owner: 'QA Team',
      critical: true
    },
    {
      id: 5,
      name: 'User Acceptance Testing',
      status: 'pending',
      dueDate: '2026-02-18',
      progress: 0,
      owner: 'Product Team',
      critical: true
    },
    {
      id: 6,
      name: 'Staging Deployment',
      status: 'pending',
      dueDate: '2026-02-18',
      progress: 0,
      owner: 'DevOps Team',
      critical: true
    },
    {
      id: 7,
      name: 'Marketing Campaign Prep',
      status: 'in-progress',
      dueDate: '2026-02-20',
      progress: 30,
      owner: 'Marketing Team',
      critical: false
    },
    {
      id: 8,
      name: 'Documentation Finalization',
      status: 'complete',
      dueDate: '2026-01-21',
      progress: 100,
      owner: 'Dev Team',
      critical: false
    },
    {
      id: 9,
      name: 'Production Deployment',
      status: 'pending',
      dueDate: '2026-02-25',
      progress: 0,
      owner: 'DevOps Team',
      critical: true
    },
    {
      id: 10,
      name: 'Launch Announcement',
      status: 'pending',
      dueDate: '2026-02-25',
      progress: 0,
      owner: 'Marketing Team',
      critical: true
    },
  ];

  // Calculate overall progress
  const totalMilestones = milestones.length;
  const completedMilestones = milestones.filter(m => m.status === 'complete').length;
  const overallProgress = Math.round((completedMilestones / totalMilestones) * 100);

  // Risk assessment
  const risks = [
    {
      name: 'Backend Development Delay',
      level: 'medium',
      probability: '30%',
      impact: '1-2 weeks delay',
      mitigation: 'Weekly check-ins, pair programming'
    },
    {
      name: 'Payment Gateway Issues',
      level: 'medium',
      probability: '20%',
      impact: '1 week delay',
      mitigation: 'Stripe recommended, backup PayPal'
    },
    {
      name: 'User Adoption Resistance',
      level: 'low',
      probability: '15%',
      impact: 'Slower growth',
      mitigation: 'Payment Guide, influencer marketing'
    },
  ];

  // Launch readiness checklist
  const readinessChecks = [
    { category: 'Frontend', complete: 6, total: 6 },
    { category: 'Backend APIs', complete: 0, total: 5 },
    { category: 'Database', complete: 0, total: 6 },
    { category: 'Payment Gateway', complete: 0, total: 5 },
    { category: 'Security', complete: 0, total: 5 },
    { category: 'Testing', complete: 0, total: 5 },
    { category: 'Documentation', complete: 4, total: 4 },
  ];

  const totalChecks = readinessChecks.reduce((acc, cat) => acc + cat.total, 0);
  const completedChecks = readinessChecks.reduce((acc, cat) => acc + cat.complete, 0);
  const readinessProgress = Math.round((completedChecks / totalChecks) * 100);

  // Expected business metrics
  const expectedMetrics = [
    { name: 'Target Users (Month 1)', value: '10,000', icon: <Users className="w-5 h-5" /> },
    { name: 'Gross Merchandise Value', value: '$500K', icon: <DollarSign className="w-5 h-5" /> },
    { name: 'Revenue (Commission)', value: '$50K', icon: <TrendingUp className="w-5 h-5" /> },
    { name: 'Target Trust Score', value: '4.2/5', icon: <Target className="w-5 h-5" /> },
  ];

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      complete: 'bg-success/10 text-success',
      'in-progress': 'bg-info/10 text-info',
      pending: 'bg-border text-foreground',
    };
    return variants[status] || variants.pending;
  };

  const getRiskBadge = (level: string) => {
    const variants: Record<string, string> = {
      high: 'bg-error/10 text-error',
      medium: 'bg-warning/10 text-warning',
      low: 'bg-success/10 text-success',
    };
    return variants[level] || variants.medium;
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Rocket className="w-8 h-8 text-success" />
            <h1 className="text-foreground">Launch Dashboard</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Track progress toward Ezyify Payment System production launch
          </p>
        </div>

        {/* Countdown Card */}
        <Card className="mb-8 border-2 border-success/30 bg-gradient-to-r from-green-500/10 to-blue-500/10">
          <CardContent className="p-8">
            <div className="text-center">
              <div className="flex items-center justify-center gap-2 mb-4">
                <Calendar className="w-8 h-8 text-success" />
                <h2 className="text-2xl font-bold text-foreground">Countdown to Launch</h2>
              </div>
              <div className="mb-4">
                <p className="text-6xl font-bold text-success mb-2">{daysUntilLaunch}</p>
                <p className="text-xl text-muted-foreground">days remaining</p>
              </div>
              <div className="flex items-center justify-center gap-8 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium">Target Date</p>
                  <p className="text-foreground font-bold">February 25, 2026</p>
                </div>
                <div>
                  <p className="font-medium">Status</p>
                  <Badge className="bg-info/10 text-info">
                    On Track
                  </Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Progress Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {/* Overall Progress */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-6 h-6 text-primary" />
                Milestones Progress
              </CardTitle>
              <CardDescription>
                {completedMilestones} of {totalMilestones} milestones complete
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Overall</span>
                    <span className="text-2xl font-bold text-primary">{overallProgress}%</span>
                  </div>
                  <Progress value={overallProgress} className="h-4" />
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-success/5 rounded">
                    <p className="text-2xl font-bold text-success">{completedMilestones}</p>
                    <p className="text-xs text-muted-foreground">Complete</p>
                  </div>
                  <div className="p-2 bg-info/5 rounded">
                    <p className="text-2xl font-bold text-info">
                      {milestones.filter(m => m.status === 'in-progress').length}
                    </p>
                    <p className="text-xs text-muted-foreground">In Progress</p>
                  </div>
                  <div className="p-2 bg-background/20 rounded">
                    <p className="text-2xl font-bold text-muted-foreground">
                      {milestones.filter(m => m.status === 'pending').length}
                    </p>
                    <p className="text-xs text-muted-foreground">Pending</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Readiness Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-6 h-6 text-warning" />
                System Readiness
              </CardTitle>
              <CardDescription>
                {completedChecks} of {totalChecks} checks passed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-foreground">Readiness Score</span>
                    <span className="text-2xl font-bold text-warning">{readinessProgress}%</span>
                  </div>
                  <Progress value={readinessProgress} className="h-4" />
                </div>
                <div className="space-y-2">
                  {readinessChecks.map((check, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{check.category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-foreground font-medium">
                          {check.complete}/{check.total}
                        </span>
                        <div className="w-16">
                          <Progress 
                            value={Math.round((check.complete / check.total) * 100)} 
                            className="h-2" 
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Milestones Timeline */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Launch Milestones</CardTitle>
            <CardDescription>
              Track key deliverables and deadlines
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {milestones.map((milestone) => (
                <div
                  key={milestone.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-border hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-center gap-4 flex-1">
                    <div className="flex-shrink-0">
                      {milestone.status === 'complete' ? (
                        <CheckCircle className="w-6 h-6 text-success" />
                      ) : milestone.status === 'in-progress' ? (
                        <Clock className="w-6 h-6 text-info animate-pulse" />
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-border" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-medium text-foreground">{milestone.name}</p>
                        {milestone.critical && (
                          <Badge className="bg-error/10 text-error text-xs">
                            Critical
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>Due: {milestone.dueDate}</span>
                        <span>•</span>
                        <span>Owner: {milestone.owner}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <Progress value={milestone.progress} className="h-2" />
                      </div>
                      <span className="text-sm font-medium text-foreground w-12 text-right">
                        {milestone.progress}%
                      </span>
                      <Badge className={getStatusBadge(milestone.status)}>
                        {milestone.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Risk Assessment */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-6 h-6 text-warning" />
              Risk Assessment
            </CardTitle>
            <CardDescription>
              Identified risks and mitigation strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {risks.map((risk, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl border border-border"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <p className="font-medium text-foreground mb-1">{risk.name}</p>
                      <div className="grid md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Probability:</span> {risk.probability}
                        </div>
                        <div>
                          <span className="font-medium">Impact:</span> {risk.impact}
                        </div>
                      </div>
                    </div>
                    <Badge className={getRiskBadge(risk.level)}>
                      {risk.level}
                    </Badge>
                  </div>
                  <div className="mt-2 p-2 bg-accent rounded text-sm">
                    <span className="font-medium text-foreground">Mitigation:</span>{' '}
                    <span className="text-muted-foreground">{risk.mitigation}</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Expected Business Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-success" />
              Expected Business Metrics (Month 1)
            </CardTitle>
            <CardDescription>
              Projected performance indicators after launch
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              {expectedMetrics.map((metric, index) => (
                <div
                  key={index}
                  className="p-6 bg-muted rounded-2xl border border-border text-center"
                >
                  <div className="flex justify-center mb-2 text-success">
                    {metric.icon}
                  </div>
                  <p className="text-3xl font-bold text-foreground mb-1">{metric.value}</p>
                  <p className="text-sm text-muted-foreground">{metric.name}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <Alert className="mt-8 border-success/30 bg-success/5">
          <Rocket className="w-5 h-5 text-success" />
          <AlertDescription className="text-foreground">
            <strong>Next Steps:</strong> Backend team to begin API development this week. Weekly progress reviews scheduled every Friday. Marketing campaign preparation to start Week 3.
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}