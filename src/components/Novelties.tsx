import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import type { Story } from "@/lib/stories";
import CoverArt from "./CoverArt";

/** "Novedades": solo existe si algún cuento tiene `isNew: true` en stories.ts. Hoy no hay, así que no se muestra. */
export default function Novelties({ lang, t, stories }: { lang: Lang; t: Dict; stories: Story[] }) {
  const fresh = stories.filter((s) => s.isNew);
  if (!fresh.length) return null;
  return (
    <section className="section continue" aria-labelledby="news-title">
      <div className="wrap">
        <h2 id="news-title" className="section-title sm">{t.news.title}</h2>
        <ul className="resume-list">
          {fresh.map((s) => (
            <li key={s.id}>
              <Link href={`/${lang}/cuento/${s.id}`} className="resume" style={{ "--c": s.color } as React.CSSProperties}>
                <span className="resume-art" aria-hidden="true"><CoverArt story={s} /></span>
                <span className="resume-body"><b>{s.title[lang]}</b><small>{t.news.badge}</small></span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
