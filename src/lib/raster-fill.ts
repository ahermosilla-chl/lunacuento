/**
 * Relleno por píxeles para dibujos de línea (raster).
 * 1) Las líneas oscuras son barrera; se engruesan 2 px para tapar fugas pequeñas (huecos de hasta ~4 px).
 * 2) Las zonas cerradas se etiquetan una vez (componentes conexos de 4 vecinos).
 * 3) Las etiquetas se extienden bajo las líneas para que no quede un halo blanco entre el color y el trazo.
 * Un color se guarda por etiqueta (estable para la misma imagen), no como bitmap.
 */
export type Regions = { w: number; h: number; labels: Int32Array; count: number };

const DARK = 140; // luminosidad (0–255) bajo la cual un píxel es "línea"

export function analyze(rgba: Uint8ClampedArray, w: number, h: number): Regions {
  const n = w * h;
  const line = new Uint8Array(n);
  for (let i = 0; i < n; i++) {
    const o = i * 4;
    const lum = rgba[o] * 0.299 + rgba[o + 1] * 0.587 + rgba[o + 2] * 0.114;
    line[i] = rgba[o + 3] > 40 && lum < DARK ? 1 : 0;
  }
  // engrosar 2 px (dos pasadas en cruz) para cerrar huecos de hasta ~4 px en las líneas
  let wall = line;
  for (let pass = 0; pass < 2; pass++) {
    const next = wall.slice();
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const i = y * w + x;
        if (!wall[i]) continue;
        if (x > 0) next[i - 1] = 1;
        if (x < w - 1) next[i + 1] = 1;
        if (y > 0) next[i - w] = 1;
        if (y < h - 1) next[i + w] = 1;
      }
    }
    wall = next;
  }

  const labels = new Int32Array(n); // 0 = sin zona (línea)
  let count = 0;
  const stack = new Int32Array(n);
  for (let s = 0; s < n; s++) {
    if (wall[s] || labels[s]) continue;
    count++;
    let sp = 0;
    stack[sp++] = s;
    labels[s] = count;
    while (sp) {
      const i = stack[--sp];
      const x = i % w;
      if (x > 0 && !wall[i - 1] && !labels[i - 1]) { labels[i - 1] = count; stack[sp++] = i - 1; }
      if (x < w - 1 && !wall[i + 1] && !labels[i + 1]) { labels[i + 1] = count; stack[sp++] = i + 1; }
      if (i >= w && !wall[i - w] && !labels[i - w]) { labels[i - w] = count; stack[sp++] = i - w; }
      if (i < n - w && !wall[i + w] && !labels[i + w]) { labels[i + w] = count; stack[sp++] = i + w; }
    }
  }

  // extender las zonas bajo las líneas (hasta ~8 px) para que el color llegue al trazo
  let frontier: number[] = [];
  for (let i = 0; i < n; i++) if (labels[i]) frontier.push(i);
  for (let pass = 0; pass < 8 && frontier.length; pass++) {
    const next: number[] = [];
    for (const i of frontier) {
      const x = i % w;
      const l = labels[i];
      const tryAt = (j: number) => { if (!labels[j] && line[j] + wall[j] > 0) { labels[j] = l; next.push(j); } };
      if (x > 0) tryAt(i - 1);
      if (x < w - 1) tryAt(i + 1);
      if (i >= w) tryAt(i - w);
      if (i < n - w) tryAt(i + w);
    }
    frontier = next;
  }
  return { w, h, labels, count };
}

const hexToAbgr = (hex: string) => {
  const v = parseInt(hex.slice(1), 16);
  return (0xff000000 | ((v & 0xff) << 16) | (v & 0xff00) | ((v >> 16) & 0xff)) >>> 0;
};

/** Capa de color: blanco con cada zona pintada de su color (la línea se dibuja encima con "multiply"). */
export function colorLayer(r: Regions, fills: Record<number, string>): ImageData {
  const data = new Uint32Array(r.w * r.h).fill(0xffffffff);
  const table = new Map<number, number>();
  for (const [k, c] of Object.entries(fills)) table.set(Number(k), hexToAbgr(c));
  if (table.size) for (let i = 0; i < data.length; i++) { const c = table.get(r.labels[i]); if (c !== undefined) data[i] = c; }
  return new ImageData(new Uint8ClampedArray(data.buffer), r.w, r.h);
}

/** Zona bajo el punto (x, y) en píxeles de la imagen, o 0 si es una línea o queda fuera. */
export function regionAt(r: Regions, x: number, y: number): number {
  const px = Math.floor(x);
  const py = Math.floor(y);
  return px < 0 || py < 0 || px >= r.w || py >= r.h ? 0 : r.labels[py * r.w + px];
}
