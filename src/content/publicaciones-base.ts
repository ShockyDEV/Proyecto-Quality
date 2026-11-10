import type { L10n } from "@/lib/i18n";

/** Tipos de publicación (sin la lista: la usa también el backstage). */
export type TipoPublicacion = "articulo" | "capitulo" | "libro" | "congreso" | "informe";

export const TIPOS: Record<TipoPublicacion, L10n> = {
  articulo: { es: "Artículos", en: "Journal articles" },
  capitulo: { es: "Capítulos de libro", en: "Book chapters" },
  libro: { es: "Libros", en: "Books" },
  congreso: { es: "Comunicaciones en congresos", en: "Conference papers" },
  informe: { es: "Informes", en: "Reports" },
};

export interface Publicacion {
  year: number;
  type: TipoPublicacion;
  /** Autoría tal como se cita, p. ej. «Rodríguez-Conde, M.-J., & Olmos-Migueláñez, S.» */
  authors: string;
  title: string;
  /** Revista, libro, actas o congreso (va en cursiva) */
  venue: string;
  /** Editores del libro o de las actas, sin «(Eds.)» */
  editors?: string;
  /** Páginas, con raya: «101–103» */
  pages?: string;
  /** Ciudad y país del congreso */
  place?: L10n;
  isbn?: string;
  doi?: string;
  /** PDF de las actas abierto en la página de la comunicación (…pdf#page=N) */
  proceedings?: string;
  /** Versión en acceso abierto (GREDOS, Zenodo…) */
  openAccess?: string;
}
