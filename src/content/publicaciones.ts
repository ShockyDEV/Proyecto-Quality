import type { L10n } from "@/lib/i18n";

/**
 * Publicaciones del proyecto. Mientras la lista esté vacía, «Publicaciones»
 * no sale en el menú ni en el sitemap y su página explica dónde consultar la
 * producción del equipo (la web anterior solo decía «Estamos trabajando.»).
 *
 * Para añadir una, basta con una entrada más; se ordenan por año.
 */
export type TipoPublicacion = "articulo" | "capitulo" | "libro" | "congreso" | "informe";

export const TIPOS: Record<TipoPublicacion, L10n> = {
  articulo: { es: "Artículos", en: "Journal articles" },
  capitulo: { es: "Capítulos de libro", en: "Book chapters" },
  libro: { es: "Libros", en: "Books" },
  congreso: { es: "Congresos", en: "Conference papers" },
  informe: { es: "Informes", en: "Reports" },
};

export interface Publicacion {
  year: number;
  type: TipoPublicacion;
  /** Autoría tal como se cita, p. ej. «Rodríguez-Conde, M. J., Olmos-Migueláñez, S.» */
  authors: string;
  title: string;
  /** Revista, libro o congreso */
  venue: string;
  doi?: string;
  /** Versión en acceso abierto (GREDOS, Zenodo…) */
  openAccess?: string;
}

export const PUBLICACIONES: Publicacion[] = [];
