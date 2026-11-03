"use client";

import type { Dict, Lang } from "@/lib/i18n";
import { useLibrary } from "@/lib/purchases";
import type { Story } from "@/lib/stories";
import Paywall from "./Paywall";
import Reader from "./Reader";

/** Cuento gratis -> lector. Cuento con candado y sin compra -> pantalla de compra. Al comprar se abre solo. */
export default function StoryEntry({ lang, t, story }: { lang: Lang; t: Dict; story: Story }) {
  const owned = useLibrary();
  if (story.premium && !owned) return <Paywall lang={lang} t={t} story={story} />;
  return <Reader lang={lang} t={t} story={story} />;
}
