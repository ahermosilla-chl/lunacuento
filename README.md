# Lunacuento

Cuentos digitales bilingües (ES/EN) para niños de 0 a 7 años: con su nombre, lectura acompañada, modo dormir y dibujos para colorear.

- **Modelo**: app gratis con 2 cuentos en App Store y Google Play; pago único de **US$7,99** (compra no consumible) para la biblioteca completa.
- **Web**: vitrina estática que muestra la app, deja leer los cuentos gratis y lleva a las tiendas.
- Especificación: [`CLAUDE.md`](CLAUDE.md) · Diseño: [`docs/diseno/`](docs/diseno/) · Auditoría: [`docs/AUDITORIA.md`](docs/AUDITORIA.md)

## Requisitos

Node.js 20 o superior.

```bash
npm install
npm run dev        # http://localhost:3000 (redirige a /es o /en)
npm run build      # genera el sitio estático en out/
npm run lint
```

La web y los cuentos gratis funcionan sin variables de entorno. Solo la app nativa necesita las claves públicas de RevenueCat (`NEXT_PUBLIC_RC_IOS_KEY`, `NEXT_PUBLIC_RC_ANDROID_KEY`); ver `.env.example`.

## Modo de prueba

Para probar la funcionalidad antes de configurar los pagos:

```bash
echo 'NEXT_PUBLIC_MODO_PRUEBA=1' >> .env.local
npm run build            # o npm run build:app para la app
```

Con `NEXT_PUBLIC_MODO_PRUEBA=1` todos los cuentos premium (y sus dibujos) quedan desbloqueados, no hay candados ni pantalla de compra (`/comprar` vuelve al estante) y el pie del sitio dice "Modo de prueba". Con la variable vacía o ausente todo funciona como siempre. La variable se incrusta al compilar: si la cambias, vuelve a compilar o a desplegar. **No la actives en la versión que se sube a las tiendas.** Comprobación automática: compilar con la variable, servir `out/` y `npm run probar:modo-prueba`.

## Sitio estático (listo para Capacitor)

`next.config.ts` usa `output: "export"`: `npm run build` deja todo en `out/` (HTML, JS, CSS, fuentes embebidas e ilustraciones). No hay middleware ni rutas de servidor:

- `/` elige el idioma en el cliente (idioma guardado o `navigator.languages`).
- `/[lang]/cuento/[id]` se genera con `generateStaticParams`.
- Las fuentes (Baloo 2 y Nunito) se descargan en el build con `next/font` y quedan dentro de `out/_next/static/media`. El build necesita acceso a Google Fonts.

La carpeta `out/` es la que empaqueta Capacitor (ver abajo).

## App iOS y Android (Capacitor)

`capacitor.config.ts`: `appId com.lunacuento.app`, `appName Lunacuento`, `webDir out`. Los proyectos nativos están en `ios/` y `android/`.

```bash
npm run build:app    # next build + cap sync (copia out/ a ios/ y android/)
npm run cap:ios      # abre Xcode (solo en Mac)
npm run cap:android  # abre Android Studio
npm run assets       # regenera ícono y splash desde assets/*.svg
```

- **Compras**: `src/lib/purchases.ts` (RevenueCat). Producto `lunacuento_biblioteca`, entitlement `biblioteca`. Sin claves, o en la web, responde "no disponible" sin romper nada.
- **Portón para adultos**: `src/components/ParentalGate.tsx`, antes de comprar, restaurar y abrir enlaces externos.
- **Cuento con candado**: `premium: true` en `src/lib/stories.ts`; tocarlo abre la pantalla de compra (`Paywall`).
- En la app se oculta el header de la web y los botones "descarga la app" (`<html data-native>`).
- Probar en simulador/emulador (Mac): [`docs/PROBAR-EN-MAC.md`](docs/PROBAR-EN-MAC.md).
- Guía completa de publicación: [`docs/PUBLICAR.md`](docs/PUBLICAR.md).

## Revisión visual

```bash
npm run build
node scripts/servir-estatico.mjs &   # sirve out/ en http://localhost:4173
npm run capturas                      # Playwright en 375, 768 y 1280 px
```

`scripts/capturas.mjs` guarda capturas en `docs/capturas/` (incluye `compra-*`, `porton-*` y `app-*`) y falla si el portón o la compra no funcionan, si en modo app (Capacitor simulado) sigue visible el header web, si hay scroll horizontal, errores de consola, si el arrastre de página no funciona, si el nombre no llega al estante/lector, si colorear no pinta, o si `prefers-reduced-motion` no se respeta. Usa el Chrome instalado (`CHROME_PATH`, por defecto `/usr/bin/google-chrome`).

## Publicar la web

Cualquier hosting estático sirve la carpeta `out/`. En Vercel el repo ya trae `vercel.json` (`npm run build`, salida `out/`, `trailingSlash`): importar el repo y listo. Para que las previews usen el modo de prueba, crear `NEXT_PUBLIC_MODO_PRUEBA=1` solo en el entorno *Preview* (pasos exactos en el PR de despliegue y en la sección de arriba).

Antes de publicar, reemplazar en `src/lib/stores.ts` los marcadores `[APP_STORE_URL]` y `[PLAY_STORE_URL]` por los enlaces reales. Mientras sean marcadores, los botones muestran un aviso de "muy pronto".

## Estructura

```
src/app/(raiz)/          "/" con redirección de idioma en el cliente
src/app/[lang]/          inicio, cuentos, pintar, biblioteca, lector (cuento/[id]), comprar, privacidad, términos
src/app/[lang]/comprar/  pantalla de compra (Biblioteca completa)
src/components/          Hero, Shelf, Paint (taller), MyLibrary, Reader (libro), Paywall, ParentalGate, BottomNav, etc.
src/lib/library.ts       progreso, favoritos y leídos (localStorage)
src/lib/paint*.ts        estado, guardado y exportación de dibujos
src/lib/purchases.ts     compras con RevenueCat (iniciar, comprar, restaurar, entitlement)
ios/ android/            proyectos de Capacitor
src/lib/stories.ts       cuentos ES/EN y tipos (image / audio listos para fases 3 y 4)
src/lib/i18n.ts          textos ES/EN
src/lib/art.ts           ilustraciones vectoriales deterministas y dibujos para colorear
```

## Datos preparados para las próximas fases

Cada página (`StoryPage`) acepta:

- `image?: { src, width, height, alt }` — ilustración definitiva (fase 3, `gpt-image-2`), archivo local.
- `audio?: { es?: PageAudio, en?: PageAudio }` con `{ src, recordedName, words: [{ word, start, end }] }` — narración con tiempos por palabra (fase 4, ElevenLabs). Si existe y coincide con el nombre, el lector la usa en vez de `speechSynthesis`.

No se usan créditos de OpenAI ni ElevenLabs sin autorización explícita del dueño.

## Privacidad

Del niño solo se guarda el nombre, en el dispositivo (`localStorage`). Sin cuentas, sin anuncios, sin rastreadores. Las compras las valida la tienda con RevenueCat (identificador anónimo).

## Ilustraciones (gpt-image-2)

Se generan en tu máquina, no en el sitio. Guía de estilo: [`docs/guia-ilustracion.md`](docs/guia-ilustracion.md); presupuesto: [`docs/presupuesto-ilustraciones.md`](docs/presupuesto-ilustraciones.md).

```bash
node --env-file=.env.local scripts/generar-ilustraciones.mjs --solo hero      # imagen de prueba
node scripts/generar-ilustraciones.mjs --dry-run                              # plan y costo sin llamar a la API
```

`OPENAI_API_KEY` solo se lee del entorno (`.env.local` está en `.gitignore`). Contador de gasto estimado con tope (8 US$).
Pruebas del taller por píxeles sin generar imágenes: `npm run probar:raster` (usa un dibujo falso temporal).

## Diseño

Paleta violeta/amarillo y tipografías Baloo 2 + Nunito (tokens en `CLAUDE.md` y `src/app/globals.css`). El lector sigue siendo un libro. Las ilustraciones definitivas pendientes están marcadas con `ILUSTRACION-PENDIENTE` (`grep -rn ILUSTRACION-PENDIENTE src`). Capturas del diseño anterior en `docs/capturas/antes/`.
