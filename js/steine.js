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

    <!-- Funkel-Stern für Effekte -->
    <symbol id="funkel" viewBox="0 0 20 20">
      <path d="M10 0 Q11.5 8.5 20 10 Q11.5 11.5 10 20 Q8.5 11.5 0 10 Q8.5 8.5 10 0 Z"/>
    </symbol>
  </defs>
</svg>`;
