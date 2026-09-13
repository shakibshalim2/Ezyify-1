import { useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion } from 'motion/react';
import {
  ArrowRight,
  Baby,
  BookOpen,
  Camera,
  Car,
  Check,
  Dumbbell,
  Gamepad2,
  Gem,
  Home,
  Music,
  Palette,
  PawPrint,
  Plane,
  Shirt,
  Smartphone,
  Sparkles,
  Trophy,
  UtensilsCrossed,
  Wand2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { SetupLayout } from '../../features/onboarding/SetupLayout';
import { cn } from '../../components/ui/utils';
import { fadeUp, springSnappy } from '../../lib/motion';
import { storage } from '../../lib/storage';

interface Interest {
  id: string;
  name: string;
  icon: LucideIcon;
  /** Tailwind classes for the tile tint. */
  tint: string;
}

const INTERESTS: Interest[] = [
  { id: 'fashion', name: 'Fashion', icon: Shirt, tint: 'from-pink-500/20 to-rose-500/5 text-rose-500' },
  { id: 'beauty', name: 'Beauty', icon: Wand2, tint: 'from-fuchsia-500/20 to-purple-500/5 text-fuchsia-500' },
  { id: 'tech', name: 'Tech & Gadgets', icon: Smartphone, tint: 'from-blue-500/20 to-cyan-500/5 text-blue-500' },
  { id: 'home', name: 'Home & Living', icon: Home, tint: 'from-emerald-500/20 to-teal-500/5 text-emerald-500' },
  { id: 'fitness', name: 'Fitness', icon: Dumbbell, tint: 'from-orange-500/20 to-amber-500/5 text-orange-500' },
  { id: 'food', name: 'Food & Cooking', icon: UtensilsCrossed, tint: 'from-amber-500/20 to-yellow-500/5 text-amber-500' },
  { id: 'travel', name: 'Travel', icon: Plane, tint: 'from-sky-500/20 to-indigo-500/5 text-sky-500' },
  { id: 'gaming', name: 'Gaming', icon: Gamepad2, tint: 'from-violet-500/20 to-purple-500/5 text-violet-500' },
  { id: 'books', name: 'Books', icon: BookOpen, tint: 'from-yellow-500/20 to-orange-500/5 text-yellow-600' },
  { id: 'music', name: 'Music', icon: Music, tint: 'from-red-500/20 to-pink-500/5 text-red-500' },
  { id: 'art', name: 'Art & Design', icon: Palette, tint: 'from-indigo-500/20 to-blue-500/5 text-indigo-500' },
  { id: 'sports', name: 'Sports', icon: Trophy, tint: 'from-lime-500/20 to-green-500/5 text-lime-600' },
  { id: 'pets', name: 'Pets', icon: PawPrint, tint: 'from-teal-500/20 to-emerald-500/5 text-teal-500' },
  { id: 'photo', name: 'Photography', icon: Camera, tint: 'from-slate-500/20 to-zinc-500/5 text-slate-500' },
  { id: 'jewelry', name: 'Jewelry', icon: Gem, tint: 'from-cyan-500/20 to-sky-500/5 text-cyan-500' },
  { id: 'auto', name: 'Automotive', icon: Car, tint: 'from-zinc-500/20 to-neutral-500/5 text-zinc-500' },
  { id: 'kids', name: 'Kids & Baby', icon: Baby, tint: 'from-rose-400/20 to-pink-400/5 text-rose-400' },
];

const MIN_SELECT = 3;
export const INTERESTS_KEY = 'ezyify.onboarding.interests';

export default function InterestsPage() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState<string[]>(() => storage.get<string[]>(INTERESTS_KEY, []));
  const remaining = Math.max(0, MIN_SELECT - selected.length);
  const ready = remaining === 0;

  const toggle = (id: string) =>
    setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const next = () => {
    storage.set(INTERESTS_KEY, selected);
    navigate('/onboarding/follow-suggestions');
  };

  return (
    <SetupLayout
      step="interests"
      title="What are you into?"
      subtitle={`Pick at least ${MIN_SELECT} topics and we’ll shape your feed around them. You can change these anytime.`}
      icon={<Sparkles className="size-7" />}
      onSkip={() => navigate('/onboarding/follow-suggestions')}
      footer={
        <div className="flex items-center gap-3">
          <div className="flex-1 text-sm text-foreground-secondary" aria-live="polite">
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={ready ? 'ready' : remaining}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="block"
              >
                {ready ? (
                  <span className="font-medium text-success">
                    {selected.length} selected — looking good!
                  </span>
                ) : (
                  <>
                    Choose <span className="font-semibold text-foreground">{remaining}</span> more
                  </>
                )}
              </motion.span>
            </AnimatePresence>
          </div>
          <Button size="lg" variant="gradient" disabled={!ready} onClick={next} rightIcon={<ArrowRight className="size-5" />}>
            Continue
          </Button>
        </div>
      }
    >
      <SEO title="Choose interests — Ezyify" description="Personalise your Ezyify feed." />
      <motion.ul
        variants={fadeUp}
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4"
        aria-label="Interests"
      >
        {INTERESTS.map((item) => {
          const active = selected.includes(item.id);
          const Icon = item.icon;
          return (
            <li key={item.id}>
              <motion.button
                type="button"
                aria-pressed={active}
                onClick={() => toggle(item.id)}
                whileTap={{ scale: 0.96 }}
                transition={springSnappy}
                className={cn(
                  'group relative flex h-28 w-full flex-col items-start justify-between overflow-hidden rounded-2xl border p-3.5 text-left tap-highlight-none',
                  'bg-gradient-to-br transition-[border-color,box-shadow,background-color] duration-(--duration-fast)',
                  'outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                  item.tint,
                  active
                    ? 'border-primary bg-primary-subtle shadow-brand'
                    : 'border-border bg-background-elevated hover:border-border-strong',
                )}
              >
                <span
                  className={cn(
                    'flex size-10 items-center justify-center rounded-xl bg-background-elevated/80 shadow-sm ring-1 ring-border/60 transition-colors',
                    active && 'bg-primary text-primary-foreground ring-primary',
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-sm font-semibold text-foreground">{item.name}</span>
                <AnimatePresence>
                  {active && (
                    <motion.span
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0, opacity: 0 }}
                      transition={springSnappy}
                      className="absolute right-3 top-3 flex size-6 items-center justify-center rounded-full bg-primary text-primary-foreground"
                    >
                      <Check className="size-3.5" strokeWidth={3} />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </li>
          );
        })}
      </motion.ul>
    </SetupLayout>
  );
}
