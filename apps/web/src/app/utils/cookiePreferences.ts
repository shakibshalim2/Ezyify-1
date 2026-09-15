/** Backwards-compatible facade over `lib/consent.ts` for the Privacy Preferences page. */
import { getConsent, setConsent, type ConsentPreferences } from '../lib/consent';

export type CookiePreferences = ConsentPreferences;

export const saveCookiePreferences = (prefs: Omit<ConsentPreferences, 'necessary'> & { necessary?: boolean }) => {
  setConsent({ analytics: prefs.analytics, marketing: prefs.marketing, functional: prefs.functional });
};

export const getCookiePreferences = (): CookiePreferences | null => getConsent();
