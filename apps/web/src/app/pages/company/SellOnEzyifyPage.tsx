import { SEO } from '../../components/SEO';
import { Users, TrendingUp, Zap, DollarSign, Shield, CheckCircle, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Link } from 'react-router';

export default function SellOnEzyifyPage() {
  const benefits = [
    {
      icon: Users,
      title: 'Reach 50M+ Active Users',
      description: 'Access our massive, engaged audience of shoppers discovering products through social content.'
    },
    {
      icon: TrendingUp,
      title: 'Creator-Powered Growth',
      description: 'Creators organically promote your products. Pay only when they drive sales through affiliate commissions.'
    },
    {
      icon: Zap,
      title: 'Invisible Commerce',
      description: 'Your products appear naturally in posts, videos, and live streams. Shopping feels like scrolling.'
    },
    {
      icon: DollarSign,
      title: 'Low Fees, High Returns',
      description: 'Competitive 5-18% commission (category-based). No listing fees or monthly costs.'
    },
    {
      icon: Shield,
      title: 'Secure & Protected',
      description: 'Encrypted payments, fraud protection, and dispute resolution built-in.'
    }
  ];

  const steps = [
    {
      step: 1,
      title: 'Sign Up & Verify',
      description: 'Create your seller account and complete KYC verification (ID, business info, payment details).'
    },
    {
      step: 2,
      title: 'Set Up Your Store',
      description: 'Customize your storefront, add branding, and create your first product listings.'
    },
    {
      step: 3,
      title: 'Get Discovered',
      description: 'Creators tag your products in their content. You pay only when they drive sales.'
    },
    {
      step: 4,
      title: 'Sell & Grow',
      description: 'Fulfill orders, manage inventory, and scale your business with our tools.'
    }
  ];

  const features = [
    'Product catalog management',
    'Inventory tracking',
    'Order management dashboard',
    'Real-time analytics & insights',
    'Logistics & shipping integration',
    'Automated payout system',
    'Creator collaboration tools',
    'Live shopping capabilities',
    'AR product visualization',
    'Multi-channel support',
    'Marketing & promotions',
    '24/7 seller support'
  ];

  const pricing = [
    { category: 'Electronics', commission: '5-8%' },
    { category: 'Fashion & Apparel', commission: '10-15%' },
    { category: 'Beauty & Personal Care', commission: '12-18%' },
    { category: 'Home & Lifestyle', commission: '8-12%' },
    { category: 'Digital Products', commission: '8-12%' }
  ];

  return (
          <div className="max-w-6xl mx-auto px-4 pb-8">
      <SEO title="Sell on Ezyify" description="Join thousands of sellers on Ezyify. Reach millions of shoppers through our E-Commerce Social Media Ecosystem." />
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6" style={{ background: 'var(--brand-gradient)' }}>
          <Store className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
          Sell on Ezyify
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">
          Join thousands of sellers reaching millions of shoppers on Ezyify's E-Commerce Social Media Ecosystem.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/seller-dashboard">
            <button
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-white shadow-brand hover:shadow-brand-lg transition-all hover:scale-[1.02]"
              style={{ background: 'var(--brand-gradient)' }}
            >
              Start Selling Now
            </button>
          </Link>
          <Link to="/contact?topic=seller">
            <Button size="lg" variant="outline">
              Talk to Sales Team
            </Button>
          </Link>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Why Sell on Ezyify */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">Why Sell on Ezyify?</h2>
          <div className="grid md:grid-cols-3 gap-6">
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

        {/* How It Works */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center mb-8">How It Works?</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map((step, idx) => (
              <div key={idx} className="text-center">
                <div className="w-16 h-16 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold" style={{background: "var(--brand-gradient)" }}>
                  {step.step}
                </div>
                <h3 className="font-semibold mb-2">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Simple, Transparent Pricing</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-6">
              We only succeed when you succeed. Pay a small commission on sales — no hidden fees, 
              no monthly subscriptions, no listing costs.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {pricing.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl">
                  <span className="font-medium">{item.category}</span>
                  <Badge variant="secondary" className="text-sm">{item.commission}</Badge>
                </div>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              * Commission is deducted automatically at checkout. Exact rates may vary by product and promotion.
            </p>
          </CardContent>
        </Card>

        {/* Seller Tools & Features */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Powerful Seller Tools</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              {features.map((feature, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">{feature}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Success Stories */}
        <Card className="mb-12 bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Seller Success Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl font-bold text-primary mb-2">3.5x</div>
                <p className="text-sm text-muted-foreground">Average sales increase in first 3 months</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-info mb-2">$250K</div>
                <p className="text-sm text-muted-foreground">Average monthly revenue for top sellers</p>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-success mb-2">92%</div>
                <p className="text-sm text-muted-foreground">Seller satisfaction rate</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Requirements */}
        <Card className="mb-12">
          <CardHeader>
            <CardTitle className="text-2xl">Seller Requirements</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">To maintain trust and quality, all sellers must:</p>
            <ul className="space-y-2 text-muted-foreground">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <span>Complete identity verification (KYC) - government ID and business documentation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <span>Provide accurate product information and images</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <span>Ship orders within 2-3 business days</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <span>Maintain at least 4.0-star average rating</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
                <span>Follow our <Link to="/community-guidelines" className="text-primary hover:underline">Community Guidelines</Link> and seller policies</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center p-10 rounded-2xl text-white" style={{ background: 'var(--brand-gradient)' }}>
          <h2 className="text-3xl mb-3">Ready to Start Selling?</h2>
          <p className="text-lg mb-6 opacity-90 max-w-2xl mx-auto">
            Join Ezyify today and reach millions of shoppers through our E-Commerce Social Media Ecosystem.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-lg px-8">
              <Store className="w-5 h-5 mr-2" />
              Create Seller Account
            </Button>
            <Button size="lg" variant="outline" className="bg-transparent text-white border-white hover:bg-white/10">
              Learn More
            </Button>
          </div>
          <p className="text-sm mt-6 opacity-80">
            Questions? Email <a href="mailto:sellers@ezyify.app" className="underline font-medium">sellers@ezyify.app</a>
          </p>
        </div>
      </div>
    </div>
  );
}