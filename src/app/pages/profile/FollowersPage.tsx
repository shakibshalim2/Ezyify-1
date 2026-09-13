import { SEO } from '../../components/SEO';
import { useState } from 'react';
import { useParams, Link } from 'react-router';
import { Search, UserPlus, UserCheck, ArrowLeft } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { VerifiedBadge } from '../../components/VerifiedBadge';

interface Follower {
  id: string;
  username: string;
  name: string;
  avatar: string;
  verified: boolean;
  bio: string;
  isFollowing: boolean;
  followers: number;
}

const mockFollowers: Follower[] = [
  { id: '1', username: 'sarah_styles', name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', verified: true, bio: 'Fashion blogger & stylist', isFollowing: true, followers: 45000 },
  { id: '2', username: 'mike_tech', name: 'Michael Chen', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', verified: false, bio: 'Tech enthusiast & gadget reviewer', isFollowing: false, followers: 23000 },
  { id: '3', username: 'lisa_fitness', name: 'Lisa Anderson', avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100', verified: true, bio: 'Fitness coach | Healthy lifestyle advocate', isFollowing: true, followers: 67000 },
  { id: '4', username: 'david_photo', name: 'David Martinez', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', verified: true, bio: 'Professional photographer', isFollowing: false, followers: 89000 },
  { id: '5', username: 'nina_art', name: 'Nina Patel', avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100', verified: false, bio: 'Digital artist & illustrator', isFollowing: true, followers: 34000 },
];

const mockFollowing: Follower[] = [
  { id: '6', username: 'alex_travel', name: 'Alex Rivera', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100', verified: true, bio: 'Travel vlogger | Exploring the world', isFollowing: true, followers: 156000 },
  { id: '7', username: 'jenny_food', name: 'Jennifer Lee', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', verified: true, bio: 'Food blogger & recipe creator', isFollowing: true, followers: 234000 },
  { id: '8', username: 'chris_music', name: 'Chris Thompson', avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100', verified: false, bio: 'Music producer & DJ', isFollowing: true, followers: 78000 },
];

// ── Card defined OUTSIDE component so React doesn't remount on every render ──
interface FollowerCardProps {
  user: Follower;
  isFollowersTab: boolean;
  onToggle: (id: string, isFollowersTab: boolean) => void;
}

function FollowerCard({ user, isFollowersTab, onToggle }: FollowerCardProps) {
  return (
    <div className="flex items-center gap-3 p-4 hover:bg-muted transition-colors">
      <Link to={`/profile/${user.username}`} className="shrink-0">
        <img
          src={user.avatar}
          alt={user.name}
          loading="lazy"
          className="w-12 h-12 rounded-full object-cover"
        />
      </Link>
      <div className="flex-1 min-w-0">
        <Link to={`/profile/${user.username}`} className="block group">
          <div className="flex items-center gap-1 mb-0.5">
            <p className="font-semibold text-foreground truncate group-hover:underline">{user.name}</p>
            {user.verified && <VerifiedBadge size="sm" />}
          </div>
          <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
          {user.bio && <p className="text-xs text-muted-foreground truncate mt-0.5">{user.bio}</p>}
          <p className="text-xs text-muted-foreground mt-0.5">
            {user.followers >= 1000 ? `${(user.followers / 1000).toFixed(0)}K` : user.followers} followers
          </p>
        </Link>
      </div>
      <Button
        variant={user.isFollowing ? 'outline' : 'default'}
        size="sm"
        onClick={() => onToggle(user.id, isFollowersTab)}
        className="shrink-0 gap-1"
      >
        {user.isFollowing
          ? <><UserCheck className="w-3.5 h-3.5" />Following</>
          : <><UserPlus className="w-3.5 h-3.5" />Follow</>
        }
      </Button>
    </div>
  );
}

export default function FollowersPage() {
  const { username } = useParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [followers, setFollowers] = useState(mockFollowers);
  const [following, setFollowing] = useState(mockFollowing);

  const handleFollowToggle = (id: string, isFollowersTab: boolean) => {
    if (isFollowersTab) {
      setFollowers(prev => prev.map(f => f.id === id ? { ...f, isFollowing: !f.isFollowing } : f));
    } else {
      setFollowing(prev => prev.map(f => f.id === id ? { ...f, isFollowing: !f.isFollowing } : f));
    }
  };

  const filteredFollowers = followers.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFollowing = following.filter(f =>
    f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-background">
      <SEO title="Connections — Ezyify" description="View followers and following on Ezyify." />
      <div className="max-w-2xl mx-auto">
        {/* Header — sticky below nav */}
        <div className="bg-card border-b border-border sticky lg:!top-16 z-10" style={{ top: 'calc(5.5rem + env(safe-area-inset-top, 0px))' }}>
          <div className="flex items-center gap-2 px-4 py-3">
            <Link to={`/profile/${username || 'me'}`}>
              <Button variant="ghost" size="icon" className="-ml-1">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div>
              <h1 className="font-semibold text-foreground">@{username || 'me'}</h1>
              <p className="text-xs text-muted-foreground">Connections</p>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 pb-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="followers" className="bg-card">
          <TabsList className="w-full justify-start border-b border-border rounded-none h-auto p-0">
            <TabsTrigger
              value="followers"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3"
            >
              Followers ({filteredFollowers.length})
            </TabsTrigger>
            <TabsTrigger
              value="following"
              className="flex-1 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary py-3"
            >
              Following ({filteredFollowing.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="m-0">
            <div className="divide-y divide-border">
              {filteredFollowers.length > 0 ? (
                filteredFollowers.map(follower => (
                  <FollowerCard key={follower.id} user={follower} isFollowersTab={true} onToggle={handleFollowToggle} />
                ))
              ) : (
                <div className="text-center py-16">
                  <p className="font-medium text-foreground mb-1">No followers found</p>
                  <p className="text-sm text-muted-foreground">Try a different search</p>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="following" className="m-0">
            <div className="divide-y divide-border">
              {filteredFollowing.length > 0 ? (
                filteredFollowing.map(user => (
                  <FollowerCard key={user.id} user={user} isFollowersTab={false} onToggle={handleFollowToggle} />
                ))
              ) : (
                <div className="text-center py-16">
                  <p className="font-medium text-foreground mb-1">No results found</p>
                  <p className="text-sm text-muted-foreground">Try a different search</p>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
