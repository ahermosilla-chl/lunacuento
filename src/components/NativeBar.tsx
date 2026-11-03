import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import { MoonLogo } from "./icons";
import LangSwitch from "./LangSwitch";

/**
 * Barra mínima de la app nativa: logo y selector ES/EN. Reemplaza al header de la web
 * (que se oculta dentro de la app) y respeta la zona segura de arriba (muesca / barra de estado).
 */
export default function NativeBar({ lang, t }: { lang: Lang; t: Dict }) {
  return (
    <header className="native-bar app-only">
      <a className="skip" href="#contenido">{t.nav.skip}</a>
      <div className="wrap bar">
        <Link href={`/${lang}`} className="logo" aria-label={`Lunacuento · ${t.nav.home}`}>
          <MoonLogo />
          <span>Lunacuento</span>
        </Link>
        <LangSwitch lang={lang} t={t} />
      </div>
    </header>
  );
}
