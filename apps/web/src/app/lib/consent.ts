/**
 * Cookie / tracking consent (SECURITY.md 8.3.8): analytics and marketing are OFF until the visitor opts in.
 * Stored in localStorage under a versioned key; bump `CONSENT_VERSION` to re-prompt after a policy change.
 */
export interface ConsentPreferences {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export interface ConsentRecord {
  preferences: ConsentPreferences;
  timestamp: number;
  version: string;
}

export const CONSENT_VERSION = '2';
export const CONSENT_KEY = 'ezyify_cookie_consent';

export const DEFAULT_CONSENT: ConsentPreferences = { necessary: true, analytics: false, marketing: false, functional: false };
export const ALL_CONSENT: ConsentPreferences = { necessary: true, analytics: true, marketing: true, functional: true };

type Listener = (prefs: ConsentPreferences | null) => void;
const listeners = new Set<Listener>();

function read(): ConsentRecord | null {
  try {
    const raw = window.localStorage.getItem(CONSENT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<ConsentRecord>;
    if (parsed.version !== CONSENT_VERSION || !parsed.preferences) return null;
    return { preferences: { ...DEFAULT_CONSENT, ...parsed.preferences, necessary: true }, timestamp: parsed.timestamp ?? 0, version: CONSENT_VERSION };
  } catch {
    return null;
  }
}

/** `null` until the visitor has made a choice for the current consent version. */
export function getConsent(): ConsentPreferences | null {
  return read()?.preferences ?? null;
}

export function hasDecided(): boolean {
  return read() !== null;
}

export function setConsent(prefs: Omit<ConsentPreferences, 'necessary'> & { necessary?: true }) {
  const preferences: ConsentPreferences = { ...prefs, necessary: true };
  try {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ preferences, timestamp: Date.now(), version: CONSENT_VERSION } satisfies ConsentRecord));
  } catch {
    /* private mode — consent lives for the session only */
  }
  listeners.forEach(l => l(preferences));
}

export function resetConsent() {
  try {
    window.localStorage.removeItem(CONSENT_KEY);
  } catch {
    /* ignore */
  }
  listeners.forEach(l => l(null));
}

export function onConsentChange(listener: Listener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Global Privacy Control / Do-Not-Track: treat as an explicit "reject optional" without showing the banner. */
export function browserSignalsOptOut(): boolean {
  if (typeof navigator === 'undefined') return false;
  const n = navigator as Navigator & { globalPrivacyControl?: boolean };
  return n.globalPrivacyControl === true || n.doNotTrack === '1';
}
