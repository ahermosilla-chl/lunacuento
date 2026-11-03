"use client";

import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import { availableDrawings, drawingTitle, isPremiumDrawing, paintKey } from "@/lib/drawings";
import { usePaintings } from "@/lib/paint-store";
import { useLibrary } from "@/lib/purchases";
import DrawingThumb from "./DrawingThumb";
import { IconLock } from "./icons";

/** Borde de nubes (festón) para separar el inicio de "¡A pintar!": 12 arcos de 120 px. */
const CLOUDS = `M0 0 H1440 V34 ${Array.from({ length: 12 }, () => "a60 34 0 0 1 -120 0").join(" ")} Z`;

/** Máximo de tarjetas en el inicio; el resto se ve en el taller ("Ir al taller"). */
const MAX_TARJETAS = 6;

/** Home: miniaturas de los dibujos (con lo que ya pintaste) y acceso al taller. */
export default function PaintTeaser({ lang, t }: { lang: Lang; t: Dict }) {
  const owned = useLibrary();
  const saved = usePaintings();
  return (
    <section id="pintar" className="section coloring" aria-labelledby="color-title">
      <svg className="wave" aria-hidden="true" focusable="false" viewBox="0 0 1440 70" preserveAspectRatio="none">
        <path d={CLOUDS} />
      </svg>
      <div className="wrap">
        <div className="teaser-head">
          <h2 id="color-title" className="section-title">{t.coloring.title}</h2>
          <Link href={`/${lang}/pintar`} className="btn btn-violet">{t.coloring.go}</Link>
        </div>
        <ul className="thumbs teaser">
          {availableDrawings().slice(0, MAX_TARJETAS).map((d) => {
            const locked = isPremiumDrawing(d) && !owned;
            const title = drawingTitle(d, lang);
            return (
              <li key={d.id}>
                <Link href={locked ? `/${lang}/comprar` : `/${lang}/pintar?dibujo=${d.id}`} className="thumb" aria-label={`${title}${locked ? ` · ${t.coloring.locked}` : ""}`}>
                  <span className="thumb-art" aria-hidden="true"><DrawingThumb d={d} state={saved[paintKey(d)]} /></span>
                  <span className="thumb-name">{locked ? <IconLock size={16} /> : null}{title}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
      <svg className="hills-out" aria-hidden="true" focusable="false" viewBox="0 0 1440 120" preserveAspectRatio="none">
        <path d="M0 120 V74 Q180 14 400 58 T820 46 T1200 62 T1440 40 V120 Z" />
      </svg>
    </section>
  );
}
