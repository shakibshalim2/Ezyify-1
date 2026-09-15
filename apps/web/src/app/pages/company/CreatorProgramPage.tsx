import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Video, DollarSign, Users, TrendingUp, Star, Gift, Sparkles, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

export default function CreatorProgramPage() {
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
      title: 'Earn Affiliate Commissions',
      description: 'Tag products in your content and earn 3-15% commission on every sale. The more you share, the more you earn.'
    },
    {
      icon: Users,
      title: 'Grow Your Audience',
      description: 'Ezyify\'s AI promotes your content to interested users. Build a following organically.'
    },
    {
      icon: Video,
      title: 'Monetize Your Content',
      description: 'Posts, Loops, Stories, and Live streams all support product tagging. Every format earns.'
    },
    {
      icon: Sparkles,
      title: 'Creator Tools & Analytics',
      description: 'Track earnings, see what converts, schedule lives, and optimize your strategy with data.'
    }
  ];

  const earningSources = [
    {
      title: 'Affiliate Sales',
      description: 'Tag products in posts/videos. Earn commission when followers purchase.',
      potential: '$500 - $50K/month'
    },
    {
      title: 'Live Shopping',
      description: 'Host live shopping events. Interactive selling with instant checkout.',
      potential: '$1K - $100K/event'
    },
    {
      title: 'Brand Partnerships',
      description: 'Collaborate with brands for sponsored content and exclusive drops.',
      potential: '$2K - $500K/campaign'
    },
    {
      title: 'Creator Store',
      description: 'Sell your own products directly through your storefront.',
      potential: '$1K - $200K/month'
    }
  ];

  const tiers = [
    {
      name: 'Rising Creator',
      followers: '1K - 10K',
      benefits: ['Standard commission rates', 'Creator dashboard access', 'Basic analytics', 'Community support']
    },
    {
      name: 'Established Creator',
      followers: '10K - 100K',
      benefits: ['Higher commission rates', 'Live shopping access', 'Advanced analytics', 'Priority support', 'Brand partnership opportunities']
    },
    {
      name: 'Elite Creator',
      followers: '100K+',
      benefits: ['Premium commission rates', 'Dedicated account manager', 'Early feature access', 'Custom campaigns', 'Exclusive brand deals', 'Verified badge']
    }
  ];

  const steps = [
    {
      number: 1,
      title: 'Create Your Account',
      description: 'Sign up, complete your profile, and start posting content.'
    },
    {
      number: 2,
      title: 'Tag Products',
      description: 'Find products you love and tag them in your posts, videos, and stories.'
    },
    {
      number: 3,
      title: 'Grow Your Audience',
      description: 'Create authentic content. Ezyify\'s algorithm helps you reach the right people.'
    },
    {
      number: 4,
      title: 'Earn & Get Paid',
      description: 'Track earnings in real-time. Get paid monthly via your chosen payout method.'
    }
  ];

  return (
          <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO title="Creator Program" description="Join the Ezyify Creator Program. Monetize your content through our E-Commerce Social Media Ecosystem." />
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ background: 'var(--brand-gradient)' }}>
          <Star className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Ezyify Creator Program
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
          Turn your passion into income. Create content, tag products, and earn money doing what you love.
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          <Badge variant="secondary" className="text-sm">100K+ Creators</Badge>
          <Badge variant="secondary" className="text-sm">$50M+ Paid to Creators</Badge>
          <Badge variant="secondary" className="text-sm">3-15% Commission</Badge>
        </div>
        <Button size="lg" className="text-lg px-8">
          Become a Creator
          <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>

      {isLoading ? (
        <>
          <Skeleton className="h-8 w-56 mx-auto mb-8" />
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="w-12 h-12 rounded-full mb-4" />
                  <Skeleton className="h-5 w-48 mb-2" />
                  <Skeleton className="h-4 w-full mb-1" />
                  <Skeleton className="h-4 w-5/6" />
                </CardContent>
              </Card>
            ))}
          </div>
          <Card className="mb-12">
            <CardHeader>
              <Skeleton className="h-7 w-48 mx-auto" />
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-5 bg-card rounded-2xl">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Why Create on Ezyify */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Why Create on Ezyify?</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {benefits.map((benefit, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* How to Earn */}
          <Card className="mb-12 bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Multiple Ways to Earn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {earningSources.map((source, idx) => (
                  <div key={idx} className="p-5 bg-card rounded-2xl">
                    <h3 className="font-semibold mb-2">{source.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{source.description}</p>
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-success" />
                      <span className="text-sm font-medium text-success">{source.potential}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* How It Works */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl text-center">How It Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-4 gap-6">
                {steps.map((step, idx) => (
                  <div key={idx} className="text-center">
                    <div className="w-16 h-16 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{ background: 'var(--brand-gradient)' }}>
                      {step.number}
                    </div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Creator Tiers */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Creator Tiers & Benefits</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {tiers.map((tier, idx) => (
                <Card key={idx} className={idx === 2 ? 'border-primary border-2' : ''}>
                  <CardHeader>
                    {idx === 2 && <Badge className="mb-2 w-fit">Most Popular</Badge>}
                    <CardTitle className="text-xl">{tier.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{tier.followers} followers</p>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {tier.benefits.map((benefit, bidx) => (
                        <li key={bidx} className="flex items-start gap-2 text-sm">
                          <Star className="w-4 h-4 text-primary flex-shrink-0 mt-0.5" />
                          <span>{benefit}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Success Stories */}
          <Card className="mb-12 bg-info/8 border-info/20">
            <CardHeader>
              <CardTitle className="text-2xl text-center">Creator Success Stories</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3" style={{ background: "var(--brand-gradient-vivid)" }}></div>
                  <h4 className="font-semibold mb-1">@fashionista_maya</h4>
                  <p className="text-sm text-muted-foreground mb-2">Fashion Creator, 250K followers</p>
                  <p className="text-2xl font-bold text-primary mb-1">$45K/month</p>
                  <p className="text-xs text-muted-foreground">Average monthly earnings</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3" style={{ background: "var(--brand-gradient)" }}></div>
                  <h4 className="font-semibold mb-1">@tech_reviews_pro</h4>
                  <p className="text-sm text-muted-foreground mb-2">Tech Reviewer, 180K followers</p>
                  <p className="text-2xl font-bold text-info mb-1">$32K/month</p>
                  <p className="text-xs text-muted-foreground">Average monthly earnings</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3" style={{ background: "var(--brand-gradient)" }}></div>
                  <h4 className="font-semibold mb-1">@beautyby_sarah</h4>
                  <p className="text-sm text-muted-foreground mb-2">Beauty Creator, 320K followers</p>
                  <p className="text-2xl font-bold text-like mb-1">$58K/month</p>
                  <p className="text-xs text-muted-foreground">Average monthly earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Creator Resources */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Creator Resources & Support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-primary/10 rounded-xl">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Gift className="w-5 h-5 text-primary" />
                    Creator Academy
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Free courses on content creation, product tagging, growth strategies, and monetization best practices.
                  </p>
                </div>
                <div className="p-4 bg-info/8 border border-info/20 rounded-2xl">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-info" />
                    Creator Community
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Join a private community of creators. Share tips, collaborate, and learn from each other.
                  </p>
                </div>
                <div className="p-4 bg-success/8 rounded-xl">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-success" />
                    Analytics Dashboard
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Track performance, see what products convert, understand your audience, and optimize earnings.
                  </p>
                </div>
                <div className="p-4 bg-warning/5 dark:bg-warning/5 rounded-xl">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Star className="w-5 h-5 text-warning" />
                    Dedicated Support
                  </h4>
                  <p className="text-sm text-muted-foreground">
                    Get help from our creator success team. Priority support for established and elite creators.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* CTA */}
          <div className="text-center p-10 rounded-2xl text-white" style={{ background: "var(--brand-gradient)" }} >
            <h2 className="text-3xl mb-3">Ready to Start Earning?</h2>
            <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
              Join 100,000+ creators already making money on Ezyify. It's free to start.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                <Star className="w-5 h-5 mr-2" />
                Join Creator Program
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
                Watch Demo
              </Button>
            </div>
            <p className="text-sm mt-6 opacity-80">
              Questions? Email <a href="mailto:creators@ezyify.app" className="underline font-medium">creators@ezyify.app</a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}