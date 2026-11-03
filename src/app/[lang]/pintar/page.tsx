import type { Metadata } from "next";
import Paint from "@/components/Paint";
import Shell from "@/components/Shell";
import { getDict, isLang, type Lang } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const t = getDict(isLang(lang) ? lang : "es");
  return { title: t.coloring.studio };
}

export default async function Page({ params }: Props) {
  const { lang: l } = await params;
  const lang: Lang = isLang(l) ? l : "es";
  const t = getDict(lang);
  return (
    <Shell lang={lang}>
      <Paint lang={lang} t={t} />
    </Shell>
  );
}
