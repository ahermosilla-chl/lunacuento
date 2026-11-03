import type { Lang } from "./i18n";
import manifestJson from "../../public/ilustraciones/manifest.json";

/**
 * Ilustraciones definitivas (fase 3, gpt-image-2). `scripts/generar-ilustraciones.mjs` las genera en
 * public/ilustraciones/ y escribe public/ilustraciones/manifest.json. Si una imagen no está en el manifiesto,
 * la web usa el placeholder vectorial (marcado con ILUSTRACION-PENDIENTE). Ver docs/guia-ilustracion.md.
 */
export type Ilu = { src: string; width: number; height: number; srcset?: string };
const manifest = manifestJson as Record<string, Ilu>;

export const ilu = (name: string): Ilu | undefined => manifest[name];

/** Cuento (o título "Pronto") -> nombre de su portada en el manifiesto. */
export const COVER_KEY: Record<string, string> = {
  "la-lampara-de-la-luna": "portada-lampara-de-la-luna",
  "tilo-y-las-moras": "portada-tilo-y-las-moras",
  "el-dragon-que-no-podia-dormir": "portada-dragon-que-no-podia-dormir",
  jardin: "portada-primer-dia-de-jardin",
  hermanito: "portada-un-hermanito-en-casa",
  chupete: "portada-adios-chupete",
};

export type { Lang };
