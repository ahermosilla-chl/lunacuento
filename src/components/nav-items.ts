import type { Dict, Lang } from "@/lib/i18n";

export type NavItem = { key: "home" | "stories" | "paint" | "library"; href: string; label: string; short: string };

/** Navegación principal: Inicio, Cuentos, Pintar, Mi biblioteca. */
export function navItems(lang: Lang, t: Dict): NavItem[] {
  return [
    { key: "home", href: `/${lang}`, label: t.nav.home, short: t.nav.home },
    { key: "stories", href: `/${lang}/cuentos`, label: t.nav.stories, short: t.nav.stories },
    { key: "paint", href: `/${lang}/pintar`, label: t.nav.paint, short: t.nav.paint },
    { key: "library", href: `/${lang}/biblioteca`, label: t.nav.library, short: t.nav.libraryShort },
  ];
}

/** ¿La ruta actual pertenece a este elemento? (las rutas terminan en "/" por trailingSlash) */
export function isActive(pathname: string, item: NavItem): boolean {
  const p = pathname.replace(/\/$/, "");
  return item.key === "home" ? p === item.href : p === item.href || p.startsWith(`${item.href}/`);
}
