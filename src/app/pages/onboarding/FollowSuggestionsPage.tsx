import { SEO } from '../../components/SEO';
import { VerifiedBadge } from '../../components/VerifiedBadge';
import { UserPlus, ArrowRight, Sparkles, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/avatar';
import { Skeleton } from '../../components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// Skeleton Component
function FollowSuggestionsSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header Skeleton */}
      <div className="p-6 text-center">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-9 w-64 mx-auto mb-2" />
        <Skeleton className="h-5 w-80 mx-auto" />
      </div>

      {/* Progress Skeleton */}
      <div className="px-6 mb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-2 w-full rounded-full" />
        </div>
      </div>

      {/* Creator List Skeleton */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-3">
          {Array(8).fill(0).map((_, i) => (
            <Card key={i} className="p-4">
              <div className="flex items-center gap-4">
                <Skeleton className="w-14 h-14 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-9 w-24" />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Footer Skeleton */}
      <div className="p-6 bg-card border-t">
        <div className="max-w-2xl mx-auto flex gap-3">
          <Skeleton className="h-11 flex-1" />
          <Skeleton className="h-11 flex-1" />
        </div>
      </div>
    </div>
  );
}

export default function FollowSuggestionsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [following, setFollowing] = useState<string[]>([]);

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const suggestedUsers = [
    {
      id: '1',
      username: 'fashionista_maya',
      name: 'Maya Chen',
      avatar: 'https://images.unsplash.com/photo-1761247940942-a2a33f84df8f?w=200',
      bio: 'Fashion Creator | 250K followers',
      category: 'Fashion',
      verified: true
    },
    {
      id: '2',
      username: 'tech_reviews_pro',
      name: 'Alex Kumar',
      avatar: 'https://images.unsplash.com/photo-1524538198441-241ff79d153b?w=200',
      bio: 'Tech Reviewer | 180K followers',
      category: 'Tech',
      verified: true
    },
    {
      id: '3',
      username: 'beautyby_sarah',
      name: 'Sarah Johnson',
      avatar: 'https://images.unsplash.com/photo-1698181842119-a5283dea1440?w=200',
      bio: 'Beauty & Makeup | 320K followers',
      category: 'Beauty',
      verified: true
    },
    {
      id: '4',
      username: 'fitness_journey',
      name: 'Mike Thompson',
      avatar: 'https://images.unsplash.com/photo-1762757076979-cc016f6df284?w=200',
      bio: 'Fitness Coach | 150K followers',
      category: 'Fitness',
      verified: false
    },
    {
      id: '5',
      username: 'homestyle_guru',
      name: 'Emily White',
      avatar: 'https://images.unsplash.com/photo-1763479169474-728a7de108c3?w=200',
      bio: 'Home Decor Expert | 220K followers',
      category: 'Home',
      verified: true
    },
    {
      id: '6',
      username: 'foodie_adventures',
      name: 'Carlos Martinez',
      avatar: 'https://images.unsplash.com/photo-1550087560-0d40289f48ea?w=200',
      bio: 'Food & Travel | 190K followers',
      category: 'Food',
      verified: false
    },
    {
      id: '7',
      username: 'gaming_legends',
      name: 'Tyler Brooks',
      avatar: 'https://images.unsplash.com/photo-1660634435122-70ae113b1a87?w=200',
      bio: 'Gaming Streamer | 280K followers',
      category: 'Gaming',
      verified: true
    },
    {
      id: '8',
      username: 'pet_lovers_hub',
      name: 'Jessica Lee',
      avatar: 'https://images.unsplash.com/photo-1606231106463-ed4596c15292?w=200',
      bio: 'Pet Care Tips | 160K followers',
      category: 'Pets',
      verified: false
    }
  ];

  // Show skeleton while loading
  if (isLoading) {
    return <FollowSuggestionsSkeleton />;
  }

  const toggleFollow = (id: string) => {
    if (following.includes(id)) {
      setFollowing(following.filter(f => f !== id));
    } else {
      setFollowing([...following, id]);
    }
  };

  const handleContinue = () => {
    navigate('/onboarding/permissions');
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <SEO title="Follow Creators — Ezyify" description="Discover and follow creators on Ezyify to personalize your feed." />
      {/* Header */}
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--brand-gradient)' }}>
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">Follow Creators</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Follow creators to personalize your feed. You can always unfollow later.
        </p>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step 2 of 3</span>
            <span>{following.length} following</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-300" style={{ background: 'var(--brand-gradient)', width: '66%' }}></div>
          </div>
        </div>
      </div>

      {/* Creators List */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-3">
          {suggestedUsers.map((creator) => {
            const isFollowing = following.includes(creator.id);
            return (
              <div
                key={creator.id}
                className="p-4 bg-card rounded-xl border hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-14 h-14">
                    <AvatarImage src={creator.avatar} />
                    <AvatarFallback>{creator.name[0]}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold truncate">{creator.name}</h3>
                      {creator.verified && <VerifiedBadge size="sm" />}
                    </div>
                    <p className="text-sm text-muted-foreground">@{creator.username}</p>
                    <p className="text-xs text-muted-foreground">{creator.bio}</p>
                  </div>

                  <Button
                    variant={isFollowing ? "outline" : "default"}
                    size="default"
                    onClick={() => toggleFollow(creator.id)}
                    className="min-w-[100px] h-11"
                  >
                    {isFollowing ? (
                      <>
                        <Check className="w-4 h-4 mr-1" />
                        Following
                      </>
                    ) : (
                      <>
                        <UserPlus className="w-4 h-4 mr-1" />
                        Follow
                      </>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pt-6 bg-card border-t sticky bottom-0" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleContinue}
            disabled={following.length < 1}
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}