import { Construction, Shield, Rocket, Zap, Code } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';
import { useState, useEffect } from 'react';
import LaunchReadinessIndicator from '../../components/LaunchReadinessIndicator';

function AdminDashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-12">
          <Skeleton className="w-16 h-16 mx-auto mb-4" />
          <Skeleton className="h-9 w-64 mx-auto mb-2" />
          <Skeleton className="h-5 w-96 mx-auto" />
        </div>
        <div className="grid md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const adminTools = [
    {
      title: 'Payment System Status',
      description: 'Track payment, escrow & delivery implementation progress',
      icon: <Shield className="w-8 h-8 text-info" />,
      link: '/admin/payment-system-status',
      color: 'from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-info/30',
      badge: 'NEW'
    },
    {
      title: 'Launch Dashboard',
      description: 'Pre-launch checklist and system readiness',
      icon: <Rocket className="w-8 h-8 text-success" />,
      link: '/admin/launch-dashboard',
      color: 'from-success/5 to-success/10 border-success/20'
    },
    {
      title: 'Pre-Deployment Checker',
      description: 'Validate system before production deployment',
      icon: <Zap className="w-8 h-8 text-warning" />,
      link: '/admin/pre-deployment-checker',
      color: 'from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 border-primary/20'
    },
    {
      title: 'System Architecture',
      description: 'Visualize platform architecture and components',
      icon: <Code className="w-8 h-8 text-primary" />,
      link: '/admin/system-architecture',
      color: 'from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/15 border-primary/20'
    }
  ];

  if (isLoading) return <AdminDashboardSkeleton />;

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="text-center mb-12">
          <Construction className="w-16 h-16 text-primary mx-auto mb-4" />
          <h1 className="text-foreground mb-2">Admin Dashboard</h1>
          <p className="text-muted-foreground mb-6">Manage platform systems, deployment, and monitoring</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          {adminTools.map((tool, index) => (
            <Link key={index} to={tool.link}>
              <Card className={`hover:shadow-lg transition-shadow cursor-pointer bg-gradient-to-br ${tool.color}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">
                      {tool.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-foreground">{tool.title}</h3>
                        {tool.badge && (
                          <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full font-medium">
                            {tool.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">{tool.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Launch Readiness Indicator */}
        <div className="mb-8">
          <LaunchReadinessIndicator />
        </div>

        <div className="text-center">
          <Link
            to="/"
            className="inline-block px-6 py-3 bg-primary text-primary-foreground rounded-full hover:shadow-lg transition-shadow"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}