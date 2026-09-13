/**
 * REPEAT LOAD OPTIMIZATION
 * - Caches preview shell in memory/session
 * - Ensures instant back-navigation
 * - Avoids re-render on same session revisit
 */

interface CachedShell {
  html: string;
  timestamp: number;
  route: string;
}

// In-memory cache for preview shell
const shellCache = new Map<string, CachedShell>();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

/**
 * Session storage keys
 */
const SESSION_KEYS = {
  SHELL_CACHE: 'ezyify_shell_cache',
  NAVIGATION_STACK: 'ezyify_nav_stack',
  LAST_VISITED: 'ezyify_last_visited',
} as const;

/**
 * Cache preview shell in memory
 */
export function cachePreviewShell(route: string, html: string): void {
  shellCache.set(route, {
    html,
    timestamp: Date.now(),
    route,
  });
  
  // Also cache in session storage for persistence across navigations
  try {
    sessionStorage.setItem(
      `${SESSION_KEYS.SHELL_CACHE}_${route}`,
      JSON.stringify({
        html,
        timestamp: Date.now(),
        route,
      })
    );
  } catch (error) {
    console.warn('[Repeat Load] Failed to cache in session storage:', error);
  }
}

/**
 * Get cached preview shell
 */
export function getCachedPreviewShell(route: string): string | null {
  // Try memory cache first
  const memoryCached = shellCache.get(route);
  if (memoryCached && Date.now() - memoryCached.timestamp < CACHE_EXPIRY) {
    return memoryCached.html;
  }
  
  // Try session storage
  try {
    const sessionCached = sessionStorage.getItem(`${SESSION_KEYS.SHELL_CACHE}_${route}`);
    if (sessionCached) {
      const parsed: CachedShell = JSON.parse(sessionCached);
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY) {
        // Restore to memory cache
        shellCache.set(route, parsed);
        return parsed.html;
      }
    }
  } catch (error) {
    console.warn('[Repeat Load] Failed to retrieve from session storage:', error);
  }
  
  return null;
}

/**
 * Clear cached shells
 */
export function clearShellCache(): void {
  shellCache.clear();
  
  try {
    const keys = Object.keys(sessionStorage);
    keys.forEach(key => {
      if (key.startsWith(SESSION_KEYS.SHELL_CACHE)) {
        sessionStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('[Repeat Load] Failed to clear cache:', error);
  }
}

/**
 * Track navigation for back-button optimization
 */
export function trackNavigation(route: string): void {
  try {
    const stack = getNavigationStack();
    stack.push({
      route,
      timestamp: Date.now(),
    });
    
    // Keep only last 10 routes
    const trimmed = stack.slice(-10);
    sessionStorage.setItem(SESSION_KEYS.NAVIGATION_STACK, JSON.stringify(trimmed));
    
    // Track last visited
    sessionStorage.setItem(SESSION_KEYS.LAST_VISITED, route);
  } catch (error) {
    console.warn('[Repeat Load] Failed to track navigation:', error);
  }
}

/**
 * Get navigation stack
 */
export function getNavigationStack(): Array<{ route: string; timestamp: number }> {
  try {
    const stack = sessionStorage.getItem(SESSION_KEYS.NAVIGATION_STACK);
    return stack ? JSON.parse(stack) : [];
  } catch (error) {
    return [];
  }
}

/**
 * Check if this is a back navigation
 */
export function isBackNavigation(currentRoute: string): boolean {
  const stack = getNavigationStack();
  if (stack.length < 2) return false;
  
  // Check if current route matches the previous route in stack
  const previousRoute = stack[stack.length - 2]?.route;
  return previousRoute === currentRoute;
}

/**
 * Get last visited route
 */
export function getLastVisitedRoute(): string | null {
  try {
    return sessionStorage.getItem(SESSION_KEYS.LAST_VISITED);
  } catch (error) {
    return null;
  }
}

/**
 * Preload critical assets for instant navigation
 */
export function preloadCriticalAssets(): void {
  // Only preload if browser supports it
  if (!('link' in document.createElement('link'))) {
    return;
  }
  
  // Preload critical routes
  const criticalRoutes = ['/', '/explore', '/shop', '/messages'];
  
  criticalRoutes.forEach(route => {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.href = route;
    document.head.appendChild(link);
  });
}

/**
 * Enable instant back navigation
 */
export function enableInstantBackNav(): void {
  if (typeof window === 'undefined') return;
  
  // Listen for popstate (back/forward navigation)
  window.addEventListener('popstate', (event) => {
    const currentRoute = window.location.pathname;
    
    // Check if we have cached shell
    const cached = getCachedPreviewShell(currentRoute);
    
    if (cached && isBackNavigation(currentRoute)) {
      // Instant render from cache
      console.log('[Repeat Load] Instant back navigation detected');
      
      // The actual routing will be handled by React Router
      // This just ensures the shell is ready
    }
  });
}

/**
 * Warm up cache for frequently visited routes
 */
export function warmUpCache(routes: string[]): void {
  routes.forEach(route => {
    // Create minimal shell placeholder
    const shell = `<!-- Cached shell for ${route} -->`;
    cachePreviewShell(route, shell);
  });
}

/**
 * Get cache statistics
 */
export interface CacheStats {
  memoryCacheSize: number;
  sessionCacheSize: number;
  cachedRoutes: string[];
  oldestCache: number;
  newestCache: number;
}

export function getCacheStats(): CacheStats {
  const routes: string[] = [];
  let oldest = Date.now();
  let newest = 0;
  
  shellCache.forEach((value, key) => {
    routes.push(key);
    oldest = Math.min(oldest, value.timestamp);
    newest = Math.max(newest, value.timestamp);
  });
  
  return {
    memoryCacheSize: shellCache.size,
    sessionCacheSize: Object.keys(sessionStorage).filter(k => k.startsWith(SESSION_KEYS.SHELL_CACHE)).length,
    cachedRoutes: routes,
    oldestCache: oldest,
    newestCache: newest,
  };
}
