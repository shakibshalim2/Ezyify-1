/**
 * Optimized Font Loading Strategy
 * Defers non-critical font loading to improve first-paint performance
 */

export function loadFontsOptimized() {
  // Only load fonts after page is interactive
  if (typeof window === 'undefined') return;

  // Use requestIdleCallback for non-blocking font load
  const loadFonts = () => {
    // Check if fonts are already loaded
    if (document.querySelector('link[href*="fonts.googleapis"]')) {
      return;
    }

    // Create font preconnect for faster DNS resolution
    const preconnect1 = document.createElement('link');
    preconnect1.rel = 'preconnect';
    preconnect1.href = 'https://fonts.googleapis.com';
    document.head.appendChild(preconnect1);

    const preconnect2 = document.createElement('link');
    preconnect2.rel = 'preconnect';
    preconnect2.href = 'https://fonts.gstatic.com';
    preconnect2.crossOrigin = 'anonymous';
    document.head.appendChild(preconnect2);

    // Load Inter font with font-display: swap for instant text rendering
    const fontLink = document.createElement('link');
    fontLink.rel = 'stylesheet';
    fontLink.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap';
    document.head.appendChild(fontLink);
  };

  // Use requestIdleCallback if available, otherwise setTimeout
  if ('requestIdleCallback' in window) {
    requestIdleCallback(loadFonts, { timeout: 300 });
  } else {
    setTimeout(loadFonts, 100);
  }
}

// Preload critical fonts for instant display
export function preloadCriticalFonts() {
  if (typeof window === 'undefined') return;

  // Only preload on fast connections
  if ('connection' in navigator) {
    const connection = (navigator as any).connection;
    if (connection && connection.saveData) {
      return; // Skip font preload for data saver mode
    }
  }

  // Preload only the most critical font weights
  const preload = document.createElement('link');
  preload.rel = 'preload';
  preload.as = 'font';
  preload.href = 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2';
  preload.crossOrigin = 'anonymous';
  preload.type = 'font/woff2';
  
  // Only add if document head exists
  if (document.head) {
    document.head.appendChild(preload);
  }
}
