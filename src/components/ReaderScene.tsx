import { sceneSVG } from "@/lib/art";
import { COVER_KEY, ilu } from "@/lib/ilustraciones";
import type { Story } from "@/lib/stories";

/** Estrellas fijas (deterministas): x, y en %, radio y retraso del titileo. */
const STARS: [number, number, number, number][] = Array.from({ length: 34 }, (_, i) => {
  const a = (i * 7919) % 997;
  return [(a % 97) + 1.5, ((a * 3) % 61) + 2, 0.7 + ((a * 5) % 9) / 8, (i % 9) * 0.9];
});
/** Luciérnagas: x, y, desplazamiento, duración (s) y retraso. */
const FIREFLIES: [number, number, number, number, number, number][] = [
  [8, 62, 40, -30, 14, 0], [18, 38, -30, 40, 17, 2], [30, 74, 50, -20, 15, 4], [44, 30, -40, 30, 19, 1], [58, 70, 30, -50, 16, 3],
  [70, 42, -50, -20, 18, 5], [82, 66, 40, 40, 15, 2], [92, 34, -30, 50, 20, 6],
];

/**
 * Escenografía del lector: escena nocturna desenfocada tomada de la portada del cuento, viñeta, estrellas que titilan lento,
 * luciérnagas, luna (visible en modo dormir) y la mesa de madera donde descansa el libro. Todo decorativo (aria-hidden).
 * ILUSTRACION-PENDIENTE: sin portada generada se usa la escena vectorial de la página de portada.
 */
export default function ReaderScene({ story }: { story: Story }) {
  const cover = ilu(COVER_KEY[story.id]);
  const small = cover?.srcset?.split(",")[0]?.trim().split(" ")[0] ?? cover?.src;
  const svg = cover ? "" : sceneSVG(story.pages[story.coverPage].scene, `bg-${story.id}`);
  return (
    <div className="r-scene" aria-hidden="true">
      <div className="r-backdrop">
        {cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={small} alt="" decoding="async" />
        ) : (
          <div className="r-backdrop-svg" dangerouslySetInnerHTML={{ __html: svg }} />
        )}
      </div>
      <div className="r-vignette" />
      <div className="bg-stars">
        {STARS.map(([x, y, r, d], i) => (
          <i key={i} style={{ left: `${x}%`, top: `${y}%`, width: r * 2.2, height: r * 2.2, animationDelay: `${d}s` }} />
        ))}
      </div>
      <span className="r-moon" />
      <div className="r-fireflies">
        {FIREFLIES.map(([x, y, dx, dy, dur, delay], i) => (
          <i key={i} className="ff" style={{ left: `${x}%`, top: `${y}%`, "--dx": `${dx}px`, "--dy": `${dy}px`, "--dur": `${dur}s`, animationDelay: `${delay}s` } as React.CSSProperties} />
        ))}
      </div>
    </div>
  );
}
