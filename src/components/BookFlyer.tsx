"use client";

import { useEffect, useRef } from "react";

/**
 * La portada tocada en el estante vuela hasta el centro y crece hasta el libro cerrado del lector.
 * BookCard dispara "lc:fly" con el libro y su posición; el lector, ya montado, responde con "lc:fly-to" (dónde está su tapa)
 * y al aterrizar se emite "lc:fly-done". Solo transform/opacity (barato en móviles). Con "reducir movimiento" no se usa.
 */
export default function BookFlyer() {
  const host = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let clone: HTMLElement | null = null;
    let from: DOMRect | null = null;
    let timer = 0;
    const clear = () => {
      window.clearTimeout(timer);
      clone?.remove();
      clone = null;
      from = null;
    };
    const onStart = (e: Event) => {
      const { node, rect } = (e as CustomEvent<{ node: HTMLElement; rect: DOMRect }>).detail;
      clear();
      clone = node.cloneNode(true) as HTMLElement;
      clone.removeAttribute("href");
      clone.setAttribute("aria-hidden", "true");
      clone.classList.add("fly-clone");
      Object.assign(clone.style, { transformOrigin: "center center", position: "fixed", left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.width}px`, height: `${rect.height}px`, margin: "0", transform: "none", pointerEvents: "none", zIndex: "9999" });
      el.appendChild(clone);
      from = rect;
      timer = window.setTimeout(clear, 3000); // si el lector nunca responde
    };
    const onTo = (e: Event) => {
      if (!clone || !from) return;
      const t = (e as CustomEvent<{ x: number; y: number; w: number; h: number }>).detail;
      const s = t.h / from.height;
      const dx = t.x + t.w / 2 - (from.left + from.width / 2);
      const dy = t.y + t.h / 2 - (from.top + from.height / 2);
      const node = clone;
      window.clearTimeout(timer);
      const flight = node.animate(
        [
          { transform: "translate(0, 0) rotate(0deg) scale(1)" },
          { transform: `translate(${dx * 0.5}px, ${dy * 0.5 - 46}px) rotate(-5deg) scale(${1 + (s - 1) * 0.55})`, offset: 0.5 },
          { transform: `translate(${dx}px, ${dy}px) rotate(0deg) scale(${s})` },
        ],
        { duration: 820, easing: "cubic-bezier(.22,.8,.24,1)", fill: "forwards" },
      );
      flight.onfinish = () => {
        window.dispatchEvent(new Event("lc:fly-done"));
        node.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: "forwards" }).onfinish = clear;
      };
    };
    window.addEventListener("lc:fly", onStart);
    window.addEventListener("lc:fly-to", onTo);
    return () => {
      window.removeEventListener("lc:fly", onStart);
      window.removeEventListener("lc:fly-to", onTo);
      clear();
    };
  }, []);
  return <div ref={host} className="fly-host" aria-hidden="true" />;
}
