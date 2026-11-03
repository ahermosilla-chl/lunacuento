# Lunacuento

Web premium y bilingüe (español / inglés) de cuentos digitales para niños de 0 a 7 años. Cada cuento usa el nombre del niño o niña, se puede leer o escuchar con las palabras iluminándose, tiene modo dormir y un dibujo para colorear. Modelo: **app gratis con 2 cuentos** en App Store y Google Play; un **pago único de US$7,99** (compra no consumible) desbloquea la biblioteca completa. La web es una **vitrina**: muestra la app, deja leer un cuento gratis y lleva a las tiendas.

Responde y comenta siempre en español. Los textos visibles van en ES y EN.

## Roles

- **Claude Code** construye el producto en este repo.
- **Claude (chat)** audita cada fase contra `docs/AUDITORIA.md`. Antes de cerrar una fase, revisa tú esa lista y anota en el PR qué cumpliste y qué quedó pendiente.

## Stack (decidido)

- Next.js 15 (App Router, TypeScript). Sin Tailwind: CSS propio con tokens en `:root` (`src/app/globals.css`).
- **Sitio 100 % estático** (`output: "export"`, carpeta `out/`) para empaquetarlo como app con **Capacitor** (iOS y Android). Sin middleware, sin rutas de servidor, sin cookies ni SSR. Todas las rutas se generan con `generateStaticParams`.
- Rutas por idioma: `/es/...` y `/en/...`; `/` redirige **en el cliente** según el idioma guardado o `navigator.languages`.
- Todo local para poder leer sin conexión: ilustraciones en el repo, fuentes embebidas con `next/font` (nada de CDN obligatorio).
- Monetización: **compras dentro de la app** (pago único no consumible, US$7,99) con App Store / Google Play. **Sin Supabase ni Lemon Squeezy por ahora.**
- La web (Vercel u otro hosting estático) es vitrina: botones a App Store y Google Play (`src/lib/stores.ts`, marcadores `[APP_STORE_URL]` y `[PLAY_STORE_URL]` hasta publicar).

## Referencias en el repo

- `docs/diseno/*.dc.html`: diseño **anterior** (Fredoka/Atkinson, noche `#27317A`, amarillo `#FFB703`). **Ya no manda en colores ni tipografía** (ver sección Diseño). Se conserva solo como referencia de la **estructura y la mecánica del libro** (`Libro`, `Libro-Movil`). Ignorar `<x-dc>`, `<helmet>` y DCLogic.
- `docs/capturas/antes/`: capturas del diseño anterior (para comparar). `docs/capturas/`: estado actual (se regenera con `npm run capturas`).
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
- Un dibujo por cuento (más extras): tocar una zona la pinta con el color elegido (por píxeles en los dibujos generados, por zonas en el SVG de respaldo). Paleta grande y táctil, deshacer/rehacer, reiniciar con confirmación. Más adelante: descarga PDF.

## Diseño

> **Rediseño premium vigente. No volver al diseño anterior** (Fredoka + Atkinson Hyperlegible, noche `#27317A`, amarillo `#FFB703`, fondo crema `#FFF7EA`, coral `#FF6F61`). Esos valores están obsoletos: cualquier sesión nueva debe usar los tokens y tipografías de abajo.

Dirección: **noche amable y cuento ilustrado, con acabado de app premium**. Hero de cielo nocturno violeta con luna y estrellas; el resto luminoso, cálido y ordenado. Cuidado en jerarquía y espacio, no una colección de juguetes: sombras suaves, pocos brillos, **sin degradados decorativos**, sin glassmorphism, sin emojis como íconos. Contraste AA obligatorio.

Tokens (modo claro; el modo oscuro usa los mismos nombres en `globals.css`):

```css
--bg:#F6F8FF; --surface:#FFFFFF; --ink:#0F1B3D; --muted:#5A6385; --line:#E1E5F7;
--violet:#6D5BFF; --violet-ink:#4F3FD6; --violet-soft:#E8E5FF; --violet-shadow:#4B3BD1;   /* primario */
--sun:#FFC94D; --sun-ink:#3A2A00; --sun-soft:#FFF0C2;                                       /* amarillo mágico: luna, acentos, CTA sobre noche */
--rose:#FF6B9E; --mint:#00C2AB; --mint-soft:#D9F6F1; --sky:#4FA9F0; --grape:#7C6CF0;
--night:#2D2877; --night-2:#3D36A0; --moon-text:#FFF8E7; --moon-muted:#D5D2FA;
--wood:#E3A35F; --wood-edge:#F4C58F; --paper:#FFFDF6; --paper-ink:#0F1B3D; --edge:#EADFC6;
```

- Contraste medido: blanco sobre `--violet` 4,57:1 (solo texto en negrita ≥16 px o grande); **texto violeta sobre fondo claro usa `--violet-ink`** (6,56:1), nunca `--violet`. Tinta sobre `--sun` 11:1.
- Botones primarios: **violeta con texto blanco** sobre fondos claros (`.btn-violet`, chips activos, herramienta activa) y **amarillo con texto oscuro** sobre fondos de noche (`.btn-sun`: hero, compra, lector, CTA final).
- Foco visible: contorno violeta (`--violet-ink`) en fondos claros, amarillo en fondos de noche.
- Tipografías (`src/lib/fonts.ts`, next/font/google): **Baloo 2** (títulos 600/700 y texto de los cuentos 500) + **Nunito** (interfaz y lectura de apoyo 400–800). Variables `--font-baloo` y `--font-nunito`.
- Tarjetas redondeadas de **20–24 px** (`--r-card: 22px`), sombra suave `--shadow-card`. Los botones siguen siendo píldoras de ≥44 px con sombra sólida inferior (baja 3 px al presionar).
- Animaciones sutiles de 150–300 ms; todo respeta `prefers-reduced-motion`.
- Mobile-first: probar en 375, 768, 1280 px. Sin scroll horizontal. Móvil: **navegación inferior** (Inicio, Cuentos, Pintar, Biblioteca).
- El lector sigue siendo un **libro** (tapa 3D, hoja que sigue el dedo, doble página en escritorio, página única en móvil): el rediseño cambia colores y tipografía, **nunca la mecánica**.
- Ícono y splash de la app: luna `--sun` sobre `--night` (`assets/*.svg`, `npm run assets`).

## Estructura de la experiencia

- Navegación: **Inicio, Cuentos, Pintar, Mi biblioteca** (`/[lang]`, `/cuentos`, `/pintar`, `/biblioteca`). Header en escritorio/tablet, barra inferior en móvil, barra mínima en la app nativa. Páginas con `Shell`; el lector y la compra son pantallas completas sin navegación.
- Inicio móvil (≤760 px): saludo "¡Hola, {n}!", dos accesos grandes ilustrados (`acceso-leer`, `acceso-pintar`), fila horizontal "Sigue leyendo" (solo con progreso), fila de portadas y barra inferior fija.
- Inicio escritorio y tablet: **hero integrado** (`HeroStage`): "¡Elige un cuento! para {n}", filtros por tema y estante de portadas con volumen sobre la ilustración `hero-inicio` (niño y zorro a la izquierda hasta ~40 %, luna arriba a la derecha: todo el texto y el estante empiezan en `--stage-left: 40%`). Debajo: "Sigue leyendo" (solo con progreso), "Nuevos contenidos" (**solo si algún cuento tiene `isNew: true`**; hoy ninguno), miniaturas para pintar, planes y CTA final. No inventar novedades ni frases como "cuentos nuevos cada semana".
- Taller de pintura (`/pintar`): dibujo grande al centro, paleta de círculos y barra de herramientas con íconos (pincel, relleno, goma, deshacer, rehacer; reiniciar y guardar arriba). Dos motores: **raster** (dibujos de línea generados, relleno **por píxeles** sobre zonas cerradas, `src/lib/raster-fill.ts`) y **SVG** (los 3 dibujos vectoriales de respaldo, por zonas). Un dibujo usa raster si su imagen está en el manifiesto. Exportar PNG solo en la web (en la app falta el plugin de compartir/archivos). Los dibujos raster no se pintan con teclado (los SVG sí). **No agregar botones que no funcionen.**
- Mi biblioteca: sigue leyendo, favoritos, leídos y mis dibujos; estado vacío y esqueleto de carga.
- Persistencia solo en `localStorage` del dispositivo: `lc_name` (nombre), `lc_library` (progreso, favoritos, leídos), `lc_paint` (dibujos pintados), `lc_lang`, `lc_biblioteca` (copia de la compra). Sin avatar, foto, campanita de notificaciones ni perfiles.
- Ilustraciones definitivas: `docs/guia-ilustracion.md` (estilo único) y `scripts/generar-ilustraciones.mjs` (se ejecuta en la Mac del dueño con `OPENAI_API_KEY` del entorno, siempre `gpt-image-2`, tope de gasto 8 US$ con contador). Salen a `public/ilustraciones/` + `manifest.json`; la web usa el manifiesto y, si falta una imagen, el placeholder vectorial marcado `ILUSTRACION-PENDIENTE` (`grep -rn ILUSTRACION-PENDIENTE src`). **No generar imágenes ni audio sin autorización**; nunca guardar la clave en el repo.
- Compras, portón para adultos, modo app nativa y `NEXT_PUBLIC_MODO_PRUEBA` se mantienen: acciones sensibles solo detrás del portón; sin enlaces externos ni publicidad en las vistas infantiles.

## Datos y seguridad

- Sin backend propio por ahora: no hay cuentas ni base de datos. La compra la valida la tienda (App Store / Google Play) en la fase 2.
- Nunca guardar claves en el repo. Si una fase futura necesita variables, documentarlas en `.env.example` con valores vacíos.
- El sitio debe funcionar completo (cuentos gratis, estante, colorear) sin conexión una vez cargado y sin ninguna variable de entorno.

## Privacidad (contenido infantil)

- De los niños solo se guarda el nombre y su actividad en la app (cuento por el que van, favoritos, dibujos pintados), y todo en el dispositivo (`localStorage`). Nada de fotos, avatares, edad exacta ni datos sensibles; nada sale del dispositivo.
- Las compras las hace el adulto con su cuenta de la tienda. Sin anuncios ni trackers de terceros.
- Páginas de Privacidad y Términos (borrador) enlazadas en el footer.

## Contenido

- Cada cuento: 6 páginas, ES y EN, un valor/tema, rango de edad, minutos de lectura, color de tapa, página de portada y dibujo para colorear.
- Revisar cada texto antes de publicarlo: frases cortas, vocabulario simple, final tranquilo (son cuentos para antes de dormir).

## Emoción y acabado premium (ronda 5)

- **Sonido** (`src/lib/sound.ts`, `docs/sonidos.md`): todo sintetizado con Web Audio (sin archivos ni licencias de terceros). Nada suena antes de la primera interacción; botón on/off en el encabezado y el lector (`lc_sound`). Ganchos: `data-sound` en botones, `playSound(nombre)`.
- **Apertura del libro**: al tocar una portada del estante, `BookFlyer` la hace volar al centro; el lector la recibe cerrada, flota ~1,1 s con brillo y la tapa se abre en ~1,4 s con destellos. Con `prefers-reduced-motion`: sin vuelo, sin giros.
- **Lector con escenografía** (`ReaderScene`): fondo nocturno desde la portada, viñeta, estrellas, luciérnagas, mesa de madera; modo dormir apaga la escena. Al terminar: pantalla final con "Leer otra vez" y "Colorear".
- **Modo oscuro = noche mágica**: secciones claras pasan a azul-violeta con estrellas; tarjetas claras con brillo suave.
- **Nitidez**: `scripts/ampliar-ilustraciones.mjs` (upscaler local gratuito, ver `docs/ampliar-ilustraciones.md`).
- **Páginas ilustradas**: grupo `paginas` (18 imágenes) preparado en `scripts/ilustraciones.config.mjs`, **sin generar**; el lector las usa si existen (`pagina-<cuento>-<n>`). Presupuesto en `docs/presupuesto-ilustraciones.md`.
