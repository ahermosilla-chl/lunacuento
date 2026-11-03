import Link from "next/link";
import Coloring from "@/components/Coloring";
import Features from "@/components/Features";
import Hero from "@/components/Hero";
import Plans from "@/components/Plans";
import Shelf from "@/components/Shelf";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { getDict, isLang, type Lang } from "@/lib/i18n";
import { STORIES } from "@/lib/stories";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  const lang: Lang = isLang(l) ? l : "es";
  const t = getDict(lang);
  const first = STORIES.find((s) => !s.premium) ?? STORIES[0];
  return (
    <>
      <SiteHeader lang={lang} t={t} />
      <main id="contenido">
        <Hero lang={lang} t={t} firstStory={first.id} />
        <Shelf lang={lang} t={t} stories={STORIES} />
        <Features t={t} />
        <Coloring lang={lang} t={t} stories={STORIES} />
        <Plans lang={lang} t={t} firstStory={first.id} />
        <section className="final" aria-labelledby="final-title">
          <div className="moon" aria-hidden="true" />
          <div className="wrap">
            <h2 id="final-title">{t.final.title}</h2>
            <Link href={`/${lang}/cuento/${first.id}`} className="btn btn-sun btn-lg">{t.final.cta}</Link>
          </div>
        </section>
      </main>
      <SiteFooter lang={lang} t={t} />
    </>
  );
}
