import type { L10n } from "@/lib/i18n";
import { PUBLICACIONES } from "@/content/publicaciones";

/**
 * Navegación principal (mismas rutas en los dos idiomas; EN con prefijo /en).
 * Las rutas son las de la web anterior, para no romper enlaces. «Publicaciones»
 * solo aparece cuando hay alguna.
 */
const ALL_NAV: { path: string; label: L10n }[] = [
  { path: "/el-proyecto", label: { es: "El proyecto", en: "The project" } },
  { path: "/equipo", label: { es: "Equipo", en: "Team" } },
  { path: "/publicaciones", label: { es: "Publicaciones", en: "Publications" } },
  { path: "/trayectoria", label: { es: "Trayectoria", en: "Track record" } },
];

export const NAV = ALL_NAV.filter((n) => n.path !== "/publicaciones" || PUBLICACIONES.length > 0);

export const LEGAL_NAV: { path: string; label: L10n }[] = [
  { path: "/aviso-legal", label: { es: "Aviso legal", en: "Legal notice" } },
  { path: "/privacidad", label: { es: "Privacidad", en: "Privacy" } },
  { path: "/accesibilidad", label: { es: "Accesibilidad", en: "Accessibility" } },
];

/** Textos de interfaz compartidos. */
export const UI = {
  skip: { es: "Saltar al contenido", en: "Skip to content" },
  menu: { es: "Menú", en: "Menu" },
  close: { es: "Cerrar", en: "Close" },
  home: { es: "Inicio", en: "Home" },
  mainNav: { es: "Navegación principal", en: "Main navigation" },
  language: { es: "Idioma", en: "Language" },
  themeDark: { es: "Cambiar a modo oscuro", en: "Switch to dark mode" },
  themeLight: { es: "Cambiar a modo claro", en: "Switch to light mode" },
  sections: { es: "Secciones", en: "Sections" },
  entities: { es: "Instituto y grupos de investigación", en: "Institute and research groups" },
  funding: { es: "Financiación", en: "Funding" },
  newTab: { es: "(se abre en otra pestaña)", en: "(opens in a new tab)" },
  rights: { es: "Universidad de Salamanca", en: "University of Salamanca" },
} satisfies Record<string, L10n>;
