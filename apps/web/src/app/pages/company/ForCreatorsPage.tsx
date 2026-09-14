import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Users, Video, ShoppingBag, Star, CheckCircle2, ArrowRight, Sparkles, Target, Award, XCircle } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Link } from 'react-router';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Skeleton } from '../../components/ui/skeleton';

export default function ForCreatorsPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadData = () => setIsLoading(false);
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadData(), { timeout: 100 });
    } else {
      setTimeout(loadData, 0);
    }
  }, []);

  const benefits = [
    {
      icon: DollarSign,
      title: 'Multiple Revenue Streams',
      description: 'Content creation, affiliate commissions, live commerce, brand partnerships'
    },
    {
      icon: Users,
      title: 'Engaged Audience',
      description: 'Built-in social features where your followers naturally engage with your content'
    },
    {
      icon: TrendingUp,
      title: 'Growth Tools',
      description: 'Analytics, insights, and tools to help grow your content and earnings'
    },
    {
      icon: Star,
      title: 'Community First',
      description: 'Build authentic relationships and give trust-driven recommendations'
    },
    {
      icon: Sparkles,
      title: 'Creative Freedom',
      description: 'Posts, Loops, Stories, Lives — create content your way'
    },
    {
      icon: Award,
      title: 'Creator Support',
      description: 'Dedicated creator success team and exclusive programs'
    }
  ];

  const monetizationWays = [
    {
      title: 'Affiliate Marketing',
      description: 'Recommend products and earn commission from every sale',
      earning: '3-10% per sale',
      color: 'purple'
    },
    {
      title: 'Live Commerce',
      description: 'Showcase products in live streams and sell in real-time',
      earning: '5-15% commission',
      color: 'blue'
    },
    {
      title: 'Brand Partnerships',
      description: 'Sponsored content and collaborations with brands',
      earning: 'Negotiable',
      color: 'green'
    },
    {
      title: 'Creator Store',
      description: 'Create your own curated store',
      earning: 'Up to 20%',
      color: 'orange'
    }
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Create & Share',
      description: 'Create engaging content — posts, loops, stories, lives. Add product tags.'
    },
    {
      step: 2,
      title: 'Build Audience',
      description: 'Grow your followers through authentic content and consistent engagement.'
    },
    {
      step: 3,
      title: 'Recommend Products',
      description: 'Recommend products you genuinely love and trust.'
    },
    {
      step: 4,
      title: 'Earn Commission',
      description: 'Earn automatic commission when purchases are made from your shared posts.'
    }
  ];

  return (
          <div className="min-h-screen bg-background">
      <SEO title="Ezyify for Creators" description="Turn your passion into income on Ezyify. Create, share, and earn through our E-Commerce Social Media Ecosystem." />
      <div className="max-w-6xl mx-auto px-4 pb-8 space-y-12">
        {/* Hero */}
        <div className="text-center space-y-6 py-12">
          <div className="flex justify-center">
            <div className="bg-primary/10 p-6 rounded-full">
              <Video className="w-16 h-16 text-primary" />
            </div>
          </div>
          <div>
            <h1 className="text-4xl md:text-5xl">Ezyify for Creators</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto mt-4">
              Turn your passion into profession — create content and earn money
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            <Link to="/creator-dashboard">
              <Button size="lg" className="bg-black hover:bg-foreground">
                Start Creating
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="lg" variant="outline">
                Join as Creator
              </Button>
            </Link>
          </div>
        </div>

        {isLoading ? (
          <>
            <Skeleton className="h-8 w-64 mx-auto mb-8" />
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="w-12 h-12 rounded-2xl mb-3" />
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Why Creators Love Ezyify */}
            <div className="space-y-6">
              <h2 className="text-center">Why Creators Love Ezyify</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {benefits.map((benefit, index) => {
                  const Icon = benefit.icon;
                  return (
                    <Card key={index} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6 space-y-3">
                        <div className="bg-primary/15 dark:bg-primary/10 p-3 rounded-xl w-fit">
                          <Icon className="w-8 h-8 text-primary" />
                        </div>
                        <h3>{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Monetization Ways */}
            <div className="space-y-6">
              <div className="text-center space-y-2">
                <h2>How to Earn?</h2>
                <p className="text-muted-foreground">
                  Multiple ways to monetize your content and influence
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {monetizationWays.map((way, index) => {
                  const bgColors: Record<string, string> = {
                    purple: 'bg-primary/10 border-primary/20',
                    blue: 'bg-info/8 border-info/20',
                    green: 'bg-success/8 border-success/20',
                    orange: 'bg-warning/8 border-warning/20'
                  };
                  return (
                    <Card key={index} className={bgColors[way.color]}>
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-start justify-between">
                          <h3>{way.title}</h3>
                          <Badge variant="secondary">{way.earning}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{way.description}</p>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Important Rule */}
            <Alert className="border-primary/25 bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
              <AlertDescription className="text-primary">
                <strong>Important:</strong> Affiliate earnings are generated only from in-platform sharing. 
                You earn commission when someone purchases through your shared Ezyify posts. 
                External social media links do not generate commission — this maintains the platform's trust and 
                tracking system.
              </AlertDescription>
            </Alert>

            {/* How It Works */}
            <div className="space-y-6">
              <h2 className="text-center">How It Works?</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                {howItWorks.map((step, index) => (
                  <Card key={index}>
                    <CardContent className="p-6 space-y-3">
                      <div className="text-white rounded-full w-12 h-12 flex items-center justify-center text-xl" style={{ background: "var(--brand-gradient)" }}>
                        {step.step}
                      </div>
                      <h3>{step.title}</h3>
                      <p className="text-sm text-muted-foreground">{step.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Creator Tools */}
            <Card>
              <CardContent className="p-8 space-y-6">
                <h2 className="text-center">Creator Tools & Features</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <h3 className="text-lg">Content Creation Suite</h3>
                        <p className="text-sm text-muted-foreground">
                          Posts, Loops (short videos), Stories, Live streaming — all on the same platform
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <h3 className="text-lg">Product Tagging</h3>
                        <p className="text-sm text-muted-foreground">
                          Easily tag products in your content — invisible commerce
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success mt-0.5" />
                      <div>
                        <h3 className="text-lg">Analytics Dashboard</h3>
                        <p className="text-sm text-muted-foreground">
                          Track views, engagement, earnings, best performing content
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-info mt-0.5" />
                      <div>
                        <h3 className="text-lg">Live Commerce Tools</h3>
                        <p className="text-sm text-muted-foreground">
                          Real-time product showcase, live shopping features
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-info mt-0.5" />
                      <div>
                        <h3 className="text-lg">Earnings Tracker</h3>
                        <p className="text-sm text-muted-foreground">
                          Transparent earnings dashboard with detailed breakdown
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-info mt-0.5" />
                      <div>
                        <h3 className="text-lg">Payout Management</h3>
                        <p className="text-sm text-muted-foreground">
                          Easy withdrawals, multiple payment methods
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Success Stories */}
            <Card className="bg-primary/5 border-primary/20">
              <CardContent className="p-8 text-center space-y-4">
                <h2>Join Successful Creators</h2>
                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  <div className="space-y-2">
                    <div className="text-4xl">5,000+</div>
                    <p className="text-sm text-muted-foreground">Active Creators</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl">₹2.5Cr+</div>
                    <p className="text-sm text-muted-foreground">Paid to Creators</p>
                  </div>
                  <div className="space-y-2">
                    <div className="text-4xl">92%</div>
                    <p className="text-sm text-muted-foreground">Creator Satisfaction</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Creator Guidelines */}
            <Card>
              <CardContent className="p-8 space-y-4">
                <h2 className="text-center">Creator Best Practices</h2>
                <div className="grid md:grid-cols-2 gap-6 mt-6">
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-success">
                      <CheckCircle2 className="w-5 h-5" />
                      Do:
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                      <li>• Give authentic and honest reviews</li>
                      <li>• Only recommend products you genuinely love</li>
                      <li>• Create high-quality, engaging content</li>
                      <li>• Genuinely interact with your audience</li>
                      <li>• Be transparent about affiliate partnerships</li>
                      <li>• Maintain a consistent posting schedule</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-error">
                      <XCircle className="w-5 h-5 shrink-0" />
                      Don't:
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground ml-7">
                      <li>• Post fake or misleading reviews</li>
                      <li>• Make exaggerated product claims</li>
                      <li>• Create spam or low-quality content</li>
                      <li>• Violate copyright laws</li>
                      <li>• Use engagement baiting (artificial likes/shares)</li>
                      <li>• Violate community guidelines</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CTA */}
            <Card>
              <CardContent className="p-8 text-center space-y-6">
                <h2>Ready to Start Your Creator Journey?</h2>
                <p className="text-muted-foreground max-w-2xl mx-auto">
                  Join today and turn your passion into a profitable career. 
                  No upfront costs — just create and earn!
                </p>
                <div className="flex flex-wrap justify-center gap-4">
                  <Link to="/creator-dashboard">
                    <Button size="lg" className="bg-black hover:bg-foreground">
                      <Video className="w-5 h-5 mr-2" />
                      Start Creating Now
                    </Button>
                  </Link>
                  <Link to="/contact?topic=creator">
                    <Button size="lg" variant="outline">
                      Talk to Creator Team
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Footer Links */}
            <div className="flex flex-wrap justify-center gap-4 text-sm">
              <Link to="/help" className="text-muted-foreground hover:text-foreground">
                Creator Help Center
              </Link>
              <span className="text-muted-foreground/30">|</span>
              <Link to="/community-guidelines" className="text-muted-foreground hover:text-foreground">
                Community Guidelines
              </Link>
              <span className="text-muted-foreground/30">|</span>
              <Link to="/faq" className="text-muted-foreground hover:text-foreground">
                FAQs
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}