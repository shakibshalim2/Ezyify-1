import { SEO } from '../../components/SEO';
import { Star, TrendingUp, Users, DollarSign, Quote } from 'lucide-react';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export default function SuccessStoriesPage() {
  const successStories = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Fashion Creator',
      username: '@fashionista_sarah',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300',
      coverImage: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=1200&h=400&fit=crop',
      story: 'Started with 500 followers, now reaching 2M+ monthly viewers and earning $50K+ per month through creator programs and affiliate partnerships.',
      stats: {
        followers: '2.1M',
        monthlyEarnings: '$52K',
        engagement: '8.5%',
        growth: '+340%'
      },
      quote: 'Ezyify transformed my passion into a full-time career. The monetization tools and engaged community are unmatched.',
      category: 'Creator'
    },
    {
      id: 2,
      name: 'TechHub Electronics',
      role: 'Electronics Seller',
      username: '@techhub_official',
      avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300',
      coverImage: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?w=1200&h=400&fit=crop',
      story: 'Small electronics shop that scaled to $500K monthly revenue within 12 months by leveraging live shopping and creator partnerships.',
      stats: {
        monthlyRevenue: '$520K',
        orders: '12K+',
        avgRating: '4.9/5',
        growth: '+620%'
      },
      quote: 'The combination of social features and commerce made it easy to build trust and scale rapidly.',
      category: 'Seller'
    },
    {
      id: 3,
      name: 'Michael Chen',
      role: 'Fitness Influencer',
      username: '@fitlife_michael',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
      coverImage: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&h=400&fit=crop',
      story: 'Built a fitness empire through live workout sessions, product reviews, and affiliate sales, earning over $35K monthly.',
      stats: {
        followers: '890K',
        monthlyEarnings: '$38K',
        liveViewers: '25K',
        growth: '+280%'
      },
      quote: 'Live streaming features and instant shopping integration changed everything for my business.',
      category: 'Creator'
    },
    {
      id: 4,
      name: 'Bella Beauty Co.',
      role: 'Beauty & Cosmetics',
      username: '@bellbeauty',
      avatar: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=300',
      coverImage: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&h=400&fit=crop',
      story: 'Launched beauty brand from zero and reached $200K monthly sales through creator collaborations and viral product launches.',
      stats: {
        monthlyRevenue: '$215K',
        products: '156',
        collaborations: '45',
        growth: '+450%'
      },
      quote: 'Creator partnerships on Ezyify helped us reach millions of potential customers organically.',
      category: 'Seller'
    },
    {
      id: 5,
      name: 'Emma Wilson',
      role: 'Lifestyle Vlogger',
      username: '@emmastyle',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=300',
      coverImage: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=1200&h=400&fit=crop',
      story: 'College student turned full-time creator, earning $45K monthly through brand deals, affiliate sales, and exclusive content.',
      stats: {
        followers: '1.5M',
        monthlyEarnings: '$47K',
        engagement: '9.2%',
        growth: '+520%'
      },
      quote: 'I never imagined I could make this much doing what I love. Ezyify made it possible.',
      category: 'Creator'
    },
    {
      id: 6,
      name: 'Urban Home Decor',
      role: 'Home & Living',
      username: '@urbanhome',
      avatar: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=300',
      coverImage: 'https://images.unsplash.com/photo-1556912173-46c336c7fd55?w=1200&h=400&fit=crop',
      story: 'Family business that tripled revenue by showcasing products through creator content and leveraging AR try-on features.',
      stats: {
        monthlyRevenue: '$180K',
        orders: '8.5K',
        avgRating: '4.8/5',
        growth: '+310%'
      },
      quote: 'The AR features and creator marketplace were game-changers for our home decor business.',
      category: 'Seller'
    }
  ];

  return (
          <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <SEO title="Success Stories" description="Real success stories from creators and sellers thriving on Ezyify — the E-Commerce Social Media Ecosystem." />
      {/* Hero Section */}
      <div className="py-20 text-white" style={{ background: "var(--brand-gradient)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">Success Stories</h1>
            <p className="text-xl sm:text-2xl text-white/90 mb-8">
              Real people, real results. Discover how creators and sellers are building thriving businesses on Ezyify
            </p>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 -mt-12 mb-12">
        <div className="grid md:grid-cols-4 gap-6">
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold mb-1">10M+</p>
            <p className="text-sm text-muted-foreground">Active Creators</p>
          </CardContent>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold mb-1">$2B+</p>
            <p className="text-sm text-muted-foreground">Creator Earnings</p>
          </CardContent>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold mb-1">350%</p>
            <p className="text-sm text-muted-foreground">Avg. Growth Rate</p>
          </CardContent>
          <CardContent className="p-6 text-center">
            <p className="text-3xl font-bold mb-1">4.8/5</p>
            <p className="text-sm text-muted-foreground">Avg. Satisfaction</p>
          </CardContent>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 mb-8">
        <div className="flex flex-wrap gap-3">
          <Button variant="default">All Stories</Button>
          <Button variant="outline">Creators</Button>
          <Button variant="outline">Sellers</Button>
          <Button variant="outline">Live Shopping</Button>
          <Button variant="outline">Affiliates</Button>
        </div>
      </div>

      {/* Success Stories */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="space-y-8">
          {successStories.map((story) => (
            <Card key={story.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48 sm:h-64">
                <img
                      loading="lazy" 
                  src={story.coverImage} 
                  alt={story.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <Badge className="absolute top-4 left-4">{story.category}</Badge>
              </div>
              
              <CardContent className="p-6 sm:p-8">
                <div className="flex flex-col sm:flex-row gap-6">
                  {/* Avatar & Info */}
                  <div className="flex sm:flex-col items-center sm:items-start gap-4 sm:gap-3">
                    <img
                      loading="lazy" 
                      src={story.avatar} 
                      alt={story.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                    <div className="sm:text-center">
                      <h3 className="text-xl font-bold">{story.name}</h3>
                      <p className="text-muted-foreground">{story.role}</p>
                      <p className="text-sm text-primary">{story.username}</p>
                    </div>
                  </div>

                  {/* Story Content */}
                  <div className="flex-1">
                    <div className="mb-6">
                      <Quote className="w-8 h-8 text-primary mb-3" />
                      <p className="text-lg italic text-muted-foreground mb-4">\"{story.quote}\"</p>
                      <p className="text-muted-foreground">{story.story}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {Object.entries(story.stats).map(([key, value]) => (
                        <div key={key} className="bg-muted rounded-2xl p-3 text-center">
                          <p className="text-xl font-bold text-primary">{value}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
        <div className="rounded-2xl p-8 sm:p-12 text-white text-center" style={{ background: 'var(--brand-gradient)' }}>
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to Write Your Success Story?</h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join millions of creators and sellers building their dreams on Ezyify
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-primary hover:bg-white/90">
              Start Creating
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Start Selling
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}