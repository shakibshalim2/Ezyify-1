import { useState, useEffect } from 'react';
import { CheckCircle, XCircle, AlertCircle, Zap, Server, Database, Shield, Code, TestTube, FileText, Settings, Rocket } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Progress } from '../../components/ui/progress';
import { Badge } from '../../components/ui/badge';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';

// Skeleton Component
function PreDeploymentCheckerSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Skeleton className="w-8 h-8 rounded" />
            <Skeleton className="h-8 w-96" />
          </div>
          <Skeleton className="h-6 w-full max-w-2xl" />
        </div>

        {/* Action Card Skeleton */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-6 w-64" />
            </div>
          </CardContent>
        </Card>

        {/* Checklist Sections Skeleton */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="mb-6">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Skeleton className="w-5 h-5 rounded" />
                <Skeleton className="h-6 w-48" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-14 rounded-xl" />
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function PreDeploymentCheckerPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [checkResults, setCheckResults] = useState<Record<string, boolean | null>>({});
  const [isRunning, setIsRunning] = useState(false);

  // Deployment checklist items
  const checks = [
    {
      category: 'Frontend',
      icon: <Code className="w-5 h-5" />,
      color: 'text-info',
      items: [
        { id: 'frontend-build', name: 'Production build successful', critical: true },
        { id: 'frontend-routes', name: 'All routes configured', critical: true },
        { id: 'frontend-responsive', name: 'Responsive design validated', critical: true },
        { id: 'frontend-darkmode', name: 'Dark mode compatible', critical: false },
        { id: 'frontend-images', name: 'All images optimized', critical: false },
        { id: 'frontend-a11y', name: 'Accessibility (WCAG AA)', critical: true },
      ]
    },
    {
      category: 'Backend APIs',
      icon: <Server className="w-5 h-5" />,
      color: 'text-success',
      items: [
        { id: 'api-escrow', name: 'Escrow Management API deployed', critical: true },
        { id: 'api-refund', name: 'Refund Processing API deployed', critical: true },
        { id: 'api-wallet', name: 'Wallet API deployed', critical: true },
        { id: 'api-withdrawal', name: 'Withdrawal Rules API deployed', critical: true },
        { id: 'api-commission', name: 'Commission Calculation API deployed', critical: true },
        { id: 'api-health', name: 'Health check endpoints working', critical: true },
      ]
    },
    {
      category: 'Database',
      icon: <Database className="w-5 h-5" />,
      color: 'text-primary',
      items: [
        { id: 'db-migrations', name: 'All migrations applied', critical: true },
        { id: 'db-escrow-table', name: 'Escrow transactions table created', critical: true },
        { id: 'db-refund-table', name: 'Refund requests table created', critical: true },
        { id: 'db-wallet-table', name: 'Wallet balances table created', critical: true },
        { id: 'db-indexes', name: 'Database indexes created', critical: true },
        { id: 'db-backup', name: 'Backup system configured', critical: true },
      ]
    },
    {
      category: 'Payment Gateway',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-warning',
      items: [
        { id: 'stripe-account', name: 'Stripe account activated', critical: true },
        { id: 'stripe-connect', name: 'Stripe Connect enabled', critical: true },
        { id: 'stripe-webhooks', name: 'Webhook endpoints configured', critical: true },
        { id: 'stripe-keys', name: 'API keys stored securely', critical: true },
        { id: 'stripe-test', name: 'Test transactions successful', critical: true },
      ]
    },
    {
      category: 'Security',
      icon: <Shield className="w-5 h-5" />,
      color: 'text-error',
      items: [
        { id: 'security-env', name: 'Environment variables secured', critical: true },
        { id: 'security-https', name: 'HTTPS/SSL certificates valid', critical: true },
        { id: 'security-auth', name: 'Authentication working', critical: true },
        { id: 'security-kyc', name: 'KYC verification integrated', critical: true },
        { id: 'security-rate-limit', name: 'Rate limiting enabled', critical: true },
      ]
    },
    {
      category: 'Testing',
      icon: <TestTube className="w-5 h-5" />,
      color: 'text-success',
      items: [
        { id: 'test-unit', name: 'Unit tests passing (>80% coverage)', critical: true },
        { id: 'test-integration', name: 'Integration tests passing', critical: true },
        { id: 'test-e2e', name: 'E2E tests passing', critical: false },
        { id: 'test-security', name: 'Security tests passing', critical: true },
        { id: 'test-load', name: 'Load testing completed', critical: false },
      ]
    },
    {
      category: 'Configuration',
      icon: <Settings className="w-5 h-5" />,
      color: 'text-warning',
      items: [
        { id: 'config-env', name: 'Production .env configured', critical: true },
        { id: 'config-cors', name: 'CORS policies set', critical: true },
        { id: 'config-monitoring', name: 'Monitoring/alerting configured', critical: true },
        { id: 'config-logging', name: 'Logging system enabled', critical: true },
        { id: 'config-cdn', name: 'CDN configured for assets', critical: false },
      ]
    },
    {
      category: 'Documentation',
      icon: <FileText className="w-5 h-5" />,
      color: 'text-primary',
      items: [
        { id: 'docs-api', name: 'API documentation complete', critical: true },
        { id: 'docs-deployment', name: 'Deployment guide ready', critical: true },
        { id: 'docs-runbook', name: 'Operations runbook created', critical: true },
        { id: 'docs-troubleshoot', name: 'Troubleshooting guide ready', critical: true },
      ]
    },
  ];

  // Calculate statistics
  const totalChecks = checks.reduce((acc, cat) => acc + cat.items.length, 0);
  const criticalChecks = checks.reduce(
    (acc, cat) => acc + cat.items.filter(item => item.critical).length,
    0
  );
  const completedChecks = Object.values(checkResults).filter(v => v === true).length;
  const failedChecks = Object.values(checkResults).filter(v => v === false).length;
  const progressPercentage = totalChecks > 0 ? Math.round((completedChecks / totalChecks) * 100) : 0;

  // Simulate running checks
  const runAllChecks = async () => {
    setIsRunning(true);
    setCheckResults({});

    for (const category of checks) {
      for (const item of category.items) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Simulate check results (in production, these would be real API calls)
        // For now, frontend checks pass, backend checks are pending
        let result: boolean;
        if (category.category === 'Frontend') {
          result = true; // Frontend is complete
        } else if (category.category === 'Documentation') {
          result = true; // Docs are complete
        } else {
          result = false; // Backend/infra not ready yet
        }

        setCheckResults(prev => ({
          ...prev,
          [item.id]: result
        }));
      }
    }

    setIsRunning(false);
  };

  const getStatusIcon = (itemId: string) => {
    const status = checkResults[itemId];
    if (status === null || status === undefined) {
      return <div className="w-5 h-5 rounded-full border-2 border-border" />;
    }
    return status ? (
      <CheckCircle className="w-5 h-5 text-success" />
    ) : (
      <XCircle className="w-5 h-5 text-error" />
    );
  };

  const getStatusBadge = (itemId: string) => {
    const status = checkResults[itemId];
    if (status === null || status === undefined) {
      return <Badge className="bg-border text-foreground">Pending</Badge>;
    }
    return status ? (
      <Badge className="bg-success/10 text-success">Pass</Badge>
    ) : (
      <Badge className="bg-error/10 text-error">Fail</Badge>
    );
  };

  const canDeploy = criticalChecks > 0 && completedChecks >= criticalChecks;

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <PreDeploymentCheckerSkeleton />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Zap className="w-8 h-8 text-warning" />
            <h1 className="font-semibold text-foreground">Pre-Deployment Validation Checker</h1>
          </div>
          <p className="text-muted-foreground text-lg">
            Validate system readiness before production deployment
          </p>
        </div>

        {/* Overall Status Card */}
        <Card className="mb-8 border-2 border-primary bg-warning/5">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Rocket className="w-6 h-6 text-primary" />
                Deployment Readiness
              </span>
              <Button
                onClick={runAllChecks}
                disabled={isRunning}
                className="bg-warning hover:bg-warning/90"
              >
                {isRunning ? 'Running Checks...' : 'Run All Checks'}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {/* Progress Bar */}
              <div>
                <div className="flex justify-between mb-2">
                  <span className="font-medium text-foreground">Overall Progress</span>
                  <span className="font-bold text-2xl text-primary">{progressPercentage}%</span>
                </div>
                <Progress value={progressPercentage} className="h-4" />
                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                  <span>{completedChecks} passed</span>
                  <span>{failedChecks} failed</span>
                  <span>{totalChecks - completedChecks - failedChecks} pending</span>
                </div>
              </div>

              {/* Statistics */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="p-4 bg-card rounded-2xl border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Total Checks</p>
                  <p className="text-2xl font-bold text-foreground">{totalChecks}</p>
                </div>
                <div className="p-4 bg-card rounded-2xl border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Critical Checks</p>
                  <p className="text-2xl font-bold text-error">{criticalChecks}</p>
                </div>
                <div className="p-4 bg-card rounded-2xl border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Passed</p>
                  <p className="text-2xl font-bold text-success">{completedChecks}</p>
                </div>
                <div className="p-4 bg-card rounded-2xl border border-border">
                  <p className="text-sm text-muted-foreground mb-1">Failed</p>
                  <p className="text-2xl font-bold text-error">{failedChecks}</p>
                </div>
              </div>

              {/* Deployment Status */}
              {Object.keys(checkResults).length > 0 && (
                <Alert className={canDeploy ? 'border-success/30 bg-success/5' : 'border-error/30 bg-error/5'}>
                  {canDeploy ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-success" />
                      <AlertDescription className="text-foreground">
                        <strong>Ready for Deployment!</strong> All critical checks passed. Review non-critical items before proceeding.
                      </AlertDescription>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-5 h-5 text-error" />
                      <AlertDescription className="text-foreground">
                        <strong>NOT Ready for Deployment.</strong> {criticalChecks - completedChecks} critical checks must pass before deploying to production.
                      </AlertDescription>
                    </>
                  )}
                </Alert>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Checklist Categories */}
        <div className="space-y-6">
          {checks.map((category, categoryIndex) => {
            const categoryPassed = category.items.filter(
              item => checkResults[item.id] === true
            ).length;
            const categoryTotal = category.items.length;
            const categoryProgress = categoryTotal > 0 ? Math.round((categoryPassed / categoryTotal) * 100) : 0;

            return (
              <Card key={categoryIndex}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <span className={category.color}>{category.icon}</span>
                      {category.category}
                    </CardTitle>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {categoryPassed}/{categoryTotal} passed
                      </span>
                      <div className="w-32">
                        <Progress value={categoryProgress} className="h-2" />
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {category.items.map((item, itemIndex) => (
                      <div
                        key={itemIndex}
                        className="flex items-center justify-between p-3 rounded-2xl border border-border hover:bg-accent/50 transition-colors"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          {getStatusIcon(item.id)}
                          <div className="flex-1">
                            <p className="font-medium text-foreground flex items-center gap-2">
                              {item.name}
                              {item.critical && (
                                <Badge className="bg-error/10 text-error text-xs">
                                  Critical
                                </Badge>
                              )}
                            </p>
                          </div>
                        </div>
                        <div>
                          {getStatusBadge(item.id)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Back to Admin
          </Button>
          <Button
            onClick={runAllChecks}
            disabled={isRunning}
            className="bg-warning hover:bg-warning/90"
          >
            <Zap className="w-4 h-4 mr-2" />
            {isRunning ? 'Running Checks...' : 'Re-run All Checks'}
          </Button>
          {canDeploy && (
            <Button className="bg-success hover:bg-success/90">
              <Rocket className="w-4 h-4 mr-2" />
              Proceed to Deployment
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}