"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict, Lang } from "@/lib/i18n";

/** Cambia el prefijo de idioma conservando el resto de la ruta y el ancla. */
export function swapLang(pathname: string, to: Lang): string {
  const parts = pathname.split("/");
  parts[1] = to;
  return parts.join("/") || `/${to}`;
}

/** Selector ES / EN: mantiene la ruta actual y recuerda el idioma en este dispositivo. */
export default function LangSwitch({ lang, t }: { lang: Lang; t: Dict }) {
  const pathname = usePathname() || `/${lang}`;
  return (
    <div className="lang-switch" role="group" aria-label={t.nav.lang}>
      {(["es", "en"] as const).map((l) => (
        <Link
          key={l}
          href={swapLang(pathname, l)}
          hrefLang={l}
          lang={l}
          aria-current={l === lang ? "true" : undefined}
          scroll={false}
          onClick={() => {
            try {
              localStorage.setItem("lc_lang", l);
            } catch {
              /* almacenamiento bloqueado */
            }
          }}
        >
          {l.toUpperCase()}
        </Link>
      ))}
    </div>
  );
}
