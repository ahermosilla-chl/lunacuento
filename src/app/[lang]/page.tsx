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
        <div className="moon" aria-hidden="true" />
        <div className="wrap">
          <h2 id="final-title">{t.final.title}</h2>
          <Link href={`/${lang}/cuento/${first.id}`} className="btn btn-sun btn-lg">{t.final.cta}</Link>
        </div>
      </section>
    </Shell>
  );
}
