import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { Shield, Lock, Eye, CreditCard, MapPin, Activity, AlertCircle, CheckCircle2, Info, Clock, ChevronRight, Ban, TrendingUp } from 'lucide-react';
import { Link } from 'react-router';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Separator } from '../../components/ui/separator';
import { SellerLayout } from '../../components/SellerLayout';

interface SecurityEvent {
  id: string;
  type: 'login' | 'withdrawal' | 'payment_method_change' | 'order_pattern' | 'location_change';
  description: string;
  timestamp: string;
  location?: string;
  ipAddress?: string;
  status: 'normal' | 'flagged' | 'blocked';
  riskLevel: 'low' | 'medium' | 'high';
}

interface AccountRestriction {
  type: 'withdrawal_limit' | 'velocity_check' | 'manual_review' | 'temporary_hold';
  reason: string;
  startDate: string;
  endDate?: string;
  status: 'active' | 'resolved';
}

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: 'SE-001',
    type: 'withdrawal',
    description: 'Withdrawal request processed',
    timestamp: '2026-01-19 10:30 AM',
    location: 'New York, US',
    ipAddress: '192.168.1.100',
    status: 'normal',
    riskLevel: 'low'
  },
  {
    id: 'SE-002',
    type: 'login',
    description: 'New device login detected',
    timestamp: '2026-01-18 03:45 PM',
    location: 'San Francisco, US',
    ipAddress: '192.168.1.101',
    status: 'flagged',
    riskLevel: 'medium'
  },
  {
    id: 'SE-003',
    type: 'payment_method_change',
    description: 'New payment method added',
    timestamp: '2026-01-15 11:20 AM',
    location: 'New York, US',
    ipAddress: '192.168.1.100',
    status: 'normal',
    riskLevel: 'low'
  }
];

const mockRestrictions: AccountRestriction[] = [
  {
    type: 'velocity_check',
    reason: 'Multiple rapid withdrawal attempts detected',
    startDate: '2026-01-10',
    endDate: '2026-01-12',
    status: 'resolved'
  }
];

export default function SecurityMonitorPage() {
  const [selectedTab, setSelectedTab] = useState('overview');

  // Security Metrics
  const securityScore = 87; // out of 100
  const riskLevel = 'Low';
  const accountAge = 45; // days
  const kycVerified = true;
  const twoFactorEnabled = true;
  const verifiedPaymentMethods = 2;
  const totalWithdrawals = 8;
  const flaggedActivities = 1;
  const activeRestrictions = 0;

  const getEventIcon = (type: SecurityEvent['type']) => {
    switch (type) {
      case 'login':
        return <Lock className="w-4 h-4 text-info" />;
      case 'withdrawal':
        return <CreditCard className="w-4 h-4 text-success" />;
      case 'payment_method_change':
        return <CreditCard className="w-4 h-4 text-primary" />;
      case 'order_pattern':
        return <Activity className="w-4 h-4 text-warning" />;
      case 'location_change':
        return <MapPin className="w-4 h-4 text-warning" />;
    }
  };

  const getRiskBadge = (level: SecurityEvent['riskLevel']) => {
    const config = {
      low: { variant: 'outline' as const, className: 'text-success border-success/60' },
      medium: { variant: 'secondary' as const, className: 'text-warning' },
      high: { variant: 'destructive' as const, className: '' }
    };
    return <Badge variant={config[level].variant} className={config[level].className}>{level} risk</Badge>;
  };

  const getStatusIcon = (status: SecurityEvent['status']) => {
    switch (status) {
      case 'normal':
        return <CheckCircle2 className="w-4 h-4 text-success" />;
      case 'flagged':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      case 'blocked':
        return <Ban className="w-4 h-4 text-error" />;
    }
  };

  return (
    <SellerLayout>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
      <SEO title="Security Monitor — Ezyify Seller" description="Monitor your Ezyify seller account security and activity." />
        {/* Header */}
        <div className="mb-8">
          <h1 className="mb-2 text-foreground">Security & Fraud Monitoring</h1>
          <p className="text-muted-foreground">
            Monitor your account security status and fraud prevention measures
          </p>
        </div>

        {/* Active Alerts */}
        {flaggedActivities > 0 && (
          <Alert className="mb-6 border-yellow-500/30 bg-warning/10">
            <AlertCircle className="w-4 h-4 text-warning" />
            <AlertDescription>
              <strong>{flaggedActivities} flagged activity detected.</strong> Review your recent security events below.
              <Link to="#events" className="ml-2 text-primary hover:underline">
                View Details
              </Link>
            </AlertDescription>
          </Alert>
        )}

        {activeRestrictions > 0 && (
          <Alert variant="destructive" className="mb-6">
            <Ban className="w-4 h-4" />
            <AlertDescription>
              <strong>{activeRestrictions} active restriction(s) on your account.</strong> Check restrictions tab for details.
            </AlertDescription>
          </Alert>
        )}

        {/* Security Score Card */}
        <Card className="mb-6 border-2 border-primary/30 bg-primary/5">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-foreground">Security Score</h2>
                    <p className="text-sm text-muted-foreground">Based on account activity and security measures</p>
                  </div>
                </div>

                <div className="flex items-end gap-4 mb-4">
                  <div className="text-5xl font-bold text-primary">{securityScore}</div>
                  <div className="pb-2">
                    <Badge variant="outline" className="text-success border-success/60">
                      {riskLevel} Risk
                    </Badge>
                  </div>
                </div>

                <div className="w-full bg-muted rounded-full h-3 mb-4">
                  <div 
                    className="bg-gradient-to-r from-[#4f6ef7] to-[#7c3aed] h-3 rounded-full transition-all"
                    style={{ width: `${securityScore}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="flex items-center gap-2">
                    {kycVerified ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-warning" />
                    )}
                    <span className="text-sm">KYC Verified</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {twoFactorEnabled ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-warning" />
                    )}
                    <span className="text-sm">2FA Enabled</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                    <span className="text-sm">{verifiedPaymentMethods} Payment Methods</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-info" />
                    <span className="text-sm">{accountAge} Days Old</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Withdrawals</p>
                  <p className="text-2xl font-bold">{totalWithdrawals}</p>
                </div>
                <TrendingUp className="w-8 h-8 text-success" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Flagged Activities</p>
                  <p className="text-2xl font-bold">{flaggedActivities}</p>
                </div>
                <AlertCircle className="w-8 h-8 text-warning" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Restrictions</p>
                  <p className="text-2xl font-bold">{activeRestrictions}</p>
                </div>
                <Ban className="w-8 h-8 text-error" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Account Age</p>
                  <p className="text-2xl font-bold">{accountAge}d</p>
                </div>
                <Clock className="w-8 h-8 text-info" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="events">Security Events</TabsTrigger>
            <TabsTrigger value="restrictions">Restrictions</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Account Protection */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-primary" />
                    Account Protection
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-success/8 border border-success/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <div>
                          <p className="font-medium">KYC Verification</p>
                          <p className="text-sm text-muted-foreground">Identity verified</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-success border-success/60">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-success/8 border border-success/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="w-5 h-5 text-success" />
                        <div>
                          <p className="font-medium">Two-Factor Authentication</p>
                          <p className="text-sm text-muted-foreground">Extra layer of security</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-success border-success/60">Enabled</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-info/8 border border-info/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-info" />
                        <div>
                          <p className="font-medium">Withdrawal Limits</p>
                          <p className="text-sm text-muted-foreground">$500/day, $2000/week</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-info border-info/60">Active</Badge>
                    </div>

                    <div className="flex items-center justify-between p-3 bg-info/8 border border-info/20 rounded-xl">
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-info" />
                        <div>
                          <p className="font-medium">Escrow Protection</p>
                          <p className="text-sm text-muted-foreground">7-day hold after delivery</p>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-info border-info/60">Active</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Fraud Prevention Measures */}
              <Card>
                <CardContent className="p-6">
                  <h3 className="mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-primary" />
                    Active Fraud Prevention
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                      <Eye className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Transaction Monitoring</p>
                        <p className="text-sm text-muted-foreground">
                          Real-time monitoring of all withdrawal and payout activities
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                      <Activity className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Velocity Checks</p>
                        <p className="text-sm text-muted-foreground">
                          Automatic detection of unusual withdrawal patterns
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                      <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Location Tracking</p>
                        <p className="text-sm text-muted-foreground">
                          Monitoring login and activity from new locations
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-muted rounded-xl">
                      <Lock className="w-5 h-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="font-medium">Device Fingerprinting</p>
                        <p className="text-sm text-muted-foreground">
                          Detection of new or suspicious devices
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Security Events Tab */}
          <TabsContent value="events" id="events">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Recent Security Events</h3>
                <div className="space-y-4">
                  {mockSecurityEvents.map((event) => (
                    <div
                      key={event.id}
                      className={`p-4 border rounded-xl ${
                        event.status === 'flagged' 
                          ? 'border-yellow-200 bg-warning/5' 
                          : event.status === 'blocked'
                          ? 'border-error/30 bg-error/5'
                          : 'border-border bg-background'
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-10 h-10 rounded-full bg-card border border-border flex items-center justify-center flex-shrink-0">
                          {getEventIcon(event.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <div>
                              <p className="font-medium">{event.description}</p>
                              <p className="text-sm text-muted-foreground">{event.timestamp}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              {getStatusIcon(event.status)}
                              {getRiskBadge(event.riskLevel)}
                            </div>
                          </div>

                          {event.location && (
                            <div className="flex gap-4 text-sm text-muted-foreground mt-2">
                              <div className="flex items-center gap-1">
                                <MapPin className="w-3 h-3" />
                                {event.location}
                              </div>
                              {event.ipAddress && (
                                <div className="flex items-center gap-1">
                                  <Activity className="w-3 h-3" />
                                  {event.ipAddress}
                                </div>
                              )}
                            </div>
                          )}

                          {event.status === 'flagged' && (
                            <Alert className="mt-3 border-yellow-200 bg-warning/5">
                              <Info className="w-4 h-4 text-warning" />
                              <AlertDescription className="text-warning text-sm">
                                This activity was flagged for review. If this wasn't you, please contact support immediately.
                              </AlertDescription>
                            </Alert>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Restrictions Tab */}
          <TabsContent value="restrictions">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Account Restrictions History</h3>
                {mockRestrictions.length === 0 ? (
                  <div className="text-center py-12">
                    <CheckCircle2 className="w-12 h-12 text-success mx-auto mb-4" />
                    <p className="text-muted-foreground">No active restrictions on your account</p>
                    <p className="text-sm text-muted-foreground mt-2">
                      Your account is in good standing
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {mockRestrictions.map((restriction, idx) => (
                      <div
                        key={idx}
                        className={`p-4 border rounded-xl ${
                          restriction.status === 'active'
                            ? 'border-error/30 bg-error/5'
                            : 'border-border bg-muted/50'
                        }`}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-medium">{restriction.type.replace('_', ' ')}</p>
                              <Badge 
                                variant={restriction.status === 'active' ? 'destructive' : 'outline'}
                              >
                                {restriction.status}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{restriction.reason}</p>
                          </div>
                        </div>
                        <div className="flex gap-4 text-sm text-muted-foreground mt-3">
                          <span>Start: {restriction.startDate}</span>
                          {restriction.endDate && <span>End: {restriction.endDate}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Recommendations Tab */}
          <TabsContent value="recommendations">
            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Security Recommendations</h3>
                <div className="space-y-4">
                  <div className="p-4 bg-success/5 border border-success/30 rounded-xl">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-success mb-1">Great job!</h4>
                        <p className="text-sm text-success">
                          Your security score is excellent. Keep monitoring your account regularly.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-info/5 border border-info/30 rounded-xl">
                    <div className="flex gap-3">
                      <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-info mb-1">Regular Security Checks</h4>
                        <p className="text-sm text-info mb-3">
                          Review your security events weekly to catch suspicious activities early.
                        </p>
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4 mr-2" />
                          View Events
                        </Button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-primary/10 border border-primary/25 rounded-xl">
                    <div className="flex gap-3">
                      <Shield className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-primary mb-1">Keep Payment Methods Updated</h4>
                        <p className="text-sm text-primary mb-3">
                          Ensure your payment methods are current and verified for smooth withdrawals.
                        </p>
                        <Link to="/seller/payout-settings">
                          <Button size="sm" variant="outline">
                            <CreditCard className="w-4 h-4 mr-2" />
                            Manage Payment Methods
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-muted/50 border border-border rounded-xl">
                    <div className="flex gap-3">
                      <Lock className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <div>
                        <h4 className="font-semibold text-foreground mb-1">Enable Login Notifications</h4>
                        <p className="text-sm text-foreground mb-3">
                          Get notified of all login attempts to quickly detect unauthorized access.
                        </p>
                        <Link to="/settings/security">
                          <Button size="sm" variant="outline">
                            <Lock className="w-4 h-4 mr-2" />
                            Security Settings
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </SellerLayout>
  );
}