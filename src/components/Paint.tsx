"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { DRAWINGS, PALETTE } from "@/lib/art";
import { CAT_LABEL, DRAWING_CATS, DRAWING_LIST, type DrawingCat } from "@/lib/drawings";
import type { Dict, Lang } from "@/lib/i18n";
import { BRUSH_SIZES, composeSVG, EMPTY_PAINT, type BrushSize, type PaintState, type Stroke } from "@/lib/paint";
import { getPainting, savePainting, usePaintings } from "@/lib/paint-store";
import { useNative } from "@/lib/platform";
import { useLibrary } from "@/lib/purchases";
import { getStory } from "@/lib/stories";
import { IconBucket, IconDownload, IconEraser, IconPaintbrush, IconLock, IconRedo, IconRestart, IconUndo } from "./icons";

type Tool = "fill" | "brush" | "eraser";
const W = 400;
const H = 300;
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
 * Taller de pintura. Implementado y probado: relleno por zonas, pincel libre (3 grosores), goma (zonas y trazos),
 * deshacer / rehacer (50 pasos), reiniciar con confirmación, guardado automático en el dispositivo y exportar PNG
 * (solo web: en la app haría falta el plugin de compartir/archivos de Capacitor, ver docs).
 * Táctil y mouse con pointer events; el scroll solo se bloquea sobre el lienzo con pincel o goma.
 */
export default function Paint({ lang, t }: { lang: Lang; t: Dict }) {
  const C = t.coloring;
  const router = useRouter();
  const owned = useLibrary();
  const native = useNative();
  const saved = usePaintings();

  const [drawing, setDrawing] = useState("luna");
  const [cat, setCat] = useState<"all" | DrawingCat>("all");
  const [tool, setTool] = useState<Tool>("fill");
  const [color, setColor] = useState<string>(PALETTE[0]);
  const [size, setSize] = useState<BrushSize>("m");
  const [present, setPresent] = useState<PaintState>(EMPTY_PAINT);
  const [past, setPast] = useState<PaintState[]>([]);
  const [future, setFuture] = useState<PaintState[]>([]);
  const [live, setLive] = useState("");
  const [note, setNote] = useState("");

  const canvasRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<SVGSVGElement>(null);
  const confirmRef = useRef<HTMLDialogElement>(null);
  const gesture = useRef<{ id: number; pts: [number, number][]; moved: boolean; erased: Set<number>; x0: number; y0: number } | null>(null);

  const lockedDrawing = useCallback((id: string) => {
    const story = getStory(DRAWING_LIST.find((d) => d.id === id)?.storyId ?? "");
    return Boolean(story?.premium) && !owned;
  }, [owned]);

  const open = useCallback((id: string) => {
    setDrawing(id);
    setPresent(getPainting(id));
    setPast([]);
    setFuture([]);
    setLive("");
    setNote("");
  }, []);

  // Abre el dibujo indicado en ?dibujo= (si existe y no está bloqueado) al entrar.
  useEffect(() => {
    const want = new URLSearchParams(window.location.search).get("dibujo") ?? "";
    open(DRAWINGS[want] && !lockedDrawing(want) ? want : "luna");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Pinta el DOM del dibujo y lo hace accesible. Es idempotente, así que corre tras cada render.
  useLayoutEffect(() => {
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
  });  // sin lista de dependencias a propósito: React puede reemplazar el SVG al hidratar y hay que volver a marcarlo

  const commit = (next: PaintState) => {
    setPast((p) => [...p.slice(-(HISTORY - 1)), present]);
    setFuture([]);
    setPresent(next);
    savePainting(drawing, next);
  };
  const undo = () => {
    if (!past.length) return;
    const prev = past[past.length - 1];
    setFuture((f) => [present, ...f]);
    setPast((p) => p.slice(0, -1));
    setPresent(prev);
    savePainting(drawing, prev);
  };
  const redo = () => {
    if (!future.length) return;
    const [next, ...rest] = future;
    setPast((p) => [...p, present]);
    setFuture(rest);
    setPresent(next);
    savePainting(drawing, next);
  };

  const paintZone = (el: Element | null) => {
    const zone = el?.closest<SVGElement>(".f");
    if (!zone) return;
    const i = Number(zone.dataset.i);
    if (tool === "fill" && present.fills[i] !== color) commit({ ...present, fills: { ...present.fills, [i]: color } });
    if (tool === "eraser" && present.fills[i] !== undefined) {
      const fills = { ...present.fills };
      delete fills[i];
      commit({ ...present, fills });
    }
  };

  /* ---- pincel y goma: pointer events sobre la capa de trazos ---- */
  const toBox = (e: React.PointerEvent) => {
    const r = layerRef.current!.getBoundingClientRect();
    return [Math.round(((e.clientX - r.left) / r.width) * W * 10) / 10, Math.round(((e.clientY - r.top) / r.height) * H * 10) / 10] as [number, number];
  };
  const pathOf = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");

  const onDown = (e: React.PointerEvent) => {
    if (e.button > 0 || gesture.current) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const [x, y] = toBox(e);
    gesture.current = { id: e.pointerId, pts: [[x, y]], moved: false, erased: new Set(), x0: e.clientX, y0: e.clientY };
    if (tool === "brush") setLive(pathOf([[x, y], [x + 0.1, y]]));
    if (tool === "eraser") eraseAt(x, y);
  };
  const eraseAt = (x: number, y: number) => {
    const g = gesture.current!;
    for (const s of present.strokes) if (!g.erased.has(s.id) && touches(s, x, y, 6)) g.erased.add(s.id);
  };
  const onMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    const [x, y] = toBox(e);
    if (Math.hypot(e.clientX - g.x0, e.clientY - g.y0) > 5) g.moved = true;
    if (tool === "brush") {
      const [lx, ly] = g.pts[g.pts.length - 1];
      if (Math.hypot(x - lx, y - ly) >= 1.5 && g.pts.length < MAX_POINTS) {
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
      commit({ ...present, strokes: [...present.strokes, { id, color, size: BRUSH_SIZES[size], d: pathOf(pts) }] });
    } else if (tool === "eraser") {
      if (g.erased.size) {
        commit({ ...present, strokes: present.strokes.filter((s) => !g.erased.has(s.id)) });
      } else if (!g.moved) {
        // toque sin trazos debajo: borra el color de la zona que está bajo el dedo
        const hit = document.elementsFromPoint(e.clientX, e.clientY).find((n) => n.classList.contains("f"));
        paintZone(hit ?? null);
      }
    }
  };
  const onCancel = () => {
    gesture.current = null;
    setLive("");
  };

  /* ---- exportar PNG (solo web) ---- */
  const exportPng = () => {
    setNote("");
    const url = URL.createObjectURL(new Blob([composeSVG(drawing, present, { width: 1200, height: 900 })], { type: "image/svg+xml;charset=utf-8" }));
    const img = new Image();
    img.onload = () => {
      const c = document.createElement("canvas");
      c.width = 1200;
      c.height = 900;
      const ctx = c.getContext("2d");
      if (!ctx) return setNote(C.exportFail);
      ctx.fillStyle = "#FFFFFF";
      ctx.fillRect(0, 0, c.width, c.height);
      ctx.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      c.toBlob((b) => {
        if (!b) return setNote(C.exportFail);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(b);
        a.download = `lunacuento-${drawing}.png`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(a.href), 4000);
      }, "image/png");
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      setNote(C.exportFail);
    };
    img.src = url;
  };

  const list = DRAWING_LIST.filter((d) => cat === "all" || d.cat === cat);
  const drawTool = tool !== "fill";
  const pick = (id: string) => (lockedDrawing(id) ? router.push(`/${lang}/comprar`) : open(id));
  const modeBtn = (k: Tool, label: string, Icon: typeof IconPaintbrush) => (
    <button key={k} type="button" className="tool" aria-pressed={tool === k} onClick={() => setTool(k)}>
      <Icon size={24} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="wrap paint">
      <h1 className="section-title">{C.studio}</h1>

      <div className="paint-pick">
        <div className="chips" role="group" aria-label={C.cats}>
          {(["all", ...DRAWING_CATS] as const).map((k) => (
            <button key={k} type="button" className="chip" aria-pressed={cat === k} onClick={() => setCat(k)}>
              {k === "all" ? C.all : CAT_LABEL[k][lang]}
            </button>
          ))}
        </div>
        <ul className="thumbs small" aria-label={C.pick}>
          {list.map((d) => {
            const story = getStory(d.storyId);
            const locked = lockedDrawing(d.id);
            return (
              <li key={d.id}>
                <button type="button" className="thumb" aria-pressed={drawing === d.id} onClick={() => pick(d.id)} aria-label={`${story?.title[lang]}${locked ? ` · ${C.locked}` : ""}`}>
                  <span className="thumb-art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: composeSVG(d.id, drawing === d.id ? present : saved[d.id]) }} />
                  <span className="thumb-name">{locked ? <IconLock size={16} /> : null}{story?.title[lang]}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="paint-grid">
        <div className="canvas-card">
          <div className="canvas-stack" data-tool={tool}>
            <div
              key={drawing}
              ref={canvasRef}
              className="canvas-art"
              onClick={(e) => tool === "fill" && paintZone(e.target as Element)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  if (tool === "fill") paintZone(e.target as Element);
                }
              }}
              dangerouslySetInnerHTML={{ __html: DRAWINGS[drawing] }}
            />
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
                {live ? <path d={live} stroke={color} strokeWidth={BRUSH_SIZES[size]} /> : null}
              </g>
            </svg>
          </div>
        </div>

        <div className="paint-tools">
          <div className="tool-row" role="group" aria-label={C.tools}>
            {modeBtn("fill", C.fill, IconBucket)}
            {modeBtn("brush", C.brush, IconPaintbrush)}
            {modeBtn("eraser", C.eraser, IconEraser)}
          </div>

          <div className="palette" role="group" aria-label={C.colors}>
            {PALETTE.map((c) => (
              <button key={c} type="button" className="sw" style={{ background: c }} aria-label={C.names[c] ?? c} aria-pressed={color === c} onClick={() => { setColor(c); if (tool === "eraser") setTool("fill"); }} />
            ))}
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

          <div className="tool-row actions">
            <button type="button" className="tool" onClick={undo} disabled={!past.length}><IconUndo /><span>{C.undo}</span></button>
            <button type="button" className="tool" onClick={redo} disabled={!future.length}><IconRedo /><span>{C.redo}</span></button>
            <button type="button" className="tool" onClick={() => confirmRef.current?.showModal()}><IconRestart /><span>{C.restart}</span></button>
            {native ? null : <button type="button" className="tool" onClick={exportPng}><IconDownload /><span>{C.save}</span></button>}
          </div>
          <p className="paint-note" role="status" aria-live="polite">{note || C.autosave}</p>
        </div>
      </div>

      <dialog ref={confirmRef} className="gate confirm" aria-labelledby="confirm-title">
        <h2 id="confirm-title">{C.confirmTitle}</h2>
        <p className="gate-ask">{C.confirmText}</p>
        <button type="button" className="btn btn-violet btn-block" onClick={() => { commit(EMPTY_PAINT); confirmRef.current?.close(); }}>{C.yes}</button>
        <button type="button" className="btn btn-line btn-block" onClick={() => confirmRef.current?.close()}>{C.no}</button>
      </dialog>
    </div>
  );
}
