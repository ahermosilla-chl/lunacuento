import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import { IconBook, IconPalette } from "./icons";

/** Dos accesos protagonistas: Leer cuentos y Pintar dibujos. */
export default function QuickActions({ lang, t }: { lang: Lang; t: Dict }) {
  return (
    <section className="quick" aria-label={t.quick.label}>
      <div className="wrap quick-grid">
        <Link href={`/${lang}/cuentos`} className="quick-card read">
          <span className="q-ico" aria-hidden="true"><IconBook size={44} /></span>
          <span className="q-txt"><b>{t.quick.read.title}</b><small>{t.quick.read.text}</small></span>
        </Link>
        <Link href={`/${lang}/pintar`} className="quick-card paint">
          <span className="q-ico" aria-hidden="true"><IconPalette size={44} /></span>
          <span className="q-txt"><b>{t.quick.paint.title}</b><small>{t.quick.paint.text}</small></span>
        </Link>
      </div>
    </section>
  );
}
