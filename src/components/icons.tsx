/** Íconos de línea simples (sin emojis), heredan el color con currentColor. */
type P = { size?: number; className?: string };
const base = (size: number) => ({
  width: size,
  height: size,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
});

export const MoonLogo = ({ size = 38 }: P) => (
  <svg width={size} height={size} viewBox="0 0 38 38" aria-hidden="true" focusable="false">
    <path d="M25 5a15 15 0 1 0 9 26A12.5 12.5 0 0 1 25 5z" fill="#FFC94D" />
    <circle cx="30" cy="9" r="2" fill="#FFF8E7" />
  </svg>
);
export const IconPerson = ({ size = 22, className }: P) => (
  <svg {...base(size)} strokeWidth={2.4} className={className}><path d="M12 13a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM4 21c1.5-3.5 4.5-5 8-5s6.5 1.5 8 5" /></svg>
);
export const IconSound = ({ size = 36, className }: P) => (
  <svg {...base(size)} strokeWidth={2.2} className={className}><path d="M4 9v6h4l5 4V5L8 9H4zM16.5 8.5a5 5 0 0 1 0 7M19 6a8.5 8.5 0 0 1 0 12" /></svg>
);
export const IconMoon = ({ size = 22, className }: P) => (
  <svg {...base(size)} strokeWidth={2.4} className={className}><path d="M20 15.5A8.5 8.5 0 0 1 8.5 4 8.5 8.5 0 1 0 20 15.5z" /></svg>
);
export const IconClose = ({ size = 24 }: P) => (
  <svg {...base(size)} strokeWidth={2.8}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconPrev = ({ size = 26 }: P) => (
  <svg {...base(size)} strokeWidth={3}><path d="M15 5l-7 7 7 7" /></svg>
);
export const IconNext = ({ size = 26 }: P) => (
  <svg {...base(size)} strokeWidth={3}><path d="M9 5l7 7-7 7" /></svg>
);
export const IconMenu = ({ size = 20 }: P) => (
  <svg {...base(size)} strokeWidth={2.6}><path d="M4 7h16M4 12h16M4 17h16" /></svg>
);
export const IconCheck = ({ size = 18 }: P) => (
  <svg {...base(size)} strokeWidth={3}><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>
);
export const IconLock = ({ size = 14 }: P) => (
  <svg {...base(size)} strokeWidth={2.6}><rect x="5" y="11" width="14" height="10" rx="2" /><path d="M8 11V8a4 4 0 0 1 8 0v3" /></svg>
);
export const IconPlay = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12-7.5a1 1 0 0 0 0-1.72l-12-7.5A1 1 0 0 0 7 4.5z" /></svg>
);
export const IconPause = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><rect x="6" y="5" width="4" height="14" rx="1.5" /><rect x="14" y="5" width="4" height="14" rx="1.5" /></svg>
);
export const IconBrush = ({ size = 20 }: P) => (
  <svg {...base(size)} strokeWidth={2.4}><path d="M14.5 4.5l5 5L11 18H6v-5z" /><path d="M4 21h16" /></svg>
);

/* ---- Navegación y taller de pintura ---- */
export const IconHome = ({ size = 24 }: P) => (
  <svg {...base(size)} strokeWidth={2.4}><path d="M4 11l8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H5.5A1.5 1.5 0 0 1 4 19.5z" /></svg>
);
export const IconBook = ({ size = 24 }: P) => (
  <svg {...base(size)} strokeWidth={2.4}><path d="M12 6.5C10 5 7 4.5 4 5v13c3-.5 6 0 8 1.5 2-1.5 5-2 8-1.5V5c-3-.5-6 0-8 1.5zM12 6.5v13" /></svg>
);
export const IconPalette = ({ size = 24 }: P) => (
  <svg {...base(size)} strokeWidth={2.4}><path d="M12 3.5a8.5 8.5 0 1 0 0 17c1.4 0 2-.9 2-1.8 0-1.4-1.2-1.5-1.2-2.7 0-.9.7-1.5 1.6-1.5H17a3.5 3.5 0 0 0 3.5-3.6C20.5 6.5 16.8 3.5 12 3.5z" /><circle cx="7.5" cy="11" r="1" fill="currentColor" /><circle cx="10" cy="7.5" r="1" fill="currentColor" /><circle cx="14.5" cy="7.5" r="1" fill="currentColor" /></svg>
);
export const IconShelf = ({ size = 24 }: P) => (
  <svg {...base(size)} strokeWidth={2.4}><path d="M4 20h16M6 20V9l3-1v12M10.5 20V6h3.5v14M16 20l1-12 3 .5-1 11.5" /></svg>
);
export const IconHeart = ({ size = 22, filled }: P & { filled?: boolean }) => (
  <svg {...base(size)} strokeWidth={2.4} fill={filled ? "currentColor" : "none"}><path d="M12 20.5s-7.5-4.4-7.5-10A4.3 4.3 0 0 1 12 8a4.3 4.3 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10z" /></svg>
);
export const IconUndo = ({ size = 22 }: P) => (
  <svg {...base(size)} strokeWidth={2.6}><path d="M9 7L4.5 11.5 9 16M5 11.5h9a5 5 0 0 1 0 10h-2" /></svg>
);
export const IconRedo = ({ size = 22 }: P) => (
  <svg {...base(size)} strokeWidth={2.6}><path d="M15 7l4.5 4.5L15 16M19 11.5h-9a5 5 0 0 0 0 10h2" /></svg>
);
export const IconEraser = ({ size = 22 }: P) => (
  <svg {...base(size)} strokeWidth={2.4}><path d="M8 20h11M5.2 14.8l8.6-8.6a2 2 0 0 1 2.8 0l2.2 2.2a2 2 0 0 1 0 2.8L11 19.8H8L5.2 17a1.5 1.5 0 0 1 0-2.2z" /></svg>
);
export const IconBucket = ({ size = 22 }: P) => (
  <svg {...base(size)} strokeWidth={2.4}><path d="M5 11l6.5-6.5 7 7-6.5 6.5a2 2 0 0 1-2.8 0L5 13.8a2 2 0 0 1 0-2.8zM4 11.5h14.5M19.5 15c1.2 1.6 1.7 2.5 1.7 3.3a1.7 1.7 0 0 1-3.4 0c0-.8.5-1.7 1.7-3.3z" /></svg>
);
export const IconDownload = ({ size = 22 }: P) => (
  <svg {...base(size)} strokeWidth={2.6}><path d="M12 4v11M7 11l5 5 5-5M5 20h14" /></svg>
);
export const IconRestart = ({ size = 22 }: P) => (
  <svg {...base(size)} strokeWidth={2.6}><path d="M20 12a8 8 0 1 1-2.4-5.7M20 4v5h-5" /></svg>
);
export const IconPaintbrush = ({ size = 22 }: P) => (
  <svg {...base(size)} strokeWidth={2.4}><path d="M19.5 3.5l1 1a1.4 1.4 0 0 1 0 2L12 15l-3-3 8.5-8.5a1.4 1.4 0 0 1 2 0zM9 12c-2.8 0-4.5 1.7-4.5 4.2 0 1.4-.6 2.6-1.5 3.3 3.8.6 8-.8 8-4.5" /></svg>
);
