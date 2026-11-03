"use client";

import { useSyncExternalStore } from "react";

/**
 * Lee una media query sin romper la hidratación: en el servidor y en el primer render
 * del cliente devuelve `serverValue`, y después el valor real.
 */
export function useMedia(query: string, serverValue = false): boolean {
  return useSyncExternalStore(
    (cb) => {
      const mq = window.matchMedia(query);
      mq.addEventListener("change", cb);
      return () => mq.removeEventListener("change", cb);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");
