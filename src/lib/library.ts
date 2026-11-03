"use client";

import { createDeviceStore } from "./device-store";

/**
 * "Sigue leyendo", favoritos y leídos. Solo ids de cuentos y números de página, guardados en este dispositivo.
 */
export type Progress = { page: number; total: number; at: number };
export type LibraryData = { progress: Record<string, Progress>; favs: string[]; read: string[] };

const EMPTY: LibraryData = { progress: {}, favs: [], read: [] };
const ID = /^[a-z0-9-]{1,60}$/;

function sanitize(v: unknown): LibraryData {
  const o = (v ?? {}) as Partial<LibraryData>;
  const progress: Record<string, Progress> = {};
  for (const [id, p] of Object.entries(o.progress ?? {})) {
    if (!ID.test(id) || !p) continue;
    const { page, total, at } = p as Progress;
    if ([page, total, at].every(Number.isFinite) && total > 0 && page >= 0 && page < total) progress[id] = { page, total, at };
  }
  const ids = (a: unknown) => (Array.isArray(a) ? a.filter((x): x is string => typeof x === "string" && ID.test(x)) : []);
  return { progress, favs: ids(o.favs), read: ids(o.read) };
}

const store = createDeviceStore<LibraryData>("lc_library", EMPTY, sanitize);

export const useLibraryData = store.use;
export const getLibraryData = store.get;

/** Guarda la página en que va un cuento. Al llegar a la última lo marca como leído y borra el avance. */
export function saveProgress(id: string, page: number, total: number) {
  store.update((d) => {
    const progress = { ...d.progress };
    if (page >= total - 1) {
      delete progress[id];
      return { ...d, progress, read: d.read.includes(id) ? d.read : [...d.read, id] };
    }
    if (page <= 0) return d; // abrir un cuento sin avanzar no cuenta como "seguir leyendo"
    progress[id] = { page, total, at: Date.now() };
    return { ...d, progress };
  });
}

export function toggleFavorite(id: string) {
  store.update((d) => ({ ...d, favs: d.favs.includes(id) ? d.favs.filter((x) => x !== id) : [...d.favs, id] }));
}

export function forgetRead(id: string) {
  store.update((d) => ({ ...d, read: d.read.filter((x) => x !== id) }));
}

/** Cuentos empezados y no terminados, el más reciente primero. */
export function continueList(d: LibraryData): { id: string; progress: Progress }[] {
  return Object.entries(d.progress)
    .map(([id, progress]) => ({ id, progress }))
    .sort((a, b) => b.progress.at - a.progress.at);
}
