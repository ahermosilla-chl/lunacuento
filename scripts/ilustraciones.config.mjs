// Lista de ilustraciones y prompts. Se explica en docs/guia-ilustracion.md.
// Plan B autorizado: calidad "high" para hero, portadas y accesos; "medium" para los dibujos de línea.

/** Estilo común a TODAS las imágenes de color (misma familia visual). */
export const BASE_ESTILO = [
  "Premium children's picture-book illustration for ages 3 to 7.",
  "Soft 3D / 2.5D look with a handmade clay-and-felt feel: rounded chunky shapes, smooth gentle volume, warm key light with soft rim light, subtle ambient occlusion, soft shadows, a little depth of field.",
  "Palette: light lavender-violet sky (#6D5BFF to a pale lilac) and deep indigo (#2D2877), warm moon yellow (#FFC94D, #FFE08A), turquoise (#00C2AB), warm pink (#FF6B9E), sky blue (#4FA9F0), orange (#FF8A4C), soft cream (#FFF0C2), navy ink (#0F1B3D) for shadows.",
  "Colors vivid but never neon, harmonious, calm bedtime mood, cozy and magical, not busy.",
  "Friendly characters with big kind eyes and simple faces; nothing scary or violent.",
  "ABSOLUTELY NO text, letters, numbers, logos, signatures or watermarks anywhere. No frames or borders.",
  "Same artist, same materials, same lighting in every image of the series.",
].join(" ");

/** Estilo común de los dibujos para colorear. */
export const BASE_LINEA = [
  "Children's coloring-book page for ages 3 to 7.",
  "Pure black outline drawing on a pure white background: bold, uniform, smooth black lines (about 6 px at 1536 px wide), rounded line ends.",
  "Every shape is a CLOSED region with no gaps in the outlines, so each area can be filled with a paint bucket.",
  "Simple, large shapes with cute friendly characters; few small details; no tiny areas.",
  "NO shading, NO gray, NO hatching, NO filled black areas, NO color, NO text, letters or numbers, NO border or frame.",
  "The subject is centered with comfortable white margin.",
].join(" ");

const COLOR = { kind: "color", estilo: "color" };
const LINEA = { kind: "linea", estilo: "linea" };

export const IMAGENES = [
  {
    ...COLOR, name: "hero-inicio", group: "hero", size: "1536x1024", w: 1536, h: 1024, quality: "high", widths: [768, 1152, 1536],
    prompt: "WIDE hero scene, landscape. LEFT THIRD: a small child of about five (gentle gender-neutral look, soft wavy chestnut hair, cozy lavender sweater) sitting on the grass hugging a small orange fox cub, both happily reading a large open storybook that glows with warm golden magic light and a few floating golden sparkles. RIGHT SIDE: rolling green hills at dusk with a charming small castle with violet towers and a pink-and-turquoise flag on a distant hill, a big warm glowing full moon, a light lavender-violet sky with soft fluffy clouds and a few tiny stars. The CENTER and upper area stay calm and uncluttered (soft sky and gentle clouds) so a title and a row of book covers can be placed over it later; the bottom 25% is soft grass and flowers in simple shapes, low detail.",
  },
  {
    ...COLOR, name: "portada-lampara-de-la-luna", group: "portadas", size: "1024x1536", w: 1024, h: 1536, quality: "high", widths: [336, 672],
    prompt: "PORTRAIT book-cover illustration (2:3). Story: a tiny glowing firefly named Lia shows a child that the night is full of resting things. A cozy night garden under a huge soft glowing moon like a round lamp, a small happy firefly with a warm golden glow in the foreground, a sleeping snail under a big leaf and an owl on a branch, the child seen from behind looking up. Deep indigo and violet night, warm yellow glow. Keep the bottom 30% calm and darker (soft hills) because a title will be placed there later.",
  },
  {
    ...COLOR, name: "portada-tilo-y-las-moras", group: "portadas", size: "1024x1536", w: 1024, h: 1536, quality: "high", widths: [336, 672],
    prompt: "PORTRAIT book-cover illustration (2:3). Story about sharing: Tilo, a cute round hedgehog with a warm brown coat, hugging a basket full of purple blackberries in a sunny oak forest at golden afternoon light; a small squirrel with nuts and a rabbit with carrots peek happily from behind big oak trunks, ready for a picnic. Warm orange and green tones. Keep the bottom 30% calm (soft grass) because a title will be placed there later.",
  },
  {
    ...COLOR, name: "portada-dragon-que-no-podia-dormir", group: "portadas", size: "1024x1536", w: 1024, h: 1536, quality: "high", widths: [336, 672],
    prompt: "PORTRAIT book-cover illustration (2:3). Story: Brasa, a small friendly green dragon (size of a dog) with golden back spikes, a little horn and a pink blush, curled up sleepily on a hill at night, breathing out tiny golden sparks that float up like little stars over a cozy cave. Violet-indigo night, a soft moon. Keep the bottom 30% calm and darker (soft hill) because a title will be placed there later.",
  },
  {
    ...COLOR, name: "portada-primer-dia-de-jardin", group: "portadas", size: "1024x1536", w: 1024, h: 1536, quality: "high", widths: [336, 672],
    prompt: "PORTRAIT book-cover illustration (2:3). Story: first day of preschool. A cheerful little preschool house with a violet roof, a round red door and big friendly windows, a small backpack with a keychain on the path in the foreground, bright morning sun, flowers and a tiny garden, turquoise and sky-blue tones. No people in focus. Keep the bottom 30% calm (soft grass) because a title will be placed there later.",
  },
  {
    ...COLOR, name: "portada-un-hermanito-en-casa", group: "portadas", size: "1024x1536", w: 1024, h: 1536, quality: "high", widths: [336, 672],
    prompt: "PORTRAIT book-cover illustration (2:3). Story: a new baby sibling at home. A cozy warm room with a cute wooden crib with a gentle star mobile, a sleeping baby wrapped in a soft blanket, a small child peeking over the crib edge with a loving smile, warm cream, pink and violet tones, soft lamp light. Keep the bottom 30% calm (soft rug) because a title will be placed there later.",
  },
  {
    ...COLOR, name: "portada-adios-chupete", group: "portadas", size: "1024x1536", w: 1024, h: 1536, quality: "high", widths: [336, 672],
    prompt: "PORTRAIT book-cover illustration (2:3). Story: saying goodbye to the pacifier. A cute pink pacifier tied to a big turquoise balloon floating up into a soft sunset sky with little clouds, a small child waving goodbye from a grassy hill (seen from behind, small in the frame). Sky blue, turquoise and warm pink. Keep the bottom 30% calm (soft grass) because a title will be placed there later.",
  },
  {
    ...COLOR, name: "acceso-leer", group: "accesos", size: "1024x1024", w: 1024, h: 1024, quality: "high", widths: [256, 512],
    prompt: "SQUARE icon-style illustration of one big open storybook glowing softly with golden light, tiny stars and a ribbon bookmark, slightly tilted, chunky 3D clay look, centered with generous margin, on a perfectly flat solid violet background (#6D5BFF) with no gradient, no vignette and no texture.",
  },
  {
    ...COLOR, name: "acceso-pintar", group: "accesos", size: "1024x1024", w: 1024, h: 1024, quality: "high", widths: [256, 512],
    prompt: "SQUARE icon-style illustration of a wooden painter's palette with bright blobs of paint (pink, turquoise, violet, sky blue, orange) and two chunky paintbrushes plus a fat yellow crayon, slightly tilted, chunky 3D clay look, centered with generous margin, on a perfectly flat solid warm yellow background (#FFC94D) with no gradient, no vignette and no texture.",
  },
  { ...LINEA, name: "colorear-luna", group: "colorear", size: "1536x1024", w: 1536, h: 1024, quality: "medium", widths: [1200, 600],
    prompt: "Subject: a night garden with a big round moon, three simple stars, a small firefly with a round glowing body and little wings, a big leaf with a sleeping snail, and gentle rolling hills." },
  { ...LINEA, name: "colorear-tilo", group: "colorear", size: "1536x1024", w: 1536, h: 1024, quality: "medium", widths: [1200, 600],
    prompt: "Subject: Tilo the cute round hedgehog sitting next to a basket of blackberries under a big simple oak tree, with a tiny squirrel and a rabbit nearby." },
  { ...LINEA, name: "colorear-dragon", group: "colorear", size: "1536x1024", w: 1536, h: 1024, quality: "medium", widths: [1200, 600],
    prompt: "Subject: Brasa the small friendly dragon curled up asleep on a hill with a moon, a few round sparks floating above it and a simple cave." },
  { ...LINEA, name: "colorear-leon", group: "colorear", size: "1536x1024", w: 1536, h: 1024, quality: "medium", widths: [1200, 600],
    prompt: "Subject: a cute friendly lion cub sitting, big round mane made of a few large rounded tufts (each tuft a closed shape), smiling face, with a few simple tufts of grass." },
  { ...LINEA, name: "colorear-castillo", group: "colorear", size: "1536x1024", w: 1536, h: 1024, quality: "medium", widths: [1200, 600],
    prompt: "Subject: a charming fairytale castle on a hill with three round towers, little flags, a big door, windows, a moon and a few clouds." },
  { ...LINEA, name: "colorear-zorro", group: "colorear", size: "1536x1024", w: 1536, h: 1024, quality: "medium", widths: [1200, 600],
    prompt: "Subject: a cute fox cub sitting and hugging a big open storybook, bushy tail with a big white tip as a closed shape, a few simple flowers." },
];

/** Precio ESTIMADO por imagen en US$ (NO verificado en la documentación oficial; cifras de terceros). Ajustable con --factor-costo. */
export const PRECIOS = {
  cuadrada: { low: 0.006, medium: 0.053, high: 0.211 },
  apaisada: { low: 0.005, medium: 0.041, high: 0.165 },
};
