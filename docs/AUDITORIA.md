# Lista de auditoría

Claude (chat) revisa cada PR contra esta lista. Estado: ✅ cumple · ⚠️ parcial · ❌ no cumple.

## Producto y UX
- [ ] Poco texto en toda la web; títulos cortos; nada de párrafos de marketing.
- [ ] ES y EN completos en todas las pantallas; el selector mantiene la ruta actual.
- [ ] Nombre del niño se aplica en hero, estante y lector; se guarda en el dispositivo.
- [ ] Estante de madera con libros parados, efecto al pasar el dedo, libros "Pronto" y filtros (tema y edad); sin tablón vacío en 375/768.
- [ ] Hero de escritorio/tablet: título "¡Elige un cuento! para {nombre}", filtros y estante de portadas sobre la ilustración, sin tapar al niño ni la luna; portadas, accesos y dibujos con las imágenes generadas.
- [ ] Navegación Inicio · Cuentos · Pintar · Mi biblioteca (barra inferior en móvil); dos accesos protagonistas en el inicio.
- [ ] "Sigue leyendo" solo con progreso real; "Novedades" solo con `isNew` real; sin avatar, foto ni campanita.
- [ ] Estados de contenido: disponible, bloqueado (candado) y próximamente; estado vacío y esqueleto de carga en Mi biblioteca.

## Taller de pintura
- [ ] Dibujo grande al centro, paleta de círculos y barra de herramientas con íconos (pincel, relleno, goma, deshacer, rehacer); controles visibles sin scroll en escritorio.
- [ ] Relleno por píxeles en dibujos raster (sin fugas por huecos pequeños ni halo blanco) y SVG de respaldo funcionando.
- [ ] Relleno, pincel, goma, deshacer/rehacer, reiniciar con confirmación y guardado automático funcionan con mouse y táctil.
- [ ] Exportar PNG funciona en la web; en la app no aparece el botón (sin plugin).
- [ ] Ningún botón decorativo que aparente funcionar.
- [ ] Con pincel o goma el lienzo bloquea el scroll; con relleno no.

## Lector-libro
- [ ] Parece libro físico: tapa dura alrededor, lomo, canto de hojas, papel cálido.
- [ ] La tapa se abre en 3D al entrar (el rediseño no cambió la mecánica del libro).
- [ ] La hoja sigue el dedo al arrastrar; completa o vuelve al soltar según avance/velocidad.
- [ ] Tocar los lados y flechas del teclado pasan página.
- [ ] Móvil: página única con formato libro y giro sobre el lomo (no fade).
- [ ] Scroll vertical no se bloquea en móvil (`touch-action: pan-y`).
- [ ] Lectura acompañada ilumina palabra por palabra y pasa de página sola.
- [ ] Modo dormir + temporizador + pantalla "Buenas noches".
- [ ] `prefers-reduced-motion` respetado.

## Diseño
- [ ] Usa los tokens de `CLAUDE.md` en claro y oscuro (violeta `#6D5BFF`, amarillo `#FFC94D`, turquesa, rosa, fondo `#F6F8FF`, tinta `#0F1B3D`); **sin restos del diseño anterior** (`#27317A`, `#FFB703`, `#FFF7EA`, coral); contraste AA (texto violeta sobre claro = `--violet-ink`).
- [ ] **Baloo 2** (títulos y texto de los cuentos) + **Nunito** (interfaz) con next/font; sin Fredoka ni Atkinson.
- [ ] Tarjetas de 20–24 px, sombras suaves, sin degradados decorativos ni glassmorphism ni emojis como íconos.
- [ ] Botones ≥44px; foco visible; navegable con teclado.
- [ ] Sin scroll horizontal en 375 / 768 / 1280 px.

## Técnico
- [ ] `npm run build` y `npm run lint` sin errores.
- [ ] Sin errores de hidratación (ilustraciones deterministas, sin `Math.random` en render).
- [ ] El sitio funciona sin variables de Supabase / Lemon Squeezy.
- [ ] `.env.example` documenta todas las variables.

## Cuentas y pagos (fase 2)
- [ ] Login por enlace mágico; callback que intercambia el código por sesión.
- [ ] RLS activo; el cliente solo lee su propia suscripción.
- [ ] Webhook verifica firma HMAC sobre el cuerpo crudo antes de escribir.
- [ ] `user_id` viaja en `custom_data` del checkout; estados `active/on_trial/past_due/cancelled` manejados.
- [ ] Cuentos `premium` bloqueados sin suscripción, con llamada a ver planes.
- [ ] Claves secretas nunca llegan al navegador.

## Ilustraciones
- [ ] Script `generar-ilustraciones.mjs`: solo `gpt-image-2`, clave solo del entorno, contador y tope de gasto, `--solo hero`. Nada generado sin autorización.
- [ ] La web usa el manifiesto y cae al placeholder si falta una imagen; imágenes con `srcset` y WebP.
- [ ] Móvil: saludo, accesos ilustrados, fila "Sigue leyendo" (solo con progreso) y barra inferior fija.

## Compras, portón y pruebas
- [ ] Pantalla de compra, portón para adultos, modo app nativa y `NEXT_PUBLIC_MODO_PRUEBA` intactos tras cualquier rediseño.
- [ ] Ilustraciones definitivas marcadas con `ILUSTRACION-PENDIENTE`; sin imágenes ni audio generados sin autorización.

## Privacidad
- [ ] De los niños solo el nombre y su actividad (progreso, favoritos, dibujos), en `localStorage`; nada sale del dispositivo.
- [ ] Sin trackers de terceros invasivos; Privacidad y Términos enlazados.
