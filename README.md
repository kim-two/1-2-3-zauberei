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

Im Startmenü wählt man zwischen **Endlos spielen** und **Aufgaben**. Es gibt 15 Aufgaben mit begrenzten Zügen;
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
| 11 | Kokosstrand | 18 Tropfen (4 Kokosnüsse) | 22 |
| 12 | Palmen-Oase | 14 Blumen + 14 Kristalle (5 Kokosnüsse) | 24 |
| 13 | Nussknacker-Magie | 3 Zauberstäbe (5 Kokosnüsse) | 20 |
| 14 | Kokos im Garten | 6 Steine aus Ranken befreien (4 Kokosnüsse) | 19 |
| 15 | Die große Kokosernte | 7 Steine befreien + 12 Sterne (6 Kokosnüsse) | 26 |

| 16 | Die Kristalltruhe | 2 Schatzkisten nach unten bringen | | 14 |
| 17 | Schatz im Garten | 2 Schatzkisten | 4 Ranken | 16 |
| 18 | Kokos-Schatzjagd | 3 Schatzkisten | 4 Kokosnüsse | 20 |
| 19 | Der große Schatz | 3 Schatzkisten + 12 Blumen | 3 Ranken, 3 Kokosnüsse | 26 |

**Schatzkisten** (ab v0.9.0): Die Kisten liegen oben und müssen ganz nach unten gebracht werden (Ziel „Bringe N Schatzkisten nach unten“, `schatzkisten` in `js/aufgaben.js`).
Sie nehmen an keiner Reihe teil, fallen aber, wenn darunter Steine verschwinden. Man kann sie auch mit einem Nachbarn tauschen – das geht ohne Treffer, kostet aber einen Zug.
Unten angekommen (kein freies Feld mehr darunter) wird die Kiste eingesammelt. Zauber- und Feuerstab räumen Kisten nie ab; beim Mischen bleiben sie liegen.
Nach geschaffter Aufgabe zeigt der Erfolgs-Dialog die Kiste: antippen, dann öffnet sie sich – in der Feenwelt voller funkelnder Kristalle, in der Eiswelt voller Muscheln und Perlen.

**Kokosnuss** (ab v0.7.0): Hindernis in den Aufgaben 11–15 (`kokosnuesse` in `js/aufgaben.js`; die Aufgaben 1–10 haben keine).
Sie nimmt an keiner Reihe teil, lässt sich nicht tauschen (wackelt nur), fällt aber nach unten, wenn darunter Steine verschwinden.
Nur ein Zauberstab räumt sie ab, wenn ihre Reihe aufgelöst wird. Die junge Fee hat nur halb so viele Kokosnüsse.

**Sternewertung** (ab v0.10.0): Jede Aufgabe wird mit 1–3 Sternen bewertet, abhängig von den übrigen Zügen (`berechneSterne` in `js/aufgaben.js`): 1 Stern = geschafft (auch mit 0 Zügen übrig), 2 Sterne = mindestens 20 % der Züge übrig, 3 Sterne = mindestens 45 % übrig. Die beste Wertung wird je Welt und Schwierigkeit gespeichert (`zauberei-sterne…`) und in der Aufgabenliste gezeigt; vor jeder Aufgabe stehen die nötigen übrigen Züge. Ältere, vor v0.10.0 geschaffte Aufgaben zeigen nur ein ✓, bis sie erneut gespielt werden.

## Schwierigkeit

Im Startmenü wählt man die Figur; sie gilt für Endlos- und Aufgaben-Modus. Rekord und Aufgaben-Fortschritt werden je Stufe gespeichert.

| Stufe | Feld | Regel |
|-------|------|-------|
| **Die junge Fee** (leicht) | 6×6 | Schon 2 gleiche Steine lösen sich auf. Ziele der Aufgaben sind größer (Faktoren in `js/schwierigkeit.js`), Kettenreaktionen werden gedeckelt |
| **Die flinke Entdeckerin** (normal) | 8×8 | 3 gleiche Steine, wie bisher |
| **Die mutige Piratin** (schwer) | 8×8 | Wie die Entdeckerin, in den Aufgaben treibt der Zahlendieb Drache sein Unwesen |

### Zahlendieb Drache (nur Piratin, nur Aufgaben-Modus)

- Taucht nach 4–8 Zügen auf (danach nach 5–9), nicht in den letzten 2 Zügen, und sperrt eine zufällige Reihe: gesperrte Steine lassen sich weder kombinieren noch verschieben
- Rechenaufgabe: Multiplikation 5×5 bis 20×20 (Ergebnis 25–400) oder Subtraktion im Zahlenraum 50–200; Freitext-Eingabe über einen eigenen Ziffernblock (Tastatur geht auch)
- 3 Versuche. Danach wird eine weitere Reihe gesperrt (höchstens Feldgröße − 3) und es gibt eine neue Aufgabe. Gelöst: alle gesperrten Reihen werden frei
- „Später“ erlaubt, erst weiterzuspielen; oben zeigt eine Leiste die offene Aufgabe (antippen zum Rechnen). Gibt es wegen der Sperren keinen Zug mehr, muss gerechnet werden

## Welten

In der Aufgabenwahl gibt es für jede Welt einen Reiter. Alle Aufgaben stehen von Anfang an in beiden Welten zur Auswahl; innerhalb einer Welt werden sie nacheinander freigeschaltet. Fortschritt wird je Welt und Stufe gespeichert. Der Endlos-Modus spielt in der Feenwelt.

### Eiswelt (ab v0.8.0)

- **Steine:** Pinguin, Eisbär, Robbe, Eiskristall, Weihnachtskeks (Lebkuchenmann), Schneemann
- **Feuerstab** statt Zauberstab: entsteht wie der Zauberstab (4 oder mehr gleiche), löst aber die ganze **Spalte** auf
- **Felsbrocken:** unbeweglich und unzerstörbar (auch der Feuerstab räumt sie nicht ab). Steine fallen an ihnen vorbei
- **Gefrorene Steine:** Ein Treffer mit dem Stein selbst taut das Eis auf (der Stein bleibt liegen), danach ist er normal. Treffer daneben zählen nicht
- **Schneesturm:** In Aufgaben mit `sturm: true` zieht nach 3–5 Zügen (danach alle 4–7) ein Sturm auf und friert 3–5 Steine ein; im letzten Zug nicht mehr

| Nr. | Aufgabe | Ziel | Besonderheit | Züge |
|----:|---------|------|--------------|-----:|
| 1 | Pinguin-Parade | 16 Pinguine | | 20 |
| 2 | Plätzchen-Zauber | 1.500 Punkte | | 15 |
| 3 | Eisbärenhöhle | 13 Eisbären + 13 Robben | | 22 |
| 4 | Feuerstab-Schule | 4 Feuerstäbe | | 20 |
| 5 | Der erste Schneesturm | 18 Eiskristalle | Schneesturm | 22 |
| 6 | Zugefrorener See | 5 gefrorene Steine auftauen | 5 gefroren | 22 |
| 7 | Felsen-Pass | 18 Robben | 6 Felsbrocken | 22 |
| 8 | Eisbrecher | 5 auftauen + 12 Pinguine | Sturm, 5 gefroren | 25 |
| 9 | Lawine! | 3 Feuerstäbe | Sturm, 5 Felsbrocken | 22 |
| 10 | Die große Polarnacht | 4 auftauen + 14 Weihnachtskekse | Sturm, 4 Felsen, 4 gefroren | 28 |

Schatz-Aufgaben der Eiswelt (Muschel- und Perlentruhe):

| Nr. | Aufgabe | Ziel | Besonderheit | Züge |
|----:|---------|------|--------------|-----:|
| 11 | Perlentaucher | 2 Schatzkisten | | 14 |
| 12 | Muschelschatz im Eis | 2 Schatzkisten | 4 Felsbrocken | 16 |
| 13 | Der gefrorene Schatz | 2 Schatzkisten | Sturm, 4 gefroren | 18 |
| 14 | Polarnacht-Schatz | 3 Schatzkisten + 12 Eiskristalle | Sturm, 4 Felsbrocken | 26 |

Neue Welten und Aufgaben: `js/welten.js` (Steine, Texte) und `js/aufgaben.js` (Aufgaben).

## Aufbau

| Datei / Ordner          | Zweck                                                        |
|-------------------------|--------------------------------------------------------------|
| `index.html`            | Startseite des Spiels                                        |
| `css/style.css`         | Aussehen und Layout                                          |
| `js/main.js`            | Darstellung, Touch-Steuerung und Effekte (Einstiegspunkt)    |
| `js/board.js`           | Spielregeln: Feld, Treffer, Nachfallen, mögliche Züge        |
| `js/steine.js`          | Spielsteine, Zauberstab, Ranken und Steinhülle als SVG       |
| `js/aufgaben.js`        | Liste der Aufgaben, Ziele und Aufgaben-Spielfeld             |
| `js/figuren.js`         | Einhorn, Fee, Drache und die Köpfe der Schwierigkeitsstufen  |
| `js/welten.js`          | Welten (Feen-, Eiswelt): Steine, Sonderstab, Texte           |
| `js/schwierigkeit.js`   | Die drei Stufen (Feldgröße, Regel, Ziel-Faktoren)            |
| `js/herausforderungen.js` | Rechenaufgaben und Takt des Drachen                        |
| `sw.js`                 | Service Worker – speichert das Spiel für den Offline-Betrieb |
| `manifest.webmanifest`  | App-Name, Icon und Darstellung bei Installation              |
| `icons/`                | App-Icons                                                    |
| `.nojekyll`             | GitHub Pages liefert die Dateien unverändert aus             |

## Neue Version veröffentlichen

1. Änderungen auf `main` hochladen – GitHub Pages veröffentlicht automatisch (ca. 1 Minute).
2. Versionsnummer an **zwei** Stellen erhöhen: `VERSION` in `js/main.js` und `CACHE_VERSION` in `sw.js`.
   Sonst behalten installierte Geräte die alte Fassung.
