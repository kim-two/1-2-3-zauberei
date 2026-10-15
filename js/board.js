// Spiellogik ohne Grafik: Spielfeld, Treffer finden, Nachfallen, mögliche Züge.
// Das Feld ist ein 2D-Array feld[zeile][spalte] mit Steinen { id, art }.
// Besondere Eigenschaften eines Steins:
//   spezial: "stab"  – Zauberstab
//   schutz, gefangen – Ranken/Steinhülle (Aufgaben-Modus)
//   kokos            – Kokosnuss: nimmt an nichts teil, lässt sich nicht tauschen, fällt aber nach unten;
//                      nur ein Zauberstab-Strahl räumt sie ab
//   fels             – Felsbrocken (Eiswelt): unbeweglich und unzerstörbar; Steine fallen „durch“ ihn hindurch
//   eis              – gefroren (Schutz 1): muss einmal aufgelöst werden, dann taut das Eis (Steine bleibt liegen)
//   gesperrt         – vom Drachen gesperrt: nimmt an nichts teil und bleibt, wo er ist

let naechsteId = 1;

// Schwierigkeit: Wie viele gleiche Steine in einer Reihe lösen sich auf? (3 normal, 2 einfach)
let minLaenge = 3;

// Bei nur 2 gleichen würde fast jede Neufüllung sofort neue Paare bilden und endlose
// Kettenreaktionen auslösen. Deshalb vermeiden neu gefüllte Steine dann Paare mit ihren Nachbarn.
let vermeideZufallsPaare = false;

// Größter Faktor, mit dem Kettenreaktionen die Punkte vervielfachen (unbegrenzt = Infinity).
let maxKettenFaktor = Infinity;

export function setzeMinLaenge(n) {
  minLaenge = n;
  vermeideZufallsPaare = n < 3;
  maxKettenFaktor = n < 3 ? 3 : Infinity;
}

export function holeMinLaenge() {
  return minLaenge;
}

export function neuerStein(arten, zufall = Math.random) {
  return { id: naechsteId++, art: Math.floor(zufall() * arten) };
}

// Läßt sich ein Stein per Tausch verschieben? (nicht: gesperrt, Kokosnuss)
export const bewegbar = (stein) => !stein.gesperrt && !stein.kokos && !stein.fels;

// Feste Zellen: der Stein bleibt dort für immer (oder bis zur Freigabe) – Steine fallen „durch“ sie hindurch
const fest = (stein) => Boolean(stein) && (stein.gesperrt || stein.fels);

// Richtung des Sonderstabs: Zauberstab (Feenwelt) räumt die Reihe, Feuerstab (Eiswelt) die Spalte
let stabSpalte = false;
export function setzeStabRichtung(richtung) { stabSpalte = richtung === "spalte"; }

// Schneesturm: friert anzahl zufällige Steine ein (Schutz 1, nur ein Treffer mit dem Stein selbst taut ihn auf)
export function friereSteine(feld, anzahl, zufall = Math.random) {
  const kandidaten = [];
  feld.forEach((reihe, z) => reihe.forEach((stein, s) => {
    if (aktiv(stein) && !(stein.schutz > 0)) kandidaten.push([z, s]);
  }));
  const gewaehlt = [];
  while (gewaehlt.length < anzahl && kandidaten.length) {
    const [zelle] = kandidaten.splice(Math.floor(zufall() * kandidaten.length), 1);
    const stein = feld[zelle[0]][zelle[1]];
    stein.schutz = 1;
    stein.eis = true;
    gewaehlt.push(zelle);
  }
  return gewaehlt;
}

// Stein, der mitspielen darf (vorhanden und nicht gesperrt)
const aktiv = (stein) => Boolean(stein) && !stein.gesperrt && !stein.kokos && !stein.fels;

// Länge der Reihe gleicher Steine, die direkt links/oberhalb von (z, s) endet (ohne (z, s) selbst).
function laufLinks(feld, z, s, art) {
  let k = 0;
  while (s - 1 - k >= 0 && aktiv(feld[z][s - 1 - k]) && feld[z][s - 1 - k].art === art) k++;
  return k;
}
function laufOben(feld, z, s, art) {
  let k = 0;
  while (z - 1 - k >= 0 && aktiv(feld[z - 1 - k][s]) && feld[z - 1 - k][s].art === art) k++;
  return k;
}

// Neues Feld ohne fertige Treffer, aber mit mindestens einem möglichen Zug.
export function erzeugeFeld(groesse, arten, zufall = Math.random) {
  for (;;) {
    const feld = [];
    for (let z = 0; z < groesse; z++) {
      feld.push([]);
      for (let s = 0; s < groesse; s++) {
        let stein;
        do {
          stein = neuerStein(arten, zufall);
        } while (
          laufLinks(feld, z, s, stein.art) + 1 >= minLaenge ||
          laufOben(feld, z, s, stein.art) + 1 >= minLaenge
        );
        feld[z].push(stein);
      }
    }
    if (findeMoeglichenZug(feld)) return feld;
  }
}

// Liefert alle Treffer-Gruppen (waagerecht/senkrecht, mindestens minLaenge gleiche).
// Gesperrte Steine unterbrechen jede Reihe.
export function findeTreffer(feld) {
  const n = feld.length;
  const gruppen = [];
  const lauf = (zelleBei) => {
    let start = 0;
    for (let i = 1; i <= n; i++) {
      const a = zelleBei(start);
      const b = i < n ? zelleBei(i) : null;
      if (aktiv(a) && aktiv(b) && a.art === b.art) continue;
      if (aktiv(a) && i - start >= minLaenge) {
        const zellen = [];
        for (let k = start; k < i; k++) zellen.push(k);
        gruppen.push({ index: zellen, art: a.art });
      }
      start = i;
    }
  };
  for (let z = 0; z < n; z++) {
    const vorher = gruppen.length;
    lauf((k) => feld[z][k]);
    for (let g = vorher; g < gruppen.length; g++) {
      gruppen[g] = { zellen: gruppen[g].index.map((k) => [z, k]), art: gruppen[g].art };
    }
  }
  for (let s = 0; s < n; s++) {
    const vorher = gruppen.length;
    lauf((k) => feld[k][s]);
    for (let g = vorher; g < gruppen.length; g++) {
      gruppen[g] = { zellen: gruppen[g].index.map((k) => [k, s]), art: gruppen[g].art };
    }
  }
  return gruppen;
}

// Fasst Treffer-Gruppen gleicher Art, die sich überschneiden (L- und T-Formen), zusammen.
export function bildeCluster(gruppen) {
  const cluster = [];
  for (const g of gruppen) {
    const schluessel = new Set(g.zellen.map((z) => z.join(",")));
    const passende = cluster.filter(
      (c) => c.art === g.art && [...schluessel].some((k) => c.zellen.has(k))
    );
    const neu = { art: g.art, zellen: schluessel };
    for (const c of passende) {
      c.zellen.forEach((k) => neu.zellen.add(k));
      cluster.splice(cluster.indexOf(c), 1);
    }
    cluster.push(neu);
  }
  return cluster.map((c) => ({
    art: c.art,
    zellen: [...c.zellen].map((k) => k.split(",").map(Number)),
  }));
}

// Berechnet, was bei den aktuellen Treffern passiert:
// - welche Zellen verschwinden (inkl. ganzer Reihen durch ausgelöste Zauberstäbe)
// - welche geschützten Steine (Ranken/Steinhülle) nur eine Schutzschicht verlieren
// - wo neue Zauberstäbe entstehen (bei Clustern ab 4 Steinen)
// bevorzugt: Zellen, an denen ein neuer Stab bevorzugt entstehen soll (die getauschten Steine).
export function berechneAufloesung(feld, gruppen, bevorzugt = []) {
  const key = ([z, s]) => `${z},${s}`;
  const entfernen = new Map();
  for (const g of gruppen) for (const z of g.zellen) entfernen.set(key(z), z);

  // Zauberstäbe auslösen – auch Stäbe, die von einem anderen Stab getroffen werden
  const ausgeloest = [];
  const warteschlange = [...entfernen.values()];
  const schonAusgeloest = new Set();
  while (warteschlange.length) {
    const [z, s] = warteschlange.shift();
    const stein = feld[z][s];
    if (stein?.spezial !== "stab" || schonAusgeloest.has(key([z, s]))) continue;
    schonAusgeloest.add(key([z, s]));
    ausgeloest.push([z, s]);
    for (let k = 0; k < (stabSpalte ? feld.length : feld[z].length); k++) {
      const [z2, s2] = stabSpalte ? [k, s] : [z, k];      // Feuerstab: Spalte, Zauberstab: Reihe
      if (fest(feld[z2][s2])) continue;
      if (!entfernen.has(key([z2, s2]))) {
        entfernen.set(key([z2, s2]), [z2, s2]);
        warteschlange.push([z2, s2]);
      }
    }
  }

  // Treffer direkt neben geschützten Steinen knacken ebenfalls eine Schicht
  const nebenan = new Map();
  for (const [z, s] of entfernen.values()) {
    for (const [dz, ds] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nachbar = feld[z + dz]?.[s + ds];
      const k = key([z + dz, s + ds]);
      if (nachbar?.schutz > 0 && !nachbar.eis && !fest(nachbar) && !entfernen.has(k)) nebenan.set(k, [z + dz, s + ds]);
    }
  }

  // Neue Zauberstäbe
  const neueStaebe = [];
  for (const c of bildeCluster(gruppen)) {
    if (c.zellen.length < 4) continue;
    // Ein Stab entsteht nur auf einem ungeschützten Stein
    const frei = c.zellen.filter(([z, s]) => !(feld[z][s].schutz > 0));
    if (!frei.length) continue;
    const istFrei = (zelle) => frei.some((x) => x[0] === zelle[0] && x[1] === zelle[1]);
    const sortiert = [...frei].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const ziel = bevorzugt.find(istFrei) || sortiert[Math.floor(sortiert.length / 2)];
    neueStaebe.push({ zelle: ziel, art: c.art });
    entfernen.delete(key(ziel));
  }

  // Geschützte Steine verlieren nur eine Schicht und bleiben liegen
  const geschwaecht = [...nebenan.values()];
  for (const [k, [z, s]] of entfernen) {
    if (feld[z][s].schutz > 0) {
      geschwaecht.push([z, s]);
      entfernen.delete(k);
    }
  }

  return { entfernen: [...entfernen.values()], geschwaecht, neueStaebe, ausgeloest };
}

// Punkte eines Auflöse-Schritts. kette: 1 beim Zug, 2+ bei Kettenreaktionen.
export const PUNKTE_PRO_STEIN = 10;
export const BONUS = { 4: 20, 5: 50 };
export const STAB_BONUS = 50;

export function berechnePunkte(gruppen, aufloesung, kette) {
  kette = Math.min(kette, maxKettenFaktor);
  const inGruppe = new Set();
  const proGruppe = gruppen.map((g) => {
    g.zellen.forEach((z) => inGruppe.add(z.join(",")));
    const n = g.zellen.length;
    return (n * PUNKTE_PRO_STEIN + (BONUS[Math.min(n, 5)] || 0)) * kette;
  });
  const betroffen = [...aufloesung.entfernen, ...aufloesung.geschwaecht];
  const proReihe = [];
  const gezaehlt = new Set();
  for (const [z, s] of aufloesung.ausgeloest) {
    const linie = stabSpalte ? s : z;
    if (gezaehlt.has(linie)) continue;        // zwei Stäbe in einer Reihe/Spalte: nur einmal zählen
    gezaehlt.add(linie);
    const extra = betroffen.filter(([zz, ss]) => (stabSpalte ? ss : zz) === linie && !inGruppe.has(`${zz},${ss}`)).length;
    proReihe.push({ [stabSpalte ? "spalte" : "zeile"]: linie, punkte: (extra * PUNKTE_PRO_STEIN + STAB_BONUS) * kette });
  }
  const gesamt = proGruppe.reduce((a, b) => a + b, 0) + proReihe.reduce((a, r) => a + r.punkte, 0);
  return { gesamt, proGruppe, proReihe };
}

// Wendet einen berechneten Schritt auf das Feld an und liefert eine Statistik für die Aufgaben:
// gesammelt[art] = aufgelöste Steine je Art (ein Stein, der zum Zauberstab wird, zählt mit),
// befreit = gefangene Steine, deren letzte Schutzschicht gerade geknackt wurde,
// geknackt = getroffene Schutzschichten, staebe = neu entstandene Zauberstäbe.
export function wendeAufloesungAn(feld, aufloesung, arten, zufall = Math.random) {
  const statistik = { gesammelt: new Array(arten).fill(0), befreit: 0, staebe: 0, geknackt: 0 };
  for (const [z, s] of aufloesung.geschwaecht) {
    const stein = feld[z][s];
    stein.schutz--;
    statistik.geknackt++;
    if (stein.schutz === 0) stein.eis = false;      // Eis ist geschmolzen
    if (stein.schutz === 0 && stein.gefangen) {
      stein.gefangen = false;
      statistik.befreit++;
    }
  }
  for (const [z, s] of aufloesung.entfernen) if (!feld[z][s].kokos) statistik.gesammelt[feld[z][s].art]++;
  for (const { zelle: [z, s], art } of aufloesung.neueStaebe) {
    feld[z][s].art = art;
    feld[z][s].spezial = "stab";
    statistik.gesammelt[art]++;
    statistik.staebe++;
  }
  entferneUndFuelle(feld, aufloesung.entfernen, arten, zufall);
  return statistik;
}

// Spielt alle Auflöse-Schritte eines Zugs ohne Grafik durch (für Tests und Simulation).
export function spieleAufloesungDurch(feld, bevorzugt, arten, zufall = Math.random) {
  const summe = { gesammelt: new Array(arten).fill(0), befreit: 0, staebe: 0, geknackt: 0, punkte: 0 };
  for (let kette = 1; ; kette++) {
    const gruppen = findeAlleTreffer(feld);
    if (!gruppen.length) break;
    const aufloesung = berechneAufloesung(feld, gruppen, kette === 1 ? bevorzugt : []);
    summe.punkte += berechnePunkte(gruppen, aufloesung, kette).gesamt;
    const st = wendeAufloesungAn(feld, aufloesung, arten, zufall);
    st.gesammelt.forEach((n, i) => (summe.gesammelt[i] += n));
    summe.befreit += st.befreit;
    summe.staebe += st.staebe;
    summe.geknackt += st.geknackt;
  }
  return summe;
}

export function sindNachbarn([z1, s1], [z2, s2]) {
  return Math.abs(z1 - z2) + Math.abs(s1 - s2) === 1;
}

export function tausche(feld, [z1, s1], [z2, s2]) {
  const tmp = feld[z1][s1];
  feld[z1][s1] = feld[z2][s2];
  feld[z2][s2] = tmp;
}

// Zauberstab-Paare: Ein gleichfarbiger Nachbar (waagerecht oder senkrecht) reicht,
// um einen Zauberstab auszulösen. Geprüft werden die übergebenen Zellen.
export function findeStabPaare(feld, zellen) {
  const paare = [];
  const gesehen = new Set();
  for (const [z, s] of zellen) {
    const stein = feld[z]?.[s];
    if (!aktiv(stein)) continue;
    for (const [dz, ds] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nachbar = feld[z + dz]?.[s + ds];
      if (!aktiv(nachbar) || nachbar.art !== stein.art) continue;
      if (stein.spezial !== "stab" && nachbar.spezial !== "stab") continue;
      const zellenPaar = [[z, s], [z + dz, s + ds]];
      const schluessel = zellenPaar.map((x) => x.join(",")).sort().join("|");
      if (gesehen.has(schluessel)) continue;
      gesehen.add(schluessel);
      paare.push({ zellen: zellenPaar, art: stein.art });
    }
  }
  return paare;
}

// Alle Treffer: normale Reihen plus jeder Zauberstab, der neben einem gleichfarbigen Stein liegt.
// Gilt nach einem Zug genauso wie bei Kettenreaktionen. Ein Stab-Paar, das schon Teil einer
// normalen Reihe ist, wird nicht doppelt gezählt.
export function findeAlleTreffer(feld) {
  const staebe = [];
  feld.forEach((zeile, z) => zeile.forEach((stein, s) => {
    if (stein?.spezial === "stab") staebe.push([z, s]);
  }));
  const gruppen = findeTreffer(feld);
  const schluessel = (zelle) => zelle.join(",");
  const paare = findeStabPaare(feld, staebe).filter((paar) => !gruppen.some((g) => {
    const ks = new Set(g.zellen.map(schluessel));
    return paar.zellen.every((zelle) => ks.has(schluessel(zelle)));
  }));
  return [...gruppen, ...paare];
}

// Sucht einen Tausch, der zu einem Treffer führt. Liefert [a, b] oder null.
// Gesperrte Steine lassen sich nicht tauschen.
export function findeMoeglichenZug(feld) {
  const n = feld.length;
  for (let z = 0; z < n; z++) {
    for (let s = 0; s < n; s++) {
      for (const [dz, ds] of [[0, 1], [1, 0]]) {
        const z2 = z + dz, s2 = s + ds;
        if (z2 >= n || s2 >= n) continue;
        if (!bewegbar(feld[z][s]) || !bewegbar(feld[z2][s2])) continue;
        tausche(feld, [z, s], [z2, s2]);
        const treffer = findeAlleTreffer(feld).length > 0;
        tausche(feld, [z, s], [z2, s2]);
        if (treffer) return [[z, s], [z2, s2]];
      }
    }
  }
  return null;
}

// Entfernt Steine, lässt die übrigen nach unten fallen und füllt oben auf.
// Neue Steine bekommen startZeile (< 0), damit sie von oben hereinfallen können.
// Gesperrte Steine bleiben an ihrem Platz; die übrigen Steine einer Spalte fließen durch die
// freien Zellen darunter, als gäbe es die gesperrten Zellen nicht.
export function entferneUndFuelle(feld, zellen, arten, zufall = Math.random) {
  const n = feld.length;
  for (const [z, s] of zellen) feld[z][s] = null;
  for (let s = 0; s < n; s++) {
    const frei = [];                    // freie Zeilen, von unten nach oben
    const bleibende = [];               // Steine, die nachrutschen, von unten nach oben
    for (let z = n - 1; z >= 0; z--) {
      if (fest(feld[z][s])) continue;
      frei.push(z);
      if (feld[z][s]) bleibende.push(feld[z][s]);
    }
    const fehlend = frei.length - bleibende.length;
    frei.forEach((z, i) => {
      if (i < bleibende.length) {
        feld[z][s] = bleibende[i];
      } else {
        const stein = { id: naechsteId++, art: -1, startZeile: z - fehlend };
        feld[z][s] = stein;
      }
    });
  }
  // Arten der neuen Steine würfeln (zeilenweise, damit sich neue Steine untereinander abstimmen)
  for (let z = 0; z < n; z++) {
    for (let s = 0; s < n; s++) {
      const stein = feld[z][s];
      if (stein.art !== -1) continue;
      const verboten = new Set();
      if (vermeideZufallsPaare) {
        for (const [dz, ds] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const nb = feld[z + dz]?.[s + ds];
          if (aktiv(nb) && nb.art >= 0) verboten.add(nb.art);
        }
      }
      const erlaubt = [];
      for (let a = 0; a < arten; a++) if (!verboten.has(a)) erlaubt.push(a);
      const wahl = erlaubt.length ? erlaubt : Array.from({ length: arten }, (_, a) => a);
      stein.art = wahl[Math.floor(zufall() * wahl.length)];
    }
  }
}

// Mischt die vorhandenen Steine neu, bis es keine fertigen Treffer (auch keine Zauberstab-Paare)
// und mindestens einen Zug gibt. Gesperrte Steine bleiben liegen. Jeder Stein wird so gesetzt,
// dass er mit den bereits gesetzten Nachbarn links und oben nichts auslöst.
export function mische(feld, zufall = Math.random) {
  const n = feld.length;
  const frei = [];                      // Zellen, die mitgemischt werden (zeilenweise)
  for (let z = 0; z < n; z++) for (let s = 0; s < n; s++) if (bewegbar(feld[z][s])) frei.push([z, s]);
  const alle = frei.map(([z, s]) => feld[z][s]);
  const passt = (neu, z, s, stein) => {
    if (laufLinks(neu, z, s, stein.art) + 1 >= minLaenge) return false;
    if (laufOben(neu, z, s, stein.art) + 1 >= minLaenge) return false;
    for (const [dz, ds] of [[0, -1], [-1, 0]]) {
      const nb = neu[z + dz]?.[s + ds];
      if (aktiv(nb) && nb.art === stein.art && (nb.spezial === "stab" || stein.spezial === "stab")) return false;
    }
    return true;
  };
  for (let versuch = 0; versuch < 300; versuch++) {
    const vorrat = [...alle];
    for (let i = vorrat.length - 1; i > 0; i--) {
      const j = Math.floor(zufall() * (i + 1));
      [vorrat[i], vorrat[j]] = [vorrat[j], vorrat[i]];
    }
    // neu: Kopie des Feldes mit den festen (gesperrten) Steinen schon an ihrem Platz
    const neu = feld.map((zeile) => zeile.map((stein) => (bewegbar(stein) ? null : stein)));
    let ok = true;
    for (const [z, s] of frei) {
      const i = vorrat.findIndex((stein) => passt(neu, z, s, stein));
      if (i < 0) { ok = false; break; }
      neu[z][s] = vorrat.splice(i, 1)[0];
    }
    if (!ok) continue;
    for (let z = 0; z < n; z++) for (let s = 0; s < n; s++) feld[z][s] = neu[z][s];
    if (findeAlleTreffer(feld).length === 0 && findeMoeglichenZug(feld)) return true;
  }
  return false;
}
