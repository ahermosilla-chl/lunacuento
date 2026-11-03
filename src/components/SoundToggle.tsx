"use client";

import type { Dict } from "@/lib/i18n";
import { setSoundEnabled, useSoundEnabled } from "@/lib/sound";
import { IconSound, IconSoundOff } from "./icons";

/** Botón de sonido activado/apagado (se guarda en el dispositivo). */
export default function SoundToggle({ t, className = "round snd" }: { t: Dict; className?: string }) {
  const on = useSoundEnabled();
  return (
    <button type="button" className={className} aria-pressed={on} aria-label={on ? t.nav.soundOn : t.nav.soundOff} title={on ? t.nav.soundOn : t.nav.soundOff} onClick={() => setSoundEnabled(!on)}>
      {on ? <IconSound size={22} /> : <IconSoundOff size={22} />}
    </button>
  );
}
