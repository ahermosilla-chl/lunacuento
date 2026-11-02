export const LANGS = ["es", "en"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}

export type PlanKey = "monthly" | "yearly" | "gift";

const es = {
  meta: {
    title: "Lunacuento · Cuentos con su nombre",
    description: "Cuentos ilustrados para niños de 0 a 7 años, con su nombre, narración y modo dormir.",
  },
  nav: { stories: "Cuentos", color: "Colorear", plans: "Planes", account: "Mi cuenta" },
  hero: {
    eyebrow: "Para niños de 0 a 7 años",
    title: ["Cuentos que llevan", "su nombre hasta", "la luna."],
    lede: "Escúchalos, léelos y coloréalos.",
    nameLabel: "¿Cómo se llama tu peque?",
    namePlaceholder: "Emilia",
    cta: "Leer un cuento",
  },
  shelf: { title: "Elige un cuento", note: "Toca un libro para abrirlo.", soon: "Pronto", open: "Abrir", all: "Todos", ages: "años", minutes: "min" },
  reader: {
    sleep: "Modo dormir", timer: "Apagar en", close: "Cerrar", prev: "Atrás", next: "Siguiente", end: "Fin",
    listen: "Escuchar", pause: "Pausa", color: "Colorear", hint: "Desliza la página con el dedo",
    goodnight: "Buenas noches", tapBack: "Toca para volver", noVoice: "Este navegador no tiene voz; las palabras se iluminan solas.",
    lockedTitle: "Este cuento es parte del plan Familia", lockedCta: "Ver planes",
  },
  coloring: { title: "¡A colorear!", clear: "Borrar", colors: "Colores", drawing: "Dibujo para colorear" },
  plans: {
    title: "Planes",
    items: {
      free: { name: "Gratis", price: "US$0", per: "", feat: ["2 cuentos", "2 dibujos"], cta: "Empezar gratis" },
      monthly: { name: "Familia", price: "US$4,99", per: "/ mes", alt: "o US$39,99 al año", feat: ["Todos los cuentos", "Cuentos nuevos cada semana", "Modo dormir"], cta: "Probar 7 días gratis", badge: "El favorito" },
      gift: { name: "Regalo", price: "US$12,99", per: "", feat: ["3 meses de Familia", "Tarjeta para regalar"], cta: "Regalar" },
    },
    yearlyCta: "Pagar anual",
  },
  final: { title: "¿Leemos esta noche?", cta: "Abrir un cuento" },
  footer: { rights: "© 2026 Lunacuento", privacy: "Privacidad", terms: "Términos" },
  account: {
    title: "Mi cuenta",
    loginTitle: "Entra con tu correo",
    loginLede: "Te enviamos un enlace mágico. Sin contraseñas.",
    email: "Correo",
    send: "Enviar enlace",
    sent: "Revisa tu correo y toca el enlace para entrar.",
    signedAs: "Entraste como",
    plan: "Plan",
    planFree: "Gratis",
    planActive: "Familia (activo)",
    manage: "Administrar suscripción",
    upgrade: "Pasar a Familia",
    logout: "Salir",
    notConfigured: "Las cuentas se activan al configurar Supabase.",
  },
};

const en: typeof es = {
  meta: {
    title: "Lunacuento · Stories with their name",
    description: "Illustrated stories for kids ages 0 to 7, with their name, narration and a sleep mode.",
  },
  nav: { stories: "Stories", color: "Coloring", plans: "Plans", account: "My account" },
  hero: {
    eyebrow: "For kids ages 0 to 7",
    title: ["Stories that carry", "their name all the", "way to the moon."],
    lede: "Listen, read and color them.",
    nameLabel: "What's your little one's name?",
    namePlaceholder: "Emma",
    cta: "Read a story",
  },
  shelf: { title: "Pick a story", note: "Tap a book to open it.", soon: "Soon", open: "Open", all: "All", ages: "yrs", minutes: "min" },
  reader: {
    sleep: "Sleep mode", timer: "Stop in", close: "Close", prev: "Back", next: "Next", end: "The end",
    listen: "Listen", pause: "Pause", color: "Color", hint: "Swipe the page with your finger",
    goodnight: "Good night", tapBack: "Tap to go back", noVoice: "This browser has no voice; words will light up on their own.",
    lockedTitle: "This story is part of the Family plan", lockedCta: "See plans",
  },
  coloring: { title: "Time to color!", clear: "Clear", colors: "Colors", drawing: "Coloring page" },
  plans: {
    title: "Plans",
    items: {
      free: { name: "Free", price: "US$0", per: "", feat: ["2 stories", "2 drawings"], cta: "Start free" },
      monthly: { name: "Family", price: "US$4.99", per: "/ month", alt: "or US$39.99 a year", feat: ["Every story", "New stories every week", "Sleep mode"], cta: "Try 7 days free", badge: "Favorite" },
      gift: { name: "Gift", price: "US$12.99", per: "", feat: ["3 months of Family", "A card to gift"], cta: "Give as a gift" },
    },
    yearlyCta: "Pay yearly",
  },
  final: { title: "Story time tonight?", cta: "Open a story" },
  footer: { rights: "© 2026 Lunacuento", privacy: "Privacy", terms: "Terms" },
  account: {
    title: "My account",
    loginTitle: "Sign in with your email",
    loginLede: "We'll send you a magic link. No passwords.",
    email: "Email",
    send: "Send link",
    sent: "Check your email and tap the link to sign in.",
    signedAs: "Signed in as",
    plan: "Plan",
    planFree: "Free",
    planActive: "Family (active)",
    manage: "Manage subscription",
    upgrade: "Upgrade to Family",
    logout: "Sign out",
    notConfigured: "Accounts turn on once Supabase is configured.",
  },
};

export const DICT = { es, en };
export type Dict = typeof es;

export function getDict(lang: Lang): Dict {
  return DICT[lang];
}

export const DEFAULT_NAME: Record<Lang, string> = { es: "Emilia", en: "Emma" };
