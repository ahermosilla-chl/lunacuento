import type { Metadata } from "next";
import { notFound } from "next/navigation";
import StoryEntry from "@/components/StoryEntry";
import { getDict, isLang, LANGS, type Lang } from "@/lib/i18n";
import { getStory, personalize, STORIES } from "@/lib/stories";

type Props = { params: Promise<{ lang: string; id: string }> };

export function generateStaticParams() {
  return LANGS.flatMap((lang) => STORIES.map((s) => ({ lang, id: s.id })));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, id } = await params;
  const story = getStory(id);
  if (!story || !isLang(lang)) return {};
  return { title: story.title[lang], description: personalize(story.blurb[lang], lang === "es" ? "tu peque" : "your little one") };
}

export default async function StoryPage({ params }: Props) {
  const { lang: l, id } = await params;
  const story = getStory(id);
  if (!story || !isLang(l)) notFound();
  const lang: Lang = l;
  return <StoryEntry lang={lang} t={getDict(lang)} story={story} />;
}
