// Spezialherausforderungen der mutigen Piratin.
// Erste Herausforderung: der freche Zahlendieb Drache sperrt Reihen und stellt Rechenaufgaben.

const ganzzahl = (min, max, zufall) => min + Math.floor(zufall() * (max - min + 1));

// Aufgabe A: Multiplikation 5×5 bis 20×20 (Ergebnis 25 bis 400)
// Aufgabe B: Subtraktion im Zahlenraum 50 bis 200 (beide Zahlen und das Ergebnis ≥ 0)
export function erzeugeRechenaufgabe(zufall = Math.random) {
  if (zufall() < 0.5) {
    const a = ganzzahl(5, 20, zufall);
    const b = ganzzahl(5, 20, zufall);
    return { art: "mal", text: `${a} × ${b}`, antwort: a * b };
  }
  const a = ganzzahl(51, 200, zufall);
  const b = ganzzahl(50, a - 1, zufall);
  return { art: "minus", text: `${a} − ${b}`, antwort: a - b };
}

// Freitext der Spielerin → Zahl (Leerzeichen erlaubt), sonst null
export function leseAntwort(text) {
  const t = String(text).trim();
  return /^\d{1,4}$/.test(t) ? Number(t) : null;
}

// Nach wie vielen gültigen Zügen der Drache (wieder) auftaucht: erstes Mal 4–8, danach 5–9
export function zuegeBisDrache(erstes, zufall = Math.random) {
  return erstes ? ganzzahl(4, 8, zufall) : ganzzahl(5, 9, zufall);
}
