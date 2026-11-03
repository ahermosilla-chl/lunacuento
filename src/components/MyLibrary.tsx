"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import type { Dict, Lang } from "@/lib/i18n";
import { DRAWING_LIST } from "@/lib/drawings";
import { useHydrated } from "@/lib/device-store";
import { continueList, toggleFavorite, useLibraryData } from "@/lib/library";
import { composeSVG } from "@/lib/paint";
import { usePaintings } from "@/lib/paint-store";
import { getStory, type Story } from "@/lib/stories";
import { fmt } from "@/lib/text";
import CoverArt from "./CoverArt";
import { IconBook, IconHeart } from "./icons";

function Card({ lang, story, href, note, action }: { lang: Lang; story: Story; href: string; note?: string; action?: ReactNode }) {
  return (
    <li className="lib-item">
      <Link href={href} className="resume" style={{ "--c": story.color } as React.CSSProperties}>
        <span className="resume-art" aria-hidden="true"><CoverArt story={story} /></span>
        <span className="resume-body"><b>{story.title[lang]}</b>{note ? <small>{note}</small> : null}</span>
      </Link>
      {action}
    </li>
  );
}

/** Mi biblioteca: lo que sigues leyendo, favoritos, leídos y tus dibujos. Todo vive en este dispositivo. */
export default function MyLibrary({ lang, t }: { lang: Lang; t: Dict }) {
  const hydrated = useHydrated();
  const data = useLibraryData();
  const paintings = usePaintings();
  const L = t.library;

  if (!hydrated) {
    return (
      <div className="wrap lib" aria-busy="true">
        <h1 className="section-title">{L.title}</h1>
        <p className="sr-only" role="status">{L.loading}</p>
        <div className="skeletons" aria-hidden="true"><i /><i /><i /></div>
      </div>
    );
  }

  const exists = (s: Story | undefined): s is Story => Boolean(s);
  const cont = continueList(data).map((c) => ({ ...c, story: getStory(c.id) })).filter((c) => exists(c.story));
  const favs = data.favs.map(getStory).filter(exists);
  const read = data.read.map(getStory).filter(exists);
  const drawings = DRAWING_LIST.filter((d) => paintings[d.id]);
  const nothing = !cont.length && !favs.length && !read.length && !drawings.length;

  return (
    <div className="wrap lib">
      <h1 className="section-title">{L.title}</h1>
      <p className="lib-privacy">{L.privacy}</p>

      {nothing ? (
        <div className="empty-state">
          <span className="empty-ico" aria-hidden="true"><IconBook size={56} /></span>
          <h2>{L.emptyTitle}</h2>
          <p>{L.emptyText}</p>
          <Link href={`/${lang}/cuentos`} className="btn btn-violet btn-lg">{L.cta}</Link>
        </div>
      ) : null}

      {cont.length ? (
        <section aria-labelledby="lib-cont">
          <h2 id="lib-cont">{L.continue}</h2>
          <ul className="lib-list">
            {cont.map(({ id, story, progress }) => (
              <Card key={id} lang={lang} story={story!} href={`/${lang}/cuento/${id}?p=${progress.page}`} note={fmt(t.continue.page, { a: progress.page + 1, b: progress.total })} />
            ))}
          </ul>
        </section>
      ) : null}

      {favs.length ? (
        <section aria-labelledby="lib-favs">
          <h2 id="lib-favs">{L.favs}</h2>
          <ul className="lib-list">
            {favs.map((s) => (
              <Card
                key={s.id}
                lang={lang}
                story={s}
                href={`/${lang}/cuento/${s.id}`}
                action={
                  <button type="button" className="round fav on" aria-pressed="true" aria-label={`${t.reader.favRemove}: ${s.title[lang]}`} onClick={() => toggleFavorite(s.id)}>
                    <IconHeart filled />
                  </button>
                }
              />
            ))}
          </ul>
        </section>
      ) : null}

      {read.length ? (
        <section aria-labelledby="lib-read">
          <h2 id="lib-read">{L.read}</h2>
          <ul className="lib-list">
            {read.map((s) => <Card key={s.id} lang={lang} story={s} href={`/${lang}/cuento/${s.id}`} note={L.again} />)}
          </ul>
        </section>
      ) : null}

      {drawings.length ? (
        <section aria-labelledby="lib-draw">
          <h2 id="lib-draw">{L.drawings}</h2>
          <ul className="thumbs">
            {drawings.map((d) => (
              <li key={d.id}>
                <Link href={`/${lang}/pintar?dibujo=${d.id}`} className="thumb" aria-label={`${L.open}: ${getStory(d.storyId)?.title[lang]}`}>
                  <span className="thumb-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: composeSVG(d.id, paintings[d.id]) }} />
                  <span className="thumb-name">{getStory(d.storyId)?.title[lang]}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
