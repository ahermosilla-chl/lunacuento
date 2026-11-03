"use client";

import Link from "next/link";
import { useState } from "react";
import { coverInk, sceneSVG, SOON_ART } from "@/lib/art";
import type { Dict, Lang } from "@/lib/i18n";
import { DEFAULT_NAME } from "@/lib/i18n";
import { useKidName } from "@/lib/name-store";
import { COMING_SOON, FILTERS, VALUES, VALUES_SHORT, type Story, type ValueKey } from "@/lib/stories";
import { fmt } from "@/lib/text";
import { IconLock } from "./icons";

type Filter = "all" | ValueKey;

/** Tapa de un cuento: ilustración de su página de portada (o la imagen definitiva si ya existe). */
function CoverArt({ story }: { story: Story }) {
  const page = story.pages[story.coverPage] ?? story.pages[0];
  if (page.image) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={page.image.src} alt="" width={page.image.width} height={page.image.height} loading="lazy" />;
  }
  return <span style={{ display: "contents" }} dangerouslySetInnerHTML={{ __html: sceneSVG(page.scene, `cover-${story.id}`) }} />;
}

export default function Shelf({ lang, t, stories, unlocked }: { lang: Lang; t: Dict; stories: Story[]; unlocked?: boolean }) {
  const [filter, setFilter] = useState<Filter>("all");
  const name = useKidName(DEFAULT_NAME[lang]);
  const match = (values: ValueKey[]) => filter === "all" || values.includes(filter);
  const list = stories.filter((s) => match(s.values));
  const soon = COMING_SOON.filter((s) => match(s.values));

  return (
    <section id="cuentos" className="section shelf" aria-labelledby="shelf-title">
      <div className="wrap">
        <div className="shelf-head">
          <h2 id="shelf-title" className="section-title">
            {t.shelf.title}
            <span className="for">{fmt(t.shelf.forName, { n: name })}</span>
          </h2>
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

        <div className="shelf-grid">
          {list.map((s) => {
            const ink = coverInk(s.color);
            const locked = s.premium && !unlocked;
            return (
              <Link
                key={s.id}
                href={`/${lang}/cuento/${s.id}`}
                className="bk"
                style={{ "--c": s.color, "--bk-ink": ink } as React.CSSProperties}
                aria-label={`${t.shelf.open}: ${s.title[lang]} · ${s.age} ${t.shelf.ages} · ${s.minutes} ${t.shelf.minutes}${locked ? ` · ${t.reader.lockedTitle}` : ""}`}
              >
                {locked ? <span className="lock-on"><IconLock /> {t.plans.items.full.name}</span> : null}
                <span className="bk-art"><CoverArt story={s} /></span>
                <span className="bk-ttl">
                  <b>{s.title[lang]}</b>
                  <small>{s.age} {t.shelf.ages} · {s.minutes} {t.shelf.minutes}</small>
                </span>
              </Link>
            );
          })}
          {soon.map((s) => (
            <div key={s.id} className="bk soon" style={{ "--c": s.color, "--bk-ink": coverInk(s.color) } as React.CSSProperties} role="img" aria-label={`${t.shelf.soon}: ${s.title[lang]}`}>
              <span className="ribbon" aria-hidden="true">{t.shelf.soon}</span>
              <span className="bk-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SOON_ART[s.art] }} />
              <span className="bk-ttl" aria-hidden="true">
                <b>{s.title[lang]}</b>
                <small>{s.age} {t.shelf.ages}</small>
              </span>
            </div>
          ))}
          {list.length + soon.length === 0 ? <p className="shelf-empty">{t.shelf.empty}</p> : null}
          <div className="shelf-aside">
            <p>{t.shelf.weekly}</p>
            <p>{t.shelf.note}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
