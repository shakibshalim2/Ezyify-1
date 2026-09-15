import { useEffect } from 'react';
import { useLocation } from 'react-router';
import { useAuth } from '../contexts/AuthContext';
import { capturePageView, identifyUser, initTelemetry } from '../lib/telemetry';

/**
 * Route-change page views + user identity for the consent-gated telemetry layer (`lib/telemetry.ts`).
 * Renders nothing; everything is a no-op until VITE_SENTRY_DSN / VITE_POSTHOG_KEY are set and consent is granted.
 */
export function Analytics() {
  const location = useLocation();
  const { user } = useAuth();

  useEffect(() => {
    initTelemetry();
  }, []);

  useEffect(() => {
    capturePageView(location.pathname + location.search);
  }, [location.pathname, location.search]);

  useEffect(() => {
    identifyUser(user ? { id: user.id, username: user.username } : null);
  }, [user?.id, user?.username]);

  return null;
}
