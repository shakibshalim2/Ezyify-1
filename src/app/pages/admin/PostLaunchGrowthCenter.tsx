import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { Switch } from '../../components/ui/switch';
import {
  Sparkles,
  Zap,
  TrendingUp,
  Users,
  ShoppingBag,
  Heart,
  Video,
  MessageCircle,
  Target,
  Crown,
  Award,
  Star,
  Gift,
  Share2,
  Activity,
  Shield,
  BarChart3,
  Settings,
  PlayCircle,
  CheckCircle2,
  ArrowRight,
  Rocket,
  Brain,
  Eye,
  ThumbsUp,
  Package,
  Percent,
  DollarSign,
  TrendingDown,
  ArrowUp,
  RefreshCw,
  Calendar,
  Clock,
  Users2,
  ShoppingCart,
  Megaphone
} from 'lucide-react';
import { toast } from 'sonner';

interface GrowthFeature {
  id: string;
  name: string;
  category: 'ai' | 'live' | 'social' | 'personalization';
  status: 'active' | 'testing' | 'planned' | 'disabled';
  impact: 'high' | 'medium' | 'low';
  metrics: {
    engagement?: number;
    conversion?: number;
    revenue?: number;
    adoption?: number;
  };
  description: string;
  icon: any;
}

interface AIRecommendation {
  id: string;
  type: 'product' | 'content' | 'user' | 'seller';
  algorithm: string;
  accuracy: number;
  ctr: number;
  conversionRate: number;
  revenue: number;
  enabled: boolean;
}

interface LiveShoppingEvent {
  id: string;
  title: string;
  host: string;
  scheduledTime: string;
  viewers: number;
  sales: number;
  revenue: number;
  status: 'upcoming' | 'live' | 'completed';
  products: number;
}

interface SocialFeature {
  id: string;
  name: string;
  users: number;
  engagement: number;
  shareRate: number;
  viralCoefficient: number;
  enabled: boolean;
}

interface PersonalizationRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  affectedUsers: number;
  uplift: number;
  enabled: boolean;
}

export default function PostLaunchGrowthCenter() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Growth features overview
  const [growthFeatures, setGrowthFeatures] = useState<GrowthFeature[]>([
    {
      id: 'ai-rec-1',
      name: 'AI Product Recommendations',
      category: 'ai',
      status: 'active',
      impact: 'high',
      metrics: { engagement: 42, conversion: 18, revenue: 285000 },
      description: 'Machine learning powered product suggestions',
      icon: Brain
    },
    {
      id: 'live-1',
      name: 'Live Shopping Events',
      category: 'live',
      status: 'active',
      impact: 'high',
      metrics: { engagement: 68, conversion: 24, revenue: 412000 },
      description: 'Real-time interactive shopping experiences',
      icon: Video
    },
    {
      id: 'social-1',
      name: 'Social Commerce Integration',
      category: 'social',
      status: 'active',
      impact: 'high',
      metrics: { engagement: 54, adoption: 38 },
      description: 'Seamless shopping from social feeds',
      icon: Share2
    },
    {
      id: 'personal-1',
      name: 'Smart Personalization Engine',
      category: 'personalization',
      status: 'active',
      impact: 'high',
      metrics: { engagement: 34, conversion: 22 },
      description: 'Adaptive user experience optimization',
      icon: Sparkles
    },
    {
      id: 'ai-rec-2',
      name: 'AI Content Moderation',
      category: 'ai',
      status: 'active',
      impact: 'medium',
      metrics: { engagement: 98 },
      description: 'Automated content safety and quality',
      icon: Shield
    },
    {
      id: 'live-2',
      name: 'Creator Live Studio',
      category: 'live',
      status: 'testing',
      impact: 'medium',
      metrics: { adoption: 28 },
      description: 'Advanced tools for live content creators',
      icon: Video
    },
    {
      id: 'social-2',
      name: 'Viral Loops & Referrals',
      category: 'social',
      status: 'active',
      impact: 'high',
      metrics: { engagement: 45, adoption: 34 },
      description: 'Growth through social sharing',
      icon: Gift
    },
    {
      id: 'personal-2',
      name: 'Dynamic Pricing Engine',
      category: 'personalization',
      status: 'testing',
      impact: 'high',
      metrics: { conversion: 15, revenue: 156000 },
      description: 'AI-driven personalized pricing',
      icon: DollarSign
    }
  ]);

  // AI Recommendations
  const [aiRecommendations, setAIRecommendations] = useState<AIRecommendation[]>([
    {
      id: 'ai-1',
      type: 'product',
      algorithm: 'Collaborative Filtering',
      accuracy: 87.5,
      ctr: 12.4,
      conversionRate: 18.2,
      revenue: 285000,
      enabled: true
    },
    {
      id: 'ai-2',
      type: 'product',
      algorithm: 'Content-Based Filtering',
      accuracy: 82.3,
      ctr: 10.8,
      conversionRate: 15.6,
      revenue: 198000,
      enabled: true
    },
    {
      id: 'ai-3',
      type: 'user',
      algorithm: 'User Similarity',
      accuracy: 79.8,
      ctr: 14.2,
      conversionRate: 12.4,
      revenue: 142000,
      enabled: true
    },
    {
      id: 'ai-4',
      type: 'content',
      algorithm: 'Deep Learning (Neural Net)',
      accuracy: 91.2,
      ctr: 16.5,
      conversionRate: 22.3,
      revenue: 347000,
      enabled: false
    }
  ]);

  // Live Shopping Events
  const [liveEvents, setLiveEvents] = useState<LiveShoppingEvent[]>([
    {
      id: 'live-1',
      title: 'Fashion Week Special',
      host: 'StyleGuru',
      scheduledTime: '2026-02-26 8:00 PM',
      viewers: 0,
      sales: 0,
      revenue: 0,
      status: 'upcoming',
      products: 24
    },
    {
      id: 'live-2',
      title: 'Tech Tuesday Deals',
      host: 'TechReviewer',
      scheduledTime: '2026-02-25 7:00 PM',
      viewers: 2847,
      sales: 324,
      revenue: 412000,
      status: 'live',
      products: 18
    },
    {
      id: 'live-3',
      title: 'Beauty Essentials Launch',
      host: 'BeautyQueen',
      scheduledTime: '2026-02-24 9:00 PM',
      viewers: 1842,
      sales: 287,
      revenue: 298000,
      status: 'completed',
      products: 15
    }
  ]);

  // Social Features
  const [socialFeatures, setSocialFeatures] = useState<SocialFeature[]>([
    {
      id: 'social-1',
      name: 'Social Feed Shopping',
      users: 5420,
      engagement: 68.5,
      shareRate: 24.3,
      viralCoefficient: 1.8,
      enabled: true
    },
    {
      id: 'social-2',
      name: 'Stories Shopping',
      users: 3840,
      engagement: 72.4,
      shareRate: 18.7,
      viralCoefficient: 1.4,
      enabled: true
    },
    {
      id: 'social-3',
      name: 'Influencer Partnerships',
      users: 2180,
      engagement: 84.2,
      shareRate: 32.5,
      viralCoefficient: 2.3,
      enabled: true
    },
    {
      id: 'social-4',
      name: 'User Generated Content',
      users: 4560,
      engagement: 58.3,
      shareRate: 28.4,
      viralCoefficient: 1.9,
      enabled: true
    }
  ]);

  // Personalization Rules
  const [personalizationRules, setPersonalizationRules] = useState<PersonalizationRule[]>([
    {
      id: 'rule-1',
      name: 'High-Value Customer Experience',
      condition: 'LTV > ৳10,000',
      action: 'Show premium products + priority support',
      affectedUsers: 847,
      uplift: 24.5,
      enabled: true
    },
    {
      id: 'rule-2',
      name: 'Cart Abandonment Recovery',
      condition: 'Cart abandoned > 24h',
      action: 'Send personalized discount offer',
      affectedUsers: 1284,
      uplift: 18.7,
      enabled: true
    },
    {
      id: 'rule-3',
      name: 'New User Onboarding',
      condition: 'Account age < 7 days',
      action: 'Show trending products + tutorials',
      affectedUsers: 2145,
      uplift: 32.4,
      enabled: true
    },
    {
      id: 'rule-4',
      name: 'Category Affinity',
      condition: 'Browsing history pattern detected',
      action: 'Personalize homepage by category',
      affectedUsers: 6842,
      uplift: 15.8,
      enabled: true
    },
    {
      id: 'rule-5',
      name: 'Time-Based Optimization',
      condition: 'Peak browsing hours (8-10 PM)',
      action: 'Show flash deals + live events',
      affectedUsers: 4523,
      uplift: 28.3,
      enabled: true
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleToggleFeature = (featureId: string) => {
    setGrowthFeatures(prev =>
      prev.map(feature =>
        feature.id === featureId
          ? {
              ...feature,
              status: feature.status === 'active' ? 'disabled' : 'active'
            }
          : feature
      )
    );
    toast.success('Feature status updated');
  };

  const handleToggleAI = (aiId: string) => {
    setAIRecommendations(prev =>
      prev.map(ai => (ai.id === aiId ? { ...ai, enabled: !ai.enabled } : ai))
    );
    toast.success('AI recommendation engine updated');
  };

  const handleTogglePersonalization = (ruleId: string) => {
    setPersonalizationRules(prev =>
      prev.map(rule => (rule.id === ruleId ? { ...rule, enabled: !rule.enabled } : rule))
    );
    toast.success('Personalization rule updated');
  };

  const handleRunAITest = () => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 2000)),
      {
        loading: 'Running AI recommendation accuracy test...',
        success: (data) => {
          setAIRecommendations(prev => prev.map(ai => ({
            ...ai,
            accuracy: Math.min(100, ai.accuracy + (Math.random() * 2))
          })));
          return 'AI accuracy improved by 1.2% after training!';
        },
        error: 'Test failed',
      }
    );
  };

  const handleOptimizePersonalization = (id: string) => {
    toast.promise(
      new Promise((resolve) => setTimeout(resolve, 1500)),
      {
        loading: 'Optimizing personalization model parameters...',
        success: (data) => {
          setPersonalizationRules(prev => prev.map(rule => 
            rule.id === id ? { ...rule, uplift: rule.uplift + (Math.random() * 5) } : rule
          ));
          return 'Model optimized! Conversion uplift projected to increase.';
        },
        error: 'Optimization failed',
      }
    );
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: <Badge className="bg-success">Active</Badge>,
      testing: <Badge className="bg-info">Testing</Badge>,
      planned: <Badge variant="secondary">Planned</Badge>,
      disabled: <Badge variant="outline">Disabled</Badge>,
      upcoming: <Badge className="bg-info">Upcoming</Badge>,
      live: <Badge className="bg-error animate-pulse">● Live</Badge>,
      completed: <Badge variant="secondary">Completed</Badge>
    };
    return variants[status] || <Badge>{status}</Badge>;
  };

  const getImpactBadge = (impact: string) => {
    const variants: Record<string, any> = {
      high: <Badge className="bg-success">High Impact</Badge>,
      medium: <Badge className="bg-warning">Medium Impact</Badge>,
      low: <Badge variant="secondary">Low Impact</Badge>
    };
    return variants[impact] || <Badge>{impact}</Badge>;
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      ai: 'text-primary',
      live: 'text-error',
      social: 'text-info',
      personalization: 'text-success'
    };
    return colors[category] || 'text-muted-foreground';
  };

  if (isInitializing) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Rocket className="w-8 h-8 text-primary" />
            Post-Launch Growth Center
          </h1>
          <p className="text-muted-foreground mt-1">
            Advanced features to accelerate platform growth
          </p>
        </div>

        <div className="flex gap-3">
          <Button variant="outline">
            <BarChart3 className="w-4 h-4 mr-2" />
            View Analytics
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configure Features
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">AI-Driven Revenue</p>
                <p className="text-3xl font-bold mt-1">৳972K</p>
                <Badge className="mt-2 bg-success">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  32.5%
                </Badge>
              </div>
              <Brain className="w-10 h-10 text-primary" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Event Sales</p>
                <p className="text-3xl font-bold mt-1">৳710K</p>
                <Badge className="mt-2 bg-success">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  45.2%
                </Badge>
              </div>
              <Video className="w-10 h-10 text-error" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Social Commerce</p>
                <p className="text-3xl font-bold mt-1">5.4K</p>
                <Badge className="mt-2 bg-success">
                  <ArrowUp className="w-3 h-3 mr-1" />
                  68.3%
                </Badge>
              </div>
              <Share2 className="w-10 h-10 text-info" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Personalization</p>
                <p className="text-3xl font-bold mt-1">+28%</p>
                <Badge className="mt-2 bg-success">Conversion Uplift</Badge>
              </div>
              <Sparkles className="w-10 h-10 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ai">AI Recommendations</TabsTrigger>
          <TabsTrigger value="live">Live Shopping</TabsTrigger>
          <TabsTrigger value="social">Social Commerce</TabsTrigger>
          <TabsTrigger value="personalization">Personalization</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Growth Features Status</CardTitle>
              <CardDescription>Monitor and control advanced platform features</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {growthFeatures.map((feature) => (
                  <div key={feature.id} className="border rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <feature.icon className={`w-6 h-6 ${getCategoryColor(feature.category)}`} />
                        <div>
                          <h3 className="font-semibold">{feature.name}</h3>
                          <p className="text-xs text-muted-foreground mt-1">{feature.description}</p>
                        </div>
                      </div>
                      <Switch
                        checked={feature.status === 'active'}
                        onCheckedChange={() => handleToggleFeature(feature.id)}
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      {getStatusBadge(feature.status)}
                      {getImpactBadge(feature.impact)}
                    </div>

                    {Object.keys(feature.metrics).length > 0 && (
                      <div className="grid grid-cols-2 gap-3 pt-3 border-t">
                        {feature.metrics.engagement !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Engagement</p>
                            <p className="text-lg font-semibold">{feature.metrics.engagement}%</p>
                          </div>
                        )}
                        {feature.metrics.conversion !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Conversion</p>
                            <p className="text-lg font-semibold">{feature.metrics.conversion}%</p>
                          </div>
                        )}
                        {feature.metrics.revenue !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Revenue</p>
                            <p className="text-lg font-semibold">৳{(feature.metrics.revenue / 1000).toFixed(0)}K</p>
                          </div>
                        )}
                        {feature.metrics.adoption !== undefined && (
                          <div>
                            <p className="text-xs text-muted-foreground">Adoption</p>
                            <p className="text-lg font-semibold">{feature.metrics.adoption}%</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Alert>
            <Sparkles className="h-4 w-4" />
            <AlertTitle>Growth Performance</AlertTitle>
            <AlertDescription>
              Advanced features are driving 47% of total revenue and 68% of user engagement. Keep optimizing!
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* AI Recommendations Tab */}
        <TabsContent value="ai" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>AI Recommendation Engines</span>
                <Button size="sm" variant="outline" onClick={handleRunAITest}>
                  <Brain className="w-4 h-4 mr-2 text-primary" />
                  Run Accuracy Test
                </Button>
              </CardTitle>
              <CardDescription>Machine learning powered personalization</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiRecommendations.map((ai) => (
                  <div key={ai.id} className="border rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{ai.algorithm}</h3>
                          <Badge variant={ai.enabled ? 'default' : 'secondary'}>
                            {ai.enabled ? 'Enabled' : 'Disabled'}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">Type: {ai.type}</p>
                      </div>
                      <Switch checked={ai.enabled} onCheckedChange={() => handleToggleAI(ai.id)} />
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Accuracy</p>
                        <p className="text-xl font-semibold text-success">{ai.accuracy}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">CTR</p>
                        <p className="text-xl font-semibold">{ai.ctr}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Conversion</p>
                        <p className="text-xl font-semibold">{ai.conversionRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-xl font-semibold">৳{(ai.revenue / 1000).toFixed(0)}K</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Progress value={ai.enabled ? 100 : 0} className="mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total AI Revenue</p>
                    <p className="text-3xl font-bold mt-2">৳972K</p>
                    <p className="text-xs text-success mt-1">+32.5% vs baseline</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Recommendations Shown</p>
                    <p className="text-3xl font-bold mt-2">2.4M</p>
                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Avg Click-Through</p>
                    <p className="text-3xl font-bold mt-2">13.5%</p>
                    <p className="text-xs text-success mt-1">+2.3% improvement</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>AI Model Performance</CardTitle>
              <CardDescription>Training and optimization metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Model Training Progress</span>
                    <span className="text-sm font-semibold">87%</span>
                  </div>
                  <Progress value={87} />
                  <p className="text-xs text-muted-foreground mt-1">Next update in 2 days</p>
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Data Quality Score</span>
                    <span className="text-sm font-semibold">94%</span>
                  </div>
                  <Progress value={94} className="bg-success" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Feature Coverage</span>
                    <span className="text-sm font-semibold">78%</span>
                  </div>
                  <Progress value={78} />
                  <p className="text-xs text-muted-foreground mt-1">Training on 2.3M user interactions</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Live Shopping Tab */}
        <TabsContent value="live" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Shopping Events</CardTitle>
                  <CardDescription>Interactive real-time shopping experiences</CardDescription>
                </div>
                <Button>
                  <PlayCircle className="w-4 h-4 mr-2" />
                  Schedule Event
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {liveEvents.map((event) => (
                  <div
                    key={event.id}
                    className={`border rounded-2xl p-4 ${
                      event.status === 'live' ? 'border-error/50 bg-error/5' : ''
                    }`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{event.title}</h3>
                          {getStatusBadge(event.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Host: {event.host} • {event.scheduledTime}
                        </p>
                      </div>
                      {event.status === 'live' && (
                        <Button size="sm">
                          <Eye className="w-4 h-4 mr-2" />
                          Watch
                        </Button>
                      )}
                      {event.status === 'upcoming' && (
                        <Button size="sm" variant="outline">
                          <Calendar className="w-4 h-4 mr-2" />
                          Remind Me
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Viewers</p>
                        <p className="text-xl font-semibold">{event.viewers.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Sales</p>
                        <p className="text-xl font-semibold">{event.sales.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                        <p className="text-xl font-semibold text-success">
                          ৳{(event.revenue / 1000).toFixed(0)}K
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Products</p>
                        <p className="text-xl font-semibold">{event.products}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Total Live Revenue</p>
                    <p className="text-3xl font-bold mt-2">৳710K</p>
                    <p className="text-xs text-success mt-1">+45.2% growth</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Avg Viewers per Event</p>
                    <p className="text-3xl font-bold mt-2">2,344</p>
                    <p className="text-xs text-muted-foreground mt-1">Last 7 days</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Conversion Rate</p>
                    <p className="text-3xl font-bold mt-2">24.3%</p>
                    <p className="text-xs text-success mt-1">6x higher than standard</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Live Shopping Insights</CardTitle>
              <CardDescription>Performance metrics and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Alert>
                  <TrendingUp className="h-4 w-4" />
                  <AlertTitle>Best Performance Time</AlertTitle>
                  <AlertDescription>
                    Events scheduled for 8-10 PM see 3.2x higher engagement
                  </AlertDescription>
                </Alert>
                <Alert>
                  <Users className="h-4 w-4" />
                  <AlertTitle>Top Performing Host</AlertTitle>
                  <AlertDescription>
                    TechReviewer has 87% viewer retention and ৳412K revenue
                  </AlertDescription>
                </Alert>
                <Alert>
                  <ShoppingBag className="h-4 w-4" />
                  <AlertTitle>Product Strategy</AlertTitle>
                  <AlertDescription>
                    Fashion and electronics categories show highest live conversion rates
                  </AlertDescription>
                </Alert>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Commerce Tab */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Commerce Features</CardTitle>
              <CardDescription>Drive growth through social engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {socialFeatures.map((feature) => (
                  <div key={feature.id} className="border rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {feature.users.toLocaleString()} active users
                        </p>
                      </div>
                      <Switch checked={feature.enabled} />
                    </div>

                    <div className="grid grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Engagement</p>
                        <p className="text-xl font-semibold">{feature.engagement}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Share Rate</p>
                        <p className="text-xl font-semibold">{feature.shareRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Viral Coefficient</p>
                        <p className="text-xl font-semibold text-success">{feature.viralCoefficient}x</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Progress value={feature.enabled ? 100 : 0} className="mt-2" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Social Users</p>
                    <p className="text-3xl font-bold mt-2">5,420</p>
                    <p className="text-xs text-success mt-1">+68.3% growth</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Avg Viral Coefficient</p>
                    <p className="text-3xl font-bold mt-2">1.85x</p>
                    <p className="text-xs text-muted-foreground mt-1">Organic growth multiplier</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Referral Conversions</p>
                    <p className="text-3xl font-bold mt-2">34.2%</p>
                    <p className="text-xs text-success mt-1">2.8x higher than ads</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Personalization Tab */}
        <TabsContent value="personalization" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Personalization Rules</CardTitle>
                  <CardDescription>Adaptive user experience optimization</CardDescription>
                </div>
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Rule
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {personalizationRules.map((rule) => (
                  <div key={rule.id} className="border rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold">{rule.name}</h3>
                          <Badge variant={rule.enabled ? 'default' : 'secondary'}>
                            {rule.enabled ? 'Active' : 'Disabled'}
                          </Badge>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-sm">
                            <span className="text-muted-foreground">When:</span> {rule.condition}
                          </p>
                          <p className="text-sm">
                            <span className="text-muted-foreground">Then:</span> {rule.action}
                          </p>
                        </div>
                      </div>
                      <Switch checked={rule.enabled} onCheckedChange={() => handleTogglePersonalization(rule.id)} />
                    </div>

                    <div className="grid grid-cols-4 gap-4 pt-4 border-t">
                      <div>
                        <p className="text-xs text-muted-foreground">Affected Users</p>
                        <p className="text-xl font-semibold">{rule.affectedUsers.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Conversion Uplift</p>
                        <p className="text-xl font-semibold text-success">+{rule.uplift.toFixed(1)}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Status</p>
                        <Progress value={rule.enabled ? 100 : 0} className="mt-2" />
                      </div>
                      <div className="flex items-center justify-end">
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleOptimizePersonalization(rule.id)}
                          disabled={!rule.enabled}
                        >
                          <Zap className="w-4 h-4 mr-2 text-warning" />
                          Optimize
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Personalized Users</p>
                    <p className="text-3xl font-bold mt-2">6,842</p>
                    <p className="text-xs text-muted-foreground mt-1">78% of active users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Avg Uplift</p>
                    <p className="text-3xl font-bold mt-2">+23.9%</p>
                    <p className="text-xs text-success mt-1">Conversion improvement</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-6">
                    <p className="text-sm text-muted-foreground">Active Rules</p>
                    <p className="text-3xl font-bold mt-2">{personalizationRules.filter(r => r.enabled).length}</p>
                    <p className="text-xs text-muted-foreground mt-1">Out of {personalizationRules.length} total</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Personalization Impact</CardTitle>
              <CardDescription>How personalization affects key metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Engagement Rate</span>
                    <span className="text-sm font-semibold">+34.2%</span>
                  </div>
                  <Progress value={84} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Session Duration</span>
                    <span className="text-sm font-semibold">+28.5%</span>
                  </div>
                  <Progress value={78} />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Purchase Intent</span>
                    <span className="text-sm font-semibold">+42.8%</span>
                  </div>
                  <Progress value={92} className="bg-success" />
                </div>
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm">Customer Satisfaction</span>
                    <span className="text-sm font-semibold">+18.7%</span>
                  </div>
                  <Progress value={68} />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
