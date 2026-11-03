import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import { IconCheck } from "./icons";
import StoreButtons from "./StoreButtons";

/**
 * Planes de la web vitrina: cuentos gratis vs. "Biblioteca completa · US$7,99 · pago único".
 * La compra ocurre dentro de la app (compra no consumible en App Store / Google Play), aquí no se cobra.
 */
export default function Plans({ lang, t, firstStory }: { lang: Lang; t: Dict; firstStory: string }) {
  const P = t.plans.items;
  const Feats = ({ list }: { list: string[] }) => (
    <ul>{list.map((f) => <li key={f}><IconCheck /> <span>{f}</span></li>)}</ul>
  );
  return (
    <section id="planes" className="section" aria-labelledby="plans-title">
      <div className="wrap">
        <h2 id="plans-title" className="section-title">{t.plans.title}</h2>
        <div className="plans">
          <div className="plan">
            <h3>{P.free.name}</h3>
            <p className="price">{P.free.price}</p>
            <Feats list={P.free.feat} />
            <div className="actions">
              <Link href={`/${lang}/cuento/${firstStory}`} className="btn btn-line">{P.free.cta}</Link>
            </div>
          </div>
          <div className="plan main">
            <span className="badge">{P.full.badge}</span>
            <h3>{P.full.name}</h3>
            <p className="price">{P.full.price} <small>{P.full.per}</small></p>
            <Feats list={P.full.feat} />
            <div className="actions">
              <div className="web-only"><StoreButtons t={t} /></div>
              <Link href={`/${lang}/comprar`} className="btn btn-sun btn-lg app-only">{t.buy.unlock}</Link>
            </div>
          </div>
        </div>
        <p className="plans-note">{t.plans.storesNote}</p>
      </div>
    </section>
  );
}
