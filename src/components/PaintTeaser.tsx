"use client";

import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import { DRAWING_LIST } from "@/lib/drawings";
import { usePaintings } from "@/lib/paint-store";
import { composeSVG } from "@/lib/paint";
import { useLibrary } from "@/lib/purchases";
import { getStory } from "@/lib/stories";
import { IconLock } from "./icons";

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
        <ul className="thumbs">
          {DRAWING_LIST.map((d) => {
            const story = getStory(d.storyId);
            const locked = Boolean(story?.premium) && !owned;
            return (
              <li key={d.id}>
                <Link href={locked ? `/${lang}/comprar` : `/${lang}/pintar?dibujo=${d.id}`} className="thumb" aria-label={`${story?.title[lang]}${locked ? ` · ${t.coloring.locked}` : ""}`}>
                  {/* ILUSTRACION-PENDIENTE: dibujos definitivos para colorear (línea limpia, fase 3). Hoy: SVG provisorio. */}
                  <span className="thumb-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: composeSVG(d.id, saved[d.id]) }} />
                  <span className="thumb-name">{locked ? <IconLock size={16} /> : null}{story?.title[lang]}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
