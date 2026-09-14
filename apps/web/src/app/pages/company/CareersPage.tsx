import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Briefcase, MapPin, Clock, DollarSign, Heart, Users, Zap, Globe, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

export default function CareersPage() {
  const [isLoading, setIsLoading] = useState(true);

  // Progressive loading
  useEffect(() => {
    const loadData = () => {
      setIsLoading(false);
    };

    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => loadData(), { timeout: 100 });
    } else {
      setTimeout(loadData, 0);
    }
  }, []);

  const openPositions = [
    {
      title: 'Senior Frontend Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA / Remote',
      type: 'Full-time',
      salary: '$150k - $200k',
      description: 'Build the future of the E-Commerce Social Media Ecosystem with React, TypeScript, and cutting-edge web technologies.'
    },
    {
      title: 'Product Designer (Social Commerce)',
      department: 'Design',
      location: 'San Francisco, CA / Remote',
      type: 'Full-time',
      salary: '$130k - $170k',
      description: 'Design seamless shopping experiences that feel like social engagement.'
    },
    {
      title: 'AI/ML Engineer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$160k - $220k',
      description: 'Build recommendation systems and personalization algorithms that power discovery.'
    },
    {
      title: 'Creator Success Manager',
      department: 'Creator Relations',
      location: 'Los Angeles, CA / Remote',
      type: 'Full-time',
      salary: '$80k - $110k',
      description: 'Help top creators grow their presence and monetize effectively on Ezyify.'
    },
    {
      title: 'Trust & Safety Specialist',
      department: 'Trust & Safety',
      location: 'Remote',
      type: 'Full-time',
      salary: '$70k - $95k',
      description: 'Keep our community safe by reviewing content and enforcing policies.'
    },
    {
      title: 'Growth Marketing Lead',
      department: 'Marketing',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$120k - $160k',
      description: 'Drive user acquisition and retention through data-driven marketing strategies.'
    }
  ];

  const benefits = [
    {
      icon: Heart,
      title: 'Health & Wellness',
      description: 'Comprehensive medical, dental, and vision coverage. Mental health support and gym membership.'
    },
    {
      icon: DollarSign,
      title: 'Competitive Compensation',
      description: 'Top-of-market salary, equity, and performance bonuses. Annual raises based on impact.'
    },
    {
      icon: Clock,
      title: 'Flexible Work',
      description: 'Remote-first culture with flexible hours. Unlimited PTO and work-life balance focus.'
    },
    {
      icon: Zap,
      title: 'Learning & Growth',
      description: '$2,000 annual learning budget. Conference attendance and skill development support.'
    },
    {
      icon: Users,
      title: 'Inclusive Culture',
      description: 'Diverse team from 30+ countries. ERGs and inclusive policies for all backgrounds.'
    },
    {
      icon: Globe,
      title: 'Global Impact',
      description: 'Work on a product used by millions. Shape the E-Commerce Social Media Ecosystem worldwide.'
    }
  ];

  const values = [
    {
      title: 'Creators First',
      description: 'Everything we build empowers creators to turn passion into income.'
    },
    {
      title: 'Move Fast, Think Long-Term',
      description: 'Ship quickly but build for the future. Speed with sustainability.'
    },
    {
      title: 'Transparency Always',
      description: 'Open communication, honest feedback, and radical candor at all levels.'
    },
    {
      title: 'Better Together',
      description: 'Collaboration over competition. We win as a team.'
    }
  ];

  return (
          <div className="max-w-6xl mx-auto px-4 py-8">
      <SEO title="Careers at Ezyify" description="Build the E-Commerce Social Media Ecosystem with us. Explore open roles at Ezyify." />
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-accent rounded-full mb-6">
          <Briefcase className="w-10 h-10 text-primary" />
        </div>
        <h1 className="text-4xl sm:text-5xl font-bold mb-4">
          Join the Ezyify Team
        </h1>
        <p className="text-xl text-white/85 max-w-2xl mx-auto leading-relaxed mb-6">
          Help us build the E-Commerce Social Media Ecosystem. We're looking for passionate, 
          talented people who want to make a global impact.
        </p>
        <div className="flex gap-3 justify-center">
          <Badge variant="secondary" className="text-sm">50M+ Users</Badge>
          <Badge variant="secondary" className="text-sm">$100M+ Funding</Badge>
          <Badge variant="secondary" className="text-sm">25+ Countries</Badge>
        </div>
      </div>

      {isLoading ? (
        <>
          {/* Why Ezyify Skeleton */}
          <Card className="mb-12">
            <CardHeader>
              <Skeleton className="h-7 w-40" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-full mb-2" />
              <Skeleton className="h-5 w-3/4 mb-6" />
              <div className="grid md:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="p-4 bg-card rounded-2xl">
                    <Skeleton className="h-5 w-32 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Benefits Skeleton */}
          <div className="mb-12">
            <Skeleton className="h-9 w-48 mx-auto mb-8" />
            <div className="grid md:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <Skeleton className="w-12 h-12 rounded-full mb-4" />
                    <Skeleton className="h-5 w-40 mb-2" />
                    <Skeleton className="h-4 w-full mb-1" />
                    <Skeleton className="h-4 w-5/6" />
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Values Skeleton */}
          <Card className="mb-12">
            <CardHeader>
              <Skeleton className="h-7 w-32" />
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="flex items-start gap-3">
                    <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Open Positions Skeleton */}
          <div className="mb-12">
            <Skeleton className="h-9 w-48 mx-auto mb-8" />
            <div className="space-y-4">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <Skeleton className="h-6 w-64 mb-3" />
                        <Skeleton className="h-4 w-full mb-2" />
                        <Skeleton className="h-4 w-3/4 mb-3" />
                        <div className="flex flex-wrap gap-3">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-4 w-24" />
                          <Skeleton className="h-4 w-28" />
                        </div>
                      </div>
                      <Skeleton className="h-10 w-32" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Why Ezyify */}
          <Card className="mb-12 bg-accent border-border">
            <CardHeader>
              <CardTitle className="text-2xl">Why Ezyify?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-lg text-muted-foreground mb-6">
                We're not just another tech company. Ezyify is reimagining how 3 billion people 
                discover and buy products. Join us to work on challenges that matter:
              </p>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-card rounded-2xl">
                  <h3 className="font-semibold mb-2">🚀 Massive Scale</h3>
                  <p className="text-sm text-muted-foreground">Build systems serving millions of daily users across the globe</p>
                </div>
                <div className="p-4 bg-card rounded-2xl">
                  <h3 className="font-semibold mb-2">🤖 AI-Powered</h3>
                  <p className="text-sm text-muted-foreground">Work with cutting-edge AI/ML for recommendations and personalization</p>
                </div>
                <div className="p-4 bg-card rounded-2xl">
                  <h3 className="font-semibold mb-2">💰 Real Impact</h3>
                  <p className="text-sm text-muted-foreground">Directly impact creator livelihoods and the future of commerce</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Benefits */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Benefits & Perks</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {benefits.map((benefit, idx) => (
                <Card key={idx}>
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center mb-4">
                      <benefit.icon className="w-6 h-6 text-primary" />
                    </div>
                    <h3 className="font-semibold mb-2">{benefit.title}</h3>
                    <p className="text-sm text-muted-foreground">{benefit.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Our Values */}
          <Card className="mb-12">
            <CardHeader>
              <CardTitle className="text-2xl">Our Values</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                {values.map((value, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-accent rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-primary font-bold">{idx + 1}</span>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-1">{value.title}</h3>
                      <p className="text-sm text-muted-foreground">{value.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Open Positions */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-center mb-8">Open Positions</h2>
            <div className="space-y-4">
              {openPositions.map((position, idx) => (
                <Card key={idx} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{position.title}</h3>
                          <Badge variant="secondary">{position.department}</Badge>
                        </div>
                        <p className="text-muted-foreground mb-3">{position.description}</p>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {position.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {position.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="w-4 h-4" />
                            {position.salary}
                          </span>
                        </div>
                      </div>
                      <Button onClick={() => toast.info(`Application for "${position.title}" coming soon! Send your resume to careers@ezyify.com`)}>
                        Apply Now
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="text-center p-8 bg-primary rounded-xl text-primary-foreground">
            <h2 className="text-3xl mb-3">Don't See Your Role?</h2>
            <p className="text-lg mb-6 opacity-90">
              We're always looking for exceptional talent. Send us your resume!
            </p>
            <Button size="lg" variant="secondary">
              <Briefcase className="w-5 h-5 mr-2" />
              Send General Application
            </Button>
            <p className="text-sm mt-4 opacity-80">
              Or email us at <a href="mailto:careers@ezyify.com" className="underline font-medium">careers@ezyify.com</a>
            </p>
          </div>
        </>
      )}
    </div>
  );
}