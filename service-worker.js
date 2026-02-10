/**
 * Service Worker for Digital Diary PWA
 *
 * Strategy: Cache-first for static assets, network-first for API calls.
 * Includes proper cache versioning so updates propagate to users.
 */

const CACHE_VERSION = 'v3';
const CACHE_NAME = `digital-diary-${CACHE_VERSION}`;

// Static assets to pre-cache on install
const STATIC_ASSETS = [
  './',
  './index.html',
  './review.html',
  './history.html',
  './kids.html',
  './settings.html',
  './styles/style.css',
  './scripts/app.js',
  './scripts/recorder.js',
  './scripts/tts.js',
  './scripts/storage.js',
  './scripts/speech-recognition.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
];

// Install: pre-cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately (don't wait for old tabs to close)
  self.skipWaiting();
});

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('digital-diary-') && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  // Take control of all pages immediately
  self.clients.claim();
});

// Fetch: cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') return;

  // Static assets: cache-first, fallback to network
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        // Return cached version, but also update cache in background
        event.waitUntil(
          fetch(request)
            .then((freshResponse) => {
              if (freshResponse.ok) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(request, freshResponse);
                });
              }
            })
            .catch(() => {}) // Silently fail if offline
        );
        return cachedResponse;
      }

      // Not in cache: try network, then cache the response
      return fetch(request).then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      });
    })
  );
});
