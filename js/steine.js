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
