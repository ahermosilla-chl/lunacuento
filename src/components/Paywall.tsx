"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { coverInk } from "@/lib/art";
import type { Dict, Lang } from "@/lib/i18n";
import { MODO_PRUEBA } from "@/lib/modo-prueba";
import { useNative } from "@/lib/platform";
import { loadPrice, purchaseLibrary, restorePurchases, useLibrary, type PurchaseResult, type PurchaseStatus } from "@/lib/purchases";
import type { Story } from "@/lib/stories";
import CoverArt from "./CoverArt";
import { IconCheck, IconClose, IconLock } from "./icons";
import { useParentalGate } from "./ParentalGate";
import StoreButtons from "./StoreButtons";

type Msg = { tone: "ok" | "info" | "err"; text: string };

/**
 * Pantalla de compra de la "Biblioteca completa" (pago único, no consumible).
 * Se abre al tocar un cuento con candado o desde Planes. Comprar y Restaurar piden primero el portón para adultos.
 */
export default function Paywall({ lang, t, story }: { lang: Lang; t: Dict; story?: Story }) {
  const owned = useLibrary();
  const native = useNative();
  const { ask, gate } = useParentalGate(t);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<Msg | null>(null);
  const [price, setPrice] = useState<string | null>(null);

  const router = useRouter();

  // Modo de prueba: no hay pantalla de compra; /comprar vuelve al estante.
  useEffect(() => {
    if (MODO_PRUEBA) router.replace(`/${lang}#cuentos`);
  }, [router, lang]);

  useEffect(() => {
    if (MODO_PRUEBA) return;
    let alive = true;
    loadPrice().then((p) => alive && setPrice(p));
    return () => {
      alive = false;
    };
  }, []);

  const text = (status: PurchaseStatus, kind: "buy" | "restore"): Msg => {
    switch (status) {
      case "success": return { tone: "ok", text: kind === "buy" ? t.buy.done : t.buy.restored };
      case "cancelled": return { tone: "info", text: t.buy.cancelled };
      case "empty": return { tone: "info", text: t.buy.empty };
      case "unavailable": return { tone: "info", text: native ? t.buy.off : t.buy.web };
      default: return { tone: "err", text: t.buy.error };
    }
  };

  const go = (kind: "buy" | "restore") =>
    ask(async () => {
      setBusy(true);
      setMsg(null);
      const r: PurchaseResult = await (kind === "buy" ? purchaseLibrary() : restorePurchases());
      setBusy(false);
      setMsg(text(r.status, kind));
    });

  if (MODO_PRUEBA) return null;

  const back = story ? `/${lang}#cuentos` : `/${lang}`;
  const cover = story?.color ?? "#4A3FC0";

  return (
    <main id="contenido" className="paywall">
      <div className="pw-top">
        <Link href={back} className="round" aria-label={t.buy.back}><IconClose size={22} /></Link>
      </div>

      <div className="pw-body">
        <div className="pw-cover" aria-hidden="true">
          <div className="bk" style={{ "--c": cover, "--bk-ink": coverInk(cover) } as React.CSSProperties}>
            <span className="lock-on"><IconLock /> {t.buy.tag}</span>
            <span className="bk-art">
              {story ? <CoverArt story={story} /> : <svg viewBox="0 0 140 132"><rect width="140" height="132" fill="#1E2A6E" /><circle cx="98" cy="44" r="22" fill="#FFE08A" /><path d="M0 98 Q40 76 80 94 T140 88 V132 H0Z" fill="#24467A" /></svg>}
            </span>
            <span className="bk-ttl">
              <b>{story ? story.title[lang] : t.buy.title}</b>
              <small>{story ? `${story.age} ${t.shelf.ages}` : t.buy.once}</small>
            </span>
          </div>
        </div>

        <div className="pw-copy">
          <h1>{t.buy.title}</h1>
          {story ? <p className="pw-for">{t.buy.forStory}</p> : null}
          <p className="pw-price">{price ?? t.buy.price} <small>{t.buy.once}</small></p>
          <ul className="pw-feat">
            {t.buy.feat.map((f) => <li key={f}><IconCheck /> <span>{f}</span></li>)}
          </ul>

          {owned ? (
            <>
              <p className="pw-msg ok" role="status">{t.buy.owned}</p>
              <Link href={`/${lang}#cuentos`} className="btn btn-sun btn-lg btn-block">{t.buy.pick}</Link>
            </>
          ) : (
            <div className="pw-actions" aria-busy={busy}>
              <button type="button" className="btn btn-sun btn-lg btn-block" disabled={busy} onClick={() => go("buy")}>
                {busy ? t.buy.working : t.buy.buy}
              </button>
              <button type="button" className="btn btn-line btn-block" disabled={busy} onClick={() => go("restore")}>{t.buy.restore}</button>
            </div>
          )}

          <p className={`pw-msg ${msg?.tone ?? ""}`} role="status" aria-live="polite">{owned ? "" : msg?.text ?? ""}</p>
          {!owned && !native ? <div className="web-only"><StoreButtons t={t} /></div> : null}
          <p className="pw-note">{t.buy.note}</p>
          <p className="pw-legal">
            <Link href={`/${lang}/privacidad`}>{t.footer.privacy}</Link>
            <Link href={`/${lang}/terminos`}>{t.footer.terms}</Link>
          </p>
        </div>
      </div>
      {gate}
    </main>
  );
}
