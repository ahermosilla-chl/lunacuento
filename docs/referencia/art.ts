import type { Scene } from "./stories";

/**
 * Ilustraciones vectoriales provisorias. Se reemplazan por imágenes de gpt-image-2
 * cuando una página tiene `image`. Todo es determinista (sin Math.random) para que
 * el HTML del servidor y del cliente coincida.
 */
const SKY: Record<Scene["t"], [string, string]> = {
  night: ["#1E2A6E", "#3B4FA8"],
  dusk: ["#5A5BB5", "#FFA07A"],
  day: ["#8FD3FF", "#E9F8FF"],
};

export function sceneSVG(s: Scene, key: string | number): string {
  const id = "s" + String(key).replace(/[^a-z0-9]/gi, "");
  const [c0, c1] = SKY[s.t];
  let seed = (String(key).split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 997) + 7;
  const rnd = () => (seed = (seed * 9301 + 49297) % 233280) / 233280;
  let o = `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs><linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${c0}"/><stop offset="1" stop-color="${c1}"/></linearGradient><radialGradient id="${id}f"><stop offset="0" stop-color="#FFF6B8"/><stop offset=".35" stop-color="#FFC93C" stop-opacity=".85"/><stop offset="1" stop-color="#FFC93C" stop-opacity="0"/></radialGradient></defs><rect width="400" height="300" fill="url(#${id})"/>`;
  if (s.t === "night") {
    for (let i = 0; i < 36; i++) o += `<circle cx="${(rnd() * 400).toFixed(1)}" cy="${(rnd() * 170).toFixed(1)}" r="${(rnd() * 1.4 + 0.5).toFixed(2)}" fill="#FFF8E7" opacity="${(rnd() * 0.6 + 0.35).toFixed(2)}"/>`;
  }
  if (s.t !== "night") {
    o += `<g fill="#FFFFFF" opacity=".85"><ellipse cx="80" cy="60" rx="34" ry="14"/><ellipse cx="104" cy="52" rx="22" ry="14"/><ellipse cx="250" cy="92" rx="28" ry="11"/><ellipse cx="270" cy="86" rx="18" ry="11"/></g>`;
  }
  if (s.moon) o += `<circle cx="315" cy="70" r="50" fill="#FFD966" opacity=".22"/><circle cx="315" cy="70" r="33" fill="#FFE08A"/><circle cx="304" cy="62" r="5" fill="#F2C14E" opacity=".7"/><circle cx="324" cy="80" r="3.5" fill="#F2C14E" opacity=".7"/>`;
  if (s.t === "day") o += `<circle cx="335" cy="58" r="28" fill="#FFD23F"/>`;
  const h1 = s.t === "night" ? "#24467A" : s.t === "dusk" ? "#5E9E6E" : "#7CCB7E";
  const h2 = s.t === "night" ? "#1B3763" : s.t === "dusk" ? "#4A8558" : "#5DB563";
  o += `<path d="M0 225 Q90 180 190 215 T400 200 V300 H0Z" fill="${h1}"/><path d="M0 255 Q120 225 240 250 T400 245 V300 H0Z" fill="${h2}"/>`;
  if (s.hog || s.owl) {
    o += `<rect x="58" y="130" width="14" height="110" rx="5" fill="${s.t === "night" ? "#4A3628" : "#8A5A36"}"/><circle cx="65" cy="120" r="46" fill="${s.t === "night" ? "#2C5E52" : "#4FAE6A"}"/><circle cx="35" cy="140" r="28" fill="${s.t === "night" ? "#244F45" : "#3F9A5A"}"/>`;
  }
  if (s.owl) o += `<ellipse cx="96" cy="152" rx="13" ry="16" fill="#B08A5E"/><circle cx="91" cy="149" r="4.5" fill="#FFE08A"/><circle cx="101" cy="149" r="4.5" fill="#FFE08A"/><circle cx="91" cy="149" r="1.8" fill="#2B2D52"/><circle cx="101" cy="149" r="1.8" fill="#2B2D52"/><path d="M80 166 H112" stroke="#4A3628" stroke-width="4"/>`;
  if (s.win) o += `<rect x="0" y="0" width="400" height="300" fill="none" stroke="#2A2F5E" stroke-width="34"/><path d="M200 0 V300 M0 150 H400" stroke="#2A2F5E" stroke-width="12"/><rect x="18" y="262" width="364" height="20" fill="#C9874E"/>`;
  for (let i = 0; i < (s.ff || 0); i++) {
    const x = 120 + rnd() * 230, y = 110 + rnd() * 120, r = 10 + rnd() * 8;
    o += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${r.toFixed(1)}" fill="url(#${id}f)"/><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.4" fill="#FFF8D0"/>`;
  }
  if (s.hog) {
    const cx = 215, cy = 238;
    let sp = "";
    for (let a = 0; a <= 12; a++) {
      const ang = Math.PI * (1 + a / 12);
      const r1 = a % 2 ? 38 : 50;
      sp += `${(cx + Math.cos(ang) * r1).toFixed(1)},${(cy + Math.sin(ang) * r1 * 0.82).toFixed(1)} `;
    }
    o += `<polygon points="${sp}" fill="#7A4E2D"/><ellipse cx="${cx + 6}" cy="${cy - 4}" rx="40" ry="26" fill="#9C6A43"/><ellipse cx="${cx + 34}" cy="${cy - 2}" rx="18" ry="13" fill="#F2C9A0"/><circle cx="${cx + 50}" cy="${cy - 4}" r="4" fill="#2B1C12"/><circle cx="${cx + 36}" cy="${cy - 9}" r="2.6" fill="#2B1C12"/><circle cx="${cx + 30}" cy="${cy + 2}" r="4" fill="#FF9AA2" opacity=".7"/>`;
  }
  if (s.basket) o += `<path d="M282 240 h44 l-6 26 h-32z" fill="#D9984F"/><path d="M286 240 q18 -26 36 0" stroke="#A86F35" stroke-width="4" fill="none"/><circle cx="292" cy="238" r="5" fill="#5B2A86"/><circle cx="303" cy="235" r="5" fill="#7A3BAE"/><circle cx="314" cy="238" r="5" fill="#5B2A86"/>`;
  if (s.friends) o += `<ellipse cx="120" cy="250" rx="16" ry="20" fill="#E88B4F"/><circle cx="120" cy="226" r="12" fill="#E88B4F"/><path d="M104 248 q-22 -30 2 -48" stroke="#D2733A" stroke-width="10" fill="none" stroke-linecap="round"/><ellipse cx="340" cy="252" rx="16" ry="18" fill="#F4F0E8"/><circle cx="340" cy="230" r="12" fill="#F4F0E8"/><ellipse cx="334" cy="208" rx="4" ry="12" fill="#F4F0E8"/><ellipse cx="346" cy="208" rx="4" ry="12" fill="#F4F0E8"/>`;
  return o + "</svg>";
}

/** Dibujos para colorear: cada forma con clase "f" se puede pintar. */
export const DRAWINGS: Record<string, string> = {
  luna: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><g stroke="#2B2D52" stroke-width="3" stroke-linejoin="round"><rect class="f" x="2" y="2" width="396" height="296" rx="14" fill="#FFFFFF"/><circle class="f" cx="300" cy="80" r="44" fill="#FFFFFF"/><path class="f" d="M70 60 l7 15 16 2 -12 11 3 16 -14 -8 -14 8 3 -16 -12 -11 16 -2z" fill="#FFFFFF"/><path class="f" d="M180 40 l5 10 11 1 -8 8 2 11 -10 -6 -10 6 2 -11 -8 -8 11 -1z" fill="#FFFFFF"/><path class="f" d="M2 220 Q90 175 190 210 T398 195 V298 H2Z" fill="#FFFFFF"/><path class="f" d="M2 255 Q120 222 240 248 T398 242 V298 H2Z" fill="#FFFFFF"/><rect class="f" x="88" y="140" width="18" height="90" rx="6" fill="#FFFFFF"/><circle class="f" cx="97" cy="125" r="42" fill="#FFFFFF"/><circle class="f" cx="250" cy="180" r="13" fill="#FFFFFF"/><ellipse class="f" cx="236" cy="168" rx="11" ry="7" fill="#FFFFFF"/><ellipse class="f" cx="264" cy="168" rx="11" ry="7" fill="#FFFFFF"/></g></svg>`,
  tilo: `<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg"><g stroke="#2B2D52" stroke-width="3" stroke-linejoin="round"><rect class="f" x="2" y="2" width="396" height="296" rx="14" fill="#FFFFFF"/><circle class="f" cx="330" cy="62" r="28" fill="#FFFFFF"/><path class="f" d="M2 230 Q100 200 200 225 T398 215 V298 H2Z" fill="#FFFFFF"/><polygon class="f" points="140,232 146,196 162,214 170,180 184,206 196,176 206,206 220,182 226,214 240,198 244,232" fill="#FFFFFF"/><ellipse class="f" cx="196" cy="236" rx="56" ry="30" fill="#FFFFFF"/><ellipse class="f" cx="246" cy="238" rx="22" ry="16" fill="#FFFFFF"/><circle cx="266" cy="236" r="4" fill="#2B2D52"/><circle cx="250" cy="231" r="3" fill="#2B2D52"/><path class="f" d="M290 236 h50 l-7 30 h-36z" fill="#FFFFFF"/><circle class="f" cx="302" cy="232" r="7" fill="#FFFFFF"/><circle class="f" cx="316" cy="228" r="7" fill="#FFFFFF"/><circle class="f" cx="330" cy="232" r="7" fill="#FFFFFF"/><rect class="f" x="54" y="110" width="20" height="120" rx="6" fill="#FFFFFF"/><circle class="f" cx="64" cy="98" r="48" fill="#FFFFFF"/></g></svg>`,
};
