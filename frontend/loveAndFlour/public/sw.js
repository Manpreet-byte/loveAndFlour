/* Love & Flour PWA Service Worker (minimal, no token caching). */
const CACHE_VERSION = 'laf-v1';
const SHELL_CACHE = `${CACHE_VERSION}:shell`;
const RUNTIME_CACHE = `${CACHE_VERSION}:runtime`;

const SHELL_ASSETS = ['/', '/offline.html', '/manifest.webmanifest', '/brand/logo.png'];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE)
      .then((cache) => cache.addAll(SHELL_ASSETS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((k) => !k.startsWith(CACHE_VERSION))
          .map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

function isNavigationRequest(request) {
  return request.mode === 'navigate' || (request.method === 'GET' && request.headers.get('accept')?.includes('text/html'));
}

function isApiRequest(url) {
  return url.pathname.startsWith('/api/');
}

function isCacheableStatic(url) {
  return (
    url.pathname.startsWith('/assets/') ||
    url.pathname.startsWith('/brand/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.jpeg') ||
    url.pathname.endsWith('.webp') ||
    url.pathname.endsWith('.svg')
  );
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);

  // Never cache POST/PUT/PATCH/DELETE.
  if (req.method !== 'GET') return;

  // Never cache API responses (avoid leaking protected data via SW caches).
  if (isApiRequest(url)) return;

  if (isNavigationRequest(req)) {
    event.respondWith(
      (async () => {
        try {
          return await fetch(req);
        } catch {
          const cache = await caches.open(SHELL_CACHE);
          const cached = await cache.match('/offline.html');
          return cached || new Response('Offline', { status: 503, headers: { 'content-type': 'text/plain' } });
        }
      })(),
    );
    return;
  }

  if (isCacheableStatic(url)) {
    event.respondWith(
      (async () => {
        const cache = await caches.open(RUNTIME_CACHE);
        const cached = await cache.match(req);
        if (cached) return cached;
        const res = await fetch(req);
        // Only cache successful, basic/cors responses.
        if (res && res.ok) cache.put(req, res.clone()).catch(() => {});
        return res;
      })(),
    );
  }
});

