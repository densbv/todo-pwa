const CACHE_NAME = "todo-v2";
const ASSETS = [
  "/todo-pwa/index.html",
  "/todo-pwa/app.js",
  "/todo-pwa/manifest.json",
  "/todo-pwa/styles/bootstrap.min.css",
  "/todo-pwa/styles/app.css",
  "/todo-pwa/assets/icons/icon-192.png",
  "/todo-pwa/assets/icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
  );
});

