"use client";

import { useRef, useState } from "react";
import type { Dict, Lang } from "@/lib/i18n";
import { DEFAULT_NAME } from "@/lib/i18n";
import { useKidName, setKidName, useRawKidName } from "@/lib/name-store";
import { COMING_SOON, FILTERS, STORIES, VALUES, type ValueKey } from "@/lib/stories";
import BookCard from "./BookCard";
import IlluImg from "./IlluImg";
import { IconNext, IconPrev } from "./icons";

type Filter = "all" | ValueKey;

/** Fondo mientras no exista hero-inicio.webp: cielo violeta con luna (ILUSTRACION-PENDIENTE: hero definitivo, gpt-image-2). */
function HeroFallback() {
  return (
    <svg className="stage-fallback" viewBox="0 0 1536 1024" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
      <rect width="1536" height="1024" fill="#6D5BFF" />
      <circle cx="1180" cy="230" r="120" fill="#FFE08A" />
      <path d="M0 760 Q380 640 760 740 T1536 700 V1024 H0Z" fill="#00C2AB" opacity=".85" />
      <path d="M0 860 Q420 780 820 850 T1536 830 V1024 H0Z" fill="#2D2877" opacity=".5" />
    </svg>
  );
}

/**
 * Hero de escritorio y tablet: "¡Elige un cuento! para {nombre}", filtros y estante de portadas
 * integrados sobre la ilustración (el cielo central despejado queda para el título).
 */
export default function HeroStage({ lang, t }: { lang: Lang; t: Dict }) {
  const raw = useRawKidName();
  const name = useKidName(DEFAULT_NAME[lang]);
  const [filter, setFilter] = useState<Filter>("all");
  const row = useRef<HTMLUListElement>(null);
  const scroll = (dir: 1 | -1) => row.current?.scrollBy({ left: dir * 300, behavior: "smooth" });
  const match = (values: ValueKey[]) => filter === "all" || values.includes(filter);
  const list = STORIES.filter((s) => match(s.values));
  const soon = COMING_SOON.filter((s) => match(s.values));

  return (
    <section className="stage" aria-labelledby="stage-title">
      <div className="stage-art" aria-hidden="true">
        <IlluImg name="hero-inicio" sizes="100vw" className="stage-img" fallback={<HeroFallback />} />
      </div>
      <div className="wrap stage-body">
        <div className="stage-head">
          <h1 id="stage-title">{t.shelf.title}</h1>
          <label className="stage-for" htmlFor="kid-name">
            <span>{t.shelf.forLabel}</span>
            <input
              id="kid-name"
              type="text"
              autoComplete="off"
              autoCapitalize="words"
              spellCheck={false}
              maxLength={18}
              placeholder={DEFAULT_NAME[lang]}
              value={raw}
              onChange={(e) => setKidName(e.target.value)}
              aria-label={t.hero.nameLabel}
              size={Math.max(6, (raw || name).length + 1)}
            />
          </label>
          <div className="chips stage-chips" role="group" aria-label={t.shelf.filters}>
            {(["all", ...FILTERS] as Filter[]).map((k) => (
              <button key={k} type="button" className="chip" aria-pressed={filter === k} onClick={() => setFilter(k)}>
                {k === "all" ? t.shelf.all : VALUES[k][lang]}
              </button>
            ))}
          </div>
        </div>

        <div className="stage-shelf">
          <button type="button" className="stage-nav prev" aria-label={t.reader.prevPage} onClick={() => scroll(-1)}><IconPrev size={22} /></button>
          <button type="button" className="stage-nav next" aria-label={t.reader.nextPage} onClick={() => scroll(1)}><IconNext size={22} /></button>
          <ul className="stage-books" ref={row}>
            {list.map((s) => <li key={s.id}><BookCard lang={lang} t={t} story={s} /></li>)}
            {soon.map((s) => <li key={s.id}><BookCard lang={lang} t={t} soon={s} /></li>)}
          </ul>
          {list.length + soon.length === 0 ? <p className="stage-empty">{t.shelf.empty}</p> : null}
          <div className="stage-plank" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
