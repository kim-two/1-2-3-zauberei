// Einstiegspunkt des Spiels: Darstellung, Touch-Steuerung und Effekte.
// Die Versionsnummer muss mit CACHE_VERSION in sw.js übereinstimmen.
const VERSION = "0.2.0";

import {
  erzeugeFeld, findeTreffer, findeMoeglichenZug, sindNachbarn,
  tausche, entferneUndFuelle, mische,
} from "./board.js";
import { STEINE, SVG_DEFS } from "./steine.js";

// ---------- Einstellungen ----------
const GROESSE = 8;
const ARTEN = STEINE.length;
const TIPP_NACH_MS = 6000;           // nach so langer Pause zeigt das Spiel einen möglichen Zug
const PUNKTE_PRO_STEIN = 10;
const BONUS = { 4: 20, 5: 50 };      // Extrapunkte für Vierer- und Fünferreihen
const LOB_KETTE = ["Toll!", "Super!", "Fantastisch!", "Zauberhaft!"]; // 2., 3., 4., 5.+ Kettenreaktion
const REKORD_SCHLUESSEL = "zauberei-rekord";

// ---------- Elemente ----------
document.body.insertAdjacentHTML("afterbegin", SVG_DEFS);
const steineEbene = document.getElementById("steine");
const effektEbene = document.getElementById("effekte");
const lobEbene = document.getElementById("lob");
const punkteAnzeige = document.getElementById("punkte");
const rekordAnzeige = document.getElementById("rekord");
document.getElementById("version").textContent = VERSION;

// ---------- Zustand ----------
let feld = [];
let punkte = 0;
let rekord = ladeRekord();
let beschaeftigt = false;            // während Animationen keine Eingaben
let gewaehlt = null;                 // [zeile, spalte] des angetippten Steins
let tippTimer = null;
const elemente = new Map();          // Stein-ID -> DOM-Element

const warte = (ms) => new Promise((r) => setTimeout(r, ms));
const zufall = (min, max) => min + Math.random() * (max - min);

// ---------- Punkte & Rekord ----------
function ladeRekord() {
  try {
    return Number(localStorage.getItem(REKORD_SCHLUESSEL)) || 0;
  } catch {
    return 0;
  }
}

function speichereRekord() {
  try {
    localStorage.setItem(REKORD_SCHLUESSEL, String(rekord));
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
  return el;
}

function elementBei([z, s]) {
  return elemente.get(feld[z][s].id);
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

function zeigeLob(text) {
  lobEbene.innerHTML = "";
  const el = document.createElement("div");
  el.className = "text";
  el.textContent = text;
  lobEbene.append(el);
  el.addEventListener("animationend", () => el.remove(), { once: true });
}

// ---------- Spielablauf ----------
async function loeseTrefferAuf() {
  let kette = 1;
  for (;;) {
    const gruppen = findeTreffer(feld);
    if (!gruppen.length) break;

    // Zellen sammeln (eine Zelle kann in zwei Gruppen liegen, z. B. bei L-Formen)
    const zellenMap = new Map();
    let gewinn = 0;
    let laengste = 0;
    for (const g of gruppen) {
      const n = g.zellen.length;
      laengste = Math.max(laengste, n);
      const gruppenPunkte = (n * PUNKTE_PRO_STEIN + (BONUS[Math.min(n, 5)] || 0)) * kette;
      gewinn += gruppenPunkte;
      const farbe = STEINE[g.art].farbe;
      const { links, oben } = mitte(g.zellen);
      effekt("punkte-popup", links, oben, { "--farbe": farbe }, `+${gruppenPunkte}`);
      for (const zelle of g.zellen) zellenMap.set(zelle.join(","), { zelle, farbe, gross: n >= 4 });
    }

    for (const { zelle, farbe, gross } of zellenMap.values()) {
      const { links, oben } = mitte([zelle]);
      effekt("ring", links, oben, { "--farbe": farbe, "--gross": gross ? "3" : "2" });
      funkenregen(zelle, farbe, gross ? 10 : 7);
      elementBei(zelle).classList.add("verschwindet");
    }

    if (kette >= 2) zeigeLob(LOB_KETTE[Math.min(kette - 2, LOB_KETTE.length - 1)]);
    else if (laengste >= 5) zeigeLob("Wunderbar!");
    else if (laengste === 4) zeigeLob("Klasse!");

    await warte(400);
    const zellen = [...zellenMap.values()].map((x) => x.zelle);
    for (const zelle of zellen) {
      const stein = feld[zelle[0]][zelle[1]];
      elemente.get(stein.id).remove();
      elemente.delete(stein.id);
    }
    entferneUndFuelle(feld, zellen, ARTEN);
    addierePunkte(gewinn);
    await lasseFallen();
    kette++;
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
  } else {
    feld = erzeugeFeld(GROESSE, ARTEN);
    baueFeldNeu();
  }
  await warte(320);
  for (const el of elemente.values()) el.classList.remove("mischen");
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

async function versucheTausch(a, b) {
  beschaeftigt = true;
  stoppeTipp();
  waehleAb();

  const elA = elementBei(a);
  const elB = elementBei(b);
  tausche(feld, a, b);
  setzePosition(elA, b[0], b[1]);
  setzePosition(elB, a[0], a[1]);
  await warte(220);

  if (findeTreffer(feld).length === 0) {
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
    await loeseTrefferAuf();
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
  tippTimer = setTimeout(() => {
    const zug = findeMoeglichenZug(feld);
    if (zug && !beschaeftigt) zug.forEach((z) => elementBei(z).classList.add("tipp"));
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
  if (beschaeftigt || geste) return;
  const zelle = zelleAus(event);
  if (!zelle) return;
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
async function starteSpiel() {
  beschaeftigt = true;
  stoppeTipp();
  gewaehlt = null;
  steineEbene.innerHTML = "";
  effektEbene.innerHTML = "";
  elemente.clear();
  punkte = 0;
  zeigePunkte();

  feld = erzeugeFeld(GROESSE, ARTEN);
  // Zum Start regnen alle Steine von oben herein
  for (let z = 0; z < GROESSE; z++) {
    for (let s = 0; s < GROESSE; s++) feld[z][s].startZeile = z - GROESSE;
  }
  await lasseFallen();
  beschaeftigt = false;
  starteTipp();
}

document.getElementById("neues-spiel").addEventListener("click", () => {
  if (beschaeftigt) return;
  if (punkte > 0 && !confirm("Neues Spiel starten? Die Punkte gehen verloren.")) return;
  starteSpiel();
});

zeigePunkte();
starteSpiel();

// Für automatische Tests
window.zauberei = { get feld() { return feld; }, get beschaeftigt() { return beschaeftigt; }, get punkte() { return punkte; } };

// ---------- Offline-Unterstützung ----------
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("sw.js").catch((fehler) => {
      console.warn("Offline-Modus nicht verfügbar:", fehler);
    });
  });
}
