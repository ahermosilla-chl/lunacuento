import type { Lang } from "./i18n";
import { ilu, type Ilu } from "./ilustraciones";
import { getStory } from "./stories";

/**
 * Dibujos del taller de pintura.
 * - `svg`: dibujo vectorial provisorio de art.ts (DRAWINGS), se pinta por zonas. Respaldo.
 * - `raster`: nombre en el manifiesto de ilustraciones (dibujo de línea generado); se pinta por píxeles.
 *   Si existe en el manifiesto, tiene prioridad sobre el SVG.
 * Un dibujo sin `svg` y sin imagen en el manifiesto no se muestra.
 */
export type DrawingCat = "night" | "forest";
export type DrawingMeta = {
  id: string;
  cat: DrawingCat;
  storyId?: string;
  title?: Record<Lang, string>;
  svg?: boolean;
  raster: string;
};

export const DRAWING_LIST: DrawingMeta[] = [
  { id: "luna", storyId: "la-lampara-de-la-luna", cat: "night", svg: true, raster: "colorear-luna" },
  { id: "tilo", storyId: "tilo-y-las-moras", cat: "forest", svg: true, raster: "colorear-tilo" },
  { id: "dragon", storyId: "el-dragon-que-no-podia-dormir", cat: "night", svg: true, raster: "colorear-dragon" },
  { id: "leon", cat: "forest", title: { es: "El león", en: "The lion" }, raster: "colorear-leon" },
  { id: "castillo", cat: "night", title: { es: "El castillo", en: "The castle" }, raster: "colorear-castillo" },
  { id: "zorro", cat: "forest", title: { es: "El zorro", en: "The fox" }, raster: "colorear-zorro" },
];

export const DRAWING_CATS: DrawingCat[] = ["night", "forest"];
export const CAT_LABEL: Record<DrawingCat, Record<Lang, string>> = {
  night: { es: "Noche", en: "Night" },
  forest: { es: "Bosque", en: "Forest" },
};


/** Imagen de línea (raster) del dibujo, si ya se generó. */
export const rasterOf = (d: DrawingMeta): Ilu | undefined => ilu(d.raster);

/** Dibujos que se pueden mostrar hoy: los que tienen SVG de respaldo o imagen generada. */
export const availableDrawings = (): DrawingMeta[] => DRAWING_LIST.filter((d) => d.svg || rasterOf(d));

export const drawingTitle = (d: DrawingMeta, lang: Lang): string => (d.storyId ? getStory(d.storyId)?.title[lang] : d.title?.[lang]) ?? d.id;

/** ¿Pertenece a un cuento con candado? */
export const isPremiumDrawing = (d: DrawingMeta): boolean => Boolean(d.storyId && getStory(d.storyId)?.premium);

/** Clave bajo la que se guarda lo pintado: el raster usa otra numeración de zonas que el SVG. */
export const paintKey = (d: DrawingMeta): string => (rasterOf(d) ? `${d.id}:r` : d.id);
