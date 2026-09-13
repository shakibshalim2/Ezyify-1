import { SEO } from '../components/SEO';
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { toast } from 'sonner';
import { 
  X, Heart, Send, MoreVertical, Pause, Play, Volume2, Eye,
  VolumeX, ChevronLeft, ChevronRight
} from 'lucide-react';

export default function StoriesPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isLiked, setIsLiked] = useState(false);

  // Mock stories data
  const stories = [
    {
      username: username || 'techguru',
      displayName: 'TechGuru',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
      stories: [
        {
          id: 1,
          type: 'image' as const,
          url: 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?w=800&h=1600&fit=crop',
          timestamp: '2h ago',
          views: 1234
        },
        {
          id: 2,
          type: 'image' as const,
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=1600&fit=crop',
          timestamp: '1h ago',
          views: 2345
        }
      ]
    }
  ];

  const currentStory = stories[0].stories[currentStoryIndex];
  const totalStories = stories[0].stories.length;

  // Auto-progress timer
  useEffect(() => {
    if (isPaused) return;

    const duration = 5000; // 5 seconds per story
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          // Move to next story
          if (currentStoryIndex < totalStories - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
            return 0;
          } else {
            // Exit stories when done
            navigate('/');
            return 100;
          }
        }
        return prev + increment;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [currentStoryIndex, isPaused, totalStories, navigate]);

  const handlePrevious = () => {
    if (currentStoryIndex > 0) {
      setCurrentStoryIndex(currentStoryIndex - 1);
      setProgress(0);
    }
  };

  const handleNext = () => {
    if (currentStoryIndex < totalStories - 1) {
      setCurrentStoryIndex(currentStoryIndex + 1);
      setProgress(0);
    } else {
      navigate('/');
    }
  };

  const handleSendMessage = () => {
    if (message.trim()) {
      toast.success(`Message sent to ${stories[0].displayName}`);
      setMessage('');
    }
  };

  return (<div className="fixed inset-0 bg-muted z-50 flex items-center justify-center">
      <SEO title="Stories — Ezyify" description="Watch stories from creators, sellers, and your community on Ezyify." />
      {/* Background Image (Blurred) */}
      <div className="absolute inset-0">
        <img
          loading="eager"
          src={currentStory.url}
          alt="Story background"
          className="w-full h-full object-cover blur-2xl opacity-50"
        />
      </div>

      {/* Story Container */}
      <div className="relative w-full h-full max-w-md mx-auto">
        {/* Progress Bars */}
        <div className="absolute top-0 left-0 right-0 z-20 flex gap-1 p-2">
          {stories[0].stories.map((_, idx) => (
            <div key={idx} className="flex-1 h-0.5 bg-muted-foreground/30 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-100"
                style={{ 
                  width: idx < currentStoryIndex ? '100%' : idx === currentStoryIndex ? `${progress}%` : '0%' 
                }}
              />
            </div>
          ))}
        </div>

        {/* Story Header */}
        <div className="absolute top-4 left-0 right-0 z-20 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
                      loading="lazy" 
              src={stories[0].avatar} 
              alt={stories[0].displayName}
              className="w-10 h-10 rounded-full border-2 border-white"
            />
            <div>
              <p className="text-white font-medium text-sm">{stories[0].displayName}</p>
              <p className="text-white/60 text-xs">{currentStory.timestamp}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsPaused(!isPaused)}
              aria-label={isPaused ? 'Play story' : 'Pause story'}
              className="p-2 hover:bg-white/15 rounded-full transition-colors"
            >
              {isPaused ? (
                <Play className="w-5 h-5 text-white" />
              ) : (
                <Pause className="w-5 h-5 text-white" />
              )}
            </button>
            <button
              onClick={() => setIsMuted(!isMuted)}
              aria-label={isMuted ? 'Unmute story' : 'Mute story'}
              className="p-2 hover:bg-white/15 rounded-full transition-colors"
            >
              {isMuted ? (
                <VolumeX className="w-5 h-5 text-white" />
              ) : (
                <Volume2 className="w-5 h-5 text-white" />
              )}
            </button>
            <button aria-label="More options" className="p-2 hover:bg-white/15 rounded-full transition-colors">
              <MoreVertical className="w-5 h-5 text-white" />
            </button>
            <button
              onClick={() => navigate('/')}
              aria-label="Close stories"
              className="p-2 hover:bg-white/15 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>

        {/* Story Content */}
        <div className="absolute inset-0 flex items-center justify-center">
          {currentStory.type === 'image' ? (
            <img
              loading="eager"
              src={currentStory.url}
              alt="Story"
              className="max-w-full max-h-full object-contain"
            />
          ) : (
            <video 
              src={currentStory.url}
              className="max-w-full max-h-full object-contain"
              autoPlay
              muted={isMuted}
              loop
            />
          )}
        </div>

        {/* Navigation Areas (Left/Right tap) */}
        <div className="absolute inset-0 flex">
          <button
            onClick={handlePrevious}
            className="flex-1 focus:outline-none"
            aria-label="Previous story"
          />
          <button
            onClick={handleNext}
            className="flex-1 focus:outline-none"
            aria-label="Next story"
          />
        </div>

        {/* Navigation Arrows (Desktop) */}
        <div className="hidden md:block">
          {currentStoryIndex > 0 && (
            <button
              onClick={handlePrevious}
              aria-label="Previous story"
              className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-muted/50 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}
          {currentStoryIndex < totalStories - 1 && (
            <button
              onClick={handleNext}
              aria-label="Next story"
              className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 bg-muted/50 backdrop-blur-sm text-white rounded-full hover:bg-white/20 transition-colors"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Story Footer - Reply */}
        <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder={`Reply to ${stories[0].displayName}...`}
                className="w-full px-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30"
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              aria-label="Send reply"
              className="p-3 bg-white/10 backdrop-blur-sm border border-white/15 rounded-full hover:bg-white/20 transition-colors disabled:opacity-50"
            >
              <Send className="w-5 h-5 text-white" />
            </button>
            <button aria-label="Like story" onClick={() => { setIsLiked(l => !l); if (!isLiked) toast.success('❤️ Liked!'); }} className={`p-3 backdrop-blur-sm border rounded-full transition-colors ${isLiked ? 'bg-like/40 border-like/60' : 'bg-white/10 border-white/15 hover:bg-white/20'}`}>
              <Heart className={`w-5 h-5 ${isLiked ? 'text-like fill-like' : 'text-white'}`} />
            </button>
          </div>

          {/* Views Count */}
          <div className="mt-2 flex items-center gap-1 justify-center">
            <p className="flex items-center gap-1 text-muted-foreground text-xs">
              <Eye className="w-3 h-3 shrink-0" />
              {currentStory.views.toLocaleString()} views
            </p>
          </div>
        </div>
      </div>

      {/* Close Button (Mobile - Bottom) */}
      <button
        onClick={() => navigate('/')}
        className="md:hidden absolute bottom-20 left-1/2 -translate-x-1/2 px-6 py-2 bg-white/20 backdrop-blur-sm text-white rounded-full text-sm"
      >
        Close
      </button>
    </div>
  );
}