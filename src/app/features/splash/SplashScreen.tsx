import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { BrandMark } from '../../components/primitives/BrandMark';
import { EASE_EMPHASIZED } from '../../lib/motion';
import { storage, STORAGE_KEYS } from '../../lib/storage';

/** Show the splash again only after this many minutes since the last cold start. */
const SPLASH_COOLDOWN_MIN = 30;
const SPLASH_DURATION_MS = 1400;

export function shouldShowSplash(): boolean {
  if (typeof window === 'undefined') return false;
  // Only on the entry route so deep links (shared product, OTP email) stay instant.
  if (window.location.pathname !== '/' && window.location.pathname !== '/welcome') return false;
  const last = storage.get<number>(STORAGE_KEYS.splashShownAt, 0);
  return Date.now() - last > SPLASH_COOLDOWN_MIN * 60_000;
}

interface SplashScreenProps {
  onDone: () => void;
}

/**
 * Web splash: logo bars assemble, orange dot drops in, wordmark fades. ~1.4s total,
 * shortened to a quick fade when the user prefers reduced motion.
 */
export function SplashScreen({ onDone }: SplashScreenProps) {
  const reduce = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    storage.set(STORAGE_KEYS.splashShownAt, Date.now());
    const t = window.setTimeout(() => setVisible(false), reduce ? 500 : SPLASH_DURATION_MS);
    return () => window.clearTimeout(t);
  }, [reduce]);

  return (
    <AnimatePresence onExitComplete={onDone}>
      {visible && (
        <motion.div
          key="splash"
          role="status"
          aria-label="Loading Ezyify"
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden bg-[#0F66C7] text-white"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04, transition: { duration: 0.35, ease: EASE_EMPHASIZED } }}
        >
          {/* Ambient glow */}
          <motion.div
            aria-hidden
            className="absolute size-[140vmax] rounded-full"
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.18) 0%, rgba(255,255,255,0.04) 35%, transparent 60%)',
            }}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 1.2, ease: EASE_EMPHASIZED }}
          />

          <motion.div
            className="relative"
            initial={reduce ? { opacity: 0 } : { scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.6, ease: EASE_EMPHASIZED }}
          >
            <BrandMark size={112} bare className="splash-mark text-white" />
          </motion.div>

          <motion.p
            className="mt-6 font-display text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduce ? 0 : 0.55, duration: 0.45, ease: EASE_EMPHASIZED }}
          >
            Ezyify
          </motion.p>
          <motion.p
            className="mt-1 text-sm font-medium text-white/75"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduce ? 0 : 0.8, duration: 0.4 }}
          >
            Shop. Talk. Share. Live the moment.
          </motion.p>

          <style>{`
            .splash-mark [data-part='bar-top'],
            .splash-mark [data-part='bar-mid'],
            .splash-mark [data-part='bar-bottom'] {
              transform-box: fill-box;
              transform-origin: left center;
              animation: splash-bar 0.55s var(--ease-emphasized) both;
            }
            .splash-mark [data-part='bar-mid'] { animation-delay: 0.1s; }
            .splash-mark [data-part='bar-bottom'] { animation-delay: 0.2s; }
            .splash-mark [data-part='dot'] {
              transform-box: fill-box;
              transform-origin: center;
              animation: splash-dot 0.5s var(--ease-spring) 0.4s both;
            }
            @keyframes splash-bar { from { transform: scaleX(0); opacity: 0; } to { transform: scaleX(1); opacity: 1; } }
            @keyframes splash-dot { from { transform: translateY(-14px) scale(0); opacity: 0; } to { transform: none; opacity: 1; } }
            @media (prefers-reduced-motion: reduce) {
              .splash-mark * { animation: none !important; }
            }
          `}</style>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
