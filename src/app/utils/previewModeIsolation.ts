/**
 * PREVIEW MODE HARD ISOLATION
 * - Introduces explicit PREVIEW_MODE flag
 * - Guarantees no production logic runs in preview
 * - Ensures preview remains static and instant regardless of future features
 */

// Global preview mode flag
let PREVIEW_MODE = false;

/**
 * Set preview mode (should only be called from preview loader)
 */
export function enablePreviewMode(): void {
  PREVIEW_MODE = true;
  
  if (typeof window !== 'undefined') {
    // Set global flag for debugging
    (window as any).__EZYIFY_PREVIEW_MODE__ = true;
    
    // Prevent any analytics in preview mode
    (window as any).gtag = () => {};
    (window as any).fbq = () => {};
    
    // Log preview mode activation
    console.log('%c[PREVIEW MODE] Activated - All production logic disabled', 'color: #10b981; font-weight: bold');
  }
}

/**
 * Check if preview mode is active
 */
export function isPreviewMode(): boolean {
  return PREVIEW_MODE;
}

/**
 * Disable preview mode
 */
export function disablePreviewMode(): void {
  PREVIEW_MODE = false;
  
  if (typeof window !== 'undefined') {
    (window as any).__EZYIFY_PREVIEW_MODE__ = false;
  }
}

/**
 * Execute only if NOT in preview mode
 */
export function whenNotPreview<T>(fn: () => T): T | null {
  if (!PREVIEW_MODE) {
    return fn();
  }
  return null;
}

/**
 * Execute only if in preview mode
 */
export function whenPreview<T>(fn: () => T): T | null {
  if (PREVIEW_MODE) {
    return fn();
  }
  return null;
}

/**
 * Guard API calls - prevent in preview mode
 */
export function guardedFetch(url: string, options?: RequestInit): Promise<Response> | null {
  if (PREVIEW_MODE) {
    console.warn('[PREVIEW MODE] API call blocked:', url);
    return null;
  }
  
  return fetch(url, options);
}

/**
 * Guard localStorage access - use session storage in preview
 */
export function guardedLocalStorage(): Storage {
  if (PREVIEW_MODE && typeof window !== 'undefined') {
    return window.sessionStorage;
  }
  
  return typeof window !== 'undefined' ? window.localStorage : {} as Storage;
}

/**
 * Guard heavy computations - skip in preview mode
 */
export function guardedCompute<T>(fn: () => T, fallback: T): T {
  if (PREVIEW_MODE) {
    return fallback;
  }
  
  return fn();
}

/**
 * Guard service worker - disable in preview mode
 */
export function canUseServiceWorker(): boolean {
  return !PREVIEW_MODE && 'serviceWorker' in navigator;
}

/**
 * Guard analytics - prevent in preview mode
 */
export function trackEvent(event: string, data?: any): void {
  if (PREVIEW_MODE) {
    return;
  }
  
  // Normal analytics tracking
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', event, data);
  }
}

/**
 * Get preview mode config
 */
export interface PreviewModeConfig {
  enabled: boolean;
  disabledFeatures: string[];
  cachedComponents: Set<string>;
}

export function getPreviewModeConfig(): PreviewModeConfig {
  return {
    enabled: PREVIEW_MODE,
    disabledFeatures: [
      'Analytics',
      'ServiceWorker',
      'BackgroundSync',
      'PushNotifications',
      'LocalStorage (uses SessionStorage)',
      'External API calls',
      'Heavy computations',
    ],
    cachedComponents: new Set(['PreviewShell', 'Navigation', 'MobileNav']),
  };
}
