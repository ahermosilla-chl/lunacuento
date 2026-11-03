"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Dict, Lang } from "@/lib/i18n";
import { IconBook, IconHome, IconPalette, IconShelf } from "./icons";
import { isActive, navItems } from "./nav-items";

const ICON = { home: IconHome, stories: IconBook, paint: IconPalette, library: IconShelf };

/** Navegación inferior para móvil: tocar con el pulgar, áreas de 64 px de alto, respeta la zona segura. */
export default function BottomNav({ lang, t }: { lang: Lang; t: Dict }) {
  const pathname = usePathname() || `/${lang}`;
  return (
    <nav className="bottom-nav" aria-label={t.nav.menu}>
      {navItems(lang, t).map((i) => {
        const Icon = ICON[i.key];
        const on = isActive(pathname, i);
        return (
          <Link key={i.key} href={i.href} aria-current={on ? "page" : undefined}>
            <Icon size={26} />
            <span>{i.short}</span>
          </Link>
        );
      })}
    </nav>
  );
}
