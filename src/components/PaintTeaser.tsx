"use client";

import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import { availableDrawings, drawingTitle, isPremiumDrawing, paintKey } from "@/lib/drawings";
import { usePaintings } from "@/lib/paint-store";
import { useLibrary } from "@/lib/purchases";
import DrawingThumb from "./DrawingThumb";
import { IconLock } from "./icons";

/** Máximo de tarjetas en el inicio; el resto se ve en el taller ("Ir al taller"). */
const MAX_TARJETAS = 6;

/** Home: miniaturas de los dibujos (con lo que ya pintaste) y acceso al taller. */
export default function PaintTeaser({ lang, t }: { lang: Lang; t: Dict }) {
  const owned = useLibrary();
  const saved = usePaintings();
  return (
    <section id="pintar" className="section coloring" aria-labelledby="color-title">
      <svg className="wave" aria-hidden="true" focusable="false" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d="M0 0 H1440 V20 Q1080 60 720 30 T0 30Z" />
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
    </section>
  );
}
