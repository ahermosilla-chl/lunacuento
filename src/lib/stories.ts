import type { Lang } from "./i18n";

export type Scene = {
  t: "night" | "dusk" | "day";
  moon?: boolean;
  win?: boolean;
  ff?: number;
  owl?: boolean;
  hog?: boolean;
  basket?: boolean;
  friends?: boolean;
};

/**
 * Ilustración definitiva de una página (fase 3, generada con gpt-image-2).
 * `src` es una ruta pública (p. ej. /cuentos/la-lampara-de-la-luna/1.webp).
 */
export type PageImage = {
  src: string;
  width: number;
  height: number;
  alt: Record<Lang, string>;
};

/**
 * Tiempo de cada palabra narrada, en segundos (fase 4, endpoint de ElevenLabs con timestamps).
 * `word` es el índice de la palabra dentro del texto de la página ya dividido por espacios.
 */
export type WordTiming = { word: number; start: number; end: number };

/**
 * Narración definitiva de una página. Como el nombre del niño cambia, el audio se graba
 * con el nombre por defecto o sin nombre; si no coincide, el lector usa speechSynthesis.
 */
export type PageAudio = {
  src: string;
  /** Nombre con que se grabó el audio ("" si el texto se grabó sin nombre). */
  recordedName: string;
  words: WordTiming[];
};

export type StoryPage = {
  scene: Scene;
  /** Si existe, reemplaza a la escena vectorial. */
  image?: PageImage;
  /** Si existe para el idioma, reemplaza a speechSynthesis. */
  audio?: Partial<Record<Lang, PageAudio>>;
  text: Record<Lang, string>;
};

export type ValueKey = "dark" | "share" | "sleep" | "school" | "sibling";

export type Story = {
  id: string;
  title: Record<Lang, string>;
  blurb: Record<Lang, string>;
  values: ValueKey[];
  age: string;
  minutes: number;
  color: string;
  coverPage: number;
  coloring: string;
  /** Requiere suscripción Familia. */
  premium: boolean;
  pages: StoryPage[];
};

/** Etiquetas cortas para los filtros en pantallas chicas. */
export const VALUES_SHORT: Record<ValueKey, Record<Lang, string>> = {
  dark: { es: "Oscuridad", en: "The dark" },
  share: { es: "Compartir", en: "Sharing" },
  sleep: { es: "Dormir", en: "Bedtime" },
  school: { es: "Jardín", en: "Preschool" },
  sibling: { es: "Hermanito", en: "Sibling" },
};

export const VALUES: Record<ValueKey, Record<Lang, string>> = {
  dark: { es: "Miedo a la oscuridad", en: "Fear of the dark" },
  share: { es: "Compartir", en: "Sharing" },
  sleep: { es: "Hora de dormir", en: "Bedtime" },
  school: { es: "Primer día de jardín", en: "First day of preschool" },
  sibling: { es: "Un hermanito", en: "A new sibling" },
};

/** {n} se reemplaza por el nombre del niño o niña. */
export const STORIES: Story[] = [
  {
    id: "la-lampara-de-la-luna",
    title: { es: "La lámpara de la luna", en: "The Moon's Lamp" },
    blurb: {
      es: "Una luciérnaga le muestra a {n} que la noche está llena de cosas que descansan.",
      en: "A firefly shows {n} that the night is full of things that are resting.",
    },
    values: ["dark", "sleep"],
    age: "3–6",
    minutes: 4,
    color: "#2F3E9E",
    coverPage: 4,
    coloring: "luna",
    premium: false,
    pages: [
      { scene: { t: "night", win: true }, text: {
        es: "Cuando la casa se quedó en silencio, {n} miró por la ventana. La noche parecía un gran manto oscuro, y eso daba un poquito de miedo.",
        en: "When the house went quiet, {n} looked out the window. The night looked like a big dark blanket, and that felt a little bit scary." } },
      { scene: { t: "night", win: true, ff: 1 }, text: {
        es: "Entonces algo brilló en el vidrio. Era Lía, una luciérnaga del tamaño de un botón. —¿Quieres ver lo que esconde la noche? —preguntó.",
        en: "Then something glowed on the glass. It was Lía, a firefly the size of a button. \"Do you want to see what the night is hiding?\" she asked." } },
      { scene: { t: "night", ff: 3, owl: true }, text: {
        es: "{n} siguió su lucecita por el jardín. Bajo una hoja grande dormía un caracol. En la rama, un búho contaba estrellas en voz bajita.",
        en: "{n} followed her little light through the garden. Under a big leaf, a snail was sleeping. On a branch, an owl was counting stars in a tiny voice." } },
      { scene: { t: "night", ff: 6 }, text: {
        es: "—La noche no está vacía —dijo Lía—. Está llena de cosas que descansan, igual que tú.",
        en: "\"The night isn't empty,\" said Lía. \"It's full of things that are resting, just like you.\"" } },
      { scene: { t: "night", moon: true, ff: 4 }, text: {
        es: "Arriba, la luna encendió su lámpara redonda. —Ella cuida a todos mientras duermen —susurró Lía.",
        en: "Up above, the moon switched on her round lamp. \"She looks after everyone while they sleep,\" Lía whispered." } },
      { scene: { t: "night", moon: true, win: true, ff: 1 }, text: {
        es: "{n} volvió a la cama con una sonrisa. Ahora, cuando se apaga la luz, sabe que la luna cuida su sueño. Buenas noches, {n}.",
        en: "{n} went back to bed with a smile. Now, when the lights go out, {n} knows the moon is watching over every dream. Good night, {n}." } },
    ],
  },
  {
    id: "tilo-y-las-moras",
    title: { es: "Tilo y las moras", en: "Tilo and the Blackberries" },
    blurb: {
      es: "Tilo tiene una canasta llena de moras y nadie con quien comerlas. {n} tiene una idea.",
      en: "Tilo has a basket full of blackberries and no one to share them with. {n} has an idea.",
    },
    values: ["share"],
    age: "2–5",
    minutes: 3,
    color: "#E0703A",
    coverPage: 4,
    coloring: "tilo",
    premium: false,
    pages: [
      { scene: { t: "day", hog: true, basket: true }, text: {
        es: "En el bosque de los robles vivía Tilo, un erizo con una canasta llena de moras. —¡Son todas mías! —decía, abrazándola fuerte.",
        en: "In the oak forest lived Tilo, a hedgehog with a basket full of blackberries. \"They're all mine!\" he said, hugging it tight." } },
      { scene: { t: "dusk", hog: true, basket: true }, text: {
        es: "Una tarde, {n} paseaba por el sendero y encontró a Tilo sentado solo, comiendo moras sin ganas.",
        en: "One afternoon, {n} was walking along the path and found Tilo sitting alone, nibbling blackberries without much joy." } },
      { scene: { t: "dusk", hog: true }, text: {
        es: "—¿Por qué estás triste? —preguntó {n}. —Tengo muchas moras —suspiró Tilo—, pero nadie con quien comerlas.",
        en: "\"Why are you sad?\" asked {n}. \"I have lots of blackberries,\" Tilo sighed, \"but no one to eat them with.\"" } },
      { scene: { t: "day", hog: true, friends: true }, text: {
        es: "{n} tuvo una idea. —¿Y si invitamos a los demás? La ardilla trae nueces, el conejo trae zanahorias y tú pones las moras.",
        en: "{n} had an idea. \"What if we invite everyone? Squirrel brings nuts, Rabbit brings carrots and you bring the blackberries.\"" } },
      { scene: { t: "dusk", hog: true, friends: true, basket: true }, text: {
        es: "Esa tarde hubo un picnic bajo el roble más grande. La canasta de Tilo quedó vacía, pero su corazón quedó lleno.",
        en: "That afternoon there was a picnic under the biggest oak. Tilo's basket ended up empty, but his heart ended up full." } },
      { scene: { t: "night", hog: true, moon: true }, text: {
        es: "—Compartir es como multiplicar —dijo Tilo, riendo—. Gracias, {n}. Mañana te guardo las moras más dulces.",
        en: "\"Sharing is like multiplying,\" Tilo said with a laugh. \"Thank you, {n}. Tomorrow I'll save you the sweetest blackberries.\"" } },
    ],
  },
];

/** Títulos que se muestran en el estante como "Pronto". */
export type SoonBook = { id: string; title: Record<Lang, string>; color: string; age: string; values: ValueKey[]; art: string };

export const COMING_SOON: SoonBook[] = [
  { id: "jardin", title: { es: "El primer día de jardín", en: "First Day of Preschool" }, color: "#2FB58F", age: "3–5", values: ["school"], art: "jardin" },
  { id: "hermanito", title: { es: "Un hermanito en casa", en: "A New Baby at Home" }, color: "#7C6CF0", age: "2–6", values: ["sibling"], art: "hermanito" },
  { id: "chupete", title: { es: "Adiós, chupete", en: "Bye-Bye, Pacifier" }, color: "#4FA9F0", age: "1–3", values: ["sleep"], art: "chupete" },
  { id: "dragon", title: { es: "El dragón que no podía dormir", en: "The Dragon Who Couldn't Sleep" }, color: "#E24F7A", age: "3–7", values: ["dark", "sleep"], art: "dragon" },
];

/** Temas que aparecen como filtros en el estante. */
export const FILTERS: ValueKey[] = ["dark", "share", "sleep"];

export function getStory(id: string) {
  return STORIES.find((s) => s.id === id);
}

export function personalize(text: string, name: string) {
  return text.split("{n}").join(name);
}
