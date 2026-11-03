"use client";

import { useEffect } from "react";
import { arm, playSound } from "@/lib/sound";

/** Arma el sonido en el primer gesto y da un clic suave a los botones (los que traen data-sound usan su propio sonido). */
export default function SoundBoot() {
  useEffect(() => {
    const first = () => arm();
    const onClick = (e: MouseEvent) => {
      const el = (e.target as Element | null)?.closest<HTMLElement>("button, [role=button], a.btn, a.bk, .chip, .round, .pill, .tbtn, .stage-nav");
      if (!el || el.closest("[data-sound='none']")) return;
      const own = el.closest<HTMLElement>("[data-sound]")?.dataset.sound;
      if (own === "pop") playSound("pop");
      else if (!own) playSound("click");
    };
    window.addEventListener("pointerdown", first, { once: true, passive: true });
    window.addEventListener("keydown", first, { once: true });
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("pointerdown", first);
      window.removeEventListener("keydown", first);
      document.removeEventListener("click", onClick, true);
    };
  }, []);
  return null;
}
