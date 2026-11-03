"use client";

import { useSyncExternalStore } from "react";
import { cleanName } from "./text";

/**
 * Nombre del niño o niña. Solo vive en este dispositivo (localStorage), nunca se envía al servidor.
 * useSyncExternalStore entrega "" en el servidor y en la hidratación, así no hay diferencias de HTML.
 */
const KEY = "lc_name";
const listeners = new Set<() => void>();

function read(): string {
  try {
    return cleanName(localStorage.getItem(KEY) ?? "");
  } catch {
    return "";
  }
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) cb();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function setKidName(v: string) {
  try {
    localStorage.setItem(KEY, cleanName(v));
  } catch {
    /* modo privado o almacenamiento bloqueado: el nombre dura solo esta sesión de la página */
  }
  listeners.forEach((l) => l());
}

/** Devuelve el nombre guardado tal cual ("" si no hay). */
export function useRawKidName(): string {
  return useSyncExternalStore(subscribe, read, () => "");
}

/** Devuelve el nombre guardado o el nombre por defecto del idioma. */
export function useKidName(fallback: string): string {
  const raw = useRawKidName();
  return raw.trim() || fallback;
}
