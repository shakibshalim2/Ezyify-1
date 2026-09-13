import { useState, useMemo } from 'react';
import { Link } from 'react-router';
import { 
  Shield, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Clock,
  Play,
  RefreshCw,
  Download,
  FileCheck,
  Zap,
  Users,
  ShoppingCart,
  Wallet,
  FileText,
  Lock,
  Globe,
  Smartphone,
  Monitor,
  Moon,
  Sun,
  Accessibility,
  Search,
  Mail,
  Bell,
  CreditCard,
  Package,
  TrendingUp,
  MessageSquare,
  Star,
  Settings,
  Database,
  Server,
  Code,
  Bug,
  Target,
  ChevronRight,
  ChevronDown,
  Filter,
  Eye,
  PlayCircle
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Progress } from '../components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '../components/ui/alert';
import { Separator } from '../components/ui/separator';
import { ScrollArea } from '../components/ui/scroll-area';
import { Checkbox } from '../components/ui/checkbox';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';

type TestStatus = 'passed' | 'failed' | 'pending' | 'running' | 'skipped';
type TestPriority = 'critical' | 'high' | 'medium' | 'low';
type TestCategory = 'functional' | 'ui' | 'security' | 'performance' | 'integration' | 'compatibility';

interface QATest {
  id: string;
  category: TestCategory;
  section: string;
  title: string;
  description: string;
  priority: TestPriority;
  status: TestStatus;
  assignee?: string;
  automatable: boolean;
  pageUrl?: string;
  lastRun?: Date;
  issues?: string[];
}

const PreLaunchQADashboard = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedSections, setExpandedSections] = useState<string[]>(['functional']);

  // Comprehensive QA test cases
  const qaTests: QATest[] = [
    // Authentication & User Management
    {
      id: 'auth-001',
      category: 'functional',
      section: 'Authentication',
      title: 'User Registration Flow',
      description: 'Test complete signup process with email/phone verification',
      priority: 'critical',
      status: 'passed',
      assignee: 'QA Team',
      automatable: true,
      pageUrl: '/signup',
      lastRun: new Date('2026-01-21')
    },
    {
      id: 'auth-002',
      category: 'functional',
      section: 'Authentication',
      title: 'Login with Multiple Methods',
      description: 'Test email, phone, and social login',
      priority: 'critical',
      status: 'passed',
      assignee: 'QA Team',
      automatable: true,
      pageUrl: '/login'
    },
    {
      id: 'auth-003',
      category: 'functional',
      section: 'Authentication',
      title: 'Password Reset Flow',
      description: 'Verify forgot password and OTP verification',
      priority: 'high',
      status: 'passed',
      automatable: true,
      pageUrl: '/forgot-password'
    },
    {
      id: 'auth-004',
      category: 'security',
      section: 'Authentication',
      title: 'Session Management',
      description: 'Test token expiry and refresh mechanisms',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },

    // Payment & Escrow System
    {
      id: 'pay-001',
      category: 'functional',
      section: 'Payment System',
      title: 'Wallet-Based Payment',
      description: 'Complete purchase using wallet balance',
      priority: 'critical',
      status: 'pending',
      assignee: 'Payment Team',
      automatable: false,
      pageUrl: '/checkout'
    },
    {
      id: 'pay-002',
      category: 'functional',
      section: 'Payment System',
      title: 'Escrow Creation',
      description: 'Verify funds held in escrow after purchase',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },
    {
      id: 'pay-003',
      category: 'functional',
      section: 'Payment System',
      title: 'Delivery Confirmation',
      description: 'Test buyer-only delivery confirmation flow',
      priority: 'critical',
      status: 'pending',
      pageUrl: '/user/order-tracking/:orderId'
    },
    {
      id: 'pay-004',
      category: 'functional',
      section: 'Payment System',
      title: 'Escrow Release',
      description: 'Verify automatic 7-day release mechanism',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },
    {
      id: 'pay-005',
      category: 'functional',
      section: 'Payment System',
      title: 'Commission Calculation',
      description: 'Verify commission hidden from buyer, deducted from seller',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },
    {
      id: 'pay-006',
      category: 'functional',
      section: 'Payment System',
      title: 'Refund Processing',
      description: 'Test complete refund request and approval flow',
      priority: 'high',
      status: 'pending',
      pageUrl: '/orders/refund-request'
    },
    {
      id: 'pay-007',
      category: 'functional',
      section: 'Payment System',
      title: 'Dispute Creation',
      description: 'Test dispute escalation and escrow freeze',
      priority: 'high',
      status: 'pending',
      pageUrl: '/orders/dispute'
    },

    // E-commerce Features
    {
      id: 'ecom-001',
      category: 'functional',
      section: 'E-commerce',
      title: 'Product Search',
      description: 'Test search with filters and categories',
      priority: 'high',
      status: 'passed',
      automatable: true,
      pageUrl: '/search'
    },
    {
      id: 'ecom-002',
      category: 'functional',
      section: 'E-commerce',
      title: 'Add to Cart',
      description: 'Verify cart functionality and persistence',
      priority: 'high',
      status: 'passed',
      pageUrl: '/cart'
    },
    {
      id: 'ecom-003',
      category: 'functional',
      section: 'E-commerce',
      title: 'Wishlist Management',
      description: 'Test add/remove items from wishlist',
      priority: 'medium',
      status: 'passed',
      pageUrl: '/wishlist'
    },
    {
      id: 'ecom-004',
      category: 'functional',
      section: 'E-commerce',
      title: 'Product Reviews',
      description: 'Test review submission and display',
      priority: 'medium',
      status: 'pending',
      pageUrl: '/product/:id'
    },
    {
      id: 'ecom-005',
      category: 'functional',
      section: 'E-commerce',
      title: 'Order Tracking',
      description: 'Verify order status updates and tracking',
      priority: 'high',
      status: 'pending',
      pageUrl: '/user/order-tracking/:orderId'
    },

    // Seller Features
    {
      id: 'sell-001',
      category: 'functional',
      section: 'Seller Dashboard',
      title: 'Product Upload',
      description: 'Test product creation with images and details',
      priority: 'critical',
      status: 'passed',
      pageUrl: '/seller/add-product'
    },
    {
      id: 'sell-002',
      category: 'functional',
      section: 'Seller Dashboard',
      title: 'Order Management',
      description: 'Test order acceptance and status updates',
      priority: 'critical',
      status: 'pending',
      pageUrl: '/seller/orders'
    },
    {
      id: 'sell-003',
      category: 'functional',
      section: 'Seller Dashboard',
      title: 'KYC Verification',
      description: 'Complete seller verification process',
      priority: 'critical',
      status: 'pending',
      pageUrl: '/seller/kyc-verification'
    },
    {
      id: 'sell-004',
      category: 'functional',
      section: 'Seller Dashboard',
      title: 'Earnings & Analytics',
      description: 'Verify earnings display and analytics',
      priority: 'high',
      status: 'pending',
      pageUrl: '/seller/earnings'
    },
    {
      id: 'sell-005',
      category: 'functional',
      section: 'Seller Dashboard',
      title: 'Withdrawal Request',
      description: 'Test withdrawal to bank account',
      priority: 'critical',
      status: 'pending',
      pageUrl: '/seller/withdraw'
    },

    // Social Features
    {
      id: 'social-001',
      category: 'functional',
      section: 'Social Features',
      title: 'Post Creation (Loops)',
      description: 'Test video/image post upload',
      priority: 'high',
      status: 'passed',
      pageUrl: '/upload'
    },
    {
      id: 'social-002',
      category: 'functional',
      section: 'Social Features',
      title: 'Stories Feature',
      description: 'Test story upload and viewing',
      priority: 'medium',
      status: 'passed',
      pageUrl: '/stories/:username'
    },
    {
      id: 'social-003',
      category: 'functional',
      section: 'Social Features',
      title: 'Live Shopping',
      description: 'Test live streaming and product tagging',
      priority: 'high',
      status: 'pending',
      pageUrl: '/live/:id'
    },
    {
      id: 'social-004',
      category: 'functional',
      section: 'Social Features',
      title: 'Comments & Interactions',
      description: 'Test like, comment, share functionality',
      priority: 'medium',
      status: 'passed',
      pageUrl: '/post/:id'
    },
    {
      id: 'social-005',
      category: 'functional',
      section: 'Social Features',
      title: 'Follow/Unfollow',
      description: 'Test user following mechanism',
      priority: 'medium',
      status: 'passed',
      pageUrl: '/profile/:username'
    },

    // UI/UX Tests
    {
      id: 'ui-001',
      category: 'ui',
      section: 'UI/UX',
      title: 'Dark Mode Toggle',
      description: 'Test dark/light mode switching on all pages',
      priority: 'high',
      status: 'passed',
      automatable: true
    },
    {
      id: 'ui-002',
      category: 'ui',
      section: 'UI/UX',
      title: 'Mobile Responsiveness',
      description: 'Test all pages on mobile devices',
      priority: 'critical',
      status: 'passed',
      automatable: false
    },
    {
      id: 'ui-003',
      category: 'ui',
      section: 'UI/UX',
      title: 'Navigation Flow',
      description: 'Verify all navigation links work correctly',
      priority: 'high',
      status: 'passed',
      automatable: true
    },
    {
      id: 'ui-004',
      category: 'ui',
      section: 'UI/UX',
      title: 'Form Validation',
      description: 'Test all form validations and error messages',
      priority: 'high',
      status: 'pending',
      automatable: true
    },
    {
      id: 'ui-005',
      category: 'ui',
      section: 'UI/UX',
      title: 'Loading States',
      description: 'Verify loading indicators on all async operations',
      priority: 'medium',
      status: 'passed',
      automatable: false
    },

    // Security Tests
    {
      id: 'sec-001',
      category: 'security',
      section: 'Security',
      title: 'XSS Protection',
      description: 'Test for cross-site scripting vulnerabilities',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },
    {
      id: 'sec-002',
      category: 'security',
      section: 'Security',
      title: 'CSRF Protection',
      description: 'Verify CSRF token implementation',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },
    {
      id: 'sec-003',
      category: 'security',
      section: 'Security',
      title: 'SQL Injection',
      description: 'Test for SQL injection vulnerabilities',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },
    {
      id: 'sec-004',
      category: 'security',
      section: 'Security',
      title: 'Data Encryption',
      description: 'Verify sensitive data encryption (passwords, cards)',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },
    {
      id: 'sec-005',
      category: 'security',
      section: 'Security',
      title: 'Rate Limiting',
      description: 'Test API rate limiting and DDoS protection',
      priority: 'high',
      status: 'pending',
      automatable: false
    },

    // Performance Tests
    {
      id: 'perf-001',
      category: 'performance',
      section: 'Performance',
      title: 'Page Load Speed',
      description: 'Measure load time for all major pages (<3s)',
      priority: 'high',
      status: 'pending',
      automatable: true
    },
    {
      id: 'perf-002',
      category: 'performance',
      section: 'Performance',
      title: 'Image Optimization',
      description: 'Verify lazy loading and compression',
      priority: 'medium',
      status: 'passed',
      automatable: true
    },
    {
      id: 'perf-003',
      category: 'performance',
      section: 'Performance',
      title: 'API Response Time',
      description: 'Test API response times (<500ms)',
      priority: 'high',
      status: 'pending',
      automatable: true
    },
    {
      id: 'perf-004',
      category: 'performance',
      section: 'Performance',
      title: 'Concurrent Users',
      description: 'Load test with 1000+ concurrent users',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },

    // Integration Tests
    {
      id: 'int-001',
      category: 'integration',
      section: 'Integrations',
      title: 'Payment Gateway',
      description: 'Test bKash, Nagad integration',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },
    {
      id: 'int-002',
      category: 'integration',
      section: 'Integrations',
      title: 'Email Service',
      description: 'Test email notifications (order, reset, etc.)',
      priority: 'high',
      status: 'pending',
      automatable: false
    },
    {
      id: 'int-003',
      category: 'integration',
      section: 'Integrations',
      title: 'SMS Service',
      description: 'Test SMS OTP delivery',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },
    {
      id: 'int-004',
      category: 'integration',
      section: 'Integrations',
      title: 'Push Notifications',
      description: 'Test push notification delivery',
      priority: 'medium',
      status: 'pending',
      automatable: false
    },

    // Compatibility Tests
    {
      id: 'comp-001',
      category: 'compatibility',
      section: 'Compatibility',
      title: 'Browser Testing',
      description: 'Test on Chrome, Firefox, Safari, Edge',
      priority: 'high',
      status: 'passed',
      automatable: false
    },
    {
      id: 'comp-002',
      category: 'compatibility',
      section: 'Compatibility',
      title: 'Mobile OS Testing',
      description: 'Test on iOS and Android',
      priority: 'critical',
      status: 'pending',
      automatable: false
    },
    {
      id: 'comp-003',
      category: 'compatibility',
      section: 'Compatibility',
      title: 'Screen Sizes',
      description: 'Test on various screen sizes (320px to 2560px)',
      priority: 'high',
      status: 'passed',
      automatable: false
    },
    {
      id: 'comp-004',
      category: 'compatibility',
      section: 'Compatibility',
      title: 'Accessibility (WCAG)',
      description: 'Test ARIA labels, keyboard navigation',
      priority: 'medium',
      status: 'pending',
      automatable: true
    }
  ];

  // Calculate statistics
  const stats = useMemo(() => {
    const total = qaTests.length;
    const passed = qaTests.filter(t => t.status === 'passed').length;
    const failed = qaTests.filter(t => t.status === 'failed').length;
    const pending = qaTests.filter(t => t.status === 'pending').length;
    const running = qaTests.filter(t => t.status === 'running').length;
    
    const critical = qaTests.filter(t => t.priority === 'critical').length;
    const criticalPassed = qaTests.filter(t => t.priority === 'critical' && t.status === 'passed').length;
    
    const automatable = qaTests.filter(t => t.automatable).length;
    
    const byCategory = {
      functional: qaTests.filter(t => t.category === 'functional').length,
      ui: qaTests.filter(t => t.category === 'ui').length,
      security: qaTests.filter(t => t.category === 'security').length,
      performance: qaTests.filter(t => t.category === 'performance').length,
      integration: qaTests.filter(t => t.category === 'integration').length,
      compatibility: qaTests.filter(t => t.category === 'compatibility').length,
    };

    const completionPercentage = Math.round((passed / total) * 100);
    const criticalPercentage = Math.round((criticalPassed / critical) * 100);

    return {
      total,
      passed,
      failed,
      pending,
      running,
      critical,
      criticalPassed,
      criticalPercentage,
      automatable,
      byCategory,
      completionPercentage
    };
  }, [qaTests]);

  // Filter tests
  const filteredTests = useMemo(() => {
    return qaTests.filter(test => {
      const categoryMatch = selectedCategory === 'all' || test.category === selectedCategory;
      const statusMatch = selectedStatus === 'all' || test.status === selectedStatus;
      const searchMatch = searchQuery === '' || 
        test.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        test.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      return categoryMatch && statusMatch && searchMatch;
    });
  }, [selectedCategory, selectedStatus, searchQuery]);

  // Group by section
  const groupedTests = useMemo(() => {
    const groups: Record<string, QATest[]> = {};
    filteredTests.forEach(test => {
      if (!groups[test.section]) {
        groups[test.section] = [];
      }
      groups[test.section].push(test);
    });
    return groups;
  }, [filteredTests]);

  const getStatusIcon = (status: TestStatus) => {
    switch (status) {
      case 'passed':
        return <CheckCircle2 className="size-4 text-success" />;
      case 'failed':
        return <XCircle className="size-4 text-error" />;
      case 'pending':
        return <Clock className="size-4 text-muted-foreground" />;
      case 'running':
        return <RefreshCw className="size-4 text-info animate-spin" />;
      case 'skipped':
        return <AlertTriangle className="size-4 text-warning" />;
    }
  };

  const getStatusBadge = (status: TestStatus) => {
    const variants: Record<TestStatus, any> = {
      'passed': 'default',
      'failed': 'destructive',
      'pending': 'outline',
      'running': 'secondary',
      'skipped': 'outline'
    };
    
    return (
      <Badge variant={variants[status]} className="gap-1">
        {getStatusIcon(status)}
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TestPriority) => {
    const colors: Record<TestPriority, string> = {
      critical: 'bg-error/10 text-error border-error/30',
      high: 'bg-warning/10 text-warning border-warning/30',
      medium: 'bg-warning/10 text-warning border-warning/30',
      low: 'bg-info/10 text-info border-info/30'
    };
    
    return (
      <Badge variant="outline" className={colors[priority]}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </Badge>
    );
  };

  const getCategoryIcon = (category: TestCategory) => {
    const icons: Record<TestCategory, any> = {
      functional: FileCheck,
      ui: Monitor,
      security: Shield,
      performance: Zap,
      integration: Database,
      compatibility: Globe
    };
    const Icon = icons[category];
    return <Icon className="size-4" />;
  };

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const runAllTests = () => {
    toast.info('Running all test suites...', {
      description: 'This will take approximately 15-20 minutes'
    });
  };

  const launchDate = new Date('2026-02-25');
  const today = new Date();
  const daysRemaining = Math.ceil((launchDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b bg-card">
        <div className="container mx-auto px-4 pb-6">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-success rounded-xl">
                  <Shield className="size-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold">Pre-Launch QA Dashboard</h1>
                  <p className="text-muted-foreground">Comprehensive quality assurance and launch readiness validation</p>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <div className="text-sm text-muted-foreground mb-1">Launch Countdown</div>
              <div className="text-3xl font-bold text-success">{daysRemaining} Days</div>
              <div className="text-xs text-muted-foreground">Until Feb 25, 2026</div>
            </div>
          </div>

          {/* Overall Progress */}
          <div className="mt-6 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-semibold">Overall Test Coverage</span>
              <span className="text-lg font-bold">{stats.completionPercentage}%</span>
            </div>
            <Progress value={stats.completionPercentage} className="h-3" />
            
            <div className="flex justify-between items-center text-sm text-muted-foreground">
              <span>{stats.passed} passed · {stats.failed} failed · {stats.pending} pending</span>
              <span>{stats.total} total tests</span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mt-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-success">{stats.passed}</div>
                <div className="text-sm text-muted-foreground">Passed</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-error">{stats.failed}</div>
                <div className="text-sm text-muted-foreground">Failed</div>
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
                <div className="text-2xl font-bold text-info">{stats.running}</div>
                <div className="text-sm text-muted-foreground">Running</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold text-primary">{stats.automatable}</div>
                <div className="text-sm text-muted-foreground">Automatable</div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">{stats.criticalPercentage}%</div>
                <div className="text-sm text-muted-foreground">Critical Done</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 pb-8">
        {/* Critical Tests Alert */}
        {stats.criticalPercentage < 100 && (
          <Alert variant="destructive" className="mb-6">
            <AlertTriangle className="size-4" />
            <AlertTitle>Critical Tests Incomplete</AlertTitle>
            <AlertDescription>
              {stats.critical - stats.criticalPassed} critical tests are still pending. 
              These must be completed before launch.
            </AlertDescription>
          </Alert>
        )}

        {/* Category Breakdown */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Target className="size-5" />
                Test Coverage by Category
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(stats.byCategory).map(([category, count]) => {
                const passed = qaTests.filter(t => t.category === category && t.status === 'passed').length;
                const percentage = Math.round((passed / count) * 100);
                
                return (
                  <div key={category} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize flex items-center gap-2">
                        {getCategoryIcon(category as TestCategory)}
                        {category}
                      </span>
                      <span className="font-semibold">{passed}/{count}</span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                );
              })}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Zap className="size-5" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full justify-start" onClick={runAllTests}>
                <PlayCircle className="size-4 mr-2" />
                Run All Tests
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="size-4 mr-2" />
                Export Report
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Bug className="size-4 mr-2" />
                View All Issues
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link to="/api-testing-dashboard">
                  <Code className="size-4 mr-2" />
                  API Testing
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Settings className="size-5" />
                Test Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Total Test Cases</span>
                  <span className="font-bold">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Automatable Tests</span>
                  <span className="font-bold">{stats.automatable}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Manual Tests</span>
                  <span className="font-bold">{stats.total - stats.automatable}</span>
                </div>
                <Separator />
                <div className="flex justify-between text-sm">
                  <span>Critical Priority</span>
                  <span className="font-bold text-error">{stats.critical}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-wrap gap-4 items-center">
              <div className="flex-1 min-w-[200px]">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <Input
                    placeholder="Search tests..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="flex gap-2 flex-wrap">
                <Button
                  variant={selectedCategory === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory('all')}
                >
                  All
                </Button>
                {['functional', 'ui', 'security', 'performance', 'integration', 'compatibility'].map(cat => (
                  <Button
                    key={cat}
                    variant={selectedCategory === cat ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedCategory(cat)}
                    className="gap-1"
                  >
                    {getCategoryIcon(cat as TestCategory)}
                    <span className="capitalize">{cat}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Test List by Section */}
        <div className="space-y-4">
          {Object.entries(groupedTests).map(([section, tests]) => {
            const sectionPassed = tests.filter(t => t.status === 'passed').length;
            const sectionPercentage = Math.round((sectionPassed / tests.length) * 100);
            const isExpanded = expandedSections.includes(section);
            
            return (
              <Card key={section}>
                <CardHeader className="cursor-pointer" onClick={() => toggleSection(section)}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="size-5" />
                      ) : (
                        <ChevronRight className="size-5" />
                      )}
                      <CardTitle className="text-lg">{section}</CardTitle>
                      <Badge variant="outline">{tests.length} tests</Badge>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <span className="text-sm text-muted-foreground">
                        {sectionPassed}/{tests.length} passed
                      </span>
                      <div className="w-32">
                        <Progress value={sectionPercentage} className="h-2" />
                      </div>
                      <span className="text-sm font-bold w-12 text-right">{sectionPercentage}%</span>
                    </div>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent>
                    <div className="space-y-3">
                      {tests.map(test => (
                        <div
                          key={test.id}
                          className="flex items-start gap-4 p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-semibold">{test.title}</h4>
                              {getStatusBadge(test.status)}
                              {getPriorityBadge(test.priority)}
                              {test.automatable && (
                                <Badge variant="outline" className="gap-1">
                                  <Zap className="size-3" />
                                  Auto
                                </Badge>
                              )}
                            </div>
                            
                            <p className="text-sm text-muted-foreground mb-3">
                              {test.description}
                            </p>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              {test.assignee && (
                                <span className="flex items-center gap-1">
                                  <Users className="size-3" />
                                  {test.assignee}
                                </span>
                              )}
                              {test.lastRun && (
                                <span className="flex items-center gap-1">
                                  <Clock className="size-3" />
                                  Last run: {test.lastRun.toLocaleDateString()}
                                </span>
                              )}
                              {test.pageUrl && (
                                <span className="flex items-center gap-1">
                                  <Eye className="size-3" />
                                  <Link to={test.pageUrl} className="hover:underline">
                                    View Page
                                  </Link>
                                </span>
                              )}
                            </div>

                            {test.issues && test.issues.length > 0 && (
                              <div className="mt-3">
                                <Alert variant="destructive">
                                  <Bug className="size-4" />
                                  <AlertDescription>
                                    {test.issues.join(', ')}
                                  </AlertDescription>
                                </Alert>
                              </div>
                            )}
                          </div>
                          
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">
                              <Play className="size-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>

        {/* Related Resources */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Related Tools & Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/backend-integration-status">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Server className="size-4" />
                      <span className="font-semibold">Backend Status</span>
                    </div>
                    <p className="text-xs text-muted-foreground">API progress</p>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/api-testing-dashboard">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Code className="size-4" />
                      <span className="font-semibold">API Testing</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Test endpoints</p>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/launch-control">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings className="size-4" />
                      <span className="font-semibold">Launch Control</span>
                    </div>
                    <p className="text-xs text-muted-foreground">System health</p>
                  </div>
                </Link>
              </Button>

              <Button variant="outline" className="justify-start h-auto py-4" asChild>
                <Link to="/platform-overview">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="size-4" />
                      <span className="font-semibold">Platform Overview</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Executive view</p>
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

export default PreLaunchQADashboard;
