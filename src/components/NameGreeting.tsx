"use client";

import { useState } from "react";
import type { Dict, Lang } from "@/lib/i18n";
import { DEFAULT_NAME } from "@/lib/i18n";
import { setKidName, useKidName, useRawKidName } from "@/lib/name-store";
import { fmt } from "@/lib/text";

/** Saludo móvil "¡Hola, {nombre}!". Sin nombre guardado pide uno; con nombre, un botón permite cambiarlo. Solo se guarda en el dispositivo. */
export default function NameGreeting({ lang, t }: { lang: Lang; t: Dict }) {
  const raw = useRawKidName();
  const name = useKidName(DEFAULT_NAME[lang]);
  const [edit, setEdit] = useState(false);
  const asking = edit || !raw.trim();
  return (
    <div className="greet">
      <h1 className="greet-hi">{raw.trim() ? fmt(t.hero.hello, { n: name }) : t.mobile.hi}</h1>
      <p className="greet-sub">{asking ? t.hero.nameLabel : t.quick.label}</p>
      {asking ? (
        <div className="greet-edit">
          <label htmlFor="kid-name-m" className="sr-only">{t.hero.nameLabel}</label>
          <input
            id="kid-name-m"
            type="text"
            autoComplete="off"
            autoCapitalize="words"
            spellCheck={false}
            maxLength={18}
            placeholder={t.hero.namePlaceholder}
            value={raw}
            onChange={(e) => setKidName(e.target.value)}
          />
          {raw.trim() ? <button type="button" className="btn btn-sun" onClick={() => setEdit(false)}>{t.mobile.done}</button> : null}
        </div>
      ) : (
        <button type="button" className="greet-change" onClick={() => setEdit(true)}>{t.mobile.change}</button>
      )}
    </div>
  );
}
