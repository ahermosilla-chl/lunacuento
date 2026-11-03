import { Atkinson_Hyperlegible, Fredoka } from "next/font/google";

/** Fredoka: títulos (600) y texto de los cuentos (500). */
export const fredoka = Fredoka({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

/** Atkinson Hyperlegible: interfaz, diseñada para leer fácil. */
export const atkinson = Atkinson_Hyperlegible({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "700"],
  variable: "--font-atkinson",
  display: "swap",
});
