# 1-2-3-zauberei
Match-3-Puzzle Style game

Ein Match-3-Puzzlespiel für den Browser auf Tablets, bereitgestellt über GitHub Pages.

## Rahmenbedingungen

- **Zielgerät:** iPad (Safari), Hochformat
- **Installierbar & offline:** über „Zum Home-Bildschirm“ in Safari
- **Technik:** reines HTML, CSS und JavaScript, kein Build-Schritt
- **Kosten:** keine (öffentliches Repo + GitHub Pages)

## Aufbau

| Datei / Ordner          | Zweck                                                        |
|-------------------------|--------------------------------------------------------------|
| `index.html`            | Startseite des Spiels                                        |
| `css/style.css`         | Aussehen und Layout                                          |
| `js/main.js`            | Spiel-Logik (Einstiegspunkt)                                 |
| `sw.js`                 | Service Worker – speichert das Spiel für den Offline-Betrieb |
| `manifest.webmanifest`  | App-Name, Icon und Darstellung bei Installation              |
| `icons/`                | App-Icons                                                    |
| `.nojekyll`             | GitHub Pages liefert die Dateien unverändert aus             |

## Neue Version veröffentlichen

1. Änderungen auf `main` hochladen – GitHub Pages veröffentlicht automatisch (ca. 1 Minute).
2. Versionsnummer an **zwei** Stellen erhöhen: `VERSION` in `js/main.js` und `CACHE_VERSION` in `sw.js`.
   Sonst behalten installierte Geräte die alte Fassung.
