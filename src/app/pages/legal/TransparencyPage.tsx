import { FileText, Shield, DollarSign, Users, TrendingUp, Globe, CheckCircle2, Eye } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Card, CardContent } from '../../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';

export default function TransparencyPage() {
  return (
    <div className="min-h-screen bg-background">
      <SEO title="Transparency Report — Ezyify" description="How Ezyify handles content moderation, data requests, and platform decisions." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Hero Section */}
        <div className="py-12 px-4 text-white" style={{ background: "var(--brand-gradient)" }}>
          <div className="flex items-center gap-3 mb-4">
            <Eye className="w-10 h-10" />
            <h1 className="text-white">Transparency Report</h1>
          </div>
          <p className="text-white/85 text-lg">
            Our commitment to openness, accountability, and building trust with our global community.
          </p>
        </div>

        {/* Last Updated */}
        <div className="text-center mb-8">
          <p className="text-sm text-muted-foreground">Last Updated: January 11, 2026</p>
          <p className="text-sm text-muted-foreground">Reporting Period: Q4 2025 (Oct - Dec 2025)</p>
        </div>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="moderation">Moderation</TabsTrigger>
            <TabsTrigger value="financials">Financials</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-6">Platform Statistics</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-4 bg-info/5 rounded-xl">
                    <Users className="w-8 h-8 text-info mb-3" />
                    <p className="text-3xl font-bold text-info mb-1">2.4M+</p>
                    <p className="text-sm text-info">Active Users</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-xl">
                    <TrendingUp className="w-8 h-8 text-primary mb-3" />
                    <p className="text-3xl font-bold text-primary mb-1">89K+</p>
                    <p className="text-sm text-primary">Active Sellers</p>
                  </div>
                  <div className="p-4 bg-success/5 rounded-xl">
                    <FileText className="w-8 h-8 text-success mb-3" />
                    <p className="text-3xl font-bold text-success mb-1">15.6M+</p>
                    <p className="text-sm text-success">Posts & Loops</p>
                  </div>
                  <div className="p-4 bg-warning/5 rounded-xl">
                    <Globe className="w-8 h-8 text-warning mb-3" />
                    <p className="text-3xl font-bold text-warning mb-1">45+</p>
                    <p className="text-sm text-warning">Countries Served</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4">Our Commitment</h2>
                <div className="space-y-4 text-muted-foreground">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Data Protection</p>
                      <p className="text-sm">
                        We use industry-leading encryption and security measures to protect user data.
                        All personal information is stored securely and never sold to third parties.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Fair Commerce</p>
                      <p className="text-sm">
                        Our escrow system ensures buyers receive products before sellers get paid,
                        protecting both parties in every transaction.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Community Safety</p>
                      <p className="text-sm">
                        24/7 moderation team working to keep Ezyify safe, inclusive, and free from
                        harmful content or behavior.
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-success flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Transparent Operations</p>
                      <p className="text-sm">
                        Regular transparency reports, clear policies, and open communication with
                        our community about platform changes and decisions.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Moderation Tab */}
          <TabsContent value="moderation">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-6">Content Moderation Report (Q4 2025)</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3">Content Removed</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="p-4 bg-muted/50 rounded-xl">
                        <p className="text-2xl font-bold mb-1">12,450</p>
                        <p className="text-xs text-muted-foreground">Total Removals</p>
                      </div>
                      <div className="p-4 bg-error/5 rounded-xl">
                        <p className="text-2xl font-bold text-error mb-1">3,240</p>
                        <p className="text-xs text-error">Spam</p>
                      </div>
                      <div className="p-4 bg-warning/5 rounded-xl">
                        <p className="text-2xl font-bold text-warning mb-1">2,680</p>
                        <p className="text-xs text-warning">Hate Speech</p>
                      </div>
                      <div className="p-4 bg-primary/10 rounded-xl">
                        <p className="text-2xl font-bold text-primary mb-1">1,890</p>
                        <p className="text-xs text-primary">Scams/Fraud</p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="mb-3">Account Actions</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex justify-between p-3 bg-muted rounded">
                        <span>Warnings Issued</span>
                        <span className="font-medium">8,640</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted rounded">
                        <span>Temporary Suspensions</span>
                        <span className="font-medium">1,450</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted rounded">
                        <span>Permanent Bans</span>
                        <span className="font-medium">580</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted rounded">
                        <span>Appeals Reviewed</span>
                        <span className="font-medium">2,340</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted rounded">
                        <span>Accounts Reinstated</span>
                        <span className="font-medium">890</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3">Response Times</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Average Report Review Time</span>
                        <span className="font-medium text-success">2.4 hours</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Critical Issues Response Time</span>
                        <span className="font-medium text-success">15 minutes</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Appeal Resolution Time</span>
                        <span className="font-medium text-success">24 hours</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Our Moderation Approach</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Ezyify uses a combination of automated systems and human moderators to ensure
                  community safety while respecting freedom of expression.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>AI-powered content screening for rapid detection</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Human review for nuanced decisions</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Clear appeal process for all actions</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Regular training for moderation team</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Financials Tab */}
          <TabsContent value="financials">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-6">Financial Transparency (Q4 2025)</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3">Gross Merchandise Value (GMV)</h3>
                    <p className="text-4xl font-bold text-primary mb-2">$890M</p>
                    <p className="text-sm text-muted-foreground">Total value of transactions on platform</p>
                  </div>

                  <div>
                    <h3 className="mb-3">Seller Payouts</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Total Paid to Sellers</span>
                        <span className="font-medium text-success">$712M</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Average Seller Earnings</span>
                        <span className="font-medium">$89,400</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Successful Transactions</span>
                        <span className="font-medium">1.2M+</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>On-time Payment Rate</span>
                        <span className="font-medium text-success">99.7%</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3">Creator Earnings (Affiliate)</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Total Creator Commissions</span>
                        <span className="font-medium text-success">$45M</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Active Affiliates</span>
                        <span className="font-medium">34,500</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Average Commission Per Creator</span>
                        <span className="font-medium">$13,040</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3">Platform Fees</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Ezyify charges a small fee to maintain and improve the platform
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Seller Transaction Fee</span>
                        <span className="font-medium">5% - 8%</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Withdrawal Processing Fee</span>
                        <span className="font-medium">$5</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Currency Conversion Fee</span>
                        <span className="font-medium">2.5%</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">Escrow Protection</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  All payments are held securely in Ezyify Wallet until buyers confirm product receipt,
                  ensuring protection for both buyers and sellers.
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex justify-between p-3 bg-muted/50 rounded">
                    <span>Disputes Resolved</span>
                    <span className="font-medium">4,580</span>
                  </li>
                  <li className="flex justify-between p-3 bg-muted/50 rounded">
                    <span>Average Resolution Time</span>
                    <span className="font-medium">3.2 days</span>
                  </li>
                  <li className="flex justify-between p-3 bg-muted/50 rounded">
                    <span>Buyer Satisfaction Rate</span>
                    <span className="font-medium text-success">94.6%</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Privacy Tab */}
          <TabsContent value="privacy">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-6">Privacy & Data Protection</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3">Data Requests (Q4 2025)</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Government/Legal Requests</span>
                        <span className="font-medium">34</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Requests Complied With</span>
                        <span className="font-medium">28</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>User Data Export Requests</span>
                        <span className="font-medium">2,340</span>
                      </li>
                      <li className="flex justify-between p-3 bg-muted/50 rounded">
                        <span>Account Deletion Requests</span>
                        <span className="font-medium">1,890</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3">Data Security</h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>End-to-end encryption for messages</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>Two-factor authentication available</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>Regular security audits and penetration testing</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>GDPR and international privacy law compliant</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                        <span>Zero data breaches in Q4 2025</span>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="mb-3">Third-Party Sharing</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      We do not sell user data. Limited sharing only occurs for:
                    </p>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li className="flex gap-2">
                        <Shield className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                        <span>Payment processing (encrypted transaction data only)</span>
                      </li>
                      <li className="flex gap-2">
                        <Shield className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                        <span>Analytics (anonymized, aggregate data)</span>
                      </li>
                      <li className="flex gap-2">
                        <Shield className="w-4 h-4 text-info flex-shrink-0 mt-0.5" />
                        <span>Legal compliance (when required by law)</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="mb-4">User Rights</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Every Ezyify user has the right to:
                </p>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Access and download their personal data</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Request data correction or deletion</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Opt-out of marketing communications</span>
                  </li>
                  <li className="flex gap-2">
                    <CheckCircle2 className="w-4 h-4 text-success flex-shrink-0 mt-0.5" />
                    <span>Control privacy settings and data sharing preferences</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Footer Note */}
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-sm text-muted-foreground">
              Questions about this report? Email us at{' '}
              <a href="mailto:transparency@ezyify.com" className="text-primary hover:underline">
                transparency@ezyify.com
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}