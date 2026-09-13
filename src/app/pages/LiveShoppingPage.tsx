import { SEO } from '../components/SEO';
import { VerifiedBadge } from '../components/VerifiedBadge';
import { Card, CardContent } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Skeleton } from '../components/ui/skeleton';
import { 
  Heart, Share2, Users, Eye, ChevronRight, Bell, Clock, TrendingUp,
  Filter
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { motion } from 'motion/react';

interface LiveStream {
  id: string;
  title: string;
  host: {
    name: string;
    username: string;
    avatar: string;
    verified: boolean;
  };
  thumbnail: string;
  viewers: number;
  likes: number;
  isLive: boolean;
  category: string;
  startedAt: string;
}

interface UpcomingStream {
  id: string;
  title: string;
  host: string;
  avatar: string;
  scheduledFor: string;
  category: string;
}

interface TopHost {
  id: string;
  name: string;
  username: string;
  avatar: string;
  verified: boolean;
  followers: number;
  avgViewers: number;
}

function LiveShoppingSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="mb-8 pt-6">
          <Skeleton className="h-8 w-40 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        
        {[1, 2].map(section => (
          <div key={section} className="mb-8">
            <Skeleton className="h-6 w-48 mb-4" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="aspect-video rounded-lg" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LiveShoppingPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const handle = requestIdleCallback(() => setIsLoading(false), { timeout: 200 });
      return () => cancelIdleCallback(handle);
    } else {
      const t = setTimeout(() => setIsLoading(false), 50);
      return () => clearTimeout(t);
    }
  }, []);

  if (isLoading) return <LiveShoppingSkeleton />;

  // Mock data
  const liveStreams: LiveStream[] = [
    {
      id: '1',
      title: 'Premium Leather Bags Collection 👜',
      host: { name: 'Fashion Hub', username: 'fashionhub', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', verified: true },
      thumbnail: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=500&h=400&fit=crop',
      viewers: 2847,
      likes: 1205,
      isLive: true,
      category: 'Fashion',
      startedAt: '45 min ago'
    },
    {
      id: '2',
      title: 'Tech Gadgets Flash Sale ⚡',
      host: { name: 'TechStore', username: 'techstore', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', verified: true },
      thumbnail: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=400&fit=crop',
      viewers: 3421,
      likes: 2105,
      isLive: true,
      category: 'Electronics',
      startedAt: '22 min ago'
    },
    {
      id: '3',
      title: 'Skincare Routine Masterclass 💆',
      host: { name: 'Beauty Pro', username: 'beautypro', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', verified: true },
      thumbnail: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=500&h=400&fit=crop',
      viewers: 1923,
      likes: 945,
      isLive: true,
      category: 'Beauty',
      startedAt: '18 min ago'
    },
  ];

  const upcomingStreams: UpcomingStream[] = [
    {
      id: '1',
      title: 'Accessories Bundle Launch',
      host: 'StyleMaven',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100',
      scheduledFor: 'Today at 6:00 PM',
      category: 'Fashion'
    },
    {
      id: '2',
      title: 'Weekend Deals Preview',
      host: 'ShopHub',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100',
      scheduledFor: 'Tomorrow at 3:00 PM',
      category: 'Multi-Category'
    },
    {
      id: '3',
      title: 'Designer Collaboration Special',
      host: 'LuxuryBrand',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100',
      scheduledFor: 'Friday at 8:00 PM',
      category: 'Fashion'
    },
  ];

  const topHosts: TopHost[] = [
    { id: '1', name: 'Fashion Hub', username: 'fashionhub', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', verified: true, followers: 245000, avgViewers: 3500 },
    { id: '2', name: 'TechStore', username: 'techstore', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', verified: true, followers: 189000, avgViewers: 2800 },
    { id: '3', name: 'Beauty Pro', username: 'beautypro', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', verified: true, followers: 156000, avgViewers: 2100 },
    { id: '4', name: 'StyleMaven', username: 'stylemaven', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', verified: true, followers: 98000, avgViewers: 1500 },
  ];

  const categories = ['Fashion', 'Beauty', 'Electronics', 'Home', 'Food'];

  const StreamCard = ({ stream }: { stream: LiveStream }) => (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => navigate(`/live/${stream.id}`)}
      className="cursor-pointer group"
    >
      <Card className="overflow-hidden border-border hover:border-primary/50 transition-colors">
        <CardContent className="p-0">
          {/* Thumbnail */}
          <div className="relative aspect-video bg-muted overflow-hidden">
            <img 
              src={stream.thumbnail} 
              alt={stream.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            
            {/* LIVE badge */}
            {stream.isLive && (
              <Badge className="absolute top-2 left-2 bg-error text-white animate-pulse">
                <span className="inline-block w-2 h-2 rounded-full bg-white mr-1.5" />
                LIVE
              </Badge>
            )}

            {/* Viewers badge */}
            <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/60 text-white px-2 py-1 rounded-full text-xs">
              <Users className="w-3 h-3" />
              {stream.viewers.toLocaleString()}
            </div>

            {/* Host avatar on video */}
            <div className="absolute bottom-2 left-2 flex items-center gap-2">
              <img 
                src={stream.host.avatar} 
                alt={stream.host.name}
                className="w-8 h-8 rounded-full border-2 border-white"
              />
              <div className="text-white">
                <p className="text-xs font-semibold leading-none">{stream.host.name}</p>
                {stream.host.verified && <VerifiedBadge size="sm" />}
              </div>
            </div>
          </div>

          {/* Title & Info */}
          <div className="p-3">
            <h3 className="font-semibold text-foreground text-sm mb-2 line-clamp-2">{stream.title}</h3>
            <div className="flex items-center justify-between gap-2">
              <Badge variant="outline" className="text-xs">{stream.category}</Badge>
              <div className="flex items-center gap-2 text-foreground-secondary text-xs">
                <Heart className="w-3 h-3" />
                {stream.likes.toLocaleString()}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO 
        title="Live Shopping — Ezyify" 
        description="Watch live shopping streams, discover products, and shop with creators in real-time."
      />
      
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {/* Header */}
        <div className="mb-8 pt-6">
          <h1 className="font-display text-2xl font-semibold text-foreground mb-1">Live Shopping</h1>
          <p className="text-sm text-foreground-secondary">Watch live streams and shop in real-time</p>
        </div>

        {/* Live Now Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-error animate-pulse" />
              Live Now
            </h2>
            <Link to="/live-shopping?filter=live" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {liveStreams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {liveStreams.map(stream => (
                <StreamCard key={stream.id} stream={stream} />
              ))}
            </div>
          ) : (
            <Card className="border-border">
              <CardContent className="py-12 text-center">
                <Eye className="w-12 h-12 text-foreground-secondary mx-auto mb-3 opacity-50" />
                <p className="text-foreground-secondary">No live streams right now. Check back soon!</p>
              </CardContent>
            </Card>
          )}
        </section>

        {/* Category Filter */}
        <div className="mb-8 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={categoryFilter === null ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter(null)}
            className="flex-shrink-0"
          >
            <Filter className="w-3 h-3 mr-1.5" />
            All
          </Button>
          {categories.map(cat => (
            <Button
              key={cat}
              variant={categoryFilter === cat ? 'default' : 'outline'}
              size="sm"
              onClick={() => setCategoryFilter(cat)}
              className="flex-shrink-0"
            >
              {cat}
            </Button>
          ))}
        </div>

        {/* Upcoming Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Upcoming
            </h2>
            <Link to="/live-shopping?filter=upcoming" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {upcomingStreams.map(stream => (
              <motion.div
                key={stream.id}
                whileHover={{ x: 4 }}
                className="group cursor-pointer"
                onClick={() => toast.success('Reminder set for this stream!')}
              >
                <Card className="border-border hover:border-primary/50 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 flex gap-3">
                        <img 
                          src={stream.avatar} 
                          alt={stream.host}
                          className="w-12 h-12 rounded-full flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-foreground text-sm mb-1">{stream.title}</p>
                          <p className="text-xs text-foreground-secondary mb-1">by {stream.host}</p>
                          <div className="flex items-center gap-2 text-xs text-foreground-secondary">
                            <Clock className="w-3 h-3" />
                            {stream.scheduledFor}
                          </div>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="flex-shrink-0"
                        onClick={e => {
                          e.stopPropagation();
                          toast.success('Reminder set!');
                        }}
                      >
                        <Bell className="w-4 h-4 mr-1" />
                        Remind
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Top Hosts Section */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-lg font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Hosts
            </h2>
            <Link to="/live-shopping?view=hosts" className="text-sm text-primary hover:underline flex items-center gap-1">
              View All <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {topHosts.map(host => (
              <motion.div
                key={host.id}
                whileHover={{ scale: 1.02 }}
                onClick={() => navigate(`/profile/${host.username}`)}
                className="cursor-pointer"
              >
                <Card className="border-border hover:border-primary/50 transition-colors overflow-hidden">
                  <CardContent className="p-4 text-center">
                    <img 
                      src={host.avatar} 
                      alt={host.name}
                      className="w-16 h-16 rounded-full mx-auto mb-3"
                    />
                    <div className="mb-3">
                      <p className="font-semibold text-foreground text-sm">{host.name}</p>
                      <p className="text-xs text-foreground-secondary mb-1">@{host.username}</p>
                      {host.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <div className="space-y-1 text-xs text-foreground-secondary mb-3">
                      <p>{host.followers.toLocaleString()} followers</p>
                      <p>{host.avgViewers.toLocaleString()} avg viewers</p>
                    </div>
                    <Button size="sm" className="w-full" variant="outline">
                      Follow
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
