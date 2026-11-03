"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { coverInk, sceneSVG } from "@/lib/art";
import type { Dict, Lang } from "@/lib/i18n";
import { DEFAULT_NAME } from "@/lib/i18n";
import { useKidName } from "@/lib/name-store";
import type { Story } from "@/lib/stories";
import { fmt, tokenize, wordStarts, type Word } from "@/lib/text";
import { useMedia, useReducedMotion } from "@/lib/use-media";
import { saveProgress, toggleFavorite, useLibraryData } from "@/lib/library";
import { IconClose, IconHeart, IconMoon, IconNext, IconPause, IconPlay, IconPrev } from "./icons";
import "./reader.css";

/* ------------------------------------------------------------------ */
/* Constantes del gesto y la animación                                 */
/* ------------------------------------------------------------------ */
const DRAG_START_PX = 8;          // movimiento mínimo para considerar que es un arrastre
const COMPLETE_AT = 0.35;          // al soltar: si pasó el 35 % termina de pasar
const FLICK_PX_MS = 0.45;          // ... o si fue un swipe rápido (px/ms)
const TURN_MS = 750;               // duración de la animación completa de una hoja
const COVER_DELAY_MS = 350;        // el libro aparece cerrado un momento antes de abrirse
const COVER_MS = 1100;

type Dir = 1 | -1;
type Turn = { dir: Dir; auto: boolean };
type CoverState = "closed" | "opening" | "open";

const easeOut = (x: number) => 1 - Math.pow(1 - x, 3);

/* ------------------------------------------------------------------ */
/* Piezas de presentación                                              */
/* ------------------------------------------------------------------ */

/**
 * Ilustración de una página: imagen definitiva (fase 3) o escena vectorial determinista.
 * ILUSTRACION-PENDIENTE: aquí van las ilustraciones definitivas de cada página (`page.image`, gpt-image-2).
 */
function Art({ story, index, where, lang }: { story: Story; index: number; where: string; lang: Lang }) {
  const page = story.pages[index];
  const html = useMemo(
    () => (page.image ? "" : sceneSVG(page.scene, `${story.id}-${index}`, `${where}-${story.id}-${index}`)),
    [page, story.id, index, where],
  );
  if (page.image) {
    return (
      <div className="art">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={page.image.src} width={page.image.width} height={page.image.height} alt={page.image.alt[lang]} />
      </div>
    );
  }
  return <div className="art" aria-hidden="true" dangerouslySetInnerHTML={{ __html: html }} />;
}

/** Texto de una página dividido en palabras; `active` es la palabra que se está narrando. */
function StoryText({ words, active, live }: { words: Word[]; active: number; live?: boolean }) {
  return (
    <p className="story-text" aria-live={live ? "polite" : undefined}>
      {words.map((w, i) => (
        <span key={i}>
          <span className={`w${w.isName ? " nm" : ""}${i === active ? " on" : ""}`}>{w.text}</span>
          {i < words.length - 1 ? " " : null}
        </span>
      ))}
    </p>
  );
}

/* ------------------------------------------------------------------ */
/* Lector                                                              */
/* ------------------------------------------------------------------ */

export default function Reader({ lang, t, story }: { lang: Lang; t: Dict; story: Story }) {
  const router = useRouter();
  const name = useKidName(DEFAULT_NAME[lang]);
  const mobile = useMedia("(max-width: 699px)");
  // Tras hidratar se monta solo la vista que corresponde (en el HTML estático van ambas y el CSS elige).
  const hydrated = useMedia("(min-width: 0px)", false);
  const showSpread = !hydrated || !mobile;
  const showSingle = !hydrated || mobile;
  const reduced = useReducedMotion();
  const last = story.pages.length - 1;
  const home = `/${lang}/cuentos`; // "volver": a la biblioteca de cuentos
  const R = t.reader;

  const [page, setPage] = useState(0);
  const [turn, setTurn] = useState<Turn | null>(null);
  const [cover, setCover] = useState<CoverState>("closed");
  const [playing, setPlaying] = useState(false);
  const [active, setActive] = useState(-1);
  const [sleep, setSleep] = useState(false);
  const [timer, setTimer] = useState(0);
  const [goodnight, setGoodnight] = useState(false);
  const [notice, setNotice] = useState("");

  const bookRef = useRef<HTMLDivElement>(null);
  const leafRef = useRef<HTMLDivElement>(null);
  const progress = useRef(0);
  const raf = useRef(0);
  const turnRef = useRef<Turn | null>(null);
  const pageRef = useRef(0);
  const playingRef = useRef(false);
  const mobileRef = useRef(false);
  const drag = useRef<{ id: number; x0: number; y0: number; active: boolean; samples: { x: number; t: number }[]; width: number } | null>(null);

  const sleepRef = useRef(false);
  pageRef.current = page;
  sleepRef.current = sleep;
  turnRef.current = turn;
  playingRef.current = playing;
  mobileRef.current = mobile;

  const isFav = useLibraryData().favs.includes(story.id);

  // "Sigue leyendo": entrar con ?p=<página> retoma donde se quedó; cada cambio de página se guarda en el dispositivo.
  useEffect(() => {
    const p = Number(new URLSearchParams(window.location.search).get("p"));
    if (Number.isInteger(p) && p > 0 && p <= last) setPage(p);
  }, [last]);
  useEffect(() => {
    saveProgress(story.id, page, story.pages.length);
  }, [story.id, story.pages.length, page]);

  const words = useMemo(() => story.pages.map((p) => tokenize(p.text[lang], name)), [story, lang, name]);

  /* ---------------- Apertura de la tapa ---------------- */
  useEffect(() => {
    if (reduced) {
      setCover("open");
      return;
    }
    const a = window.setTimeout(() => setCover("opening"), COVER_DELAY_MS);
    const b = window.setTimeout(() => setCover("open"), COVER_DELAY_MS + COVER_MS + 60);
    return () => {
      window.clearTimeout(a);
      window.clearTimeout(b);
    };
  }, [reduced]);

  /* ---------------- Hoja que gira ---------------- */

  /** Aplica el avance (0..1) a la hoja: rotateY proporcional y sombra dinámica. */
  const apply = useCallback((p: number) => {
    progress.current = p;
    const leaf = leafRef.current;
    const tr = turnRef.current;
    if (leaf && tr) {
      const deg = mobileRef.current && tr.dir === -1 ? -180 * (1 - p) : tr.dir === 1 ? -180 * p : 180 * p;
      leaf.style.transform = `rotateY(${deg.toFixed(2)}deg)`;
    }
    bookRef.current?.style.setProperty("--s", Math.sin(Math.PI * p).toFixed(3));
  }, []);

  const finish = useCallback((done: boolean) => {
    cancelAnimationFrame(raf.current);
    const tr = turnRef.current;
    if (!tr) return;
    progress.current = 0;
    bookRef.current?.style.setProperty("--s", "0");
    turnRef.current = null;
    setTurn(null);
    if (done) {
      setActive(-1);
      setPage((p) => Math.min(last, Math.max(0, p + tr.dir)));
    }
  }, [last]);

  /** Anima la hoja desde el avance actual hasta 1 (termina) o 0 (vuelve). */
  const settle = useCallback((to: 0 | 1) => {
    cancelAnimationFrame(raf.current);
    const from = progress.current;
    if (reduced) {
      finish(to === 1);
      return;
    }
    const dur = Math.max(160, TURN_MS * Math.abs(to - from));
    const t0 = performance.now();
    const step = (now: number) => {
      const x = Math.min(1, (now - t0) / dur);
      apply(from + (to - from) * easeOut(x));
      if (x < 1) raf.current = requestAnimationFrame(step);
      else finish(to === 1);
    };
    raf.current = requestAnimationFrame(step);
  }, [apply, finish, reduced]);

  const canTurn = useCallback((dir: Dir) => {
    const p = pageRef.current + dir;
    return p >= 0 && p <= last;
  }, [last]);

  /** Pasa de página con animación (flechas, teclado, toque en los lados, narración). */
  const turnPage = useCallback((dir: Dir, auto = false) => {
    if (turnRef.current || !canTurn(dir)) return false;
    if (reduced) {
      setActive(-1);
      setPage((p) => p + dir);
      return true;
    }
    const tr = { dir, auto };
    turnRef.current = tr;
    progress.current = 0;
    setTurn(tr);
    // Cuando la hoja ya está montada (useLayoutEffect de abajo), arranca la animación.
    requestAnimationFrame(() => settle(1));
    return true;
  }, [canTurn, reduced, settle]);

  // Posición inicial de la hoja al montarse (antes de pintar, sin parpadeo).
  useLayoutEffect(() => {
    if (turn) apply(progress.current);
  }, [turn, apply]);

  useEffect(() => () => cancelAnimationFrame(raf.current), []);

  /* ---------------- Gesto: la hoja sigue el dedo ---------------- */
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (cover !== "open" || turnRef.current) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    if ((e.target as Element).closest("a,button,select,input")) return;
    const el = (mobileRef.current ? e.currentTarget.querySelector(".single") : e.currentTarget.querySelector(".spread")) as HTMLElement | null;
    drag.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, active: false, samples: [{ x: e.clientX, t: e.timeStamp }], width: el?.getBoundingClientRect().width || e.currentTarget.clientWidth };
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId) return;
    const dx = e.clientX - d.x0;
    const dy = e.clientY - d.y0;
    d.samples.push({ x: e.clientX, t: e.timeStamp });
    if (d.samples.length > 6) d.samples.shift();
    if (!d.active) {
      if (Math.abs(dx) < DRAG_START_PX || Math.abs(dx) < Math.abs(dy)) return;
      const dir: Dir = dx < 0 ? 1 : -1;
      if (!canTurn(dir)) {
        drag.current = null;
        return;
      }
      d.active = true;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        /* algunos navegadores no permiten capturar tras un pointercancel */
      }
      const tr = { dir, auto: false };
      turnRef.current = tr;
      progress.current = 0;
      setTurn(tr);
    }
    const tr = turnRef.current;
    if (!tr) return;
    const p = Math.min(1, Math.max(0, (-dx * tr.dir) / d.width));
    apply(p);
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    drag.current = null;
    if (!d || d.id !== e.pointerId) return;
    if (d.active && turnRef.current) {
      const dir = turnRef.current.dir;
      const first = d.samples[0];
      const lastS = d.samples[d.samples.length - 1];
      const v = (lastS.x - first.x) / Math.max(1, lastS.t - first.t); // px/ms, negativo hacia la izquierda
      const flick = -v * dir > FLICK_PX_MS;
      const back = v * dir > FLICK_PX_MS;
      settle(!back && (progress.current > COMPLETE_AT || flick) ? 1 : 0);
      return;
    }
    // Toque sin arrastre: lado derecho avanza, lado izquierdo retrocede.
    if (Math.abs(e.clientX - d.x0) < DRAG_START_PX && Math.abs(e.clientY - d.y0) < DRAG_START_PX) {
      const r = e.currentTarget.getBoundingClientRect();
      turnPage(e.clientX > r.left + r.width / 2 ? 1 : -1);
    }
  };

  const onPointerCancel = () => {
    const d = drag.current;
    drag.current = null;
    if (d?.active && turnRef.current) settle(0);
  };

  /* ---------------- Teclado ---------------- */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (goodnight) return;
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "SELECT" || tag === "INPUT") return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        turnPage(1);
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        turnPage(-1);
      } else if (e.key === "Escape") {
        router.push(home);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [turnPage, router, home, goodnight]);

  /* ---------------- Lectura acompañada ---------------- */
  const speakId = useRef(0);
  const wordTimer = useRef(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const stopSpeech = useCallback(() => {
    speakId.current++;
    window.clearInterval(wordTimer.current);
    try {
      window.speechSynthesis?.cancel();
    } catch {
      /* sin speechSynthesis */
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  /** Al terminar la narración de una página: pasa sola con la animación o termina. Solo actúa una vez por página. */
  const pageDone = useCallback((id: number) => {
    if (id !== speakId.current || !playingRef.current) return;
    const next = ++speakId.current; // invalida otros avisos de fin de esta misma página
    window.clearInterval(wordTimer.current);
    setActive(-1);
    if (pageRef.current < last) {
      window.setTimeout(() => {
        if (next === speakId.current && playingRef.current) turnPage(1, true);
      }, sleepRef.current ? 700 : 350);
    } else {
      setPlaying(false);
    }
  }, [last, turnPage]);

  /**
   * Ilumina las palabras con un ritmo fijo (sin voz, o si el navegador no informa los límites de palabra).
   * Con `endsPage` en false solo ilumina: el fin de página lo avisa la voz.
   */
  const timed = useCallback((id: number, n: number, endsPage = true) => {
    window.clearInterval(wordTimer.current);
    let i = 0;
    setActive(i);
    wordTimer.current = window.setInterval(() => {
      if (id !== speakId.current) return window.clearInterval(wordTimer.current);
      i++;
      if (i >= n) {
        window.clearInterval(wordTimer.current);
        if (endsPage) pageDone(id);
        return;
      }
      setActive(i);
    }, sleepRef.current ? 600 : 420);
  }, [pageDone]);

  const speak = useCallback((index: number) => {
    stopSpeech();
    const id = ++speakId.current;
    const ws = words[index];
    const text = ws.map((w) => w.text).join(" ");

    // Fase 4: narración grabada con tiempos por palabra (ElevenLabs). Solo si coincide con el nombre actual.
    const rec = story.pages[index].audio?.[lang];
    if (rec && (rec.recordedName === "" || rec.recordedName === name)) {
      const a = new Audio(rec.src);
      a.playbackRate = sleepRef.current ? 0.9 : 1;
      audioRef.current = a;
      a.ontimeupdate = () => {
        if (id !== speakId.current) return;
        const cur = rec.words.find((w) => a.currentTime >= w.start && a.currentTime < w.end);
        if (cur) setActive(cur.word);
      };
      a.onended = () => pageDone(id);
      a.onerror = () => timed(id, ws.length);
      a.play().catch(() => timed(id, ws.length));
      return;
    }

    const synth = typeof window !== "undefined" ? window.speechSynthesis : undefined;
    const want = lang === "es" ? ["es-cl", "es-419", "es-us", "es-mx", "es-es", "es"] : ["en-us", "en-gb", "en"];
    const voices = synth?.getVoices() ?? [];
    const voice = want.map((w) => voices.find((v) => v.lang?.toLowerCase().replace("_", "-").startsWith(w))).find(Boolean);
    if (!synth || !voice) {
      setNotice(R.noVoice);
      timed(id, ws.length);
      return;
    }
    const starts = wordStarts(ws);
    const u = new SpeechSynthesisUtterance(text);
    u.voice = voice;
    u.lang = voice.lang;
    // La velocidad se lee al empezar cada página: activar el modo dormir no corta la página actual.
    u.rate = sleepRef.current ? 0.75 : 0.92;
    u.pitch = 1.05;
    let boundary = false;
    u.onboundary = (ev) => {
      if (id !== speakId.current || (ev.name && ev.name !== "word")) return;
      boundary = true;
      let k = 0;
      while (k + 1 < starts.length && starts[k + 1] <= ev.charIndex) k++;
      setActive(k);
    };
    u.onstart = () => {
      // Algunas voces no emiten "boundary": en ese caso se ilumina con un ritmo aproximado.
      window.setTimeout(() => {
        if (!boundary && id === speakId.current) timed(id, ws.length, false);
      }, 900);
    };
    u.onend = () => pageDone(id);
    u.onerror = () => {
      if (id === speakId.current) timed(id, ws.length);
    };
    synth.speak(u);
  }, [words, story.pages, lang, name, stopSpeech, pageDone, timed, R.noVoice]);

  // Narra la página actual mientras esté sonando y no haya una hoja girando.
  useEffect(() => {
    if (!playing || turn || cover !== "open") return;
    speak(page);
    return () => stopSpeech();
  }, [playing, page, turn, cover, speak, stopSpeech]);

  useEffect(() => {
    if (!playing) {
      stopSpeech();
      setActive(-1);
    }
  }, [playing, stopSpeech]);

  useEffect(() => () => stopSpeech(), [stopSpeech]);

  // Precarga de voces (Chrome las entrega de forma asíncrona).
  useEffect(() => {
    const s = window.speechSynthesis;
    if (!s) return;
    s.getVoices();
    const h = () => s.getVoices();
    s.addEventListener?.("voiceschanged", h);
    return () => s.removeEventListener?.("voiceschanged", h);
  }, []);

  useEffect(() => {
    if (!notice) return;
    const id = window.setTimeout(() => setNotice(""), 3600);
    return () => window.clearTimeout(id);
  }, [notice]);

  /* ---------------- Modo dormir, wakeLock y temporizador ---------------- */
  useEffect(() => {
    if (!sleep || !("wakeLock" in navigator)) return;
    let lock: WakeLockSentinel | null = null;
    let alive = true;
    const req = () => {
      navigator.wakeLock.request("screen").then((l) => {
        if (alive) lock = l;
        else l.release().catch(() => {});
      }).catch(() => {});
    };
    const onVis = () => {
      if (document.visibilityState === "visible") req();
    };
    req();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      alive = false;
      document.removeEventListener("visibilitychange", onVis);
      lock?.release().catch(() => {});
    };
  }, [sleep]);

  useEffect(() => {
    if (!timer) return;
    const id = window.setTimeout(() => {
      setPlaying(false);
      setGoodnight(true);
    }, timer * 60_000);
    return () => window.clearTimeout(id);
  }, [timer]);

  const gnBtn = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (goodnight) gnBtn.current?.focus();
  }, [goodnight]);

  /* ---------------- Datos para pintar ---------------- */
  const leftIdx = turn?.dir === -1 ? page - 1 : page;     // escritorio: ilustración a la izquierda
  const rightIdx = turn?.dir === 1 ? page + 1 : page;     // escritorio: texto a la derecha
  const singleIdx = turn?.dir === 1 ? page + 1 : page;    // móvil: página que queda debajo
  const hl = turn ? -1 : active;
  const ink = coverInk(story.color);
  const forName = fmt(R.forName, { n: name });
  const coverPage = story.coverPage;

  const textPaper = (i: number, live: boolean, cls = "paper pr") => (
    <div className={cls}>
      <div className="spine-r" />
      <StoryText words={words[i]} active={i === page ? hl : -1} live={live} />
      {i === last && live ? (
        <div className="end-actions">
          <button type="button" className="btn btn-sun" onClick={() => { setPlaying(false); setPage(0); }}>{R.again}</button>
          <Link href={`/${lang}/pintar?dibujo=${story.coloring}`} className="btn btn-line">{R.color}</Link>
        </div>
      ) : null}
      <span className="pnum">{i * 2 + 2}</span>
    </div>
  );
  const artPaper = (i: number, where: string) => (
    <div className="paper pl">
      <Art story={story} index={i} where={where} lang={lang} />
      <span className="pnum">{i * 2 + 1}</span>
      <div className="spine-l" />
    </div>
  );
  const singlePaper = (i: number, where: string, live: boolean) => (
    <div className="paper ps">
      <div className="spine-r" />
      <Art story={story} index={i} where={where} lang={lang} />
      <StoryText words={words[i]} active={i === page ? hl : -1} live={live} />
      {i === last && live ? (
        <div className="end-actions">
          <button type="button" className="btn btn-sun" onClick={() => { setPlaying(false); setPage(0); }}>{R.again}</button>
          <Link href={`/${lang}/pintar?dibujo=${story.coloring}`} className="btn btn-line">{R.color}</Link>
        </div>
      ) : null}
      <span className="pnum">{i + 1}</span>
    </div>
  );
  const coverFront = (
    <div className="cover-front" style={{ "--cover-ink": ink } as React.CSSProperties}>
      <Art story={story} index={coverPage} where="cover" lang={lang} />
      <h2>{story.title[lang]}</h2>
      <p>{forName} · {story.age} {t.shelf.ages}</p>
    </div>
  );

  const playLabel = playing ? R.pause : R.listen;
  const PlayIcon = playing ? IconPause : IconPlay;
  const timerSelect = (id: string, compact = false) => (
    <>
      <label htmlFor={id} className="sr-only">{R.timer}</label>
      <select id={id} className={`r-timer${compact ? " chip-timer" : ""}`} value={timer} onChange={(e) => setTimer(Number(e.target.value))}>
        <option value={0}>{compact ? "—" : R.timerOff}</option>
        <option value={10}>{compact ? "10 min" : fmt(R.timerMin, { m: 10 })}</option>
        <option value={20}>{compact ? "20 min" : fmt(R.timerMin, { m: 20 })}</option>
      </select>
    </>
  );

  return (
    <div className={`reader${sleep ? " sleep" : ""}`} style={{ "--cover": story.color } as React.CSSProperties}>
      <noscript>
        <style>{".cover-leaf{display:none}.book{transform:none!important}.half.l{visibility:visible!important}"}</style>
      </noscript>
      <svg className="bg-stars" aria-hidden="true" focusable="false" viewBox="0 0 1440 900" preserveAspectRatio="none">
        <g fill="#FFF8E7" opacity=".55">
          <circle cx="80" cy="140" r="2" /><circle cx="200" cy="820" r="2" /><circle cx="1360" cy="160" r="2" /><circle cx="1300" cy="800" r="2.5" />
          <circle cx="60" cy="560" r="1.5" /><circle cx="1400" cy="520" r="1.5" /><circle cx="700" cy="860" r="1.5" />
        </g>
      </svg>

      <header className="r-top">
        <Link href={home} className="round" aria-label={`${R.closeBook} · ${R.toLibrary}`}><IconClose /></Link>
        <div className="r-title">
          <h1 className="disp">{story.title[lang]}</h1>
          <p>{forName}</p>
        </div>
        {sleep ? <span className="r-timer-m">{timerSelect("timer-m", true)}</span> : null}
        <button type="button" className="round r-fav-m" aria-pressed={isFav} aria-label={isFav ? R.favRemove : R.favAdd} onClick={() => toggleFavorite(story.id)}>
          <IconHeart size={20} filled={isFav} />
        </button>
        <button type="button" className="round r-sleep-m" aria-pressed={sleep} aria-label={sleep ? R.sleepOn : R.sleep} onClick={() => setSleep((v) => !v)}>
          <IconMoon size={20} />
        </button>
        <div className="r-actions">
          <button type="button" className="round r-fav" aria-pressed={isFav} aria-label={isFav ? R.favRemove : R.favAdd} onClick={() => toggleFavorite(story.id)}>
            <IconHeart size={22} filled={isFav} />
          </button>
          <button type="button" className="pill" aria-pressed={sleep} onClick={() => setSleep((v) => !v)}>
            <IconMoon /> {R.sleep}
          </button>
          {timerSelect("timer")}
          <button type="button" className="pill sun" onClick={() => setPlaying((v) => !v)} aria-pressed={playing}>
            <PlayIcon /> {playLabel}
          </button>
        </div>
      </header>

      <main className="stage" id="contenido">
        <div
          ref={bookRef}
          className="book"
          data-cover={cover}
          role="region"
          aria-roledescription={lang === "es" ? "libro" : "book"}
          aria-label={`${story.title[lang]} · ${fmt(R.pageOf, { a: page + 1, b: story.pages.length })}`}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Escritorio: doble página */}
          {showSpread ? <div className="spread">
            <div className="half l">{artPaper(leftIdx, "l")}</div>
            <div className="half r">{textPaper(rightIdx, !turn)}</div>

            {turn && !mobile ? (
              <>
                <div className={`cast ${turn.dir === 1 ? "fwd" : "bwd"}`} />
                <div ref={leafRef} className={`leaf ${turn.dir === 1 ? "fwd" : "bwd"}`} aria-hidden="true">
                  {turn.dir === 1 ? (
                    <>
                      <div className="face front">{textPaper(page, false)}<div className="shade" /></div>
                      <div className="face back">{artPaper(page + 1, "leafb")}<div className="shade" /></div>
                    </>
                  ) : (
                    <>
                      <div className="face front">{artPaper(page, "leaff")}<div className="shade" /></div>
                      <div className="face back">{textPaper(page - 1, false)}<div className="shade" /></div>
                    </>
                  )}
                </div>
              </>
            ) : null}

            {cover !== "open" && !mobile ? (
              <div className="cover-leaf" aria-hidden="true">
                <div className="face front">{coverFront}</div>
                <div className="face back"><div className="half l" style={{ flex: 1 }}>{artPaper(0, "coverb")}</div></div>
              </div>
            ) : null}
          </div> : null}

          {/* Móvil: una sola página que gira sobre el lomo izquierdo */}
          {showSingle ? <div className="single">
            <div className="half s">
              {singlePaper(singleIdx, "s", !turn)}
              {turn && mobile ? (
                <>
                  <div className="cast m" />
                  <div ref={leafRef} className="leaf m" aria-hidden="true">
                    <div className="face front">{singlePaper(turn.dir === 1 ? page : page - 1, "leafm", false)}<div className="shade" /></div>
                    <div className="face back"><div className="paper ps" /><div className="shade" /></div>
                  </div>
                </>
              ) : null}
            </div>
            {cover !== "open" && mobile ? (
              <div className="cover-leaf m" aria-hidden="true">
                <div className="face front">{coverFront}</div>
                <div className="face back"><div className="board" /></div>
              </div>
            ) : null}
          </div> : null}
        </div>
      </main>

      <nav className="r-bottom" aria-label={fmt(R.pageOf, { a: page + 1, b: story.pages.length })}>
        {notice ? <p className="notice" role="status">{notice}</p> : null}
        <button type="button" className="round round-lg" aria-label={R.prevPage} disabled={page === 0} onClick={() => turnPage(-1)}>
          <IconPrev />
        </button>
        <button type="button" className="btn btn-sun play-m" onClick={() => setPlaying((v) => !v)} aria-pressed={playing}>
          <PlayIcon size={18} /> {playLabel}
        </button>
        <div className="dots" aria-hidden="true">
          {story.pages.map((_, i) => <span key={i} className={i === page ? "on" : ""} />)}
        </div>
        <button
          type="button"
          className="round round-lg sun"
          aria-label={page === last ? R.end : R.nextPage}
          onClick={() => (page === last ? router.push(home) : turnPage(1))}
        >
          <IconNext />
        </button>
        <span className="hint">{R.hint}</span>
      </nav>

      {goodnight ? (
        <div className="goodnight" role="dialog" aria-modal="true" aria-labelledby="gn-title">
          <div>
            <div className="moon-big" aria-hidden="true" />
            <h2 id="gn-title">{R.goodnight}, {name}</h2>
            <button ref={gnBtn} type="button" className="btn btn-line" onClick={() => { setGoodnight(false); setTimer(0); }}>{R.tapBack}</button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
