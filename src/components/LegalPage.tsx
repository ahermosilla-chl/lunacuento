import Link from "next/link";
import { getDict, type Lang } from "@/lib/i18n";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

export default function LegalPage({ lang, kind }: { lang: Lang; kind: "privacy" | "terms" }) {
  const t = getDict(lang);
  const doc = t.legal[kind];
  return (
    <>
      <SiteHeader lang={lang} t={t} />
      <main id="contenido" className="wrap page-plain">
        <article className="card">
          <h1>{doc.title}</h1>
          <span className="draft-note">{t.legal.draft}</span>
          {doc.sections.map((s) => (
            <section key={s.h}>
              <h2>{s.h}</h2>
              <p>{s.p}</p>
            </section>
          ))}
          <p style={{ marginTop: 32 }}>
            <Link href={`/${lang}`} className="btn btn-line">{t.legal.back}</Link>
          </p>
        </article>
      </main>
      <SiteFooter lang={lang} t={t} />
    </>
  );
}
