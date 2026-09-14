import { toast } from 'sonner';
import { registerSW } from 'virtual:pwa-register';

/**
 * Service-worker lifecycle (vite-plugin-pwa / Workbox). Registered after first paint from `App`.
 * Updates are opt-in via a toast instead of an auto-reload so a checkout in progress is never interrupted.
 */
export function registerPwa() {
  if (!import.meta.env.PROD || typeof navigator === 'undefined' || !('serviceWorker' in navigator)) return;

  let updateSW: ((reload?: boolean) => Promise<void>) | undefined;
  try {
    updateSW = registerSW({
      immediate: true,
      onNeedRefresh() {
        toast('A new version of Ezyify is ready', {
          id: 'pwa-update',
          duration: Infinity,
          description: 'Reload to get the latest features and fixes.',
          action: { label: 'Reload', onClick: () => void updateSW?.(true) },
        });
      },
      onOfflineReady() {
        toast.success('Ezyify is ready to work offline', { id: 'pwa-offline', duration: 4000 });
      },
      onRegisteredSW(_url, registration) {
        // Check for a new build roughly once an hour while the tab stays open.
        if (registration) setInterval(() => void registration.update(), 60 * 60 * 1000);
      },
    });
  } catch {
    // Registration failures are non-fatal; the app keeps working online.
  }

  // Legacy hand-written worker (public/service-worker.js) is gone — evict it so stale precaches never win.
  void navigator.serviceWorker.getRegistrations().then(regs => {
    for (const reg of regs) if (reg.active?.scriptURL.endsWith('/service-worker.js')) void reg.unregister();
  });
}
