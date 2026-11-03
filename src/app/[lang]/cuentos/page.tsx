import type { Metadata } from "next";
import ContinueReading from "@/components/ContinueReading";
import Shelf from "@/components/Shelf";
import { STORIES } from "@/lib/stories";
import Shell from "@/components/Shell";
import { getDict, isLang, type Lang } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(isLang(lang) ? lang : "es");
  return { title: t.nav.stories };
}

export default async function Page({ params }: Props) {
  const { lang: l } = await params;
  const lang: Lang = isLang(l) ? l : "es";
  const t = getDict(lang);
  return (
    <Shell lang={lang}>
      <ContinueReading lang={lang} t={t} />
      <Shelf lang={lang} t={t} stories={STORIES} ageFilter as="h1" />
    </Shell>
  );
}
