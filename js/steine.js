// Die sechs Spielsteine als SVG-Symbole (eigene Zeichnungen).
// Jeder Stein hat eine Hauptfarbe, die auch für die Funkel-Effekte genutzt wird.

export const STEINE = [
  { name: "Kristall",    farbe: "#ff6fae" },
  { name: "Stern",       farbe: "#ffc93c" },
  { name: "Blatt",       farbe: "#4cc96b" },
  { name: "Tropfen",     farbe: "#3fa9f5" },
  { name: "Blume",       farbe: "#a970ff" },
  { name: "Einhorn-Horn", farbe: "#ff9a5a" },
];

// Die sechs Steine der Eiswelt (Symbole eis-0 … eis-5)
export const EIS_STEINE = [
  { name: "Pinguin",       farbe: "#3b5b92" },
  { name: "Eisbär",        farbe: "#8fd0ff" },
  { name: "Robbe",         farbe: "#7f93b5" },
  { name: "Eiskristall",   farbe: "#4fd0ff" },
  { name: "Weihnachtskeks", farbe: "#c98b4a" },
  { name: "Schneemann",    farbe: "#ff7a7a" },
];

const verlauf = (id, hell, dunkel) => `
  <radialGradient id="${id}" cx="35%" cy="30%" r="75%">
    <stop offset="0" stop-color="${hell}"/>
    <stop offset="1" stop-color="${dunkel}"/>
  </radialGradient>`;

// Wird einmal ins Dokument eingefügt; die Steine verweisen per <use href="#stein-N">.
export const SVG_DEFS = `
<svg xmlns="http://www.w3.org/2000/svg" width="0" height="0" style="position:absolute" aria-hidden="true">
  <defs>
    ${verlauf("v-kristall", "#ffd3e8", "#e8338a")}
    ${verlauf("v-stern", "#fff3b0", "#f0a500")}
    ${verlauf("v-blatt", "#c8f7a6", "#22994a")}
    ${verlauf("v-tropfen", "#c9ecff", "#1a7fd6")}
    ${verlauf("v-blume", "#e6d4ff", "#7b3fe4")}
    ${verlauf("v-horn", "#ffe2c4", "#f2702a")}

    <!-- 0: Kristall -->
    <symbol id="stein-0" viewBox="0 0 100 100">
      <polygon points="50,8 84,32 72,88 28,88 16,32" fill="url(#v-kristall)" stroke="#b81e6a" stroke-width="4" stroke-linejoin="round"/>
      <polygon points="50,8 64,34 50,88 36,34" fill="#fff" opacity=".28"/>
      <polyline points="16,32 36,34 64,34 84,32" fill="none" stroke="#b81e6a" stroke-width="2.5" opacity=".5"/>
      <path d="M32 22 L40 18" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
    </symbol>

    <!-- 1: Stern -->
    <symbol id="stein-1" viewBox="0 0 100 100">
      <polygon points="50,7 62,36 93,38 69,58 77,89 50,72 23,89 31,58 7,38 38,36"
        fill="url(#v-stern)" stroke="#c77800" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="40" cy="52" r="4" fill="#7a4a00"/>
      <circle cx="60" cy="52" r="4" fill="#7a4a00"/>
      <path d="M43 62 Q50 68 57 62" fill="none" stroke="#7a4a00" stroke-width="3" stroke-linecap="round"/>
      <path d="M34 34 L42 31" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    </symbol>

    <!-- 2: Blatt -->
    <symbol id="stein-2" viewBox="0 0 100 100">
      <path d="M50 92 C18 74 12 36 50 8 C88 36 82 74 50 92 Z" fill="url(#v-blatt)" stroke="#1a7a3a" stroke-width="4" stroke-linejoin="round"/>
      <path d="M50 88 L50 22 M50 44 L36 34 M50 44 L64 34 M50 62 L34 52 M50 62 L66 52"
        fill="none" stroke="#1a7a3a" stroke-width="3" stroke-linecap="round" opacity=".6"/>
      <path d="M36 28 Q40 22 45 19" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".8"/>
    </symbol>

    <!-- 3: Tropfen (Fluss) -->
    <symbol id="stein-3" viewBox="0 0 100 100">
      <path d="M50 8 C50 8 82 46 82 63 A32 30 0 0 1 18 63 C18 46 50 8 50 8 Z"
        fill="url(#v-tropfen)" stroke="#11609f" stroke-width="4" stroke-linejoin="round"/>
      <ellipse cx="38" cy="58" rx="7" ry="12" fill="#fff" opacity=".7" transform="rotate(20 38 58)"/>
      <path d="M30 76 Q42 82 54 76 T76 76" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".5"/>
    </symbol>

    <!-- 4: Blume (Feen) -->
    <symbol id="stein-4" viewBox="0 0 100 100">
      <g fill="url(#v-blume)" stroke="#5a24b8" stroke-width="3.5">
        <circle cx="50" cy="25" r="18"/>
        <circle cx="74" cy="43" r="18"/>
        <circle cx="65" cy="72" r="18"/>
        <circle cx="35" cy="72" r="18"/>
        <circle cx="26" cy="43" r="18"/>
      </g>
      <circle cx="50" cy="52" r="14" fill="#ffd94a" stroke="#d99a00" stroke-width="3.5"/>
      <circle cx="45" cy="47" r="4" fill="#fff" opacity=".8"/>
    </symbol>

    <!-- 5: Einhorn-Horn -->
    <symbol id="stein-5" viewBox="0 0 100 100">
      <path d="M50 6 L70 86 Q50 96 30 86 Z" fill="url(#v-horn)" stroke="#c4501a" stroke-width="4" stroke-linejoin="round"/>
      <g fill="none" stroke="#c4501a" stroke-width="3" stroke-linecap="round" opacity=".55">
        <path d="M44 30 Q52 28 56 24"/>
        <path d="M39 50 Q52 47 61 40"/>
        <path d="M34 70 Q52 67 66 56"/>
      </g>
      <path d="M45 22 L40 44" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".7"/>
    </symbol>

    <!-- Zauberstab (liegt über dem Stein) -->
    <linearGradient id="v-stab" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7b3fe4"/>
      <stop offset="1" stop-color="#4a1f9e"/>
    </linearGradient>
    <symbol id="zauberstab" viewBox="0 0 100 100">
      <g transform="rotate(40 50 50)">
        <rect x="44" y="34" width="12" height="62" rx="6" fill="url(#v-stab)" stroke="#fff" stroke-width="4"/>
        <rect x="44" y="52" width="12" height="7" fill="#ffd94a"/>
        <rect x="44" y="70" width="12" height="7" fill="#ffd94a"/>
      </g>
      <polygon points="66,4 72,20 89,21 76,32 80,49 66,40 52,49 56,32 43,21 60,20"
        transform="translate(-4 4)" fill="#ffe14d" stroke="#fff" stroke-width="5" stroke-linejoin="round" paint-order="stroke"/>
      <circle cx="56" cy="18" r="3" fill="#fff"/>
    </symbol>

    <!-- Ranken-Gitter (2 Schichten): Rahmen aus Ranken mit dünnem Kreuz, Stein bleibt gut sichtbar -->
    <symbol id="ranken-2" viewBox="0 0 100 100">
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M16 7 Q33 2 50 7 T84 7 Q94 10 93 22 Q98 36 93 50 T93 78 Q92 92 80 93 Q66 98 50 93 T18 93 Q7 91 7 78 Q2 64 7 50 T7 20 Q8 9 16 7 Z" stroke="#2f8a3e" stroke-width="7"/>
        <path d="M16 7 Q33 2 50 7 T84 7 Q94 10 93 22 Q98 36 93 50 T93 78 Q92 92 80 93 Q66 98 50 93 T18 93 Q7 91 7 78 Q2 64 7 50 T7 20 Q8 9 16 7 Z" stroke="#7fdc89" stroke-width="2.5"/>
        <path d="M12 12 Q40 30 50 50 T88 88 M88 12 Q60 30 50 50 T12 88" stroke="#2f8a3e" stroke-width="4"/>
        <path d="M12 12 Q40 30 50 50 T88 88 M88 12 Q60 30 50 50 T12 88" stroke="#7fdc89" stroke-width="1.5"/>
      </g>
      <g fill="#4cc96b" stroke="#2f8a3e" stroke-width="2">
        <ellipse cx="10" cy="10" rx="9" ry="5" transform="rotate(-40 10 10)"/>
        <ellipse cx="90" cy="10" rx="9" ry="5" transform="rotate(40 90 10)"/>
        <ellipse cx="10" cy="90" rx="9" ry="5" transform="rotate(40 10 90)"/>
        <ellipse cx="90" cy="90" rx="9" ry="5" transform="rotate(-40 90 90)"/>
        <ellipse cx="50" cy="5" rx="7" ry="4"/>
        <ellipse cx="50" cy="95" rx="7" ry="4"/>
      </g>
    </symbol>

    <!-- Ranken-Gitter (1 Schicht): Rahmen gerissen, Kreuz weg -->
    <symbol id="ranken-1" viewBox="0 0 100 100">
      <g fill="none" stroke-linecap="round">
        <path d="M7 50 Q2 64 7 78 Q7 91 18 93 Q34 98 50 93" stroke="#2f8a3e" stroke-width="6"/>
        <path d="M7 50 Q2 64 7 78 Q7 91 18 93 Q34 98 50 93" stroke="#7fdc89" stroke-width="2"/>
        <path d="M50 7 Q67 2 84 7 Q94 10 93 22 Q98 36 93 50" stroke="#2f8a3e" stroke-width="6"/>
        <path d="M50 7 Q67 2 84 7 Q94 10 93 22 Q98 36 93 50" stroke="#7fdc89" stroke-width="2"/>
      </g>
      <g fill="#4cc96b" stroke="#2f8a3e" stroke-width="2">
        <ellipse cx="90" cy="10" rx="8" ry="4.5" transform="rotate(40 90 10)"/>
        <ellipse cx="10" cy="90" rx="8" ry="4.5" transform="rotate(40 10 90)"/>
      </g>
    </symbol>

    <!-- Steinhülle (dritte Schicht, liegt unter den Ranken) -->
    <linearGradient id="v-huelle" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ece6f5"/>
      <stop offset="1" stop-color="#a99bbf"/>
    </linearGradient>
    <symbol id="huelle" viewBox="0 0 100 100">
      <path fill-rule="evenodd" fill="url(#v-huelle)" stroke="#7d6f93" stroke-width="3"
        d="M14 3 H86 Q97 3 97 14 V86 Q97 97 86 97 H14 Q3 97 3 86 V14 Q3 3 14 3 Z
           M50 20 A30 30 0 1 0 50.01 20 Z"/>
      <g fill="none" stroke="#7d6f93" stroke-width="2.5" stroke-linecap="round">
        <path d="M3 34 H18"/><path d="M82 34 H97"/><path d="M3 66 H18"/><path d="M82 66 H97"/>
        <path d="M34 3 V16"/><path d="M66 84 V97"/><path d="M30 86 L22 94"/><path d="M76 8 L84 14"/>
      </g>
      <path d="M10 10 L22 10" stroke="#fff" stroke-width="3" stroke-linecap="round" opacity=".8"/>
    </symbol>

    <!-- ===== Eiswelt ===== -->
    <!-- eis-0: Pinguin -->
    <symbol id="eis-0" viewBox="0 0 100 100">
      <ellipse cx="50" cy="56" rx="30" ry="38" fill="#2d3f66" stroke="#1a2542" stroke-width="4"/>
      <ellipse cx="50" cy="64" rx="19" ry="27" fill="#fff"/>
      <circle cx="41" cy="38" r="5.5" fill="#fff"/><circle cx="59" cy="38" r="5.5" fill="#fff"/>
      <circle cx="42" cy="39" r="2.8" fill="#111"/><circle cx="58" cy="39" r="2.8" fill="#111"/>
      <path d="M43 46 L57 46 L50 56 Z" fill="#ff9a2e" stroke="#d9741a" stroke-width="2" stroke-linejoin="round"/>
      <ellipse cx="36" cy="92" rx="10" ry="5" fill="#ff9a2e"/><ellipse cx="64" cy="92" rx="10" ry="5" fill="#ff9a2e"/>
      <path d="M20 58 Q12 72 22 82" fill="none" stroke="#1a2542" stroke-width="6" stroke-linecap="round"/>
      <path d="M80 58 Q88 72 78 82" fill="none" stroke="#1a2542" stroke-width="6" stroke-linecap="round"/>
    </symbol>

    <!-- eis-1: Eisbär -->
    <symbol id="eis-1" viewBox="0 0 100 100">
      <circle cx="24" cy="26" r="12" fill="#f4fbff" stroke="#7fb6d8" stroke-width="4"/>
      <circle cx="76" cy="26" r="12" fill="#f4fbff" stroke="#7fb6d8" stroke-width="4"/>
      <circle cx="24" cy="26" r="5" fill="#ffc3d6"/><circle cx="76" cy="26" r="5" fill="#ffc3d6"/>
      <ellipse cx="50" cy="56" rx="38" ry="35" fill="#f4fbff" stroke="#7fb6d8" stroke-width="4"/>
      <ellipse cx="50" cy="68" rx="18" ry="14" fill="#fff" stroke="#c9e3f2" stroke-width="2.5"/>
      <ellipse cx="50" cy="62" rx="7" ry="5" fill="#2a3446"/>
      <path d="M50 67 V73 M42 74 Q50 80 58 74" fill="none" stroke="#2a3446" stroke-width="3" stroke-linecap="round"/>
      <circle cx="35" cy="48" r="4.5" fill="#2a3446"/><circle cx="65" cy="48" r="4.5" fill="#2a3446"/>
      <circle cx="36.5" cy="46.5" r="1.5" fill="#fff"/><circle cx="66.5" cy="46.5" r="1.5" fill="#fff"/>
    </symbol>

    <!-- eis-2: Robbe -->
    <symbol id="eis-2" viewBox="0 0 100 100">
      <path d="M12 82 Q4 70 14 62 Q10 80 26 84 Z" fill="#6a7fa3" stroke="#46587a" stroke-width="3" stroke-linejoin="round"/>
      <ellipse cx="50" cy="58" rx="36" ry="34" fill="#8da2c4" stroke="#46587a" stroke-width="4"/>
      <ellipse cx="50" cy="70" rx="22" ry="17" fill="#d6e1f2"/>
      <circle cx="36" cy="50" r="6.5" fill="#1f2a40"/><circle cx="64" cy="50" r="6.5" fill="#1f2a40"/>
      <circle cx="38" cy="48" r="2.3" fill="#fff"/><circle cx="66" cy="48" r="2.3" fill="#fff"/>
      <ellipse cx="50" cy="63" rx="6" ry="4.5" fill="#1f2a40"/>
      <g stroke="#46587a" stroke-width="2" stroke-linecap="round" fill="none">
        <path d="M30 68 L14 64"/><path d="M30 73 L14 76"/><path d="M70 68 L86 64"/><path d="M70 73 L86 76"/>
        <path d="M44 72 Q50 78 56 72"/>
      </g>
      <path d="M28 36 Q36 28 46 28" stroke="#fff" stroke-width="4" stroke-linecap="round" fill="none" opacity=".6"/>
    </symbol>

    <!-- eis-3: Eiskristall -->
    <linearGradient id="v-eis" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e8f9ff"/><stop offset="1" stop-color="#4fb8f0"/>
    </linearGradient>
    <symbol id="eis-3" viewBox="0 0 100 100">
      <polygon points="50,6 86,28 86,72 50,94 14,72 14,28" fill="url(#v-eis)" stroke="#2a8fcf" stroke-width="4" stroke-linejoin="round"/>
      <g stroke="#fff" stroke-width="5" stroke-linecap="round" fill="none">
        <path d="M50 18 V82 M22 34 L78 66 M22 66 L78 34"/>
        <path d="M42 24 L50 32 L58 24 M42 76 L50 68 L58 76"/>
      </g>
      <g stroke="#2a8fcf" stroke-width="1.8" stroke-linecap="round" fill="none" opacity=".6">
        <path d="M50 18 V82 M22 34 L78 66 M22 66 L78 34"/>
      </g>
    </symbol>

    <!-- eis-4: Weihnachtskeks (Lebkuchenmann) -->
    <symbol id="eis-4" viewBox="0 0 100 100">
      <path d="M50 10 C64 10 70 22 62 32 L62 36 L86 34 C94 34 94 48 86 50 L66 54 L74 84 C76 94 62 96 58 86 L50 70 L42 86 C38 96 24 94 26 84 L34 54 L14 50 C6 48 6 34 14 34 L38 36 L38 32 C30 22 36 10 50 10 Z"
        fill="#c98b4a" stroke="#8a5424" stroke-width="4" stroke-linejoin="round"/>
      <circle cx="43" cy="21" r="3" fill="#fff"/><circle cx="57" cy="21" r="3" fill="#fff"/>
      <path d="M43 28 Q50 34 57 28" fill="none" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
      <circle cx="50" cy="48" r="4" fill="#e0334a"/><circle cx="50" cy="60" r="4" fill="#3fa36a"/>
      <g stroke="#fff" stroke-width="3" stroke-linecap="round" fill="none">
        <path d="M14 42 H20 M80 42 H86 M30 88 H36 M64 88 H70"/>
      </g>
    </symbol>

    <!-- eis-5: Schneemann -->
    <symbol id="eis-5" viewBox="0 0 100 100">
      <circle cx="50" cy="72" r="24" fill="#fff" stroke="#9cc4de" stroke-width="4"/>
      <circle cx="50" cy="40" r="20" fill="#fff" stroke="#9cc4de" stroke-width="4"/>
      <path d="M32 52 Q50 62 68 52 L66 62 Q50 70 34 62 Z" fill="#e0334a" stroke="#a8182c" stroke-width="2" stroke-linejoin="round"/>
      <rect x="35" y="14" width="30" height="10" rx="3" fill="#2d3f66"/><rect x="29" y="22" width="42" height="6" rx="3" fill="#2d3f66"/>
      <circle cx="43" cy="38" r="2.8" fill="#222"/><circle cx="57" cy="38" r="2.8" fill="#222"/>
      <path d="M50 42 L66 46 L50 48 Z" fill="#ff8a1e" stroke="#d9600a" stroke-width="1.5" stroke-linejoin="round"/>
      <circle cx="50" cy="76" r="3" fill="#2d3f66"/><circle cx="50" cy="86" r="3" fill="#2d3f66"/>
    </symbol>

    <!-- Feuerstab (Eiswelt): löst die ganze Spalte auf -->
    <linearGradient id="v-feuer" x1="0" y1="1" x2="0" y2="0">
      <stop offset="0" stop-color="#ff5a1f"/><stop offset="1" stop-color="#ffd23f"/>
    </linearGradient>
    <symbol id="feuerstab" viewBox="0 0 100 100">
      <g transform="rotate(40 50 50)">
        <rect x="44" y="40" width="12" height="56" rx="6" fill="#6b3a1e" stroke="#fff" stroke-width="4"/>
        <rect x="44" y="58" width="12" height="7" fill="#ffd94a"/>
        <rect x="44" y="76" width="12" height="7" fill="#ffd94a"/>
      </g>
      <path d="M62 4 C74 18 86 24 78 40 C74 48 66 50 62 50 C54 48 48 40 52 30 C54 36 58 36 58 30 C58 20 60 12 62 4 Z"
        transform="translate(-4 2)" fill="url(#v-feuer)" stroke="#fff" stroke-width="4.5" stroke-linejoin="round" paint-order="stroke"/>
      <path d="M60 24 C66 30 68 36 62 42 C58 38 56 32 60 24 Z" transform="translate(-4 2)" fill="#fff6c8"/>
    </symbol>

    <!-- Felsbrocken (Eiswelt): unbeweglich -->
    <linearGradient id="v-fels" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#b9c0cb"/><stop offset="1" stop-color="#5d6676"/>
    </linearGradient>
    <symbol id="felsbrocken" viewBox="0 0 100 100">
      <path d="M8 84 L16 44 L34 20 L58 14 L80 28 L92 56 L88 84 Q50 94 8 84 Z" fill="url(#v-fels)" stroke="#3b4250" stroke-width="4" stroke-linejoin="round"/>
      <path d="M16 44 L34 20 L58 14 L80 28 L70 36 L58 30 L46 38 L34 32 Z" fill="#fff" stroke="#cfe3f2" stroke-width="2" stroke-linejoin="round"/>
      <g stroke="#3b4250" stroke-width="2.5" stroke-linecap="round" fill="none" opacity=".5">
        <path d="M40 52 L52 66 L46 80"/><path d="M68 54 L62 70"/>
      </g>
    </symbol>

    <!-- Eisschicht über einem gefrorenen Stein -->
    <linearGradient id="v-eisschicht" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#e8f9ff" stop-opacity=".85"/><stop offset="1" stop-color="#8fd4ff" stop-opacity=".6"/>
    </linearGradient>
    <symbol id="eisschicht" viewBox="0 0 100 100">
      <rect x="5" y="5" width="90" height="90" rx="16" fill="url(#v-eisschicht)" stroke="#5fb8ee" stroke-width="4"/>
      <g stroke="#fff" stroke-width="3.5" stroke-linecap="round" fill="none" opacity=".9">
        <path d="M16 24 L36 14"/><path d="M70 82 L86 70"/><path d="M20 80 L30 70 L26 62"/>
      </g>
      <g stroke="#5fb8ee" stroke-width="2" stroke-linecap="round" fill="none" opacity=".7">
        <path d="M50 8 L44 28 L56 40 L48 60"/><path d="M92 50 L74 46 L66 56"/>
      </g>
    </symbol>

    <!-- Kokosnuss: Hindernis, nimmt an nichts teil -->
    <radialGradient id="v-kokos" cx="38%" cy="32%" r="75%">
      <stop offset="0" stop-color="#b98254"/>
      <stop offset="1" stop-color="#5e3a1e"/>
    </radialGradient>
    <symbol id="kokosnuss" viewBox="0 0 100 100">
      <circle cx="50" cy="54" r="38" fill="url(#v-kokos)" stroke="#3e2410" stroke-width="4"/>
      <g fill="none" stroke="#3e2410" stroke-width="2" stroke-linecap="round" opacity=".45">
        <path d="M22 40 Q30 36 36 30"/><path d="M18 56 Q28 52 36 46"/><path d="M26 74 Q38 70 46 62"/>
        <path d="M64 28 Q72 30 78 38"/><path d="M70 74 Q78 68 82 58"/>
      </g>
      <circle cx="42" cy="46" r="5" fill="#2a170a"/><circle cx="58" cy="46" r="5" fill="#2a170a"/>
      <ellipse cx="50" cy="60" rx="5" ry="6" fill="#2a170a"/>
      <path d="M30 32 Q36 24 46 22" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".45" fill="none"/>
    </symbol>

    <!-- Schloss + Kette: Stein ist vom Drachen gesperrt -->
    <symbol id="schloss" viewBox="0 0 100 100">
      <path d="M32 46 V34 A18 18 0 0 1 68 34 V46" fill="none" stroke="#7d6f93" stroke-width="9" stroke-linecap="round"/>
      <path d="M32 46 V34 A18 18 0 0 1 68 34 V46" fill="none" stroke="#d9d0e8" stroke-width="3.5" stroke-linecap="round"/>
      <rect x="22" y="44" width="56" height="42" rx="9" fill="#ffc93c" stroke="#b07a00" stroke-width="4"/>
      <circle cx="50" cy="62" r="6" fill="#7a4a00"/>
      <rect x="47" y="64" width="6" height="12" rx="3" fill="#7a4a00"/>
      <path d="M28 50 H44" stroke="#fff" stroke-width="4" stroke-linecap="round" opacity=".7"/>
    </symbol>

    <!-- Funkel-Stern für Effekte -->
    <symbol id="funkel" viewBox="0 0 20 20">
      <path d="M10 0 Q11.5 8.5 20 10 Q11.5 11.5 10 20 Q8.5 11.5 0 10 Q8.5 8.5 10 0 Z"/>
    </symbol>
  </defs>
</svg>`;
