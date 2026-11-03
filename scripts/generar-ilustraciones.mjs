#!/usr/bin/env node
// Genera las ilustraciones definitivas con la API de OpenAI (modelo gpt-image-2, siempre) y las guarda en WebP.
// Se ejecuta en tu máquina. La clave se lee SOLO de la variable de entorno OPENAI_API_KEY (nunca se guarda en el repo).
//
//   node --env-file=.env.local scripts/generar-ilustraciones.mjs --solo hero
//
// Opciones:
//   --solo <lista>       nombres o grupos separados por coma: hero, portadas, accesos, colorear, o un nombre exacto
//   --tope <US$>         tope de gasto estimado acumulado (por defecto 8). Se detiene antes de pasarlo
//   --factor-costo <n>   multiplica la estimación (por defecto 1); úsalo cuando confirmes el precio real en tu facturación
//   --calidad <q>        fuerza low | medium | high en todas (por defecto la del plan B)
//   --forzar             regenera aunque el archivo ya exista (cuenta como gasto nuevo)
//   --dry-run            muestra qué haría y cuánto costaría; NO llama a la API
//   --simular            prueba todo el proceso (WebP, srcset, manifiesto, contador) con una imagen falsa; NO llama a la API
//   --salida <carpeta>   carpeta de salida (por defecto public/ilustraciones; con --simular, una carpeta temporal)
//   --clave-por-proxy    no envía clave: la agrega el proxy de la sesión de Claude Code (network secret de api.openai.com)
//   --reiniciar-gasto    pone el contador acumulado en cero
// Variable opcional OPENAI_BASE_URL: solo para pruebas con un servidor falso (por defecto https://api.openai.com/v1).
import { mkdir, readFile, writeFile, access, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import sharp from "sharp";
import { BASE_ESTILO, BASE_LINEA, IMAGENES, PRECIOS } from "./ilustraciones.config.mjs";

const MODELO = "gpt-image-2"; // siempre este modelo
const LEDGER = resolve("scripts/.gasto-ilustraciones.json");

const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const val = (n, def) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : def;
};

const tope = Number(val("tope", 8));
const factor = Number(val("factor-costo", 1));
const calidadForzada = val("calidad", "");
const simular = flag("simular");
const porProxy = flag("clave-por-proxy");
const dry = flag("dry-run");
let salida = val("salida", "");
if (!Number.isFinite(tope) || tope <= 0 || !Number.isFinite(factor) || factor <= 0) {
  console.error("--tope y --factor-costo deben ser números positivos.");
  process.exit(1);
}

const estimar = (img, q) => PRECIOS[img.w === img.h ? "cuadrada" : "apaisada"][q] * factor;
const fmt = (n) => `US$${n.toFixed(3)}`;

async function leerGasto() {
  try {
    return JSON.parse(await readFile(LEDGER, "utf8")).total ?? 0;
  } catch {
    return 0;
  }
}
async function guardarGasto(total) {
  await writeFile(LEDGER, JSON.stringify({ total: Math.round(total * 1e4) / 1e4, nota: "estimado, no es tu facturación real" }, null, 2));
}
const existe = (p) => access(p).then(() => true, () => false);

// ---- selección ----
const solo = val("solo", "").split(",").map((s) => s.trim()).filter(Boolean);
const lista = IMAGENES.filter((i) => !solo.length || solo.some((s) => s === i.group || s === i.name || i.name.startsWith(s)));
if (!lista.length) {
  console.error(`Nada coincide con --solo ${solo.join(",")}. Grupos: hero, portadas, accesos, colorear.`);
  process.exit(1);
}

if (flag("reiniciar-gasto")) await guardarGasto(0);
let gastado = await leerGasto();

if (simular && !salida) salida = await mkdtemp(join(tmpdir(), "lunacuento-sim-"));
const OUT = resolve(salida || "public/ilustraciones");
await mkdir(OUT, { recursive: true });
const manifestPath = join(OUT, "manifest.json");
const manifest = (await existe(manifestPath)) ? JSON.parse(await readFile(manifestPath, "utf8")) : {};

console.log(`Modelo: ${MODELO} · tope ${fmt(tope)} · gastado antes (estimado) ${fmt(gastado)} · salida ${OUT}`);
if (!dry && !simular && !porProxy && !process.env.OPENAI_API_KEY) {
  console.error("Falta OPENAI_API_KEY en el entorno. Ejemplo: node --env-file=.env.local scripts/generar-ilustraciones.mjs --solo hero\n(En una sesión de Claude Code con la clave como network secret, usa --clave-por-proxy.)");
  process.exit(1);
}

const promptDe = (img) => `${img.estilo === "linea" ? BASE_LINEA : BASE_ESTILO}\n\n${img.prompt}`;

async function pedirImagen(img, q) {
  const r = await fetch(`${process.env.OPENAI_BASE_URL || "https://api.openai.com/v1"}/images/generations`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(process.env.OPENAI_API_KEY ? { Authorization: `Bearer ${process.env.OPENAI_API_KEY}` } : {}) },
    body: JSON.stringify({ model: MODELO, prompt: promptDe(img), size: img.size, quality: q, n: 1 }),
  });
  const body = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(`API ${r.status}: ${body?.error?.message ?? JSON.stringify(body).slice(0, 300)}`);
  const d = body.data?.[0];
  if (d?.b64_json) return Buffer.from(d.b64_json, "base64");
  if (d?.url) return Buffer.from(await (await fetch(d.url)).arrayBuffer());
  throw new Error("La respuesta no trae imagen (ni b64_json ni url).");
}

/** Imagen falsa del tamaño correcto para probar el proceso sin gastar nada. */
async function imagenFalsa(img) {
  const linea = img.kind === "linea";
  const svg = linea
    ? `<svg xmlns="http://www.w3.org/2000/svg" width="${img.w}" height="${img.h}"><rect width="100%" height="100%" fill="#fff"/><g fill="none" stroke="#000" stroke-width="6"><circle cx="${img.w / 2}" cy="${img.h / 2}" r="${img.h / 4}"/><rect x="${img.w * 0.1}" y="${img.h * 0.1}" width="${img.w * 0.2}" height="${img.h * 0.2}"/></g></svg>`
    : `<svg xmlns="http://www.w3.org/2000/svg" width="${img.w}" height="${img.h}"><rect width="100%" height="100%" fill="#6D5BFF"/><circle cx="${img.w * 0.7}" cy="${img.h * 0.3}" r="${img.h * 0.15}" fill="#FFE08A"/></svg>`;
  return sharp(Buffer.from(svg)).png().toBuffer();
}

/** Guarda las variantes WebP y devuelve la entrada del manifiesto (srcset incluido). */
async function procesar(img, buf) {
  const sub = img.kind === "linea";
  const widths = [...img.widths].sort((a, b) => a - b);
  const archivos = [];
  for (const w of widths) {
    const file = `${img.name}-${w}.webp`;
    const pipe = sharp(buf).resize({ width: w, withoutEnlargement: true });
    // Los dibujos de línea van sin pérdida: el relleno por píxeles necesita líneas nítidas.
    await (sub ? pipe.webp({ lossless: true }) : pipe.webp({ quality: 82, effort: 5 })).toFile(join(OUT, file));
    archivos.push({ file, w });
  }
  const mayor = archivos[archivos.length - 1];
  const alto = Math.round((img.h / img.w) * mayor.w);
  return {
    src: `/ilustraciones/${mayor.file}`,
    width: mayor.w,
    height: alto,
    ...(archivos.length > 1 ? { srcset: archivos.map((a) => `/ilustraciones/${a.file} ${a.w}w`).join(", ") } : {}),
  };
}

let hechas = 0;
let detenido = false;
for (const img of lista) {
  const q = calidadForzada || img.quality;
  const costo = estimar(img, q);
  const yaEsta = (await existe(join(OUT, `${img.name}-${img.widths.at(-1)}.webp`))) && !flag("forzar");
  if (yaEsta) {
    console.log(`= ${img.name}: ya existe (usa --forzar para regenerar)`);
    continue;
  }
  if (!simular && gastado + costo > tope) {
    console.log(`■ TOPE: ${img.name} costaría ~${fmt(costo)} y el acumulado pasaría de ${fmt(tope)} (llevas ${fmt(gastado)}). Me detengo.`);
    detenido = true;
    break;
  }
  if (dry) {
    console.log(`· ${img.name}: ${img.size} ${q} → ~${fmt(costo)} (acumulado ${fmt(gastado + costo)})`);
    gastado += costo;
    hechas++;
    continue;
  }
  process.stdout.write(`→ ${img.name} (${img.size}, ${q}, ~${fmt(costo)}) … `);
  try {
    const buf = simular ? await imagenFalsa(img) : await pedirImagen(img, q);
    manifest[img.name] = await procesar(img, buf);
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    if (!simular) {
      gastado += costo;
      await guardarGasto(gastado);
    }
    hechas++;
    console.log(`listo · acumulado estimado ${fmt(simular ? 0 : gastado)}`);
  } catch (e) {
    console.log(`ERROR: ${e.message}`);
    console.log("  (Un error de la API normalmente no se cobra; el contador no sumó esta imagen. No reintento solo.)");
    process.exitCode = 1;
    break;
  }
}

console.log(`\n${dry ? "Plan (dry-run)" : "Resumen"}: ${hechas} imagen(es) ${dry ? "planificadas" : "generadas"}, gasto estimado acumulado ${fmt(dry ? gastado : simular ? 0 : gastado)} de ${fmt(tope)}${detenido ? " (detenido por el tope)" : ""}.`);
if (!dry && !simular && hechas) console.log("Las cifras son ESTIMADAS con precios no verificados: compáralas con tu facturación de OpenAI y ajusta --factor-costo.");
if (simular) {
  console.log(`Simulación: archivos en ${OUT}`);
  if (!val("salida", "")) await rm(OUT, { recursive: true, force: true });
}
