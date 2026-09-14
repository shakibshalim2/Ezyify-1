import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Search, Shield, AlertTriangle, TrendingUp, Ban, CheckCircle, Eye, DollarSign, Users, CreditCard, MapPin, Clock, AlertCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Textarea } from '../../../components/ui/textarea';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { Skeleton } from '../../../components/ui/skeleton';
import { Progress } from '../../../components/ui/progress';

interface SuspiciousActivity {
  id: string;
  type: string;
  severity: string;
  title: string;
  description: string;
  user: any;
  riskScore: number;
  indicators: string[];
  timestamp: string;
  status: string;
  amount?: number;
  [key: string]: any;
}

// Skeleton Component
function FraudDetectionSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header Skeleton */}
        <div className="mb-8">
          <Skeleton className="h-9 w-96 mb-2" />
          <Skeleton className="h-5 w-full max-w-2xl" />
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-32 mb-2" />
                <Skeleton className="h-8 w-16" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs Skeleton */}
        <div className="mb-6">
          <Skeleton className="h-10 w-full max-w-md" />
        </div>

        {/* Alerts Cards Skeleton */}
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex gap-3">
                    <Skeleton className="h-10 w-24" />
                    <Skeleton className="h-10 w-24" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FraudDetectionDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTab, setSelectedTab] = useState('high');
  const [detailDialog, setDetailDialog] = useState<{open: boolean, activity: SuspiciousActivity | null}>({
    open: false,
    activity: null
  });

  const stats = {
    totalFlags: 234,
    criticalAlerts: 12,
    investigatingCases: 45,
    blockedToday: 8,
    preventedLoss: 45000,
    falsePositiveRate: 15
  };

  const activities: SuspiciousActivity[] = [
    {
      id: 'fraud1',
      type: 'transaction',
      severity: 'critical',
      title: 'Multiple failed payment attempts',
      description: 'User attempted 15 payments with different cards in 10 minutes',
      user: {
        name: 'John Suspect',
        username: 'johnsuspect',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100',
        accountAge: '2 days'
      },
      riskScore: 95,
      indicators: [
        'New account (< 7 days)',
        'Multiple failed payments',
        'VPN/Proxy detected',
        'Unusual purchase pattern',
        'High-value transaction'
      ],
      amount: 2500,
      timestamp: '5 minutes ago',
      status: 'pending'
    },
    {
      id: 'fraud2',
      type: 'account',
      severity: 'high',
      title: 'Suspected account takeover',
      description: 'Login from different country, changed email and phone',
      user: {
        name: 'Sarah Account',
        username: 'sarahaccount',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
        accountAge: '6 months'
      },
      riskScore: 88,
      indicators: [
        'Login from new device',
        'Location change (USA → Nigeria)',
        'Email changed',
        'Phone number changed',
        'Immediate withdrawal attempt'
      ],
      amount: 3200,
      timestamp: '15 minutes ago',
      status: 'investigating'
    },
    {
      id: 'fraud3',
      type: 'pattern',
      severity: 'high',
      title: 'Fake review farm detected',
      description: 'Multiple accounts posting identical 5-star reviews',
      user: {
        name: 'Review Bot Network',
        username: 'reviewbot',
        avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=100',
        accountAge: '1 day'
      },
      riskScore: 92,
      indicators: [
        '25 accounts created same day',
        'Identical review patterns',
        'Same IP address',
        'Review bombing seller',
        'No purchase history'
      ],
      timestamp: '1 hour ago',
      status: 'pending'
    },
    {
      id: 'fraud4',
      type: 'transaction',
      severity: 'medium',
      title: 'Unusual seller behavior',
      description: 'Seller receiving multiple chargebacks and refund requests',
      user: {
        name: 'Shady Seller',
        username: 'shadyseller',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
        accountAge: '3 months'
      },
      riskScore: 72,
      indicators: [
        '12 chargebacks in 7 days',
        'High refund rate (45%)',
        'Delayed shipping',
        'Customer complaints',
        'Product mismatch reports'
      ],
      amount: 5600,
      timestamp: '3 hours ago',
      status: 'investigating'
    },
    {
      id: 'fraud5',
      type: 'transaction',
      severity: 'low',
      title: 'Large transaction anomaly',
      description: 'First purchase significantly higher than average',
      user: {
        name: 'Big Spender',
        username: 'bigspender',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100',
        accountAge: '2 weeks'
      },
      riskScore: 55,
      indicators: [
        'First purchase over ₹10,000',
        'New user account',
        'Premium item purchased',
        'No verification badges'
      ],
      amount: 12000,
      timestamp: '6 hours ago',
      status: 'pending'
    }
  ];

  const getSeverityBadge = (severity: string) => {
    const config: {[key: string]: {color: string, icon: React.ReactNode}} = {
      'low': { color: 'bg-warning/10 text-warning', icon: <AlertTriangle className="w-3 h-3 mr-1" /> },
      'medium': { color: 'bg-warning/10 text-warning', icon: <AlertTriangle className="w-3 h-3 mr-1" /> },
      'high': { color: 'bg-error/10 text-error', icon: <AlertTriangle className="w-3 h-3 mr-1" /> },
      'critical': { color: 'bg-error text-error-foreground', icon: <AlertTriangle className="w-3 h-3 mr-1" /> }
    };
    const item = config[severity];
    return (
      <Badge className={`${item.color} flex items-center w-fit`}>
        {item.icon}
        {severity.toUpperCase()}
      </Badge>
    );
  };

  const getRiskColor = (score: number) => {
    if (score >= 80) return 'text-error';
    if (score >= 60) return 'text-warning';
    if (score >= 40) return 'text-warning';
    return 'text-success';
  };

  const getRiskBgColor = (score: number) => {
    if (score >= 80) return 'bg-error/10';
    if (score >= 60) return 'bg-warning/10';
    if (score >= 40) return 'bg-warning/10';
    return 'bg-success/10';
  };

  const handleAction = (action: 'block' | 'investigate' | 'dismiss', activityId: string) => {
    toast.success(`${action.charAt(0).toUpperCase() + action.slice(1)} action completed`);
    setDetailDialog({ open: false, activity: null });
  };

  const filteredActivities = activities.filter(activity => {
    if (selectedTab === 'all') return true;
    return activity.severity === selectedTab;
  });

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  // Show skeleton while loading
  if (isLoading) {
    return <FraudDetectionSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 pb-8">
      <div className="mb-6">
        <h1 className="text-foreground mb-2">Fraud Detection Dashboard</h1>
        <p className="text-muted-foreground">Real-time fraud monitoring and prevention</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Flags</p>
                <Shield className="w-5 h-5 text-info" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.totalFlags}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Critical</p>
                <AlertTriangle className="w-5 h-5 text-error" />
              </div>
              <p className="text-2xl font-bold text-error">{stats.criticalAlerts}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Investigating</p>
                <Eye className="w-5 h-5 text-warning" />
              </div>
              <p className="text-2xl font-bold text-warning">{stats.investigatingCases}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Blocked Today</p>
                <Ban className="w-5 h-5 text-error" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.blockedToday}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Loss Prevented</p>
                <DollarSign className="w-5 h-5 text-success" />
              </div>
              <p className="text-2xl font-bold text-success">₹{stats.preventedLoss.toLocaleString()}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">False Positive</p>
                <TrendingUp className="w-5 h-5 text-muted-foreground" />
              </div>
              <p className="text-2xl font-bold text-foreground">{stats.falsePositiveRate}%</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Activity List */}
      <Card>
        <CardHeader>
          <CardTitle>Suspicious Activities</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedTab} onValueChange={setSelectedTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="critical">Critical</TabsTrigger>
              <TabsTrigger value="high">High Risk</TabsTrigger>
              <TabsTrigger value="medium">Medium</TabsTrigger>
              <TabsTrigger value="low">Low</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>

            <TabsContent value={selectedTab}>
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <Card 
                    key={activity.id} 
                    className={`border-2 ${
                      activity.severity === 'critical' ? 'border-error/40' : 
                      activity.severity === 'high' ? 'border-warning/40' : 'border-border'
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex gap-4">
                        {/* User Avatar */}
                        <div className="flex-shrink-0">
                          <img 
                            src={activity.user.avatar} 
                            alt={activity.user.name} 
                            className="w-16 h-16 rounded-full object-cover"
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                {getSeverityBadge(activity.severity)}
                                <Badge className="bg-muted text-foreground">
                                  {activity.type}
                                </Badge>
                                {activity.amount && (
                                  <Badge className="bg-info/10 text-info">
                                    ₹{activity.amount.toLocaleString()}
                                  </Badge>
                                )}
                              </div>
                              
                              <h3 className="font-semibold text-foreground mb-1">{activity.title}</h3>
                              <p className="text-sm text-muted-foreground mb-2">{activity.description}</p>
                              
                              <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                                <div className="flex items-center gap-2">
                                  <Users className="w-4 h-4" />
                                  <span>{activity.user.name} (@{activity.user.username})</span>
                                </div>
                                <span>•</span>
                                <span>Account age: {activity.user.accountAge}</span>
                                <span>•</span>
                                <span>{activity.timestamp}</span>
                              </div>

                              {/* Risk Score */}
                              <div className="mb-3">
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-sm font-medium text-foreground">Risk Score</span>
                                  <span className={`text-sm font-bold ${getRiskColor(activity.riskScore)}`}>
                                    {activity.riskScore}/100
                                  </span>
                                </div>
                                <Progress 
                                  value={activity.riskScore} 
                                  className={`h-2 ${getRiskBgColor(activity.riskScore)}`}
                                />
                              </div>

                              {/* Risk Indicators */}
                              <div className="flex flex-wrap gap-2">
                                {activity.indicators.slice(0, 3).map((indicator: string, idx: number) => (
                                  <Badge key={idx} variant="outline" className="text-xs">
                                    {indicator}
                                  </Badge>
                                ))}
                                {activity.indicators.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{activity.indicators.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-2">
                              <Button
                                size="sm"
                                onClick={() => setDetailDialog({ open: true, activity })}
                                className="bg-info hover:bg-info/90"
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Review
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-error hover:bg-error/5"
                                onClick={() => handleAction('block', activity.id)}
                              >
                                <Ban className="w-4 h-4 mr-2" />
                                Block
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="text-success hover:bg-success/5"
                                onClick={() => handleAction('dismiss', activity.id)}
                              >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Dismiss
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialog.open} onOpenChange={(open) => setDetailDialog({...detailDialog, open})}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Fraud Investigation</DialogTitle>
            <DialogDescription>
              Review suspicious activity details and take action
            </DialogDescription>
          </DialogHeader>
          
          {detailDialog.activity && (
            <div className="space-y-4 py-4">
              {/* User Info */}
              <div className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                <img 
                  src={detailDialog.activity.user.avatar} 
                  alt={detailDialog.activity.user.name} 
                  className="w-16 h-16 rounded-full"
                />
                <div>
                  <p className="font-semibold text-foreground">{detailDialog.activity.user.name}</p>
                  <p className="text-sm text-muted-foreground">@{detailDialog.activity.user.username}</p>
                  <p className="text-xs text-muted-foreground">Account age: {detailDialog.activity.user.accountAge}</p>
                </div>
              </div>

              {/* Risk Score */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-foreground">Risk Score</span>
                  <span className={`font-bold ${getRiskColor(detailDialog.activity.riskScore)}`}>
                    {detailDialog.activity.riskScore}/100
                  </span>
                </div>
                <Progress 
                  value={detailDialog.activity.riskScore} 
                  className={`h-3 ${getRiskBgColor(detailDialog.activity.riskScore)}`}
                />
              </div>

              {/* All Risk Indicators */}
              <div>
                <h4 className="font-medium text-foreground mb-2">Risk Indicators</h4>
                <div className="space-y-2">
                   {detailDialog.activity.indicators.map((indicator: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-error/5 rounded">
                      <AlertTriangle className="w-4 h-4 text-error" />
                      <span className="text-sm text-error">{indicator}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Details */}
              <div className="p-4 bg-muted rounded-xl">
                <h4 className="font-medium text-foreground mb-2">{detailDialog.activity.title}</h4>
                <p className="text-sm text-muted-foreground mb-2">{detailDialog.activity.description}</p>
                {detailDialog.activity.amount && (
                  <p className="text-sm font-semibold text-foreground">
                    Amount: ₹{detailDialog.activity.amount.toLocaleString()}
                  </p>
                )}
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDetailDialog({ open: false, activity: null })}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              variant="outline"
              onClick={() => handleAction('dismiss', detailDialog.activity?.id || '')}
              className="w-full sm:w-auto text-success hover:bg-success/5"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Dismiss (False Positive)
            </Button>
            <Button 
              onClick={() => handleAction('investigate', detailDialog.activity?.id || '')}
              className="w-full sm:w-auto bg-warning hover:bg-warning/90"
            >
              <Eye className="w-4 h-4 mr-2" />
              Mark as Investigating
            </Button>
            <Button 
              onClick={() => handleAction('block', detailDialog.activity?.id || '')}
              className="w-full sm:w-auto bg-error hover:bg-error"
            >
              <Ban className="w-4 h-4 mr-2" />
              Block User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}