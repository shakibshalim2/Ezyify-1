import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '../../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Skeleton } from '../../components/ui/skeleton';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Switch } from '../../components/ui/switch';
import {
  TrendingUp,
  Users,
  Share2,
  Gift,
  Target,
  Zap,
  Globe,
  Mail,
  MessageCircle,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Send,
  Eye,
  MousePointer,
  DollarSign,
  ArrowUp,
  ArrowDown,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  UserPlus,
  Heart,
  ShoppingBag,
  Crown,
  Award,
  Megaphone,
  BarChart3,
  PieChart,
  LineChart,
  Filter,
  Download,
  RefreshCw,
  Settings,
  Link as LinkIcon,
  Copy,
  ExternalLink,
  CalendarDays,
  Clock,
  TrendingDown
} from 'lucide-react';
import { toast } from 'sonner';

interface MetricCard {
  id: string;
  name: string;
  value: string | number;
  change: number;
  changeType: 'up' | 'down';
  icon: any;
  color: string;
}

interface Campaign {
  id: string;
  name: string;
  type: 'social' | 'email' | 'referral' | 'paid' | 'organic';
  status: 'active' | 'paused' | 'completed' | 'scheduled';
  reach: number;
  clicks: number;
  conversions: number;
  spend: number;
  roi: number;
  startDate: string;
  endDate?: string;
}

interface ReferralProgram {
  id: string;
  name: string;
  reward: string;
  conversions: number;
  totalReward: number;
  topReferrers: Array<{
    name: string;
    referrals: number;
    earned: number;
  }>;
}

interface LandingPageMetric {
  id: string;
  variant: string;
  visitors: number;
  signups: number;
  conversionRate: number;
  bounceRate: number;
  avgTimeOnPage: number;
  isControl: boolean;
}

interface SocialIntegration {
  id: string;
  platform: string;
  connected: boolean;
  followers: number;
  engagement: number;
  lastPost?: string;
  scheduledPosts: number;
}

export default function MarketingAcquisitionHub() {
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDateRange, setSelectedDateRange] = useState('7d');

  // Marketing metrics
  const [metrics, setMetrics] = useState<MetricCard[]>([
    {
      id: 'visitors',
      name: 'Total Visitors',
      value: '12,458',
      change: 23.5,
      changeType: 'up',
      icon: Eye,
      color: 'text-info'
    },
    {
      id: 'signups',
      name: 'New Signups',
      value: '3,247',
      change: 18.2,
      changeType: 'up',
      icon: UserPlus,
      color: 'text-success'
    },
    {
      id: 'conversions',
      name: 'Conversions',
      value: '1,856',
      change: 12.8,
      changeType: 'up',
      icon: ShoppingBag,
      color: 'text-primary'
    },
    {
      id: 'cac',
      name: 'CAC (Avg)',
      value: '৳285',
      change: -8.4,
      changeType: 'down',
      icon: DollarSign,
      color: 'text-warning'
    },
    {
      id: 'ltv',
      name: 'LTV (Avg)',
      value: '৳2,450',
      change: 15.3,
      changeType: 'up',
      icon: TrendingUp,
      color: 'text-success'
    },
    {
      id: 'referrals',
      name: 'Referrals',
      value: '847',
      change: 34.6,
      changeType: 'up',
      icon: Gift,
      color: 'text-like'
    }
  ]);

  // Active campaigns
  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: 'camp-1',
      name: 'Launch Week Social Blitz',
      type: 'social',
      status: 'active',
      reach: 125000,
      clicks: 8500,
      conversions: 1250,
      spend: 15000,
      roi: 3.2,
      startDate: '2026-02-20',
      endDate: '2026-02-27'
    },
    {
      id: 'camp-2',
      name: 'Influencer Partnership - Tech Reviewers',
      type: 'paid',
      status: 'active',
      reach: 85000,
      clicks: 5200,
      conversions: 890,
      spend: 25000,
      roi: 2.8,
      startDate: '2026-02-22'
    },
    {
      id: 'camp-3',
      name: 'Email - Beta User Activation',
      type: 'email',
      status: 'completed',
      reach: 5000,
      clicks: 2100,
      conversions: 650,
      spend: 0,
      roi: 999,
      startDate: '2026-02-15',
      endDate: '2026-02-20'
    },
    {
      id: 'camp-4',
      name: 'Early Bird Special Offer',
      type: 'organic',
      status: 'active',
      reach: 45000,
      clicks: 3200,
      conversions: 480,
      spend: 0,
      roi: 999,
      startDate: '2026-02-24'
    },
    {
      id: 'camp-5',
      name: 'Creator Program Launch',
      type: 'referral',
      status: 'scheduled',
      reach: 0,
      clicks: 0,
      conversions: 0,
      spend: 0,
      roi: 0,
      startDate: '2026-02-26'
    }
  ]);

  // Referral program
  const [referralProgram, setReferralProgram] = useState<ReferralProgram>({
    id: 'ref-1',
    name: 'Launch Referral Bonus',
    reward: '৳500 credit for referrer + ৳200 for friend',
    conversions: 847,
    totalReward: 423500,
    topReferrers: [
      { name: 'Tasnim Rahman', referrals: 45, earned: 22500 },
      { name: 'Farhan Ahmed', referrals: 38, earned: 19000 },
      { name: 'Nusrat Jahan', referrals: 32, earned: 16000 },
      { name: 'Rafi Khan', referrals: 28, earned: 14000 },
      { name: 'Sadia Islam', referrals: 24, earned: 12000 }
    ]
  });

  // Landing page A/B test
  const [landingPageVariants, setLandingPageVariants] = useState<LandingPageMetric[]>([
    {
      id: 'lp-control',
      variant: 'Control (Original)',
      visitors: 5200,
      signups: 624,
      conversionRate: 12.0,
      bounceRate: 42.5,
      avgTimeOnPage: 145,
      isControl: true
    },
    {
      id: 'lp-variant-a',
      variant: 'Variant A (Video Hero)',
      visitors: 5100,
      signups: 714,
      conversionRate: 14.0,
      bounceRate: 38.2,
      avgTimeOnPage: 185,
      isControl: false
    },
    {
      id: 'lp-variant-b',
      variant: 'Variant B (Social Proof)',
      visitors: 5300,
      signups: 873,
      conversionRate: 16.5,
      bounceRate: 35.8,
      avgTimeOnPage: 210,
      isControl: false
    }
  ]);

  // Social integrations
  const [socialPlatforms, setSocialPlatforms] = useState<SocialIntegration[]>([
    {
      id: 'fb',
      platform: 'Facebook',
      connected: true,
      followers: 12500,
      engagement: 4.2,
      lastPost: '2 hours ago',
      scheduledPosts: 5
    },
    {
      id: 'ig',
      platform: 'Instagram',
      connected: true,
      followers: 8700,
      engagement: 6.8,
      lastPost: '4 hours ago',
      scheduledPosts: 7
    },
    {
      id: 'tw',
      platform: 'Twitter',
      connected: true,
      followers: 5400,
      engagement: 3.5,
      lastPost: '1 hour ago',
      scheduledPosts: 12
    },
    {
      id: 'yt',
      platform: 'YouTube',
      connected: false,
      followers: 0,
      engagement: 0,
      scheduledPosts: 0
    },
    {
      id: 'tiktok',
      platform: 'TikTok',
      connected: false,
      followers: 0,
      engagement: 0,
      scheduledPosts: 0
    }
  ]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitializing(false);
    }, 800);
    return () => clearTimeout(timer);
  }, []);

  const handleCampaignAction = (campaignId: string, action: 'pause' | 'resume' | 'stop') => {
    setCampaigns(prev => prev.map(camp =>
      camp.id === campaignId
        ? {
            ...camp,
            status: action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'completed'
          }
        : camp
    ));
    toast.success(`Campaign ${action}d successfully`);
  };

  const handleConnectSocial = (platformId: string) => {
    setSocialPlatforms(prev => prev.map(platform =>
      platform.id === platformId
        ? { ...platform, connected: true }
        : platform
    ));
    toast.success('Social platform connected successfully');
  };

  const handleGenerateReferralLink = () => {
    const link = 'https://ezyify.com/ref/USER123';
    navigator.clipboard.writeText(link);
    toast.success('Referral link copied to clipboard!', {
      description: link
    });
  };

  const handleSimulateReferrals = () => {
    setReferralProgram(prev => ({
      ...prev,
      conversions: prev.conversions + 100,
      totalReward: prev.totalReward + (100 * 500),
      topReferrers: prev.topReferrers.map((ref, idx) => 
        idx === 0 ? { ...ref, referrals: ref.referrals + 10, earned: ref.earned + 5000 } : ref
      )
    }));
    toast.success('Simulated 100 successful referrals!', {
      description: 'Metrics updated across the hub.'
    });
  };

  const getCampaignTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      social: Share2,
      email: Mail,
      referral: Gift,
      paid: Target,
      organic: Sparkles
    };
    return icons[type] || Activity;
  };

  const getCampaignTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      social: 'text-info',
      email: 'text-primary',
      referral: 'text-like',
      paid: 'text-warning',
      organic: 'text-success'
    };
    return colors[type] || 'text-muted-foreground';
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, any> = {
      active: <Badge className="bg-success">Active</Badge>,
      paused: <Badge className="bg-warning">Paused</Badge>,
      completed: <Badge variant="secondary">Completed</Badge>,
      scheduled: <Badge className="bg-info">Scheduled</Badge>
    };
    return variants[status] || <Badge>{status}</Badge>;
  };

  if (isInitializing) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <Skeleton className="h-20 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
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
            <Megaphone className="w-8 h-8 text-info" />
            Marketing & User Acquisition Hub
          </h1>
          <p className="text-muted-foreground mt-1">
            Drive growth and optimize user acquisition
          </p>
        </div>

        <div className="flex gap-3">
          <select
            value={selectedDateRange}
            onChange={(e) => setSelectedDateRange(e.target.value)}
            className="px-4 py-2 border rounded-xl"
          >
            <option value="24h">Last 24 hours</option>
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <Button variant="outline" onClick={handleExportData}>
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {metrics.map((metric) => (
          <Card key={metric.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <metric.icon className={`w-5 h-5 ${metric.color}`} />
                <Badge variant={metric.changeType === 'up' ? 'default' : 'secondary'}>
                  {metric.changeType === 'up' ? (
                    <ArrowUp className="w-3 h-3 mr-1" />
                  ) : (
                    <ArrowDown className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(metric.change)}%
                </Badge>
              </div>
              <p className="text-2xl font-bold">{metric.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{metric.name}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="landing">Landing Page</TabsTrigger>
          <TabsTrigger value="social">Social Media</TabsTrigger>
          <TabsTrigger value="referral">Referral</TabsTrigger>
          <TabsTrigger value="beta">Beta Onboarding</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Acquisition Funnel</CardTitle>
                <CardDescription>User journey from visitor to customer</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Visitors</span>
                      <span className="text-sm font-semibold">12,458</span>
                    </div>
                    <Progress value={100} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Signups</span>
                      <span className="text-sm font-semibold">3,247 (26%)</span>
                    </div>
                    <Progress value={26} />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">Activated Users</span>
                      <span className="text-sm font-semibold">2,156 (66%)</span>
                    </div>
                    <Progress value={17.3} className="bg-info" />
                  </div>
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm">First Purchase</span>
                      <span className="text-sm font-semibold">1,856 (86%)</span>
                    </div>
                    <Progress value={14.9} className="bg-success" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Traffic Sources</CardTitle>
                <CardDescription>Where your users are coming from</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-info" />
                      <span className="text-sm">Social Media</span>
                    </div>
                    <span className="text-sm font-semibold">35%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-success" />
                      <span className="text-sm">Organic Search</span>
                    </div>
                    <span className="text-sm font-semibold">28%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-purple-500" />
                      <span className="text-sm">Direct</span>
                    </div>
                    <span className="text-sm font-semibold">18%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-pink-500" />
                      <span className="text-sm">Referral</span>
                    </div>
                    <span className="text-sm font-semibold">12%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full bg-warning" />
                      <span className="text-sm">Paid Ads</span>
                    </div>
                    <span className="text-sm font-semibold">7%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Campaign Performance Summary</CardTitle>
              <CardDescription>Overview of all active campaigns</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {campaigns.filter(c => c.status === 'active').map(campaign => (
                  <div key={campaign.id} className="flex items-center justify-between p-3 border rounded-xl">
                    <div className="flex items-center gap-3">
                      {(() => {
                        const Icon = getCampaignTypeIcon(campaign.type);
                        return <Icon className={`w-5 h-5 ${getCampaignTypeColor(campaign.type)}`} />;
                      })()}
                      <div>
                        <p className="font-medium">{campaign.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {campaign.reach.toLocaleString()} reach • {campaign.conversions} conversions
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-success">{campaign.roi.toFixed(1)}x ROI</p>
                      <p className="text-xs text-muted-foreground">৳{campaign.spend.toLocaleString()} spent</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Marketing Campaigns</CardTitle>
                  <CardDescription>Manage all your marketing campaigns</CardDescription>
                </div>
                <Button>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {campaigns.map(campaign => (
                  <div key={campaign.id} className="border rounded-2xl p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {(() => {
                          const Icon = getCampaignTypeIcon(campaign.type);
                          return <Icon className={`w-6 h-6 ${getCampaignTypeColor(campaign.type)} mt-1`} />;
                        })()}
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="font-semibold">{campaign.name}</h3>
                            {getStatusBadge(campaign.status)}
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            {campaign.startDate} {campaign.endDate && `- ${campaign.endDate}`}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {campaign.status === 'active' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleCampaignAction(campaign.id, 'pause')}
                          >
                            Pause
                          </Button>
                        )}
                        {campaign.status === 'paused' && (
                          <Button
                            size="sm"
                            onClick={() => handleCampaignAction(campaign.id, 'resume')}
                          >
                            Resume
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <BarChart3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Reach</p>
                        <p className="text-lg font-semibold">{campaign.reach.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Clicks</p>
                        <p className="text-lg font-semibold">{campaign.clicks.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Conversions</p>
                        <p className="text-lg font-semibold">{campaign.conversions.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Spend</p>
                        <p className="text-lg font-semibold">
                          {campaign.spend > 0 ? `৳${campaign.spend.toLocaleString()}` : 'Free'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">ROI</p>
                        <p className="text-lg font-semibold text-success">
                          {campaign.roi === 999 ? '∞' : `${campaign.roi.toFixed(1)}x`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Landing Page Tab */}
        <TabsContent value="landing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Landing Page A/B Testing</CardTitle>
              <CardDescription>Compare performance of different landing page variants</CardDescription>
            </CardHeader>
            <CardContent>
              <Alert className="mb-4">
                <Sparkles className="h-4 w-4" />
                <AlertTitle>Variant B is the winner!</AlertTitle>
                <AlertDescription>
                  Variant B has a 37.5% higher conversion rate than control. Consider making it the default.
                </AlertDescription>
              </Alert>

              <div className="space-y-3">
                {landingPageVariants.map(variant => (
                  <div
                    key={variant.id}
                    className={`border rounded-2xl p-4 ${
                      variant.conversionRate === Math.max(...landingPageVariants.map(v => v.conversionRate))
                        ? 'border-success/50 bg-success/5'
                        : ''
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{variant.variant}</h3>
                        {variant.isControl && <Badge variant="secondary">Control</Badge>}
                        {variant.conversionRate === Math.max(...landingPageVariants.map(v => v.conversionRate)) && (
                          <Badge className="bg-success">
                            <Crown className="w-3 h-3 mr-1" />
                            Winner
                          </Badge>
                        )}
                      </div>
                      <Button size="sm" variant="outline">
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </Button>
                    </div>

                    <div className="grid grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground">Visitors</p>
                        <p className="text-xl font-semibold">{variant.visitors.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Signups</p>
                        <p className="text-xl font-semibold">{variant.signups.toLocaleString()}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Conversion Rate</p>
                        <p className="text-xl font-semibold text-success">{variant.conversionRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Bounce Rate</p>
                        <p className="text-xl font-semibold">{variant.bounceRate}%</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Avg Time</p>
                        <p className="text-xl font-semibold">{variant.avgTimeOnPage}s</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex gap-3">
                <Button className="flex-1">
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Set Winner as Default
                </Button>
                <Button variant="outline">
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create New Variant
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Landing Page Optimization Tools</CardTitle>
              <CardDescription>Quick actions to improve conversion</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Zap className="w-5 h-5 text-warning" />
                      <p className="font-semibold">Speed Optimization</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Optimize images and scripts for faster loading
                    </p>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Target className="w-5 h-5 text-info" />
                      <p className="font-semibold">CTA Analysis</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Heat maps and click tracking for CTAs
                    </p>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-5 h-5 text-primary" />
                      <p className="font-semibold">Social Proof</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Add testimonials and trust badges
                    </p>
                  </div>
                </Button>

                <Button variant="outline" className="h-auto p-4 justify-start">
                  <div className="text-left">
                    <div className="flex items-center gap-2 mb-1">
                      <Globe className="w-5 h-5 text-success" />
                      <p className="font-semibold">SEO Optimization</p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Meta tags and schema markup
                    </p>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Social Media Tab */}
        <TabsContent value="social" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Social Media Integrations</CardTitle>
              <CardDescription>Connect and manage your social media presence</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {socialPlatforms.map(platform => (
                  <div key={platform.id} className="border rounded-2xl p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {platform.platform === 'Facebook' && <Facebook className="w-6 h-6 text-info" />}
                        {platform.platform === 'Instagram' && <Instagram className="w-6 h-6 text-like" />}
                        {platform.platform === 'Twitter' && <Twitter className="w-6 h-6 text-info" />}
                        {platform.platform === 'YouTube' && <Youtube className="w-6 h-6 text-error" />}
                        {platform.platform === 'TikTok' && <Activity className="w-6 h-6" />}
                        <div>
                          <p className="font-semibold">{platform.platform}</p>
                          {platform.connected ? (
                            <Badge className="bg-success mt-1">Connected</Badge>
                          ) : (
                            <Badge variant="secondary" className="mt-1">Not Connected</Badge>
                          )}
                        </div>
                      </div>
                      {!platform.connected ? (
                        <Button size="sm" onClick={() => handleConnectSocial(platform.id)}>
                          <LinkIcon className="w-4 h-4 mr-2" />
                          Connect
                        </Button>
                      ) : (
                        <Button size="sm" variant="outline">
                          <Settings className="w-4 h-4" />
                        </Button>
                      )}
                    </div>

                    {platform.connected && (
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Followers</span>
                          <span className="font-semibold">{platform.followers.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Engagement Rate</span>
                          <span className="font-semibold">{platform.engagement}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Last Post</span>
                          <span className="font-semibold">{platform.lastPost}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Scheduled Posts</span>
                          <span className="font-semibold">{platform.scheduledPosts}</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Content Calendar</CardTitle>
              <CardDescription>Plan and schedule your social media posts</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Alert>
                  <CalendarDays className="h-4 w-4" />
                  <AlertTitle>24 posts scheduled this week</AlertTitle>
                  <AlertDescription>
                    Next post: "Ezyify Launch Day!" scheduled for Feb 25, 2026 at 9:00 AM
                  </AlertDescription>
                </Alert>

                <Button className="w-full">
                  <Send className="w-4 h-4 mr-2" />
                  Schedule New Post
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Referral Tab */}
        <TabsContent value="referral" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Referral Program</span>
                <Button size="sm" variant="outline" onClick={handleSimulateReferrals}>
                  <Zap className="w-4 h-4 mr-2 text-warning" />
                  Simulate 100 Referrals
                </Button>
              </CardTitle>
              <CardDescription>{referralProgram.name}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <Alert>
                  <Gift className="h-4 w-4" />
                  <AlertTitle>Launch Special Reward</AlertTitle>
                  <AlertDescription>{referralProgram.reward}</AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground">Total Referrals</p>
                      <p className="text-3xl font-bold mt-2">{referralProgram.conversions}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground">Total Rewards</p>
                      <p className="text-3xl font-bold mt-2">৳{referralProgram.totalReward.toLocaleString()}</p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-6">
                      <p className="text-sm text-muted-foreground">Conversion Rate</p>
                      <p className="text-3xl font-bold mt-2">34.2%</p>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Your Referral Link</h3>
                  <div className="flex gap-2">
                    <Input value="https://ezyify.com/ref/USER123" readOnly />
                    <Button onClick={handleGenerateReferralLink}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold mb-3">Top Referrers</h3>
                  <div className="space-y-2">
                    {referralProgram.topReferrers.map((referrer, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 border rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold" style={{ background: "var(--brand-gradient)" }}>
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="font-medium">{referrer.name}</p>
                            <p className="text-xs text-muted-foreground">{referrer.referrals} referrals</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-success">৳{referrer.earned.toLocaleString()}</p>
                          <p className="text-xs text-muted-foreground">earned</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Beta Onboarding Tab */}
        <TabsContent value="beta" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Beta User Onboarding</CardTitle>
              <CardDescription>Manage early adopter program and feedback collection</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Beta Users</p>
                          <p className="text-3xl font-bold mt-1">1,247</p>
                        </div>
                        <Users className="w-8 h-8 text-info" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Active Rate</p>
                          <p className="text-3xl font-bold mt-1">87%</p>
                        </div>
                        <Activity className="w-8 h-8 text-success" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Feedback</p>
                          <p className="text-3xl font-bold mt-1">342</p>
                        </div>
                        <MessageCircle className="w-8 h-8 text-primary" />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">NPS Score</p>
                          <p className="text-3xl font-bold mt-1">72</p>
                        </div>
                        <Award className="w-8 h-8 text-warning" />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Alert>
                  <CheckCircle2 className="h-4 w-4" />
                  <AlertTitle>Beta Program Status</AlertTitle>
                  <AlertDescription>
                    87% of beta users have completed onboarding and 72% are actively using the platform daily
                  </AlertDescription>
                </Alert>

                <div>
                  <h3 className="font-semibold mb-3">Beta Onboarding Funnel</h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Invited</span>
                        <span className="text-sm font-semibold">1,500 (100%)</span>
                      </div>
                      <Progress value={100} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Signed Up</span>
                        <span className="text-sm font-semibold">1,247 (83%)</span>
                      </div>
                      <Progress value={83} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">Completed Profile</span>
                        <span className="text-sm font-semibold">1,156 (93%)</span>
                      </div>
                      <Progress value={77} />
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm">First Action</span>
                        <span className="text-sm font-semibold">1,089 (94%)</span>
                      </div>
                      <Progress value={72.6} className="bg-success" />
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <Button className="flex-1">
                    <UserPlus className="w-4 h-4 mr-2" />
                    Invite More Beta Users
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <MessageCircle className="w-4 h-4 mr-2" />
                    Collect Feedback
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
