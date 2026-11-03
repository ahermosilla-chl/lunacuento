# Presupuesto de ilustraciones (gpt-image-2)

**Estado: PENDIENTE DE AUTORIZACIÓN. No se ha llamado a la API de OpenAI.** Modelo: siempre `gpt-image-2`.
Las imágenes no llevan texto (los títulos, edades y botones son HTML). Todas siguen la guía única `docs/guia-ilustracion.md` (se escribe al autorizar).

## Lista (15 imágenes)

| # | Archivo (en `public/ilustraciones/`) | Se genera a | Se publica (WebP) | Uso |
|---|---|---|---|---|
| 1 | `hero-inicio.webp` | 1536×1024 | srcset 768 / 1152 / 1536 px | Hero: personaje infantil con mascota leyendo un libro que brilla, paisaje con castillo, luna y cielo violeta claro con nubes. La zona central queda despejada para título y estante. |
| 2 | `portada-lampara-de-la-luna.webp` | 1024×1536 | srcset 336 / 672 px | Portada con volumen · La lámpara de la luna |
| 3 | `portada-tilo-y-las-moras.webp` | 1024×1536 | srcset 336 / 672 px | Portada · Tilo y las moras |
| 4 | `portada-dragon-que-no-podia-dormir.webp` | 1024×1536 | srcset 336 / 672 px | Portada · El dragón que no podía dormir |
| 5 | `portada-primer-dia-de-jardin.webp` | 1024×1536 | srcset 336 / 672 px | Portada "Pronto" |
| 6 | `portada-un-hermanito-en-casa.webp` | 1024×1536 | srcset 336 / 672 px | Portada "Pronto" |
| 7 | `portada-adios-chupete.webp` | 1024×1536 | srcset 336 / 672 px | Portada "Pronto" |
| 8 | `acceso-leer.webp` | 1024×1024 | srcset 256 / 512 px | Acceso grande "Leer cuentos" (libro con estrellas) |
| 9 | `acceso-pintar.webp` | 1024×1024 | srcset 256 / 512 px | Acceso grande "Pintar dibujos" (paleta y pinceles) |
| 10 | `colorear-luna.webp` | 1536×1024 | 1200 y 600 px | Línea negra en blanco · La lámpara de la luna |
| 11 | `colorear-tilo.webp` | 1536×1024 | 1200 y 600 px | Línea negra · Tilo y las moras |
| 12 | `colorear-dragon.webp` | 1536×1024 | 1200 y 600 px | Línea negra · El dragón |
| 13 | `colorear-leon.webp` | 1536×1024 | 1200 y 600 px | Extra (el león del mockup) |
| 14 | `colorear-castillo.webp` | 1536×1024 | 1200 y 600 px | Extra (el castillo del hero) |
| 15 | `colorear-zorro.webp` | 1536×1024 | 1200 y 600 px | Extra (la mascota del hero) |

Nota técnica: hoy el taller pinta **zonas SVG predefinidas**. Los dibujos generados son raster, así que el taller necesitará **relleno por píxeles** (zonas cerradas, líneas binarizadas y engrosadas para tapar fugas). Es trabajo de código, sin costo de API, y se hace al integrarlos.

## Costo estimado

**No verificado en la documentación oficial** (esta sesión no puede abrir `platform.openai.com` ni `openai.com`). Cifras de terceros que citan los ejemplos de OpenAI; para 1536×1024 y 1024×1536 las fuentes se contradicen (una calcula la mitad), por eso uso la más alta como cota.

| Calidad | 1024×1024 | 1536×1024 / 1024×1536 |
|---|---|---|
| baja | US$0,006 | US$0,005 |
| media | US$0,053 | US$0,041 |
| alta | US$0,211 | US$0,165 |

| Plan | Cálculo | Total | Con 2× reintentos |
|---|---|---|---|
| A · todo media | 13 × 0,041 + 2 × 0,053 | **US$0,64** | US$1,28 |
| **B · recomendado** (alta: hero, portadas y accesos; media: dibujos de línea) | 7 × 0,165 + 2 × 0,211 + 6 × 0,041 | **US$1,82** | **US$3,65** |
| C · todo alta | 13 × 0,165 + 2 × 0,211 | US$2,57 | US$5,13 |

Cota pesimista del plan B (si las imágenes no cuadradas costaran como las cuadradas): US$2,22; con 2× reintentos US$4,43. Tope de gasto propuesto: **US$5**.

## Antes de generar hace falta
1. Tu autorización explícita (y qué plan: A, B o C, y el tope).
2. Confirmar el precio vigente (o permitir `platform.openai.com` en la red de la sesión para que lo lea).
3. Poder llamar a la API: **esta sesión no resuelve `api.openai.com` y no tiene `OPENAI_API_KEY`**. O bien permites ese host y añades la clave como secreto del entorno, o yo dejo listo `scripts/generar-ilustraciones.mjs` y lo ejecutas tú en tu máquina.
