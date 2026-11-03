import type { Lang } from "./i18n";

/** Dibujos del taller de pintura (el SVG vive en art.ts → DRAWINGS). Cada uno pertenece a un cuento y a una categoría. */
export type DrawingCat = "night" | "forest";
export type DrawingMeta = { id: string; storyId: string; cat: DrawingCat };

export const DRAWING_LIST: DrawingMeta[] = [
  { id: "luna", storyId: "la-lampara-de-la-luna", cat: "night" },
  { id: "tilo", storyId: "tilo-y-las-moras", cat: "forest" },
  { id: "dragon", storyId: "el-dragon-que-no-podia-dormir", cat: "night" },
];

export const DRAWING_CATS: DrawingCat[] = ["night", "forest"];
export const CAT_LABEL: Record<DrawingCat, Record<Lang, string>> = {
  night: { es: "Noche", en: "Night" },
  forest: { es: "Bosque", en: "Forest" },
};
