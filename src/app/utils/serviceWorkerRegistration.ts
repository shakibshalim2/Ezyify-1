// Service Worker Registration Utility
// Registers and manages the service worker lifecycle

export function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/service-worker.js')
        .then((registration) => {
          console.log('[SW] Service Worker registered successfully:', registration.scope);
          
          // Check for updates periodically
          setInterval(() => {
            registration.update();
          }, 60000); // Check every minute
          
          // Handle updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  // New service worker available
                  console.log('[SW] New version available! Please refresh.');
                  
                  // Optionally show a notification to the user
                  if (window.confirm('A new version of EZYIFY is available. Reload to update?')) {
                    newWorker.postMessage({ type: 'SKIP_WAITING' });
                    window.location.reload();
                  }
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[SW] Service Worker registration failed:', error);
        });
      
      // Handle controller change (new SW activated)
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        console.log('[SW] New service worker activated');
        window.location.reload();
      });
    });
  } else {
    console.log('[SW] Service Worker is not supported in this browser');
  }
}

export function unregisterServiceWorker() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
        console.log('[SW] Service Worker unregistered');
      })
      .catch((error) => {
        console.error('[SW] Service Worker unregistration failed:', error);
      });
  }
}

export function clearServiceWorkerCache() {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'CLEAR_CACHE' });
    console.log('[SW] Cache clear requested');
  }
}

// Check if the app is running in standalone mode (installed as PWA)
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as any).standalone === true
  );
}

// Get connection status
export function getConnectionStatus() {
  return {
    online: navigator.onLine,
    effectiveType: (navigator as any).connection?.effectiveType || 'unknown',
    saveData: (navigator as any).connection?.saveData || false,
  };
}

// Listen for online/offline events
export function setupConnectionListeners(
  onOnline?: () => void,
  onOffline?: () => void
) {
  window.addEventListener('online', () => {
    console.log('[Connection] Back online');
    if (onOnline) onOnline();
  });
  
  window.addEventListener('offline', () => {
    console.log('[Connection] Went offline');
    if (onOffline) onOffline();
  });
  
  // Initial status
  console.log('[Connection] Status:', navigator.onLine ? 'Online' : 'Offline');
}
