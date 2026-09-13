import { SEO } from '../../components/SEO';
import { TrendingUp, DollarSign, Users, Globe, BarChart3, PieChart, Download, Mail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';

export default function InvestorsPage() {
  const keyMetrics = [
    {
      icon: Users,
      label: 'Monthly Active Users',
      value: '50M+',
      growth: '+120% YoY',
      color: 'text-info'
    },
    {
      icon: DollarSign,
      label: 'GMV (Gross Merchandise Value)',
      value: '$5.2B',
      growth: '+180% YoY',
      color: 'text-success'
    },
    {
      icon: TrendingUp,
      label: 'Revenue',
      value: '$420M',
      growth: '+150% YoY',
      color: 'text-primary'
    },
    {
      icon: Globe,
      label: 'Markets',
      value: '100+',
      growth: '+25 New',
      color: 'text-like'
    }
  ];

  const financialHighlights = [
    { metric: 'Total Funding Raised', value: '$850M' },
    { metric: 'Latest Valuation', value: '$8.5B' },
    { metric: 'Revenue Growth (YoY)', value: '+150%' },
    { metric: 'Gross Profit Margin', value: '42%' },
    { metric: 'Customer Acquisition Cost', value: '$12' },
    { metric: 'Lifetime Value', value: '$340' }
  ];

  const investors = [
    { name: 'Sequoia Capital', type: 'Lead Series D' },
    { name: 'Andreessen Horowitz', type: 'Series C' },
    { name: 'Tiger Global', type: 'Series D' },
    { name: 'SoftBank Vision Fund', type: 'Series D' },
    { name: 'Accel Partners', type: 'Series B' },
    { name: 'Benchmark', type: 'Series A' }
  ];

  return (
          <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <SEO title="Investor Relations" description="Ezyify investor relations. Leading the E-Commerce Social Media Ecosystem revolution with unprecedented growth." />
      {/* Hero Section */}
      <div className="py-20 text-white" style={{ background: "var(--brand-gradient)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Investor Relations</h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8">
              Leading the E-Commerce Social Media Ecosystem revolution with unprecedented growth and innovation
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                <Download className="w-5 h-5 mr-2" />
                Download Investor Deck
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                <Mail className="w-5 h-5 mr-2" />
                Contact IR Team
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {/* Key Metrics */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Key Performance Metrics</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {keyMetrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <Card key={index}>
                  <CardContent className="p-6">
                    <Icon className={`w-10 h-10 ${metric.color} mb-4`} />
                    <p className="text-sm text-muted-foreground mb-1">{metric.label}</p>
                    <p className="text-3xl font-bold mb-2">{metric.value}</p>
                    <p className="text-sm text-primary font-medium">{metric.growth}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Investment Thesis */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Investment Thesis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Market Opportunity</h3>
                <p className="text-muted-foreground">
                  The global social commerce market is projected to reach $2.9 trillion by 2026, growing at a CAGR of 28.4%. 
                  Ezyify is uniquely positioned to capture significant market share through our innovative platform that seamlessly 
                  integrates social media, e-commerce, and creator economy.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Competitive Advantages</h3>
                <ul className="list-disc list-inside text-muted-foreground space-y-2">
                  <li>First-mover advantage in integrated E-Commerce Social Media Ecosystem</li>
                  <li>Proprietary AI-driven recommendation engine with 3.5x industry average conversion</li>
                  <li>Largest creator marketplace with 10M+ active creators</li>
                  <li>Advanced live shopping technology with AR/VR integration</li>
                  <li>Strong network effects and high customer retention (85% annual retention)</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Growth Strategy</h3>
                <p className="text-muted-foreground">
                  Aggressive international expansion, strategic acquisitions in complementary verticals, 
                  and continuous product innovation focused on AI, AR/VR, and blockchain integration for 
                  next-generation commerce experiences.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Financial Highlights */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Financial Highlights</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
            {financialHighlights.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-6 text-center">
                  <p className="text-sm text-muted-foreground mb-2">{item.metric}</p>
                  <p className="text-2xl font-bold text-primary">{item.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Growth Charts Placeholder */}
        <div className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Revenue & User Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-[2/1] bg-muted rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Growth charts and detailed analytics available in investor deck</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Our Investors */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">Our Investors</h2>
          <Card>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {investors.map((investor, index) => (
                  <div key={index} className="border-l-4 border-primary pl-4">
                    <h3 className="font-bold text-lg">{investor.name}</h3>
                    <p className="text-sm text-muted-foreground">{investor.type}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ESG & Impact */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold mb-8">ESG & Social Impact</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">Environmental</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Carbon-neutral operations by 2025</li>
                  <li>• Sustainable packaging initiatives</li>
                  <li>• Green logistics partnerships</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">Social</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• $100M creator fund</li>
                  <li>• Small business support programs</li>
                  <li>• Financial inclusion initiatives</li>
                </ul>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <h3 className="font-bold text-lg mb-3">Governance</h3>
                <ul className="text-sm text-muted-foreground space-y-2">
                  <li>• Independent board members</li>
                  <li>• Transparent reporting</li>
                  <li>• Strong ethics compliance</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Contact IR */}
        <div className="rounded-2xl p-8 text-white text-center" style={{ background: "var(--brand-gradient)" }}>
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Investor Relations Contact</h2>
          <p className="text-white/90 mb-6">
            For investor inquiries, financial reports, or partnership opportunities
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <div>
              <p className="text-sm text-white/80 mb-1">Email</p>
              <a href="mailto:ir@ezyify.com" className="font-medium hover:underline">
                ir@ezyify.com
              </a>
            </div>
            <div className="hidden sm:block w-px bg-white/30"></div>
            <div>
              <p className="text-sm text-white/80 mb-1">Phone</p>
              <p className="font-medium">+1 (555) 123-4567</p>
            </div>
            <div className="hidden sm:block w-px bg-white/30"></div>
            <div>
              <p className="text-sm text-white/80 mb-1">Office</p>
              <p className="font-medium">San Francisco, CA</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}