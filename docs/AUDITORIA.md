# Lista de auditoría

Claude (chat) revisa cada PR contra esta lista. Estado: ✅ cumple · ⚠️ parcial · ❌ no cumple.

## Producto y UX
- [ ] Poco texto en toda la web; títulos cortos; nada de párrafos de marketing.
- [ ] ES y EN completos en todas las pantallas; el selector mantiene la ruta actual.
- [ ] Nombre del niño se aplica en hero, estante y lector; se guarda en el dispositivo.
- [ ] Estante de madera con libros parados, efecto al pasar el dedo, libros "Pronto" y filtros.

## Lector-libro
- [ ] Parece libro físico: tapa dura alrededor, lomo, canto de hojas, papel cálido.
- [ ] La tapa se abre en 3D al entrar.
- [ ] La hoja sigue el dedo al arrastrar; completa o vuelve al soltar según avance/velocidad.
- [ ] Tocar los lados y flechas del teclado pasan página.
- [ ] Móvil: página única con formato libro y giro sobre el lomo (no fade).
- [ ] Scroll vertical no se bloquea en móvil (`touch-action: pan-y`).
- [ ] Lectura acompañada ilumina palabra por palabra y pasa de página sola.
- [ ] Modo dormir + temporizador + pantalla "Buenas noches".
- [ ] `prefers-reduced-motion` respetado.

## Diseño
- [ ] Usa los tokens de `CLAUDE.md` en claro y oscuro; contraste AA.
- [ ] Fredoka + Atkinson Hyperlegible con next/font.
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

## Privacidad
- [ ] De los niños solo el nombre, en `localStorage`.
- [ ] Sin trackers de terceros invasivos; Privacidad y Términos enlazados.
