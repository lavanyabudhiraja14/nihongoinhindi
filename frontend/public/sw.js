const CACHE_NAME = 'nihongo-v1';

const PRECACHE_ASSETS = [
  '/',
  '/learn',
  '/review',
  '/progress',
  '/tutor',
  '/manifest.json',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable-192.png',
  '/icon-maskable-512.png',
  '/icon.svg',
];

// Install Event: precache core app shell and assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())
  );
});

// Activate Event: delete old-named caches so updates aren't stuck behind stale caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((name) => {
            if (name !== CACHE_NAME) {
              return caches.delete(name);
            }
          })
        );
      })
      .then(() => self.clients.claim())
  );
});

// Fetch Event: Cache-first for static files/content, Network-only for backend API calls
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Network-only for backend API endpoints (/api/tutor, /health, or cross-origin backend calls)
  if (
    url.pathname.startsWith('/api/') ||
    url.pathname === '/health' ||
    url.port === '8000'
  ) {
    event.respondWith(fetch(event.request));
    return;
  }

  // Only handle GET requests with cache
  if (event.request.method !== 'GET') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Cache-first strategy for static assets, pages, and content
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          // Cache successful responses for same-origin static requests
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'default')
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and requesting a page navigation, return cached home
          if (event.request.mode === 'navigate') {
            return caches.match('/');
          }
        });
    })
  );
});
