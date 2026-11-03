import { composeSVG, type PaintState } from "@/lib/paint";
import { rasterOf, type DrawingMeta } from "@/lib/drawings";

/**
 * Miniatura de un dibujo. Con imagen generada muestra la línea (sin lo pintado); con el SVG de respaldo muestra también lo pintado.
 * ILUSTRACION-PENDIENTE: los dibujos definitivos llegan con scripts/generar-ilustraciones.mjs (colorear-*).
 */
export default function DrawingThumb({ d, state }: { d: DrawingMeta; state?: PaintState }) {
  const r = rasterOf(d);
  if (r) {
    const small = r.srcset?.split(",")[0]?.trim().split(" ")[0] ?? r.src;
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="thumb-img" src={small} srcSet={r.srcset} sizes="(max-width: 640px) 45vw, 210px" alt="" width={r.width} height={r.height} loading="lazy" />;
  }
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: composeSVG(d.id, state) }} />;
}
