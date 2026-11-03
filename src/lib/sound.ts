"use client";

import { useSyncExternalStore } from "react";

/**
 * Sonido de Lunacuento: todo sintetizado con Web Audio (sin archivos, sin licencias, sin servicios de pago).
 * - Nada suena (ni se crea el AudioContext) hasta la primera interacción de la persona: `arm()` se llama en el primer gesto.
 * - Volumen suave (ganancia maestra baja + compresor). Se puede apagar y se recuerda en el dispositivo (localStorage "lc_sound").
 */
export type SoundName = "click" | "pop" | "page" | "open" | "paint" | "brush" | "celebrate";

const KEY = "lc_sound";
const MASTER = 0.22;
const listeners = new Set<() => void>();
let enabled: boolean | null = null;
let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let armed = false;

declare global {
  interface Window {
    /** Contadores para las pruebas automáticas (no afectan al sonido). */
    __lcSound?: { armed: boolean; contexts: number; plays: number; last: string };
  }
}
const stats = (patch: Partial<NonNullable<Window["__lcSound"]>>) => {
  if (typeof window === "undefined") return;
  window.__lcSound = { armed: false, contexts: 0, plays: 0, last: "", ...window.__lcSound, ...patch };
};

function read(): boolean {
  if (enabled !== null) return enabled;
  try {
    enabled = localStorage.getItem(KEY) !== "0";
  } catch {
    enabled = true;
  }
  return enabled;
}
export function setSoundEnabled(v: boolean) {
  enabled = v;
  try {
    localStorage.setItem(KEY, v ? "1" : "0");
  } catch {
    /* almacenamiento bloqueado: dura solo esta sesión */
  }
  listeners.forEach((l) => l());
}
const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => { listeners.delete(cb); };
};
/** ¿Está activado el sonido? Verdadero en el servidor y en la hidratación (así no cambia el HTML). */
export const useSoundEnabled = () => useSyncExternalStore(subscribe, read, () => true);

/** Primer gesto de la persona: recién ahora se puede crear el AudioContext. */
export function arm() {
  if (armed || typeof window === "undefined") return;
  armed = true;
  stats({ armed: true });
}

function context(): AudioContext | null {
  if (!armed) return null;
  if (ctx) {
    if (ctx.state === "suspended") void ctx.resume();
    return ctx;
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  const comp = ctx.createDynamicsCompressor();
  master = ctx.createGain();
  master.gain.value = MASTER;
  master.connect(comp).connect(ctx.destination);
  stats({ contexts: (window.__lcSound?.contexts ?? 0) + 1 });
  return ctx;
}

/** Campana / nota suave: fundamental + parcial inarmónico, caída exponencial. */
function tone(c: AudioContext, t0: number, freq: number, dur: number, gain: number, type: OscillatorType = "sine", glideTo?: number, bell = false) {
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  g.connect(master!);
  const o = c.createOscillator();
  o.type = type;
  o.frequency.setValueAtTime(freq, t0);
  if (glideTo) o.frequency.exponentialRampToValueAtTime(glideTo, t0 + dur * 0.8);
  o.connect(g);
  o.start(t0);
  o.stop(t0 + dur + 0.05);
  if (bell) {
    const g2 = c.createGain();
    g2.gain.setValueAtTime(0.0001, t0);
    g2.gain.exponentialRampToValueAtTime(gain * 0.35, t0 + 0.01);
    g2.gain.exponentialRampToValueAtTime(0.0001, t0 + dur * 0.55);
    g2.connect(master!);
    const o2 = c.createOscillator();
    o2.type = "sine";
    o2.frequency.setValueAtTime(freq * 2.76, t0);
    o2.connect(g2);
    o2.start(t0);
    o2.stop(t0 + dur * 0.6);
  }
}

/** Ruido filtrado (papel, pincelada, destello). */
function noise(c: AudioContext, t0: number, dur: number, gain: number, f0: number, f1: number, q = 1.2) {
  const n = Math.max(1, Math.floor(c.sampleRate * dur));
  const buf = c.createBuffer(1, n, c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "bandpass";
  f.Q.value = q;
  f.frequency.setValueAtTime(f0, t0);
  f.frequency.exponentialRampToValueAtTime(f1, t0 + dur);
  const g = c.createGain();
  g.gain.setValueAtTime(gain, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f).connect(g).connect(master!);
  src.start(t0);
}

const NOTE = { C5: 523.25, E5: 659.25, G5: 783.99, C6: 1046.5, E6: 1318.5, G6: 1568, C7: 2093 };

const SOUNDS: Record<SoundName, (c: AudioContext, t: number) => void> = {
  click: (c, t) => tone(c, t, 540, 0.07, 0.07, "triangle"),
  pop: (c, t) => {
    tone(c, t, 340, 0.12, 0.16, "sine", 640);
    tone(c, t + 0.05, 900, 0.1, 0.05, "sine");
  },
  page: (c, t) => {
    noise(c, t, 0.24, 0.16, 1500, 3800, 0.9);
    tone(c, t, 150, 0.09, 0.05, "sine", 90);
  },
  open: (c, t) => {
    // campanitas mágicas en escala ascendente + un susurro brillante
    [NOTE.C6, NOTE.E6, NOTE.G6, NOTE.C7, NOTE.E6 * 2].forEach((f, i) => tone(c, t + 0.18 + i * 0.16, f, 1.1, 0.09, "sine", undefined, true));
    noise(c, t + 0.1, 1.2, 0.05, 2500, 7000, 0.6);
    tone(c, t, 196, 0.5, 0.05, "triangle");
  },
  paint: (c, t) => {
    tone(c, t, 280, 0.16, 0.12, "sine", 880);
    tone(c, t + 0.05, 1100, 0.08, 0.04, "sine");
  },
  brush: (c, t) => noise(c, t, 0.14, 0.09, 900, 1700, 1.5),
  celebrate: (c, t) => {
    [NOTE.C5, NOTE.E5, NOTE.G5, NOTE.C6].forEach((f, i) => tone(c, t + i * 0.16, f, 0.5, 0.1, "triangle", undefined, true));
    [NOTE.E6, NOTE.G6, NOTE.C7].forEach((f, i) => tone(c, t + 0.7 + i * 0.12, f, 0.9, 0.07, "sine", undefined, true));
    noise(c, t + 0.65, 0.9, 0.04, 3000, 8000, 0.7);
  },
};

/** Reproduce un sonido (si el sonido está activo y ya hubo una interacción). */
export function playSound(name: SoundName) {
  if (!read()) return;
  const c = context();
  if (!c || !master) return;
  SOUNDS[name](c, c.currentTime + 0.01);
  stats({ plays: (window.__lcSound?.plays ?? 0) + 1, last: name });
}
