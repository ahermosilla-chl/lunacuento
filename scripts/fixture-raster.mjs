// Fixture SOLO para pruebas: dibujo de línea falso (colorear-leon) para probar el relleno por píxeles sin generar imágenes.
//   node scripts/fixture-raster.mjs poner   -> crea public/ilustraciones/colorear-leon-*.webp y lo anota en el manifiesto
//   node scripts/fixture-raster.mjs quitar  -> los borra y deja el manifiesto como estaba
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import sharp from "sharp";

const OUT = resolve("public/ilustraciones");
const manifestPath = join(OUT, "manifest.json");
const FILES = ["colorear-leon-600.webp", "colorear-leon-1200.webp"];

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800"><rect width="100%" height="100%" fill="#fff"/>
<g fill="none" stroke="#000" stroke-width="7" stroke-linejoin="round">
  <circle cx="600" cy="400" r="250"/><circle cx="520" cy="360" r="34"/><circle cx="680" cy="360" r="34"/><path d="M570 470 L630 470 L600 520 Z"/>
  <path d="M1000 100 L1150 100 L1150 250 L1000 250 L1000 220"/><path d="M1000 100 L1000 217"/>
  <rect x="80" y="520" width="200" height="200"/>
</g></svg>`; // arriba a la derecha: un cuadrado con un hueco de 3 px (la zona debe seguir cerrada)

if (process.argv[2] === "quitar") {
  for (const f of FILES) await rm(join(OUT, f), { force: true });
  await writeFile(manifestPath, "{}\n");
  console.log("fixture quitado");
} else {
  await mkdir(OUT, { recursive: true });
  const png = await sharp(Buffer.from(svg)).png().toBuffer();
  for (const w of [600, 1200]) await sharp(png).resize({ width: w }).webp({ lossless: true }).toFile(join(OUT, `colorear-leon-${w}.webp`));
  const m = JSON.parse(await readFile(manifestPath, "utf8").catch(() => "{}"));
  m["colorear-leon"] = { src: "/ilustraciones/colorear-leon-1200.webp", width: 1200, height: 800, srcset: "/ilustraciones/colorear-leon-600.webp 600w, /ilustraciones/colorear-leon-1200.webp 1200w" };
  await writeFile(manifestPath, JSON.stringify(m, null, 2) + "\n");
  console.log("fixture puesto");
}
