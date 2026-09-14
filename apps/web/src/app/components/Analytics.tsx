import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { trackPageView, trackPerformance, initAnalytics } from '../utils/analytics';

/**
 * Analytics Component - OPTIMIZED
 * Defers analytics initialization to avoid blocking first paint
 * Handles automatic page view tracking after initialization
 */
export function Analytics() {
  const location = useLocation();

  // Defer analytics initialization to avoid blocking first paint
  useEffect(() => {
    const initAnalyticsDeferred = () => {
      initAnalytics();

      // Track initial performance metrics after load
      if (typeof window !== 'undefined') {
        window.addEventListener('load', () => {
          setTimeout(trackPerformance, 0);
        });
      }
    };

    // Use requestIdleCallback for non-blocking initialization
    if ('requestIdleCallback' in window) {
      requestIdleCallback(initAnalyticsDeferred, { timeout: 3000 });
    } else {
      setTimeout(initAnalyticsDeferred, 1000);
    }
  }, []);

  // Track page views on route change
  useEffect(() => {
    // Defer page view tracking slightly to ensure analytics is initialized
    const timeout = setTimeout(() => {
      trackPageView({
        path: location.pathname,
        title: document.title,
        referrer: document.referrer,
      });
    }, 100);

    return () => clearTimeout(timeout);
  }, [location]);

  return null;
}