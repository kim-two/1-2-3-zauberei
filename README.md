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
  zum Zauberstab – an der Stelle des gezogenen Steins. Der Stab löst seine ganze waagerechte Reihe auf
  (+50 Bonus, dazu 10 Punkte je zusätzlichem Stein). Ausgelöst wird er, sobald er neben mindestens einem
  gleichfarbigen Stein liegt (waagerecht oder senkrecht) – nach einem Zug genauso wie bei Kettenreaktionen
- Nach 6 Sekunden ohne Zug zeigt das Spiel einen Tipp; gibt es keinen Zug mehr, wird neu gemischt
- Der Rekord wird auf dem Gerät gespeichert

## Aufgaben-Modus

Im Startmenü wählt man zwischen **Endlos spielen** und **Aufgaben**. Es gibt 10 Aufgaben mit begrenzten Zügen;
eine Aufgabe wird freigeschaltet, wenn die vorherige geschafft ist (Fortschritt wird auf dem Gerät gespeichert).

- **Ziel-Typen:** Steine einer Art sammeln, gefangene Steine befreien, Punkte erreichen, Zauberstäbe erzeugen
- **Gefangene Steine:** Ranken-Gitter (2 Treffer) oder Steinhülle mit Ranken (3 Treffer). Ein Treffer ist ein
  Treffer mit dem Stein selbst oder direkt daneben (waagerecht/senkrecht). Ist der Schutz weg, gilt der Stein als befreit
- Steine, die für ein offenes Ziel zählen, leuchten
- Oben stehen das Ziel mit Fortschritt (z. B. 7/15) und die verbleibenden Züge
- Geschafft: Ein Einhorn gratuliert. Nicht geschafft: Eine Fee macht Mut, es nochmal zu probieren
- Die Aufgaben stehen in `js/aufgaben.js` und lassen sich dort leicht anpassen

| Nr. | Aufgabe | Ziel | Züge |
|----:|---------|------|-----:|
| 1 | Am Zauberfluss | 15 Tropfen sammeln | 20 |
| 2 | Punkte-Zauber | 1.500 Punkte | 15 |
| 3 | Schatz im Wald | 15 Blätter + 15 Sterne | 22 |
| 4 | Zauberstab-Schule | 3 Zauberstäbe | 20 |
| 5 | Blumenwiese | 18 Blumen | 20 |
| 6 | Ranken im Garten | 6 Steine aus Ranken befreien | 15 |
| 7 | Verwunschene Brücke | 10 Steine aus Ranken befreien | 17 |
| 8 | Kristallhöhle | 25 Kristalle | 22 |
| 9 | Steinzauber | 6 Steine aus Steinhüllen befreien | 18 |
| 10 | Große Zauberprobe | 10 Steine befreien + 15 Einhorn-Hörner | 22 |

## Aufbau

| Datei / Ordner          | Zweck                                                        |
|-------------------------|--------------------------------------------------------------|
| `index.html`            | Startseite des Spiels                                        |
| `css/style.css`         | Aussehen und Layout                                          |
| `js/main.js`            | Darstellung, Touch-Steuerung und Effekte (Einstiegspunkt)    |
| `js/board.js`           | Spielregeln: Feld, Treffer, Nachfallen, mögliche Züge        |
| `js/steine.js`          | Spielsteine, Zauberstab, Ranken und Steinhülle als SVG       |
| `js/aufgaben.js`        | Liste der Aufgaben, Ziele und Aufgaben-Spielfeld             |
| `js/figuren.js`         | Einhorn und Fee für die Rückmeldung                          |
| `sw.js`                 | Service Worker – speichert das Spiel für den Offline-Betrieb |
| `manifest.webmanifest`  | App-Name, Icon und Darstellung bei Installation              |
| `icons/`                | App-Icons                                                    |
| `.nojekyll`             | GitHub Pages liefert die Dateien unverändert aus             |

## Neue Version veröffentlichen

1. Änderungen auf `main` hochladen – GitHub Pages veröffentlicht automatisch (ca. 1 Minute).
2. Versionsnummer an **zwei** Stellen erhöhen: `VERSION` in `js/main.js` und `CACHE_VERSION` in `sw.js`.
   Sonst behalten installierte Geräte die alte Fassung.
