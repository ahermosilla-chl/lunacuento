"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Dict, Lang } from "@/lib/i18n";
import { DEFAULT_NAME } from "@/lib/i18n";
import { useKidName, setKidName, useRawKidName } from "@/lib/name-store";
import { COMING_SOON, FILTERS, STORIES, VALUES, VALUES_SHORT, type ValueKey } from "@/lib/stories";
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

/** Destellos fijos (deterministas) del cielo: x, y en % de la ilustración, tamaño, retraso. */
const SPARKLES: [number, number, number, number][] = [
  [8, 14, 10, 0], [20, 7, 8, 1.4], [33, 20, 7, 2.6], [46, 9, 9, 0.8], [58, 24, 7, 3.2], [66, 6, 8, 2.1], [74, 31, 6, 1.1], [93, 38, 8, 3.7], [14, 33, 6, 2.9], [52, 38, 6, 0.4],
];

/**
 * Hero de escritorio y tablet: "¡Elige un cuento! para {nombre}", filtros y estante de portadas integrados sobre la ilustración.
 * La ilustración vive en una caja centrada de proporción 3:2 y alto fijo (nunca se estira: a la izquierda y a la derecha el cielo
 * continúa con el color de los bordes). Capas de parallax suave (luna, nubes, destellos) con el mouse y el scroll.
 */
export default function HeroStage({ lang, t }: { lang: Lang; t: Dict }) {
  const raw = useRawKidName();
  const name = useKidName(DEFAULT_NAME[lang]);
  const [filter, setFilter] = useState<Filter>("all");
  const match = (values: ValueKey[]) => filter === "all" || values.includes(filter);
  const list = STORIES.filter((s) => match(s.values));
  const soon = COMING_SOON.filter((s) => match(s.values));

  const stage = useRef<HTMLElement>(null);
  const row = useRef<HTMLUListElement>(null);
  const [edge, setEdge] = useState({ prev: false, next: false });
  const updateEdge = useCallback(() => {
    const el = row.current;
    if (!el) return;
    setEdge({ prev: el.scrollLeft > 8, next: el.scrollLeft + el.clientWidth < el.scrollWidth - 8 });
  }, []);
  useEffect(() => {
    updateEdge();
    window.addEventListener("resize", updateEdge);
    return () => window.removeEventListener("resize", updateEdge);
  }, [updateEdge, filter]);
  const scroll = (dir: 1 | -1) => row.current?.scrollBy({ left: dir * 300, behavior: "smooth" });

  // Parallax: el mouse mueve las capas según su profundidad; el scroll las desplaza suavemente. Solo con puntero fino y sin "reducir movimiento".
  useEffect(() => {
    const el = stage.current;
    if (!el || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let mx = 0;
    let my = 0;
    const apply = () => {
      raf = 0;
      const r = el.getBoundingClientRect();
      const sy = Math.max(-1, Math.min(1, -r.top / Math.max(1, r.height)));
      el.style.setProperty("--mx", mx.toFixed(3));
      el.style.setProperty("--my", my.toFixed(3));
      el.style.setProperty("--sy", sy.toFixed(3));
    };
    const queue = () => { if (!raf) raf = requestAnimationFrame(apply); };
    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      const r = el.getBoundingClientRect();
      mx = ((e.clientX - r.left) / r.width - 0.5) * 2;
      my = ((e.clientY - r.top) / r.height - 0.5) * 2;
      queue();
    };
    el.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("scroll", queue, { passive: true });
    queue();
    return () => {
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("scroll", queue);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <section className="hstage" ref={stage} aria-labelledby="stage-title">
      <div className="stage-art" aria-hidden="true">
        <span className="stage-side l" />
        <span className="stage-side r" />
        <div className="stage-pic">
          <div className="pic-img">
            <IlluImg name="hero-inicio" sizes="(min-width: 1400px) 1290px, 100vw" className="stage-img" fallback={<HeroFallback />} />
          </div>
          <span className="px px-moon" />
          <span className="px px-cloud c1" />
          <span className="px px-cloud c2" />
          <span className="px px-cloud c3" />
          <span className="px px-stars">
            {SPARKLES.map(([x, y, s, d]) => (
              <i key={`${x}-${y}`} style={{ left: `${x}%`, top: `${y}%`, width: s, height: s, animationDelay: `${d}s` }} />
            ))}
          </span>
        </div>
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
                {k === "all" ? t.shelf.all : (
                  <>
                    <span className="long">{VALUES[k][lang]}</span>
                    <span className="short" aria-hidden="true">{VALUES_SHORT[k][lang]}</span>
                  </>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="stage-shelf">
          {edge.prev ? <button type="button" className="stage-nav prev" aria-label={t.reader.prevPage} onClick={() => scroll(-1)}><IconPrev size={22} /></button> : null}
          {edge.next ? <button type="button" className="stage-nav next" aria-label={t.reader.nextPage} onClick={() => scroll(1)}><IconNext size={22} /></button> : null}
          <ul className="stage-books" ref={row} onScroll={updateEdge}>
            {[...list.map((s) => ({ s, soon: false })), ...soon.map((s) => ({ s, soon: true }))].map((b, i) => (
              <li key={b.s.id} style={{ "--i": i } as React.CSSProperties}>
                {b.soon ? <BookCard lang={lang} t={t} soon={b.s as (typeof COMING_SOON)[number]} /> : <BookCard lang={lang} t={t} story={b.s as (typeof STORIES)[number]} />}
              </li>
            ))}
          </ul>
          {list.length + soon.length === 0 ? <p className="stage-empty">{t.shelf.empty}</p> : null}
          <div className="stage-plank" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
