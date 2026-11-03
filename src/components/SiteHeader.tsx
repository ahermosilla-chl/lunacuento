"use client";

import Link from "next/link";
import { useState } from "react";
import type { Dict, Lang } from "@/lib/i18n";
import { IconMenu, MoonLogo } from "./icons";
import LangSwitch from "./LangSwitch";
import NativeBar from "./NativeBar";

export default function SiteHeader({ lang, t }: { lang: Lang; t: Dict }) {
  const [open, setOpen] = useState(false);
  const home = `/${lang}`;
  const links = [
    { href: `${home}#cuentos`, label: t.nav.stories },
    { href: `${home}#colorear`, label: t.nav.color },
    { href: `${home}#planes`, label: t.nav.plans },
  ];
  return (
    <>
    <NativeBar lang={lang} t={t} />
    <header className="site-header web-only">
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
        <LangSwitch lang={lang} t={t} />
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
    </>
  );
}
