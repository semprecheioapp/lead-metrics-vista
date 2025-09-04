const CACHE_NAME = 'dashboard-mbk-v3';
const STATIC_CACHE = 'static-v3';

// Minimal assets to cache
const STATIC_ASSETS = [
  '/',
  '/manifest.json'
];

// Install event - cache minimal assets and skip waiting
self.addEventListener('install', event => {
  console.log('Service Worker installing... v3');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Caching minimal assets');
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

// Activate event - clean old caches and claim clients
self.addEventListener('activate', event => {
  console.log('Service Worker activating... v3');
  event.waitUntil(
    caches.keys()
      .then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (cacheName !== STATIC_CACHE) {
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

// Only handle navigation requests - don't interfere with assets/scripts
self.addEventListener('fetch', event => {
  const { request } = event;
  
  // Only handle navigation requests (page loads)
  if (request.mode !== 'navigate') {
    return;
  }

  // For navigation requests, always try network first, fallback to cache
  event.respondWith(
    fetch(request)
      .catch(() => {
        return caches.match('/');
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