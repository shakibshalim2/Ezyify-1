import React from 'react';
import { CheckCircle2, Circle, Loader2, AlertTriangle, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { useNavigate } from 'react-router';

interface LaunchPhase {
  id: string;
  number: number;
  name: string;
  status: 'complete' | 'ready' | 'pending' | 'in-progress';
  score?: number;
  description: string;
  url?: string;
}

export default function LaunchReadinessIndicator() {
  const navigate = useNavigate();

  const phases: LaunchPhase[] = [
    {
      id: 'phase1',
      number: 1,
      name: 'Production Validation',
      status: 'complete',
      score: 98,
      description: '100+ validation sessions complete',
      url: '/admin/production-validation'
    },
    {
      id: 'phase2',
      number: 2,
      name: 'Security Audit',
      status: 'ready',
      description: '12 security checks ready to run',
      url: '/admin/launch-execution-console'
    },
    {
      id: 'phase3',
      number: 3,
      name: 'Infrastructure Validation',
      status: 'ready',
      description: '10 infrastructure checks ready',
      url: '/admin/launch-execution-console'
    },
    {
      id: 'phase4',
      number: 4,
      name: 'Team Readiness',
      status: 'ready',
      description: '10 team readiness checks ready',
      url: '/admin/launch-execution-console'
    },
    {
      id: 'phase5',
      number: 5,
      name: 'Beta Testing Setup',
      status: 'ready',
      description: '5 beta testing checks ready',
      url: '/admin/launch-execution-console'
    }
  ];

  const getStatusIcon = (status: LaunchPhase['status']) => {
    switch (status) {
      case 'complete':
        return <CheckCircle2 className="w-5 h-5 text-success" />;
      case 'ready':
        return <Circle className="w-5 h-5 text-info" />;
      case 'in-progress':
        return <Loader2 className="w-5 h-5 text-warning animate-spin" />;
      case 'pending':
        return <AlertTriangle className="w-5 h-5 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: LaunchPhase['status']) => {
    switch (status) {
      case 'complete':
        return <Badge className="bg-success">Complete</Badge>;
      case 'ready':
        return <Badge className="bg-info">Ready</Badge>;
      case 'in-progress':
        return <Badge className="bg-warning">Running</Badge>;
      case 'pending':
        return <Badge variant="outline">Pending</Badge>;
    }
  };

  const completedPhases = phases.filter(p => p.status === 'complete').length;
  const totalPhases = phases.length;
  const progressPercentage = (completedPhases / totalPhases) * 100;

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl">🚀 Launch Readiness</CardTitle>
            <CardDescription>
              5-Phase Launch Automation System
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-primary">
              {completedPhases}/{totalPhases}
            </div>
            <div className="text-sm text-muted-foreground">
              Phases Complete
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">
              {progressPercentage.toFixed(0)}%
            </span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {phases.map((phase, index) => (
          <div
            key={phase.id}
            className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
            onClick={() => phase.url && navigate(phase.url)}
          >
            {/* Status Icon */}
            <div className="flex-shrink-0">
              {getStatusIcon(phase.status)}
            </div>

            {/* Phase Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-muted-foreground">
                  Phase {phase.number}
                </span>
                <span className="text-sm font-bold">
                  {phase.name}
                </span>
                {getStatusBadge(phase.status)}
              </div>
              <p className="text-xs text-muted-foreground">
                {phase.description}
              </p>
              {phase.score && (
                <div className="mt-1">
                  <Badge variant="outline" className="text-xs">
                    Score: {phase.score}%
                  </Badge>
                </div>
              )}
            </div>

            {/* Arrow */}
            <div className="flex-shrink-0">
              <ArrowRight className="w-4 h-4 text-muted-foreground" />
            </div>
          </div>
        ))}

        {/* Action Buttons */}
        <div className="pt-4 space-y-2">
          {completedPhases === 1 && (
            <>
              <Button 
                className="w-full"
                size="lg"
                onClick={() => navigate('/admin/launch-execution-console')}
              >
                Execute Phase 2-5 Now
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                All systems ready • Estimated time: 12 minutes
              </p>
            </>
          )}

          {completedPhases === totalPhases && (
            <>
              <Button 
                className="w-full bg-success hover:bg-success/90"
                size="lg"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                All Phases Complete - Ready to Launch!
              </Button>
              <p className="text-xs text-center text-muted-foreground">
                Target Launch Date: February 25, 2026
              </p>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
