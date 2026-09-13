import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Sparkles, Users, ShoppingBag, Heart, Target, Lightbulb, Globe, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Skeleton } from '../../components/ui/skeleton';

export default function AboutPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Progressive loading
  useEffect(() => {
    const loadData = () => {
      setIsLoading(false);
    };

    // Use requestIdleCallback for non-critical content
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadData(), { timeout: 100 });
    } else {
      setTimeout(loadData, 0);
    }
  }, []);

  return (
          <div className="max-w-4xl mx-auto px-4 pb-8">
      <SEO title="About Ezyify" description="Learn about Ezyify — the E-Commerce Social Media Ecosystem. Shop. Talk. Share. Live the Moment." />
      {/* Hero Section */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full" style={{ background: "var(--brand-gradient)" }}>
          <Sparkles className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-5xl mb-4 text-brand-gradient">
          About Ezyify
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          The world's first AI-powered social-first commerce platform where content, 
          creators, and commerce unite seamlessly.
        </p>
      </div>

      {isLoading ? (
        <>
          {/* Mission Statement Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-7 w-48" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>

          {/* Story Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </CardContent>
          </Card>

          {/* Differentiators Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-56" />
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="p-4 bg-accent rounded-2xl border border-border">
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-3/4" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Stats Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="text-center">
                    <Skeleton className="h-9 w-24 mx-auto mb-2" />
                    <Skeleton className="h-4 w-32 mx-auto" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Values Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-36" />
            </CardHeader>
            <CardContent className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
                  <div className="flex-1">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-3 w-full mb-1" />
                    <Skeleton className="h-3 w-4/5" />
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Vision Skeleton */}
          <Card className="mb-8">
            <CardHeader>
              <Skeleton className="h-6 w-48" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          {/* Mission Statement */}
          <Card className="mb-8 bg-accent/50 dark:bg-accent/20 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Target className="w-6 h-6 text-primary" />
                Our Mission
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-foreground leading-relaxed">
                To revolutionize how people discover, engage with, and purchase products by creating 
                a platform where <strong>social engagement and shopping are one seamless experience</strong>. 
                We believe the future of commerce is invisible, integrated, and inspiring.
              </p>
            </CardContent>
          </Card>

          {/* The Story */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-6 h-6 text-primary" />
                The Ezyify Story
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground">
                We asked ourselves a simple question: <em>Why should social media and shopping be separate experiences?</em>
              </p>
              <p className="text-foreground">
                Traditional social platforms show ads. Traditional e-commerce platforms lack discovery. 
                We saw the opportunity to build something fundamentally different — a platform where:
              </p>
              <ul className="space-y-2 text-foreground ml-6">
                <li>• <strong>Content drives commerce</strong>, not interrupts it</li>
                <li>• <strong>Creators monetize authentically</strong> through their influence</li>
                <li>• <strong>Shopping feels like scrolling</strong>, effortless and natural</li>
                <li>• <strong>Discovery happens organically</strong> through trusted voices</li>
              </ul>
              <p className="text-foreground">
                Ezyify is the result — an E-Commerce Social Media Ecosystem combining TikTok's engagement, 
                Instagram's creativity, and Amazon's shopping power, all powered by cutting-edge AI.
              </p>
            </CardContent>
          </Card>

          {/* What Makes Us Different */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-6 h-6 text-primary" />
                What Makes Ezyify Different
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="p-4 bg-accent rounded-2xl border border-border">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <ShoppingBag className="w-5 h-5 text-primary" />
                    Invisible Commerce
                  </h3>
                  <p className="text-sm text-foreground">
                    Products appear naturally within content. Tag items in posts, videos, and live streams. 
                    Purchase in one tap without leaving the moment.
                  </p>
                </div>

                <div className="p-4 bg-accent rounded-2xl border border-border">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="w-5 h-5 text-primary" />
                    Creator-First Economy
                  </h3>
                  <p className="text-sm text-foreground">
                    Creators earn through affiliate commissions, product sales, and live commerce. 
                    Monetization is built-in, not bolted-on.
                  </p>
                </div>

                <div className="p-4 bg-primary/10 dark:bg-primary/20 rounded-2xl border border-primary/20">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    AI-Powered Discovery
                  </h3>
                  <p className="text-sm text-foreground">
                    Our AI learns your taste, surfaces products you'll love, and personalizes 
                    every scroll. Smart recommendations that actually understand you.
                  </p>
                </div>

                <div className="p-4 bg-warning/10 dark:bg-warning/20 rounded-2xl border border-warning/30">
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Heart className="w-5 h-5 text-warning" />
                    Community-Driven Trust
                  </h3>
                  <p className="text-sm text-foreground">
                    Every seller is verified. Reviews come from real buyers. Social proof 
                    is built into every product through authentic content.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card className="mb-8 bg-accent/30 dark:bg-accent/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-primary" />
                Ezyify by the Numbers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">100K+</div>
                  <div className="text-sm text-muted-foreground">Active Creators</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">5M+</div>
                  <div className="text-sm text-muted-foreground">Products Listed</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-primary mb-1">50M+</div>
                  <div className="text-sm text-muted-foreground">Monthly Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-warning mb-1">25+</div>
                  <div className="text-sm text-muted-foreground">Countries</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Our Values */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="w-6 h-6 text-primary" />
                Our Core Values
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-primary/20 dark:bg-primary/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">1</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Creators First</h3>
                    <p className="text-sm text-foreground">
                      We empower creators to turn their passion into income. Their success is our success.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">2</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Trust & Safety</h3>
                    <p className="text-sm text-foreground">
                      Every seller is verified. Every transaction is protected. Safety is non-negotiable.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold">3</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Innovation Always</h3>
                    <p className="text-sm text-foreground">
                      We're constantly pushing boundaries with AI, AR, and new technologies.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-warning/20 dark:bg-warning/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-warning font-bold">4</span>
                  </div>
                  <div>
                    <h3 className="font-semibold mb-1">Community & Authenticity</h3>
                    <p className="text-sm text-foreground">
                      Real people, real reviews, real connections. We reject fake everything.
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vision for the Future */}
          <Card className="mb-8 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-6 h-6 text-primary" />
                Our Vision for the Future
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-foreground">
                We're building the <strong>operating system for the creator economy</strong>. 
                In the next 5 years, we envision:
              </p>
              <ul className="space-y-2 text-foreground ml-6">
                <li>• <strong>1 billion users</strong> discovering products through social content</li>
                <li>• <strong>10 million creators</strong> earning sustainable income</li>
                <li>• <strong>Virtual storefronts</strong> powered by AR and VR experiences</li>
                <li>• <strong>AI agents</strong> that shop for you based on your taste</li>
                <li>• <strong>Global reach</strong> connecting creators and consumers worldwide</li>
              </ul>
            </CardContent>
          </Card>

          {/* Join Us CTA */}
          <div className="text-center p-8 rounded-2xl text-white" style={{ background: "var(--brand-gradient)" }}>
            <h2 className="text-3xl mb-3">Join the Revolution</h2>
            <p className="text-lg mb-6 opacity-90">
              Whether you're a creator, seller, or shopper, there's a place for you on Ezyify.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/signup" className="px-6 py-3 bg-white/15 hover:bg-white/25 border border-white/30 text-white rounded-xl font-semibold transition-colors">
                Get Started
              </Link>
              <Link to="/careers" className="px-6 py-3 bg-white text-primary rounded-xl font-semibold hover:bg-white/90 transition-colors">
                Join Our Team
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}