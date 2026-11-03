export const LANGS = ["es", "en"] as const;
export type Lang = (typeof LANGS)[number];

export function isLang(v: string): v is Lang {
  return (LANGS as readonly string[]).includes(v);
}

/** Pago único dentro de la app (App Store / Google Play). */
export type PlanKey = "full";

/** Sección de una página legal; `link` es un enlace externo (en la app pasa por el portón para adultos). */
export type LegalSection = { h: string; p: string; link?: { label: string; url: string } };

const es = {
  meta: {
    title: "Lunacuento · Cuentos con su nombre",
    description: "Cuentos ilustrados para niños de 0 a 7 años, con su nombre, narración y modo dormir.",
  },
  nav: { home: "Inicio", stories: "Cuentos", paint: "Pintar", library: "Mi biblioteca", libraryShort: "Biblioteca", app: "Descarga la app", soundOn: "Sonido activado: apagar", soundOff: "Sonido apagado: activar", menu: "Menú principal", lang: "Idioma", skip: "Saltar al contenido" },
  hero: {
    eyebrow: "Para niños de 0 a 7 años",
    hello: "¡Hola, {n}!",
    title: ["Cuentos que llevan", "su nombre hasta", "la luna."],
    lede: "Escúchalos, léelos y coloréalos.",
    nameLabel: "¿Cómo se llama tu peque?",
    namePlaceholder: "Emilia",
    cta: "Leer un cuento",
    bookLine: "Cuando la casa se quedó en silencio, {n} miró por la ventana…",
  },
  shelf: { title: "¡Elige un cuento!", forLabel: "para", note: "Toca un libro para abrirlo.", soon: "Pronto", open: "Abrir", all: "Todos", ages: "años", minutes: "min", more: "Ver todos los cuentos", ageFilter: "Filtrar por edad", ageGroups: ["Hasta 3 años", "4–5 años", "6–7 años"], forName: "para {n}", filters: "Filtrar por tema", empty: "Pronto habrá más cuentos de este tema." },
  features: [
    { title: "Con su nombre", text: "Tu peque es quien vive la aventura." },
    { title: "Escucha y lee", text: "Las palabras se iluminan al narrar." },
    { title: "Modo dormir", text: "Luz tenue y se apaga sola." },
  ],
  quick: {
    label: "¿Qué quieres hacer hoy?",
    read: { title: "Leer cuentos", text: "Elige un libro" },
    paint: { title: "Pintar dibujos", text: "Toca y colorea" },
  },
  mobile: { hi: "¡Hola!", change: "Cambiar nombre", done: "Listo", all: "Ver todos" },
  continue: { title: "Sigue leyendo", page: "Página {a} de {b}", resume: "Seguir leyendo" },
  news: { title: "Nuevos contenidos", badge: "Nuevo" },
  library: {
    title: "Mi biblioteca", continue: "Sigue leyendo", favs: "Favoritos", read: "Leídos", drawings: "Mis dibujos",
    emptyTitle: "Aquí vivirán tus cuentos", emptyText: "Toca el corazón de un cuento o termina de leer uno.", cta: "Elegir un cuento",
    loading: "Cargando tu biblioteca", noDrawings: "Todavía no hay dibujos.", paintCta: "Ir a pintar", again: "Leer otra vez", open: "Abrir",
    privacy: "Se guarda solo en este dispositivo.",
  },
  reader: {
    sleep: "Modo dormir", timer: "Apagar en", close: "Cerrar", prev: "Atrás", next: "Siguiente", end: "Fin",
    listen: "Escuchar", pause: "Pausa", color: "Colorear", hint: "Desliza la página con el dedo",
    goodnight: "Buenas noches", tapBack: "Toca para volver", noVoice: "Este navegador no tiene voz; las palabras se iluminan solas.",
    forName: "para {n}", closeBook: "Cerrar el libro", prevPage: "Página anterior", nextPage: "Página siguiente",
    pageOf: "Página {a} de {b}", timerOff: "Sin apagar", timerMin: "Apagar en {m} min", sleepOn: "Salir del modo dormir",
    again: "Leer otra vez", cover: "Tapa del cuento", favAdd: "Guardar en favoritos", favRemove: "Quitar de favoritos", toLibrary: "Volver a los cuentos", endMsg: "¡Terminaste el cuento, {n}!",
  },
  coloring: {
    title: "¡A pintar!", studio: "Taller de pintura", clear: "Borrar", colors: "Colores", drawing: "Dibujo para colorear", pick: "Elige un dibujo", all: "Todos",
    go: "Ir al taller", locked: "Dibujo bloqueado", tools: "Herramientas", fill: "Relleno", brush: "Pincel", eraser: "Goma", size: "Grosor",
    sizes: { s: "Fino", m: "Medio", l: "Grueso" } as Record<string, string>, undo: "Deshacer", redo: "Rehacer", restart: "Empezar de nuevo",
    confirmTitle: "¿Empezar de nuevo?", confirmText: "Se borrará lo que pintaste en este dibujo.", yes: "Sí, borrar", no: "No", save: "Guardar imagen",
    autosave: "Tu dibujo se guarda solo en este dispositivo.", more: "Más dibujos", loading: "Preparando el dibujo…", loadFail: "No se pudo cargar el dibujo.", exportFail: "No se pudo guardar la imagen.", cats: "Categorías",
    catNames: { night: "Noche", forest: "Bosque" } as Record<string, string>, canvas: "Lienzo para pintar",
    names: { "#FFC94D": "Amarillo", "#FF6B9E": "Rosa", "#6D5BFF": "Violeta", "#4FA9F0": "Cielo", "#00C2AB": "Turquesa", "#FF8A4C": "Naranja", "#9C6A43": "Café", "#FFFFFF": "Blanco" } as Record<string, string>,
  },
  plans: {
    title: "Planes",
    items: {
      free: { name: "Gratis", price: "US$0", feat: ["2 cuentos", "5 dibujos"], cta: "Leer un cuento" },
      full: { name: "Biblioteca completa", price: "US$7,99", per: "pago único", feat: ["Todos los cuentos", "Todos los dibujos", "Modo dormir", "Sin anuncios ni suscripción"], cta: "Descarga la app", badge: "Para siempre" },
    },
    appStore: { small: "Descárgala en", big: "App Store" },
    playStore: { small: "Disponible en", big: "Google Play" },
    storesNote: "La app es gratis con 2 cuentos. La biblioteca completa se compra dentro de la app.",
    soon: "Muy pronto en App Store y Google Play. Por ahora, los cuentos gratis están abiertos.",
  },
  gate: {
    title: "Solo para adultos", ask: "Resuelve para continuar", question: "¿Cuánto es {a} más {b}?",
    wrong: "Esa no es. Prueba con otra pregunta.", cancel: "Cancelar", answers: "Respuestas",
    numbers: ["tres", "cuatro", "cinco", "seis", "siete", "ocho", "nueve"],
  },
  buy: {
    title: "Biblioteca completa", forStory: "Este cuento es de la Biblioteca completa", price: "US$7,99", once: "pago único",
    feat: ["Todos los cuentos", "Todos los dibujos", "Sin anuncios ni suscripción"],
    buy: "Comprar", restore: "Restaurar compra", working: "Un momento…", back: "Volver", pick: "Elegir un cuento", unlock: "Desbloquear",
    owned: "Ya tienes la biblioteca completa.", done: "¡Listo! Ya tienes todos los cuentos.", restored: "¡Compra restaurada!",
    cancelled: "Compra cancelada.", empty: "No hay ninguna compra en esta cuenta de la tienda.", error: "No se pudo completar. Prueba de nuevo.",
    web: "Las compras se hacen dentro de la app. Descárgala en tu tienda.", off: "Las compras no están disponibles por ahora.",
    note: "La compra la hace una persona adulta con su cuenta de App Store o Google Play.", lock: "Cuento bloqueado", tag: "Biblioteca",
  },
  final: { title: "¿Leemos esta noche?", cta: "Abrir un cuento" },
  footer: { rights: "© 2026 Lunacuento", privacy: "Privacidad", terms: "Términos", test: "Modo de prueba: cuentos desbloqueados" },
  legal: {
    draft: "Borrador · se revisará antes del lanzamiento.",
    back: "Volver al inicio",
    privacy: {
      title: "Privacidad",
      sections: [
        { h: "Lo que guardamos de los niños", p: "Solo el nombre que escribes y su actividad en la app (por qué cuento van, favoritos y dibujos pintados), y solo en este dispositivo (localStorage). No lo enviamos a ningún servidor. Nunca pedimos fotos, avatares, edad exacta ni otros datos." },
        { h: "La app", p: "No tiene cuentas, anuncios, analíticas ni publicidad de terceros. No pide permisos del dispositivo (ni cámara, ni micrófono, ni ubicación, ni contactos). Los cuentos gratis funcionan sin conexión." },
        { h: "Compras", p: "En la app, las compras las hace una persona adulta con su cuenta de App Store o Google Play, detrás de una pregunta para adultos. Ellos procesan el pago; nosotros no vemos datos de tarjetas. Usamos RevenueCat solo para comprobar la compra: recibe un identificador anónimo de la instalación y los datos de la compra, nunca el nombre del niño. No usamos identificadores de publicidad.", link: { label: "Privacidad de RevenueCat", url: "https://www.revenuecat.com/privacy" } },
        { h: "Enlaces externos", p: "Los enlaces que salen de la app piden primero la pregunta para adultos." },
        { h: "Borrar los datos", p: "Para borrar el nombre y la actividad guardados, desinstala la app o borra los datos del sitio en tu navegador." },
        { h: "Contacto", p: "Para pedir acceso o borrado de tus datos, escríbenos al correo de soporte que publicaremos al lanzar." },
      ] as LegalSection[],
    },
    terms: {
      title: "Términos",
      sections: [
        { h: "El servicio", p: "Lunacuento ofrece cuentos digitales para leer y escuchar en familia. Las compras las hace una persona adulta." },
        { h: "Pago único", p: "La app es gratis con 2 cuentos. La Biblioteca completa (US$7,99) se compra una sola vez dentro de la app, sin suscripción ni renovaciones, y se puede restaurar en otro dispositivo con la misma cuenta de la tienda (botón «Restaurar compra»)." },
        { h: "Reembolsos", p: "Los reembolsos los gestiona la tienda (App Store o Google Play) según sus reglas." },
        { h: "Uso", p: "Los cuentos y dibujos son para uso personal y familiar. Puedes imprimir los dibujos para colorear en casa." },
        { h: "Cambios", p: "Si cambiamos estos términos, lo avisaremos en el sitio antes de que apliquen." },
      ],
    },
  },
  notFound: { title: "Esta página se perdió en la noche", cta: "Volver al inicio" },
};

const en: typeof es = {
  meta: {
    title: "Lunacuento · Stories with their name",
    description: "Illustrated stories for kids ages 0 to 7, with their name, narration and a sleep mode.",
  },
  nav: { home: "Home", stories: "Stories", paint: "Paint", library: "My library", libraryShort: "Library", app: "Get the app", soundOn: "Sound on: turn off", soundOff: "Sound off: turn on", menu: "Main menu", lang: "Language", skip: "Skip to content" },
  hero: {
    eyebrow: "For kids ages 0 to 7",
    hello: "Hi, {n}!",
    title: ["Stories that carry", "their name all the", "way to the moon."],
    lede: "Listen, read and color them.",
    nameLabel: "What's your little one's name?",
    namePlaceholder: "Emma",
    cta: "Read a story",
    bookLine: "When the house went quiet, {n} looked out the window…",
  },
  shelf: { title: "Pick a story!", forLabel: "for", note: "Tap a book to open it.", soon: "Soon", open: "Open", all: "All", ages: "yrs", minutes: "min", more: "See all stories", ageFilter: "Filter by age", ageGroups: ["Up to 3 yrs", "4–5 yrs", "6–7 yrs"], forName: "for {n}", filters: "Filter by topic", empty: "More stories on this topic are coming soon." },
  features: [
    { title: "With their name", text: "Your little one lives the adventure." },
    { title: "Listen and read", text: "Words light up as it reads." },
    { title: "Sleep mode", text: "Dim light, and it turns itself off." },
  ],
  quick: {
    label: "What do you want to do today?",
    read: { title: "Read stories", text: "Pick a book" },
    paint: { title: "Paint pictures", text: "Tap and color" },
  },
  mobile: { hi: "Hi!", change: "Change name", done: "Done", all: "See all" },
  continue: { title: "Keep reading", page: "Page {a} of {b}", resume: "Keep reading" },
  news: { title: "New content", badge: "New" },
  library: {
    title: "My library", continue: "Keep reading", favs: "Favorites", read: "Finished", drawings: "My drawings",
    emptyTitle: "Your stories will live here", emptyText: "Tap the heart on a story or finish reading one.", cta: "Pick a story",
    loading: "Loading your library", noDrawings: "No drawings yet.", paintCta: "Go paint", again: "Read again", open: "Open",
    privacy: "Saved only on this device.",
  },
  reader: {
    sleep: "Sleep mode", timer: "Stop in", close: "Close", prev: "Back", next: "Next", end: "The end",
    listen: "Listen", pause: "Pause", color: "Color", hint: "Swipe the page with your finger",
    goodnight: "Good night", tapBack: "Tap to go back", noVoice: "This browser has no voice; words will light up on their own.",
    forName: "for {n}", closeBook: "Close the book", prevPage: "Previous page", nextPage: "Next page",
    pageOf: "Page {a} of {b}", timerOff: "Don't stop", timerMin: "Stop in {m} min", sleepOn: "Leave sleep mode",
    again: "Read again", cover: "Story cover", favAdd: "Save to favorites", favRemove: "Remove from favorites", toLibrary: "Back to stories", endMsg: "You finished the story, {n}!",
  },
  coloring: {
    title: "Time to paint!", studio: "Paint studio", clear: "Clear", colors: "Colors", drawing: "Coloring page", pick: "Pick a drawing", all: "All",
    go: "Go to the studio", locked: "Locked drawing", tools: "Tools", fill: "Fill", brush: "Brush", eraser: "Eraser", size: "Thickness",
    sizes: { s: "Thin", m: "Medium", l: "Thick" } as Record<string, string>, undo: "Undo", redo: "Redo", restart: "Start over",
    confirmTitle: "Start over?", confirmText: "What you painted on this drawing will be erased.", yes: "Yes, erase", no: "No", save: "Save image",
    autosave: "Your drawing is saved only on this device.", more: "More drawings", loading: "Getting the drawing ready…", loadFail: "The drawing couldn't be loaded.", exportFail: "The image couldn't be saved.", cats: "Categories",
    catNames: { night: "Night", forest: "Forest" } as Record<string, string>, canvas: "Painting canvas",
    names: { "#FFC94D": "Yellow", "#FF6B9E": "Pink", "#6D5BFF": "Violet", "#4FA9F0": "Sky", "#00C2AB": "Turquoise", "#FF8A4C": "Orange", "#9C6A43": "Brown", "#FFFFFF": "White" } as Record<string, string>,
  },
  plans: {
    title: "Plans",
    items: {
      free: { name: "Free", price: "US$0", feat: ["2 stories", "5 drawings"], cta: "Read a story" },
      full: { name: "Full library", price: "US$7.99", per: "one-time purchase", feat: ["Every story", "Every drawing", "Sleep mode", "No ads, no subscription"], cta: "Get the app", badge: "Yours forever" },
    },
    appStore: { small: "Download on the", big: "App Store" },
    playStore: { small: "Get it on", big: "Google Play" },
    storesNote: "The app is free with 2 stories. The full library is an in-app purchase.",
    soon: "Coming soon to the App Store and Google Play. For now, the free stories are ready.",
  },
  gate: {
    title: "Grown-ups only", ask: "Solve this to continue", question: "What is {a} plus {b}?",
    wrong: "Not quite. Try a new question.", cancel: "Cancel", answers: "Answers",
    numbers: ["three", "four", "five", "six", "seven", "eight", "nine"],
  },
  buy: {
    title: "Full library", forStory: "This story is part of the Full library", price: "US$7.99", once: "one-time purchase",
    feat: ["Every story", "Every drawing", "No ads, no subscription"],
    buy: "Buy", restore: "Restore purchase", working: "One moment…", back: "Back", pick: "Pick a story", unlock: "Unlock",
    owned: "You already have the full library.", done: "Done! Every story is yours.", restored: "Purchase restored!",
    cancelled: "Purchase cancelled.", empty: "No purchase found on this store account.", error: "That didn't work. Please try again.",
    web: "Purchases happen inside the app. Get it from your store.", off: "Purchases aren't available right now.",
    note: "An adult makes the purchase with their App Store or Google Play account.", lock: "Locked story", tag: "Library",
  },
  final: { title: "Story time tonight?", cta: "Open a story" },
  footer: { rights: "© 2026 Lunacuento", privacy: "Privacy", terms: "Terms", test: "Test mode: stories unlocked" },
  legal: {
    draft: "Draft · to be reviewed before launch.",
    back: "Back to home",
    privacy: {
      title: "Privacy",
      sections: [
        { h: "What we keep about children", p: "Only the name you type and their activity in the app (which story they are on, favorites and painted drawings), and only on this device (localStorage). We never send it to any server. We never ask for photos, avatars, exact age or any other data." },
        { h: "The app", p: "It has no accounts, ads, analytics or third-party advertising. It asks for no device permissions (no camera, microphone, location or contacts). The free stories work offline." },
        { h: "Purchases", p: "In the app, purchases are made by an adult with their App Store or Google Play account, behind a grown-ups question. They process the payment; we never see card details. We use RevenueCat only to verify the purchase: it receives an anonymous install identifier and the purchase details, never the child's name. We don't use advertising identifiers.", link: { label: "RevenueCat privacy policy", url: "https://www.revenuecat.com/privacy" } },
        { h: "External links", p: "Links that leave the app ask the grown-ups question first." },
        { h: "Deleting data", p: "To erase the saved name and activity, uninstall the app or clear this site's data in your browser." },
        { h: "Contact", p: "To request access to or deletion of your data, write to the support email we will publish at launch." },
      ] as LegalSection[],
    },
    terms: {
      title: "Terms",
      sections: [
        { h: "The service", p: "Lunacuento offers digital stories to read and listen to as a family. Purchases are made by an adult." },
        { h: "One-time purchase", p: "The app is free with 2 stories. The Full library (US$7.99) is bought once inside the app, with no subscription or renewals, and can be restored on another device with the same store account (\"Restore purchase\" button)." },
        { h: "Refunds", p: "Refunds are handled by the store (App Store or Google Play) under its own rules." },
        { h: "Use", p: "Stories and drawings are for personal and family use. You can print the coloring pages at home." },
        { h: "Changes", p: "If we change these terms, we will post a notice on the site before they apply." },
      ],
    },
  },
  notFound: { title: "This page got lost in the night", cta: "Back to home" },
};

export const DICT = { es, en };
export type Dict = typeof es;

export function getDict(lang: Lang): Dict {
  return DICT[lang];
}

export const DEFAULT_NAME: Record<Lang, string> = { es: "Emilia", en: "Emma" };
