import Link from "next/link";
import ContinueReading from "@/components/ContinueReading";
import HeroStage from "@/components/HeroStage";
import MobileHome from "@/components/MobileHome";
import Novelties from "@/components/Novelties";
import PaintTeaser from "@/components/PaintTeaser";
import Plans from "@/components/Plans";
import Shell from "@/components/Shell";
import { getDict, isLang, type Lang } from "@/lib/i18n";
import { STORIES } from "@/lib/stories";

export default async function Home({ params }: { params: Promise<{ lang: string }> }) {
  const { lang: l } = await params;
  const lang: Lang = isLang(l) ? l : "es";
  const t = getDict(lang);
  const first = STORIES.find((s) => !s.premium) ?? STORIES[0];
  return (
    <Shell lang={lang}>
      <MobileHome lang={lang} t={t} />
      <div className="desk-only">
        <HeroStage lang={lang} t={t} />
        <ContinueReading lang={lang} t={t} />
      </div>
      <Novelties lang={lang} t={t} stories={STORIES} />
      <PaintTeaser lang={lang} t={t} />
      <Plans lang={lang} t={t} firstStory={first.id} />
      <section className="final" aria-labelledby="final-title">
        <svg className="final-hills" aria-hidden="true" focusable="false" viewBox="0 0 1440 90" preserveAspectRatio="none">
          <path d="M0 0 H1440 V38 Q1260 92 1060 52 T640 60 T240 38 T0 66 Z" />
        </svg>
        <div className="wrap">
          <h2 id="final-title">{t.final.title}</h2>
          <Link href={`/${lang}/cuento/${first.id}`} className="btn btn-sun btn-lg">{t.final.cta}</Link>
        </div>
      </section>
    </Shell>
  );
}
