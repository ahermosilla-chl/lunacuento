"use client";

import { useEffect, useRef, useState } from "react";
import { DRAWINGS, PALETTE } from "@/lib/art";
import type { Dict, Lang } from "@/lib/i18n";
import type { Story } from "@/lib/stories";

/**
 * Colorear: el dibujo SVG se inserta una vez y se pinta tocando cada zona (clase "f").
 * Cada zona también se puede pintar con el teclado (Tab + Enter/Espacio).
 */
export default function Coloring({ lang, t, stories, initial }: { lang: Lang; t: Dict; stories: Story[]; initial?: string }) {
  const options = stories.filter((s) => DRAWINGS[s.coloring]);
  const [drawing, setDrawing] = useState(initial && DRAWINGS[initial] ? initial : options[0]?.coloring ?? "luna");
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [version, setVersion] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  // Desde el lector se llega con ?dibujo=<id>#colorear para abrir el dibujo de ese cuento.
  useEffect(() => {
    const d = new URLSearchParams(window.location.search).get("dibujo");
    if (d && DRAWINGS[d]) setDrawing(d);
  }, []);

  // Prepara las zonas pintables para teclado y lector de pantalla cada vez que cambia el dibujo.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    const svg = root.querySelector("svg");
    if (svg) {
      svg.setAttribute("role", "img");
      svg.setAttribute("aria-label", t.coloring.drawing);
    }
    root.querySelectorAll<SVGElement>(".f").forEach((el, i) => {
      el.setAttribute("tabindex", "0");
      el.setAttribute("role", "button");
      el.setAttribute("aria-label", `${t.coloring.drawing} · ${i + 1}`);
    });
  }, [drawing, version, t.coloring.drawing]);

  const paint = (target: EventTarget | null) => {
    const el = (target as Element | null)?.closest?.(".f");
    if (el) el.setAttribute("fill", color);
  };

  return (
    <section id="colorear" className="section coloring" aria-labelledby="color-title">
      <svg className="wave" aria-hidden="true" focusable="false" viewBox="0 0 1440 60" preserveAspectRatio="none">
        <path d="M0 0 H1440 V20 Q1080 60 720 30 T0 30Z" />
      </svg>
      <div className="wrap">
        <h2 id="color-title" className="section-title">{t.coloring.title}</h2>
        <div className="color-grid">
          <div
            key={`${drawing}-${version}`}
            ref={ref}
            className="canvas-card"
            onClick={(e) => paint(e.target)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                paint(e.target);
              }
            }}
            dangerouslySetInnerHTML={{ __html: DRAWINGS[drawing] }}
          />
          <div className="color-tools">
            <div className="palette" role="group" aria-label={t.coloring.colors}>
              {PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  className="sw"
                  style={{ background: c }}
                  aria-label={t.coloring.names[c] ?? c}
                  aria-pressed={color === c}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
            {options.length > 1 ? (
              <div className="picks" role="group" aria-label={t.coloring.pick}>
                {options.map((s) => (
                  <button key={s.id} type="button" className="chip" aria-pressed={drawing === s.coloring} onClick={() => setDrawing(s.coloring)}>
                    {s.title[lang]}
                  </button>
                ))}
              </div>
            ) : null}
            <button type="button" className="btn btn-line" onClick={() => setVersion((v) => v + 1)}>{t.coloring.clear}</button>
          </div>
        </div>
      </div>
    </section>
  );
}
