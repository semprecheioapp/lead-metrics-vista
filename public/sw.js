const CACHE_NAME = 'dashboard-mbk-v2';
const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v2';

// Assets to cache immediately - minimal list for Chrome compatibility
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

// Install event - cache minimal assets
self.addEventListener('install', event => {
  console.log('Service Worker installing... v2');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching minimal assets for Chrome compatibility');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('SW installed successfully');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('SW install failed:', error);
      })
  );
});

// Activate event - clean old caches
self.addEventListener('activate', event => {
  console.log('Service Worker activating... v2');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('SW activated successfully');
        return self.clients.claim();
      })
      .catch(error => {
        console.error('SW activation failed:', error);
      })
  );
});

// Simplified fetch strategy for Chrome compatibility
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Skip non-GET requests and non-same-origin requests
  if (request.method !== 'GET' || !request.url.startsWith(self.location.origin)) {
    return;
  }

  // For navigation requests, always go to network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/');
        })
    );
    return;
  }

  // For other requests, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then(cachedResponse => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then(response => {
            // Only cache successful responses
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }
            
            // Cache the response
            const responseToCache = response.clone();
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(request, responseToCache);
              })
              .catch(error => {
                console.warn('Failed to cache response:', error);
              });
            
            return response;
          })
          .catch(error => {
            console.warn('Fetch failed:', error);
            return new Response('Offline', { status: 503 });
          });
      })
  );
});

// Handle errors gracefully
self.addEventListener('error', event => {
  console.error('Service Worker error:', event.error);
});

self.addEventListener('unhandledrejection', event => {
  console.error('Service Worker unhandled rejection:', event.reason);
  event.preventDefault();
});