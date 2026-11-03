"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict, Lang } from "@/lib/i18n";
import { isActive, navItems } from "./nav-items";

/** Navegación horizontal (escritorio y tablet) del header web y de la barra de la app. */
export default function MainNav({ lang, t }: { lang: Lang; t: Dict }) {
  const pathname = usePathname() || `/${lang}`;
  return (
    <nav className="navlinks" aria-label={t.nav.menu}>
      {navItems(lang, t).map((i) => (
        <Link key={i.key} href={i.href} aria-current={isActive(pathname, i) ? "page" : undefined}>{i.label}</Link>
      ))}
    </nav>
  );
}
