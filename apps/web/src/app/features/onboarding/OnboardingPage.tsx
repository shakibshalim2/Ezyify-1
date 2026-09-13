import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { AnimatePresence, motion, useReducedMotion, type PanInfo } from 'motion/react';
import { ArrowRight, ChevronLeft } from 'lucide-react';
import { SEO } from '../../components/SEO';
import { Button } from '../../components/primitives/Button';
import { BrandMark } from '../../components/primitives/BrandMark';
import { cn } from '../../components/ui/utils';
import { EASE_EMPHASIZED, springSoft } from '../../lib/motion';
import { storage, STORAGE_KEYS } from '../../lib/storage';
import { DiscoverScene, GoLiveScene, ShopSafeScene } from './illustrations';

const SLIDES = [
  {
    id: 'discover',
    eyebrow: 'Discover',
    title: 'Shopping that feels like scrolling',
    body: 'Loops, stories and live drops from creators you love — every product one tap away.',
    Scene: DiscoverScene,
    accent: 'var(--primary)',
  },
  {
    id: 'protect',
    eyebrow: 'Protected by escrow',
    title: 'Pay with confidence, every time',
    body: 'Your money is held safely until your order arrives. Refunds and disputes handled in‑app.',
    Scene: ShopSafeScene,
    accent: 'var(--accent-brand)',
  },
  {
    id: 'earn',
    eyebrow: 'Create & earn',
    title: 'Go live. Sell. Get paid.',
    body: 'Start a store or share products you love and earn commissions from a single feed.',
    Scene: GoLiveScene,
    accent: 'var(--violet-500)',
  },
] as const;

export function markOnboardingSeen() {
  storage.set(STORAGE_KEYS.onboardingSeen, true);
}

export function hasSeenOnboarding() {
  return storage.get<boolean>(STORAGE_KEYS.onboardingSeen, false);
}

const AUTO_ADVANCE_MS = 6000;

export default function OnboardingPage() {
  const navigate = useNavigate();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const paused = useRef(false);
  const slide = SLIDES[index];
  const isLast = index === SLIDES.length - 1;

  const go = useCallback(
    (next: number) => {
      const clamped = (next + SLIDES.length) % SLIDES.length;
      setDirection(clamped > index || (index === SLIDES.length - 1 && clamped === 0) ? 1 : -1);
      setIndex(clamped);
    },
    [index],
  );

  useEffect(() => {
    if (reduce) return;
    const t = window.setInterval(() => {
      if (!paused.current && index < SLIDES.length - 1) go(index + 1);
    }, AUTO_ADVANCE_MS);
    return () => window.clearInterval(t);
  }, [index, go, reduce]);

  const finish = (to: '/signup' | '/login') => {
    markOnboardingSeen();
    navigate(to);
  };

  const onDragEnd = (_: unknown, info: PanInfo) => {
    paused.current = false;
    if (info.offset.x < -60 || info.velocity.x < -400) go(index + 1);
    else if (info.offset.x > 60 || info.velocity.x > 400) go(index - 1);
  };

  const variants = {
    enter: (d: number) => ({ x: reduce ? 0 : d * 80, opacity: 0 }),
    center: { x: 0, opacity: 1, transition: { duration: 0.4, ease: EASE_EMPHASIZED } },
    exit: (d: number) => ({ x: reduce ? 0 : d * -80, opacity: 0, transition: { duration: 0.22 } }),
  };

  return (
    <div className="relative flex min-h-dvh flex-col overflow-hidden bg-background text-foreground">
      <SEO title="Welcome — Ezyify" description="Discover, shop safely and go live with Ezyify." />

      {/* Ambient aurora that shifts hue with the active slide */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-aurora opacity-70 dark:opacity-60"
        animate={{ filter: `hue-rotate(${index * 18}deg)` }}
        transition={{ duration: 0.8 }}
      />

      {/* Top bar */}
      <header className="relative z-10 flex items-center justify-between px-5 pt-[calc(var(--safe-top)+1rem)]">
        <div className="flex items-center gap-2">
          {index > 0 ? (
            <button
              type="button"
              onClick={() => go(index - 1)}
              aria-label="Previous"
              className="flex size-11 items-center justify-center rounded-full text-foreground-secondary transition hover:bg-muted"
            >
              <ChevronLeft className="size-5" />
            </button>
          ) : (
            <BrandMark size={36} />
          )}
        </div>
        {!isLast && (
          <button
            type="button"
            onClick={() => finish('/signup')}
            className="h-11 rounded-full px-4 text-sm font-medium text-foreground-secondary transition hover:bg-muted hover:text-foreground"
          >
            Skip
          </button>
        )}
      </header>

      {/* Slides */}
      <main className="relative z-10 flex flex-1 flex-col">
        <div className="relative mx-auto w-full max-w-md flex-1 px-6">
          <AnimatePresence custom={direction} mode="popLayout" initial={false}>
            <motion.section
              key={slide.id}
              custom={direction}
              variants={variants}
              initial="enter"
              animate="center"
              exit="exit"
              drag={reduce ? false : 'x'}
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragStart={() => (paused.current = true)}
              onDragEnd={onDragEnd}
              className="flex h-full cursor-grab flex-col active:cursor-grabbing"
              aria-roledescription="slide"
              aria-label={`${index + 1} of ${SLIDES.length}`}
            >
              <div className="mx-auto mt-2 aspect-[18/17] w-full max-w-[340px] sm:max-w-[380px]">
                <slide.Scene />
              </div>
              <div className="mt-4 space-y-3 text-balance">
                <motion.span
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15, ...springSoft }}
                  className="inline-flex items-center gap-2 rounded-full border border-border bg-background-elevated/70 px-3 py-1 text-xs font-semibold uppercase tracking-wide backdrop-blur"
                  style={{ color: slide.accent }}
                >
                  <span className="size-1.5 rounded-full" style={{ background: slide.accent }} />
                  {slide.eyebrow}
                </motion.span>
                <motion.h1
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, ...springSoft }}
                  className="font-display text-[2rem] font-bold leading-[1.1] tracking-tight sm:text-4xl"
                >
                  {slide.title}
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.28, ...springSoft }}
                  className="max-w-prose text-base leading-relaxed text-foreground-secondary"
                >
                  {slide.body}
                </motion.p>
              </div>
            </motion.section>
          </AnimatePresence>
        </div>

        {/* Footer controls */}
        <footer className="relative z-10 mx-auto w-full max-w-md space-y-5 px-6 pb-[calc(var(--safe-bottom)+1.5rem)] pt-4">
          <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Onboarding progress">
            {SLIDES.map((s, i) => (
              <button
                key={s.id}
                type="button"
                role="tab"
                aria-selected={i === index}
                aria-label={`Go to slide ${i + 1}`}
                onClick={() => go(i)}
                className="flex h-8 items-center px-0.5"
              >
                <motion.span
                  layout
                  transition={springSoft}
                  className={cn(
                    'block h-2 rounded-full',
                    i === index ? 'w-8 bg-primary' : 'w-2 bg-border-strong',
                  )}
                />
              </button>
            ))}
          </div>

          <div className="space-y-3">
            <Button
              size="xl"
              fullWidth
              variant="gradient"
              onClick={() => (isLast ? finish('/signup') : go(index + 1))}
              rightIcon={<ArrowRight className="size-5" />}
            >
              {isLast ? 'Get started' : 'Continue'}
            </Button>
            <Button size="lg" fullWidth variant="ghost" onClick={() => finish('/login')}>
              I already have an account
            </Button>
          </div>
        </footer>
      </main>
    </div>
  );
}
