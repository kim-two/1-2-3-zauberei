// Figuren für die Rückmeldung im Aufgaben-Modus (eigene Zeichnungen):
// Einhorn-Kopf gratuliert bei Erfolg, Fee macht Mut, wenn es nicht geklappt hat.

export const EINHORN_SVG = `
<svg viewBox="0 0 220 220" class="figur einhorn" role="img" aria-label="Einhorn">
  <defs>
    <linearGradient id="v-einhorn-horn" x1="0" y1="1" x2="1" y2="0">
      <stop offset="0" stop-color="#ffb84d"/>
      <stop offset="1" stop-color="#fff1a8"/>
    </linearGradient>
  </defs>
  <!-- Mähne hinten -->
  <g>
    <circle cx="70" cy="78" r="26" fill="#c39bff"/>
    <circle cx="56" cy="110" r="27" fill="#ff9ccf"/>
    <circle cx="60" cy="145" r="25" fill="#8fd3ff"/>
    <circle cx="72" cy="178" r="22" fill="#ffd36e"/>
    <circle cx="44" cy="132" r="16" fill="#c39bff"/>
    <circle cx="50" cy="168" r="14" fill="#ff9ccf"/>
  </g>
  <!-- Ohr -->
  <path d="M90 66 L84 26 L116 52 Z" fill="#fff" stroke="#d6c4ef" stroke-width="4" stroke-linejoin="round"/>
  <path d="M93 58 L89 36 L108 52 Z" fill="#ffc1df"/>
  <!-- Kopf + Schnauze: erst mit Rand, dann ohne Rand darüber (so verschwinden innere Linien) -->
  <g stroke="#d6c4ef" stroke-width="4">
    <ellipse cx="118" cy="98" rx="48" ry="44" fill="#fff"/>
    <ellipse cx="152" cy="130" rx="40" ry="30" fill="#fff"/>
  </g>
  <!-- Hals -->
  <path d="M82 140 Q84 196 120 214 L172 214 Q150 182 156 150 Z" fill="#fff" stroke="#d6c4ef" stroke-width="4" stroke-linejoin="round"/>
  <ellipse cx="118" cy="98" rx="46" ry="42" fill="#fff"/>
  <ellipse cx="152" cy="130" rx="38" ry="28" fill="#fff"/>
  <!-- Horn -->
  <path d="M116 58 L146 6 L136 62 Z" fill="url(#v-einhorn-horn)" stroke="#e39a2d" stroke-width="3" stroke-linejoin="round"/>
  <g stroke="#e39a2d" stroke-width="2.5" stroke-linecap="round" opacity=".7">
    <path d="M122 48 L137 42"/><path d="M127 36 L140 30"/><path d="M132 24 L143 19"/>
  </g>
  <!-- Stirnlocken -->
  <circle cx="102" cy="60" r="12" fill="#ff9ccf"/>
  <circle cx="92" cy="74" r="10" fill="#c39bff"/>
  <circle cx="114" cy="56" r="8" fill="#8fd3ff"/>
  <!-- fröhlich geschlossenes Auge mit Wimpern -->
  <path d="M114 96 Q125 84 136 96" fill="none" stroke="#5a2a82" stroke-width="4.5" stroke-linecap="round"/>
  <g stroke="#5a2a82" stroke-width="3" stroke-linecap="round">
    <path d="M116 92 L111 87"/><path d="M121 88 L118 82"/><path d="M127 87 L127 81"/>
  </g>
  <!-- Wange, Nüstern, Lächeln -->
  <circle cx="132" cy="114" r="10" fill="#ffb3d6" opacity=".75"/>
  <ellipse cx="174" cy="124" rx="3.5" ry="4.5" fill="#c9a6e6"/>
  <path d="M154 142 Q166 152 180 140" fill="none" stroke="#5a2a82" stroke-width="4" stroke-linecap="round"/>
  <!-- Funkeln -->
  <g fill="#ffd94a">
    <path d="M186 40 Q188 50 198 52 Q188 54 186 64 Q184 54 174 52 Q184 50 186 40 Z"/>
    <path d="M30 40 Q31.5 47 38 48 Q31.5 49 30 56 Q28.5 49 22 48 Q28.5 47 30 40 Z"/>
  </g>
</svg>`;

export const FEE_SVG = `
<svg viewBox="0 0 220 240" class="figur fee" role="img" aria-label="Fee">
  <!-- Flügel -->
  <g fill="#d4f0ff" stroke="#8fd3ff" stroke-width="3" opacity=".9">
    <ellipse cx="70" cy="112" rx="42" ry="24" transform="rotate(-30 70 112)"/>
    <ellipse cx="76" cy="150" rx="28" ry="16" transform="rotate(25 76 150)"/>
    <ellipse cx="150" cy="112" rx="42" ry="24" transform="rotate(30 150 112)"/>
    <ellipse cx="144" cy="150" rx="28" ry="16" transform="rotate(-25 144 150)"/>
  </g>
  <!-- Beine -->
  <g stroke="#ffd7bf" stroke-width="8" stroke-linecap="round">
    <path d="M100 200 L97 224"/><path d="M120 200 L123 224"/>
  </g>
  <ellipse cx="95" cy="228" rx="9" ry="5" fill="#e0479a"/>
  <ellipse cx="125" cy="228" rx="9" ry="5" fill="#e0479a"/>
  <!-- Kleid -->
  <path d="M94 118 L126 118 L152 196 Q144 206 136 198 Q128 208 120 198 Q110 208 100 198 Q92 208 84 198 Q76 206 68 196 Z"
    fill="#ff9ccf" stroke="#e0479a" stroke-width="3" stroke-linejoin="round"/>
  <path d="M94 118 L126 118 L122 136 L98 136 Z" fill="#c39bff"/>
  <circle cx="110" cy="160" r="4" fill="#fff"/><circle cx="96" cy="178" r="3" fill="#fff"/><circle cx="126" cy="176" r="3" fill="#fff"/>
  <!-- Arme: links winkt, rechts hält den Zauberstab -->
  <g stroke="#ffd7bf" stroke-width="8" stroke-linecap="round" fill="none">
    <path d="M96 126 Q72 128 58 110"/>
    <path d="M124 126 Q144 124 158 104"/>
  </g>
  <path d="M158 104 L178 64" stroke="#7b3fe4" stroke-width="5" stroke-linecap="round"/>
  <path d="M180 44 L185 57 L199 58 L188 66 L192 80 L180 72 L168 80 L172 66 L161 58 L175 57 Z"
    fill="#ffe14d" stroke="#fff" stroke-width="3" stroke-linejoin="round" paint-order="stroke"/>
  <!-- Kopf -->
  <circle cx="110" cy="84" r="32" fill="#ffe2cf"/>
  <!-- Haare -->
  <path d="M78 86 Q74 50 110 48 Q146 50 142 86 Q138 66 120 62 Q110 74 92 70 Q82 74 78 86 Z" fill="#ffcf5c" stroke="#e7a92a" stroke-width="2.5"/>
  <path d="M78 84 Q70 104 80 116" fill="none" stroke="#ffcf5c" stroke-width="10" stroke-linecap="round"/>
  <path d="M142 84 Q150 104 140 116" fill="none" stroke="#ffcf5c" stroke-width="10" stroke-linecap="round"/>
  <circle cx="110" cy="44" r="13" fill="#ffcf5c" stroke="#e7a92a" stroke-width="2.5"/>
  <!-- Blümchen im Haar -->
  <g fill="#ff9ccf"><circle cx="134" cy="58" r="5"/><circle cx="141" cy="62" r="5"/><circle cx="136" cy="66" r="5"/><circle cx="129" cy="64" r="5"/></g>
  <circle cx="135" cy="62" r="3" fill="#ffd94a"/>
  <!-- Gesicht -->
  <circle cx="99" cy="88" r="4.5" fill="#5a2a82"/><circle cx="121" cy="88" r="4.5" fill="#5a2a82"/>
  <circle cx="100.5" cy="86.5" r="1.5" fill="#fff"/><circle cx="122.5" cy="86.5" r="1.5" fill="#fff"/>
  <circle cx="92" cy="98" r="6" fill="#ffb3c8" opacity=".8"/><circle cx="128" cy="98" r="6" fill="#ffb3c8" opacity=".8"/>
  <path d="M102 100 Q110 107 118 100" fill="none" stroke="#c0446e" stroke-width="3" stroke-linecap="round"/>
  <!-- Funkeln -->
  <g fill="#ffd94a">
    <path d="M40 60 Q41.5 67 48 68 Q41.5 69 40 76 Q38.5 69 32 68 Q38.5 67 40 60 Z"/>
    <path d="M196 120 Q197.5 127 204 128 Q197.5 129 196 136 Q194.5 129 188 128 Q194.5 127 196 120 Z"/>
  </g>
</svg>`;

// Der freche Zahlendieb Drache (Spezialherausforderung der mutigen Piratin)
export const DRACHE_SVG = `
<svg viewBox="0 0 220 220" class="figur drache" role="img" aria-label="Zahlendieb Drache">
  <!-- Flügel -->
  <path d="M40 90 Q8 50 24 20 Q50 40 66 72 Z" fill="#8a5be0" stroke="#5a2fb0" stroke-width="4" stroke-linejoin="round"/>
  <path d="M180 90 Q212 50 196 20 Q170 40 154 72 Z" fill="#8a5be0" stroke="#5a2fb0" stroke-width="4" stroke-linejoin="round"/>
  <!-- Rückenzacken -->
  <g fill="#ffb84d" stroke="#d98a1c" stroke-width="3" stroke-linejoin="round">
    <path d="M90 30 L100 8 L112 32 Z"/><path d="M108 26 L122 4 L132 30 Z"/>
  </g>
  <!-- Hörner -->
  <path d="M62 54 Q50 24 70 10 Q76 34 86 48 Z" fill="#fff1a8" stroke="#d98a1c" stroke-width="3.5" stroke-linejoin="round"/>
  <path d="M158 54 Q170 24 150 10 Q144 34 134 48 Z" fill="#fff1a8" stroke="#d98a1c" stroke-width="3.5" stroke-linejoin="round"/>
  <!-- Kopf -->
  <ellipse cx="110" cy="112" rx="68" ry="62" fill="#5fd07a" stroke="#2f8f48" stroke-width="5"/>
  <ellipse cx="110" cy="138" rx="46" ry="34" fill="#a8ec9c" stroke="#2f8f48" stroke-width="4"/>
  <!-- Nüstern -->
  <ellipse cx="96" cy="128" rx="5" ry="7" fill="#2f8f48"/>
  <ellipse cx="124" cy="128" rx="5" ry="7" fill="#2f8f48"/>
  <!-- Augen: schlau und frech -->
  <g>
    <ellipse cx="80" cy="96" rx="16" ry="18" fill="#fff" stroke="#2f8f48" stroke-width="3"/>
    <ellipse cx="140" cy="96" rx="16" ry="18" fill="#fff" stroke="#2f8f48" stroke-width="3"/>
    <circle cx="86" cy="100" r="8" fill="#3a1f6e"/><circle cx="146" cy="100" r="8" fill="#3a1f6e"/>
    <circle cx="89" cy="96" r="3" fill="#fff"/><circle cx="149" cy="96" r="3" fill="#fff"/>
    <path d="M62 78 L98 88" stroke="#2f8f48" stroke-width="6" stroke-linecap="round"/>
    <path d="M158 78 L122 88" stroke="#2f8f48" stroke-width="6" stroke-linecap="round"/>
  </g>
  <!-- Freches Grinsen mit Zähnchen -->
  <path d="M74 150 Q110 182 146 148" fill="#fff" stroke="#2f8f48" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M88 160 L94 170 L100 163 M120 163 L126 170 L132 160" fill="none" stroke="#2f8f48" stroke-width="2.5" stroke-linejoin="round"/>
  <!-- Gestohlene Zahlen -->
  <g font-family="sans-serif" font-weight="800" fill="#fff" stroke="#5a2fb0" stroke-width="2.5" paint-order="stroke">
    <text x="12" y="182" font-size="26">7</text>
    <text x="178" y="190" font-size="30">×</text>
    <text x="190" y="150" font-size="22">42</text>
  </g>
</svg>`;

// Kleine Köpfe für die Schwierigkeitswahl im Menü
const GESICHT = (haar, extra = "", unten = "") => `
<svg viewBox="0 0 100 100" class="stufen-bild" aria-hidden="true">
  ${unten}
  <circle cx="50" cy="56" r="30" fill="#ffe0c8" stroke="#e0b090" stroke-width="3"/>
  ${haar}
  <circle cx="40" cy="58" r="3.5" fill="#4a2a1a"/><circle cx="60" cy="58" r="3.5" fill="#4a2a1a"/>
  <circle cx="34" cy="66" r="5" fill="#ffb3c4" opacity=".7"/><circle cx="66" cy="66" r="5" fill="#ffb3c4" opacity=".7"/>
  <path d="M42 68 Q50 75 58 68" fill="none" stroke="#4a2a1a" stroke-width="3" stroke-linecap="round"/>
  ${extra}
</svg>`;

export const STUFEN_BILD = {
  // Junge Fee: blonde Zöpfe, Krönchen, Flügel
  fee: GESICHT(
    `<path d="M20 56 Q20 24 50 22 Q80 24 80 56 Q70 40 50 40 Q30 40 20 56Z" fill="#ffd36e"/><circle cx="20" cy="70" r="9" fill="#ffd36e"/><circle cx="80" cy="70" r="9" fill="#ffd36e"/>`,
    `<path d="M36 26 L40 14 L45 22 L50 10 L55 22 L60 14 L64 26 Z" fill="#ffe14d" stroke="#d99a00" stroke-width="2" stroke-linejoin="round"/>`,
    `<path d="M20 60 Q0 30 14 14 Q30 28 34 54Z" fill="#cfeaff" stroke="#8cc4f0" stroke-width="2.5"/><path d="M80 60 Q100 30 86 14 Q70 28 66 54Z" fill="#cfeaff" stroke="#8cc4f0" stroke-width="2.5"/>`),
  // Flinke Entdeckerin: braune Haare, Hut
  entdeckerin: GESICHT(
    `<path d="M20 62 Q18 28 50 26 Q82 28 80 62 Q72 44 50 44 Q28 44 20 62Z" fill="#8a5232"/>`,
    `<ellipse cx="50" cy="32" rx="38" ry="8" fill="#d9a35a" stroke="#a8742c" stroke-width="2.5"/><path d="M30 32 Q32 8 50 8 Q68 8 70 32Z" fill="#e8b96c" stroke="#a8742c" stroke-width="2.5"/><rect x="31" y="24" width="38" height="6" fill="#c0392b"/>`),
  // Mutige Piratin: rotes Kopftuch, Augenklappe, Ohrring
  piratin: GESICHT(
    `<path d="M20 60 Q16 30 50 28 Q84 30 80 60 Q70 46 50 46 Q30 46 20 60Z" fill="#5a2a1a"/>`,
    `<path d="M18 44 Q22 18 50 16 Q78 18 82 44 Q50 34 18 44Z" fill="#e0334a" stroke="#a8182c" stroke-width="2.5"/><circle cx="40" cy="28" r="2.5" fill="#fff"/><circle cx="58" cy="24" r="2.5" fill="#fff"/><circle cx="70" cy="34" r="2.5" fill="#fff"/><circle cx="60" cy="58" r="7" fill="#2a1a2a"/><path d="M60 51 L84 34" stroke="#2a1a2a" stroke-width="2"/><circle cx="78" cy="74" r="4" fill="none" stroke="#ffc93c" stroke-width="2.5"/>`),
};
