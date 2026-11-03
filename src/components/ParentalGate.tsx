"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import type { Dict } from "@/lib/i18n";
import { fmt } from "@/lib/text";
import { isNative } from "@/lib/platform";

/**
 * Portón para adultos: una suma con los números escritos en palabras y 3 opciones.
 * Se pide antes de comprar, restaurar o abrir un enlace externo (requisito de las categorías Niños / Familias).
 */
type Question = { a: number; b: number; options: number[] };

const MIN = 3;
const MAX = 9;

/** Pregunta nueva: dos números de 3 a 9 y 3 opciones distintas (la correcta en un lugar al azar). */
export function makeQuestion(rand: () => number = Math.random): Question {
  const pick = (lo: number, hi: number) => lo + Math.floor(rand() * (hi - lo + 1));
  const a = pick(MIN, MAX);
  const b = pick(MIN, MAX);
  const sum = a + b;
  const options = new Set<number>([sum]);
  while (options.size < 3) {
    const wrong = sum + pick(-3, 3);
    if (wrong > 1 && wrong !== sum) options.add(wrong);
  }
  const list = [...options];
  // Baraja simple para que la respuesta correcta no quede siempre en el mismo lugar.
  for (let i = list.length - 1; i > 0; i--) {
    const j = pick(0, i);
    [list[i], list[j]] = [list[j], list[i]];
  }
  return { a, b, options: list };
}

function GateDialog({ t, question, wrong, onAnswer, onCancel }: { t: Dict; question: Question; wrong: boolean; onAnswer: (n: number) => void; onCancel: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (d && !d.open) d.showModal();
  }, []);
  const words = t.gate.numbers;
  return (
    <dialog ref={ref} className="gate" aria-labelledby="gate-title" aria-describedby="gate-q" onCancel={(e) => { e.preventDefault(); onCancel(); }}>
      <h2 id="gate-title">{t.gate.title}</h2>
      <p className="gate-ask">{t.gate.ask}</p>
      <p id="gate-q" className="gate-q">{fmt(t.gate.question, { a: words[question.a - MIN], b: words[question.b - MIN] })}</p>
      <div className="gate-opts" role="group" aria-label={t.gate.answers}>
        {question.options.map((n) => (
          <button key={n} type="button" className="gate-opt" onClick={() => onAnswer(n)}>{n}</button>
        ))}
      </div>
      <p className="gate-wrong" role="status" aria-live="polite">{wrong ? t.gate.wrong : ""}</p>
      <button type="button" className="btn btn-line" onClick={onCancel}>{t.gate.cancel}</button>
    </dialog>
  );
}

/**
 * `ask(accion)` abre el portón; la acción solo se ejecuta si la respuesta es correcta.
 * Pintar `gate` en el componente que lo usa.
 */
export function useParentalGate(t: Dict): { ask: (action: () => void) => void; gate: ReactNode } {
  const [open, setOpen] = useState<{ question: Question; action: () => void; wrong: boolean } | null>(null);

  const ask = useCallback((action: () => void) => setOpen({ question: makeQuestion(), action, wrong: false }), []);

  const gate = open ? (
    <GateDialog
      t={t}
      question={open.question}
      wrong={open.wrong}
      onCancel={() => setOpen(null)}
      onAnswer={(n) => {
        if (n === open.question.a + open.question.b) {
          const { action } = open;
          setOpen(null);
          action();
        } else {
          setOpen({ question: makeQuestion(), action: open.action, wrong: true });
        }
      }}
    />
  ) : null;

  return { ask, gate };
}

/**
 * Enlace que sale de la app. En la web es un enlace normal (nueva pestaña);
 * dentro de la app pide primero el portón para adultos y se abre en el navegador del sistema.
 */
export function ExternalLink({ t, href, children, className }: { t: Dict; href: string; children: ReactNode; className?: string }) {
  const { ask, gate } = useParentalGate(t);
  return (
    <>
      <a
        href={href}
        className={className}
        target="_blank"
        rel="noopener noreferrer"
        onClick={(e) => {
          if (!isNative()) return;
          e.preventDefault();
          ask(() => {
            import("@capacitor/browser").then((m) => m.Browser.open({ url: href })).catch(() => {});
          });
        }}
      >
        {children}
      </a>
      {gate}
    </>
  );
}
