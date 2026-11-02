# Lunacuento

Web premium y bilingüe (español / inglés) de cuentos digitales para niños de 0 a 7 años. Cada cuento usa el nombre del niño o niña, se puede leer o escuchar con las palabras iluminándose, tiene modo dormir y un dibujo para colorear. Se monetiza con una suscripción mensual o anual y una gift card.

Responde y comenta siempre en español. Los textos visibles van en ES y EN.

## Roles

- **Claude Code** construye el producto en este repo.
- **Claude (chat)** audita cada fase contra `docs/AUDITORIA.md`. Antes de cerrar una fase, revisa tú esa lista y anota en el PR qué cumpliste y qué quedó pendiente.

## Stack (decidido)

- Next.js 15 (App Router, TypeScript, Server Components). Sin Tailwind: CSS propio con tokens en `:root`.
- Supabase: login con enlace mágico por correo, Postgres con RLS.
- Lemon Squeezy: checkout de suscripción (mensual, anual) y producto único (regalo), webhook firmado.
- Deploy en Vercel. Rutas por idioma: `/es/...` y `/en/...`; `/` redirige según `Accept-Language`.

## Referencias en el repo

- `docs/prototipo-v2.html`: prototipo navegable aprobado en estructura (hero, estante, lector, colorear, planes). Abrirlo en el navegador. La paleta y el lector **deben mejorarse** según este documento.
- `docs/referencia/stories.ts`: los 2 cuentos completos en ES/EN, títulos "Pronto" y tipos de datos. Reutilizar.
- `docs/referencia/i18n.ts`: diccionario de textos ES/EN ya recortado (poco texto, pensado para niños).
- `docs/referencia/art.ts`: ilustraciones vectoriales provisorias deterministas y dibujos para colorear.

## Fases

1. **Web y lector** (prioridad): home, estante, lector-libro, colorear, planes (botones sin cobrar aún), selector ES/EN.
2. **Cuentas y pagos**: Supabase + Lemon Squeezy, control de acceso a cuentos `premium`, página "Mi cuenta".
3. **Imágenes**: ilustraciones definitivas con la API de OpenAI, **siempre modelo `gpt-image-2`**, con una guía de estilo única para que todos los cuentos se vean de la misma familia aunque los personajes cambien.
4. **Voz**: narración con ElevenLabs usando el endpoint con timestamps para iluminar palabra por palabra. Hasta entonces, `speechSynthesis` del navegador como respaldo.
5. **Contenido**: llegar a 10 cuentos para el lanzamiento.

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

- Tablas: `subscriptions` (user_id, lemon_subscription_id, status, variant, renews_at, ends_at, portal_url, updated_at). RLS: cada usuario solo lee lo suyo; solo el webhook (service role) escribe.
- Webhook de Lemon Squeezy: verificar firma HMAC SHA-256 (`X-Signature`) sobre el cuerpo crudo antes de procesar. Pasar `user_id` en `custom_data` del checkout.
- `SUPABASE_SERVICE_ROLE_KEY` y claves de Lemon Squeezy solo en el servidor. Documentar todas las variables en `.env.example`.
- El sitio debe funcionar (cuentos gratis, estante, colorear) aunque Supabase y Lemon Squeezy no estén configurados todavía.

## Privacidad (contenido infantil)

- De los niños solo se guarda el nombre, y en el dispositivo (`localStorage`). Nada de fotos, edad exacta ni datos sensibles.
- La cuenta pertenece al adulto. Sin anuncios ni trackers de terceros invasivos.
- Páginas de Privacidad y Términos (borrador) enlazadas en el footer.

## Contenido

- Cada cuento: 6 páginas, ES y EN, un valor/tema, rango de edad, minutos de lectura, color de tapa, página de portada y dibujo para colorear.
- Revisar cada texto antes de publicarlo: frases cortas, vocabulario simple, final tranquilo (son cuentos para antes de dormir).
