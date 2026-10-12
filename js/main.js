// Einstiegspunkt des Spiels: Darstellung, Touch-Steuerung und Effekte.
// Die Versionsnummer muss mit CACHE_VERSION in sw.js übereinstimmen.
const VERSION = "0.6.1";

import {
  erzeugeFeld, setzeMinLaenge, findeMoeglichenZug, sindNachbarn, tausche, mische,
  berechneAufloesung, findeAlleTreffer, berechnePunkte, wendeAufloesungAn,
} from "./board.js";
import { STEINE, SVG_DEFS } from "./steine.js";
import { SCHWIERIGKEITEN, REIHENFOLGE, STANDARD, schluessel } from "./schwierigkeit.js";
import {
  AUFGABEN, aufgabeFuerStufe, zielText, zielStand, istGeschafft, leererStand, addiereStand, erzeugeAufgabenFeld,
} from "./aufgaben.js";
import { EINHORN_SVG, FEE_SVG, DRACHE_SVG, STUFEN_BILD } from "./figuren.js";
import { erzeugeRechenaufgabe, leseAntwort, zuegeBisDrache } from "./herausforderungen.js";

// ---------- Einstellungen ----------
let GROESSE = 8;                     // Kantenlänge – hängt von der Schwierigkeit ab (setzeStufe)
const ARTEN = STEINE.length;
const TIPP_NACH_MS = 6000;           // nach so langer Pause zeigt das Spiel einen möglichen Zug
const LOB_KETTE = ["Toll!", "Super!", "Fantastisch!", "Zauberhaft!"]; // 2., 3., 4., 5.+ Kettenreaktion
const REKORD_BASIS = "zauberei-rekord";
const FORTSCHRITT_BASIS = "zauberei-aufgaben";       // Liste der geschafften Aufgaben
const STUFE_SCHLUESSEL = "zauberei-stufe";           // zuletzt gewählte Schwierigkeit
const rekordSchluessel = () => schluessel(REKORD_BASIS, stufe.id);
const fortschrittSchluessel = () => schluessel(FORTSCHRITT_BASIS, stufe.id);

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
  el.className = "stein";
  el.innerHTML =
    `<div class="bild"><svg viewBox="0 0 100 100" role="img" aria-label="${STEINE[stein.art].name}">` +
    `<use href="#stein-${stein.art}"/></svg></div>`;
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
  if (stein.schutz >= 3) teile.push("huelle");
  teile.push(stein.schutz >= 2 ? "ranken-2" : "ranken-1");
  ebene.innerHTML = teile.map((t) => `<svg viewBox="0 0 100 100"><use href="#${t}"/></svg>`).join("");
}

// Legt den Zauberstab über den Stein. Die Farbe des Steins bleibt erhalten.
function zeigeAlsStab(el, stein) {
  if (el.classList.contains("stab")) return;
  el.classList.add("stab");
  el.style.setProperty("--farbe", STEINE[stein.art].farbe);
  el.insertAdjacentHTML("afterbegin", '<div class="aura"></div>');
  el.insertAdjacentHTML("beforeend",
    '<svg class="stab-symbol" viewBox="0 0 100 100" aria-label="Zauberstab"><use href="#zauberstab"/></svg>');
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
  for (const zeile of feld) {
    for (const stein of zeile) {
      const el = elemente.get(stein.id);
      if (!el) continue;
      el.classList.toggle("ziel-leuchten", arten.has(stein.art) || (gefangene && stein.schutz > 0));
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

// Lichtstrahl über die ganze Reihe, ausgehend vom Zauberstab
function strahl([z, s], farbe) {
  const el = document.createElement("div");
  el.className = "strahl";
  el.style.top = `${(z / GROESSE) * 100}%`;
  el.style.transformOrigin = `${((s + 0.5) / GROESSE) * 100}% 50%`;
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
    if (!gruppen.length) break;

    const aufloesung = berechneAufloesung(feld, gruppen, kette === 1 ? bevorzugt : []);
    const { entfernen, geschwaecht, neueStaebe, ausgeloest } = aufloesung;
    const wertung = berechnePunkte(gruppen, aufloesung, kette);
    const farbeBei = ([z, s]) => STEINE[feld[z][s].art].farbe;

    // Punkte-Popups für Gruppen und Stab-Reihen
    const laengste = Math.max(...gruppen.map((g) => g.zellen.length));
    const inGruppe = new Set(gruppen.flatMap((g) => g.zellen.map((z) => z.join(","))));
    gruppen.forEach((g, i) => {
      const { links, oben } = mitte(g.zellen);
      effekt("punkte-popup", links, oben, { "--farbe": STEINE[g.art].farbe }, `+${wertung.proGruppe[i]}`);
    });
    for (const zelle of ausgeloest) strahl(zelle, farbeBei(zelle));
    for (const { zeile, punkte: p } of wertung.proReihe) {
      const stab = ausgeloest.find(([z]) => z === zeile);
      const { links, oben } = mitte([[zeile, 3.5]]);
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
      funkenregen(zelle, stein.schutz >= 3 ? "#a99bbf" : "#4cc96b", 8);
      return { stein, el, zelle };
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

    if (ausgeloest.length) zeigeLob("Zauberei!");
    else if (neueStaebe.length) zeigeLob("Zauberstab!");
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
    if (statistik.befreit && modus === "aufgabe") zeigeLob("Befreit!");
    addierePunkte(wertung.gesamt);
    if (modus === "aufgabe") {
      addiereStand(stand, statistik, wertung.gesamt);
      zeigeAufgabenStand(true);
    }
    await lasseFallen();
    aktualisiereLeuchten();
  }

  if (!findeMoeglichenZug(feld)) await mischeNeu();
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
    feld = erzeugeFeld(GROESSE, ARTEN);
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

// Vom Drachen gesperrte Steine wackeln nur kurz – sie lassen sich nicht benutzen.
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
  if (feld[a[0]][a[1]].gesperrt || feld[b[0]][b[1]].gesperrt) {
    waehleAb();
    wackleGesperrt(...[a, b].filter(([z, s]) => feld[z][s].gesperrt));
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

  if (findeAlleTreffer(feld).length === 0) {
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
  if (feld[zelle[0]][zelle[1]].gesperrt) {
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

async function starteAufgabe(nr) {
  modus = "aufgabe";
  aufgabeNr = nr;
  aufgabe = aufgabeFuerStufe(AUFGABEN[nr], stufe);
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
function zielIcon(ziel) {
  switch (ziel.typ) {
    case "sammeln":
      return `<svg viewBox="0 0 100 100"><use href="#stein-${ziel.art}"/></svg>`;
    case "befreien":
      return `<svg viewBox="0 0 100 100"><use href="#stein-0" opacity=".55"/><use href="#ranken-2"/></svg>`;
    case "staebe":
      return `<svg viewBox="0 0 100 100"><use href="#zauberstab"/></svg>`;
    case "punkte":
      return `<svg viewBox="0 0 100 100"><use href="#stein-1"/></svg>`;
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

function ladeGeschafft() {
  try {
    return new Set(JSON.parse(localStorage.getItem(fortschrittSchluessel()) || "[]"));
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
  setzeDracheZurueck();
  zeigeStufenwahl();
  zeigeBildschirm("menue");
}

function zeigeAufgabenwahl() {
  const geschafft = ladeGeschafft();
  const liste = document.getElementById("aufgaben-liste");
  liste.innerHTML = "";
  AUFGABEN.forEach((auf, nr) => {
    // Freigeschaltet: Aufgabe 1 und jede Aufgabe nach einer geschafften
    const frei = nr === 0 || geschafft.has(nr - 1) || geschafft.has(nr);
    const knopf = document.createElement("button");
    knopf.type = "button";
    knopf.className = "aufgabe-eintrag" + (geschafft.has(nr) ? " geschafft" : "") + (frei ? "" : " gesperrt");
    knopf.innerHTML =
      `<span class="aufgabe-nummer">${geschafft.has(nr) ? "✓" : frei ? nr + 1 : "🔒"}</span>` +
      `<span class="aufgabe-info"><span class="aufgabe-name">${auf.titel}</span>` +
      `<span class="aufgabe-icons">${auf.ziele.map(zielIcon).join("")}</span></span>`;
    if (frei) knopf.addEventListener("click", () => starteAufgabe(nr));
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
    return `<div class="ziel-zeile">${zielIcon(ziel)}<span>${zielText(ziel)}${extra}</span></div>`;
  }).join("")}</div>`;
}

function zeigeAufgabeVor() {
  const hinweis = aufgabe.ziele.some((z) => z.typ === "befreien")
    ? "<p>Triff die gefangenen Steine oder ihre Nachbarn, bis die Ranken weg sind!</p>" : "";
  zeigeDialog({
    titel: `Aufgabe ${aufgabeNr + 1}: ${aufgabe.titel}`,
    text: `${zielListeHtml(false)}${hinweis}<p>Du hast <b>${aufgabe.zuege} Züge</b>.</p>`,
    knoepfe: [
      { text: "← Zurück", klasse: "knopf-zart", aktion: zeigeAufgabenwahl },
      { text: "Los geht's!", aktion: () => { schliesseBildschirme(); spielAktiv = true; aktualisiereDracheLeiste(); starteTipp(); } },
    ],
  });
}

function zeigeErfolg() {
  const naechste = aufgabeNr + 1 < AUFGABEN.length ? aufgabeNr + 1 : null;
  const knoepfe = [{ text: "☰ Menü", klasse: "knopf-zart", aktion: zeigeAufgabenwahl }];
  if (naechste !== null) knoepfe.push({ text: "Nächste Aufgabe →", aktion: () => starteAufgabe(naechste) });
  else knoepfe.push({ text: "Nochmal", aktion: () => starteAufgabe(aufgabeNr) });
  const rest = zuegeUebrig > 0 ? ` Und du hattest sogar noch <b>${zuegeUebrig} ${zuegeUebrig === 1 ? "Zug" : "Züge"}</b> übrig!` : "";
  zeigeDialog({
    figur: EINHORN_SVG,
    titel: naechste === null ? "Du bist eine Zaubermeisterin!" : "Wunderbar gemacht!",
    text: naechste === null
      ? `Du hast alle Aufgaben geschafft. Das Einhorn ist mächtig stolz auf dich!${rest}`
      : `Das Einhorn gratuliert dir: Du hast „${aufgabe.titel}“ geschafft!${rest}`,
    knoepfe,
  });
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
document.getElementById("start-aufgaben").addEventListener("click", zeigeAufgabenwahl);
document.getElementById("wahl-zurueck").addEventListener("click", zeigeMenue);

setzeStufe(ladeStufe(), false);
zeigePunkte();
baueSpielfeld(erzeugeFeld(GROESSE, ARTEN));   // Feld im Hintergrund des Menüs
zeigeMenue();

// Für automatische Tests
window.zauberei = {
  get feld() { return feld; }, get beschaeftigt() { return beschaeftigt; }, get punkte() { return punkte; },
  get stand() { return stand; }, get zuege() { return zuegeUebrig; }, get spielAktiv() { return spielAktiv; },
  starteAufgabe, starteEndlos, setzeStufe, drache, dracheErscheint, gesperrteZeilen,
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
