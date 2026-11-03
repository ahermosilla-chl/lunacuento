import type { Lang } from "./i18n";

/** Elige "es" o "en" según la lista de idiomas preferidos del navegador (en orden). Por defecto, español. */
export function pickLang(prefs: readonly string[]): Lang {
  for (const tag of prefs) {
    const base = tag.toLowerCase().split(/[-_]/)[0];
    if (base === "es" || base === "en") return base;
  }
  return "es";
}
