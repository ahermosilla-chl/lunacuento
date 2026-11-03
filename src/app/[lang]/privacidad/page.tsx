import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";
import { getDict, isLang, type Lang } from "@/lib/i18n";

type Props = { params: Promise<{ lang: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  return { title: getDict(isLang(lang) ? lang : "es").legal.privacy.title };
}

export default async function Page({ params }: Props) {
  const { lang: l } = await params;
  const lang: Lang = isLang(l) ? l : "es";
  return <LegalPage lang={lang} kind="privacy" />;
}
