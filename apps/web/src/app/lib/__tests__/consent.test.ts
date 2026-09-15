import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ALL_CONSENT, CONSENT_KEY, DEFAULT_CONSENT, browserSignalsOptOut, getConsent, hasDecided, onConsentChange, resetConsent, setConsent } from '../consent';

describe('consent store', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('starts undecided with analytics off', () => {
    expect(hasDecided()).toBe(false);
    expect(getConsent()).toBeNull();
  });

  it('persists a decision and notifies listeners', () => {
    const listener = vi.fn();
    const off = onConsentChange(listener);
    setConsent(ALL_CONSENT);
    expect(listener).toHaveBeenCalledWith(expect.objectContaining({ analytics: true, necessary: true }));
    expect(hasDecided()).toBe(true);
    expect(getConsent()?.marketing).toBe(true);
    off();
    resetConsent();
    expect(listener).toHaveBeenCalledTimes(1);
    expect(getConsent()).toBeNull();
  });

  it('ignores records from an older consent version', () => {
    window.localStorage.setItem(CONSENT_KEY, JSON.stringify({ version: '1.0', preferences: ALL_CONSENT, timestamp: 1 }));
    expect(hasDecided()).toBe(false);
  });

  it('never lets necessary be switched off', () => {
    setConsent({ ...DEFAULT_CONSENT, necessary: undefined as unknown as true });
    expect(getConsent()?.necessary).toBe(true);
  });

  it('treats GPC / DNT as an opt-out signal', () => {
    expect(browserSignalsOptOut()).toBe(false);
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: true, configurable: true });
    expect(browserSignalsOptOut()).toBe(true);
    Object.defineProperty(navigator, 'globalPrivacyControl', { value: undefined, configurable: true });
  });
});
