import { DRAWINGS } from "./art";

/** Estado de un dibujo pintado: color de cada zona (por orden) y trazos de pincel (coordenadas del viewBox 400×300). */
export type Stroke = { id: number; color: string; size: number; d: string };
export type PaintState = { fills: Record<number, string>; strokes: Stroke[] };
export const EMPTY_PAINT: PaintState = { fills: {}, strokes: [] };

export const BRUSH_SIZES = { s: 4, m: 9, l: 16 } as const;
export type BrushSize = keyof typeof BRUSH_SIZES;

const ZONE = /<([a-z]+) class="f"([^>]*?)fill="(#[0-9A-Fa-f]{6})"/g;

/** Dibujo como texto SVG con los colores y trazos aplicados (miniaturas y exportación; no usa el DOM). */
export function composeSVG(id: string, state: PaintState = EMPTY_PAINT, size?: { width: number; height: number }): string {
  let svg = DRAWINGS[id] ?? "";
  let i = 0;
  svg = svg.replace(ZONE, (_m, tag: string, mid: string, orig: string) => `<${tag} class="f" data-i="${i}"${mid}fill="${state.fills[i++] ?? orig}"`);
  if (state.strokes.length) {
    const paths = state.strokes
      .map((s) => `<path d="${s.d}" stroke="${s.color}" stroke-width="${s.size}"/>`)
      .join("");
    svg = svg.replace("</svg>", `<g fill="none" stroke-linecap="round" stroke-linejoin="round">${paths}</g></svg>`);
  }
  if (size) svg = svg.replace("<svg ", `<svg width="${size.width}" height="${size.height}" `);
  return svg;
}

/** Cuántos elementos pintables (clase "f") tiene un dibujo. */
export const zoneCount = (id: string) => (DRAWINGS[id]?.match(/class="f"/g) ?? []).length;

export const isEmptyPaint = (s?: PaintState) => !s || (Object.keys(s.fills).length === 0 && s.strokes.length === 0);
