// Service worker — DR400/160 F-HREJ Prévol
// Fonctionnement hors-ligne après la première visite.

const CACHE_NAME = 'fhrej-prevol-v31';
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Installation : mise en cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activation : suppression des anciens caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Stratégie : réseau d'abord, cache en secours (network-first)
// Garantit que Vercel sert toujours la dernière version quand on est en ligne
self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request)
      .then((response) => {
        // Mettre à jour le cache avec la réponse réseau
        const responseClone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseClone));
        return response;
      })
      .catch(() => {
        // Hors ligne : servir depuis le cache
        return caches.match(event.request).then((cached) => cached || caches.match('./index.html'));
      })
  );
});
