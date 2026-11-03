// Prueba del relleno por píxeles con los dibujos de línea REALES de public/ilustraciones (colorear-*).
// Requiere el sitio construido y servido (npm run build && node scripts/servir-estatico.mjs). No genera ni modifica imágenes.
import { chromium } from "playwright-core";
import { stat } from "node:fs/promises";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const executablePath = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const problems = [];
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });

// Un punto DENTRO de una forma cerrada (en píxeles de la imagen 1200×800) por dibujo, para comprobar que el relleno no se escapa.
const CASOS = {
  luna: { x: 620, y: 180, nombre: "la luna" },
  tilo: { x: 330, y: 540, nombre: "el vientre del erizo" },
  dragon: { x: 330, y: 470, nombre: "la cabeza del dragón" },
  leon: { x: 560, y: 270, nombre: "la cara del león" },
  castillo: { x: 520, y: 300, nombre: "la torre central" },
  zorro: { x: 600, y: 160, nombre: "la frente del zorro" },
};
const PUNTOS = JSON.parse(process.env.PUNTOS_EXTRA || "{}");
Object.assign(CASOS, PUNTOS);

const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 }, acceptDownloads: true });
const p = await ctx.newPage();
p.on("console", (m) => m.type() === "error" && problems.push(`consola: ${m.text()}`));
p.on("pageerror", (e) => problems.push(`error: ${e.message}`));

const listo = () => p.waitForFunction(() => document.querySelector(".canvas-stack")?.getAttribute("aria-busy") === "false", null, { timeout: 15000 });
/** Color del píxel (x, y) de la imagen, leído del lienzo. */
const px = (x, y) => p.evaluate(([x, y]) => { const c = document.querySelector("canvas.raster"); const d = c.getContext("2d").getImageData(x, y, 1, 1).data; return [d[0], d[1], d[2]]; }, [x, y]);
/** Fracción de píxeles que no son blancos ni líneas oscuras (o sea, pintados). */
const pintado = () => p.evaluate(() => { const c = document.querySelector("canvas.raster"); const d = c.getContext("2d").getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) { const lum = d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11; const sat = Math.max(d[i], d[i + 1], d[i + 2]) - Math.min(d[i], d[i + 1], d[i + 2]); if (sat > 40 && lum > 60) n++; } return n / (d.length / 4); });
const click = async (x, y) => {
  await p.locator("canvas.raster").scrollIntoViewIfNeeded();
  const b = await p.locator("canvas.raster").boundingBox();
  await p.mouse.click(b.x + (x / 1200) * b.width, b.y + (y / 800) * b.height);
};
const same = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= 3);
const PINK = [255, 107, 158];

for (const [id, c] of Object.entries(CASOS)) {
  if (c.omitir) continue;
  await p.goto(`${BASE}/es/pintar/?dibujo=${id}`, { waitUntil: "networkidle" });
  await listo().catch(() => problems.push(`[${id}] el dibujo raster no terminó de prepararse`));
  if ((await p.locator("canvas.raster").count()) !== 1) { problems.push(`[${id}] no usa el motor raster`); continue; }
  await p.getByRole("button", { name: "Rosa" }).click();
  await click(c.x, c.y);
  const color = await px(c.x, c.y);
  if (!same(color, PINK)) problems.push(`[${id}] el relleno no pinta ${c.nombre} (${color})`);
  const frac = await pintado();
  if (frac > 0.4) problems.push(`[${id}] el relleno se escapó: pintó el ${(frac * 100).toFixed(0)} % de la imagen (¿línea abierta?)`);
  if (frac < 0.005) problems.push(`[${id}] el relleno pintó muy poco (${(frac * 100).toFixed(2)} %)`);
  if (!same(await px(8, 8), [255, 255, 255])) problems.push(`[${id}] el relleno llegó a la esquina (fuga)`);
  console.log(`  ${id}: ${c.nombre} pintado, ${(frac * 100).toFixed(1)} % de la imagen`);
}

// Herramientas sobre un dibujo real (león)
await p.goto(`${BASE}/es/pintar/?dibujo=leon`, { waitUntil: "networkidle" });
await listo();
await p.evaluate(() => localStorage.removeItem("lc_paint"));
await p.reload({ waitUntil: "networkidle" });
await listo();
await p.getByRole("button", { name: "Rosa" }).click();
await click(560, 270);
await p.getByRole("button", { name: "Turquesa" }).click();
await click(500, 700); // el cuerpo
if (!same(await px(500, 700), [0, 194, 171]) && !same(await px(560, 270), PINK)) problems.push("los dos rellenos no quedaron");
await p.getByRole("button", { name: "Deshacer" }).click();
if (same(await px(500, 700), [0, 194, 171])) problems.push("deshacer no revierte el relleno raster");
await p.getByRole("button", { name: "Rehacer" }).click();
await p.getByRole("button", { name: "Goma" }).click();
await click(560, 270);
if (!same(await px(560, 270), [255, 255, 255])) problems.push("la goma no quita el color de la zona raster");
await p.getByRole("button", { name: "Deshacer" }).click();
await p.getByRole("button", { name: "Pincel" }).click();
await p.getByRole("button", { name: "Violeta" }).click();
const b = await p.locator(".canvas-stack").boundingBox();
await p.mouse.move(b.x + b.width * 0.1, b.y + b.height * 0.9);
await p.mouse.down();
for (let i = 1; i <= 10; i++) await p.mouse.move(b.x + b.width * (0.1 + 0.04 * i), b.y + b.height * 0.9);
await p.mouse.up();
if ((await p.locator(".ink path").count()) !== 1) problems.push("el pincel no deja trazo sobre el raster");
await p.reload({ waitUntil: "networkidle" });
await listo();
if (!same(await px(560, 270), PINK) || (await p.locator(".ink path").count()) !== 1) problems.push("el dibujo raster no se guardó al recargar");
const [dl] = await Promise.all([p.waitForEvent("download", { timeout: 8000 }).catch(() => null), p.getByRole("button", { name: "Guardar imagen" }).click()]);
if (!dl || dl.suggestedFilename() !== "lunacuento-leon.png") problems.push("no exportó lunacuento-leon.png");
else if ((await stat(await dl.path())).size < 8000) problems.push("PNG raster exportado muy pequeño");

await browser.close();
if (problems.length) {
  console.error("PROBLEMAS:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("Relleno por píxeles OK (dibujos reales)");
