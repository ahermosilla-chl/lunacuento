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
    <path d="M25 5a15 15 0 1 0 9 26A12.5 12.5 0 0 1 25 5z" fill="#FFB703" />
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
