// Spiellogik ohne Grafik: Spielfeld, Treffer finden, Nachfallen, mögliche Züge.
// Das Feld ist ein 2D-Array feld[zeile][spalte] mit Steinen { id, art }.

let naechsteId = 1;

export function neuerStein(arten, zufall = Math.random) {
  return { id: naechsteId++, art: Math.floor(zufall() * arten) };
}

// Neues Feld ohne fertige Dreierreihen, aber mit mindestens einem möglichen Zug.
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
          (s >= 2 && feld[z][s - 1].art === stein.art && feld[z][s - 2].art === stein.art) ||
          (z >= 2 && feld[z - 1][s].art === stein.art && feld[z - 2][s].art === stein.art)
        );
        feld[z].push(stein);
      }
    }
    if (findeMoeglichenZug(feld)) return feld;
  }
}

// Liefert alle Treffer-Gruppen (waagerecht/senkrecht, mind. 3 gleiche).
export function findeTreffer(feld) {
  const n = feld.length;
  const gruppen = [];
  for (let z = 0; z < n; z++) {
    let start = 0;
    for (let s = 1; s <= n; s++) {
      if (s < n && feld[z][s] && feld[z][start] && feld[z][s].art === feld[z][start].art) continue;
      if (s - start >= 3 && feld[z][start]) {
        const zellen = [];
        for (let k = start; k < s; k++) zellen.push([z, k]);
        gruppen.push({ zellen, art: feld[z][start].art });
      }
      start = s;
    }
  }
  for (let s = 0; s < n; s++) {
    let start = 0;
    for (let z = 1; z <= n; z++) {
      if (z < n && feld[z][s] && feld[start][s] && feld[z][s].art === feld[start][s].art) continue;
      if (z - start >= 3 && feld[start][s]) {
        const zellen = [];
        for (let k = start; k < z; k++) zellen.push([k, s]);
        gruppen.push({ zellen, art: feld[start][s].art });
      }
      start = z;
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
    for (let k = 0; k < feld[z].length; k++) {
      if (!entfernen.has(key([z, k]))) {
        entfernen.set(key([z, k]), [z, k]);
        warteschlange.push([z, k]);
      }
    }
  }

  // Treffer direkt neben geschützten Steinen knacken ebenfalls eine Schicht
  const nebenan = new Map();
  for (const [z, s] of entfernen.values()) {
    for (const [dz, ds] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nachbar = feld[z + dz]?.[s + ds];
      const k = key([z + dz, s + ds]);
      if (nachbar?.schutz > 0 && !entfernen.has(k)) nebenan.set(k, [z + dz, s + ds]);
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
  const inGruppe = new Set();
  const proGruppe = gruppen.map((g) => {
    g.zellen.forEach((z) => inGruppe.add(z.join(",")));
    const n = g.zellen.length;
    return (n * PUNKTE_PRO_STEIN + (BONUS[Math.min(n, 5)] || 0)) * kette;
  });
  const betroffen = [...aufloesung.entfernen, ...aufloesung.geschwaecht];
  const proReihe = [];
  const gezaehlt = new Set();
  for (const [z] of aufloesung.ausgeloest) {
    if (gezaehlt.has(z)) continue;            // zwei Stäbe in einer Reihe: Reihe nur einmal zählen
    gezaehlt.add(z);
    const extra = betroffen.filter(([zz, ss]) => zz === z && !inGruppe.has(`${zz},${ss}`)).length;
    proReihe.push({ zeile: z, punkte: (extra * PUNKTE_PRO_STEIN + STAB_BONUS) * kette });
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
    if (stein.schutz === 0 && stein.gefangen) {
      stein.gefangen = false;
      statistik.befreit++;
    }
  }
  for (const [z, s] of aufloesung.entfernen) statistik.gesammelt[feld[z][s].art]++;
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

// Sucht einen Tausch, der zu einem Treffer führt. Liefert [a, b] oder null.
// Zauberstab-Paare: Ein gleichfarbiger Nachbar (waagerecht oder senkrecht) reicht,
// um einen Zauberstab auszulösen. Geprüft werden die übergebenen Zellen.
export function findeStabPaare(feld, zellen) {
  const paare = [];
  const gesehen = new Set();
  for (const [z, s] of zellen) {
    const stein = feld[z]?.[s];
    if (!stein) continue;
    for (const [dz, ds] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
      const nachbar = feld[z + dz]?.[s + ds];
      if (!nachbar || nachbar.art !== stein.art) continue;
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

// Alle Treffer: normale Dreierreihen plus jeder Zauberstab, der neben einem gleichfarbigen Stein liegt.
// Gilt nach einem Zug genauso wie bei Kettenreaktionen.
export function findeAlleTreffer(feld) {
  const staebe = [];
  feld.forEach((zeile, z) => zeile.forEach((stein, s) => {
    if (stein?.spezial === "stab") staebe.push([z, s]);
  }));
  return [...findeTreffer(feld), ...findeStabPaare(feld, staebe)];
}

export function findeMoeglichenZug(feld) {
  const n = feld.length;
  for (let z = 0; z < n; z++) {
    for (let s = 0; s < n; s++) {
      for (const [dz, ds] of [[0, 1], [1, 0]]) {
        const z2 = z + dz, s2 = s + ds;
        if (z2 >= n || s2 >= n) continue;
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
export function entferneUndFuelle(feld, zellen, arten, zufall = Math.random) {
  const n = feld.length;
  for (const [z, s] of zellen) feld[z][s] = null;
  for (let s = 0; s < n; s++) {
    const bleibende = [];
    for (let z = n - 1; z >= 0; z--) if (feld[z][s]) bleibende.push(feld[z][s]);
    const fehlend = n - bleibende.length;
    for (let z = n - 1, i = 0; z >= 0; z--, i++) {
      if (i < bleibende.length) {
        feld[z][s] = bleibende[i];
      } else {
        const stein = neuerStein(arten, zufall);
        stein.startZeile = z - fehlend;
        feld[z][s] = stein;
      }
    }
  }
}

// Mischt die vorhandenen Steine neu, bis es keine fertigen Treffer (auch keine Zauberstab-Paare)
// und mindestens einen Zug gibt. Jeder Stein wird so gesetzt, dass er mit den bereits gesetzten
// Nachbarn links und oben nichts auslöst.
export function mische(feld, zufall = Math.random) {
  const n = feld.length;
  const alle = feld.flat();
  const passt = (neu, z, s, stein) => {
    const links = s > 0 ? neu[z][s - 1] : null;
    const oben = z > 0 ? neu[z - 1][s] : null;
    if (s >= 2 && links.art === stein.art && neu[z][s - 2].art === stein.art) return false;
    if (z >= 2 && oben.art === stein.art && neu[z - 2][s].art === stein.art) return false;
    for (const nb of [links, oben]) {
      if (nb && nb.art === stein.art && (nb.spezial === "stab" || stein.spezial === "stab")) return false;
    }
    return true;
  };
  for (let versuch = 0; versuch < 300; versuch++) {
    const vorrat = [...alle];
    for (let i = vorrat.length - 1; i > 0; i--) {
      const j = Math.floor(zufall() * (i + 1));
      [vorrat[i], vorrat[j]] = [vorrat[j], vorrat[i]];
    }
    const neu = Array.from({ length: n }, () => []);
    let ok = true;
    for (let z = 0; z < n && ok; z++) {
      for (let s = 0; s < n; s++) {
        const i = vorrat.findIndex((stein) => passt(neu, z, s, stein));
        if (i < 0) { ok = false; break; }
        neu[z][s] = vorrat.splice(i, 1)[0];
      }
    }
    if (!ok) continue;
    for (let z = 0; z < n; z++) for (let s = 0; s < n; s++) feld[z][s] = neu[z][s];
    if (findeAlleTreffer(feld).length === 0 && findeMoeglichenZug(feld)) return true;
  }
  return false;
}
