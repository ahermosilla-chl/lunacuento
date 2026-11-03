"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Dict, Lang } from "@/lib/i18n";
import { IconMenu, MoonLogo } from "./icons";

/** Cambia el prefijo de idioma conservando el resto de la ruta y el ancla. */
export function swapLang(pathname: string, to: Lang): string {
  const parts = pathname.split("/");
  parts[1] = to;
  return parts.join("/") || `/${to}`;
}

export default function SiteHeader({ lang, t }: { lang: Lang; t: Dict }) {
  const pathname = usePathname() || `/${lang}`;
  const [open, setOpen] = useState(false);
  const home = `/${lang}`;
  const links = [
    { href: `${home}#cuentos`, label: t.nav.stories },
    { href: `${home}#colorear`, label: t.nav.color },
    { href: `${home}#planes`, label: t.nav.plans },
  ];
  return (
    <header className="site-header">
      <a className="skip" href="#contenido">{t.nav.skip}</a>
      <div className="wrap bar">
        <Link href={home} className="logo" aria-label={`Lunacuento · ${t.nav.home}`}>
          <MoonLogo />
          <span>Lunacuento</span>
        </Link>
        <nav className="navlinks" aria-label={t.nav.menu}>
          {links.map((l) => (
            <a key={l.href} href={l.href}>{l.label}</a>
          ))}
        </nav>
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
        <a href={`${home}#planes`} className="btn btn-ghost-moon acct">{t.nav.app}</a>
        <button type="button" className="menu-btn" aria-label={t.nav.menu} aria-expanded={open} aria-controls="menu-movil" onClick={() => setOpen((v) => !v)}>
          <IconMenu />
        </button>
      </div>
      <nav id="menu-movil" className="menu-panel" data-open={open} aria-label={t.nav.menu}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
      </nav>
    </header>
  );
}
