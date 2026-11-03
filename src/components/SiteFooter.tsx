import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import { MODO_PRUEBA } from "@/lib/modo-prueba";

export default function SiteFooter({ lang, t }: { lang: Lang; t: Dict }) {
  return (
    <footer className="site-footer">
      <div className="wrap">
        <span>{t.footer.rights}{MODO_PRUEBA ? ` · ${t.footer.test}` : ""}</span>
        <nav aria-label={`${t.footer.privacy} · ${t.footer.terms}`}>
          <Link href={`/${lang}/privacidad`}>{t.footer.privacy}</Link>
          <Link href={`/${lang}/terminos`}>{t.footer.terms}</Link>
        </nav>
      </div>
    </footer>
  );
}
