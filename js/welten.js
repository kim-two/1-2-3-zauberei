// Die Welten des Spiels: Steine, Sonderstab und Texte.
// Die Aufgaben jeder Welt stehen in aufgaben.js.

import { STEINE, EIS_STEINE } from "./steine.js";
import { AUFGABEN, EIS_AUFGABEN } from "./aufgaben.js";

export const WELTEN = {
  feen: {
    id: "feen",
    name: "Feenwelt",
    steine: STEINE,
    symbol: "stein-",
    aufgaben: AUFGABEN,
    stab: { symbol: "zauberstab", name: "Zauberstab", richtung: "zeile", lob: "Zauberei!" },
    mehrzahl: ["Kristalle", "Sterne", "Blätter", "Tropfen", "Blumen", "Einhorn-Hörner"],
    befreienText: (n) => `Befreie ${n} gefangene Steine`,
    stabText: (n) => `Zaubere ${n} Zauberstäbe`,
  },
  eis: {
    id: "eis",
    name: "Eiswelt",
    steine: EIS_STEINE,
    symbol: "eis-",
    aufgaben: EIS_AUFGABEN,
    stab: { symbol: "feuerstab", name: "Feuerstab", richtung: "spalte", lob: "Feuer!" },
    mehrzahl: ["Pinguine", "Eisbären", "Robben", "Eiskristalle", "Weihnachtskekse", "Schneemänner"],
    befreienText: (n) => `Taue ${n} gefrorene Steine auf`,
    stabText: (n) => `Entzünde ${n} Feuerstäbe`,
  },
};

export const WELT_REIHENFOLGE = ["feen", "eis"];
