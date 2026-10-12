// Die drei Schwierigkeitsstufen. Sie gelten für den Endlos- und den Aufgaben-Modus.
//
//   groesse    – Kantenlänge des Spielfelds
//   minLaenge  – wie viele gleiche Steine in einer Reihe sich auflösen
//   drache     – erscheint der Zahlendieb Drache? (nur im Aufgaben-Modus)
//   zielFaktor – optional: Ziele der Aufgaben vergrößern (siehe aufgabeFuerStufe in aufgaben.js)

export const SCHWIERIGKEITEN = {
  fee: {
    id: "fee",
    name: "Die junge Fee",
    kurz: "Leicht",
    beschreibung: "Kleineres Feld. Schon 2 gleiche Steine lösen sich auf.",
    groesse: 6,
    minLaenge: 2,
    drache: false,
    // Mit nur 2 gleichen lösen sich so viele Steine auf, dass die Ziele größer sein müssen,
    // damit eine Aufgabe nicht schon nach 2 Zügen geschafft ist (Faktoren je Ziel-Typ).
    zielFaktor: { sammeln: 2.5, punkte: 2.5, befreien: 1.5, staebe: 1 },
  },
  entdeckerin: {
    id: "entdeckerin",
    name: "Die flinke Entdeckerin",
    kurz: "Normal",
    beschreibung: "Das Spiel, wie du es kennst: 3 gleiche Steine lösen sich auf.",
    groesse: 8,
    minLaenge: 3,
    drache: false,
  },
  piratin: {
    id: "piratin",
    name: "Die mutige Piratin",
    kurz: "Schwer",
    beschreibung: "Wie die Entdeckerin, aber in den Aufgaben treibt der freche Zahlendieb Drache sein Unwesen!",
    groesse: 8,
    minLaenge: 3,
    drache: true,
  },
};

export const REIHENFOLGE = ["fee", "entdeckerin", "piratin"];
export const STANDARD = "entdeckerin";

// Speicherschlüssel je Stufe. Die Entdeckerin nutzt die alten Schlüssel,
// damit Rekord und Fortschritt aus früheren Versionen erhalten bleiben.
export function schluessel(basis, stufe) {
  return stufe === "entdeckerin" ? basis : `${basis}-${stufe}`;
}
