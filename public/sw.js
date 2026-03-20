const CACHE_NAME = 'pure-path-v2'; // Increment version to force update
const STATIC_ASSETS = [
  '/',
  '/login',
  '/register',
  '/offline.html',
  '/api/manifest', // Add the API manifest route
  '/icon-light-32x32.png',
  '/icon-dark-32x32.png',
  '/icon.svg',
  '/apple-icon.png'
];

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS).catch((err) => {
        console.log('[Service Worker] Cache addAll error:', err);
        // Try to cache individually
        return Promise.allSettled(
          STATIC_ASSETS.map(asset => 
            cache.add(asset).catch(e => console.log(`Failed to cache ${asset}:`, e))
          )
        );
      });
    })
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - network first, fall back to cache
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Handle manifest requests - always go to network first, then cache
  if (url.pathname === '/manifest.json' || url.pathname === '/api/manifest') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            if (cached) {
              return cached;
            }
            // Fallback to offline manifest
            return new Response(
              JSON.stringify({
                name: "Pure Path",
                short_name: "Pure Path",
                description: "Community welfare management system",
                start_url: "/",
                display: "standalone",
                background_color: "#0f172a",
                theme_color: "#0f172a",
                icons: [
                  {
                    src: "/icon-dark-32x32.png",
                    sizes: "32x32",
                    type: "image/png"
                  }
                ]
              }),
              {
                headers: { 'Content-Type': 'application/manifest+json' }
              }
            );
          });
        })
    );
    return;
  }

  // Skip API calls - let them fail if offline
  if (url.pathname.startsWith('/api')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'You are offline. Please check your connection.' }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Network first strategy for pages and assets
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for static assets
        if (response.ok && (
          url.pathname.startsWith('/_next/') ||
          url.pathname.match(/\.(css|js|png|jpg|jpeg|svg|ico)$/)
        )) {
          const responseToCache = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return response;
      })
      .catch(() => {
        // Fall back to cache for pages
        if (url.pathname === '/') {
          return caches.match('/');
        }
        if (url.pathname === '/login') {
          return caches.match('/login');
        }
        if (url.pathname === '/register') {
          return caches.match('/register');
        }
        
        return caches.match(request).then((cached) => {
          if (cached) {
            return cached;
          }
          // Fallback to offline page
          if (request.mode === 'navigate') {
            return caches.match('/offline.html');
          }
          return new Response('Offline', { status: 503 });
        });
      })
  );
});
