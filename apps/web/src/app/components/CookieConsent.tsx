import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { Cookie } from 'lucide-react';
import { Button } from './primitives/Button';
import { ALL_CONSENT, DEFAULT_CONSENT, browserSignalsOptOut, hasDecided, onConsentChange, setConsent } from '../lib/consent';
import { EASE_EMPHASIZED } from '../lib/motion';

/** Routes where a banner would compete with a task (auth, checkout, first-run, full-screen media). */
const QUIET_ROUTES = [/^\/welcome/, /^\/onboarding/, /^\/login/, /^\/signup/, /^\/otp/, /^\/forgot/, /^\/reset/, /^\/checkout/, /^\/loops/, /^\/stories/, /^\/live\//];

/**
 * First-visit consent banner (SECURITY.md 8.3.8). Analytics/marketing stay off until "Accept".
 * GPC/DNT browsers are treated as "Reject" silently. Fine-grained toggles live on /privacy-preferences.
 */
export function CookieConsent() {
  const location = useLocation();
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (hasDecided()) return;
    if (browserSignalsOptOut()) {
      setConsent(DEFAULT_CONSENT);
      return;
    }
    // Let the splash/onboarding settle before asking.
    const t = window.setTimeout(() => setOpen(true), 1200);
    const off = onConsentChange(() => setOpen(false));
    return () => {
      window.clearTimeout(t);
      off();
    };
  }, []);

  const quiet = QUIET_ROUTES.some(r => r.test(location.pathname));
  const visible = open && !quiet;

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          role="dialog"
          aria-labelledby="cookie-consent-title"
          aria-describedby="cookie-consent-desc"
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          transition={{ duration: 0.32, ease: EASE_EMPHASIZED }}
          className="fixed inset-x-3 bottom-[calc(var(--nav-height)+var(--safe-bottom)+0.75rem)] z-[60] mx-auto max-w-xl rounded-2xl border border-border/70 bg-card/95 p-4 shadow-brand-lg backdrop-blur-xl sm:inset-x-6 lg:bottom-6 lg:left-auto lg:right-6 lg:mx-0"
        >
          <div className="flex gap-3">
            <div className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Cookie className="size-5" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <h2 id="cookie-consent-title" className="font-display text-base font-semibold text-foreground">
                Your privacy, your call
              </h2>
              <p id="cookie-consent-desc" className="mt-1 text-sm leading-relaxed text-muted-foreground">
                We use essential cookies to keep Ezyify secure. With your OK we also use anonymous analytics to improve the app. No ads trackers unless you opt in.{' '}
                <Link to="/privacy" className="font-medium text-primary underline-offset-4 hover:underline">
                  Privacy policy
                </Link>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button size="sm" onClick={() => setConsent(ALL_CONSENT)}>
                  Accept all
                </Button>
                <Button size="sm" variant="outline" onClick={() => setConsent(DEFAULT_CONSENT)}>
                  Essential only
                </Button>
                <Button size="sm" variant="ghost" asChild>
                  <Link to="/privacy-preferences">Customise</Link>
                </Button>
              </div>
            </div>
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
