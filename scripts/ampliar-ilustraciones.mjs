#!/usr/bin/env node
// Amplía 2× el hero y las portadas con un upscaler LOCAL y GRATUITO (Real-ESRGAN ncnn-vulkan / upscayl-bin).
// No llama a ninguna API de pago ni a internet. Pensado para correrlo en tu Mac.
//
//   node scripts/ampliar-ilustraciones.mjs --bin /Applications/Upscayl.app/Contents/Resources/bin/upscayl-bin \
//     --modelos /Applications/Upscayl.app/Contents/Resources/models --modelo digital-art-4x   # hero + portadas
//   node scripts/ampliar-ilustraciones.mjs --bin ./realesrgan-ncnn-vulkan --solo hero
//
// Opciones:
//   --bin <ruta>      ejecutable del upscaler (por defecto: realesrgan-ncnn-vulkan en el PATH; también sirve upscayl-bin)
//   --modelo <n>      modelo (por defecto realesrgan-x4plus; con Upscayl digital-art-4x; se pasa como -n)
//   --modelos <ruta>  carpeta de modelos, si no está junto al binario (se pasa como -m; alias --models). Con Upscayl: /Applications/Upscayl.app/Contents/Resources/models
//   --solo <lista>    hero, portadas o nombres del manifiesto, separados por coma (por defecto hero y portadas)
//   --salida <dir>    carpeta de ilustraciones (por defecto public/ilustraciones)
//   --motor sharp     NO usa IA: amplía con Lanczos. Solo para probar el proceso; no mejora la nitidez real
//   --dry-run         muestra el plan sin ejecutar nada
//
// Qué hace: toma la variante más grande de cada imagen, la amplía 4× con el modelo, la reduce a 2× el ancho original
// y escribe las variantes WebP nuevas, actualizando public/ilustraciones/manifest.json (srcset).
//   hero:     768, 1152, 1536, 2304, 3072 px
//   portadas: 336, 672, 1008, 1344 px
import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve } from "node:path";
import { promisify } from "node:util";
import sharp from "sharp";

const run = promisify(execFile);
const args = process.argv.slice(2);
const flag = (n) => args.includes(`--${n}`);
const val = (n, d) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 && args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : d;
};

const OUT = resolve(val("salida", "public/ilustraciones"));
const bin = val("bin", "realesrgan-ncnn-vulkan");
const modelo = val("modelo", "realesrgan-x4plus");
const models = val("modelos", val("models", "")); // --modelos (alias: --models)
const motor = val("motor", "ia");
const dry = flag("dry-run");

const HERO = [768, 1152, 1536, 2304, 3072];
const PORTADA = [336, 672, 1008, 1344];
const manifestPath = join(OUT, "manifest.json");
const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

const solo = val("solo", "hero,portadas").split(",").map((s) => s.trim()).filter(Boolean);
const nombres = Object.keys(manifest).filter((n) => solo.some((s) => (s === "hero" && n.startsWith("hero-")) || (s === "portadas" && n.startsWith("portada-")) || s === n));
if (!nombres.length) {
  console.error("Nada que ampliar: no hay entradas del manifiesto que coincidan con", solo.join(","));
  process.exit(1);
}

console.log(`Motor: ${motor === "sharp" ? "Lanczos (SOLO PRUEBA)" : `${bin} · modelo ${modelo}`} · salida ${OUT}`);
const tmp = await mkdtemp(join(tmpdir(), "lunacuento-ampliar-"));
try {
  for (const nombre of nombres) {
    const e = manifest[nombre];
    const archivo = join(OUT, basename(e.src));
    const widths = nombre.startsWith("hero-") ? HERO : PORTADA;
    const destino = widths[widths.length - 1];
    console.log(`→ ${nombre}: ${basename(e.src)} (${e.width}px) → variantes ${widths.join(", ")}`);
    if (dry) continue;

    const entrada = join(tmp, `${nombre}-in.png`);
    const salida4x = join(tmp, `${nombre}-4x.png`);
    await sharp(archivo).png().toFile(entrada);
    if (motor === "sharp") {
      await sharp(entrada).resize({ width: e.width * 4, kernel: "lanczos3" }).png().toFile(salida4x);
    } else {
      const a = ["-i", entrada, "-o", salida4x, "-n", modelo, "-s", "4", ...(models ? ["-m", models] : [])];
      try {
        await run(bin, a, { maxBuffer: 1 << 28 });
      } catch (err) {
        console.error(err.code === "ENOENT"
          ? `\nNo encuentro el upscaler "${bin}". Pasa su ruta con --bin ./realesrgan-ncnn-vulkan (ver docs/ampliar-ilustraciones.md).`
          : `\nEl upscaler falló: ${err.stderr || err.message}`);
        process.exit(1);
      }
    }
    const grande = await sharp(salida4x).resize({ width: destino, kernel: "lanczos3" }).png().toBuffer(); // 2× del ancho original
    for (const w of widths) {
      await sharp(grande).resize({ width: w, kernel: "lanczos3" }).webp({ quality: 84, effort: 5 }).toFile(join(OUT, `${nombre}-${w}.webp`));
    }
    const base = widths.includes(e.width) ? e.width : widths[widths.length - 1];
    manifest[nombre] = {
      src: `/ilustraciones/${nombre}-${base}.webp`,
      width: base,
      height: Math.round((e.height / e.width) * base),
      srcset: widths.map((w) => `/ilustraciones/${nombre}-${w}.webp ${w}w`).join(", "),
    };
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2) + "\n");
    console.log(`  ✔ ${widths.length} variantes escritas`);
  }
} finally {
  await rm(tmp, { recursive: true, force: true });
}
console.log(dry ? "\nPlan (dry-run): no se escribió nada." : "\nListo. Revisa la nitidez a ojo y haz commit de public/ilustraciones/.");
