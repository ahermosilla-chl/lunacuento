// Comprueba el modo de prueba. Requiere un build hecho con NEXT_PUBLIC_MODO_PRUEBA=1 servido en BASE_URL:
//   NEXT_PUBLIC_MODO_PRUEBA=1 npm run build && node scripts/servir-estatico.mjs &  luego  npm run probar:modo-prueba
import { chromium } from "playwright-core";

const BASE = process.env.BASE_URL || "http://localhost:4173";
const executablePath = process.env.CHROME_PATH || "/usr/bin/google-chrome";
const PREMIUM = "el-dragon-que-no-podia-dormir";
const problems = [];
const browser = await chromium.launch({ executablePath, args: ["--no-sandbox"] });

for (const [label, init] of [["web", () => {}], ["app", () => { window.Capacitor = { isNativePlatform: () => true, getPlatform: () => "ios" }; }]]) {
  const ctx = await browser.newContext({ viewport: { width: 375, height: 812 }, hasTouch: true, locale: "es-CL" });
  await ctx.addInitScript(init);
  const page = await ctx.newPage();
  page.on("console", (m) => { if (m.type() === "error") problems.push(`[${label}] consola: ${m.text()}`); });
  page.on("pageerror", (e) => problems.push(`[${label}] error: ${e.message}`));

  await page.goto(`${BASE}/es/`, { waitUntil: "networkidle" });
  if (await page.locator(".shelf-grid .lock-on").count()) problems.push(`[${label}] el estante muestra candado en modo de prueba`);
  if (!(await page.locator(".site-footer").textContent())?.includes("Modo de prueba")) problems.push(`[${label}] el pie no avisa del modo de prueba`);
  // el aviso del estante no deja un tablón vacío (va fuera de la grilla en pantallas chicas)
  if (await page.locator(".shelf-aside.in-grid").isVisible()) problems.push(`[${label}] el aviso del estante sigue dentro de la grilla en 375 px`);

  // tocar el libro premium abre el lector, no la compra
  await page.locator(`a.bk[href*="${PREMIUM}"]`).click();
  await page.waitForURL(`**/cuento/${PREMIUM}/`);
  await page.locator(".book").waitFor({ timeout: 4000 }).catch(() => problems.push(`[${label}] el cuento premium no abre el lector`));
  if (await page.locator(".paywall").count()) problems.push(`[${label}] aparece la pantalla de compra`);

  // la ruta de compra vuelve al estante
  await page.goto(`${BASE}/es/comprar/`);
  await page.waitForURL(/\/es\/(#cuentos)?$/, { timeout: 5000 }).catch(() => problems.push(`[${label}] /comprar no vuelve al estante (${page.url()})`));
  if (await page.getByRole("button", { name: "Comprar" }).count()) problems.push(`[${label}] /comprar muestra el botón Comprar`);
  await ctx.close();
}

await browser.close();
if (problems.length) {
  console.error("PROBLEMAS:\n- " + problems.join("\n- "));
  process.exit(1);
}
console.log("Modo de prueba OK");
