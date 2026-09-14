import { SEO } from '../components/SEO';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Users, DollarSign, TrendingUp, Share2, Copy, CheckCircle2, Eye, Calendar, Filter } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Skeleton } from '../components/ui/skeleton';

// Mock campaign data
const mockCampaigns = [
  {
    id: '1',
    code: 'EMMA2026',
    name: 'New Year Campaign',
    clicks: 245,
    conversions: 18,
    earnings: 32.40,
    date: '2026-01-10',
    status: 'active'
  },
  {
    id: '2',
    code: 'WINTER10',
    name: 'Winter Sale',
    clicks: 189,
    conversions: 12,
    earnings: 21.60,
    date: '2026-01-09',
    status: 'completed'
  }
];

// Mock referral tracking data
const mockReferrals = [
  { 
    name: 'Sarah Johnson', 
    email: 'sarah@example.com', 
    joined: '2026-01-15', 
    status: 'Active',
    purchases: 3,
    earnings: 15.00
  },
  { 
    name: 'Mike Chen', 
    email: 'mike@example.com', 
    joined: '2026-01-12', 
    status: 'Active',
    purchases: 2,
    earnings: 10.00
  },
  { 
    name: 'Emma Williams', 
    email: 'emma@example.com', 
    joined: '2026-01-10', 
    status: 'Pending',
    purchases: 0,
    earnings: 0
  }
];

export default function ReferralTrackingPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [referralCode, setReferralCode] = useState('EMMAREF2024');
  const [copied, setCopied] = useState(false);
  const [timeFilter, setTimeFilter] = useState('all');
  const [stats, setStats] = useState({
    totalEarnings: 0,
    totalClicks: 0,
    totalConversions: 0,
    conversionRate: '0.0',
    activeReferrals: 0
  });
  const [referrals, setReferrals] = useState<any[]>([]);

  const referralLink = `https://ezyify.com/ref/${referralCode}`;

  // Load referral data progressively
  useEffect(() => {
    const loadReferralData = () => {
      // Load stats
      const totalEarnings = 154.30;
      const totalClicks = 1245;
      const totalConversions = 87;
      const conversionRate = ((totalConversions / totalClicks) * 100).toFixed(1);
      const activeReferrals = 24;
      
      setStats({
        totalEarnings,
        totalClicks,
        totalConversions,
        conversionRate,
        activeReferrals
      });
      
      // Load referrals list
      setReferrals(mockReferrals);
      
      setIsLoading(false);
    };

    // Progressive loading: Use requestIdleCallback for non-critical work
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadReferralData(), { timeout: 100 });
    } else {
      setTimeout(loadReferralData, 0);
    }
  }, []);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (<div className="min-h-screen bg-background">
      <SEO title="Referral Program — Ezyify" description="Track your referrals and earnings through the Ezyify referral program." />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-semibold text-foreground">Referral Tracking</h1>
          <p className="text-muted-foreground">Monitor your affiliate performance and earnings</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Earnings</p>
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">${isLoading ? <Skeleton className="w-16" /> : stats.totalEarnings.toLocaleString()}</h2>
              <p className="text-xs text-muted-foreground">From affiliate links</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Total Clicks</p>
                <Eye className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">{isLoading ? <Skeleton className="w-16" /> : stats.totalClicks.toLocaleString()}</h2>
              <p className="text-xs text-muted-foreground">Link impressions</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Conversions</p>
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">{isLoading ? <Skeleton className="w-16" /> : stats.totalConversions}</h2>
              <p className="text-xs text-muted-foreground">{isLoading ? <Skeleton className="w-16" /> : stats.conversionRate}% conversion rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-sm text-muted-foreground">Active Referrals</p>
                <Users className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold mb-1">{isLoading ? <Skeleton className="w-16" /> : stats.activeReferrals}</h2>
              <p className="text-xs text-muted-foreground">Currently tracking</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Link Card */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="mb-1">Your Referral Link</h2>
                <p className="text-sm text-muted-foreground">Share this link to earn commission on Ezyify</p>
              </div>
              <Link to="/affiliate-rules">
                <Button variant="outline" size="sm">
                  View Rules
                </Button>
              </Link>
            </div>
            
            <div className="flex gap-3">
              <Input
                value={referralLink}
                readOnly
                className="font-mono text-sm"
              />
              <Button onClick={handleCopyLink} className="flex-shrink-0">
                {copied ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
            </div>

            <div className="mt-4 p-4 bg-muted rounded-xl">
              <p className="text-sm text-foreground">
                <strong>Remember:</strong> Earnings only apply when users engage and purchase inside Ezyify.
                External sharing is allowed but does not generate commission.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Referral Performance */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2>Referral Performance</h2>
              <div className="flex gap-3">
                <Select value={timeFilter} onValueChange={setTimeFilter}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4">
                <TabsTrigger value="all">All Referrals</TabsTrigger>
                <TabsTrigger value="products">Products</TabsTrigger>
                <TabsTrigger value="users">User Referrals</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                      <Skeleton className="w-16 h-16 rounded-xl flex-shrink-0" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))
                ) : (
                  referrals.map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-accent transition-colors"
                    >
                      <img
                      loading="lazy"
                        src={referral.image}
                        alt={referral.name}
                        className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <p className="font-medium truncate">{referral.name}</p>
                          <Badge variant={referral.status === 'active' ? 'default' : 'secondary'}>
                            {referral.status}
                          </Badge>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{referral.clicks} clicks</span>
                          <span>{referral.conversions} conversions</span>
                          <span>{referral.date}</span>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="font-medium text-primary">
                          ${referral.earnings.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">earned</p>
                      </div>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="products" className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-40 mb-2" />
                        <div className="flex gap-4">
                          <Skeleton className="h-4 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))
                ) : (
                  referrals.filter(r => r.type === 'product').map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-accent transition-colors"
                    >
                      <img
                      loading="lazy"
                        src={referral.image}
                        alt={referral.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium mb-1">{referral.name}</p>
                        <div className="flex gap-4 text-sm text-muted-foreground">
                          <span>{referral.clicks} clicks</span>
                          <span>{referral.conversions} conversions</span>
                        </div>
                      </div>
                      <p className="font-medium text-primary">
                        ${referral.earnings.toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </TabsContent>

              <TabsContent value="users" className="space-y-3">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center gap-4 p-4 bg-muted rounded-xl">
                      <Skeleton className="w-16 h-16 rounded-xl" />
                      <div className="flex-1">
                        <Skeleton className="h-5 w-32 mb-2" />
                        <Skeleton className="h-4 w-24" />
                      </div>
                      <Skeleton className="h-6 w-16" />
                    </div>
                  ))
                ) : (
                  referrals.filter(r => r.type === 'user').map((referral) => (
                    <div
                      key={referral.id}
                      className="flex items-center gap-4 p-4 bg-muted rounded-xl hover:bg-accent transition-colors"
                    >
                      <img
                      loading="lazy"
                        src={referral.image}
                        alt={referral.name}
                        className="w-16 h-16 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <p className="font-medium mb-1">{referral.name}</p>
                        <p className="text-sm text-muted-foreground">{referral.date}</p>
                      </div>
                      <p className="font-medium text-primary">
                        ${referral.earnings.toLocaleString()}
                      </p>
                    </div>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="mt-8">
          <CardContent className="p-6">
            <h3 className="mb-4">Tips to Maximize Your Earnings</h3>
            <ul className="space-y-3 text-sm text-foreground">
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Share products you genuinely love and have experience with</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Create engaging content (posts, loops, stories) featuring the products</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Share products inside Ezyify for commission tracking</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Build trust with your followers through authentic recommendations</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                <span>Track your performance and optimize based on what works</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}