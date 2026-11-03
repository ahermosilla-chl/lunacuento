# Sonidos de Lunacuento

Todos los sonidos están **sintetizados en el dispositivo con Web Audio** (`src/lib/sound.ts`). No hay archivos de audio, no se descarga nada y **no se usa ElevenLabs ni ningún servicio de pago**. Como son código propio, no hay licencias de terceros que atribuir.

| Sonido | Dónde suena | Cómo se genera |
|---|---|---|
| `click` | botones, chips, íconos | tono triangular corto (540 Hz, 70 ms) |
| `pop` | tocar un libro | seno que sube de 340 a 640 Hz + armónico |
| `page` | pasar página | ráfaga de ruido filtrado (papel) + golpe grave suave |
| `open` | la tapa del libro se abre | cinco campanitas (C6–E7) con parcial inarmónico + susurro brillante |
| `paint` | rellenar una zona | burbuja: seno que sube de 280 a 880 Hz |
| `brush` | soltar una pincelada | ruido filtrado corto |
| `celebrate` | terminar un cuento | melodía corta (C5–E5–G5–C6) y destellos agudos |

## Reglas
- **Nada suena antes de la primera interacción**: el `AudioContext` no se crea hasta el primer toque, clic o tecla (`SoundBoot`).
- **Volumen suave**: ganancia maestra 0,22 y un compresor.
- **Botón de sonido** (activado/apagado) en el header y en el lector; se guarda en el dispositivo (`lc_sound`). Apagado, no se crea ningún sonido.
- `data-sound="none"` en un elemento evita el clic genérico (se usa en los botones de página, que ya suenan a papel); `data-sound="pop"` da el "pop" de los libros.

## Si más adelante se quieren archivos reales
Usar solo audio **CC0** (por ejemplo los paquetes de Kenney, https://kenney.nl/assets, dominio público) y anotar aquí el paquete, el archivo y su licencia. No usar ElevenLabs sin autorización del dueño.
