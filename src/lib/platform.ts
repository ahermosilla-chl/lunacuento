"use client";

import { useSyncExternalStore } from "react";

/**
 * ¿Estamos dentro de la app nativa (Capacitor en iOS o Android)?
 * El puente nativo define `window.Capacitor` antes de cargar la página, así que no hace falta importar
 * @capacitor/core para saberlo (y el sitio web no descarga nada extra).
 */
type CapacitorGlobal = { isNativePlatform?: () => boolean; getPlatform?: () => string };

export type Platform = "ios" | "android" | "web";

export function getPlatform(): Platform {
  if (typeof window === "undefined") return "web";
  const cap = (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor;
  if (!cap?.isNativePlatform?.()) return "web";
  const p = cap.getPlatform?.();
  return p === "ios" || p === "android" ? p : "web";
}

export const isNative = () => getPlatform() !== "web";

const never = () => () => {};

/** Falso en el servidor y en la hidratación (HTML estático = versión web); verdadero después si es la app. */
export function useNative(): boolean {
  return useSyncExternalStore(never, isNative, () => false);
}

/**
 * Script mínimo que va en <head>: marca <html data-native> antes del primer dibujo para que el CSS
 * oculte lo que solo es de la web (header, botones "descarga la app") sin parpadeos.
 */
export const NATIVE_BOOT_SCRIPT =
  "try{var c=window.Capacitor;if(c&&c.isNativePlatform&&c.isNativePlatform())document.documentElement.setAttribute('data-native','')}catch(e){}";
