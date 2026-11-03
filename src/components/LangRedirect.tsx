"use client";

import Link from "next/link";
import { useEffect } from "react";
import { pickLang } from "@/lib/lang";

/**
 * Redirección de "/" hecha en el cliente (el sitio es estático, sin middleware).
 * Usa el idioma elegido antes en este dispositivo o, si no hay, navigator.languages.
 * Sin JavaScript se muestran los dos enlaces.
 */
export default function LangRedirect() {
  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("lc_lang");
    } catch {
      /* almacenamiento bloqueado */
    }
    const lang = saved === "es" || saved === "en" ? saved : pickLang(navigator.languages?.length ? navigator.languages : [navigator.language]);
    window.location.replace(`/${lang}/${window.location.hash}`);
  }, []);

  return (
    <main style={{ minHeight: "100dvh", display: "grid", placeItems: "center", color: "#FFF8E7", fontFamily: "system-ui, sans-serif" }}>
      <p style={{ display: "flex", gap: 16 }}>
        <Link href="/es/" lang="es" style={{ color: "#FFF8E7" }}>Español</Link>
        <Link href="/en/" lang="en" style={{ color: "#FFF8E7" }}>English</Link>
      </p>
    </main>
  );
}
