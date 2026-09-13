import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import { ArrowRight, Check, Plus, Users } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { VerifiedBadge } from '../../components/VerifiedBadge';
import { ImageWithFallback } from '../../components/figma/ImageWithFallback';
import { SetupLayout } from '../../features/onboarding/SetupLayout';
import { cn } from '../../components/ui/utils';
import { fadeUp, springSnappy } from '../../lib/motion';
import { storage } from '../../lib/storage';
import { INTERESTS_KEY } from './InterestsPage';

interface Creator {
  id: string;
  username: string;
  name: string;
  avatar: string;
  tagline: string;
  followers: string;
  category: string;
  interest: string;
  verified: boolean;
}

const CREATORS: Creator[] = [
  { id: '1', username: 'fashionista_maya', name: 'Maya Chen', avatar: 'https://images.unsplash.com/photo-1761247940942-a2a33f84df8f?w=200', tagline: 'Daily outfits & thrift finds', followers: '250K', category: 'Fashion', interest: 'fashion', verified: true },
  { id: '2', username: 'tech_reviews_pro', name: 'Alex Kumar', avatar: 'https://images.unsplash.com/photo-1524538198441-241ff79d153b?w=200', tagline: 'Honest gadget reviews', followers: '180K', category: 'Tech', interest: 'tech', verified: true },
  { id: '3', username: 'beautyby_sarah', name: 'Sarah Johnson', avatar: 'https://images.unsplash.com/photo-1698181842119-a5283dea1440?w=200', tagline: 'Skincare that actually works', followers: '320K', category: 'Beauty', interest: 'beauty', verified: true },
  { id: '4', username: 'fitness_journey', name: 'Mike Thompson', avatar: 'https://images.unsplash.com/photo-1762757076979-cc016f6df284?w=200', tagline: 'Home workouts, zero excuses', followers: '150K', category: 'Fitness', interest: 'fitness', verified: false },
  { id: '5', username: 'homestyle_guru', name: 'Emily White', avatar: 'https://images.unsplash.com/photo-1763479169474-728a7de108c3?w=200', tagline: 'Small‑space decor ideas', followers: '220K', category: 'Home', interest: 'home', verified: true },
  { id: '6', username: 'foodie_adventures', name: 'Carlos Martinez', avatar: 'https://images.unsplash.com/photo-1550087560-0d40289f48ea?w=200', tagline: 'Street food around the world', followers: '190K', category: 'Food', interest: 'food', verified: false },
  { id: '7', username: 'gaming_legends', name: 'Tyler Brooks', avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200', tagline: 'Setups, gear & live plays', followers: '410K', category: 'Gaming', interest: 'gaming', verified: true },
  { id: '8', username: 'wanderlust_nina', name: 'Nina Rahman', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200', tagline: 'Budget travel & packing tips', followers: '275K', category: 'Travel', interest: 'travel', verified: true },
];

export const FOLLOWS_KEY = 'ezyify.onboarding.follows';

export default function FollowSuggestionsPage() {
  const navigate = useNavigate();
  const interests = storage.get<string[]>(INTERESTS_KEY, []);
  const [following, setFollowing] = useState<string[]>(() => storage.get<string[]>(FOLLOWS_KEY, []));

  // Creators matching the user's interests first, everyone else after.
  const ordered = useMemo(
    () =>
      [...CREATORS].sort(
        (a, b) => Number(interests.includes(b.interest)) - Number(interests.includes(a.interest)),
      ),
    [interests],
  );

  const toggle = (id: string) =>
    setFollowing((f) => (f.includes(id) ? f.filter((x) => x !== id) : [...f, id]));

  const followAll = () => setFollowing(ordered.map((c) => c.id));

  const next = () => {
    storage.set(FOLLOWS_KEY, following);
    navigate('/onboarding/permissions');
  };

  return (
    <SetupLayout
      step="follow"
      title="Follow a few creators"
      subtitle="Your feed starts with people worth watching. Follow anyone you like — you can always unfollow later."
      icon={<Users className="size-7" />}
      backTo="/onboarding/interests"
      onSkip={() => navigate('/onboarding/permissions')}
      footer={
        <div className="flex items-center gap-3">
          <p className="flex-1 text-sm text-foreground-secondary" aria-live="polite">
            {following.length === 0 ? 'Nobody followed yet' : `Following ${following.length}`}
          </p>
          <Button size="lg" variant="gradient" onClick={next} rightIcon={<ArrowRight className="size-5" />}>
            {following.length ? 'Continue' : 'Skip for now'}
          </Button>
        </div>
      }
    >
      <SEO title="Follow creators — Ezyify" description="Follow creators to start your Ezyify feed." />

      <motion.div variants={fadeUp} className="mb-4 flex items-center justify-between">
        <p className="text-sm font-medium text-foreground-secondary">
          {interests.length ? 'Picked for your interests' : 'Popular on Ezyify'}
        </p>
        <button
          type="button"
          onClick={followAll}
          disabled={following.length === ordered.length}
          className="h-9 rounded-full px-3 text-sm font-semibold text-primary transition hover:bg-primary-subtle disabled:opacity-50"
        >
          Follow all
        </button>
      </motion.div>

      <motion.ul variants={fadeUp} className="space-y-2.5" aria-label="Suggested creators">
        {ordered.map((c) => {
          const isFollowing = following.includes(c.id);
          const matches = interests.includes(c.interest);
          return (
            <li key={c.id}>
              <div
                className={cn(
                  'flex items-center gap-3 rounded-2xl border bg-background-elevated p-3 transition-colors',
                  isFollowing ? 'border-primary/50' : 'border-border',
                )}
              >
                <div className="relative shrink-0">
                  <ImageWithFallback
                    src={c.avatar}
                    alt=""
                    className="size-14 rounded-full object-cover ring-2 ring-border"
                    width={56}
                    height={56}
                  />
                  {c.verified && (
                    <span className="absolute -bottom-0.5 -right-0.5 rounded-full bg-background-elevated p-0.5">
                      <VerifiedBadge size="sm" />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold leading-tight">{c.name}</p>
                  <p className="truncate text-sm text-foreground-secondary">{c.tagline}</p>
                  <p className="mt-1 flex items-center gap-2 text-xs text-foreground-tertiary">
                    <span className="tabular-nums">{c.followers} followers</span>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 font-medium',
                        matches ? 'bg-primary-subtle text-primary' : 'bg-muted text-foreground-secondary',
                      )}
                    >
                      {c.category}
                    </span>
                  </p>
                </div>
                <motion.button
                  type="button"
                  aria-pressed={isFollowing}
                  aria-label={isFollowing ? `Unfollow ${c.name}` : `Follow ${c.name}`}
                  onClick={() => toggle(c.id)}
                  whileTap={{ scale: 0.94 }}
                  transition={springSnappy}
                  className={cn(
                    'inline-flex h-10 min-w-24 items-center justify-center gap-1.5 rounded-full px-4 text-sm font-semibold tap-highlight-none transition-colors',
                    'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                    isFollowing
                      ? 'bg-muted text-foreground hover:bg-border'
                      : 'bg-primary text-primary-foreground shadow-brand hover:bg-primary-hover',
                  )}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={isFollowing ? 'on' : 'off'}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                      transition={{ duration: 0.15 }}
                      className="inline-flex items-center gap-1.5"
                    >
                      {isFollowing ? <Check className="size-4" strokeWidth={3} /> : <Plus className="size-4" strokeWidth={3} />}
                      {isFollowing ? 'Following' : 'Follow'}
                    </motion.span>
                  </AnimatePresence>
                </motion.button>
              </div>
            </li>
          );
        })}
      </motion.ul>
    </SetupLayout>
  );
}
