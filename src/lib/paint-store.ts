"use client";

import { createDeviceStore } from "./device-store";
import { DRAWINGS } from "./art";
import { DRAWING_LIST } from "./drawings";
import { EMPTY_PAINT, isEmptyPaint, zoneCount, type PaintState, type Stroke } from "./paint";

/** Dibujos pintados guardados en este dispositivo (un solo valor JSON; nada sale del teléfono). */
type Saved = Record<string, PaintState>;
const HEX = /^#[0-9A-Fa-f]{6}$/;
const PATH = /^[ML0-9.\- ]+$/;

function sanitize(v: unknown): Saved {
  const out: Saved = {};
  for (const [id, s] of Object.entries((v ?? {}) as Saved)) {
    const base = id.replace(/:r$/, "");
    const meta = DRAWING_LIST.find((d) => d.id === base);
    if (!meta || !s) continue;
    // SVG: las zonas se numeran por orden; raster: son etiquetas de región (más numerosas, tope amplio)
    const zones = !id.endsWith(":r") && DRAWINGS[base] ? zoneCount(base) : 200000;
    const fills: PaintState["fills"] = {};
    for (const [k, c] of Object.entries(s.fills ?? {})) if (Number(k) >= 0 && Number(k) < zones && HEX.test(c)) fills[Number(k)] = c;
    const strokes: Stroke[] = (Array.isArray(s.strokes) ? s.strokes : [])
      .filter((t) => t && HEX.test(t.color) && PATH.test(t.d) && Number.isFinite(t.size) && Number.isFinite(t.id))
      .slice(0, 400);
    const next = { fills, strokes };
    if (!isEmptyPaint(next)) out[id] = next;
  }
  return out;
}

const store = createDeviceStore<Saved>("lc_paint", {}, sanitize);

export const usePaintings = store.use;
export const getPainting = (id: string): PaintState => store.get()[id] ?? EMPTY_PAINT;

export function savePainting(id: string, state: PaintState) {
  store.update((d) => {
    const next = { ...d };
    if (isEmptyPaint(state)) delete next[id];
    else next[id] = state;
    return next;
  });
}
