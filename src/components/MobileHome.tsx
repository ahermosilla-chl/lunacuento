import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import ContinueReading from "./ContinueReading";
import CoverRow from "./CoverRow";
import IlluImg from "./IlluImg";
import { IconBook, IconPalette } from "./icons";
import NameGreeting from "./NameGreeting";

/**
 * Inicio móvil (≤ 760 px): saludo, dos accesos grandes ilustrados, fila horizontal "Sigue leyendo" (solo con progreso)
 * y fila de portadas. La navegación es la barra inferior fija.
 */
export default function MobileHome({ lang, t }: { lang: Lang; t: Dict }) {
  return (
    <div className="m-home m-only">
      <section className="m-top" aria-label={t.mobile.hi}>
        <div className="m-moon" aria-hidden="true" />
        <NameGreeting lang={lang} t={t} />
      </section>
      <section className="m-cards" aria-label={t.quick.label}>
        <Link href={`/${lang}/cuentos`} className="m-card read">
          <span className="m-art" aria-hidden="true">
            <IlluImg name="acceso-leer" sizes="96px" fallback={<IconBook size={52} />} />
          </span>
          <b>{t.quick.read.title}</b>
          <small>{t.quick.read.text}</small>
        </Link>
        <Link href={`/${lang}/pintar`} className="m-card paint">
          <span className="m-art" aria-hidden="true">
            <IlluImg name="acceso-pintar" sizes="96px" fallback={<IconPalette size={52} />} />
          </span>
          <b>{t.quick.paint.title}</b>
          <small>{t.quick.paint.text}</small>
        </Link>
      </section>
      <ContinueReading lang={lang} t={t} variant="row" />
      <CoverRow lang={lang} t={t} />
    </div>
  );
}
