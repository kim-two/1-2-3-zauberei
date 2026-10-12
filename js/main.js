// Einstiegspunkt des Spiels.
// Die Versionsnummer muss mit CACHE_VERSION in sw.js übereinstimmen.
const VERSION = "0.1.0";

document.getElementById("version").textContent = VERSION;

// Offline-Unterstützung: Service Worker registrieren.
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((fehler) => {
      console.warn("Offline-Modus nicht verfügbar:", fehler);
    });
  });
}
