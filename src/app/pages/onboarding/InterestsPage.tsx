import { SEO } from '../../components/SEO';
import { CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Skeleton } from '../../components/ui/skeleton';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';

// Skeleton Component
function InterestsPageSkeleton() {
  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header Skeleton */}
      <div className="p-6 text-center">
        <Skeleton className="w-16 h-16 rounded-full mx-auto mb-4" />
        <Skeleton className="h-9 w-80 mx-auto mb-2" />
        <Skeleton className="h-5 w-96 mx-auto" />
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

      {/* Grid Skeleton */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Array(16).fill(0).map((_, i) => (
              <Skeleton key={i} className="h-32 rounded-xl" />
            ))}
          </div>
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

export default function InterestsPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([]);

  // Simulate progressive data loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const interests = [
    { id: 'fashion', name: 'Fashion', emoji: '👗', color: 'bg-like/10 text-like' },
    { id: 'beauty', name: 'Beauty & Makeup', emoji: '💄', color: 'bg-primary/10 text-primary' },
    { id: 'tech', name: 'Tech & Gadgets', emoji: '📱', color: 'bg-info/10 text-info' },
    { id: 'home', name: 'Home & Living', emoji: '🏠', color: 'bg-success/10 text-success' },
    { id: 'fitness', name: 'Fitness & Wellness', emoji: '💪', color: 'bg-warning/10 text-warning' },
    { id: 'food', name: 'Food & Cooking', emoji: '🍳', color: 'bg-warning/10 text-warning' },
    { id: 'travel', name: 'Travel', emoji: '✈️', color: 'bg-info/10 text-info' },
    { id: 'gaming', name: 'Gaming', emoji: '🎮', color: 'bg-primary/10 text-primary' },
    { id: 'books', name: 'Books & Reading', emoji: '📚', color: 'bg-warning/10 text-warning' },
    { id: 'music', name: 'Music', emoji: '🎵', color: 'bg-like/10 text-like' },
    { id: 'art', name: 'Art & Design', emoji: '🎨', color: 'bg-primary/15 text-primary' },
    { id: 'sports', name: 'Sports', emoji: '⚽', color: 'bg-success/10 text-success' },
    { id: 'pets', name: 'Pets & Animals', emoji: '🐶', color: 'bg-success/10 text-success' },
    { id: 'photography', name: 'Photography', emoji: '📷', color: 'bg-muted text-foreground' },
    { id: 'jewelry', name: 'Jewelry & Accessories', emoji: '💍', color: 'bg-like/10 text-like' },
    { id: 'automotive', name: 'Automotive', emoji: '🚗', color: 'bg-muted text-foreground' }
  ];

  // Show skeleton while loading
  if (isLoading) {
    return <InterestsPageSkeleton />;
  }

  const toggleInterest = (id: string) => {
    if (selectedInterests.includes(id)) {
      setSelectedInterests(selectedInterests.filter(i => i !== id));
    } else {
      setSelectedInterests([...selectedInterests, id]);
    }
  };

  const handleContinue = () => {
    navigate('/onboarding/follow-suggestions');
  };

  return (
    <div className="min-h-screen bg-muted/30 flex flex-col">
      <SEO title="Choose Interests — Ezyify" description="Select your interests to personalize your Ezyify experience." />
      {/* Header */}
      <div className="p-6 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-4" style={{ background: 'var(--brand-gradient)' }}>
          <Sparkles className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-3xl font-bold mb-2">What are you interested in?</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Choose at least 3 topics you'd like to see on Ezyify. We'll personalize your feed based on your interests.
        </p>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
            <span>Step 1 of 3</span>
            <span>{selectedInterests.length} selected</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <div className="h-2 rounded-full transition-all duration-300" style={{ background: 'var(--brand-gradient)', width: '33%' }}></div>
          </div>
        </div>
      </div>

      {/* Interests Grid */}
      <div className="flex-1 px-6 pb-6 overflow-y-auto">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {interests.map((interest) => {
              const isSelected = selectedInterests.includes(interest.id);
              return (
                <button
                  key={interest.id}
                  onClick={() => toggleInterest(interest.id)}
                  className={`
                    p-4 rounded-xl border-2 transition-all duration-200
                    ${isSelected 
                      ? 'border-primary bg-accent scale-95' 
                      : 'border-border hover:border-primary/50 hover:bg-muted'
                    }
                  `}
                >
                  <div className="text-4xl mb-2">{interest.emoji}</div>
                  <div className="font-medium text-sm">{interest.name}</div>
                  {isSelected && (
                    <Badge className="mt-2">Selected</Badge>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 pt-6 bg-card border-t sticky bottom-0" style={{ paddingBottom: 'calc(1.5rem + env(safe-area-inset-bottom, 0px))' }}>
        <div className="max-w-2xl mx-auto flex gap-3">
          <Button
            variant="outline"
            size="lg"
            className="flex-1"
            onClick={() => navigate('/')}
          >
            Skip for Now
          </Button>
          <Button
            size="lg"
            className="flex-1"
            onClick={handleContinue}
            disabled={selectedInterests.length < 3}
          >
            Continue
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}