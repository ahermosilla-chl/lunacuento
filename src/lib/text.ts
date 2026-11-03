/** Una palabra del texto de una página, lista para iluminarse durante la narración. */
export type Word = { text: string; isName: boolean };

/**
 * Divide el texto de una página en palabras y reemplaza {n} por el nombre.
 * Cada palabra que contiene el nombre se marca para destacarla.
 */
export function tokenize(text: string, name: string): Word[] {
  return text
    .split(/\s+/)
    .filter(Boolean)
    .map((tok) => (tok.includes("{n}") ? { text: tok.split("{n}").join(name), isName: true } : { text: tok, isName: false }));
}

/** Índice del primer carácter de cada palabra dentro de `words.join(" ")`, para el evento boundary. */
export function wordStarts(words: Word[]): number[] {
  const starts: number[] = [];
  let pos = 0;
  for (const w of words) {
    starts.push(pos);
    pos += w.text.length + 1;
  }
  return starts;
}

/** Limpia el nombre ingresado: sin etiquetas, sin saltos, máximo 18 caracteres. */
export function cleanName(v: string): string {
  return v.replace(/[<>{}\n\r\t]/g, "").slice(0, 18);
}

/** Generador pseudoaleatorio determinista (mismo resultado en servidor y cliente). */
export function seeded(seed: number) {
  let s = (Math.abs(Math.floor(seed)) % 233280) + 1;
  return () => (s = (s * 9301 + 49297) % 233280) / 233280;
}

/** Reemplaza {clave} en un texto del diccionario. */
export function fmt(text: string, vars: Record<string, string | number>): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m));
}
