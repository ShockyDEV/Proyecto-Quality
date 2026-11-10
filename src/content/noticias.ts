import type { L10n, Locale } from "@/lib/i18n";
import { BASE_PATH } from "@/lib/base-path";
import noticias from "@/content/generado/noticias.json";

/**
 * Noticias del proyecto: un Markdown por noticia en contenido/noticias/, que
 * se escribe desde el backstage. scripts/contenido.mjs convierte el texto a HTML
 * (sin HTML escrito a mano) y las ordena de la más reciente a la más antigua.
 * Mientras no haya ninguna, «Noticias» no sale en el menú.
 */
export interface Noticia {
  /** Dirección: /noticias/<slug>/ (el nombre del archivo) */
  slug: string;
  /** AAAA-MM-DD */
  date: string;
  title: L10n;
  summary: L10n;
  /** Imagen de cabecera (/media/…) */
  image?: string;
  imageAlt?: string;
  /** Texto ya convertido a HTML */
  html: L10n;
  /** Si tiene versión inglesa propia; si no, la página en inglés muestra el español */
  english: boolean;
}

export const NOTICIAS = noticias as Noticia[];

export function noticia(slug: string): Noticia | undefined {
  return NOTICIAS.find((n) => n.slug === slug);
}

/** «10 de noviembre de 2026» / «10 November 2026» */
export function fechaLarga(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(locale === "es" ? "es-ES" : "en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

/**
 * Las imágenes y enlaces del texto apuntan a /media/… y a rutas de la web:
 * sin dominio propio, GitHub Pages las sirve bajo la subcarpeta.
 */
export function conBase(html: string): string {
  return BASE_PATH ? html.replace(/(src|href)="\/(?!\/)/g, `$1="${BASE_PATH}/`) : html;
}
