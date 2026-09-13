// EZYIFY Service Worker - Offline Support & Caching Strategy
// Version: 1.0.0

const CACHE_NAME = 'ezyify-v1';
const RUNTIME_CACHE = 'ezyify-runtime-v1';
const IMAGE_CACHE = 'ezyify-images-v1';

// Assets to cache immediately on install
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/offline',
  // Add critical CSS and fonts
  'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap',
];

// Install event - cache critical assets
self.addEventListener('install', (event) => {
  console.log('[ServiceWorker] Installing...');
  
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[ServiceWorker] Caching critical assets');
      return cache.addAll(PRECACHE_ASSETS);
    }).then(() => {
      console.log('[ServiceWorker] Skip waiting');
      return self.skipWaiting();
    })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[ServiceWorker] Activating...');
  
  const currentCaches = [CACHE_NAME, RUNTIME_CACHE, IMAGE_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!currentCaches.includes(cacheName)) {
            console.log('[ServiceWorker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('[ServiceWorker] Claiming clients');
      return self.clients.claim();
    })
  );
});

// Fetch event - serve from cache with network fallback
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    // Handle external images (Unsplash, etc.)
    if (request.destination === 'image') {
      event.respondWith(handleImageRequest(request));
    }
    return;
  }
  
  // Handle different types of requests
  if (request.destination === 'image') {
    event.respondWith(handleImageRequest(request));
  } else if (request.mode === 'navigate') {
    event.respondWith(handleNavigationRequest(request));
  } else {
    event.respondWith(handleOtherRequests(request));
  }
});

// Handle navigation requests (pages)
async function handleNavigationRequest(request) {
  try {
    // Try network first
    const networkResponse = await fetch(request);
    
    // Clone and cache the response
    const cache = await caches.open(RUNTIME_CACHE);
    cache.put(request, networkResponse.clone());
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Network request failed, trying cache:', request.url);
    
    // Try cache
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Return offline page
    const offlineResponse = await caches.match('/offline');
    if (offlineResponse) {
      return offlineResponse;
    }
    
    // Fallback HTML if offline page not cached
    return new Response(
      `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Offline - EZYIFY</title>
        <style>
          body {
            margin: 0;
            padding: 0;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #0a0a0a;
            color: #fafafa;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
            text-align: center;
          }
          .container {
            padding: 2rem;
            max-width: 400px;
          }
          h1 {
            font-size: 2rem;
            margin-bottom: 1rem;
          }
          p {
            color: #a3a3a3;
            line-height: 1.6;
          }
          button {
            margin-top: 1.5rem;
            padding: 0.75rem 1.5rem;
            background: #0095f6;
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            cursor: pointer;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <h1>📵 You're Offline</h1>
          <p>It looks like you've lost your internet connection. Please check your network and try again.</p>
          <button onclick="window.location.reload()">Try Again</button>
        </div>
      </body>
      </html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    );
  }
}

// Handle image requests with cache-first strategy
async function handleImageRequest(request) {
  // Try cache first for images
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Clone and cache the image
    if (networkResponse.ok) {
      const cache = await caches.open(IMAGE_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Image fetch failed:', request.url);
    
    // Return a placeholder image or cached version
    return new Response(
      '<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400"><rect fill="#1a1a1a" width="400" height="400"/><text fill="#737373" font-family="sans-serif" font-size="24" x="50%" y="50%" text-anchor="middle" dominant-baseline="middle">Image unavailable</text></svg>',
      {
        headers: { 'Content-Type': 'image/svg+xml' },
      }
    );
  }
}

// Handle other requests (API, assets, etc.)
async function handleOtherRequests(request) {
  // Try cache first
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    // Fetch from network
    const networkResponse = await fetch(request);
    
    // Clone and cache if successful
    if (networkResponse.ok) {
      const cache = await caches.open(RUNTIME_CACHE);
      cache.put(request, networkResponse.clone());
    }
    
    return networkResponse;
  } catch (error) {
    console.log('[ServiceWorker] Request failed:', request.url);
    
    // Return a generic error response
    return new Response(JSON.stringify({ error: 'Network unavailable' }), {
      status: 503,
      statusText: 'Service Unavailable',
      headers: { 'Content-Type': 'application/json' },
    });
  }
}

// Handle messages from the client
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName))
        );
      })
    );
  }
});

// Push notification handling (for future use)
self.addEventListener('push', (event) => {
  console.log('[ServiceWorker] Push notification received');
  
  const options = {
    body: event.data ? event.data.text() : 'New notification from EZYIFY',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1,
    },
    actions: [
      {
        action: 'explore',
        title: 'Open App',
        icon: '/icons/checkmark.png',
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/close.png',
      },
    ],
  };
  
  event.waitUntil(
    self.registration.showNotification('EZYIFY', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[ServiceWorker] Notification click received');
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

console.log('[ServiceWorker] Service Worker loaded successfully');
