import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Download, X } from 'lucide-react';
import { BrandMark } from './primitives/BrandMark';
import { Button } from './primitives/Button';
import { hasDecided, onConsentChange } from '../lib/consent';
import { EASE_EMPHASIZED } from '../lib/motion';
import { storage } from '../lib/storage';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'ezyify.pwa.dismissedAt';
const VISITS_KEY = 'ezyify.pwa.visits';
const SNOOZE_DAYS = 14;
/** Chrome's own heuristics fire `beforeinstallprompt` early; we wait for real engagement before asking. */
const MIN_VISITS = 2;
const MIN_ROUTE_CHANGES = 3;
const QUIET_ROUTES = [/^\/welcome/, /^\/onboarding/, /^\/login/, /^\/signup/, /^\/otp/, /^\/forgot/, /^\/reset/, /^\/checkout/, /^\/loops/, /^\/stories/, /^\/live\//];

let deferredEvent: BeforeInstallPromptEvent | null = null;
const subscribers = new Set<() => void>();
if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredEvent = e as BeforeInstallPromptEvent;
    subscribers.forEach(fn => fn());
  });
  window.addEventListener('appinstalled', () => {
    deferredEvent = null;
    subscribers.forEach(fn => fn());
  });
}

const isStandalone = () =>
  typeof window !== 'undefined' && (window.matchMedia('(display-mode: standalone)').matches || (window.navigator as Navigator & { standalone?: boolean }).standalone === true);

function useInstallEvent() {
  const [, force] = useState(0);
  useEffect(() => {
    const fn = () => force(n => n + 1);
    subscribers.add(fn);
    return () => {
      subscribers.delete(fn);
    };
  }, []);
  return deferredEvent;
}

async function runInstall(event: BeforeInstallPromptEvent) {
  await event.prompt();
  const { outcome } = await event.userChoice;
  if (outcome !== 'accepted') storage.set(DISMISSED_KEY, Date.now());
  deferredEvent = null;
  subscribers.forEach(fn => fn());
  return outcome;
}

/**
 * Contextual "Add to Home screen" card. Shows only after: consent decided, ≥2 visits, ≥3 in-app navigations,
 * not on a focused flow, not snoozed in the last 14 days. Never blocks the page.
 */
export default function InstallPrompt() {
  const event = useInstallEvent();
  const location = useLocation();
  const reduce = useReducedMotion();
  const [routeChanges, setRouteChanges] = useState(0);
  const [consented, setConsented] = useState(() => (typeof window !== 'undefined' ? hasDecided() : false));
  const [dismissed, setDismissed] = useState(false);
  const [visits] = useState(() => {
    const n = storage.get<number>(VISITS_KEY, 0) + 1;
    storage.set(VISITS_KEY, n);
    return n;
  });

  useEffect(() => onConsentChange(() => setConsented(hasDecided())), []);
  useEffect(() => setRouteChanges(n => n + 1), [location.pathname]);

  const snoozedAt = storage.get<number>(DISMISSED_KEY, 0);
  const snoozed = snoozedAt > 0 && Date.now() - snoozedAt < SNOOZE_DAYS * 86_400_000;
  const quiet = QUIET_ROUTES.some(r => r.test(location.pathname));
  const visible = Boolean(event) && !isStandalone() && consented && !dismissed && !snoozed && !quiet && visits >= MIN_VISITS && routeChanges >= MIN_ROUTE_CHANGES;

  const dismiss = () => {
    setDismissed(true);
    storage.set(DISMISSED_KEY, Date.now());
  };

  return (
    <AnimatePresence>
      {visible && event && (
        <motion.aside
          role="complementary"
          aria-label="Install Ezyify"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24, scale: 0.98 }}
          transition={{ duration: 0.32, ease: EASE_EMPHASIZED }}
          className="fixed inset-x-3 bottom-[calc(var(--nav-height)+var(--safe-bottom)+0.75rem)] z-[55] mx-auto max-w-md overflow-hidden rounded-2xl border border-border/70 bg-card/95 shadow-brand-lg backdrop-blur-xl sm:inset-x-6 lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0"
        >
          <div className="pointer-events-none absolute inset-0 bg-aurora opacity-40" aria-hidden />
          <button type="button" onClick={dismiss} aria-label="Not now" className="absolute right-2 top-2 z-10 flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
            <X className="size-4" />
          </button>
          <div className="relative flex gap-3 p-4">
            <BrandMark size={44} className="mt-0.5 shrink-0" />
            <div className="min-w-0 flex-1 pr-6">
              <h2 className="font-display text-base font-semibold text-foreground">Add Ezyify to your home screen</h2>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">One tap to open, works offline, and loads in a blink — no store download needed.</p>
              <div className="mt-3 flex gap-2">
                <Button size="sm" leftIcon={<Download className="size-4" />} onClick={() => void runInstall(event).then(o => o === 'accepted' && setDismissed(true))}>
                  Install
                </Button>
                <Button size="sm" variant="ghost" onClick={dismiss}>
                  Not now
                </Button>
              </div>
            </div>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

/** Compact header/settings entry; renders nothing when the browser has no install offer. */
export function InstallButton({ className = '' }: { className?: string }) {
  const event = useInstallEvent();
  if (!event || isStandalone()) return null;
  return (
    <Button variant="secondary" size="sm" leftIcon={<Download className="size-4" />} className={className} onClick={() => void runInstall(event)} title="Install Ezyify">
      Install app
    </Button>
  );
}
