"use client";

import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import { COMING_SOON, STORIES } from "@/lib/stories";
import BookCard from "./BookCard";

/** Móvil: fila horizontal de portadas (con "Pronto"), para deslizar con el dedo. */
export default function CoverRow({ lang, t }: { lang: Lang; t: Dict }) {
  return (
    <section className="h-section" aria-labelledby="cover-row-title">
      <div className="h-head">
        <h2 id="cover-row-title" className="h-title">{t.shelf.title}</h2>
        <Link href={`/${lang}/cuentos`} className="h-more">{t.mobile.all}</Link>
      </div>
      <ul className="h-row covers">
        {STORIES.map((s) => <li key={s.id}><BookCard lang={lang} t={t} story={s} /></li>)}
        {COMING_SOON.map((s) => <li key={s.id}><BookCard lang={lang} t={t} soon={s} /></li>)}
      </ul>
    </section>
  );
}
