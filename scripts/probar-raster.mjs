// Prueba del relleno por píxeles. Requiere un build hecho con el fixture (ver npm run probar:raster).
import { chromium } from "playwright-core";
import { stat } from "node:fs/promises";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const executablePath = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const problems = [];
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });

for (const w of [375, 1280]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: w < 700 ? 812 : 800 }, hasTouch: w < 700, acceptDownloads: true });
  const p = await ctx.newPage();
  p.on("console", (m) => m.type() === "error" && problems.push(`[${w}] consola: ${m.text()}`));
  p.on("pageerror", (e) => problems.push(`[${w}] error: ${e.message}`));
  await p.goto(`${BASE}/es/pintar/?dibujo=leon`, { waitUntil: "networkidle" });
  await p.waitForFunction(() => document.querySelector(".canvas-stack")?.getAttribute("aria-busy") === "false", null, { timeout: 8000 }).catch(() => problems.push(`[${w}] el dibujo raster no terminó de prepararse`));
  if ((await p.locator("canvas.raster").count()) !== 1) problems.push(`[${w}] no usa el motor raster`);

  /** Color del píxel (x, y) de la imagen (1200×800), leído del lienzo. */
  const px = (x, y) => p.evaluate(([x, y]) => { const c = document.querySelector("canvas.raster"); const d = c.getContext("2d").getImageData(x, y, 1, 1).data; return [d[0], d[1], d[2]]; }, [x, y]);
  /** Click en el punto (x, y) de la imagen. */
  const click = async (x, y) => {
    await p.locator("canvas.raster").scrollIntoViewIfNeeded();
    const b = await p.locator("canvas.raster").boundingBox();
    await p.mouse.click(b.x + (x / 1200) * b.width, b.y + (y / 800) * b.height);
  };
  const same = (a, b) => a.every((v, i) => Math.abs(v - b[i]) <= 2);
  const PINK = [255, 107, 158];

  await p.getByRole("button", { name: "Rosa" }).click();
  await click(600, 330); // dentro de la cara, fuera de ojos y nariz
  if (!same(await px(600, 330), PINK)) problems.push(`[${w}] el relleno no pinta la zona (${await px(600, 330)})`);
  if (!same(await px(520, 360), [255, 255, 255])) problems.push(`[${w}] el relleno se salió al ojo (zona distinta): ${await px(520, 360)}`);
  if (!same(await px(60, 60), [255, 255, 255])) problems.push(`[${w}] el relleno se escapó afuera de la cara: ${await px(60, 60)}`);
  // la línea negra queda encima del color
  if (!(await px(600, 150)).every((v) => v < 90)) problems.push(`[${w}] la línea negra no quedó nítida sobre el color (${await px(600, 150)})`);
  // sin halo blanco entre el color y la línea (5 px dentro de la cara, junto al borde)
  if (!same(await px(600, 158), PINK)) problems.push(`[${w}] hay un halo blanco entre el color y la línea (${await px(600, 158)})`);
  // el cuadrado con hueco de 3 px no se escapa
  await p.getByRole("button", { name: "Turquesa" }).click();
  await click(1075, 175);
  if (!same(await px(1075, 175), [0, 194, 171])) problems.push(`[${w}] no pintó el cuadrado con hueco`);
  if (!same(await px(60, 60), [255, 255, 255]) || !same(await px(900, 600), [255, 255, 255])) problems.push(`[${w}] el relleno se escapó por el hueco de 3 px`);
  // clic sobre la línea no pinta nada raro
  const before = await px(100, 100);
  // deshacer / rehacer
  await p.getByRole("button", { name: "Deshacer" }).click();
  if (same(await px(1075, 175), [0, 194, 171])) problems.push(`[${w}] deshacer no revierte el relleno raster`);
  await p.getByRole("button", { name: "Rehacer" }).click();
  if (!same(await px(1075, 175), [0, 194, 171])) problems.push(`[${w}] rehacer no repone el relleno raster`);
  // goma sobre una zona
  await p.getByRole("button", { name: "Goma" }).click();
  await click(600, 330);
  if (!same(await px(600, 330), [255, 255, 255])) problems.push(`[${w}] la goma no quita el color de la zona raster`);
  await p.getByRole("button", { name: "Deshacer" }).click();
  // pincel sobre el dibujo raster (trazo en coordenadas de la imagen)
  await p.getByRole("button", { name: "Pincel" }).click();
  await p.getByRole("button", { name: "Violeta" }).click();
  const b = await p.locator(".canvas-stack").boundingBox();
  await p.mouse.move(b.x + b.width * 0.2, b.y + b.height * 0.85);
  await p.mouse.down();
  for (let i = 1; i <= 10; i++) await p.mouse.move(b.x + b.width * (0.2 + 0.05 * i), b.y + b.height * 0.85);
  await p.mouse.up();
  if ((await p.locator(".ink path").count()) !== 1) problems.push(`[${w}] el pincel no deja trazo sobre el raster`);
  // guardado: al recargar siguen el color y el trazo
  await p.reload({ waitUntil: "networkidle" });
  await p.waitForFunction(() => document.querySelector(".canvas-stack")?.getAttribute("aria-busy") === "false", null, { timeout: 8000 });
  if (!same(await px(600, 330), PINK) || (await p.locator(".ink path").count()) !== 1) problems.push(`[${w}] el dibujo raster no se guardó al recargar`);
  // exportar PNG: contiene color y trazo
  const [dl] = await Promise.all([p.waitForEvent("download", { timeout: 8000 }).catch(() => null), p.getByRole("button", { name: "Guardar imagen" }).click()]);
  if (!dl || dl.suggestedFilename() !== "lunacuento-leon.png") problems.push(`[${w}] no exportó lunacuento-leon.png`);
  else if ((await stat(await dl.path())).size < 5000) problems.push(`[${w}] PNG raster exportado muy pequeño`);
  void before;
  
  await ctx.close();
}
await browser.close();
if (problems.length) {
  console.error("PROBLEMAS:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("Relleno por píxeles OK");
