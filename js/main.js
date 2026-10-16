// Einstiegspunkt des Spiels: Darstellung, Touch-Steuerung und Effekte.
// Die Versionsnummer muss mit CACHE_VERSION in sw.js übereinstimmen.
const VERSION = "0.9.0";

import {
  erzeugeFeld, setzeMinLaenge, setzeStabRichtung, friereSteine, bewegbar, istSchatzTausch, findeSchaetzeUnten, sammleSchaetze, findeMoeglichenZug, sindNachbarn, tausche, mische,
  berechneAufloesung, findeAlleTreffer, berechnePunkte, wendeAufloesungAn,
} from "./board.js";
import { SVG_DEFS } from "./steine.js";
import { WELTEN, WELT_REIHENFOLGE } from "./welten.js";
import { SCHWIERIGKEITEN, REIHENFOLGE, STANDARD, schluessel } from "./schwierigkeit.js";
import {
  aufgabeFuerStufe, zielText, zielStand, istGeschafft, leererStand, addiereStand, erzeugeAufgabenFeld,
} from "./aufgaben.js";
import { EINHORN_SVG, FEE_SVG, DRACHE_SVG, STUFEN_BILD, KISTE_ZU, KISTE_OFFEN } from "./figuren.js";
import { erzeugeRechenaufgabe, leseAntwort, zuegeBisDrache } from "./herausforderungen.js";

// ---------- Einstellungen ----------
let GROESSE = 8;                     // Kantenlänge – hängt von der Schwierigkeit ab (setzeStufe)
const ARTEN = 6;
const TIPP_NACH_MS = 6000;           // nach so langer Pause zeigt das Spiel einen möglichen Zug
const LOB_KETTE = ["Toll!", "Super!", "Fantastisch!", "Zauberhaft!"]; // 2., 3., 4., 5.+ Kettenreaktion
const REKORD_BASIS = "zauberei-rekord";
const FORTSCHRITT_BASIS = "zauberei-aufgaben";       // Liste der geschafften Aufgaben (Eiswelt: Endung -eis)
const STUFE_SCHLUESSEL = "zauberei-stufe";           // zuletzt gewählte Schwierigkeit
const rekordSchluessel = () => schluessel(REKORD_BASIS, stufe.id);
const fortschrittSchluessel = (w = welt) => schluessel(w === "feen" ? FORTSCHRITT_BASIS : `${FORTSCHRITT_BASIS}-${w}`, stufe.id);

// ---------- Elemente ----------
document.body.insertAdjacentHTML("afterbegin", SVG_DEFS);
const steineEbene = document.getElementById("steine");
const effektEbene = document.getElementById("effekte");
const lobEbene = document.getElementById("lob");
const punkteAnzeige = document.getElementById("punkte");
const rekordAnzeige = document.getElementById("rekord");
const zuegeAnzeige = document.getElementById("zuege");
const zieleAnzeige = document.getElementById("ziele");
const neuesSpielKnopf = document.getElementById("neues-spiel");
document.getElementById("version").textContent = VERSION;

// ---------- Zustand ----------
let stufe = SCHWIERIGKEITEN[STANDARD];
let welt = "feen";                   // aktuelle Welt: "feen" oder "eis"
let STEINE_AKT = WELTEN.feen.steine; // Steine der aktuellen Welt (Name, Farbe)
const weltDaten = (w = welt) => WELTEN[w];
const aufgabenListe = (w = welt) => WELTEN[w].aufgaben;
const symbolId = (art, w = welt) => `${WELTEN[w].symbol}${art}`;
let feld = [];
let punkte = 0;
let rekord = 0;
let beschaeftigt = false;            // während Animationen keine Eingaben
let gewaehlt = null;                 // [zeile, spalte] des angetippten Steins
let tippTimer = null;
const elemente = new Map();          // Stein-ID -> DOM-Element

let modus = "endlos";                // "endlos" oder "aufgabe"
let spielAktiv = false;              // false, solange Menü oder Dialog offen sind
let aufgabeNr = 0;                   // Index in AUFGABEN
let aufgabe = null;
let stand = leererStand();           // Fortschritt der laufenden Aufgabe
let zuegeUebrig = 0;

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const zufall = (min, max) => min + Math.random() * (max - min);

// ---------- Punkte & Rekord ----------
function ladeRekord() {
  try {
    return Number(localStorage.getItem(rekordSchluessel())) || 0;
  } catch {
    return 0;
  }
}

function speichereRekord() {
  try {
    localStorage.setItem(rekordSchluessel(), String(rekord));
  } catch {
    // Speichern nicht möglich (z. B. privater Modus) – Spiel läuft trotzdem.
  }
}

function huepfe(el) {
  el.classList.remove("huepft");
  void el.offsetWidth;
  el.classList.add("huepft");
}

function zeigePunkte() {
  punkteAnzeige.textContent = punkte.toLocaleString("de-DE");
  rekordAnzeige.textContent = rekord.toLocaleString("de-DE");
}

function addierePunkte(wert) {
  punkte += wert;
  if (modus !== "endlos") return;
  huepfe(punkteAnzeige);
  if (punkte > rekord) {
    rekord = punkte;
    speichereRekord();
    huepfe(rekordAnzeige);
  }
  zeigePunkte();
}

// ---------- Darstellung der Steine ----------
function setzePosition(el, z, s) {
  el.style.setProperty("--z", z);
  el.style.setProperty("--s", s);
  el.dataset.z = z;
}

function erzeugeElement(stein) {
  const el = document.createElement("div");
  el.className = "stein" + (stein.kokos ? " kokos" : "") + (stein.fels ? " fels" : "") + (stein.schatz ? " schatz" : "");
  const hindernis = stein.kokos ? ["kokosnuss", "Kokosnuss"] : stein.fels ? ["felsbrocken", "Felsbrocken"]
    : stein.schatz ? [`schatz-${welt === "eis" ? "eis" : "feen"}`, "Schatzkiste"] : null;
  el.innerHTML = hindernis
    ? `<div class="bild"><svg viewBox="0 0 100 100" role="img" aria-label="${hindernis[1]}"><use href="#${hindernis[0]}"/></svg></div>`
    : `<div class="bild"><svg viewBox="0 0 100 100" role="img" aria-label="${STEINE_AKT[stein.art].name}">` +
      `<use href="#${symbolId(stein.art)}"/></svg></div>`;
  steineEbene.append(el);
  elemente.set(stein.id, el);
  if (stein.spezial === "stab") zeigeAlsStab(el, stein);
  zeigeSchutz(el, stein);
  return el;
}

// Ranken (Schutz 1–2) und Steinhülle (Schutz 3) über dem Stein
function zeigeSchutz(el, stein) {
  let ebene = el.querySelector(".schutz");
  if (!(stein.schutz > 0)) {
    ebene?.remove();
    return;
  }
  if (!ebene) {
    ebene = document.createElement("div");
    ebene.className = "schutz";
    el.append(ebene);
  }
  const teile = [];
  if (stein.eis) {
    teile.push("eisschicht");
  } else {
    if (stein.schutz >= 3) teile.push("huelle");
    teile.push(stein.schutz >= 2 ? "ranken-2" : "ranken-1");
  }
  ebene.innerHTML = teile.map((t) => `<svg viewBox="0 0 100 100"><use href="#${t}"/></svg>`).join("");
}

// Legt den Zauberstab über den Stein. Die Farbe des Steins bleibt erhalten.
function zeigeAlsStab(el, stein) {
  if (el.classList.contains("stab")) return;
  el.classList.add("stab");
  el.style.setProperty("--farbe", STEINE_AKT[stein.art].farbe);
  el.insertAdjacentHTML("afterbegin", '<div class="aura"></div>');
  el.insertAdjacentHTML("beforeend",
    `<svg class="stab-symbol" viewBox="0 0 100 100" aria-label="${weltDaten().stab.name}"><use href="#${weltDaten().stab.symbol}"/></svg>`);
}

function elementBei([z, s]) {
  return elemente.get(feld[z][s].id);
}

// Im Aufgaben-Modus leuchten alle Steine, die für ein noch offenes Ziel zählen.
function aktualisiereLeuchten() {
  const offen = (modus === "aufgabe" && aufgabe)
    ? aufgabe.ziele.filter((z) => zielStand(z, stand) < z.anzahl) : [];
  const arten = new Set(offen.filter((z) => z.typ === "sammeln").map((z) => z.art));
  const gefangene = offen.some((z) => z.typ === "befreien");
  const schatzOffen = offen.some((z) => z.typ === "schatz");
  for (const zeile of feld) {
    for (const stein of zeile) {
      const el = elemente.get(stein.id);
      if (!el) continue;
      el.classList.toggle("ziel-leuchten", (stein.schatz && schatzOffen) || (!stein.kokos && !stein.fels && !stein.schatz && arten.has(stein.art)) || (gefangene && stein.gefangen && stein.schutz > 0));
    }
  }
}

// Lässt alle Steine an ihren Platz fallen; neue Steine kommen von oben.
async function lasseFallen() {
  const bewegungen = [];
  for (let z = 0; z < GROESSE; z++) {
    for (let s = 0; s < GROESSE; s++) {
      const stein = feld[z][s];
      let el = elemente.get(stein.id);
      if (!el) {
        el = erzeugeElement(stein);
        el.classList.add("ohne-animation");
        setzePosition(el, stein.startZeile ?? z, s);
        delete stein.startZeile;
      }
      const abstand = z - Number(el.dataset.z);
      if (abstand > 0) bewegungen.push({ el, z, s, abstand });
    }
  }
  if (!bewegungen.length) return;

  void steineEbene.offsetHeight;      // Startposition übernehmen, bevor die Bewegung beginnt
  let laengste = 0;
  for (const { el, z, s, abstand } of bewegungen) {
    const dauer = 0.2 + 0.055 * abstand;
    laengste = Math.max(laengste, dauer);
    el.classList.remove("ohne-animation");
    el.classList.add("faellt");
    el.style.setProperty("--dauer", `${dauer}s`);
    setzePosition(el, z, s);
  }
  await warte(laengste * 1000 + 40);
  for (const { el } of bewegungen) el.classList.remove("faellt");
}

// ---------- Effekte ----------
function mitte(zellen) {
  const z = zellen.reduce((a, [zz]) => a + zz, 0) / zellen.length;
  const s = zellen.reduce((a, [, ss]) => a + ss, 0) / zellen.length;
  return { links: ((s + 0.5) / GROESSE) * 100, oben: ((z + 0.5) / GROESSE) * 100 };
}

function effekt(klasse, links, oben, stil = {}, inhalt = "") {
  const el = document.createElement("div");
  el.className = klasse;
  el.style.left = `${links}%`;
  el.style.top = `${oben}%`;
  for (const [k, v] of Object.entries(stil)) el.style.setProperty(k, v);
  el.innerHTML = inhalt;
  effektEbene.append(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
  setTimeout(() => el.remove(), 2000); // Sicherheitsnetz
  return el;
}

function funkenregen([z, s], farbe, anzahl) {
  const { links, oben } = mitte([[z, s]]);
  for (let i = 0; i < anzahl; i++) {
    const winkel = (Math.PI * 2 * i) / anzahl + zufall(-0.3, 0.3);
    const weite = zufall(160, 340);
    const f = i % 3 === 0 ? "#ffffff" : farbe;
    effekt("funke", links, oben, {
      "--dx": `${Math.cos(winkel) * weite}%`,
      "--dy": `${Math.sin(winkel) * weite}%`,
      "--dreh": `${zufall(-200, 200)}deg`,
      "--gross": zufall(0.7, 1.4).toFixed(2),
      "--dauer": `${zufall(0.55, 0.85).toFixed(2)}s`,
    }, `<svg viewBox="0 0 20 20" fill="${f}"><use href="#funkel"/></svg>`);
  }
}

// Lichtstrahl über die ganze Reihe (Zauberstab) bzw. Spalte (Feuerstab), ausgehend vom Stab
function strahl([z, s], farbe) {
  const el = document.createElement("div");
  const senkrecht = weltDaten().stab.richtung === "spalte";
  el.className = "strahl" + (senkrecht ? " senkrecht" : "");
  if (senkrecht) {
    el.style.left = `${(s / GROESSE) * 100}%`;
    el.style.transformOrigin = `50% ${((z + 0.5) / GROESSE) * 100}%`;
  } else {
    el.style.top = `${(z / GROESSE) * 100}%`;
    el.style.transformOrigin = `${((s + 0.5) / GROESSE) * 100}% 50%`;
  }
  el.style.setProperty("--farbe", farbe);
  effektEbene.append(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
  setTimeout(() => el.remove(), 2000);
}

function zeigeLob(text) {
  lobEbene.innerHTML = "";
  const el = document.createElement("div");
  el.className = "text";
  el.textContent = text;
  lobEbene.append(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
}

// ---------- Spielablauf ----------
// bevorzugt: Zellen des Tauschs – dort entsteht ein neuer Zauberstab am liebsten.
// Zauberstab-Paare (Stab + gleichfarbiger Nachbar) zählen in jedem Schritt, auch bei Kettenreaktionen.
async function loeseTrefferAuf(bevorzugt = []) {
  for (let kette = 1; ; kette++) {
    const gruppen = findeAlleTreffer(feld);
    if (!gruppen.length) {
      if (await sammleSchaetzeAb()) { kette--; continue; }   // Kiste per Tausch ganz nach unten gezogen
      break;
    }

    const aufloesung = berechneAufloesung(feld, gruppen, kette === 1 ? bevorzugt : []);
    const { entfernen, geschwaecht, neueStaebe, ausgeloest } = aufloesung;
    const wertung = berechnePunkte(gruppen, aufloesung, kette);
    const farbeBei = ([z, s]) => (feld[z][s].kokos ? "#a86a3a" : STEINE_AKT[feld[z][s].art].farbe);   // (Kisten nie betroffen)

    // Punkte-Popups für Gruppen und Stab-Reihen
    const laengste = Math.max(...gruppen.map((g) => g.zellen.length));
    const inGruppe = new Set(gruppen.flatMap((g) => g.zellen.map((z) => z.join(","))));
    gruppen.forEach((g, i) => {
      const { links, oben } = mitte(g.zellen);
      effekt("punkte-popup", links, oben, { "--farbe": STEINE_AKT[g.art].farbe }, `+${wertung.proGruppe[i]}`);
    });
    for (const zelle of ausgeloest) strahl(zelle, farbeBei(zelle));
    for (const { zeile, spalte, punkte: p } of wertung.proReihe) {
      const stab = ausgeloest.find(([z, s]) => (spalte !== undefined ? s === spalte : z === zeile));
      const mitteZelle = spalte !== undefined ? [(GROESSE - 1) / 2, spalte] : [zeile, (GROESSE - 1) / 2];
      const { links, oben } = mitte([mitteZelle]);
      effekt("punkte-popup", links, oben - 6, { "--farbe": farbeBei(stab) }, `+${p}`);
    }

    // Auflösen mit Effekten
    for (const zelle of entfernen) {
      const farbe = farbeBei(zelle);
      const gross = laengste >= 4;
      const { links, oben } = mitte([zelle]);
      effekt("ring", links, oben, { "--farbe": farbe, "--gross": gross ? "3" : "2" });
      funkenregen(zelle, farbe, inGruppe.has(zelle.join(",")) ? (gross ? 10 : 7) : 5);
      elementBei(zelle).classList.add("verschwindet");
    }

    // Ranken und Steinhüllen knacken
    const geknackt = geschwaecht.map((zelle) => {
      const stein = feld[zelle[0]][zelle[1]];
      const el = elemente.get(stein.id);
      el.querySelector(".schutz")?.classList.add("knackt");
      funkenregen(zelle, stein.eis ? "#bfe8ff" : stein.schutz >= 3 ? "#a99bbf" : "#4cc96b", 8);
      return { stein, el, zelle, eis: Boolean(stein.eis) };
    });

    // Neue Zauberstäbe entstehen
    for (const { zelle, art } of neueStaebe) {
      const el = elementBei(zelle);
      el.classList.remove("verschwindet");
      zeigeAlsStab(el, { art });
      el.classList.add("wird-stab");
      setTimeout(() => el.classList.remove("wird-stab"), 700);
      const { links, oben } = mitte([zelle]);
      effekt("ring", links, oben, { "--farbe": "#fff", "--gross": "3.5" });
      funkenregen(zelle, "#ffe14d", 12);
    }

    if (ausgeloest.length) zeigeLob(weltDaten().stab.lob);
    else if (neueStaebe.length) zeigeLob(`${weltDaten().stab.name}!`);
    else if (kette >= 2) zeigeLob(LOB_KETTE[Math.min(kette - 2, LOB_KETTE.length - 1)]);

    await warte(ausgeloest.length ? 480 : 400);
    const entfernteIds = entfernen.map(([z, s]) => feld[z][s].id);
    const statistik = wendeAufloesungAn(feld, aufloesung, ARTEN);
    for (const id of entfernteIds) {
      elemente.get(id).remove();
      elemente.delete(id);
    }
    for (const { stein, el, zelle } of geknackt) {
      zeigeSchutz(el, stein);
      if (!(stein.schutz > 0) && modus === "aufgabe") {
        const { links, oben } = mitte([zelle]);
        effekt("ring", links, oben, { "--farbe": "#7fdc89", "--gross": "3" });
      }
    }
    if (statistik.befreit && modus === "aufgabe") zeigeLob(welt === "eis" ? "Aufgetaut!" : "Befreit!");
    else if (geknackt.some((g) => g.eis && !(g.stein.schutz > 0))) zeigeLob("Aufgetaut!");
    addierePunkte(wertung.gesamt);
    if (modus === "aufgabe") {
      addiereStand(stand, statistik, wertung.gesamt);
      zeigeAufgabenStand(true);
    }
    await lasseFallen();
    await sammleSchaetzeAb();
    aktualisiereLeuchten();
  }

  if (!findeMoeglichenZug(feld)) await mischeNeu();
}

// Schatzkisten, die ganz unten angekommen sind, werden eingesammelt.
async function sammleSchaetzeAb() {
  const unten = findeSchaetzeUnten(feld);
  if (!unten.length) return false;
  const ids = unten.map(([z, s]) => feld[z][s].id);
  for (const zelle of unten) {
    const { links, oben } = mitte([zelle]);
    effekt("ring", links, oben, { "--farbe": "#ffd23f", "--gross": "3.5" });
    funkenregen(zelle, "#ffd23f", 12);
    funkenregen(zelle, welt === "eis" ? "#bfe8ff" : "#ff6fae", 8);
    elementBei(zelle).classList.add("verschwindet");
  }
  zeigeLob(unten.length > 1 ? "Schätze gerettet!" : "Schatz gerettet!");
  await warte(550);
  sammleSchaetze(feld, ARTEN);
  for (const id of ids) {
    elemente.get(id)?.remove();
    elemente.delete(id);
  }
  if (modus === "aufgabe") {
    stand.schaetze += unten.length;
    zeigeAufgabenStand(true);
  }
  await lasseFallen();
  return true;
}

async function mischeNeu() {
  await warte(300);
  zeigeLob("Neu gemischt!");
  for (const el of elemente.values()) el.classList.add("mischen");
  await warte(300);                    // Mitte der Animation: Steine sind unsichtbar
  if (mische(feld)) {
    // Gleiche Steine, neue Plätze: ohne Bewegung umsetzen, solange sie unsichtbar sind
    for (let z = 0; z < GROESSE; z++) {
      for (let s = 0; s < GROESSE; s++) {
        const el = elementBei([z, s]);
        el.classList.add("ohne-animation");
        setzePosition(el, z, s);
      }
    }
    void steineEbene.offsetHeight;
    for (const el of elemente.values()) el.classList.remove("ohne-animation");
  } else if (!gesperrteZeilen().length) {
    // Neues Feld; Kokosnüsse bleiben an ihren Plätzen
    const hindernisse = [];
    feld.forEach((reihe, z) => reihe.forEach((st, s) => (st.kokos || st.fels || st.schatz) && hindernisse.push([z, s, st])));
    feld = erzeugeFeld(GROESSE, ARTEN);
    for (const [z, s, stein] of hindernisse) feld[z][s] = stein;
    baueFeldNeu();
  }   // mit gesperrten Reihen bleibt das Feld, wie es ist – der Drache-Dialog greift dann ein
  await warte(320);
  for (const el of elemente.values()) el.classList.remove("mischen");
  aktualisiereLeuchten();
}

// Ersetzt alle Elemente passend zum aktuellen Feld (ohne Animation).
function baueFeldNeu() {
  steineEbene.innerHTML = "";
  elemente.clear();
  for (let z = 0; z < GROESSE; z++) {
    for (let s = 0; s < GROESSE; s++) {
      setzePosition(erzeugeElement(feld[z][s]), z, s);
    }
  }
}

// Vom Drachen gesperrte Steine und Kokosnüsse wackeln nur kurz – sie lassen sich nicht benutzen.
function wackleGesperrt(...zellen) {
  for (const zelle of zellen) {
    const el = elementBei(zelle);
    el.classList.remove("wackeln");
    void el.offsetWidth;
    el.classList.add("wackeln");
    setTimeout(() => el.classList.remove("wackeln"), 400);
  }
}

async function versucheTausch(a, b) {
  if (!bewegbar(feld[a[0]][a[1]]) || !bewegbar(feld[b[0]][b[1]])) {
    waehleAb();
    wackleGesperrt(...[a, b].filter(([z, s]) => !bewegbar(feld[z][s])));
    return;
  }
  beschaeftigt = true;
  stoppeTipp();
  waehleAb();

  const elA = elementBei(a);
  const elB = elementBei(b);
  tausche(feld, a, b);
  setzePosition(elA, b[0], b[1]);
  setzePosition(elB, a[0], a[1]);
  await warte(220);

  if (findeAlleTreffer(feld).length === 0 && !istSchatzTausch(feld, a, b)) {
    // Kein Treffer: zurücktauschen und kurz wackeln
    tausche(feld, a, b);
    setzePosition(elA, a[0], a[1]);
    setzePosition(elB, b[0], b[1]);
    await warte(220);
    elA.classList.add("wackeln");
    elB.classList.add("wackeln");
    await warte(360);
    elA.classList.remove("wackeln");
    elB.classList.remove("wackeln");
  } else {
    if (modus === "aufgabe") {
      zuegeUebrig--;
      zeigeAufgabenStand(false);
    }
    await loeseTrefferAuf([b, a]);   // b: dorthin wurde der Stein gezogen
    if (modus === "aufgabe" && pruefeAufgabenEnde()) return;
    await sturmNachZug();                // Schneesturm kann aufziehen (Eiswelt)
    await dracheNachZug();               // Drache kann auftauchen (Dialog offen, spielAktiv ist dann false)
  }

  beschaeftigt = false;
  starteTipp();
}

// ---------- Auswahl & Tipps ----------
function waehle(zelle) {
  waehleAb();
  gewaehlt = zelle;
  elementBei(zelle).classList.add("gewaehlt");
}

function waehleAb() {
  if (gewaehlt) elementBei(gewaehlt)?.classList.remove("gewaehlt");
  gewaehlt = null;
}

function starteTipp() {
  clearTimeout(tippTimer);
  if (!spielAktiv) return;
  tippTimer = setTimeout(() => {
    const zug = findeMoeglichenZug(feld);
    if (zug && !beschaeftigt && spielAktiv) zug.forEach((z) => elementBei(z).classList.add("tipp"));
  }, TIPP_NACH_MS);
}

function stoppeTipp() {
  clearTimeout(tippTimer);
  steineEbene.querySelectorAll(".tipp").forEach((el) => el.classList.remove("tipp"));
}

// ---------- Touch-Steuerung: wischen oder zwei Steine nacheinander antippen ----------
let geste = null;

function zelleAus(event) {
  const r = steineEbene.getBoundingClientRect();
  const s = Math.floor(((event.clientX - r.left) / r.width) * GROESSE);
  const z = Math.floor(((event.clientY - r.top) / r.height) * GROESSE);
  if (z < 0 || s < 0 || z >= GROESSE || s >= GROESSE) return null;
  return [z, s];
}

steineEbene.addEventListener("pointerdown", (event) => {
  if (beschaeftigt || geste || !spielAktiv) return;
  const zelle = zelleAus(event);
  if (!zelle) return;
  if (!bewegbar(feld[zelle[0]][zelle[1]])) {
    waehleAb();
    wackleGesperrt(zelle);
    return;
  }
  stoppeTipp();
  steineEbene.setPointerCapture?.(event.pointerId);
  geste = { id: event.pointerId, x: event.clientX, y: event.clientY, zelle, gewischt: false };
});

steineEbene.addEventListener("pointermove", (event) => {
  if (!geste || geste.id !== event.pointerId || geste.gewischt || beschaeftigt) return;
  const dx = event.clientX - geste.x;
  const dy = event.clientY - geste.y;
  const schwelle = steineEbene.getBoundingClientRect().width / GROESSE * 0.35;
  if (Math.max(Math.abs(dx), Math.abs(dy)) < schwelle) return;

  const [z, s] = geste.zelle;
  const ziel = Math.abs(dx) > Math.abs(dy) ? [z, s + Math.sign(dx)] : [z + Math.sign(dy), s];
  geste.gewischt = true;
  if (ziel[0] >= 0 && ziel[1] >= 0 && ziel[0] < GROESSE && ziel[1] < GROESSE) {
    versucheTausch(geste.zelle, ziel);
  }
});

steineEbene.addEventListener("pointerup", (event) => {
  if (!geste || geste.id !== event.pointerId) return;
  const { zelle, gewischt } = geste;
  geste = null;
  if (gewischt || beschaeftigt) return;

  if (!gewaehlt) {
    waehle(zelle);
  } else if (gewaehlt[0] === zelle[0] && gewaehlt[1] === zelle[1]) {
    waehleAb();
  } else if (sindNachbarn(gewaehlt, zelle)) {
    versucheTausch(gewaehlt, zelle);
  } else {
    waehle(zelle);
  }
  if (!beschaeftigt) starteTipp();
});

steineEbene.addEventListener("pointercancel", () => {
  geste = null;
});

// ---------- Spielstart ----------
// Baut ein neues Feld auf; alle Steine regnen von oben herein.
async function baueSpielfeld(neuesFeld) {
  beschaeftigt = true;
  stoppeTipp();
  gewaehlt = null;
  steineEbene.innerHTML = "";
  effektEbene.innerHTML = "";
  lobEbene.innerHTML = "";
  elemente.clear();
  feld = neuesFeld;
  for (let z = 0; z < GROESSE; z++) {
    for (let s = 0; s < GROESSE; s++) feld[z][s].startZeile = z - GROESSE;
  }
  await lasseFallen();
  aktualisiereLeuchten();
  beschaeftigt = false;
}

async function starteEndlos() {
  modus = "endlos";
  setzeWelt("feen");
  setzeDracheZurueck();
  aufgabe = null;
  punkte = 0;
  zeigePunkte();
  document.getElementById("punkte-leiste").hidden = false;
  document.getElementById("aufgaben-leiste").hidden = true;
  neuesSpielKnopf.textContent = "Neues Spiel";
  schliesseBildschirme();
  spielAktiv = true;
  await baueSpielfeld(erzeugeFeld(GROESSE, ARTEN));
  starteTipp();
}

async function starteAufgabe(nr, weltId = welt) {
  modus = "aufgabe";
  setzeWelt(weltId);
  aufgabeNr = nr;
  aufgabe = aufgabeFuerStufe(aufgabenListe()[nr], stufe);
  sturm.zuegeBis = zuegeBisSturm(true);
  setzeDracheZurueck();
  stand = leererStand();
  zuegeUebrig = aufgabe.zuege;
  punkte = 0;
  document.getElementById("punkte-leiste").hidden = true;
  document.getElementById("aufgaben-leiste").hidden = false;
  document.getElementById("aufgabe-nr").textContent = `Aufgabe ${nr + 1}`;
  neuesSpielKnopf.textContent = "Nochmal";
  zeigeAufgabenStand(false);
  schliesseBildschirme();
  spielAktiv = false;
  await baueSpielfeld(erzeugeAufgabenFeld(aufgabe, GROESSE, ARTEN));
  zeigeAufgabeVor();
}

// ---------- Aufgaben: Anzeige und Ende ----------
function zielIcon(ziel, w = welt) {
  switch (ziel.typ) {
    case "sammeln":
      return `<svg viewBox="0 0 100 100"><use href="#${symbolId(ziel.art, w)}"/></svg>`;
    case "befreien":
      return w === "eis"
        ? `<svg viewBox="0 0 100 100"><use href="#eis-0"/><use href="#eisschicht"/></svg>`
        : `<svg viewBox="0 0 100 100"><use href="#stein-0" opacity=".55"/><use href="#ranken-2"/></svg>`;
    case "staebe":
      return `<svg viewBox="0 0 100 100"><use href="#${WELTEN[w].stab.symbol}"/></svg>`;
    case "schatz":
      return `<svg viewBox="0 0 100 100"><use href="#schatz-${w === "eis" ? "eis" : "feen"}"/></svg>`;
    case "punkte":
      return `<svg viewBox="0 0 100 100"><use href="#${symbolId(1, w)}"/></svg>`;
    default:
      return "";
  }
}

function zeigeAufgabenStand(mitHuepfen) {
  if (!aufgabe) return;
  zieleAnzeige.innerHTML = aufgabe.ziele.map((ziel) => {
    const wert = Math.min(zielStand(ziel, stand), ziel.anzahl);
    const fertig = wert >= ziel.anzahl ? " fertig" : "";
    const zahl = ziel.typ === "punkte"
      ? `${wert.toLocaleString("de-DE")}/${ziel.anzahl.toLocaleString("de-DE")}`
      : `${wert}/${ziel.anzahl}`;
    return `<span class="ziel${fertig}">${zielIcon(ziel)}<b>${zahl}</b></span>`;
  }).join("");
  if (mitHuepfen) huepfe(zieleAnzeige);
  zuegeAnzeige.textContent = zuegeUebrig;
  zuegeAnzeige.classList.toggle("wenig", zuegeUebrig <= 3);
}

// true, wenn die Aufgabe vorbei ist (geschafft oder keine Züge mehr)
function pruefeAufgabenEnde() {
  if (istGeschafft(aufgabe, stand)) {
    spielAktiv = false;
    beschaeftigt = false;
    speichereGeschafft(aufgabeNr);
    setTimeout(zeigeErfolg, 500);
    return true;
  }
  if (zuegeUebrig <= 0) {
    spielAktiv = false;
    beschaeftigt = false;
    setTimeout(zeigeMisserfolg, 500);
    return true;
  }
  return false;
}

function ladeGeschafft(w = welt) {
  try {
    return new Set(JSON.parse(localStorage.getItem(fortschrittSchluessel(w)) || "[]"));
  } catch {
    return new Set();
  }
}

function speichereGeschafft(nr) {
  const geschafft = ladeGeschafft();
  geschafft.add(nr);
  try {
    localStorage.setItem(fortschrittSchluessel(), JSON.stringify([...geschafft]));
  } catch {
    // Speichern nicht möglich – Spiel läuft trotzdem.
  }
}

// ---------- Bildschirme: Menü, Aufgabenwahl, Dialoge ----------
const bildschirme = ["menue", "aufgabenwahl", "dialog", "rechnen"].map((id) => document.getElementById(id));

function zeigeBildschirm(id) {
  stoppeTipp();
  for (const b of bildschirme) b.hidden = b.id !== id;
}

function schliesseBildschirme() {
  for (const b of bildschirme) b.hidden = true;
}

// Schwierigkeit wählen: Feldgröße, Auflöse-Regel, Rekord und Fortschritt hängen daran.
function setzeStufe(id, speichern = true) {
  stufe = SCHWIERIGKEITEN[id] || SCHWIERIGKEITEN[STANDARD];
  GROESSE = stufe.groesse;
  setzeMinLaenge(stufe.minLaenge);
  document.documentElement.style.setProperty("--n", GROESSE);
  rekord = ladeRekord();
  if (speichern) {
    try { localStorage.setItem(STUFE_SCHLUESSEL, stufe.id); } catch { /* egal */ }
  }
}

// Welt wechseln: Steine, Sonderstab und Aussehen (Landschaft) hängen daran.
function setzeWelt(w) {
  welt = WELTEN[w] ? w : "feen";
  STEINE_AKT = WELTEN[welt].steine;
  setzeStabRichtung(WELTEN[welt].stab.richtung);
  document.body.dataset.welt = welt;
}

function ladeStufe() {
  try {
    return localStorage.getItem(STUFE_SCHLUESSEL) || STANDARD;
  } catch {
    return STANDARD;
  }
}

function zeigeStufenwahl() {
  const reihe = document.getElementById("stufen");
  reihe.innerHTML = "";
  for (const id of REIHENFOLGE) {
    const s = SCHWIERIGKEITEN[id];
    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "stufe" + (s.id === stufe.id ? " gewaehlt" : "");
    knopf.setAttribute("aria-pressed", s.id === stufe.id);
    knopf.dataset.stufe = s.id;
    knopf.innerHTML = `${STUFEN_BILD[s.id]}<span class="stufe-kurz">${s.kurz}</span><span class="stufe-name">${s.name}</span>`;
    knopf.addEventListener("click", () => waehleStufe(s.id));
    reihe.append(knopf);
  }
  document.getElementById("stufe-text").textContent = stufe.beschreibung;
  document.getElementById("menue-rekord").textContent = rekord.toLocaleString("de-DE");
}

async function waehleStufe(id) {
  if (id === stufe.id) return;
  setzeStufe(id);
  zeigeStufenwahl();
  zeigePunkte();
  await baueSpielfeld(erzeugeFeld(GROESSE, ARTEN));   // Hintergrund-Feld in neuer Größe
}

function zeigeMenue() {
  spielAktiv = false;
  document.body.dataset.welt = "feen";
  setzeDracheZurueck();
  zeigeStufenwahl();
  zeigeBildschirm("menue");
}

let wahlWelt = "feen";                // aufgeschlagener Reiter in der Aufgabenwahl

function zeigeAufgabenwahl(w = wahlWelt) {
  wahlWelt = WELTEN[w] ? w : "feen";
  document.body.dataset.welt = wahlWelt;       // Landschaft passend zum Reiter
  const reiter = document.getElementById("welten");
  reiter.innerHTML = "";
  for (const id of WELT_REIHENFOLGE) {
    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "reiter" + (id === wahlWelt ? " aktiv" : "");
    knopf.dataset.welt = id;
    knopf.setAttribute("role", "tab");
    knopf.setAttribute("aria-selected", id === wahlWelt);
    knopf.innerHTML = `<svg viewBox="0 0 100 100" aria-hidden="true"><use href="#${symbolId(id === "eis" ? 0 : 3, id)}"/></svg>${WELTEN[id].name}`;
    knopf.addEventListener("click", () => zeigeAufgabenwahl(id));
    reiter.append(knopf);
  }
  const geschafft = ladeGeschafft(wahlWelt);
  const liste = document.getElementById("aufgaben-liste");
  liste.innerHTML = "";
  aufgabenListe(wahlWelt).forEach((auf, nr) => {
    // Freigeschaltet: Aufgabe 1 und jede Aufgabe nach einer geschafften
    const frei = nr === 0 || geschafft.has(nr - 1) || geschafft.has(nr);
    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "aufgabe-eintrag" + (geschafft.has(nr) ? " geschafft" : "") + (frei ? "" : " gesperrt");
    knopf.innerHTML =
      `<span class="aufgabe-nummer">${geschafft.has(nr) ? "✓" : frei ? nr + 1 : "🔒"}</span>` +
      `<span class="aufgabe-info"><span class="aufgabe-name">${auf.titel}</span>` +
      `<span class="aufgabe-icons">${auf.ziele.map((ziel) => zielIcon(ziel, wahlWelt)).join("")}</span></span>`;
    if (frei) knopf.addEventListener("click", () => starteAufgabe(nr, wahlWelt));
    liste.append(knopf);
  });
  zeigeBildschirm("aufgabenwahl");
}

function zeigeDialog({ figur = "", titel, text, knoepfe }) {
  document.getElementById("dialog-figur").innerHTML = figur;
  document.getElementById("dialog-titel").textContent = titel;
  document.getElementById("dialog-text").innerHTML = text;
  const reihe = document.getElementById("dialog-knoepfe");
  reihe.innerHTML = "";
  for (const { text: t, klasse = "", aktion } of knoepfe) {
    const k = document.createElement("button");
    k.type = "button";
    k.className = `knopf ${klasse}`;
    k.textContent = t;
    k.addEventListener("click", aktion);
    reihe.append(k);
  }
  zeigeBildschirm("dialog");
}

function zielListeHtml(mitStand) {
  return `<div class="ziel-liste">${aufgabe.ziele.map((ziel) => {
    const extra = mitStand ? ` – ${Math.min(zielStand(ziel, stand), ziel.anzahl)} geschafft` : "";
    return `<div class="ziel-zeile">${zielIcon(ziel)}<span>${zielText(ziel, weltDaten())}${extra}</span></div>`;
  }).join("")}</div>`;
}

function zeigeAufgabeVor() {
  const hinweis = aufgabe.ziele.some((z) => z.typ === "befreien")
    ? "<p>Triff die gefangenen Steine oder ihre Nachbarn, bis die Ranken weg sind!</p>" : "";
  const eisHinweise = [
    aufgabe.sturm && "<p>❄ Ab und zu zieht ein <b>Schneesturm</b> auf und friert Steine ein! Löse einen gefrorenen Stein einmal auf, dann taut das Eis.</p>",
    aufgabe.eissteine && "<p>❄ Löse die gefrorenen Steine einmal auf, damit das Eis taut.</p>",
    aufgabe.felsen && "<p>⛰ Felsbrocken bleiben immer, wo sie sind – die Steine fallen daran vorbei.</p>",
    welt === "eis" && aufgabe.ziele.some((z) => z.typ === "staebe") && "<p>Löse 4 oder mehr gleiche Steine auf – dann entsteht ein <b>Feuerstab</b>, der eine ganze Spalte auflöst!</p>",
  ].filter(Boolean).join("");
  const schatz = aufgabe.schatzkisten
    ? `<p><svg class="mini-kokos" viewBox="0 0 100 100"><use href="#schatz-${welt === "eis" ? "eis" : "feen"}"/></svg> Bringe die Schatzkiste ganz nach unten: Tausche sie mit einem Nachbarn (das kostet einen Zug) oder löse Steine unter ihr auf, dann fällt sie!</p>` : "";
  const kokos = aufgabe.kokosnuesse
    ? '<p><svg class="mini-kokos" viewBox="0 0 100 100"><use href="#kokosnuss"/></svg> Kokosnüsse lassen sich nicht bewegen. Ein Zauberstab räumt sie ab!</p>' : "";
  zeigeDialog({
    titel: `Aufgabe ${aufgabeNr + 1}: ${aufgabe.titel}`,
    text: `${zielListeHtml(false)}${hinweis}${eisHinweise}${schatz}${kokos}<p>Du hast <b>${aufgabe.zuege} Züge</b>.</p>`,
    knoepfe: [
      { text: "← Zurück", klasse: "knopf-zart", aktion: zeigeAufgabenwahl },
      { text: "Los geht's!", aktion: () => { schliesseBildschirme(); spielAktiv = true; aktualisiereDracheLeiste(); starteTipp(); } },
    ],
  });
}

function zeigeErfolg() {
  const naechste = aufgabeNr + 1 < aufgabenListe().length ? aufgabeNr + 1 : null;
  const knoepfe = [{ text: "☰ Menü", klasse: "knopf-zart", aktion: zeigeAufgabenwahl }];
  if (naechste !== null) knoepfe.push({ text: "Nächste Aufgabe →", aktion: () => starteAufgabe(naechste) });
  else knoepfe.push({ text: "Nochmal", aktion: () => starteAufgabe(aufgabeNr) });
  const rest = zuegeUebrig > 0 ? ` Und du hattest sogar noch <b>${zuegeUebrig} ${zuegeUebrig === 1 ? "Zug" : "Züge"}</b> übrig!` : "";
  const eis = welt === "eis";
  const mitSchatz = Boolean(aufgabe.schatzkisten);
  zeigeDialog({
    figur: mitSchatz ? `<button type="button" class="kiste-knopf" aria-label="Schatzkiste öffnen">${KISTE_ZU(eis)}</button>` : EINHORN_SVG,
    titel: mitSchatz ? "Du hast den Schatz gerettet!" : naechste === null ? "Du bist eine Zaubermeisterin!" : "Wunderbar gemacht!",
    text: mitSchatz
      ? `„${aufgabe.titel}“ ist geschafft!${rest}<p class="kiste-hinweis"><b>Tippe auf die Kiste</b> und schau, was drin ist!</p>`
      : naechste === null
        ? `Du hast alle Aufgaben geschafft. Das Einhorn ist mächtig stolz auf dich!${rest}`
        : `Das Einhorn gratuliert dir: Du hast „${aufgabe.titel}“ geschafft!${rest}`,
    knoepfe,
  });
  if (mitSchatz) {
    const kiste = document.querySelector("#dialog-figur .kiste-knopf");
    kiste?.addEventListener("click", () => {
      kiste.innerHTML = KISTE_OFFEN(eis);
      kiste.disabled = true;
      kiste.classList.add("geoeffnet");
      document.querySelector("#dialog-text .kiste-hinweis").innerHTML =
        eis ? "Die Kiste ist voller <b>Muscheln und Perlen</b>! ✨" : "Die Kiste ist voller <b>funkelnder Kristalle</b>! ✨";
    }, { once: true });
  }
  // Funkenregen über dem Spielfeld zur Feier
  for (const farbe of ["#ff6fae", "#ffc93c", "#a970ff", "#3fa9f5"]) funkenregen([3.5, 3.5], farbe, 6);
}

function zeigeMisserfolg() {
  const fehlt = aufgabe.ziele.reduce((summe, z) =>
    summe + (z.typ === "punkte" ? 0 : Math.max(0, z.anzahl - zielStand(z, stand))), 0);
  const knapp = fehlt > 0 && fehlt <= 3 ? " Es hat nur noch ein kleines bisschen gefehlt!" : "";
  zeigeDialog({
    figur: FEE_SVG,
    titel: fehlt > 0 && fehlt <= 3 ? "Ganz knapp!" : "Fast geschafft!",
    text: `Die Fee sagt: „Nicht traurig sein – beim nächsten Mal klappt es bestimmt!${knapp} Probier es gleich nochmal.“` +
      zielListeHtml(true),
    knoepfe: [
      { text: "☰ Menü", klasse: "knopf-zart", aktion: zeigeAufgabenwahl },
      { text: "Nochmal versuchen", aktion: () => starteAufgabe(aufgabeNr) },
    ],
  });
}

// ---------- Schneesturm (Eiswelt, nur in Aufgaben mit sturm: true) ----------
const sturm = { zuegeBis: 0 };
const zuegeBisSturm = (erstes) => (erstes ? 3 : 4) + Math.floor(Math.random() * (erstes ? 3 : 4));   // 3–5, danach 4–7

// Nach einem gültigen Zug: Zähler herunterzählen, bei 0 zieht ein Schneesturm auf.
async function sturmNachZug() {
  if (modus !== "aufgabe" || !aufgabe?.sturm) return;
  sturm.zuegeBis--;
  if (sturm.zuegeBis > 0 || zuegeUebrig <= 1) return;   // im letzten Zug keine Überraschung mehr
  sturm.zuegeBis = zuegeBisSturm(false);
  await schneesturm();
}

async function schneesturm() {
  const anzahl = 3 + Math.floor(Math.random() * 3);     // 3–5 Steine
  zeigeLob("Schneesturm!");
  const flocken = document.createElement("div");
  flocken.className = "sturm";
  for (let i = 0; i < 46; i++) {
    const f = document.createElement("span");
    f.style.left = `${zufall(-5, 100)}%`;
    f.style.setProperty("--wind", `${zufall(10, 40)}%`);
    f.style.animationDelay = `${zufall(0, 0.9).toFixed(2)}s`;
    f.style.fontSize = `${zufall(14, 30).toFixed(0)}px`;
    f.textContent = "❄";
    flocken.append(f);
  }
  effektEbene.append(flocken);
  steineEbene.classList.add("sturm-wackeln");
  await warte(1300);
  const gefroren = friereSteine(feld, anzahl);
  for (const zelle of gefroren) {
    const el = elementBei(zelle);
    zeigeSchutz(el, feld[zelle[0]][zelle[1]]);
    el.classList.add("friert");
    setTimeout(() => el.classList.remove("friert"), 700);
    const { links, oben } = mitte([zelle]);
    effekt("ring", links, oben, { "--farbe": "#9fe0ff", "--gross": "2.5" });
    funkenregen(zelle, "#e8f9ff", 6);
  }
  steineEbene.classList.remove("sturm-wackeln");
  await warte(700);
  flocken.remove();
}

// ---------- Spezialherausforderung: Zahlendieb Drache (nur mutige Piratin, nur Aufgaben) ----------
const drache = { zuegeBis: 0, aufgabe: null, versuche: 3, eingabe: "", erzwungen: false };
const drachenLeiste = document.getElementById("drache-leiste");
const drachenSpiel = () => modus === "aufgabe" && stufe.drache;

function gesperrteZeilen() {
  return feld.map((reihe, z) => (reihe.some((st) => st.gesperrt) ? z : -1)).filter((z) => z >= 0);
}

function setzeDracheZurueck() {
  drache.aufgabe = null;
  drache.versuche = 3;
  drache.eingabe = "";
  drache.erzwungen = false;
  drache.zuegeBis = drachenSpiel() ? zuegeBisDrache(true) : 0;
  aktualisiereDracheLeiste();
}

function aktualisiereDracheLeiste() {
  drachenLeiste.hidden = !drachenSpiel() || !spielAktiv;
  if (drachenLeiste.hidden) return;
  drachenLeiste.classList.toggle("wach", Boolean(drache.aufgabe));
  document.getElementById("drache-text").textContent = drache.aufgabe
    ? `${drache.aufgabe.text} = ?   – tippen zum Rechnen`
    : "Der Drache schläft … noch.";
}

function zeigeSperre(el, gesperrt) {
  el.classList.toggle("gesperrt", gesperrt);
  const vorhanden = el.querySelector(".schloss");
  if (gesperrt && !vorhanden) {
    el.insertAdjacentHTML("beforeend", '<div class="schloss"><svg viewBox="0 0 100 100"><use href="#schloss"/></svg></div>');
  } else if (!gesperrt) {
    vorhanden?.remove();
  }
}

// Sperrt eine zufällige freie Reihe. false, wenn keine mehr frei ist.
function sperreReihe() {
  const frei = [];
  for (let z = 0; z < GROESSE; z++) if (!feld[z].some((st) => st.gesperrt)) frei.push(z);
  if (!frei.length) return false;
  const z = frei[Math.floor(Math.random() * frei.length)];
  feld[z].forEach((stein, s) => {
    stein.gesperrt = true;
    zeigeSperre(elementBei([z, s]), true);
    const { links, oben } = mitte([[z, s]]);
    effekt("ring", links, oben, { "--farbe": "#8a5be0", "--gross": "2" });
  });
  gewaehlt = null;
  return true;
}

// Nach einem gültigen Zug: Zähler herunterzählen, bei 0 erscheint der Drache. true = Dialog ist offen.
async function dracheNachZug() {
  if (!drachenSpiel()) return false;
  if (drache.aufgabe) {
    if (await pruefeFestgefahren()) { zeigeRechnen(true); return true; }
    return false;
  }
  drache.zuegeBis--;
  if (drache.zuegeBis > 0 || zuegeUebrig <= 2) return false;   // kurz vor Schluss lässt der Drache die Spielerin in Ruhe
  return dracheErscheint();
}

// Ohne möglichen Zug (wegen gesperrter Reihen): erst mischen; hilft das nicht, muss gerechnet werden.
async function pruefeFestgefahren() {
  if (!gesperrteZeilen().length || findeMoeglichenZug(feld)) return false;
  await mischeNeu();
  return !findeMoeglichenZug(feld);
}

async function dracheErscheint() {
  if (!sperreReihe()) return false;
  drache.aufgabe = erzeugeRechenaufgabe();
  drache.versuche = 3;
  drache.eingabe = "";
  spielAktiv = false;
  aktualisiereDracheLeiste();
  zeigeLob("Hihi!");
  await warte(700);
  const erzwungen = await pruefeFestgefahren();
  const knoepfe = [{ text: "Rechnen", aktion: () => zeigeRechnen(erzwungen) }];
  if (!erzwungen) knoepfe.unshift({ text: "Später", klasse: "knopf-zart", aktion: setzeSpielFort });
  zeigeDialog({
    figur: DRACHE_SVG,
    titel: "Der freche Zahlendieb Drache!",
    text: "„Hihi! Ich habe eine Reihe gesperrt. Löse meine Rechenaufgabe – dann bekommst du sie zurück!“",
    knoepfe,
  });
  return true;
}

function setzeSpielFort() {
  schliesseBildschirme();
  beschaeftigt = false;
  spielAktiv = true;
  aktualisiereDracheLeiste();
  starteTipp();
}

// --- Rechen-Fenster mit eigenem Ziffernblock (der iPad-Tastaturdialog würde das Spielfeld verdecken)
const rechnenFeld = document.getElementById("rechnen-eingabe");

function zeigeRechnen(erzwungen = false) {
  spielAktiv = false;
  drache.erzwungen = erzwungen;
  drache.eingabe = "";
  document.getElementById("rechnen-spaeter").hidden = erzwungen;
  document.getElementById("rechnen-figur").innerHTML = DRACHE_SVG;
  document.getElementById("rechnen-rueckmeldung").textContent = "";
  zeigeRechenstand();
  zeigeBildschirm("rechnen");
}

function zeigeRechenstand() {
  document.getElementById("rechnen-aufgabe").textContent = `${drache.aufgabe.text} = ?`;
  rechnenFeld.textContent = drache.eingabe || "…";
  rechnenFeld.classList.toggle("leer", !drache.eingabe);
  document.getElementById("rechnen-herzen").innerHTML =
    [0, 1, 2].map((i) => `<span class="herz${i < drache.versuche ? "" : " weg"}">♥</span>`).join("");
}

function rechnenOffen() {
  return !document.getElementById("rechnen").hidden;
}

function tippeZiffer(ziffer) {
  if (!rechnenOffen() || drache.eingabe.length >= 4) return;
  drache.eingabe += ziffer;
  zeigeRechenstand();
}

function loescheZiffer() {
  if (!rechnenOffen()) return;
  drache.eingabe = drache.eingabe.slice(0, -1);
  zeigeRechenstand();
}

async function pruefeAntwort() {
  if (!rechnenOffen() || beschaeftigt) return;
  const zahl = leseAntwort(drache.eingabe);
  if (zahl === null) return;
  if (zahl === drache.aufgabe.antwort) return dracheGeloest();

  drache.versuche--;
  const meldung = document.getElementById("rechnen-rueckmeldung");
  if (drache.versuche > 0) {
    drache.eingabe = "";
    zeigeRechenstand();
    meldung.textContent = drache.versuche === 1 ? "Nicht ganz – letzter Versuch!" : "Nicht ganz – versuch es nochmal!";
    rechnenFeld.classList.remove("falsch");
    void rechnenFeld.offsetWidth;
    rechnenFeld.classList.add("falsch");
    return;
  }
  zeigeRechenstand();
  meldung.textContent = "Oh nein! Der Drache sperrt noch eine Reihe …";
  await warte(1300);
  await dracheSperrtMehr();
}

async function dracheSperrtMehr() {
  beschaeftigt = true;
  schliesseBildschirme();
  if (gesperrteZeilen().length < GROESSE - 3) sperreReihe();   // immer bleiben ein paar Reihen frei
  drache.aufgabe = erzeugeRechenaufgabe();
  drache.versuche = 3;
  drache.eingabe = "";
  aktualisiereDracheLeiste();
  await warte(500);
  const erzwungen = await pruefeFestgefahren();
  beschaeftigt = false;
  if (erzwungen) zeigeRechnen(true);
  else setzeSpielFort();
}

async function dracheGeloest() {
  beschaeftigt = true;
  schliesseBildschirme();
  for (const z of gesperrteZeilen()) {
    feld[z].forEach((stein, s) => {
      stein.gesperrt = false;
      zeigeSperre(elementBei([z, s]), false);
      funkenregen([z, s], "#ffc93c", 6);
    });
  }
  drache.aufgabe = null;
  drache.zuegeBis = zuegeBisDrache(false);
  aktualisiereDracheLeiste();
  zeigeLob("Befreit!");
  await warte(600);
  await loeseTrefferAuf();            // freie Steine können sich jetzt zu Reihen fügen
  if (pruefeAufgabenEnde()) return;
  beschaeftigt = false;
  setzeSpielFort();
}

const ziffernBlock = document.getElementById("ziffern");
for (const taste of ["1", "2", "3", "4", "5", "6", "7", "8", "9", "⌫", "0", "OK"]) {
  const knopf = document.createElement("button");
  knopf.type = "button";
  knopf.className = "taste" + (taste === "OK" ? " taste-ok" : "");
  knopf.textContent = taste;
  knopf.addEventListener("click", () => {
    if (taste === "⌫") loescheZiffer();
    else if (taste === "OK") pruefeAntwort();
    else tippeZiffer(taste);
  });
  ziffernBlock.append(knopf);
}
document.addEventListener("keydown", (event) => {
  if (!rechnenOffen()) return;
  if (/^\d$/.test(event.key)) tippeZiffer(event.key);
  else if (event.key === "Backspace") loescheZiffer();
  else if (event.key === "Enter") pruefeAntwort();
});
document.getElementById("rechnen-spaeter").addEventListener("click", setzeSpielFort);
drachenLeiste.addEventListener("click", () => {
  if (drache.aufgabe && spielAktiv && !beschaeftigt) zeigeRechnen(false);
});

// ---------- Knöpfe ----------
function laeuftEinSpiel() {
  return modus === "endlos" ? punkte > 0 : (aufgabe && zuegeUebrig < aufgabe.zuege && spielAktiv);
}

neuesSpielKnopf.addEventListener("click", () => {
  if (beschaeftigt) return;
  if (modus === "endlos") {
    if (punkte > 0 && !confirm("Neues Spiel starten? Die Punkte gehen verloren.")) return;
    starteEndlos();
  } else {
    if (laeuftEinSpiel() && !confirm("Die Aufgabe nochmal von vorne beginnen?")) return;
    starteAufgabe(aufgabeNr);
  }
});

document.getElementById("menue-knopf").addEventListener("click", () => {
  if (beschaeftigt) return;
  if (laeuftEinSpiel() && !confirm("Zurück zum Menü? Das laufende Spiel wird beendet.")) return;
  zeigeMenue();
});

document.getElementById("start-endlos").addEventListener("click", starteEndlos);
document.getElementById("start-aufgaben").addEventListener("click", () => zeigeAufgabenwahl());
document.getElementById("wahl-zurueck").addEventListener("click", () => zeigeMenue());

setzeStufe(ladeStufe(), false);
zeigePunkte();
baueSpielfeld(erzeugeFeld(GROESSE, ARTEN));   // Feld im Hintergrund des Menüs
zeigeMenue();

// Für automatische Tests
window.zauberei = {
  get feld() { return feld; }, get beschaeftigt() { return beschaeftigt; }, get punkte() { return punkte; },
  get stand() { return stand; }, get zuege() { return zuegeUebrig; }, get spielAktiv() { return spielAktiv; },
  starteAufgabe, starteEndlos, setzeStufe, get welt() { return welt; }, sturm, schneesturm,
  setzeFeld(f) { feld = f; baueFeldNeu(); aktualisiereLeuchten(); }, drache, dracheErscheint, gesperrteZeilen,
  get groesse() { return GROESSE; },
};

// ---------- Offline-Unterstützung & Updates ----------
// Neue Versionen werden beim Öffnen und bei jeder Rückkehr in die App gesucht.
// Ist eine neue Version bereit, lädt das Spiel sie sofort (wenn noch nicht gespielt wird)
// oder zeigt einen Hinweis zum Antippen – so gehen keine Punkte verloren.
function zeigeUpdateHinweis() {
  if (punkte === 0 && !beschaeftigt) {
    location.reload();
    return;
  }
  if (document.getElementById("update-hinweis")) return;
  const knopf = document.createElement("button");
  knopf.id = "update-hinweis";
  knopf.type = "button";
  knopf.textContent = "✨ Neue Version – hier tippen";
  knopf.addEventListener("click", () => location.reload());
  document.body.append(knopf);
}

if ("serviceWorker" in navigator) {
  let hatteSteuerung = Boolean(navigator.serviceWorker.controller);
  navigator.serviceWorker.addEventListener("controllerchange", () => {
    if (!hatteSteuerung) {          // allererster Start: nichts zu aktualisieren
      hatteSteuerung = true;
      return;
    }
    zeigeUpdateHinweis();
  });

  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").then((registrierung) => {
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "visible") registrierung.update().catch(() => {});
      });
    }).catch((fehler) => {
      console.warn("Offline-Modus nicht verfügbar:", fehler);
    });
  });
}
