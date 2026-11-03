"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dict, Lang } from "@/lib/i18n";
import { DEFAULT_NAME } from "@/lib/i18n";
import { useKidName } from "@/lib/name-store";
import { COMING_SOON, FILTERS, VALUES, VALUES_SHORT, type Story, type ValueKey } from "@/lib/stories";
import { fmt } from "@/lib/text";
import BookCard from "./BookCard";

type Filter = "all" | ValueKey;

const AGE_RANGES: [number, number][] = [[0, 3], [4, 5], [6, 7]];

/** "3–6" → [3, 6]; el cuento sirve para el grupo si los rangos se cruzan. */
function ageOverlaps(age: string, [lo, hi]: [number, number]) {
  const [a, b] = age.split("–").map(Number);
  return a <= hi && (b ?? a) >= lo;
}

export default function Shelf({ lang, t, stories, ageFilter, moreHref, as: Heading = "h2" }: { lang: Lang; t: Dict; stories: Story[]; ageFilter?: boolean; moreHref?: string; as?: "h1" | "h2" }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [age, setAge] = useState<number | null>(null);
  const name = useKidName(DEFAULT_NAME[lang]);
  const match = (values: ValueKey[], ageStr: string) =>
    (filter === "all" || values.includes(filter)) && (age === null || ageOverlaps(ageStr, AGE_RANGES[age]));
  const list = stories.filter((s) => match(s.values, s.age));
  const soon = COMING_SOON.filter((s) => match(s.values, s.age));

  return (
    <section id="cuentos" className="section shelf" aria-labelledby="shelf-title">
      <div className="wrap">
        <div className="shelf-head">
          <Heading id="shelf-title" className="section-title">
            {t.shelf.title}
            <span className="for">{fmt(t.shelf.forName, { n: name })}</span>
          </Heading>
          <div className="chips" role="group" aria-label={t.shelf.filters}>
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
        {ageFilter ? (
          <div className="chips ages" role="group" aria-label={t.shelf.ageFilter}>
            {t.shelf.ageGroups.map((label, i) => (
              <button key={label} type="button" className="chip" aria-pressed={age === i} onClick={() => setAge(age === i ? null : i)}>{label}</button>
            ))}
          </div>
        ) : null}

        <div className="shelf-grid">
          {list.map((s) => <BookCard key={s.id} lang={lang} t={t} story={s} />)}
          {soon.map((s) => <BookCard key={s.id} lang={lang} t={t} soon={s} />)}
          {list.length + soon.length === 0 ? <p className="shelf-empty">{t.shelf.empty}</p> : null}
          <div className="shelf-aside in-grid">
            <p>{t.shelf.note}</p>
          </div>
        </div>
        {/* En pantallas chicas el aviso va debajo del estante: dentro de la grilla ocuparía una fila con un tablón vacío. */}
        <div className="shelf-aside below">
          <p>{t.shelf.note}</p>
        </div>
        {moreHref ? (
          <p className="shelf-more"><Link href={moreHref} className="btn btn-line">{t.shelf.more}</Link></p>
        ) : null}
      </div>
    </section>
  );
}
