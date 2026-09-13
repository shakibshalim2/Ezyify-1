/**
 * Cookie Preferences Helper Functions
 * Shared utility for cookie consent management
 */

import { initAnalytics } from './analytics';

export interface CookiePreferences {
  necessary: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

export const saveCookiePreferences = (newPreferences: CookiePreferences) => {
  const consentData = {
    preferences: newPreferences,
    timestamp: Date.now(),
    version: '1.0',
  };
  
  localStorage.setItem('ezyify_cookie_consent', JSON.stringify(consentData));
  
  if (newPreferences.analytics) {
    initAnalytics();
  }
  
  window.location.reload();
};

export const getCookiePreferences = (): CookiePreferences | null => {
  const consentData = localStorage.getItem('ezyify_cookie_consent');
  if (consentData) {
    try {
      const { preferences } = JSON.parse(consentData);
      return preferences;
    } catch (e) {
      return null;
    }
  }
  return null;
};
