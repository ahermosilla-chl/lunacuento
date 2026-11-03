# Guía de ilustración de Lunacuento

Una sola guía para que todas las imágenes sean de la misma familia (aunque cambien los personajes). Modelo: **siempre `gpt-image-2`**. Los prompts viven en `scripts/ilustraciones.config.mjs` (`BASE_ESTILO` y `BASE_LINEA` se anteponen a cada imagen); si cambias el estilo, cámbialo allí y aquí.

## Estilo único
- **Técnica**: ilustración infantil premium, **3D / 2.5D** con aire artesanal de arcilla y fieltro: formas redondeadas y rellenas, volumen suave, luz clave cálida con luz de contorno suave, oclusión ambiental sutil, sombras suaves, poca profundidad de campo.
- **Paleta** (la de `CLAUDE.md`): cielo violeta claro (`#6D5BFF` a lila pálido) y azul índigo `#2D2877`; amarillo luna `#FFC94D` / `#FFE08A`; turquesa `#00C2AB`; rosa `#FF6B9E`; celeste `#4FA9F0`; naranja `#FF8A4C`; crema `#FFF0C2`; sombras en azul tinta `#0F1B3D`. Colores vivos, nunca neón; ambiente calmado de antes de dormir.
- **Personajes**: ojos grandes y amables, caras simples, nada de miedo ni violencia. El niño del hero es de aspecto neutro (cabello castaño ondulado, suéter lavanda) para servir a niñas y niños; mascota: cachorro de zorro naranja.
- **Sin texto**: ninguna letra, número, logo ni firma dentro de las imágenes (los títulos, edades y botones son HTML). Sin marcos ni bordes.
- **Composición**: dejar zonas tranquilas donde irán títulos (30 % inferior de las portadas; centro y parte alta del hero).

## Prompt base (resumen; el texto exacto está en el script)
> Premium children's picture-book illustration for ages 3 to 7. Soft 3D / 2.5D look with a handmade clay-and-felt feel … Palette: light lavender-violet sky and deep indigo, warm moon yellow, turquoise, warm pink, sky blue, orange, soft cream, navy ink for shadows … ABSOLUTELY NO text, letters, numbers, logos, signatures or watermarks. Same artist, same materials, same lighting in every image of the series.

## Dibujos para colorear (línea)
Líneas negras gruesas y parejas sobre blanco puro, **todas las formas cerradas** (sin huecos), formas grandes y simples, sin sombreado, sin grises, sin rellenos negros, sin marco. Se guardan **WebP sin pérdida** porque el taller rellena por píxeles. Si una zona no cierra bien, el relleno "se escapa": regenerar esa imagen (`--forzar`).

## Cómo generar (en tu Mac)
Calidad del plan B (alta en hero, portadas y accesos; media en dibujos de línea). Primero **solo el hero de prueba**:

```bash
export OPENAI_API_KEY="sk-..."          # o: node --env-file=.env.local …  (.env.local no se sube al repo)
node scripts/generar-ilustraciones.mjs --solo hero
```

Opciones útiles: `--dry-run` (plan y costo sin llamar a la API), `--simular` (prueba el proceso sin API), `--solo portadas|accesos|colorear|<nombre>`, `--tope 8`, `--factor-costo 1.5`, `--calidad medium`, `--forzar`. El script lleva un **contador estimado acumulado** (`scripts/.gasto-ilustraciones.json`, no se sube) y **se detiene antes de pasar el tope** (8 US$ por defecto). Los precios son estimaciones **no verificadas**: compáralos con tu facturación tras el hero y ajusta `--factor-costo`.

## Salida
`public/ilustraciones/<nombre>-<ancho>.webp` (variantes para `srcset`) y `public/ilustraciones/manifest.json` (ruta, tamaño y `srcset` de cada imagen). La web lee el manifiesto: **si una imagen no está, usa el placeholder vectorial** (`ILUSTRACION-PENDIENTE`), así que se puede entregar por partes.

## Revisión de cada imagen (checklist)
- [ ] Sin texto ni letras raras. [ ] Misma luz y materiales que las demás. [ ] Zona tranquila para título. [ ] Sin elementos de miedo. [ ] Paleta reconocible (violeta/amarillo/turquesa). [ ] Línea: sin huecos, sin grises.
