import type { L10n } from "@/lib/i18n";

/**
 * Publicaciones del proyecto. Mientras la lista esté vacía, «Publicaciones»
 * no sale en el menú ni en el sitemap y su página explica dónde consultar la
 * producción del equipo (la web anterior solo decía «Estamos trabajando.»).
 *
 * Para añadir una, basta con una entrada más; se agrupan por año y tipo, y
 * dentro de cada grupo salen en el orden de la lista.
 */
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

/**
 * Actas de ICED26 (Salamanca, junio de 2026), publicadas en la web del
 * programa el 21-10-2026. Las páginas del PDF coinciden con las impresas.
 */
const ICED26 = {
  venue: "Cultivating agency in higher education: Proceedings of the ICED26 International Conference on Academic Development",
  editors:
    "M. Feixas, M.-J. Rodríguez-Conde, S. Olmos-Migueláñez, M.-A. Pérez-Pascual, M.-J. Canet-Subiela, M.-Á. Carabal-Montagud, A. Madinabeitia-Ezkurra, I. Fernández-Fernández, A. Gamazo, E. González-Gutiérrez, & M. García-Herrero",
  isbn: "978-84-09-89990-6",
};
const actasIced26 = (page: number) => `https://programme.iced26.es/assets/ICED26-Proceedings.pdf#page=${page}`;

/** Referencias enviadas por Susana Olmos el 26-10-2026. */
export const PUBLICACIONES: Publicacion[] = [
  {
    year: 2026,
    type: "congreso",
    authors:
      "Rodríguez-Conde, M.-J., Olmos-Migueláñez, S., Hernández-Ramos, J.-P., Ortiz-López, A., García-Herrero, M., & Marcos-Ortega, S.",
    title: "Student-centred learning as a quality framework in higher education: Empowering learners and transforming curriculum",
    ...ICED26,
    pages: "101–103",
    proceedings: actasIced26(101),
  },
  {
    year: 2026,
    type: "congreso",
    authors: "Rodríguez-Conde, M.-J., Rivetta, S., & Olmos-Migueláñez, S.",
    title: "Professionalising university teaching in the European Higher Education Area: A mixed-methods European research",
    ...ICED26,
    pages: "296–298",
    proceedings: actasIced26(296),
  },
  {
    year: 2026,
    type: "congreso",
    authors: "García-Herrero, M., Ortiz-López, A., Olmos-Migueláñez, S., Rodríguez-Conde, M.-J., & Rodríguez Lozano, C.",
    title: "Knowing and Acting on Student-Centered Learning: Evidence-Informed Quality Enhancement through Indicators of Student Agency",
    venue: "ECER 2026, European Conference on Educational Research",
    place: { es: "Tampere (Finlandia)", en: "Tampere (Finland)" },
  },
];
