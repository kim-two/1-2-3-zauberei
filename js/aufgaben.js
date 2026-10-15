// Aufgaben-Modus: Liste der Aufgaben und Hilfsfunktionen.
//
// Ziel-Typen:
//   { typ: "sammeln",  art: <0–5>, anzahl }  – Steine einer Art auflösen
//   { typ: "befreien", anzahl }              – gefangene Steine befreien (Schutz ganz geknackt)
//   { typ: "punkte",   anzahl }              – Punktzahl erreichen
//   { typ: "staebe",   anzahl }              – Zauberstäbe erzeugen
// ranken:  Anzahl Steine im Ranken-Gitter (2 Treffer zum Befreien)
// huellen: Anzahl Steine in Steinhülle mit Ranken (3 Treffer zum Befreien)
// kokosnuesse: Anzahl Kokosnüsse auf dem Feld (nehmen an nichts teil, lassen sich nicht tauschen;
//   nur ein Zauberstab räumt sie ab). Nicht jede Aufgabe hat welche.
// Ein Treffer ist ein Treffer mit dem Stein selbst oder direkt daneben.

import { erzeugeFeld, findeMoeglichenZug } from "./board.js";
import { STEINE } from "./steine.js";

export const AUFGABEN = [
  { titel: "Am Zauberfluss",       zuege: 20, ziele: [{ typ: "sammeln", art: 3, anzahl: 15 }] },
  { titel: "Punkte-Zauber",        zuege: 15, ziele: [{ typ: "punkte", anzahl: 1500 }] },
  { titel: "Schatz im Wald",       zuege: 22, ziele: [{ typ: "sammeln", art: 2, anzahl: 15 }, { typ: "sammeln", art: 1, anzahl: 15 }] },
  { titel: "Zauberstab-Schule",    zuege: 20, ziele: [{ typ: "staebe", anzahl: 3 }] },
  { titel: "Blumenwiese",          zuege: 20, ziele: [{ typ: "sammeln", art: 4, anzahl: 18 }] },
  { titel: "Ranken im Garten",     zuege: 15, ranken: 6, ziele: [{ typ: "befreien", anzahl: 6 }] },
  { titel: "Verwunschene Brücke",  zuege: 17, ranken: 10, ziele: [{ typ: "befreien", anzahl: 10 }] },
  { titel: "Kristallhöhle",        zuege: 22, ziele: [{ typ: "sammeln", art: 0, anzahl: 25 }] },
  { titel: "Steinzauber",          zuege: 18, huellen: 6, ziele: [{ typ: "befreien", anzahl: 6 }] },
  { titel: "Große Zauberprobe",    zuege: 22, ranken: 6, huellen: 4, ziele: [{ typ: "befreien", anzahl: 10 }, { typ: "sammeln", art: 5, anzahl: 15 }] },
  // ab hier mit Kokosnüssen
  { titel: "Kokosstrand",          zuege: 22, kokosnuesse: 4, ziele: [{ typ: "sammeln", art: 3, anzahl: 18 }] },
  { titel: "Palmen-Oase",          zuege: 24, kokosnuesse: 5, ziele: [{ typ: "sammeln", art: 4, anzahl: 14 }, { typ: "sammeln", art: 0, anzahl: 14 }] },
  { titel: "Nussknacker-Magie",    zuege: 20, kokosnuesse: 5, ziele: [{ typ: "staebe", anzahl: 3 }] },
  { titel: "Kokos im Garten",      zuege: 19, ranken: 6, kokosnuesse: 4, ziele: [{ typ: "befreien", anzahl: 6 }] },
  { titel: "Die große Kokosernte", zuege: 26, ranken: 4, huellen: 3, kokosnuesse: 6, ziele: [{ typ: "befreien", anzahl: 7 }, { typ: "sammeln", art: 1, anzahl: 12 }] },
];

// Aufgabe für eine Schwierigkeitsstufe: Ziele und gefangene Steine werden mit dem
// zielFaktor der Stufe vergrößert (Stufen ohne zielFaktor behalten die Aufgabe unverändert).
export function aufgabeFuerStufe(aufgabe, stufe) {
  const faktor = stufe?.zielFaktor;
  if (!faktor) return aufgabe;
  const skaliere = (n, f) => Math.max(1, Math.round(n * f));
  const angepasst = {
    ...aufgabe,
    ranken: aufgabe.ranken ? skaliere(aufgabe.ranken, faktor.befreien ?? 1) : undefined,
    huellen: aufgabe.huellen ? skaliere(aufgabe.huellen, faktor.befreien ?? 1) : undefined,
    kokosnuesse: aufgabe.kokosnuesse ? skaliere(aufgabe.kokosnuesse, faktor.kokos ?? 1) : undefined,
    ziele: aufgabe.ziele.map((ziel) => ({ ...ziel, anzahl: skaliere(ziel.anzahl, faktor[ziel.typ] ?? 1) })),
  };
  // "Befreie N Steine" soll genau zu den gefangenen Steinen passen
  const gefangen = (angepasst.ranken || 0) + (angepasst.huellen || 0);
  for (const ziel of angepasst.ziele) if (ziel.typ === "befreien") ziel.anzahl = gefangen;
  return angepasst;
}

const MEHRZAHL = ["Kristalle", "Sterne", "Blätter", "Tropfen", "Blumen", "Einhorn-Hörner"];

export function zielText(ziel) {
  switch (ziel.typ) {
    case "sammeln":  return `Sammle ${ziel.anzahl} ${MEHRZAHL[ziel.art]}`;
    case "befreien": return `Befreie ${ziel.anzahl} gefangene Steine`;
    case "punkte":   return `Erreiche ${ziel.anzahl.toLocaleString("de-DE")} Punkte`;
    case "staebe":   return `Zaubere ${ziel.anzahl} Zauberstäbe`;
    default:         return "";
  }
}

// Fortschritt eines Ziels aus den gesammelten Werten
export function zielStand(ziel, stand) {
  switch (ziel.typ) {
    case "sammeln":  return stand.gesammelt[ziel.art];
    case "befreien": return stand.befreit;
    case "punkte":   return stand.punkte;
    case "staebe":   return stand.staebe;
    default:         return 0;
  }
}

export function istGeschafft(aufgabe, stand) {
  return aufgabe.ziele.every((z) => zielStand(z, stand) >= z.anzahl);
}

export function leererStand() {
  return { gesammelt: new Array(STEINE.length).fill(0), befreit: 0, staebe: 0, punkte: 0 };
}

export function addiereStand(stand, statistik, punkte = 0) {
  statistik.gesammelt.forEach((n, i) => (stand.gesammelt[i] += n));
  stand.befreit += statistik.befreit;
  stand.staebe += statistik.staebe;
  stand.punkte += punkte;
}

// Spielfeld für eine Aufgabe: normales Feld, dazu gefangene Steine
// (nicht in der obersten Reihe, gleichmäßig verteilt).
export function erzeugeAufgabenFeld(aufgabe, groesse, arten, zufall = Math.random) {
  for (let versuch = 0; ; versuch++) {
    const feld = baueAufgabenFeld(aufgabe, groesse, arten, zufall);
    if (versuch >= 50 || findeMoeglichenZug(feld)) return feld;   // am Anfang muss ein Zug möglich sein
  }
}

function baueAufgabenFeld(aufgabe, groesse, arten, zufall) {
  const feld = erzeugeFeld(groesse, arten, zufall);
  const zellen = [];
  for (let z = 1; z < groesse; z++) for (let s = 0; s < groesse; s++) zellen.push([z, s]);
  for (let i = zellen.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [zellen[i], zellen[j]] = [zellen[j], zellen[i]];
  }
  const huellen = aufgabe.huellen || 0;
  const ranken = aufgabe.ranken || 0;
  zellen.slice(0, huellen + ranken).forEach(([z, s], i) => {
    feld[z][s].gefangen = true;
    feld[z][s].schutz = i < huellen ? 3 : 2;
  });
  // Kokosnüsse auf anderen Feldern (nicht in der obersten Reihe)
  zellen.slice(huellen + ranken, huellen + ranken + (aufgabe.kokosnuesse || 0))
    .forEach(([z, s]) => { feld[z][s].kokos = true; });
  return feld;
}
