"use client";

import { useState } from "react";
import type { Dict } from "@/lib/i18n";
import { APP_STORE_URL, isPlaceholder, PLAY_STORE_URL } from "@/lib/stores";

const Apple = () => (
  <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false">
    <path d="M16.4 12.6c0-2.4 2-3.6 2.1-3.7-1.1-1.7-2.9-1.9-3.5-1.9-1.5-.2-2.9.9-3.7.9-.8 0-1.9-.9-3.2-.8-1.6 0-3.1 1-4 2.4-1.7 3-.4 7.3 1.2 9.7.8 1.2 1.8 2.5 3 2.4 1.2 0 1.7-.8 3.1-.8 1.5 0 1.9.8 3.2.8 1.3 0 2.1-1.2 2.9-2.4.9-1.3 1.3-2.6 1.3-2.7 0 0-2.4-.9-2.4-3.9zM14 5.5c.7-.8 1.1-1.9 1-3-1 0-2.1.7-2.8 1.5-.6.7-1.2 1.8-1 2.9 1 .1 2.1-.6 2.8-1.4z" />
  </svg>
);
const Play = () => (
  <svg width="24" height="26" viewBox="0 0 24 26" aria-hidden="true" focusable="false">
    <path d="M2 1.5l12 11.5L2 24.5c-.6-.3-1-.9-1-1.7V3.2c0-.8.4-1.4 1-1.7z" fill="#4FA9F0" />
    <path d="M18 9.2L14 13 2 1.5c.4-.2 1-.2 1.5.1L18 9.2z" fill="#2FB58F" />
    <path d="M18 16.8L3.5 24.4c-.5.3-1.1.3-1.5.1L14 13l4 3.8z" fill="#FF6F61" />
    <path d="M21.6 11.2c1.2.7 1.2 2.9 0 3.6L18 16.8 14 13l4-3.8 3.6 2z" fill="#FFB703" />
  </svg>
);

/**
 * Botones de descarga (App Store / Google Play). Mientras las URLs sean marcadores,
 * no navegan: muestran un aviso de "muy pronto".
 */
export default function StoreButtons({ t, tone = "dark" }: { t: Dict; tone?: "dark" | "light" }) {
  const [note, setNote] = useState("");
  const items = [
    { url: APP_STORE_URL, Icon: Apple, ...t.plans.appStore },
    { url: PLAY_STORE_URL, Icon: Play, ...t.plans.playStore },
  ];
  return (
    <div className="stores-wrap">
      <div className={`stores ${tone}`}>
        {items.map(({ url, Icon, small, big }) => (
          <a
            key={big}
            className="store-btn"
            href={isPlaceholder(url) ? "#planes" : url}
            target={isPlaceholder(url) ? undefined : "_blank"}
            rel={isPlaceholder(url) ? undefined : "noopener noreferrer"}
            onClick={(e) => {
              if (isPlaceholder(url)) {
                e.preventDefault();
                setNote(t.plans.soon);
              }
            }}
          >
            <Icon />
            <span><small>{small}</small><b>{big}</b></span>
          </a>
        ))}
      </div>
      <p className="stores-note" role="status" aria-live="polite">{note}</p>
    </div>
  );
}
