const CACHE_NAME = "factize-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/logo1.png",
  "/logo2.png",
  "/favicon.svg",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
  "/maskable-icon.png",
  "/apple-touch-icon.png"
];

// Pre-cache static skeleton on install
self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// Clean up old caches on activation
self.addEventListener("activate", (e) => {
  e.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch interceptor with dynamic caching strategy
self.addEventListener("fetch", (e) => {
  const url = new URL(e.request.url);

  // Exclude API requests, web sockets, backend scanner, and Vite hot reload modules
  if (
    url.pathname.startsWith("/api") || 
    url.pathname.startsWith("/ws") || 
    url.pathname.includes("@vite") || 
    url.pathname.includes("hot-update") ||
    e.request.method !== "GET"
  ) {
    return;
  }

  e.respondWith(
    caches.match(e.request).then((cachedResponse) => {
      // 1. Cache-First (Stale-While-Revalidate) for large static media assets, images, and fonts
      const isCacheFirstAsset = 
        STATIC_ASSETS.includes(url.pathname) || 
        url.pathname.endsWith(".png") || 
        url.pathname.endsWith(".svg") || 
        url.pathname.endsWith(".woff2") || 
        url.pathname.endsWith(".ttf");

      if (isCacheFirstAsset && cachedResponse) {
        fetch(e.request).then((networkResponse) => {
          if (networkResponse.status === 200) {
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      // 2. Network-First (with cache fallback) for core HTML, dynamically-named JS/CSS bundles
      return fetch(e.request)
        .then((networkResponse) => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(e.request, responseClone));
          }
          return networkResponse;
        })
        .catch(() => {
          return cachedResponse || caches.match("/");
        });
    })
  );
});
