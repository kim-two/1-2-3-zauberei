# 1-2-3-zauberei
Match-3-Puzzle Style game

Ein Match-3-Puzzlespiel für den Browser auf Tablets, bereitgestellt über GitHub Pages.

## Rahmenbedingungen

- **Zielgerät:** iPad (Safari), Hochformat
- **Installierbar & offline:** über „Zum Home-Bildschirm“ in Safari
- **Technik:** reines HTML, CSS und JavaScript, kein Build-Schritt
- **Kosten:** keine (öffentliches Repo + GitHub Pages)

## Spielregeln (Endlos-Modus)

- 8×8 Felder mit sechs Steinen: Kristall, Stern, Blatt, Tropfen, Blume, Einhorn-Horn
- Zwei benachbarte Steine tauschen – per Wischen oder durch Antippen nacheinander
- Drei oder mehr gleiche in einer Reihe lösen sich mit Funkel-Effekt auf
- 10 Punkte pro Stein, Bonus für Vierer (+20) und Fünfer (+50), Kettenreaktionen zählen mehrfach
- **Zauberstab:** Lösen sich mindestens 4 gleiche Steine zusammen auf (Reihe, L- oder T-Form), wird einer davon
  zum Zauberstab – an der Stelle des gezogenen Steins. Wird der Stab Teil eines Treffers, löst er seine ganze
  waagerechte Reihe auf (+50 Bonus, dazu 10 Punkte je zusätzlichem Stein)
- Nach 6 Sekunden ohne Zug zeigt das Spiel einen Tipp; gibt es keinen Zug mehr, wird neu gemischt
- Der Rekord wird auf dem Gerät gespeichert

## Aufbau

| Datei / Ordner          | Zweck                                                        |
|-------------------------|--------------------------------------------------------------|
| `index.html`            | Startseite des Spiels                                        |
| `css/style.css`         | Aussehen und Layout                                          |
| `js/main.js`            | Darstellung, Touch-Steuerung und Effekte (Einstiegspunkt)    |
| `js/board.js`           | Spielregeln: Feld, Treffer, Nachfallen, mögliche Züge        |
| `js/steine.js`          | Die sechs Spielsteine als SVG-Zeichnungen                    |
| `sw.js`                 | Service Worker – speichert das Spiel für den Offline-Betrieb |
| `manifest.webmanifest`  | App-Name, Icon und Darstellung bei Installation              |
| `icons/`                | App-Icons                                                    |
| `.nojekyll`             | GitHub Pages liefert die Dateien unverändert aus             |

## Neue Version veröffentlichen

1. Änderungen auf `main` hochladen – GitHub Pages veröffentlicht automatisch (ca. 1 Minute).
2. Versionsnummer an **zwei** Stellen erhöhen: `VERSION` in `js/main.js` und `CACHE_VERSION` in `sw.js`.
   Sonst behalten installierte Geräte die alte Fassung.
