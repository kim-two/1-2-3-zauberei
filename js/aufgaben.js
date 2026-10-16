// Aufgaben-Modus: Liste der Aufgaben und Hilfsfunktionen.
//
// Ziel-Typen:
//   { typ: "sammeln",  art: <0–5>, anzahl }  – Steine einer Art auflösen
//   { typ: "befreien", anzahl }              – gefangene Steine befreien (Schutz ganz geknackt)
//   { typ: "punkte",   anzahl }              – Punktzahl erreichen
//   { typ: "staebe",   anzahl }              – Zauberstäbe erzeugen
//   { typ: "schatz",   anzahl }              – Schatzkisten nach unten bringen (schatzkisten: gleiche Zahl)
// ranken:  Anzahl Steine im Ranken-Gitter (2 Treffer zum Befreien)
// huellen: Anzahl Steine in Steinhülle mit Ranken (3 Treffer zum Befreien)
// kokosnuesse: Anzahl Kokosnüsse auf dem Feld (nehmen an nichts teil, lassen sich nicht tauschen;
//   nur ein Zauberstab räumt sie ab). Nicht jede Aufgabe hat welche.
// eissteine: Anzahl von Anfang an gefrorener Steine (Eiswelt): ein Treffer mit dem Stein selbst taut das Eis auf
// schatzkisten: Anzahl Schatzkisten, die von oben ganz nach unten gebracht werden müssen (Ziel typ "schatz")
// felsen:   Anzahl Felsbrocken (Eiswelt): unbeweglich und unzerstörbar, Steine fallen daran vorbei
// sturm:    true = in dieser Aufgabe zieht von Zeit zu Zeit ein Schneesturm auf und friert 3–5 Steine ein
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

// ---------- Eiswelt ----------
// Steine: 0 Pinguin, 1 Eisbär, 2 Robbe, 3 Eiskristall, 4 Weihnachtskeks, 5 Schneemann.
// Statt des Zauberstabs gibt es den Feuerstab (löst die ganze Spalte auf).
// Aufgaben mit Schatzkisten (Feenwelt: Kristalltruhe, Eiswelt: Muschel- und Perlentruhe)
export const FEEN_SCHATZ_AUFGABEN = [
  { titel: "Die Kristalltruhe",    zuege: 28, schatzkisten: 2, ziele: [{ typ: "schatz", anzahl: 2 }] },
  { titel: "Schatz im Garten",     zuege: 30, schatzkisten: 2, ranken: 4, ziele: [{ typ: "schatz", anzahl: 2 }] },
  { titel: "Kokos-Schatzjagd",     zuege: 34, schatzkisten: 2, kokosnuesse: 4, ziele: [{ typ: "schatz", anzahl: 2 }] },
  { titel: "Der große Schatz",     zuege: 44, schatzkisten: 3, ranken: 3, kokosnuesse: 3, ziele: [{ typ: "schatz", anzahl: 3 }, { typ: "sammeln", art: 4, anzahl: 12 }] },
];

export const EIS_SCHATZ_AUFGABEN = [
  { titel: "Perlentaucher",         zuege: 26, schatzkisten: 2, ziele: [{ typ: "schatz", anzahl: 2 }] },
  { titel: "Muschelschatz im Eis",  zuege: 30, schatzkisten: 2, felsen: 4, ziele: [{ typ: "schatz", anzahl: 2 }] },
  { titel: "Der gefrorene Schatz",  zuege: 30, schatzkisten: 2, eissteine: 4, sturm: true, ziele: [{ typ: "schatz", anzahl: 2 }] },
  { titel: "Polarnacht-Schatz",     zuege: 44, schatzkisten: 3, felsen: 4, sturm: true, ziele: [{ typ: "schatz", anzahl: 3 }, { typ: "sammeln", art: 3, anzahl: 12 }] },
];

export const EIS_AUFGABEN = [
  { titel: "Pinguin-Parade",       zuege: 20, ziele: [{ typ: "sammeln", art: 0, anzahl: 16 }] },
  { titel: "Plätzchen-Zauber",     zuege: 15, ziele: [{ typ: "punkte", anzahl: 1500 }] },
  { titel: "Eisbärenhöhle",        zuege: 22, ziele: [{ typ: "sammeln", art: 1, anzahl: 13 }, { typ: "sammeln", art: 2, anzahl: 13 }] },
  { titel: "Feuerstab-Schule",     zuege: 20, ziele: [{ typ: "staebe", anzahl: 4 }] },
  { titel: "Der erste Schneesturm", zuege: 22, sturm: true, ziele: [{ typ: "sammeln", art: 3, anzahl: 18 }] },
  { titel: "Zugefrorener See",     zuege: 22, eissteine: 5, ziele: [{ typ: "befreien", anzahl: 5 }] },
  { titel: "Felsen-Pass",          zuege: 22, felsen: 6, ziele: [{ typ: "sammeln", art: 2, anzahl: 18 }] },
  { titel: "Eisbrecher",           zuege: 25, sturm: true, eissteine: 5, ziele: [{ typ: "befreien", anzahl: 5 }, { typ: "sammeln", art: 0, anzahl: 12 }] },
  { titel: "Lawine!",              zuege: 22, felsen: 5, sturm: true, ziele: [{ typ: "staebe", anzahl: 3 }] },
  { titel: "Die große Polarnacht", zuege: 28, felsen: 4, eissteine: 4, sturm: true, ziele: [{ typ: "befreien", anzahl: 4 }, { typ: "sammeln", art: 4, anzahl: 14 }] },
];

AUFGABEN.push(...FEEN_SCHATZ_AUFGABEN);
EIS_AUFGABEN.push(...EIS_SCHATZ_AUFGABEN);

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
    eissteine: aufgabe.eissteine ? skaliere(aufgabe.eissteine, faktor.befreien ?? 1) : undefined,
    felsen: aufgabe.felsen ? skaliere(aufgabe.felsen, faktor.kokos ?? 1) : undefined,
    ziele: aufgabe.ziele.map((ziel) => ({ ...ziel, anzahl: skaliere(ziel.anzahl, faktor[ziel.typ] ?? 1) })),
  };
  // "Befreie N Steine" soll genau zu den gefangenen Steinen passen
  const gefangen = (angepasst.ranken || 0) + (angepasst.huellen || 0) + (angepasst.eissteine || 0);
  for (const ziel of angepasst.ziele) if (ziel.typ === "befreien") ziel.anzahl = gefangen;
  return angepasst;
}

const MEHRZAHL = ["Kristalle", "Sterne", "Blätter", "Tropfen", "Blumen", "Einhorn-Hörner"];

// welt: Texte der Welt (siehe welten.js); ohne Angabe die Feenwelt
export function zielText(ziel, welt = {}) {
  const mehrzahl = welt.mehrzahl || MEHRZAHL;
  switch (ziel.typ) {
    case "sammeln":  return `Sammle ${ziel.anzahl} ${mehrzahl[ziel.art]}`;
    case "befreien": return (welt.befreienText || ((n) => `Befreie ${n} gefangene Steine`))(ziel.anzahl);
    case "punkte":   return `Erreiche ${ziel.anzahl.toLocaleString("de-DE")} Punkte`;
    case "staebe":   return (welt.stabText || ((n) => `Zaubere ${n} Zauberstäbe`))(ziel.anzahl);
    case "schatz":   return `Bringe ${ziel.anzahl} ${ziel.anzahl === 1 ? "Schatzkiste" : "Schatzkisten"} nach unten`;
    default:         return "";
  }
}

// Sternewertung: Je mehr Züge übrig bleiben, desto mehr Sterne.
// 1 Stern: geschafft (auch mit genau der erlaubten Zügezahl), 2 Sterne: mindestens 20 % der Züge übrig,
// 3 Sterne: mindestens 45 % übrig.
export function sterneGrenzen(zuege) {
  return { zwei: Math.max(1, Math.ceil(zuege * 0.2)), drei: Math.max(2, Math.ceil(zuege * 0.45)) };
}

export function berechneSterne(zuege, uebrig) {
  const g = sterneGrenzen(zuege);
  return uebrig >= g.drei ? 3 : uebrig >= g.zwei ? 2 : 1;
}

// Fortschritt eines Ziels aus den gesammelten Werten
export function zielStand(ziel, stand) {
  switch (ziel.typ) {
    case "sammeln":  return stand.gesammelt[ziel.art];
    case "befreien": return stand.befreit;
    case "punkte":   return stand.punkte;
    case "staebe":   return stand.staebe;
    case "schatz":   return stand.schaetze;
    default:         return 0;
  }
}

export function istGeschafft(aufgabe, stand) {
  return aufgabe.ziele.every((z) => zielStand(z, stand) >= z.anzahl);
}

export function leererStand() {
  return { gesammelt: new Array(STEINE.length).fill(0), befreit: 0, staebe: 0, punkte: 0, schaetze: 0 };
}

export function addiereStand(stand, statistik, punkte = 0) {
  statistik.gesammelt.forEach((n, i) => (stand.gesammelt[i] += n));
  stand.befreit += statistik.befreit;
  stand.staebe += statistik.staebe;
  stand.schaetze += statistik.schaetze || 0;
  stand.punkte += punkte;
}

// Spielfeld für eine Aufgabe: normales Feld, dazu gefangene Steine
// (nicht in der obersten Reihe, gleichmäßig verteilt).
const SCHATZ_ZEILE = 2;   // Startreihe der Schatzkisten (0 = ganz oben)

export function erzeugeAufgabenFeld(aufgabe, groesse, arten, zufall = Math.random) {
  for (let versuch = 0; ; versuch++) {
    const feld = baueAufgabenFeld(aufgabe, groesse, arten, zufall);
    if (versuch >= 50 || findeMoeglichenZug(feld)) return feld;   // am Anfang muss ein Zug möglich sein
  }
}

function baueAufgabenFeld(aufgabe, groesse, arten, zufall) {
  const feld = erzeugeFeld(groesse, arten, zufall);
  // Schatzkisten: im oberen Bereich (Reihe 3), in verschiedenen Spalten
  const spalten = Array.from({ length: groesse }, (_, s) => s);
  for (let i = spalten.length - 1; i > 0; i--) {
    const j = Math.floor(zufall() * (i + 1));
    [spalten[i], spalten[j]] = [spalten[j], spalten[i]];
  }
  const kisten = spalten.slice(0, aufgabe.schatzkisten || 0);
  kisten.forEach((s) => { feld[SCHATZ_ZEILE][s].schatz = true; });
  // Alle anderen Hindernisse liegen auf freien Feldern (nicht in der obersten Reihe, nicht auf einer Kiste)
  const zellen = [];
  for (let z = 1; z < groesse; z++) for (let s = 0; s < groesse; s++) {
    if (!(z === SCHATZ_ZEILE && kisten.includes(s))) zellen.push([z, s]);
  }
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
  let nr = huellen + ranken;
  zellen.slice(nr, nr += (aufgabe.eissteine || 0)).forEach(([z, s]) => {
    Object.assign(feld[z][s], { gefangen: true, schutz: 1, eis: true });
  });
  zellen.slice(nr, nr += (aufgabe.kokosnuesse || 0)).forEach(([z, s]) => { feld[z][s].kokos = true; });
  zellen.slice(nr, nr += (aufgabe.felsen || 0)).forEach(([z, s]) => { feld[z][s].fels = true; });
  return feld;
}
