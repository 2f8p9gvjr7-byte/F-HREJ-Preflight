// Service worker — DR400/160 F-HREJ Prévol
// Permet le fonctionnement complet hors connexion après la première visite.

const CACHE_NAME = 'fhrej-prevol-v1';
const FILES_TO_CACHE = [
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Installation : mise en cache de tous les fichiers de l'app
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(FILES_TO_CACHE))
  );
  self.skipWaiting();
});

// Activation : nettoyage des anciens caches si nouvelle version
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

// Stratégie : cache d'abord, réseau en secours (cache-first)
// Garantit que l'app s'ouvre instantanément même sans réseau.
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).catch(() => {
        // Si hors-ligne et fichier non caché, retombe sur index.html
        return caches.match('./index.html');
      });
    })
  );
});
