import type { Config } from "tailwindcss";

/**
 * Tokens de diseño de QUALITY.
 *
 * Mismo sistema que la web del IUCE (capa semántica en variables CSS, con
 * valores propios bajo `.dark`), con la paleta muestreada del logo del
 * proyecto: petróleo #225B76, verde azulado #4EA7A9 y teja #D56234.
 * El verde azulado (2,8:1 sobre blanco) y la teja (3,7:1) no llegan al AA
 * para texto: se usan en formas, iconos y filetes, y para texto están sus
 * variantes «-texto» (4,7:1 y 5,2:1). Valores en globals.css.
 *
 * Las variables guardan el color como «R G B» para que funcionen los
 * modificadores de opacidad de Tailwind (bg-petroleo/10…).
 */
const token = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Superficies
        pagina: token("pagina"),
        superficie: token("superficie"),
        tintado: token("tintado"),
        inverso: token("inverso"),
        // Texto
        tinta: token("tinta"),
        cuerpo: token("cuerpo"),
        tenue: token("tenue"),
        linea: token("linea"),
        // Marca (paleta del logo)
        petroleo: {
          DEFAULT: token("petroleo"),
          fuerte: token("petroleo-fuerte"),
        },
        "sobre-petroleo": token("sobre-petroleo"),
        verde: {
          DEFAULT: token("verde"),
          texto: token("verde-texto"),
        },
        teja: {
          DEFAULT: token("teja"),
          texto: token("teja-texto"),
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "Segoe UI", "Roboto", "Arial", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        site: "72rem",
      },
      boxShadow: {
        tarjeta: "var(--sombra-tarjeta)",
        elevada: "var(--sombra-elevada)",
      },
    },
  },
  plugins: [],
};

export default config;
