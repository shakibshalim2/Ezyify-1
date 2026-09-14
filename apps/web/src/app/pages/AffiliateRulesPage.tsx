import { SEO } from '../components/SEO';
import { Link } from 'react-router';
import { Share2, DollarSign, TrendingUp, Users, CheckCircle2, XCircle, AlertCircle, Award, Target } from 'lucide-react';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';

export default function AffiliateRulesPage() {
  return (<div className="min-h-screen bg-background">
      <SEO title="Affiliate Program Rules — Ezyify" description="Ezyify Affiliate Program rules, commission rates, and guidelines for creators and partners." />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* Hero Section */}
        <div className="rounded-2xl text-white" style={{ background: "var(--brand-gradient)" }}>
          <div className="flex items-center gap-3 mb-4">
            <Share2 className="w-10 h-10" />
            <h1 className="text-white">Affiliate & Sharing Program</h1>
          </div>
          <p className="text-white/85 text-lg mb-6">
            Earn commission by sharing products you love. Learn how our platform-first earning system works.
          </p>
          <div className="flex gap-3">
            <Link to="/affiliate-manager">
              <Button variant="secondary">Start Earning</Button>
            </Link>
            <Link to="/referral-tracking">
              <Button variant="outline" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                Track Earnings
              </Button>
            </Link>
          </div>
        </div>

        {/* Key Rules Alert */}
        <Alert className="mb-8 border-primary/30 bg-primary/10 dark:bg-primary/20">
          <AlertCircle className="w-4 h-4 text-primary" />
          <AlertDescription className="text-foreground">
            <strong>Important:</strong> Affiliate earnings are only valid for engagement and purchases made{' '}
            <strong>inside the Ezyify platform</strong>. External sharing is allowed but does not generate commission.
          </AlertDescription>
        </Alert>

        {/* Main Tabs */}
        <Tabs defaultValue="overview" className="mb-8">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="rules">Earning Rules</TabsTrigger>
            <TabsTrigger value="sharing">Sharing Types</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-6">How It Works</h2>
                <div className="space-y-6">
                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary">1</span>
                    </div>
                    <div>
                      <h3 className="mb-2">Share Products Inside Ezyify</h3>
                      <p className="text-muted-foreground">
                        Share products with your followers through posts, loops, or direct messages within the platform.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary">2</span>
                    </div>
                    <div>
                      <h3 className="mb-2">Users Engage & Purchase</h3>
                      <p className="text-muted-foreground">
                        When users click your shared link, view the product, and make a purchase on Ezyify, you earn commission.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary">3</span>
                    </div>
                    <div>
                      <h3 className="mb-2">Earn Commission</h3>
                      <p className="text-muted-foreground">
                        Commission is automatically calculated and added to your Ezyify Wallet after the purchase is confirmed.
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center flex-shrink-0">
                      <span className="text-xl font-bold text-primary">4</span>
                    </div>
                    <div>
                      <h3 className="mb-2">Track & Withdraw</h3>
                      <p className="text-muted-foreground">
                        Monitor your earnings in real-time and withdraw to your bank account whenever you want.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Commission Rates */}
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-6">Commission Rates</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-success/10 rounded-xl border border-success/30">
                    <Award className="w-8 h-8 text-success mb-3" />
                    <p className="text-2xl font-bold text-foreground mb-1">5-10%</p>
                    <p className="text-sm text-muted-foreground">Standard Products</p>
                  </div>
                  <div className="p-4 bg-primary/10 rounded-xl border border-primary/30">
                    <Target className="w-8 h-8 text-primary mb-3" />
                    <p className="text-2xl font-bold text-foreground mb-1">10-15%</p>
                    <p className="text-sm text-muted-foreground">Featured Products</p>
                  </div>
                  <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-xl border border-primary/30">
                    <TrendingUp className="w-8 h-8 text-primary mb-3" />
                    <p className="text-2xl font-bold text-foreground mb-1">Up to 20%</p>
                    <p className="text-sm text-muted-foreground">Premium Brands</p>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Commission rates vary by product category and brand partnerships. Check individual product pages for exact rates.
                </p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rules Tab */}
          <TabsContent value="rules">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-6">Earning Rules & Requirements</h2>
                
                <div className="space-y-6">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-primary" />
                      Platform-First Earning
                    </h3>
                    <ul className="space-y-2 text-muted-foreground ml-7">
                      <li>✓ Earnings only apply when users engage within Ezyify platform</li>
                      <li>✓ Purchases must be completed through Ezyify checkout</li>
                      <li>✓ User must click your affiliate link inside the platform</li>
                      <li>✓ Commission is tracked through Ezyify's internal system</li>
                    </ul>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="mb-3 flex items-center gap-2">
                      <XCircle className="w-5 h-5 text-destructive" />
                      No External Earnings
                    </h3>
                    <ul className="space-y-2 text-muted-foreground ml-7">
                      <li>✗ External sharing (WhatsApp, Facebook, etc.) does not earn commission</li>
                      <li>✗ Purchases made outside Ezyify are not tracked</li>
                      <li>✗ Third-party affiliate links are not supported</li>
                      <li>✗ Direct external traffic does not generate affiliate income</li>
                    </ul>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="mb-3">Cookie Duration & Attribution</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Affiliate links are valid for <strong className="text-foreground">30 days</strong> after click</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Last-click attribution model (last affiliate link clicked gets credit)</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Commission credited after order confirmation (typically 3-5 days)</span>
                      </li>
                    </ul>
                  </div>

                  <div className="border-t border-border pt-6">
                    <h3 className="mb-3">Payment & Withdrawal</h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Minimum withdrawal amount: <strong className="text-foreground">$500</strong></span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Earnings held for 7 days to ensure no returns/refunds</span>
                      </li>
                      <li className="flex gap-2">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <span>Withdraw to Ezyify Wallet, then to bank account or mobile wallet</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Prohibited Actions */}
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4 text-destructive">Prohibited Actions</h2>
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>
                    Violation of these rules may result in commission forfeiture and account suspension
                  </AlertDescription>
                </Alert>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex gap-2">
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Self-purchasing to earn commission</span>
                  </li>
                  <li className="flex gap-2">
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Click fraud or bot traffic</span>
                  </li>
                  <li className="flex gap-2">
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Misleading or deceptive promotion</span>
                  </li>
                  <li className="flex gap-2">
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Spamming users with affiliate links</span>
                  </li>
                  <li className="flex gap-2">
                    <XCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
                    <span>Creating fake accounts to generate clicks</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Sharing Types Tab */}
          <TabsContent value="sharing">
            <Card className="mb-6">
              <CardContent className="p-6">
                <h2 className="mb-6">Internal vs External Sharing</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Internal Sharing */}
                  <div className="p-6 bg-accent border-2 border-border rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <CheckCircle2 className="w-6 h-6 text-primary" />
                      <h3 className="text-foreground">Internal Sharing (Earns Commission)</h3>
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Share2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Share to Feed</p>
                          <p className="text-muted-foreground">Post product to your Ezyify feed</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Share2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Share in Loops</p>
                          <p className="text-muted-foreground">Create video loop featuring product</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Share2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Direct Message</p>
                          <p className="text-muted-foreground">Send product link via Ezyify messages</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Share2 className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Stories</p>
                          <p className="text-muted-foreground">Share product in your Ezyify story</p>
                        </div>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-muted rounded-xl">
                      <p className="text-xs text-foreground">
                        <strong>Benefit:</strong> Full commission tracking, analytics, and guaranteed earnings
                      </p>
                    </div>
                  </div>

                  {/* External Sharing */}
                  <div className="p-6 bg-muted border-2 border-border rounded-xl">
                    <div className="flex items-center gap-3 mb-4">
                      <XCircle className="w-6 h-6 text-muted-foreground" />
                      <h3 className="text-foreground">External Sharing (No Commission)</h3>
                    </div>
                    <ul className="space-y-3 text-sm">
                      <li className="flex items-start gap-2">
                        <Share2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">WhatsApp, Facebook</p>
                          <p className="text-muted-foreground">Share link to social media</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Share2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Instagram, Twitter</p>
                          <p className="text-muted-foreground">Post link on other platforms</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Share2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Email, SMS</p>
                          <p className="text-muted-foreground">Send product link externally</p>
                        </div>
                      </li>
                      <li className="flex items-start gap-2">
                        <Share2 className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                        <div>
                          <p className="font-medium text-foreground">Third-party Websites</p>
                          <p className="text-muted-foreground">Embed links on external sites</p>
                        </div>
                      </li>
                    </ul>
                    <div className="mt-4 p-3 bg-muted/50 rounded-xl">
                      <p className="text-xs text-muted-foreground">
                        <strong className="text-foreground">Note:</strong> External sharing is allowed but does not generate affiliate commission
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Why Platform-First */}
            <Card>
              <CardContent className="p-6">
                <h2 className="mb-4">Why Platform-First Earning?</h2>
                <div className="space-y-3 text-muted-foreground">
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Platform Growth</p>
                      <p className="text-sm">Encourages building and engaging with the Ezyify community</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Clean Tracking</p>
                      <p className="text-sm">Accurate commission attribution and fraud prevention</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Better Experience</p>
                      <p className="text-sm">Users stay within the app for seamless shopping experience</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-foreground mb-1">Fair Compensation</p>
                      <p className="text-sm">Ensures creators are rewarded for genuine platform engagement</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* CTA Section */}
        <Card className="text-white border-0" style={{ background: "var(--brand-gradient)" }}>
          <CardContent className="p-8 text-center">
            <DollarSign className="w-8 h-8 text-white" />
            <h2 className="text-white mb-2">Ready to Start Earning?</h2>
            <p className="text-white/85 mb-6">
              Join thousands of creators earning commission through Ezyify's affiliate program
            </p>
            <div className="flex gap-3 justify-center">
              <Link to="/affiliate-manager">
                <Button variant="secondary" size="lg">
                  Get Started
                </Button>
              </Link>
              <Link to="/referral-tracking">
                <Button variant="outline" size="lg" className="bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground hover:bg-primary-foreground/20">
                  View My Earnings
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}