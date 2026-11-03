// Revisión visual con Playwright (Chrome del sistema o el de Playwright).
// Uso: npm run build && node scripts/servir-estatico.mjs &  luego  npm run capturas
// Guarda capturas en docs/capturas/ y falla si hay scroll horizontal, errores de consola o el arrastre no pasa página.
import { chromium } from "playwright-core";
import { mkdir } from "node:fs/promises";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const OUT = "docs/capturas";
const WIDTHS = [375, 768, 1280];
const NAME_INPUT = (w) => (w <= 760 ? "#kid-name-m" : "#kid-name"); // en móvil el saludo reemplaza al hero
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
  // Primero un avance de ~25 % para la captura (la hoja se ve girando en 3D), luego se pasa el umbral.
  const half = book.width * (width < 700 ? 0.25 : 0.12);
  for (let i = 1; i <= steps; i++) {
    await page.mouse.move(x0 - (half * i) / steps, y);
    await page.waitForTimeout(16);
  }
  const tf = await page.evaluate(() => document.querySelector(".leaf")?.style.transform || "");
  const deg = Number((tf.match(/rotateY\((-?[\d.]+)deg\)/) || [])[1]);
  if (!(deg < -20 && deg > -170)) problems.push(`[${width}] la hoja no sigue el dedo (transform="${tf}")`);
  if (shot) await page.screenshot({ path: `${OUT}/${shot}` });
  const dist = book.width * (width < 700 ? 0.45 : 0.3); // escritorio: el avance se mide sobre una página (mitad del libro)
  for (let i = 1; i <= 4; i++) {
    await page.mouse.move(x0 - half - ((dist - half) * i) / 4, y);
    await page.waitForTimeout(16);
  }
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
  await page.fill(NAME_INPUT(w), "Tomás");
  await page.waitForTimeout(300);
  await noHScroll(page, `[${w}] home`);
  await page.screenshot({ path: `${OUT}/home-${w}.png`, fullPage: true });
  const shelfName = await page.locator(w <= 760 ? ".greet-hi" : ".shelf-head .for").first().textContent();
  if (!shelfName?.includes("Tomás")) problems.push(`[${w}] el nombre no llega al ${w <= 760 ? "saludo" : "estante"}`);

  // Navegación: horizontal en tablet/escritorio, inferior en móvil
  const navVisible = await page.locator(w <= 760 ? ".bottom-nav" : ".site-header .navlinks").isVisible();
  if (!navVisible) problems.push(`[${w}] no se ve la navegación principal`);
  if (w > 760 && (await page.locator(".bottom-nav").isVisible())) problems.push(`[${w}] la barra inferior se ve en pantalla ancha`);
  if ((await page.locator(w <= 760 ? ".m-card:visible" : ".quick-card:visible").count()) !== 2) problems.push(`[${w}] faltan los dos accesos protagonistas`);
  if (await page.locator("#continue-title, #continue-row-title, #news-title").count()) problems.push(`[${w}] aparece "Sigue leyendo"/"Novedades" sin datos reales`);
  if (w <= 760) {
    const row = await page.locator(".h-row.covers").evaluate((el) => ({ sw: el.scrollWidth, cw: el.clientWidth, ox: getComputedStyle(el).overflowX }));
    if (!(row.sw > row.cw && row.ox === "auto")) problems.push(`[${w}] la fila de portadas no se desliza horizontalmente`);
  }

  // Lector: tapa cerrada -> abierta
  const rp = await newPage(w);
  await rp.goto(`${BASE}/es/`, { waitUntil: "networkidle" });
  await rp.fill(NAME_INPUT(w), "Tomás");
  await rp.goto(`${BASE}/es/cuento/la-lampara-de-la-luna/`, { waitUntil: "domcontentloaded" });
  await rp.waitForTimeout(w < 700 ? 900 : 700);
  await rp.screenshot({ path: `${OUT}/lector-${w}-tapa-abriendose.png` });
  await rp.waitForTimeout(1400);
  await noHScroll(rp, `[${w}] lector`);
  await rp.screenshot({ path: `${OUT}/lector-${w}.png` });
  const txt = await rp.locator(".story-text").first().textContent();
  if (!txt?.includes("Tomás")) problems.push(`[${w}] el nombre no llega al lector`);
  await dragTest(rp, w, `lector-${w}-arrastre.png`);

  // Móvil: el temporizador aparece como chip solo con modo dormir
  if (w < 700) {
    if (await rp.locator("#timer-m").count()) problems.push(`[${w}] el temporizador se ve sin modo dormir`);
    await rp.locator(".r-sleep-m").click();
    await rp.waitForTimeout(400);
    if (!(await rp.locator("#timer-m").isVisible())) problems.push(`[${w}] falta el temporizador con modo dormir`);
    await noHScroll(rp, `[${w}] lector dormir`);
    await rp.screenshot({ path: `${OUT}/lector-${w}-dormir.png` });
  }

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


// ---------------------------------------------------------------------------
// Fase 2: pantalla de compra, portón para adultos y modo app (Capacitor simulado)
// ---------------------------------------------------------------------------
const NUM = { tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8, nueve: 9, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9 };
/** Resuelve la suma del portón leyendo la pregunta (números en palabras). */
async function gateSum(page) {
  const q = (await page.locator(".gate-q").textContent()) || "";
  const [a, b] = (q.toLowerCase().match(/[a-zé]+/g) || []).filter((w) => w in NUM).map((w) => NUM[w]);
  return a + b;
}
const NATIVE = () => { window.Capacitor = { isNativePlatform: () => true, getPlatform: () => "ios" }; };
const PREMIUM = "el-dragon-que-no-podia-dormir";

async function gateFlow(page, w, shot, expectMsg) {
  await page.locator(".pw-actions .btn-sun").click();
  await page.locator("dialog.gate[open]").waitFor({ timeout: 3000 }).catch(() => problems.push(`[${w}] el portón no se abre al comprar`));
  const opts = await page.locator(".gate-opt").allTextContents();
  if (opts.length !== 3 || new Set(opts).size !== 3) problems.push(`[${w}] el portón debe tener 3 opciones distintas (${opts})`);
  const sum = await gateSum(page);
  if (shot) await page.screenshot({ path: `${OUT}/${shot}.png` });
  // Respuesta incorrecta: no ejecuta la compra y muestra aviso con pregunta nueva
  const wrong = opts.find((o) => Number(o) !== sum);
  await page.locator(".gate-opt", { hasText: new RegExp(`^${wrong}$`) }).click();
  if (!(await page.locator(".gate-wrong").textContent())?.trim()) problems.push(`[${w}] el portón no avisa de una respuesta incorrecta`);
  if (!(await page.locator("dialog.gate[open]").count())) problems.push(`[${w}] el portón se cerró con una respuesta incorrecta`);
  if ((await page.locator(".pw-msg").first().textContent())?.trim()) problems.push(`[${w}] se ejecutó la compra con una respuesta incorrecta`);
  // Respuesta correcta: se cierra y responde "no disponible" (sin claves de RevenueCat)
  const sum2 = await gateSum(page);
  await page.locator(".gate-opt", { hasText: new RegExp(`^${sum2}$`) }).click();
  await page.waitForTimeout(400);
  if (await page.locator("dialog.gate[open]").count()) problems.push(`[${w}] el portón no se cierra con la respuesta correcta`);
  const msg = (await page.locator(".pw-msg").first().textContent()) || "";
  if (!expectMsg.test(msg)) problems.push(`[${w}] mensaje de compra inesperado: "${msg}"`);
}

for (const w of WIDTHS) {
  // Estante: el cuento premium muestra candado y abre la pantalla de compra
  const page = await newPage(w);
  await page.goto(`${BASE}/es/`, { waitUntil: "networkidle" });
  if (w <= 900 && (await page.locator(".shelf-aside.in-grid").isVisible())) problems.push(`[${w}] el aviso del estante deja un tablón vacío`);
  const books = w <= 760 ? ".h-row.covers" : ".shelf-grid";
  if ((await page.locator(`${books} .bk .lock-on`).count()) !== 1) problems.push(`[${w}] el estante debe mostrar 1 libro con candado`);
  await page.locator(`${books} a.bk`, { has: page.locator(".lock-on") }).click();
  await page.waitForURL(`**/cuento/${PREMIUM}/`);
  await page.locator(".paywall").waitFor();
  if (await page.locator(".book").count()) problems.push(`[${w}] el cuento premium abre el lector sin compra`);
  for (const label of ["Comprar", "Restaurar compra"]) {
    if (!(await page.getByRole("button", { name: label }).count())) problems.push(`[${w}] falta el botón "${label}"`);
  }
  await noHScroll(page, `[${w}] compra`);
  await page.screenshot({ path: `${OUT}/compra-${w}.png` });
  await gateFlow(page, w, `porton-${w}`, /dentro de la app/);
  // Restaurar también pasa por el portón
  await page.getByRole("button", { name: "Restaurar compra" }).click();
  if (!(await page.locator("dialog.gate[open]").count())) problems.push(`[${w}] restaurar no pide el portón`);
  await page.locator(".gate-opt", { hasText: new RegExp(`^${await gateSum(page)}$`) }).click();
  await page.waitForTimeout(300);
  await page.context().close();

  // Con la compra guardada en el dispositivo, el cuento abre el lector
  const owned = await newPage(w);
  await owned.addInitScript(() => localStorage.setItem("lc_biblioteca", "1"));
  await owned.goto(`${BASE}/es/cuento/${PREMIUM}/`, { waitUntil: "networkidle" });
  await owned.locator(".book").waitFor({ timeout: 4000 }).catch(() => problems.push(`[${w}] con la compra, el cuento premium no abre el lector`));
  await owned.context().close();

  // App nativa (Capacitor simulado): sin header web ni "descarga la app"
  const app = await newPage(w);
  await app.addInitScript(NATIVE);
  await app.goto(`${BASE}/es/`, { waitUntil: "networkidle" });
  if (await app.locator(".site-header").isVisible()) problems.push(`[${w}] app: el header de la web sigue visible`);
  if (!(await app.locator(".native-bar").isVisible())) problems.push(`[${w}] app: falta la barra de la app`);
  if (await app.locator(".stores").first().isVisible()) problems.push(`[${w}] app: siguen los botones de descarga`);
  if (!(await app.locator("#planes a.app-only").isVisible())) problems.push(`[${w}] app: falta el botón para desbloquear en Planes`);
  await noHScroll(app, `[${w}] app home`);
  if (w === 375) await app.screenshot({ path: `${OUT}/app-home-375.png`, fullPage: true });
  await app.goto(`${BASE}/es/comprar/`, { waitUntil: "networkidle" });
  if (await app.locator(".stores").first().isVisible()) problems.push(`[${w}] app: la compra muestra botones de descarga`);
  await gateFlow(app, w, null, /no están disponibles/);
  if (w === 375) await app.screenshot({ path: `${OUT}/app-compra-375.png` });
  await app.context().close();
}

// Inglés: compra y portón (números en palabras en inglés)
{
  const p = await newPage(375);
  await p.goto(`${BASE}/en/cuento/${PREMIUM}/`, { waitUntil: "networkidle" });
  await gateFlow(p, 375, "porton-375-en", /inside the app/);
  await p.context().close();
}

const contrastJS = () => {
    const parse = (c) => (c.match(/[\d.]+/g) || []).map(Number);
    const lum = ([r, g, b]) => [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }).reduce((a, v, i) => a + v * [0.2126, 0.7152, 0.0722][i], 0);
    const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c.length >= 3 && (c[3] ?? 1) > 0.9) return c; } return [255, 255, 255]; };
    const out = [];
    for (const el of document.querySelectorAll("main h1, main h2, main h3, main p, main li, .chip, .btn, .site-footer a, .bottom-nav a, .tool, .thumb-name, .q-txt b, .q-txt small, .resume-body b, .resume-body small")) {
      if (!el.textContent.trim() || el.closest("[aria-hidden=true]")) continue;
      const fg = lum(parse(getComputedStyle(el).color)), bg = lum(bgOf(el));
      const ratio = (Math.max(fg, bg) + 0.05) / (Math.min(fg, bg) + 0.05);
      const big = parseFloat(getComputedStyle(el).fontSize) >= 24;
      if (ratio < (big ? 3 : 4.5)) out.push(`${el.tagName} "${el.textContent.trim().slice(0, 30)}" ${ratio.toFixed(2)}`);
    }
    return out;
  };


// ---------------------------------------------------------------------------
// Rediseño: taller de pintura, progreso, favoritos, biblioteca y contraste
// ---------------------------------------------------------------------------
const fillOf = (p, i) => p.locator(".canvas-art .f").nth(i).getAttribute("fill");
const strokes = (p) => p.locator(".ink path").count();

for (const w of WIDTHS) {
  const p = await newPage(w);
  await p.goto(`${BASE}/es/pintar/`, { waitUntil: "networkidle" });
  await noHScroll(p, `[${w}] pintar`);
  let box;
  const aim = async () => {
    await p.locator(".canvas-stack").scrollIntoViewIfNeeded();
    box = await p.locator(".canvas-stack").boundingBox();
  };
  const sweep = async () => {
    await aim();
    const x0 = box.x + box.width * 0.2, y0 = box.y + box.height * 0.3;
    await p.mouse.move(x0, y0);
    await p.mouse.down();
    for (let i = 1; i <= 12; i++) await p.mouse.move(x0 + (box.width * 0.5 * i) / 12, y0 + Math.sin(i / 2) * 12);
    await p.mouse.up();
  };

  // relleno por zonas
  await p.locator(".palette .sw").nth(1).click();
  await p.locator(".canvas-art .f").nth(1).click({ force: true });
  if ((await fillOf(p, 1)) !== "#FF6B9E") problems.push(`[${w}] pintar: el relleno no pinta (${await fillOf(p, 1)})`);
  // deshacer / rehacer
  await p.getByRole("button", { name: "Deshacer" }).click();
  if ((await fillOf(p, 1)) === "#FF6B9E") problems.push(`[${w}] pintar: deshacer no revierte el relleno`);
  await p.getByRole("button", { name: "Rehacer" }).click();
  if ((await fillOf(p, 1)) !== "#FF6B9E") problems.push(`[${w}] pintar: rehacer no repone el relleno`);
  // pincel con mouse/táctil (pointer events)
  await p.getByRole("button", { name: "Pincel" }).click();
  await p.locator(".palette .sw").nth(2).click();
  await sweep();
  if ((await strokes(p)) !== 1) problems.push(`[${w}] pintar: el pincel no deja un trazo (${await strokes(p)})`);
  if (w === 375) {
    const touch = await p.locator(".canvas-stack .ink").evaluate((el) => getComputedStyle(el).touchAction);
    if (touch !== "none") problems.push(`[${w}] pintar: con pincel el lienzo debe bloquear el scroll (touch-action=${touch})`);
  }
  if (w === 375) await p.screenshot({ path: `${OUT}/pintar-${w}-pincel.png` });
  // goma: arrastrar sobre el trazo lo borra
  await p.getByRole("button", { name: "Goma" }).click();
  await sweep();
  if ((await strokes(p)) !== 0) problems.push(`[${w}] pintar: la goma no borra el trazo`);
  await p.getByRole("button", { name: "Deshacer" }).click();
  if ((await strokes(p)) !== 1) problems.push(`[${w}] pintar: deshacer no repone el trazo borrado`);
  // goma sobre una zona: toque quita el color
  await aim();
  const zb = await p.locator(".canvas-art .f").nth(1).boundingBox();
  await p.mouse.click(zb.x + zb.width / 2, zb.y + zb.height / 2);
  if ((await fillOf(p, 1)) === "#FF6B9E") problems.push(`[${w}] pintar: la goma no quita el color de una zona`);
  await p.getByRole("button", { name: "Deshacer" }).click();
  if ((await fillOf(p, 1)) !== "#FF6B9E") problems.push(`[${w}] pintar: deshacer no repone el color borrado con la goma`);
  // guardado automático: al recargar siguen el relleno y el trazo
  await p.reload({ waitUntil: "networkidle" });
  if ((await fillOf(p, 1)) !== "#FF6B9E" || (await strokes(p)) !== 1) problems.push(`[${w}] pintar: el dibujo no se guardó en el dispositivo`);
  await p.screenshot({ path: `${OUT}/pintar-${w}.png` });
  // exportar PNG
  const [dl] = await Promise.all([p.waitForEvent("download", { timeout: 8000 }).catch(() => null), p.getByRole("button", { name: "Guardar imagen" }).click()]);
  if (!dl || dl.suggestedFilename() !== "lunacuento-luna.png") problems.push(`[${w}] pintar: no se descargó lunacuento-luna.png (${dl?.suggestedFilename()})`);
  else {
    const path = await dl.path();
    const { size } = await (await import("node:fs/promises")).stat(path);
    if (size < 3000) problems.push(`[${w}] pintar: PNG exportado demasiado pequeño (${size} bytes)`);
  }
  // reiniciar con confirmación
  await p.getByRole("button", { name: "Empezar de nuevo" }).click();
  if (!(await p.locator("dialog.confirm[open]").count())) problems.push(`[${w}] pintar: reiniciar no pide confirmación`);
  await p.getByRole("button", { name: "No", exact: true }).click();
  if ((await strokes(p)) !== 1) problems.push(`[${w}] pintar: "No" en la confirmación borró el dibujo`);
  await p.getByRole("button", { name: "Empezar de nuevo" }).click();
  await p.getByRole("button", { name: "Sí, borrar" }).click();
  if ((await strokes(p)) !== 0 || (await fillOf(p, 1)) === "#FF6B9E") problems.push(`[${w}] pintar: reiniciar no limpia el dibujo`);
  // categorías: Bosque deja solo el dibujo de Tilo
  await p.getByRole("button", { name: "Bosque" }).click();
  if ((await p.locator(".thumbs.small li").count()) !== 1) problems.push(`[${w}] pintar: el filtro por categoría no filtra`);
  // dibujo bloqueado -> pantalla de compra
  await p.getByRole("button", { name: "Todos" }).click();
  await p.getByRole("button", { name: /dragón.*bloqueado/ }).click();
  await p.waitForURL("**/comprar/", { timeout: 4000 }).catch(() => problems.push(`[${w}] pintar: el dibujo bloqueado no lleva a la compra`));
  await p.context().close();
}

// Sin la app nativa no hay botón de exportar si estamos en la app (haría falta el plugin de compartir)
{
  const p = await newPage(375);
  await p.addInitScript(NATIVE);
  await p.goto(`${BASE}/es/pintar/`, { waitUntil: "networkidle" });
  if (await p.getByRole("button", { name: "Guardar imagen" }).count()) problems.push("app: aparece 'Guardar imagen', que no funciona dentro de la app");
  await p.context().close();
}

// Progreso, favoritos y Mi biblioteca (todo en localStorage)
for (const w of WIDTHS) {
  const p = await newPage(w);
  // estado vacío (y esqueleto de carga en el HTML estático)
  await p.goto(`${BASE}/es/biblioteca/`, { waitUntil: "networkidle" });
  if (!(await p.locator(".empty-state").isVisible())) problems.push(`[${w}] biblioteca: falta el estado vacío`);
  await noHScroll(p, `[${w}] biblioteca vacía`);
  const html = await (await fetch(`${BASE}/es/biblioteca/`)).text();
  if (!html.includes("skeletons")) problems.push(`[${w}] biblioteca: el HTML estático no trae el esqueleto de carga`);

  await p.goto(`${BASE}/es/cuento/tilo-y-las-moras/`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1700);
  const fav = p.locator(w < 700 ? ".r-fav-m" : ".r-fav");
  await fav.click();
  if ((await fav.getAttribute("aria-pressed")) !== "true") problems.push(`[${w}] lector: el favorito no queda marcado`);
  const key = w < 700 ? "ArrowRight" : "ArrowRight";
  await p.keyboard.press(key); await p.waitForTimeout(1000);
  await p.keyboard.press(key); await p.waitForTimeout(1000);
  const lib = JSON.parse(await p.evaluate(() => localStorage.getItem("lc_library")));
  if (lib.progress?.["tilo-y-las-moras"]?.page !== 2) problems.push(`[${w}] lector: no guardó el progreso (${JSON.stringify(lib.progress)})`);
  if (!lib.favs.includes("tilo-y-las-moras")) problems.push(`[${w}] lector: no guardó el favorito`);

  // Sigue leyendo en el home y retoma la página
  await p.goto(`${BASE}/es/`, { waitUntil: "networkidle" });
  const cont = p.locator("#continue-title:visible, #continue-row-title:visible");
  if (!(await cont.count())) problems.push(`[${w}] home: falta "Sigue leyendo" con progreso guardado`);
  await noHScroll(p, `[${w}] home con progreso`);
  if (w <= 760 || w === 1280) await p.screenshot({ path: `${OUT}/home-${w}-sigue-leyendo.png`, fullPage: false });
  await p.locator(".resume:visible, .m-resume:visible").first().click();
  await p.locator(".book").waitFor();
  await p.waitForTimeout(w < 700 ? 1800 : 1800);
  if (!/Página 3 de/.test((await p.locator(".book").getAttribute("aria-label")) || "")) problems.push(`[${w}] lector: "Seguir leyendo" no retomó en la página 3`);

  // terminar el cuento: pasa a "Leídos" y sale de "Sigue leyendo"
  for (let i = 0; i < 4; i++) { await p.keyboard.press("ArrowRight"); await p.waitForTimeout(950); }
  const end = JSON.parse(await p.evaluate(() => localStorage.getItem("lc_library")));
  if (!end.read.includes("tilo-y-las-moras") || end.progress["tilo-y-las-moras"]) problems.push(`[${w}] lector: al terminar no quedó como leído (${JSON.stringify(end)})`);

  // un dibujo pintado aparece en "Mis dibujos"
  await p.goto(`${BASE}/es/pintar/`, { waitUntil: "networkidle" });
  await p.locator(".canvas-art .f").nth(2).click({ force: true });
  await p.goto(`${BASE}/es/biblioteca/`, { waitUntil: "networkidle" });
  for (const h of ["Favoritos", "Leídos", "Mis dibujos"]) {
    if (!(await p.getByRole("heading", { name: h }).count())) problems.push(`[${w}] biblioteca: falta la sección ${h}`);
  }
  await noHScroll(p, `[${w}] biblioteca`);
  await p.screenshot({ path: `${OUT}/biblioteca-${w}.png`, fullPage: true });
  // quitar de favoritos desde la biblioteca
  await p.getByRole("button", { name: /Quitar de favoritos/ }).click();
  if (await p.getByRole("heading", { name: "Favoritos" }).count()) problems.push(`[${w}] biblioteca: quitar favorito no actualiza la lista`);
  await p.goto(`${BASE}/es/cuentos/`, { waitUntil: "networkidle" });
  await noHScroll(p, `[${w}] cuentos`);
  // filtro por edad
  await p.getByRole("button", { name: "6–7 años" }).click();
  const shown = await p.locator(".shelf-grid a.bk").count();
  if (shown !== 2 || (await p.locator('.shelf-grid a.bk[href*="tilo"]').count())) problems.push(`[${w}] cuentos: el filtro 6–7 años debe dejar lámpara y dragón, sin Tilo (hay ${shown})`);
  await p.getByRole("button", { name: "6–7 años" }).click();
  await p.screenshot({ path: `${OUT}/cuentos-${w}.png`, fullPage: true });
  await p.context().close();
}

// Contraste AA en claro y oscuro, en las páginas principales
for (const scheme of ["light", "dark"]) {
  for (const w of [375, 1280]) {
    for (const path of ["/es/", "/es/cuentos/", "/es/pintar/", "/es/biblioteca/"]) {
      const p = await newPage(w, { colorScheme: scheme });
      await p.goto(`${BASE}${path}`, { waitUntil: "networkidle" });
      const low = await p.evaluate(contrastJS);
      low.forEach((l) => problems.push(`[${w}] ${scheme} ${path}, contraste bajo: ${l}`));
      await p.context().close();
    }
  }
}

// Modo oscuro del sistema: capturas del home y contraste del texto principal
for (const w of [1280, 375]) {
  const p = await newPage(w, { colorScheme: "dark" });
  await p.goto(`${BASE}/es/`, { waitUntil: "networkidle" });
  await noHScroll(p, `[${w}] home oscuro`);
  await p.screenshot({ path: `${OUT}/home-${w}-oscuro.png`, fullPage: true });
  const low = await p.evaluate(contrastJS);
  low.forEach((l) => problems.push(`[${w}] oscuro, contraste bajo: ${l}`));
  await p.context().close();
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
