// Capturas lado a lado: mockup de referencia (izquierda) vs Lunacuento (derecha) en 375, 768 y 1280 px.
// Requiere el sitio servido en BASE_URL. Salida: .adjuntos-pr/comparacion-*.png
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const executablePath = process.env.CHROME_PATH || "/usr/bin/google-chrome";
// El mockup NO está en el repo: pasa su ruta con MOCKUP=/ruta/mockup.webp. Las comparaciones se guardan en .adjuntos-pr/ (ignorado por git) para adjuntarlas a mano al PR.
const MOCK = process.env.MOCKUP || ".adjuntos-pr/mockup.webp";
const OUT = ".adjuntos-pr";
// Recortes del mockup (la imagen es 1672×941): escritorio, móvil inicio y móvil pintar
const CROP = { desktop: { left: 0, top: 100, width: 1092, height: 685 }, phoneHome: { left: 1104, top: 124, width: 282, height: 618 }, phonePaint: { left: 1398, top: 144, width: 270, height: 556 } };

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
async function shot(path, w, h) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: w < 700, locale: "es-CL" });
  const p = await ctx.newPage();
  await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1200);
  const buf = await p.screenshot();
  await ctx.close();
  return buf;
}
const label = (text, w) => Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="44"><rect width="100%" height="100%" fill="#0F1B3D"/><text x="16" y="29" font-family="Arial, sans-serif" font-size="22" font-weight="700" fill="#FFF8E7">${text}</text></svg>`);

/** Une dos imágenes a la misma altura con una etiqueta arriba de cada una. */
async function lado(izq, der, salida, tIzq, tDer, alto) {
  const a = await sharp(izq).resize({ height: alto }).png().toBuffer();
  const b = await sharp(der).resize({ height: alto }).png().toBuffer();
  const ma = await sharp(a).metadata();
  const mb = await sharp(b).metadata();
  const gap = 24;
  const W = ma.width + mb.width + gap;
  await sharp({ create: { width: W, height: alto + 44, channels: 3, background: "#0F1B3D" } })
    .composite([
      { input: label(tIzq, ma.width), left: 0, top: 0 }, { input: a, left: 0, top: 44 },
      { input: label(tDer, mb.width), left: ma.width + gap, top: 0 }, { input: b, left: ma.width + gap, top: 44 },
    ]).png().toFile(`${OUT}/${salida}`);
  console.log("→", salida);
}

const desktop = await sharp(MOCK).extract(CROP.desktop).png().toBuffer();
await lado(desktop, await shot("/es/", 1280, 800), "comparacion-1280.png", "Mockup (escritorio)", "Lunacuento 1280 px", 640);
await lado(desktop, await shot("/es/", 768, 1024), "comparacion-768.png", "Mockup (escritorio, referencia)", "Lunacuento 768 px", 760);
const phoneHome = await sharp(MOCK).extract(CROP.phoneHome).png().toBuffer();
const phonePaint = await sharp(MOCK).extract(CROP.phonePaint).png().toBuffer();
await lado(phoneHome, await shot("/es/", 375, 812), "comparacion-375-inicio.png", "Mockup (móvil, inicio)", "Lunacuento 375 px", 812);
await lado(phonePaint, await shot("/es/pintar/", 375, 812), "comparacion-375-pintar.png", "Mockup (móvil, pintar)", "Lunacuento 375 px", 812);
await browser.close();
