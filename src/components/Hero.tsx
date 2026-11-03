"use client";

import Link from "next/link";
import type { Dict, Lang } from "@/lib/i18n";
import { DEFAULT_NAME } from "@/lib/i18n";
import { setKidName, useKidName, useRawKidName } from "@/lib/name-store";
import { IconPerson } from "./icons";

/** Estrellas fijas (deterministas) del cielo del hero, según docs/diseno/Main.dc.html. */
const STARS: [number, number, number][] = [
  [90, 120, 2], [220, 60, 1.5], [380, 140, 2.5], [520, 80, 1.5], [640, 190, 2], [760, 70, 2.5], [880, 150, 1.5],
  [1010, 50, 2], [1180, 110, 1.5], [1320, 70, 2.5], [1400, 200, 1.5], [300, 260, 1.5], [700, 300, 2], [1240, 280, 2],
];

export default function Hero({ lang, t, firstStory }: { lang: Lang; t: Dict; firstStory: string }) {
  const raw = useRawKidName();
  const name = useKidName(DEFAULT_NAME[lang]);
  const [before, after] = t.hero.bookLine.split("{n}");
  return (
    <section className="hero" aria-labelledby="hero-title">
      <svg className="stars" aria-hidden="true" focusable="false" viewBox="0 0 1440 640" preserveAspectRatio="none">
        <g fill="#FFF8E7">
          {STARS.map(([x, y, r]) => <circle key={`${x}-${y}`} cx={x} cy={y} r={r} />)}
        </g>
        <path d="M600 110 l6 13 14 2 -10 10 3 14 -13 -7 -13 7 3 -14 -10 -10 14 -2z" fill="#FFC94D" opacity=".9" />
        <path d="M150 300 l4 9 10 1 -7 7 2 10 -9 -5 -9 5 2 -10 -7 -7 10 -1z" fill="#FFC94D" opacity=".7" />
      </svg>
      <div className="hero-moon-m" aria-hidden="true" />
      <div className="wrap hero-grid">
        <div className="hero-copy">
          <span className="eyebrow-pill">{t.hero.eyebrow}</span>
          <h1 id="hero-title">
            {t.hero.title[0]} {t.hero.title[1]} <em>{t.hero.title[2]}</em>
          </h1>
          <p className="lede">{t.hero.lede}</p>
          <label htmlFor="kid-name" className="name-label">{t.hero.nameLabel}</label>
          <div className="namebox">
            <span className="face-ico" aria-hidden="true"><IconPerson size={22} className="ink-sun" /></span>
            <input
              id="kid-name"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="words"
              spellCheck={false}
              maxLength={18}
              placeholder={t.hero.namePlaceholder}
              value={raw}
              onChange={(e) => setKidName(e.target.value)}
            />
            <Link href={`/${lang}/cuento/${firstStory}`} className="btn btn-sun">{t.hero.cta}</Link>
          </div>
        </div>

        <div className="hero-book" aria-hidden="true">
          <div className="hero-moon" />
          <div className="mini-book">
            <div className="pg pg-l">
              <svg viewBox="0 0 200 210" focusable="false">
                <rect width="200" height="210" fill="#1E2A6E" />
                <circle cx="150" cy="48" r="26" fill="#FFE08A" />
                <circle cx="40" cy="40" r="1.6" fill="#FFF8E7" /><circle cx="90" cy="70" r="1.6" fill="#FFF8E7" /><circle cx="70" cy="22" r="1.4" fill="#FFF8E7" />
                <path d="M0 150 Q50 120 100 145 T200 135 V210 H0Z" fill="#24467A" />
                <path d="M0 175 Q70 155 130 172 T200 168 V210 H0Z" fill="#1B3763" />
                <circle cx="110" cy="128" r="14" fill="#FFC93C" opacity=".35" /><circle cx="110" cy="128" r="3" fill="#FFF8D0" />
              </svg>
            </div>
            <div className="pg pg-r">
              <p>{before}<span className="nm">{name}</span>{after}</p>
              <span className="pnum">2</span>
            </div>
          </div>
        </div>
      </div>
      <svg className="hills" aria-hidden="true" focusable="false" viewBox="0 0 1440 200" preserveAspectRatio="none">
        <path d="M0 90 Q240 20 480 80 T960 70 T1440 60 V200 H0Z" fill="#3D36A0" />
        <path d="M0 130 Q300 70 620 120 T1180 110 T1440 120 V200 H0Z" fill="#00C2AB" />
        <path className="h3" d="M0 165 Q360 125 760 160 T1440 150 V200 H0Z" />
      </svg>
    </section>
  );
}
