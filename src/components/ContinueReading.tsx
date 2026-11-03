"use client";

import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import { continueList, useLibraryData } from "@/lib/library";
import { getStory } from "@/lib/stories";
import { fmt } from "@/lib/text";
import CoverArt from "./CoverArt";

/** "Sigue leyendo": solo aparece si hay un cuento empezado y sin terminar en este dispositivo. */
export default function ContinueReading({ lang, t, variant = "list" }: { lang: Lang; t: Dict; variant?: "list" | "row" }) {
  const items = continueList(useLibraryData())
    .map((c) => ({ ...c, story: getStory(c.id) }))
    .filter((c): c is typeof c & { story: NonNullable<typeof c.story> } => Boolean(c.story))
    .slice(0, 3);
  if (!items.length) return null;
  if (variant === "row") {
    return (
      <section className="h-section" aria-labelledby="continue-row-title">
        <div className="h-head"><h2 id="continue-row-title" className="h-title">{t.continue.title}</h2></div>
        <ul className="h-row resumes">
          {items.map(({ id, story, progress }) => (
            <li key={id}>
              <Link href={`/${lang}/cuento/${id}?p=${progress.page}`} className="m-resume" style={{ "--c": story.color } as React.CSSProperties}>
                <span className="m-resume-art" aria-hidden="true"><CoverArt story={story} /></span>
                <span className="m-resume-body">
                  <b>{story.title[lang]}</b>
                  <small>{fmt(t.continue.page, { a: progress.page + 1, b: progress.total })}</small>
                  <span className="meter" aria-hidden="true"><i style={{ width: `${((progress.page + 1) / progress.total) * 100}%` }} /></span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    );
  }
  return (
    <section className="section continue" aria-labelledby="continue-title">
      <div className="wrap">
        <h2 id="continue-title" className="section-title sm">{t.continue.title}</h2>
        <ul className="resume-list">
          {items.map(({ id, story, progress }) => (
            <li key={id}>
              <Link href={`/${lang}/cuento/${id}?p=${progress.page}`} className="resume" style={{ "--c": story.color } as React.CSSProperties}>
                <span className="resume-art" aria-hidden="true"><CoverArt story={story} /></span>
                <span className="resume-body">
                  <b>{story.title[lang]}</b>
                  <small>{fmt(t.continue.page, { a: progress.page + 1, b: progress.total })}</small>
                  <span className="meter" aria-hidden="true"><i style={{ width: `${((progress.page + 1) / progress.total) * 100}%` }} /></span>
                </span>
                <span className="resume-go">{t.continue.resume}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
