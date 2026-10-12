// Service Worker: speichert alle Dateien des Spiels auf dem Gerät,
// damit es auch ohne Internet läuft.
//
// WICHTIG: Bei jeder Veröffentlichung CACHE_VERSION erhöhen (und VERSION in js/main.js),
// sonst sehen Geräte, die das Spiel schon geöffnet hatten, die alte Fassung.
const CACHE_VERSION = "0.6.0";
const CACHE_NAME = `zauberei-${CACHE_VERSION}`;

const DATEIEN = [
  "./",
  "index.html",
  "css/style.css",
  "js/main.js",
  "js/board.js",
  "js/steine.js",
  "js/aufgaben.js",
  "js/schwierigkeit.js",
  "js/herausforderungen.js",
  "js/figuren.js",
  "manifest.webmanifest",
  "icons/icon-192.png",
  "icons/icon-512.png",
  "icons/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    // cache: "reload" holt die Dateien garantiert frisch vom Server (nicht aus dem Browser-Zwischenspeicher)
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(DATEIEN.map((datei) => new Request(datei, { cache: "reload" })))
    )
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

// Netz zuerst (damit Updates sofort ankommen), bei fehlendem Internet aus dem Speicher.
// cache: "no-cache" fragt immer beim Server nach, ob es eine neuere Datei gibt –
// GitHub Pages erlaubt Browsern sonst, Dateien bis zu 10 Minuten alt auszuliefern.
self.addEventListener("fetch", (event) => {
  const anfrage = event.request;
  if (anfrage.method !== "GET" || new URL(anfrage.url).origin !== self.location.origin) return;
  event.respondWith(
    fetch(anfrage.url, { cache: "no-cache", credentials: "same-origin" })
      .then((antwort) => {
        if (antwort.ok) {
          const kopie = antwort.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(anfrage, kopie));
        }
        return antwort;
      })
      .catch(() => caches.match(anfrage, { ignoreSearch: true }))
  );
});
