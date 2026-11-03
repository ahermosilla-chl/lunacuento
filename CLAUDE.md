# Lunacuento

Web premium y bilingüe (español / inglés) de cuentos digitales para niños de 0 a 7 años. Cada cuento usa el nombre del niño o niña, se puede leer o escuchar con las palabras iluminándose, tiene modo dormir y un dibujo para colorear. Modelo: **app gratis con 2 cuentos** en App Store y Google Play; un **pago único de US$7,99** (compra no consumible) desbloquea la biblioteca completa. La web es una **vitrina**: muestra la app, deja leer un cuento gratis y lleva a las tiendas.

Responde y comenta siempre en español. Los textos visibles van en ES y EN.

## Roles

- **Claude Code** construye el producto en este repo.
- **Claude (chat)** audita cada fase contra `docs/AUDITORIA.md`. Antes de cerrar una fase, revisa tú esa lista y anota en el PR qué cumpliste y qué quedó pendiente.

## Stack (decidido)

- Next.js 15 (App Router, TypeScript). Sin Tailwind: CSS propio con tokens en `:root`.
- **Sitio 100 % estático** (`output: "export"`, carpeta `out/`) para empaquetarlo como app con **Capacitor** (iOS y Android). Sin middleware, sin rutas de servidor, sin cookies ni SSR. Todas las rutas se generan con `generateStaticParams`.
- Rutas por idioma: `/es/...` y `/en/...`; `/` redirige **en el cliente** según el idioma guardado o `navigator.languages`.
- Todo local para poder leer sin conexión: ilustraciones en el repo, fuentes embebidas con `next/font` (nada de CDN obligatorio).
- Monetización: **compras dentro de la app** (pago único no consumible, US$7,99) con App Store / Google Play. **Sin Supabase ni Lemon Squeezy por ahora.**
- La web (Vercel u otro hosting estático) es vitrina: botones a App Store y Google Play (`src/lib/stores.ts`, marcadores `[APP_STORE_URL]` y `[PLAY_STORE_URL]` hasta publicar).

## Referencias en el repo

- `docs/diseno/*.dc.html`: **diseño final** (especificación visual exacta): `Main` (home escritorio), `Home-Movil`, `Libro` (lector escritorio), `Libro-Movil`, `Sistema`. Ignorar las etiquetas `<x-dc>`, `<helmet>` y el script DCLogic (son del editor).
- `docs/prototipo-v2.html`: prototipo anterior, solo como referencia de estructura; su paleta quedó reemplazada por `docs/diseno/`.
- `docs/referencia/stories.ts`: los 2 cuentos completos en ES/EN, títulos "Pronto" y tipos de datos. Reutilizar.
- `docs/referencia/i18n.ts`: diccionario de textos ES/EN ya recortado (poco texto, pensado para niños).
- `docs/referencia/art.ts`: ilustraciones vectoriales provisorias deterministas y dibujos para colorear.

## Fases

1. **Web y lector** (prioridad): home vitrina, estante, lector-libro, colorear, planes (gratis vs. Biblioteca completa · US$7,99 · pago único, con botones a las tiendas, sin cobro), selector ES/EN. Compatible con exportación estática.
2. **App con Capacitor + compras dentro de la app**: empaquetar `out/` para iOS y Android, compra no consumible "Biblioteca completa", restaurar compras, bloqueo de cuentos `premium` sin compra.
3. **Imágenes**: ilustraciones definitivas con la API de OpenAI, **siempre modelo `gpt-image-2`**, con una guía de estilo única para que todos los cuentos se vean de la misma familia aunque los personajes cambien. Se guardan como archivos locales.
4. **Voz**: narración con ElevenLabs usando el endpoint con timestamps para iluminar palabra por palabra. Hasta entonces, `speechSynthesis` del navegador como respaldo. Audios locales.
5. **Contenido**: llegar a 10 cuentos para el lanzamiento.

**No usar créditos de OpenAI ni ElevenLabs sin autorización explícita del dueño.** Hasta entonces solo se preparan los tipos de datos (`image`, `audio`); no se hacen llamadas de prueba ni de generación.

Cada fase en su propio PR, con commits pequeños. `npm run build` y `npm run lint` sin errores antes de abrir el PR.

## Requisitos de experiencia

**Para niños: poco texto, botones grandes, cero ruido.** Títulos cortos ("Elige un cuento", "¡A colorear!"). Nada de párrafos de marketing.

### Estante (biblioteca)
- Libros parados sobre estantes de madera, con tapa ilustrada, título y edad. Al pasar el dedo o el mouse el libro se levanta un poco.
- Los títulos próximos aparecen como libros con cinta "Pronto".
- Filtros por tema (miedo a la oscuridad, compartir, hora de dormir…).
- Tocar un libro abre `/[lang]/cuento/[id]`.

### Lector con formato de libro real
- Debe **parecer un libro físico**: tapa dura visible alrededor de las páginas (color de la tapa del cuento), lomo al centro con sombra, canto de hojas apiladas en los bordes, papel cálido.
- **Apertura**: el libro aparece cerrado y la tapa gira en 3D para abrirse.
- **Pasar página con el dedo**: con pointer events, la hoja **sigue el dedo** mientras se arrastra (rotateY proporcional al desplazamiento). Al soltar: si pasó ~35% o fue un swipe rápido, termina de pasar; si no, vuelve a su lugar. Tocar el lado derecho/izquierdo también pasa página. Flechas del teclado en desktop. Sombra dinámica sobre la hoja según el avance.
- **Desktop**: doble página (ilustración izquierda, texto derecha). **Móvil**: una sola página tipo libro (ilustración arriba, texto abajo) que se pasa girando sobre el lomo izquierdo. Nunca un simple fade.
- `touch-action: pan-y` en el libro para que el scroll vertical siga funcionando.
- Lectura acompañada: el texto se divide en palabras y se ilumina la que se está narrando. Al terminar una página, pasa sola con la animación.
- Modo dormir: papel oscuro y cálido, letra más grande, voz más lenta, temporizador de 10/20 min que termina en una pantalla "Buenas noches, {nombre}". Pedir `wakeLock` si está disponible.
- Respetar `prefers-reduced-motion` (sin giros, cambio directo).

### Personalización
- `{n}` en los textos se reemplaza por el nombre ingresado en el hero (guardado en `localStorage`, con valor por defecto "Emilia"/"Emma").
- Escribir los cuentos sin adjetivos con género referidos a `{n}` (sirve para niñas y niños).

### Colorear
- Dibujo SVG por cuento; tocar una zona la pinta con el color elegido. Paleta grande y táctil. Botón borrar. Más adelante: descarga PDF.

## Diseño

Dirección: **noche amable y cuento ilustrado**. Hero de cielo nocturno con luna y estrellas; el resto luminoso y alegre. Colores vivos pero no chillones, apropiados para niños, con contraste AA.

Tokens (modo claro; definir también modo oscuro con los mismos nombres):

```css
--bg:#FFF7EA; --surface:#FFFFFF; --ink:#2B2D52; --muted:#66658A; --line:#F1DFC0;
--sun:#FFB703; --sun-ink:#3A2600; --sun-soft:#FFE6A3;   /* acento principal: botones, luna */
--coral:#FF6F61; --mint:#2FB58F; --mint-soft:#DDF5EC; --sky:#4FA9F0; --grape:#7C6CF0;
--night:#27317A; --night-2:#333F93; --moon-text:#FFF8E7; --moon-muted:#CBD0F5;
--wood:#E3A35F; --wood-edge:#F4C58F; --paper:#FFFDF6; --paper-ink:#2B2D52; --edge:#EADFC6;
```

- Tipografías (next/font/google): **Fredoka** (títulos y texto de los cuentos) + **Atkinson Hyperlegible** (interfaz; diseñada para legibilidad).
- Radios generosos, botones tipo píldora de al menos 44px de alto.
- Sin degradados morado/azul genéricos, sin emojis como íconos, sin glassmorphism.
- Mobile-first: probar en 375, 768, 1280 px. Sin scroll horizontal.

## Datos y seguridad

- Sin backend propio por ahora: no hay cuentas ni base de datos. La compra la valida la tienda (App Store / Google Play) en la fase 2.
- Nunca guardar claves en el repo. Si una fase futura necesita variables, documentarlas en `.env.example` con valores vacíos.
- El sitio debe funcionar completo (cuentos gratis, estante, colorear) sin conexión una vez cargado y sin ninguna variable de entorno.

## Privacidad (contenido infantil)

- De los niños solo se guarda el nombre, y en el dispositivo (`localStorage`). Nada de fotos, edad exacta ni datos sensibles.
- Las compras las hace el adulto con su cuenta de la tienda. Sin anuncios ni trackers de terceros.
- Páginas de Privacidad y Términos (borrador) enlazadas en el footer.

## Contenido

- Cada cuento: 6 páginas, ES y EN, un valor/tema, rango de edad, minutos de lectura, color de tapa, página de portada y dibujo para colorear.
- Revisar cada texto antes de publicarlo: frases cortas, vocabulario simple, final tranquilo (son cuentos para antes de dormir).
