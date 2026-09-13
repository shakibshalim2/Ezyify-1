import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import { users } from '../data/users';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { toast } from 'sonner';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { SEO } from '../components/SEO';
import { Field } from '../components/primitives/Field';
import { Button } from '../components/primitives/Button';

export default function StoriesPage() {
  const { username } = useParams();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [isPaused, setIsPaused] = useState(false);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isLiked, setIsLiked] = useState(false);
  const [dragY, setDragY] = useState(0);

  // Resolve the story owner from mock users; fall back to a generic creator
  const owner = users.find(u => u.username === username);
  const stories = [
    {
      username: username || 'techguru',
      displayName: owner?.name ?? 'TechGuru',
      avatar:
        owner?.avatar ?? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop',
      timestamp: '2h ago',
      stories: [
        {
          id: 1,
          url: 'https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?w=800&h=1600&fit=crop',
          views: 1234,
        },
        {
          id: 2,
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&h=1600&fit=crop',
          views: 2345,
        },
      ],
    },
  ];

  const currentStory = stories[0].stories[currentStoryIndex];
  const totalStories = stories[0].stories.length;

  // Auto-progress timer
  useEffect(() => {
    if (isPaused) return;

    const duration = 5000;
    const interval = 50;
    const increment = (interval / duration) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          if (currentStoryIndex < totalStories - 1) {
            setCurrentStoryIndex(currentStoryIndex + 1);
            return 0;
          } else {
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

  const handleDragEnd = () => {
    const delta = dragY;
    if (delta > 100) {
      // Swipe down to close
      navigate('/');
    }
    setDragY(0);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onDrag={(_, info) => {
        if (info.offset.y > 0) {
          setDragY(info.offset.y);
        }
      }}
      onDragEnd={handleDragEnd}
      initial={reduce ? {} : { y: 16, opacity: 0 }}
      animate={{ y: dragY, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
    >
      <SEO title="Stories — Ezyify" description="Watch stories" />

      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          loading="eager"
          src={currentStory.url}
          alt="Story background"
          className="w-full h-full object-cover blur-xl opacity-40"
        />
      </div>

      {/* Container */}
      <div className="relative w-full h-full max-w-md mx-auto flex flex-col">
        {/* Progress Bars */}
        <div className="absolute left-0 right-0 z-20 flex gap-1 px-3" style={{ top: 'calc(var(--safe-top) + 8px)' }}>
          {stories[0].stories.map((_, idx) => (
            <motion.div
              key={idx}
              className="flex-1 h-[3px] bg-white/30 rounded-full overflow-hidden"
              initial={reduce ? {} : { scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div
                className="h-full bg-white/90"
                initial={{ width: '0%' }}
                animate={{
                  width:
                    idx < currentStoryIndex
                      ? '100%'
                      : idx === currentStoryIndex
                        ? `${progress}%`
                        : '0%',
                }}
                transition={{ duration: 0.05 }}
              />
            </motion.div>
          ))}
        </div>

        {/* Header */}
        <div className="absolute left-0 right-0 z-20 px-4 flex items-center justify-between" style={{ top: 'calc(var(--safe-top) + 20px)' }}>
          <div className="flex items-center gap-2">
            <img
              loading="lazy"
              src={stories[0].avatar}
              alt={stories[0].displayName}
              className="w-10 h-10 rounded-full border-2 border-white/60 object-cover"
            />
            <div>
              <p className="text-white font-semibold text-sm">
                {stories[0].displayName}
              </p>
              <p className="text-white/70 text-xs">{stories[0].timestamp}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            aria-label="Close stories"
            className="w-11 h-11 flex items-center justify-center rounded-full hover:bg-white/15 transition-colors focus-visible:ring-2 focus-visible:ring-white/50 outline-none"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Story Content */}
        <div className="absolute inset-0 flex items-center justify-center z-10">
          <img
            loading="eager"
            src={currentStory.url}
            alt="Story"
            className="max-w-full max-h-full object-contain"
          />
          <div aria-hidden className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 to-transparent" />
        </div>

        {/* Navigation Areas */}
        <div className="absolute inset-0 flex z-15">
          <button
            onClick={handlePrevious}
            className="flex-1 focus-visible:ring-2 focus-visible:ring-white/50 outline-none"
            aria-label="Previous story"
          />
          <button
            onClick={handleNext}
            className="flex-1 focus-visible:ring-2 focus-visible:ring-white/50 outline-none"
            aria-label="Next story"
          />
        </div>

        {/* Navigation Indicators */}
        {currentStoryIndex > 0 && (
          <button
            onClick={handlePrevious}
            className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 hover:bg-white/15 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-white/50 outline-none"
            aria-label="Previous story"
          >
            <ChevronLeft className="w-6 h-6 text-white" />
          </button>
        )}
        {currentStoryIndex < totalStories - 1 && (
          <button
            onClick={handleNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 hover:bg-white/15 rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-white/50 outline-none"
            aria-label="Next story"
          >
            <ChevronRight className="w-6 h-6 text-white" />
          </button>
        )}

        {/* Footer - Reply */}
        <div className="absolute bottom-0 left-0 right-0 z-20 bg-gradient-to-t from-black/80 to-transparent p-4 pb-safe">
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-end gap-2"
          >
            <div className="flex-1">
              <Field
                label="Message"
                hideLabel
                placeholder={`Reply to ${stories[0].displayName}...`}
                value={message}
                onChange={e => setMessage(e.target.value)}
                onFocus={() => setIsPaused(true)}
                onBlur={() => setIsPaused(false)}
                containerClassName="mb-0"
                className="bg-white/15 border-white/20 text-white placeholder:text-white/50 focus:bg-white/20 focus:border-white/40"
              />
            </div>
            <motion.button
              onClick={handleSendMessage}
              disabled={!message.trim()}
              whileTap={reduce ? {} : { scale: 0.95 }}
              type="button"
              aria-label="Send reply"
              className="size-11 rounded-full bg-primary text-white flex items-center justify-center hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus-visible:ring-2 focus-visible:ring-white/50 outline-none flex-shrink-0"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </motion.button>
            <motion.button
              onClick={() => {
                setIsLiked(!isLiked);
                if (!isLiked) toast.success('Liked!');
              }}
              whileTap={reduce ? {} : { scale: 0.95 }}
              type="button"
              aria-label="Like story"
              className={`size-11 rounded-full flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-white/50 outline-none flex-shrink-0 ${
                isLiked
                  ? 'bg-like/40 border border-like/60'
                  : 'bg-white/15 border border-white/20 hover:bg-white/25'
              }`}
            >
              <svg
                className={`w-5 h-5 ${isLiked ? 'fill-like text-like' : 'text-white'}`}
                fill={isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                />
              </svg>
            </motion.button>
          </form>

          {/* Views count */}
          <div className="mt-2 flex items-center gap-1 justify-center">
            <p className="text-white/70 text-xs">
              {currentStory.views.toLocaleString()} views
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
