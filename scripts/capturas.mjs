// Revisión visual con Playwright (Chrome del sistema o el de Playwright).
// Uso: npm run build && node scripts/servir-estatico.mjs &  luego  npm run capturas
// Guarda capturas en docs/capturas/ y falla si hay scroll horizontal, errores de consola o el arrastre no pasa página.
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const OUT = "docs/capturas";
const WIDTHS = [375, 768, 1280];
const executablePath = process.env.CHROME_PATH || "/usr/bin/google-chrome";

await mkdir(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });
const problems = [];

async function newPage(width, opts = {}) {
  const ctx = await browser.newContext({ viewport: { width, height: width < 700 ? 812 : width < 1000 ? 1024 : 800 }, deviceScaleFactor: 1, hasTouch: width < 1000, locale: "es-CL", ...opts });
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") problems.push(`[${width}] consola: ${m.text()}`); });
  page.on("response", (r) => { if (r.status() >= 400) problems.push(`[${width}] ${r.status()} ${r.url()}`); });
  page.on("pageerror", (e) => problems.push(`[${width}] error: ${e.message}`));
  return page;
}

async function noHScroll(page, label) {
  const { sw, cw } = await page.evaluate(() => ({ sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth }));
  if (sw > cw) problems.push(`${label}: scroll horizontal (${sw} > ${cw})`);
}

/** Arrastra la página hacia la izquierda y comprueba que la hoja sigue el dedo y luego avanza. */
async function dragTest(page, width, shot) {
  const book = await page.locator(".book").boundingBox();
  const y = book.y + book.height * 0.55;
  const x0 = book.x + book.width * 0.85;
  await page.mouse.move(x0, y);
  await page.mouse.down();
  const steps = 12;
  const dist = book.width * (width < 700 ? 0.45 : 0.32);
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x0 - (dist * i) / steps, y);
    await page.waitForTimeout(16);
  }
  const tf = await page.evaluate(() => document.querySelector(".leaf")?.style.transform || "");
  const deg = Number((tf.match(/rotateY\((-?[\d.]+)deg\)/) || [])[1]);
  if (!(deg < -20 && deg > -170)) problems.push(`[${width}] la hoja no sigue el dedo (transform="${tf}")`);
  if (shot) await page.screenshot({ path: `${OUT}/${shot}` });
  await page.mouse.up();
  await page.waitForTimeout(1000);
  const dot = await page.evaluate(() => [...document.querySelectorAll(".dots span")].findIndex((d) => d.classList.contains("on")));
  const label = await page.locator(".book").getAttribute("aria-label");
  if (!/Página 2 de/.test(label || "")) problems.push(`[${width}] el arrastre no pasó la página (${label}, punto ${dot})`);

  // Arrastre corto (< 35 %, lento): debe volver
  await page.mouse.move(x0, y);
  await page.mouse.down();
  for (let i = 1; i <= 10; i++) { await page.mouse.move(x0 - (book.width * 0.1 * i) / 10, y); await page.waitForTimeout(40); }
  await page.waitForTimeout(150);
  await page.mouse.up();
  await page.waitForTimeout(900);
  const label2 = await page.locator(".book").getAttribute("aria-label");
  if (!/Página 2 de/.test(label2 || "")) problems.push(`[${width}] un arrastre corto no volvió (${label2})`);
}

for (const w of WIDTHS) {
  // Home
  const page = await newPage(w);
  await page.goto(`${BASE}/es/`, { waitUntil: "networkidle" });
  await page.fill("#kid-name", "Tomás");
  await page.waitForTimeout(300);
  await noHScroll(page, `[${w}] home`);
  await page.screenshot({ path: `${OUT}/home-${w}.png`, fullPage: true });
  const shelfName = await page.locator(".shelf-head .for").textContent();
  if (!shelfName?.includes("Tomás")) problems.push(`[${w}] el nombre no llega al estante`);

  // Colorear: tocar una zona la pinta
  await page.locator(".palette .sw").nth(1).click();
  await page.locator(".canvas-card .f").nth(1).click({ force: true });
  const fill = await page.locator(".canvas-card .f").nth(1).getAttribute("fill");
  if (fill !== "#FF6F61") problems.push(`[${w}] colorear no pinta (fill=${fill})`);

  // Lector: tapa cerrada -> abierta
  const rp = await newPage(w);
  await rp.goto(`${BASE}/es/`, { waitUntil: "networkidle" });
  await rp.fill("#kid-name", "Tomás");
  await rp.goto(`${BASE}/es/cuento/la-lampara-de-la-luna/`, { waitUntil: "domcontentloaded" });
  await rp.waitForTimeout(w < 700 ? 900 : 700);
  await rp.screenshot({ path: `${OUT}/lector-${w}-tapa-abriendose.png` });
  await rp.waitForTimeout(1400);
  await noHScroll(rp, `[${w}] lector`);
  await rp.screenshot({ path: `${OUT}/lector-${w}.png` });
  const txt = await rp.locator(".story-text").first().textContent();
  if (!txt?.includes("Tomás")) problems.push(`[${w}] el nombre no llega al lector`);
  await dragTest(rp, w, `lector-${w}-arrastre.png`);

  // Teclado
  if (w >= 1000) {
    await rp.keyboard.press("ArrowRight");
    await rp.waitForTimeout(1000);
    const l = await rp.locator(".book").getAttribute("aria-label");
    if (!/Página 3 de/.test(l || "")) problems.push(`[${w}] la flecha derecha no pasa página (${l})`);
    // Narración (sin voces en headless: se ilumina con ritmo fijo)
    await rp.locator(".pill.sun").click();
    await rp.waitForTimeout(1300);
    await rp.screenshot({ path: `${OUT}/lector-${w}-lectura.png` });
    const on = await rp.locator(".story-text .w.on").count();
    if (on !== 1) problems.push(`[${w}] la lectura acompañada no ilumina palabras (${on})`);
    await rp.locator(".pill.sun").click();
    // Modo dormir
    await rp.locator(".r-actions .pill").first().click();
    await rp.waitForTimeout(500);
    await rp.screenshot({ path: `${OUT}/lector-${w}-dormir.png` });
  }
  await page.context().close();
  await rp.context().close();
}

// Inglés + selector conserva la ruta
{
  const p = await newPage(1280);
  await p.goto(`${BASE}/es/cuento/tilo-y-las-moras/`, { waitUntil: "networkidle" });
  const href = await p.evaluate(() => [...document.querySelectorAll("a[hreflang]")].map((a) => a.getAttribute("href")));
  await p.goto(`${BASE}/en/`, { waitUntil: "networkidle" });
  await p.screenshot({ path: `${OUT}/home-1280-en.png` });
  const sw = await p.evaluate(() => [...document.querySelectorAll(".lang-switch a")].map((a) => a.getAttribute("href")));
  if (!sw.includes("/es/")) problems.push(`selector de idioma: ${sw}`);
  console.log("hreflang en lector:", href);
  await p.context().close();
}

// Redirección de "/" en el cliente según idioma
for (const [locale, want] of [["en-US", "/en/"], ["es-CL", "/es/"]]) {
  const p = await newPage(1280, { locale });
  await p.goto(`${BASE}/`);
  await p.waitForURL(`**${want}`, { timeout: 5000 }).catch(() => problems.push(`/ no redirige a ${want} con ${locale} (${p.url()})`));
  await p.context().close();
}

// prefers-reduced-motion: sin tapa ni giros
{
  const p = await newPage(1280, { reducedMotion: "reduce" });
  await p.goto(`${BASE}/es/cuento/tilo-y-las-moras/`, { waitUntil: "networkidle" });
  await p.waitForTimeout(200);
  if (await p.locator(".cover-leaf").count()) problems.push("reduced-motion: la tapa sigue animándose");
  await p.keyboard.press("ArrowRight");
  await p.waitForTimeout(50);
  if (await p.locator(".leaf").count()) problems.push("reduced-motion: aparece hoja girando");
  await p.context().close();
}

await browser.close();
if (problems.length) {
  console.error("PROBLEMAS:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("Revisión visual OK: capturas en", OUT);
