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

export function sindNachbarn([z1, s1], [z2, s2]) {
  return Math.abs(z1 - z2) + Math.abs(s1 - s2) === 1;
}

export function tausche(feld, [z1, s1], [z2, s2]) {
  const tmp = feld[z1][s1];
  feld[z1][s1] = feld[z2][s2];
  feld[z2][s2] = tmp;
}

// Sucht einen Tausch, der zu einem Treffer führt. Liefert [a, b] oder null.
export function findeMoeglichenZug(feld) {
  const n = feld.length;
  for (let z = 0; z < n; z++) {
    for (let s = 0; s < n; s++) {
      for (const [dz, ds] of [[0, 1], [1, 0]]) {
        const z2 = z + dz, s2 = s + ds;
        if (z2 >= n || s2 >= n) continue;
        tausche(feld, [z, s], [z2, s2]);
        const treffer = findeTreffer(feld).length > 0;
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

// Mischt die Arten neu, bis es keine fertigen Treffer und mindestens einen Zug gibt.
export function mische(feld, zufall = Math.random) {
  const steine = feld.flat();
  const n = feld.length;
  for (let versuch = 0; versuch < 200; versuch++) {
    for (let i = steine.length - 1; i > 0; i--) {
      const j = Math.floor(zufall() * (i + 1));
      [steine[i], steine[j]] = [steine[j], steine[i]];
    }
    for (let z = 0; z < n; z++) for (let s = 0; s < n; s++) feld[z][s] = steine[z * n + s];
    if (findeTreffer(feld).length === 0 && findeMoeglichenZug(feld)) return true;
  }
  return false;
}
