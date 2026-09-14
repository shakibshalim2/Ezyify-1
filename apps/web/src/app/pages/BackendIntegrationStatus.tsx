import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { 
  Server, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Play,
  Users,
  Calendar,
  TrendingUp,
  FileCode,
  TestTube,
  Zap,
  Target,
  Activity,
  GitBranch,
  Bug,
  Shield,
  Database,
  Link2,
  Download,
  RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Progress } from '../components/ui/progress';
import { Separator } from '../components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';

// API Implementation Status Type
type APIStatus = 'completed' | 'in-progress' | 'testing' | 'pending' | 'blocked';

interface APIEndpoint {
  id: string;
  name: string;
  endpoint: string;
  method: string;
  category: string;
  priority: 'critical' | 'high' | 'medium';
  status: APIStatus;
  assignedTo?: string;
  completionDate?: string;
  testingStatus?: 'passed' | 'failed' | 'pending';
  blockers?: string[];
  dependencies?: string[];
}

// Mock data - Backend team দের এই data update করতে হবে
const apiEndpoints: APIEndpoint[] = [
  // Payment & Escrow APIs
  {
    id: 'process-payment',
    name: 'Process Payment',
    endpoint: '/api/v1/payments/process',
    method: 'POST',
    category: 'Payment & Escrow',
    priority: 'critical',
    status: 'in-progress',
    assignedTo: 'Kamal Ahmed',
    testingStatus: 'pending'
  },
  {
    id: 'release-escrow',
    name: 'Release Escrow',
    endpoint: '/api/v1/escrow/release',
    method: 'POST',
    category: 'Payment & Escrow',
    priority: 'critical',
    status: 'pending',
    dependencies: ['process-payment']
  },
  {
    id: 'check-escrow-status',
    name: 'Check Escrow Status',
    endpoint: '/api/v1/escrow/status/:orderId',
    method: 'GET',
    category: 'Payment & Escrow',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'freeze-escrow',
    name: 'Freeze Escrow',
    endpoint: '/api/v1/escrow/freeze',
    method: 'POST',
    category: 'Payment & Escrow',
    priority: 'critical',
    status: 'pending'
  },
  {
    id: 'calculate-commission',
    name: 'Calculate Commission',
    endpoint: '/api/v1/commission/calculate',
    method: 'POST',
    category: 'Payment & Escrow',
    priority: 'critical',
    status: 'pending'
  },
  
  // Order Management APIs
  {
    id: 'create-order',
    name: 'Create Order',
    endpoint: '/api/v1/orders/create',
    method: 'POST',
    category: 'Order Management',
    priority: 'critical',
    status: 'in-progress',
    assignedTo: 'Rahim Khan'
  },
  {
    id: 'get-order-details',
    name: 'Get Order Details',
    endpoint: '/api/v1/orders/:orderId',
    method: 'GET',
    category: 'Order Management',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'update-order-status',
    name: 'Update Order Status',
    endpoint: '/api/v1/orders/:orderId/status',
    method: 'PATCH',
    category: 'Order Management',
    priority: 'critical',
    status: 'pending'
  },
  {
    id: 'get-buyer-orders',
    name: 'Get Buyer Orders',
    endpoint: '/api/v1/orders/buyer/:buyerId',
    method: 'GET',
    category: 'Order Management',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'get-seller-orders',
    name: 'Get Seller Orders',
    endpoint: '/api/v1/orders/seller/:sellerId',
    method: 'GET',
    category: 'Order Management',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'mark-delivered',
    name: 'Mark Delivered',
    endpoint: '/api/v1/orders/:orderId/delivered',
    method: 'POST',
    category: 'Order Management',
    priority: 'critical',
    status: 'pending'
  },
  
  // Wallet Operations APIs
  {
    id: 'wallet-balance',
    name: 'Get Wallet Balance',
    endpoint: '/api/v1/wallet/:userId',
    method: 'GET',
    category: 'Wallet Operations',
    priority: 'critical',
    status: 'completed',
    assignedTo: 'Fatima Akhter',
    completionDate: '2026-01-20',
    testingStatus: 'passed'
  },
  {
    id: 'wallet-transactions',
    name: 'Get Wallet Transactions',
    endpoint: '/api/v1/wallet/:userId/transactions',
    method: 'GET',
    category: 'Wallet Operations',
    priority: 'high',
    status: 'completed',
    assignedTo: 'Fatima Akhter',
    completionDate: '2026-01-21',
    testingStatus: 'passed'
  },
  {
    id: 'add-funds',
    name: 'Add Funds to Wallet',
    endpoint: '/api/v1/wallet/add-funds',
    method: 'POST',
    category: 'Wallet Operations',
    priority: 'high',
    status: 'testing',
    assignedTo: 'Fatima Akhter',
    testingStatus: 'pending'
  },
  {
    id: 'wallet-deduct',
    name: 'Deduct from Wallet',
    endpoint: '/api/v1/wallet/deduct',
    method: 'POST',
    category: 'Wallet Operations',
    priority: 'critical',
    status: 'testing',
    assignedTo: 'Fatima Akhter',
    testingStatus: 'pending'
  },
  
  // Refund & Dispute APIs
  {
    id: 'request-refund',
    name: 'Request Refund',
    endpoint: '/api/v1/refunds/request',
    method: 'POST',
    category: 'Refund & Disputes',
    priority: 'critical',
    status: 'pending'
  },
  {
    id: 'get-refund-status',
    name: 'Get Refund Status',
    endpoint: '/api/v1/refunds/:refundRequestId',
    method: 'GET',
    category: 'Refund & Disputes',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'approve-refund',
    name: 'Approve/Reject Refund',
    endpoint: '/api/v1/refunds/:refundRequestId/decision',
    method: 'POST',
    category: 'Refund & Disputes',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'create-dispute',
    name: 'Create Dispute',
    endpoint: '/api/v1/disputes/create',
    method: 'POST',
    category: 'Refund & Disputes',
    priority: 'critical',
    status: 'pending'
  },
  
  // Withdrawal APIs
  {
    id: 'withdraw-request',
    name: 'Withdrawal Request',
    endpoint: '/api/v1/seller/withdraw',
    method: 'POST',
    category: 'Withdrawals',
    priority: 'high',
    status: 'pending'
  },
  {
    id: 'withdrawal-status',
    name: 'Get Withdrawal Status',
    endpoint: '/api/v1/seller/withdraw/:withdrawalId',
    method: 'GET',
    category: 'Withdrawals',
    priority: 'medium',
    status: 'pending'
  },
  {
    id: 'withdrawal-history',
    name: 'Withdrawal History',
    endpoint: '/api/v1/seller/withdraw/history',
    method: 'GET',
    category: 'Withdrawals',
    priority: 'medium',
    status: 'pending'
  }
];

const BackendIntegrationStatus = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  // Calculate statistics
  const stats = useMemo(() => {
    const total = apiEndpoints.length;
    const completed = apiEndpoints.filter(api => api.status === 'completed').length;
    const inProgress = apiEndpoints.filter(api => api.status === 'in-progress').length;
    const testing = apiEndpoints.filter(api => api.status === 'testing').length;
    const pending = apiEndpoints.filter(api => api.status === 'pending').length;
    const blocked = apiEndpoints.filter(api => api.status === 'blocked').length;
    const critical = apiEndpoints.filter(api => api.priority === 'critical').length;
    
    const completionPercentage = Math.round((completed / total) * 100);
    const criticalCompleted = apiEndpoints.filter(
      api => api.priority === 'critical' && api.status === 'completed'
    ).length;
    const criticalPercentage = Math.round((criticalCompleted / critical) * 100);

    return {
      total,
      completed,
      inProgress,
      testing,
      pending,
      blocked,
      completionPercentage,
      critical,
      criticalCompleted,
      criticalPercentage
    };
  }, []);

  // Filter APIs
  const filteredAPIs = useMemo(() => {
    return apiEndpoints.filter(api => {
      const categoryMatch = selectedCategory === 'all' || api.category === selectedCategory;
      const statusMatch = selectedStatus === 'all' || api.status === selectedStatus;
      return categoryMatch && statusMatch;
    });
  }, [selectedCategory, selectedStatus]);

  // Get unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(apiEndpoints.map(api => api.category)));
  }, []);

  // Launch countdown
  const launchDate = new Date('2026-02-25');
  const today = new Date();
  const daysRemaining = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  const getStatusIcon = (status: APIStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="size-4 text-success" />;
      case 'in-progress':
        return <Play className="size-4 text-info" />;
      case 'testing':
        return <TestTube className="size-4 text-primary" />;
      case 'pending':
        return <Clock className="size-4 text-muted-foreground" />;
      case 'blocked':
        return <AlertCircle className="size-4 text-error" />;
    }
  };

  const getStatusBadge = (status: APIStatus) => {
    const variants = {
      'completed': 'default',
      'in-progress': 'secondary',
      'testing': 'outline',
      'pending': 'outline',
      'blocked': 'destructive'
    };
    
    return (
      <Badge variant={variants[status] as any} className="gap-1">
        {getStatusIcon(status)}
        {status === 'in-progress' ? 'In Progress' : status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: 'critical' | 'high' | 'medium') => {
    const colors = {
      critical: 'bg-error/10 text-error border-error/30',
      high: 'bg-warning/10 text-warning border-warning/30',
      medium: 'bg-warning/10 text-warning border-warning/30'
    };
    
    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority === 'critical' ? '🔴 Critical' : priority === 'high' ? '🟡 High' : '🟢 Medium'}
      </Badge>
    );
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-info rounded-xl">
                  <Server className="size-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Backend Integration Status</h1>
                  <p className="text-muted-foreground">Real-time API Implementation Progress Tracker</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Launch Countdown</div>
              <div className="text-3xl font-bold text-info">{daysRemaining} Days</div>
              <div className="text-xs text-muted-foreground">Until Feb 25, 2026</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-success">{stats.completed}</div>
                <div className="text-sm text-muted-foreground">Completed</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-info">{stats.inProgress}</div>
                <div className="text-sm text-muted-foreground">In Progress</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{stats.testing}</div>
                <div className="text-sm text-muted-foreground">Testing</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-muted-foreground">{stats.pending}</div>
                <div className="text-sm text-muted-foreground">Pending</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-error">{stats.blocked}</div>
                <div className="text-sm text-muted-foreground">Blocked</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.completionPercentage}%</div>
                <div className="text-sm text-muted-foreground">Complete</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Progress Overview */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="size-5" />
                Overall Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">All APIs ({stats.completed}/{stats.total})</span>
                    <span className="text-sm font-bold">{stats.completionPercentage}%</span>
                  </div>
                  <Progress value={stats.completionPercentage} className="h-3" />
                </div>
                
                <Separator />
                
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Critical APIs ({stats.criticalCompleted}/{stats.critical})</span>
                    <span className="text-sm font-bold text-error">{stats.criticalPercentage}%</span>
                  </div>
                  <Progress value={stats.criticalPercentage} className="h-3" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="size-5" />
                Daily Velocity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm">APIs/Week Target</span>
                  <span className="text-lg font-bold">5-6</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Current Velocity</span>
                  <span className="text-lg font-bold text-success">2-3</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm">Estimated Completion</span>
                  <span className="text-lg font-bold">Feb 15, 2026</span>
                </div>
                <Alert>
                  <TrendingUp className="size-4" />
                  <AlertDescription>
                    On track to complete all APIs 10 days before launch
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters & Quick Actions */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center justify-between">
              <div className="flex flex-wrap gap-3">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All Categories
                </Button>
                {categories.map(category => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(category)}
                  >
                    {category}
                  </Button>
                ))}
              </div>
              
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Download className="size-4 mr-2" />
                  Export Report
                </Button>
                <Button variant="outline" size="sm">
                  <RefreshCw className="size-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content Tabs */}
        <Tabs defaultValue="apis" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="apis">API List</TabsTrigger>
            <TabsTrigger value="team">Team Progress</TabsTrigger>
            <TabsTrigger value="blockers">Blockers & Issues</TabsTrigger>
            <TabsTrigger value="timeline">Timeline</TabsTrigger>
          </TabsList>

          {/* API List Tab */}
          <TabsContent value="apis" className="space-y-4">
            {filteredAPIs.map(api => (
              <Card key={api.id}>
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">{api.name}</h3>
                        {getStatusBadge(api.status)}
                        {getPriorityBadge(api.priority)}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                        <span className="font-mono bg-muted px-2 py-1 rounded">
                          {api.method} {api.endpoint}
                        </span>
                        <Badge variant="outline">{api.category}</Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        {api.assignedTo && (
                          <div className="flex items-center gap-2">
                            <Users className="size-4 text-muted-foreground" />
                            <span>{api.assignedTo}</span>
                          </div>
                        )}
                        
                        {api.completionDate && (
                          <div className="flex items-center gap-2">
                            <Calendar className="size-4 text-muted-foreground" />
                            <span>{api.completionDate}</span>
                          </div>
                        )}
                        
                        {api.testingStatus && (
                          <div className="flex items-center gap-2">
                            <TestTube className="size-4 text-muted-foreground" />
                            <span className={api.testingStatus === 'passed' ? 'text-success' : ''}>
                              Testing: {api.testingStatus}
                            </span>
                          </div>
                        )}
                        
                        {api.dependencies && api.dependencies.length > 0 && (
                          <div className="flex items-center gap-2">
                            <GitBranch className="size-4 text-muted-foreground" />
                            <span>{api.dependencies.length} dependencies</span>
                          </div>
                        )}
                      </div>

                      {api.blockers && api.blockers.length > 0 && (
                        <Alert variant="destructive" className="mt-3">
                          <Bug className="size-4" />
                          <AlertTitle>Blocked</AlertTitle>
                          <AlertDescription>
                            {api.blockers.join(', ')}
                          </AlertDescription>
                        </Alert>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <Link to="/api-integration-playground">
                          <FileCode className="size-4" />
                        </Link>
                      </Button>
                      <Button variant="outline" size="sm">
                        <Link2 className="size-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </TabsContent>

          {/* Team Progress Tab */}
          <TabsContent value="team" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Team Member Progress</CardTitle>
                <CardDescription>Individual developer statistics and assignments</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {['Kamal Ahmed', 'Rahim Khan', 'Fatima Akhter'].map(developer => {
                    const assigned = apiEndpoints.filter(api => api.assignedTo === developer);
                    const completed = assigned.filter(api => api.status === 'completed').length;
                    const progress = assigned.length > 0 ? Math.round((completed / assigned.length) * 100) : 0;
                    
                    return (
                      <div key={developer} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-info flex items-center justify-center text-white font-semibold">
                              {developer.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <div className="font-semibold">{developer}</div>
                              <div className="text-sm text-muted-foreground">
                                {completed}/{assigned.length} APIs completed
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold">{progress}%</div>
                          </div>
                        </div>
                        <Progress value={progress} className="h-2" />
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Blockers Tab */}
          <TabsContent value="blockers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bug className="size-5 text-error" />
                  Current Blockers & Issues
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Alert>
                  <CheckCircle2 className="size-4" />
                  <AlertTitle>No Critical Blockers</AlertTitle>
                  <AlertDescription>
                    All APIs are progressing smoothly. No blocking issues reported.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Timeline Tab */}
          <TabsContent value="timeline" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Implementation Timeline</CardTitle>
                <CardDescription>4-week sprint breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {[
                    {
                      week: 'Week 1',
                      dates: 'Jan 22 - Jan 28',
                      focus: 'Critical Foundation APIs',
                      apis: ['Authentication (3)', 'Core Payment (3)', 'Basic Wallet (2)'],
                      status: 'in-progress'
                    },
                    {
                      week: 'Week 2',
                      dates: 'Jan 29 - Feb 4',
                      focus: 'Transaction Management',
                      apis: ['Order Management (4)', 'Escrow Management (2)'],
                      status: 'pending'
                    },
                    {
                      week: 'Week 3',
                      dates: 'Feb 5 - Feb 11',
                      focus: 'Seller Operations',
                      apis: ['Withdrawal APIs (3)', 'Commission Calculation (1)'],
                      status: 'pending'
                    },
                    {
                      week: 'Week 4',
                      dates: 'Feb 12 - Feb 18',
                      focus: 'Support Systems',
                      apis: ['Refund & Dispute (4)', 'Advanced Wallet (2)'],
                      status: 'pending'
                    }
                  ].map(sprint => (
                    <div key={sprint.week} className="border-l-4 border-info pl-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h3 className="font-semibold">{sprint.week}</h3>
                          <p className="text-sm text-muted-foreground">{sprint.dates}</p>
                        </div>
                        <Badge variant={sprint.status === 'in-progress' ? 'default' : 'outline'}>
                          {sprint.status === 'in-progress' ? 'Active' : 'Upcoming'}
                        </Badge>
                      </div>
                      <div className="mb-2">
                        <span className="text-sm font-medium">Focus: </span>
                        <span className="text-sm text-muted-foreground">{sprint.focus}</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {sprint.apis.map((api, i) => (
                          <Badge key={i} variant="outline">{api}</Badge>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Links */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Related Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/api-integration-playground">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <FileCode className="size-4" />
                      <span className="font-semibold">API Playground</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Interactive API documentation</p>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/launch-control">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield className="size-4" />
                      <span className="font-semibold">Launch Control</span>
                    </div>
                    <p className="text-xs text-muted-foreground">System health monitoring</p>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/platform-overview">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Database className="size-4" />
                      <span className="font-semibold">Platform Overview</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Executive dashboard</p>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BackendIntegrationStatus;
