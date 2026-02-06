
const CACHE_NAME = 'vibe-finance-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/vite.svg'
];

// Install event: Cache core assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

// Activate event: Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event: Network first for API/Data, Cache first for assets, Fallback to index.html for navigation
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. Handle Navigation requests (HTML) -> Network First, fall back to Cache
  // This ensures we serve the latest version of the app if online, but work offline if not.
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .catch(() => {
          return caches.match('/index.html');
        })
    );
    return;
  }

  // 2. Handle External Resources (CDNs, Gemini API) -> Network Only (or StaleWhileRevalidate if desired)
  // We don't want to cache Gemini responses indefinitely.
  if (url.origin !== self.location.origin) {
    return; 
  }

  // 3. Handle Static Assets (JS, CSS, Images) -> Cache First, then Network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request).then((networkResponse) => {
        // Cache the new resource for next time
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      });
    })
  );
});
