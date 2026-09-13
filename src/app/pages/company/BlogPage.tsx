import { SEO } from '../../components/SEO';
import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import { Calendar, User, Clock, ArrowRight, TrendingUp, Star, Heart } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';

export default function BlogPage() {
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

  const featuredPost = {
    id: 1,
    title: 'The Future of Social Commerce: How Ezyify is Leading the Revolution',
    excerpt: 'Discover how we\'re transforming the way people shop, connect, and create in the digital age with seamless social commerce experiences.',
    author: 'Sarah Johnson',
    authorImage: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
    date: 'January 10, 2026',
    readTime: '8 min read',
    category: 'Industry Insights',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=600&fit=crop',
    featured: true
  };

  const blogPosts = [
    {
      id: 2,
      title: '10 Tips for Creators to Maximize Earnings on Ezyify',
      excerpt: 'Expert strategies to grow your audience and increase revenue through our creator monetization features.',
      author: 'Michael Chen',
      authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      date: 'January 8, 2026',
      readTime: '6 min read',
      category: 'Creator Tips',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=400&fit=crop',
      likes: 234
    },
    {
      id: 3,
      title: 'How to Build a Successful Brand on Ezyify',
      excerpt: 'A comprehensive guide for sellers to establish and grow their brand presence on our platform.',
      author: 'Emma Wilson',
      authorAvatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      date: 'January 6, 2026',
      readTime: '10 min read',
      category: 'Seller Success',
      image: 'https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=800&h=400&fit=crop',
      likes: 189
    },
    {
      id: 4,
      title: 'New AR Features: Virtual Try-Before-You-Buy',
      excerpt: 'Explore our latest augmented reality features that let shoppers visualize products in their space.',
      author: 'David Martinez',
      authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100',
      date: 'January 4, 2026',
      readTime: '5 min read',
      category: 'Product Updates',
      image: 'https://images.unsplash.com/photo-1617802690992-15d93263d3a9?w=800&h=400&fit=crop',
      likes: 312
    },
    {
      id: 5,
      title: 'The Psychology of Social Shopping',
      excerpt: 'Understanding how social interactions influence purchasing decisions and drive engagement.',
      author: 'Lisa Anderson',
      authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100',
      date: 'January 2, 2026',
      readTime: '7 min read',
      category: 'Industry Insights',
      image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?w=800&h=400&fit=crop',
      likes: 267
    },
    {
      id: 6,
      title: 'Sustainability in E-Commerce: Our Commitment',
      excerpt: 'Learn about Ezyify\'s initiatives to promote eco-friendly practices and sustainable shopping.',
      author: 'James Kim',
      authorAvatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100',
      date: 'December 30, 2025',
      readTime: '6 min read',
      category: 'Company News',
      image: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&h=400&fit=crop',
      likes: 198
    },
    {
      id: 7,
      title: 'Live Shopping Events: A Complete Guide',
      excerpt: 'Everything you need to know about hosting successful live shopping events on Ezyify.',
      author: 'Rachel Green',
      authorAvatar: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100',
      date: 'December 28, 2025',
      readTime: '9 min read',
      category: 'Creator Tips',
      image: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&h=400&fit=crop',
      likes: 421
    }
  ];

  const categories = [
    'All Posts',
    'Industry Insights',
    'Creator Tips',
    'Seller Success',
    'Product Updates',
    'Company News'
  ];

  return (
          <div className="min-h-screen bg-background pb-20 lg:pb-0">
      <SEO title="Blog — Insights & Updates" description="Ezyify blog — insights, creator tips, seller guides, and news from our E-Commerce Social Media Ecosystem." />
      {/* Header */}
      <div className="py-16 text-white" style={{ background: "var(--brand-gradient)" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="max-w-3xl">
            <h1 className="text-4xl sm:text-5xl font-bold mb-4">Ezyify Blog</h1>
            <p className="text-xl text-white/85">
              Insights, tips, and stories from the Ezyify ecosystem
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        {isLoading ? (
          <>
            {/* Featured Post Skeleton */}
            <div className="mb-12">
              <Card className="overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Skeleton className="aspect-[16/10] lg:aspect-auto" />
                  <CardContent className="p-6 lg:p-8 flex flex-col justify-center">
                    <Skeleton className="h-5 w-24 mb-4" />
                    <Skeleton className="h-8 w-full mb-2" />
                    <Skeleton className="h-8 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-6" />
                    <div className="flex items-center gap-4 mb-6">
                      <Skeleton className="w-12 h-12 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-4 w-32 mb-2" />
                        <Skeleton className="h-3 w-40" />
                      </div>
                    </div>
                    <Skeleton className="h-10 w-full sm:w-40" />
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Category Filters Skeleton */}
            <div className="mb-8 overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <Skeleton key={i} className="h-8 w-28" />
                ))}
              </div>
            </div>

            {/* Blog Posts Grid Skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i} className="overflow-hidden">
                  <Skeleton className="aspect-[16/9]" />
                  <CardContent className="p-5">
                    <Skeleton className="h-6 w-full mb-2" />
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-5/6 mb-4" />
                    <div className="flex items-center gap-3 mb-4">
                      <Skeleton className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <Skeleton className="h-3 w-24 mb-1" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-4 border-t">
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-4 w-12" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Featured Post */}
            <div className="mb-12">
              <Card className="overflow-hidden hover:shadow-xl transition-shadow">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div className="relative aspect-[16/10] lg:aspect-auto">
                    <img
                      loading="lazy" 
                      src={featuredPost.image} 
                      alt={featuredPost.title}
                      className="w-full h-full object-cover"
                    />
                    <Badge className="absolute top-4 left-4 bg-primary">
                      <Star className="w-3 h-3 mr-1" />
                      Featured
                    </Badge>
                  </div>
                  <CardContent className="p-6 lg:p-8 flex flex-col justify-center">
                    <Badge className="w-fit mb-4">{featuredPost.category}</Badge>
                    <h2 className="text-2xl sm:text-3xl font-bold mb-4">{featuredPost.title}</h2>
                    <p className="text-muted-foreground mb-6">{featuredPost.excerpt}</p>
                    <div className="flex items-center gap-4 mb-6">
                      <img
                      loading="lazy" 
                        src={featuredPost.authorImage}
                        alt={featuredPost.author}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{featuredPost.author}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="w-4 h-4" />
                          {featuredPost.date}
                          <Clock className="w-4 h-4 ml-2" />
                          {featuredPost.readTime}
                        </div>
                      </div>
                    </div>
                    <Button className="w-full sm:w-auto">
                      Read Article
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </div>
              </Card>
            </div>

            {/* Category Filters */}
            <div className="mb-8 overflow-x-auto">
              <div className="flex gap-2 pb-2">
                {categories.map((category, index) => (
                  <Button
                    key={index}
                    variant={index === 0 ? "default" : "outline"}
                    size="sm"
                    className="whitespace-nowrap"
                  >
                    {category}
                  </Button>
                ))}
              </div>
            </div>

            {/* Blog Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {blogPosts.map((post) => (
                <Card key={post.id} className="overflow-hidden hover:shadow-lg transition-shadow group">
                  <div className="relative aspect-[16/9] overflow-hidden">
                    <img
                      loading="lazy" 
                      src={post.image} 
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                    />
                    <Badge className="absolute top-3 left-3">{post.category}</Badge>
                  </div>
                  <CardContent className="p-5">
                    <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                      {post.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{post.excerpt}</p>
                    
                    <div className="flex items-center gap-3 mb-4">
                      <img
                      loading="lazy" 
                        src={post.authorAvatar} 
                        alt={post.author}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{post.author}</p>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="w-3 h-3" />
                          {post.date}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4" />
                        {post.readTime}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Heart className="w-4 h-4" />
                        {post.likes}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center mt-12">
              <Button size="lg" variant="outline">
                Load More Articles
              </Button>
            </div>

            {/* Newsletter CTA */}
            <div className="mt-16 bg-primary rounded-2xl p-8 text-primary-foreground text-center">
              <h2 className="text-2xl sm:text-3xl font-bold mb-3">Never Miss an Update</h2>
              <p className="text-white/85 mb-6 max-w-2xl mx-auto">
                Subscribe to our newsletter and get the latest insights delivered to your inbox
              </p>
              <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-1 px-4 py-3 rounded-xl text-foreground bg-card focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
                <Button className="bg-card text-primary hover:bg-muted">
                  Subscribe
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}