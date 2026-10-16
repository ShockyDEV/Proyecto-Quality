import { Inter, Manrope } from "next/font/google";

/**
 * Tipografías (autoalojadas por next/font al compilar; la web no pide nada
 * a Google al visitarla):
 *   · Manrope — titulares: geométrica y de remates suaves, emparenta con las
 *     letras del logo sin imitarlas.
 *   · Inter — texto y datos (cifras tabulares), sobria como la de la web del IUCE.
 */
export const fontDisplay = Manrope({
  subsets: ["latin", "latin-ext"],
  weight: ["600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

export const fontSans = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-sans",
  display: "swap",
});

export const fontVariables = `${fontDisplay.variable} ${fontSans.variable}`;
