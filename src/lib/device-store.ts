"use client";

import { useSyncExternalStore } from "react";

/**
 * Almacén JSON en localStorage (solo en este dispositivo, nunca se envía).
 * Entrega siempre el mismo objeto mientras el texto guardado no cambie (requisito de useSyncExternalStore)
 * y `empty` en el servidor y en la hidratación, así no hay diferencias de HTML.
 * Si el almacenamiento está bloqueado (modo privado), los datos viven en memoria hasta cerrar la página.
 */
export function createDeviceStore<T>(key: string, empty: T, sanitize: (v: unknown) => T) {
  let raw: string | null | undefined;
  let data = empty;
  let blocked = false;
  const listeners = new Set<() => void>();

  const getSnapshot = (): T => {
    if (blocked) return data;
    let r: string | null = null;
    try {
      r = localStorage.getItem(key);
    } catch {
      blocked = true;
      return data;
    }
    if (r !== raw) {
      raw = r;
      try {
        data = r ? sanitize(JSON.parse(r)) : empty;
      } catch {
        data = empty;
      }
    }
    return data;
  };

  const emit = () => listeners.forEach((l) => l());

  const subscribe = (cb: () => void) => {
    listeners.add(cb);
    const onStorage = (e: StorageEvent) => {
      if (e.key === key) cb();
    };
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(cb);
      window.removeEventListener("storage", onStorage);
    };
  };

  return {
    get: getSnapshot,
    /** Cambia el contenido con una función pura; guarda y avisa a los componentes suscritos. */
    update(fn: (prev: T) => T) {
      const next = fn(getSnapshot());
      data = next;
      if (!blocked) {
        try {
          raw = JSON.stringify(next);
          localStorage.setItem(key, raw);
        } catch {
          blocked = true;
        }
      }
      emit();
    },
    use: (): T => useSyncExternalStore(subscribe, getSnapshot, () => empty),
  };
}

/** ¿Ya se hidrató la página? Falso en el HTML estático: sirve para mostrar esqueletos mientras se leen los datos del dispositivo. */
export function useHydrated(): boolean {
  return useSyncExternalStore(() => () => {}, () => true, () => false);
}
