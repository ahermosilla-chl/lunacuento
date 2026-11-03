"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { coverInk, SOON_ART } from "@/lib/art";
import type { Dict, Lang } from "@/lib/i18n";
import { COVER_KEY, ilu, type Ilu } from "@/lib/ilustraciones";
import { useLibrary } from "@/lib/purchases";
import type { SoonBook, Story } from "@/lib/stories";
import CoverArt from "./CoverArt";
import { IconLock } from "./icons";

/** Portada con volumen generada (portada-*), a todo el libro; el título va en una banda sólida abajo. */
function CoverImg({ cover }: { cover: Ilu }) {
  // eslint-disable-next-line @next/next/no-img-element
  return <img src={cover.src} srcSet={cover.srcset} sizes="(max-width: 760px) 150px, 168px" width={cover.width} height={cover.height} alt="" loading="lazy" decoding="async" />;
}

/**
 * Libro del estante: disponible (abre el cuento), bloqueado (candado; abre la compra) o "Pronto" (no se abre).
 * ILUSTRACION-PENDIENTE: portadas con volumen (portada-*) cuando se generen.
 */
export default function BookCard({ lang, t, story, soon }: { lang: Lang; t: Dict; story?: Story; soon?: SoonBook }) {
  const unlocked = useLibrary();
  const router = useRouter();
  if (soon) {
    const cover = ilu(COVER_KEY[soon.id]);
    return (
      <div className={`bk soon${cover ? " has-cover" : ""}`} style={{ "--c": soon.color, "--bk-ink": coverInk(soon.color) } as React.CSSProperties} role="img" aria-label={`${t.shelf.soon}: ${soon.title[lang]}`}>
        <span className="ribbon" aria-hidden="true">{t.shelf.soon}</span>
        {cover ? (
          <span className="bk-art" aria-hidden="true"><CoverImg cover={cover} /></span>
        ) : (
          <span className="bk-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: SOON_ART[soon.art] }} />
        )}
        <span className="bk-ttl" aria-hidden="true">
          <b>{soon.title[lang]}</b>
          <small>{soon.age} {t.shelf.ages}</small>
        </span>
      </div>
    );
  }
  if (!story) return null;
  const locked = story.premium && !unlocked;
  const cover = ilu(COVER_KEY[story.id]);
  return (
    <Link
      href={`/${lang}/cuento/${story.id}`}
      data-sound="pop"
      onClick={(e) => {
        // La portada vuela del estante al libro cerrado (no con "reducir movimiento", ni con modificadores, ni si está bloqueado)
        if (locked || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        e.preventDefault();
        const el = e.currentTarget;
        try {
          sessionStorage.setItem("lc_fly", String(Date.now()));
        } catch {
          /* sin sessionStorage: se abre igual, sin vuelo */
        }
        window.dispatchEvent(new CustomEvent("lc:fly", { detail: { node: el, rect: el.getBoundingClientRect() } }));
        router.push(`/${lang}/cuento/${story.id}`);
      }}
      className={`bk${cover ? " has-cover" : ""}`}
      style={{ "--c": story.color, "--bk-ink": coverInk(story.color) } as React.CSSProperties}
      aria-label={`${t.shelf.open}: ${story.title[lang]} · ${story.age} ${t.shelf.ages} · ${story.minutes} ${t.shelf.minutes}${locked ? ` · ${t.buy.lock}` : ""}`}
    >
      {locked ? <span className="lock-on"><IconLock /> {t.buy.tag}</span> : null}
      <span className="bk-art">{cover ? <CoverImg cover={cover} /> : <CoverArt story={story} />}</span>
      <span className="bk-ttl">
        <b>{story.title[lang]}</b>
        <small>{story.age} {t.shelf.ages} · {story.minutes} {t.shelf.minutes}</small>
      </span>
    </Link>
  );
}
