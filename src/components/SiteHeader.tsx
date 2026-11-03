import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import { MoonLogo } from "./icons";
import LangSwitch from "./LangSwitch";
import MainNav from "./MainNav";
import NativeBar from "./NativeBar";

/** Header de la web (en la app se oculta y se usa NativeBar). La navegación móvil es la barra inferior. */
export default function SiteHeader({ lang, t }: { lang: Lang; t: Dict }) {
  return (
    <>
      <NativeBar lang={lang} t={t} />
      <header className="site-header web-only">
        <a className="skip" href="#contenido">{t.nav.skip}</a>
        <div className="wrap bar">
          <Link href={`/${lang}`} className="logo" aria-label={`Lunacuento · ${t.nav.home}`}>
            <MoonLogo />
            <span>Lunacuento</span>
          </Link>
          <MainNav lang={lang} t={t} />
          <LangSwitch lang={lang} t={t} />
          <Link href={`/${lang}#planes`} className="btn btn-ghost-moon acct">{t.nav.app}</Link>
        </div>
      </header>
    </>
  );
}
