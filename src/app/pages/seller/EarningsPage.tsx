import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { Link } from 'react-router';
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Download, 
  Calendar,
  ArrowUpRight,
  Eye,
  Shield
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { SellerLayout } from '../../components/SellerLayout';

type Earning = {
  id: string;
  type: 'sale' | 'commission' | 'referral';
  source: string;
  amount: number;
  status: 'completed' | 'pending' | 'processing';
  date: string;
  orderId?: string;
};

const mockEarnings: Earning[] = [
  {
    id: '1',
    type: 'sale',
    source: 'Premium Wireless Headphones',
    amount: 24.50,
    status: 'completed',
    date: '2 hours ago',
    orderId: '#ORD-2024-0123'
  },
  {
    id: '2',
    type: 'commission',
    source: 'Referral Commission - Electronics',
    amount: 8.90,
    status: 'pending',
    date: '5 hours ago'
  },
  {
    id: '3',
    type: 'sale',
    source: 'Smart Watch Pro',
    amount: 32.00,
    status: 'completed',
    date: '1 day ago',
    orderId: '#ORD-2024-0122'
  },
  {
    id: '4',
    type: 'referral',
    source: 'New Seller Referral',
    amount: 5.00,
    status: 'processing',
    date: '2 days ago'
  },
  {
    id: '5',
    type: 'sale',
    source: 'Bluetooth Speaker',
    amount: 18.50,
    status: 'completed',
    date: '3 days ago',
    orderId: '#ORD-2024-0121'
  },
  {
    id: '6',
    type: 'commission',
    source: 'Affiliate Commission - Fashion',
    amount: 12.00,
    status: 'completed',
    date: '4 days ago'
  }
];

export default function EarningsPage() {
  const [timeFilter, setTimeFilter] = useState('all');

  const totalEarnings = 487.50;
  const pendingEarnings = 124.50;
  const availableBalance = 363.00;
  const thisMonthEarnings = 83.70;
  const lastMonthEarnings = 65.40;
  const growthRate = ((thisMonthEarnings - lastMonthEarnings) / lastMonthEarnings * 100).toFixed(1);

  const getEarningIcon = (type: Earning['type']) => {
    switch (type) {
      case 'sale':
        return <DollarSign className="w-4 h-4 text-success" />;
      case 'commission':
        return <DollarSign className="w-4 h-4 text-info" />;
      case 'referral':
        return <TrendingUp className="w-4 h-4 text-primary" />;
    }
  };

  const getStatusBadge = (status: Earning['status']) => {
    const variants = {
      completed: 'default',
      pending: 'secondary',
      processing: 'outline'
    } as const;
    
    return <Badge variant={variants[status]}>{status}</Badge>;
  };

  return (
    <SellerLayout>
      <div className="max-w-screen-xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 pb-4 sm:pb-6 md:pb-8">
      <SEO title="Earnings — Ezyify Seller" description="View your earnings, commissions, and payouts on Ezyify." />
        {/* Header */}
        <div className="flex flex-col gap-3 sm:gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="mb-1 sm:mb-2 font-semibold text-foreground">Earnings & Analytics</h1>
            <p className="text-sm text-muted-foreground">Track your revenue and performance</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
            <Button variant="outline" className="w-full sm:w-auto">
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
            <Link to="/seller/withdraw" className="w-full sm:w-auto">
              <Button className="w-full">
                <ArrowUpRight className="w-4 h-4 mr-2" />
                Withdraw
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <Card className="border-success/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Total Earnings</p>
                <div className="w-7 h-7 rounded-xl bg-success/10 flex items-center justify-center">
                  <DollarSign className="w-3.5 h-3.5 text-success" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground tracking-tight">${totalEarnings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">All time · after commission</p>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Available Balance</p>
                <div className="w-7 h-7 rounded-xl bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="w-3.5 h-3.5 text-primary" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground tracking-tight">${availableBalance.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Ready to withdraw</p>
            </CardContent>
          </Card>

          <Card className="border-warning/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">Pending / Escrow</p>
                <div className="w-7 h-7 rounded-xl bg-warning/10 flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5 text-warning" />
                </div>
              </div>
              <p className="text-xl font-bold text-foreground tracking-tight">${pendingEarnings.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-1">Held until delivery confirmed</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs sm:text-sm text-muted-foreground">This Month</p>
                {parseFloat(growthRate) >= 0 ? (
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                ) : (
                  <TrendingDown className="w-4 h-4 sm:w-5 sm:h-5 text-destructive" />
                )}
              </div>
              <h2 className="font-semibold mb-1">${thisMonthEarnings.toLocaleString()}</h2>
              <p className={`text-xs ${parseFloat(growthRate) >= 0 ? 'text-success' : 'text-destructive'}`}>
                {growthRate}% vs last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Earnings Breakdown */}
        <Card className="mb-6 sm:mb-8">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl">Earnings Breakdown</h2>
              <Select value={timeFilter} onValueChange={setTimeFilter}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                  <SelectItem value="year">This Year</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4 sm:mb-6">
              <div className="p-4 bg-success/10 dark:bg-success/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-success" />
                  <p className="text-xs sm:text-sm text-foreground">Product Sales</p>
                </div>
                <p className="font-semibold font-bold text-foreground">$32,450</p>
                <p className="text-xs text-muted-foreground">67% of total</p>
              </div>

              <div className="p-4 bg-info/10 dark:bg-info/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-info" />
                  <p className="text-xs sm:text-sm text-foreground">Commissions</p>
                </div>
                <p className="font-semibold font-bold text-foreground">$13,800</p>
                <p className="text-xs text-muted-foreground">28% of total</p>
              </div>

              <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                  <p className="text-xs sm:text-sm text-foreground">Referrals</p>
                </div>
                <p className="font-semibold font-bold text-foreground">$2,500</p>
                <p className="text-xs text-muted-foreground">5% of total</p>
              </div>
            </div>

            {/* Commission Structure (Private - Seller Only View) */}
            <div className="border-t pt-4 sm:pt-6">
              <h3 className="font-semibold text-base sm:text-lg mb-3 sm:mb-4 text-foreground">Your Earnings Calculation</h3>
              <div className="bg-muted rounded-2xl p-3 sm:p-4 space-y-2 sm:space-y-3">
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Gross Sales (This Month)</span>
                  <span className="font-medium">$98.50</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Platform Fee (5%)</span>
                  <span className="font-medium text-warning">-$4.93</span>
                </div>
                <div className="flex justify-between text-xs sm:text-sm">
                  <span className="text-muted-foreground">Payment Processing (2%)</span>
                  <span className="font-medium text-warning">-$1.97</span>
                </div>
                <div className="h-px bg-border my-2"></div>
                <div className="flex justify-between font-semibold text-sm sm:text-base">
                  <span className="text-foreground">Net Earnings</span>
                  <span className="text-success">$91.60</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  * Platform fees help us maintain secure escrow, fraud protection, and platform infrastructure
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Earnings */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-xl">Recent Earnings</h2>
              <Button variant="ghost" size="sm" className="text-xs sm:text-sm">
                <Eye className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                View All
              </Button>
            </div>

            <Tabs defaultValue="all">
              <TabsList className="mb-4 grid grid-cols-4 w-full h-auto">
                <TabsTrigger value="all" className="text-xs sm:text-sm">All</TabsTrigger>
                <TabsTrigger value="sales" className="text-xs sm:text-sm">Sales</TabsTrigger>
                <TabsTrigger value="commissions" className="text-xs sm:text-sm">Comm.</TabsTrigger>
                <TabsTrigger value="referrals" className="text-xs sm:text-sm">Ref.</TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-2 sm:space-y-3">
                {mockEarnings.map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-muted rounded-xl hover:bg-muted/80 transition-colors"
                  >
                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0">
                      {getEarningIcon(earning.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm sm:text-base font-medium truncate">{earning.source}</p>
                      <p className="text-xs sm:text-sm text-muted-foreground">{earning.date}</p>
                      {earning.orderId && (
                        <Link to={`/seller/orders/${earning.orderId}`} className="text-xs text-primary hover:underline">
                          {earning.orderId}
                        </Link>
                      )}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-medium text-success">
                        +${earning.amount.toLocaleString()}
                      </p>
                      {getStatusBadge(earning.status)}
                    </div>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="sales" className="space-y-3">
                {mockEarnings.filter(e => e.type === 'sale').map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center gap-4 p-4 bg-muted rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                      {getEarningIcon(earning.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{earning.source}</p>
                      <p className="text-sm text-muted-foreground">{earning.date}</p>
                    </div>
                    <p className="font-medium text-success">
                      +${earning.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="commissions" className="space-y-3">
                {mockEarnings.filter(e => e.type === 'commission').map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center gap-4 p-4 bg-muted rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                      {getEarningIcon(earning.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{earning.source}</p>
                      <p className="text-sm text-muted-foreground">{earning.date}</p>
                    </div>
                    <p className="font-medium text-success">
                      +${earning.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </TabsContent>

              <TabsContent value="referrals" className="space-y-3">
                {mockEarnings.filter(e => e.type === 'referral').map((earning) => (
                  <div
                    key={earning.id}
                    className="flex items-center gap-4 p-4 bg-muted rounded-xl"
                  >
                    <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center">
                      {getEarningIcon(earning.type)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{earning.source}</p>
                      <p className="text-sm text-muted-foreground">{earning.date}</p>
                    </div>
                    <p className="font-medium text-success">
                      +${earning.amount.toLocaleString()}
                    </p>
                  </div>
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </SellerLayout>
  );
}