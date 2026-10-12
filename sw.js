// Service Worker: speichert alle Dateien des Spiels auf dem Gerät,
// damit es auch ohne Internet läuft.
//
// WICHTIG: Bei jeder Veröffentlichung CACHE_VERSION erhöhen (und VERSION in js/main.js),
// sonst sehen Geräte, die das Spiel schon geöffnet hatten, die alte Fassung.
const CACHE_VERSION = "0.3.0";
const CACHE_NAME = `zauberei-${CACHE_VERSION}`;

const DATEIEN = [
  "./",
  "index.html",
  "css/style.css",
  "js/main.js",
  "js/board.js",
  "js/steine.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(DATEIEN))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  // Alte Versionen aufräumen
  event.waitUntil(
    caches.keys().then((namen) =>
      Promise.all(
        namen
          .filter((name) => name.startsWith("zauberei-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    )
  );
  self.clients.claim();
});

// Netz zuerst (damit Updates ankommen), bei fehlendem Internet aus dem Speicher.
self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  event.respondWith(
    fetch(event.request)
      .then((antwort) => {
        const kopie = antwort.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, kopie));
        return antwort;
      })
      .catch(() =>
        caches.match(event.request, { ignoreSearch: true })
      )
  );
});
