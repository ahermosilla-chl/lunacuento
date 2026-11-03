import type { ReactNode } from "react";
import { getDict, type Lang } from "@/lib/i18n";
import BottomNav from "./BottomNav";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

/** Estructura común de las páginas de navegación: header, contenido, pie y barra inferior móvil. */
export default function Shell({ lang, children }: { lang: Lang; children: ReactNode }) {
  const t = getDict(lang);
  return (
    <>
      <SiteHeader lang={lang} t={t} />
      <main id="contenido">{children}</main>
      <SiteFooter lang={lang} t={t} />
      <BottomNav lang={lang} t={t} />
    </>
  );
}
