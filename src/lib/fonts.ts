import { Baloo_2, Nunito } from "next/font/google";

/** Baloo 2: títulos (600/700) y texto de los cuentos (500). */
export const baloo = Baloo_2({
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
  variable: "--font-baloo",
  display: "swap",
});

/** Nunito: interfaz y lectura de apoyo (400/600/700/800). */
export const nunito = Nunito({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});
