import * as Sentry from '@sentry/react';
import { getConsent, onConsentChange, type ConsentPreferences } from './consent';

/**
 * Observability wiring, all behind env + consent:
 *  - Sentry (errors, performance) — enabled by VITE_SENTRY_DSN; strictly necessary, no consent required,
 *    but PII (IP, user id, replays) is only attached once analytics consent is granted.
 *  - PostHog (product analytics) — enabled by VITE_POSTHOG_KEY and loaded lazily only after analytics consent.
 */
const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;
const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
const POSTHOG_HOST = (import.meta.env.VITE_POSTHOG_HOST as string | undefined) || 'https://eu.i.posthog.com';
const RELEASE = import.meta.env.VITE_APP_VERSION as string | undefined;

type PostHog = typeof import('posthog-js').default;
let posthog: PostHog | null = null;
let posthogLoading: Promise<PostHog | null> | null = null;

export function initSentry() {
  if (!SENTRY_DSN || !import.meta.env.PROD) return;
  Sentry.init({
    dsn: SENTRY_DSN,
    release: RELEASE,
    environment: import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0.1,
    integrations: [Sentry.browserTracingIntegration()],
    // Never ship tokens or emails inside breadcrumbs/urls.
    beforeSend(event) {
      if (event.request?.headers) delete event.request.headers.Authorization;
      if (event.request?.cookies) delete event.request.cookies;
      return event;
    },
    ignoreErrors: ['ResizeObserver loop', 'Loading chunk', 'Failed to fetch dynamically imported module', 'AbortError'],
  });
}

async function loadPostHog(): Promise<PostHog | null> {
  if (!POSTHOG_KEY || !import.meta.env.PROD) return null;
  if (posthog) return posthog;
  posthogLoading ??= import('posthog-js').then(m => {
    const ph = m.default;
    ph.init(POSTHOG_KEY, {
      api_host: POSTHOG_HOST,
      persistence: 'localStorage+cookie',
      capture_pageview: false, // routed manually from <Analytics/>
      capture_pageleave: true,
      autocapture: false,
      disable_session_recording: true,
      respect_dnt: true,
      mask_all_text: true,
      mask_all_element_attributes: true,
    });
    posthog = ph;
    return ph;
  });
  return posthogLoading;
}

function applyConsent(prefs: ConsentPreferences | null) {
  const analytics = prefs?.analytics === true;
  if (analytics) {
    void loadPostHog().then(ph => ph?.opt_in_capturing());
  } else if (posthog) {
    posthog.opt_out_capturing();
    posthog.reset();
  }
  // Sentry stays on for crash reporting, but only carries an anonymous user id with consent.
  if (!analytics) Sentry.setUser(null);
}

/** Call once from App after mount. Cheap when no DSN/key is configured. */
export function initTelemetry() {
  initSentry();
  applyConsent(getConsent());
  onConsentChange(applyConsent);
}

export function identifyUser(user: { id: string; username?: string } | null) {
  if (!getConsent()?.analytics) return;
  if (user) {
    Sentry.setUser({ id: user.id, username: user.username });
    posthog?.identify(user.id, { username: user.username });
  } else {
    Sentry.setUser(null);
    posthog?.reset();
  }
}

export function capturePageView(path: string) {
  if (!getConsent()?.analytics) return;
  posthog?.capture('$pageview', { $current_url: window.location.origin + path });
}

export function captureEvent(name: string, props?: Record<string, unknown>) {
  if (!getConsent()?.analytics) return;
  posthog?.capture(name, props);
}

export function captureError(error: unknown, context?: Record<string, unknown>) {
  if (!SENTRY_DSN) return;
  Sentry.captureException(error, context ? { extra: context } : undefined);
}

export { Sentry };
