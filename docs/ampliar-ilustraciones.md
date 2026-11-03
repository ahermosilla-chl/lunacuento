# Ampliar el hero y las portadas (local, gratis)

El hero (1536 px) se estira en pantallas grandes y Retina. Este paso lo amplía **2×** con un upscaler de IA que corre en tu Mac: **no usa créditos de OpenAI ni internet**.

## 1. Instalar el upscaler (una sola vez)
Real-ESRGAN ncnn-vulkan (proyecto `xinntao/Real-ESRGAN-ncnn-vulkan`, licencia BSD-3): en su página de *Releases* en GitHub baja el `.zip` para **macOS**, descomprímelo y entra a la carpeta (trae el ejecutable `realesrgan-ncnn-vulkan` y la carpeta `models/` con `realesrgan-x4plus`). Si prefieres Upscayl, su binario `upscayl-bin` acepta los mismos argumentos.

> No pude instalarlo ni ejecutarlo en la sesión de Claude Code: el nombre exacto del zip y la primera ejecución en macOS (permisos de "desarrollador no identificado") conviene verificarlos tú. Si macOS lo bloquea: `xattr -d com.apple.quarantine ./realesrgan-ncnn-vulkan` y `chmod +x ./realesrgan-ncnn-vulkan`.

## 2. Ampliar (comando exacto)
Desde la raíz del repo, con la ruta al ejecutable que descargaste:

```bash
node scripts/ampliar-ilustraciones.mjs --bin ~/Descargas/realesrgan-ncnn-vulkan/realesrgan-ncnn-vulkan
```

Solo el hero:

```bash
node scripts/ampliar-ilustraciones.mjs --bin ~/Descargas/realesrgan-ncnn-vulkan/realesrgan-ncnn-vulkan --solo hero
```

Si la carpeta `models/` no está junto al ejecutable, añade `--models ~/Descargas/realesrgan-ncnn-vulkan/models`. Para ver el plan sin ejecutar: `--dry-run`.

## 3. Qué genera
- **Hero**: `hero-inicio-{768,1152,1536,2304,3072}.webp` (srcset hasta 3072 px).
- **Portadas**: `portada-*-{336,672,1008,1344}.webp`.
- Actualiza `public/ilustraciones/manifest.json`. Revisa a ojo (sin halos ni texturas raras) y haz commit de `public/ilustraciones/`.

Nota: de las portadas solo quedó guardada la variante de 672 px (el original de 1024 no se conservó), así que su ampliación parte de 672 px.

## Probar el proceso sin IA
`--motor sharp` amplía con Lanczos (no mejora la nitidez real); sirve para comprobar archivos y srcset: `node scripts/ampliar-ilustraciones.mjs --motor sharp --salida /tmp/prueba --solo hero`.

## Pasos en tu Mac, de a uno
1. Entra al repo y trae esta rama:
   ```bash
   cd ~/ruta/a/lunacuento && git fetch origin && git checkout claude/lunacuento-hero-compacto && git pull
   ```
2. Baja Real-ESRGAN ncnn-vulkan para macOS (Releases de `xinntao/Real-ESRGAN-ncnn-vulkan`), descomprímelo en `~/Descargas/realesrgan-ncnn-vulkan` y desbloquéalo:
   ```bash
   xattr -dr com.apple.quarantine ~/Descargas/realesrgan-ncnn-vulkan && chmod +x ~/Descargas/realesrgan-ncnn-vulkan/realesrgan-ncnn-vulkan
   ```
3. Ver el plan sin ejecutar (hero hasta 3072 px y portadas):
   ```bash
   node scripts/ampliar-ilustraciones.mjs --bin ~/Descargas/realesrgan-ncnn-vulkan/realesrgan-ncnn-vulkan --dry-run
   ```
4. Ampliar de verdad (hero + portadas):
   ```bash
   node scripts/ampliar-ilustraciones.mjs --bin ~/Descargas/realesrgan-ncnn-vulkan/realesrgan-ncnn-vulkan
   ```
5. Revisa a ojo `public/ilustraciones/hero-inicio-3072.webp` (sin halos ni texturas raras) y haz commit y push:
   ```bash
   git add public/ilustraciones && git commit -m "Hero y portadas ampliados 2x (Real-ESRGAN)" && git push
   ```
