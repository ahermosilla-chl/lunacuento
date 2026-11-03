"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DRAWINGS, PALETTE } from "@/lib/art";
import { availableDrawings, CAT_LABEL, DRAWING_CATS, drawingTitle, isPremiumDrawing, paintKey, rasterOf, type DrawingCat, type DrawingMeta } from "@/lib/drawings";
import type { Dict, Lang } from "@/lib/i18n";
import { BRUSH_SIZES, composeSVG, EMPTY_PAINT, type BrushSize, type PaintState, type Stroke } from "@/lib/paint";
import { getPainting, savePainting, usePaintings } from "@/lib/paint-store";
import { useNative } from "@/lib/platform";
import { useLibrary } from "@/lib/purchases";
import { analyze, colorLayer, regionAt, type Regions } from "@/lib/raster-fill";
import DrawingThumb from "./DrawingThumb";
import { IconBucket, IconDownload, IconEraser, IconLock, IconPaintbrush, IconRedo, IconRestart, IconUndo } from "./icons";

type Tool = "fill" | "brush" | "eraser";
const HISTORY = 50;
const MAX_POINTS = 700;

/** Puntos de un trazo "M x y L x y …" */
function pointsOf(d: string): [number, number][] {
  const n = d.match(/-?\d+(?:\.\d+)?/g)?.map(Number) ?? [];
  const out: [number, number][] = [];
  for (let i = 0; i + 1 < n.length; i += 2) out.push([n[i], n[i + 1]]);
  return out;
}

/** ¿El punto (x, y) toca el trazo? Distancia a cada segmento menor que medio grosor + margen para el dedo. */
function touches(s: Stroke, x: number, y: number, reach: number) {
  const pts = pointsOf(s.d);
  const r = s.size / 2 + reach;
  for (let i = 0; i < pts.length; i++) {
    const [ax, ay] = pts[i];
    const [bx, by] = pts[i + 1] ?? pts[i];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy;
    const k = len2 ? Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / len2)) : 0;
    if (Math.hypot(x - (ax + k * dx), y - (ay + k * dy)) <= r) return true;
  }
  return false;
}

/**
 * Taller de pintura. Dos motores:
 * - raster (dibujos de línea generados, public/ilustraciones): relleno **por píxeles** sobre zonas cerradas, ver raster-fill.ts;
 * - svg (los 3 dibujos vectoriales de respaldo): relleno por zonas predefinidas.
 * Ambos: pincel (3 grosores), goma (zonas y trazos), deshacer/rehacer (50 pasos), reiniciar con confirmación,
 * guardado automático en el dispositivo y exportar PNG (solo web: en la app falta el plugin de compartir/archivos).
 * Táctil y mouse con pointer events; el scroll solo se bloquea sobre el lienzo con pincel o goma.
 */
export default function Paint({ lang, t }: { lang: Lang; t: Dict }) {
  const C = t.coloring;
  const router = useRouter();
  const owned = useLibrary();
  const native = useNative();
  const saved = usePaintings();
  const drawings = availableDrawings();

  const [drawingId, setDrawingId] = useState(drawings[0]?.id ?? "luna");
  const meta: DrawingMeta = drawings.find((d) => d.id === drawingId) ?? drawings[0];
  const rast = rasterOf(meta);
  const mode = rast ? "raster" : "svg";
  const W = rast ? rast.width : 400;
  const H = rast ? rast.height : 300;
  const scale = W / 400; // grosores y márgenes están pensados para 400 px de ancho
  const key = paintKey(meta);

  const [cat, setCat] = useState<"all" | DrawingCat>("all");
  const [tool, setTool] = useState<Tool>("fill");
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [size, setSize] = useState<BrushSize>("m");
  const [present, setPresent] = useState<PaintState>(EMPTY_PAINT);
  const [past, setPast] = useState<PaintState[]>([]);
  const [future, setFuture] = useState<PaintState[]>([]);
  const [live, setLive] = useState("");
  const [note, setNote] = useState("");
  const [regions, setRegions] = useState<Regions | null>(null);
  const [loadFail, setLoadFail] = useState(false);

  const canvasRef = useRef<HTMLDivElement>(null);
  const rasterRef = useRef<HTMLCanvasElement>(null);
  const lineImg = useRef<HTMLImageElement | null>(null);
  const layerRef = useRef<SVGSVGElement>(null);
  const confirmRef = useRef<HTMLDialogElement>(null);
  const gesture = useRef<{ id: number; pts: [number, number][]; moved: boolean; erased: Set<number>; x0: number; y0: number } | null>(null);

  const lockedDrawing = useCallback((d: DrawingMeta) => isPremiumDrawing(d) && !owned, [owned]);

  const open = useCallback((d: DrawingMeta) => {
    setDrawingId(d.id);
    setPresent(getPainting(paintKey(d)));
    setPast([]);
    setFuture([]);
    setLive("");
    setNote("");
    setLoadFail(false);
  }, []);

  // Abre el dibujo indicado en ?dibujo= (si existe y no está bloqueado) al entrar.
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("dibujo") ?? "";
    const d = availableDrawings().find((x) => x.id === want);
    open(d && !lockedDrawing(d) ? d : drawings[0]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* ---- motor raster: cargar la línea y calcular las zonas una sola vez por dibujo ---- */
  useEffect(() => {
    setRegions(null);
    lineImg.current = null;
    if (!rast) return;
    let alive = true;
    const img = new Image();
    img.onload = () => {
      // dejar que se pinte el aviso de carga antes del cálculo (unos 100–300 ms en un teléfono medio)
      setTimeout(() => {
        if (!alive) return;
        const c = document.createElement("canvas");
        c.width = W;
        c.height = H;
        const cx = c.getContext("2d", { willReadFrequently: true });
        if (!cx) return setLoadFail(true);
        cx.fillStyle = "#FFFFFF";
        cx.fillRect(0, 0, W, H);
        cx.drawImage(img, 0, 0, W, H);
        lineImg.current = img;
        setRegions(analyze(cx.getImageData(0, 0, W, H).data, W, H));
      }, 30);
    };
    img.onerror = () => alive && setLoadFail(true);
    img.src = rast.src;
    return () => {
      alive = false;
    };
  }, [rast, W, H]);

  useLayoutEffect(() => {
    const cv = rasterRef.current;
    const img = lineImg.current;
    if (!cv || !regions || !img) return;
    const cx = cv.getContext("2d");
    if (!cx) return;
    cx.globalCompositeOperation = "source-over";
    cx.putImageData(colorLayer(regions, present.fills), 0, 0);
    cx.globalCompositeOperation = "multiply"; // la línea negra queda encima del color, el blanco deja pasar el color
    cx.drawImage(img, 0, 0, W, H);
    cx.globalCompositeOperation = "source-over";
  }, [regions, present.fills, W, H]);

  /* ---- motor svg: marca las zonas del dibujo (idempotente: React puede reemplazar el SVG al hidratar) ---- */
  useLayoutEffect(() => {
    if (mode !== "svg") return;
    const svg = canvasRef.current?.querySelector("svg");
    if (!svg) return;
    svg.setAttribute("role", "img");
    svg.setAttribute("aria-label", C.drawing);
    svg.querySelectorAll<SVGElement>(".f").forEach((el, i) => {
      if (!el.dataset.orig) {
        el.dataset.orig = el.getAttribute("fill") ?? "#FFFFFF";
        el.dataset.i = String(i);
        el.setAttribute("tabindex", "0");
        el.setAttribute("role", "button");
        el.setAttribute("aria-label", `${C.drawing} · ${i + 1}`);
      }
      el.setAttribute("fill", present.fills[i] ?? el.dataset.orig);
    });
  });

  /* ---- historial ---- */
  const commit = (next: PaintState) => {
    setPast((p) => [...p.slice(-(HISTORY - 1)), present]);
    setFuture([]);
    setPresent(next);
    savePainting(key, next);
  };
  const undo = () => {
    if (!past.length) return;
    const prev = past[past.length - 1];
    setFuture((f) => [present, ...f]);
    setPast((p) => p.slice(0, -1));
    setPresent(prev);
    savePainting(key, prev);
  };
  const redo = () => {
    if (!future.length) return;
    const [next, ...rest] = future;
    setPast((p) => [...p, present]);
    setFuture(rest);
    setPresent(next);
    savePainting(key, next);
  };

  /** Zona bajo un punto de la pantalla: índice de zona SVG o etiqueta de región raster (0 = ninguna). */
  const zoneAtClient = (cx: number, cy: number, target?: Element | null): number => {
    if (mode === "raster") {
      const cv = rasterRef.current;
      if (!cv || !regions) return 0;
      const r = cv.getBoundingClientRect();
      return regionAt(regions, ((cx - r.left) / r.width) * W, ((cy - r.top) / r.height) * H);
    }
    const el = (target ?? document.elementsFromPoint(cx, cy).find((n) => n.classList.contains("f")))?.closest<SVGElement>(".f");
    return el ? Number(el.dataset.i) + 1 : 0; // +1 para que 0 signifique "ninguna"
  };
  const applyZone = (z: number) => {
    if (!z) return;
    const k = mode === "raster" ? z : z - 1;
    if (tool === "fill" && present.fills[k] !== color) commit({ ...present, fills: { ...present.fills, [k]: color } });
    if (tool === "eraser" && present.fills[k] !== undefined) {
      const fills = { ...present.fills };
      delete fills[k];
      commit({ ...present, fills });
    }
  };

  /* ---- pincel y goma: pointer events sobre la capa de trazos ---- */
  const toBox = (e: React.PointerEvent) => {
    const r = layerRef.current!.getBoundingClientRect();
    return [Math.round(((e.clientX - r.left) / r.width) * W * 10) / 10, Math.round(((e.clientY - r.top) / r.height) * H * 10) / 10] as [number, number];
  };
  const pathOf = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  const eraseAt = (x: number, y: number) => {
    const g = gesture.current!;
    for (const s of present.strokes) if (!g.erased.has(s.id) && touches(s, x, y, 6 * scale)) g.erased.add(s.id);
  };
  const onDown = (e: React.PointerEvent) => {
    if (e.button > 0 || gesture.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = toBox(e);
    gesture.current = { id: e.pointerId, pts: [[x, y]], moved: false, erased: new Set(), x0: e.clientX, y0: e.clientY };
    if (tool === "brush") setLive(pathOf([[x, y], [x + 0.1, y]]));
    if (tool === "eraser") eraseAt(x, y);
  };
  const onMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const [x, y] = toBox(e);
    if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) > 5) g.moved = true;
    if (tool === "brush") {
      const [lx, ly] = g.pts[g.pts.length - 1];
      if (Math.hypot(x - lx, y - ly) >= 1.5 * scale && g.pts.length < MAX_POINTS) {
        g.pts.push([x, y]);
        setLive(pathOf(g.pts));
      }
    } else if (tool === "eraser") {
      eraseAt(x, y);
    }
  };
  const onUp = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    gesture.current = null;
    if (tool === "brush") {
      const pts = g.pts.length > 1 ? g.pts : [g.pts[0], [g.pts[0][0] + 0.1, g.pts[0][1]] as [number, number]];
      setLive("");
      const id = present.strokes.reduce((m, s) => Math.max(m, s.id), 0) + 1;
      commit({ ...present, strokes: [...present.strokes, { id, color, size: BRUSH_SIZES[size] * scale, d: pathOf(pts) }] });
    } else if (tool === "eraser") {
      if (g.erased.size) commit({ ...present, strokes: present.strokes.filter((s) => !g.erased.has(s.id)) });
      else if (!g.moved) applyZone(zoneAtClient(e.clientX, e.clientY)); // toque sin trazos debajo: quita el color de la zona
    }
  };
  const onCancel = () => {
    gesture.current = null;
    setLive("");
  };

  /* ---- exportar PNG (solo web) ---- */
  const download = (c: HTMLCanvasElement) =>
    c.toBlob((b) => {
      if (!b) return setNote(C.exportFail);
      const a = document.createElement("a");
      a.href = URL.createObjectURL(b);
      a.download = `lunacuento-${meta.id}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(a.href), 4000);
    }, "image/png");
  const exportPng = () => {
    setNote("");
    const c = document.createElement("canvas");
    c.width = rast ? W : 1200;
    c.height = rast ? H : 900;
    const cx = c.getContext("2d");
    if (!cx) return setNote(C.exportFail);
    cx.fillStyle = "#FFFFFF";
    cx.fillRect(0, 0, c.width, c.height);
    if (rast) {
      if (!rasterRef.current) return setNote(C.exportFail);
      cx.drawImage(rasterRef.current, 0, 0);
      cx.lineCap = "round";
      cx.lineJoin = "round";
      for (const s of present.strokes) {
        cx.strokeStyle = s.color;
        cx.lineWidth = s.size;
        cx.stroke(new Path2D(s.d));
      }
      return download(c);
    }
    const url = URL.createObjectURL(new Blob([composeSVG(meta.id, present, { width: 1200, height: 900 })], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.onload = () => {
      cx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      download(c);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setNote(C.exportFail);
    };
    img.src = url;
  };

  const list = drawings.filter((d) => cat === "all" || d.cat === cat);
  const drawTool = tool !== "fill";
  const loading = mode === "raster" && !regions && !loadFail;
  const pick = (d: DrawingMeta) => (lockedDrawing(d) ? router.push(`/${lang}/comprar`) : open(d));
  const toolBtn = (k: Tool, label: string, Icon: typeof IconBucket) => (
    <button key={k} type="button" className="tbtn" aria-pressed={tool === k} aria-label={label} title={label} onClick={() => setTool(k)}>
      <Icon size={26} />
    </button>
  );

  return (
    <div className="wrap paint">
      <div className="paint-head">
        <h1 className="section-title">{C.studio}</h1>
        <div className="chips" role="group" aria-label={C.cats}>
          {(["all", ...DRAWING_CATS] as const).map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={cat === k} onClick={() => setCat(k)}>
              {k === "all" ? C.all : CAT_LABEL[k][lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="paint-stage">
        <div className="paint-bar">
          <span aria-hidden="true" />
          <p className="paint-title" aria-live="polite">{drawingTitle(meta, lang)}</p>
          <div className="paint-actions">
            <button type="button" className="tbtn soft" aria-label={C.restart} title={C.restart} onClick={() => confirmRef.current?.showModal()}><IconRestart size={24} /></button>
            {native ? null : <button type="button" className="tbtn soft" aria-label={C.save} title={C.save} onClick={exportPng}><IconDownload size={24} /></button>}
          </div>
        </div>
        <div className="canvas-card" style={{ "--ratio": W / H } as React.CSSProperties}>
          <div className="canvas-stack" data-tool={tool} data-mode={mode} aria-busy={loading}>
            {mode === "svg" ? (
              <div
                key={meta.id}
                ref={canvasRef}
                className="canvas-art"
                onClick={(e) => tool === "fill" && applyZone(zoneAtClient(e.clientX, e.clientY, e.target as Element))}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    if (tool === "fill") applyZone(zoneAtClient(0, 0, e.target as Element));
                  }
                }}
                dangerouslySetInnerHTML={{ __html: DRAWINGS[meta.id] ?? "" }}
              />
            ) : (
              <canvas
                key={meta.id}
                ref={rasterRef}
                className="canvas-art raster"
                width={W}
                height={H}
                role="img"
                aria-label={`${C.drawing}: ${drawingTitle(meta, lang)}`}
                onClick={(e) => tool === "fill" && applyZone(zoneAtClient(e.clientX, e.clientY))}
              />
            )}
            {loading ? <div className="canvas-loading" role="status">{C.loading}</div> : null}
            {loadFail ? <div className="canvas-loading" role="alert">{C.loadFail}</div> : null}
            <svg
              ref={layerRef}
              className="ink"
              viewBox={`0 0 ${W} ${H}`}
              role="img"
              aria-label={C.canvas}
              onPointerDown={drawTool ? onDown : undefined}
              onPointerMove={drawTool ? onMove : undefined}
              onPointerUp={drawTool ? onUp : undefined}
              onPointerCancel={drawTool ? onCancel : undefined}
            >
              <g fill="none" strokeLinecap="round" strokeLinejoin="round">
                {present.strokes.map((s) => <path key={s.id} d={s.d} stroke={s.color} strokeWidth={s.size} />)}
                {live ? <path d={live} stroke={color} strokeWidth={BRUSH_SIZES[size] * scale} /> : null}
              </g>
            </svg>
          </div>
        </div>

        <div className="palette row" role="group" aria-label={C.colors}>
          {PALETTE.map((c) => (
            <button key={c} type="button" className="sw" style={{ background: c }} aria-label={C.names[c] ?? c} aria-pressed={color === c} onClick={() => { setColor(c); if (tool === "eraser") setTool("fill"); }} />
          ))}
        </div>

        <div className="toolbar" role="toolbar" aria-label={C.tools}>
          {toolBtn("brush", C.brush, IconPaintbrush)}
          {toolBtn("fill", C.fill, IconBucket)}
          {toolBtn("eraser", C.eraser, IconEraser)}
          <span className="tsep" aria-hidden="true" />
          <button type="button" className="tbtn" aria-label={C.undo} title={C.undo} onClick={undo} disabled={!past.length}><IconUndo size={26} /></button>
          <button type="button" className="tbtn" aria-label={C.redo} title={C.redo} onClick={redo} disabled={!future.length}><IconRedo size={26} /></button>
        </div>

        {tool === "brush" ? (
          <div className="sizes" role="group" aria-label={C.size}>
            {(Object.keys(BRUSH_SIZES) as BrushSize[]).map((k) => (
              <button key={k} type="button" className="size" aria-pressed={size === k} aria-label={C.sizes[k]} onClick={() => setSize(k)}>
                <i style={{ width: BRUSH_SIZES[k] + 6, height: BRUSH_SIZES[k] + 6 }} />
              </button>
            ))}
          </div>
        ) : null}
        <p className="paint-note" role="status" aria-live="polite">{note || C.autosave}</p>
      </div>

      <section className="paint-pick" aria-label={C.pick}>
        <h2 className="pick-title">{C.more}</h2>
        <ul className="thumbs small">
          {list.map((d) => {
            const locked = lockedDrawing(d);
            const title = drawingTitle(d, lang);
            return (
              <li key={d.id}>
                <button type="button" className="thumb" aria-pressed={meta.id === d.id} onClick={() => pick(d)} aria-label={`${title}${locked ? ` · ${C.locked}` : ""}`}>
                  <span className="thumb-art" aria-hidden="true"><DrawingThumb d={d} state={meta.id === d.id ? present : saved[paintKey(d)]} /></span>
                  <span className="thumb-name">{locked ? <IconLock size={16} /> : null}{title}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <dialog ref={confirmRef} className="gate confirm" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{C.confirmTitle}</h2>
        <p className="gate-ask">{C.confirmText}</p>
        <button type="button" className="btn btn-violet btn-block" onClick={() => { commit(EMPTY_PAINT); confirmRef.current?.close(); }}>{C.yes}</button>
        <button type="button" className="btn btn-line btn-block" onClick={() => confirmRef.current?.close()}>{C.no}</button>
      </dialog>
    </div>
  );
}
