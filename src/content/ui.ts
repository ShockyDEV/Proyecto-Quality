import type { L10n } from "@/lib/i18n";

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
