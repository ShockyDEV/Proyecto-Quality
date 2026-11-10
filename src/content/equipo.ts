import type { L10n } from "@/lib/i18n";
import instituciones from "@/content/instituciones.json";
import equipo from "@/content/generado/equipo.json";

/**
 * Equipo del proyecto. Cada persona es un archivo de contenido/equipo/ que se
 * edita desde el panel (nombre, papel, institución, perfil, foto y orden); ver
 * scripts/contenido.mjs. Las cifras de la web (personas, instituciones,
 * países) se calculan a partir de esa lista.
 *
 * Las instituciones no se editan desde el panel: para añadir una, se añade a
 * src/content/instituciones.json y a la lista de .pages.yml.
 *
 * Fotos (public/media/equipo/, 240 px): de la ficha de cada persona en el
 * Portal de Investigación USAL, de la web del IUCE, de Google Scholar o de
 * Knowledge Society, o enviadas por la propia persona. Sin foto, se muestran
 * las iniciales.
 */

export type PaisId = "es" | "ie" | "pt";

export const PAISES: Record<PaisId, L10n> = {
  es: { es: "España", en: "Spain" },
  ie: { es: "Irlanda", en: "Ireland" },
  pt: { es: "Portugal", en: "Portugal" },
};

export interface Institucion {
  id: string;
  name: L10n;
  short: string;
  country: PaisId;
  url: string;
}

export const INSTITUCIONES = instituciones as Institucion[];

export type Rol = "ip" | "investigador" | "trabajo" | "contrato";

export const ROLES: Record<Rol, { title: L10n; singular: L10n }> = {
  ip: {
    title: { es: "Investigadoras principales", en: "Principal investigators" },
    singular: { es: "Investigadora principal", en: "Principal investigator" },
  },
  investigador: {
    title: { es: "Equipo investigador", en: "Research team" },
    singular: { es: "Equipo investigador", en: "Research team" },
  },
  trabajo: {
    title: { es: "Equipo de trabajo", en: "Work team" },
    singular: { es: "Equipo de trabajo", en: "Work team" },
  },
  contrato: {
    title: { es: "Contratos asociados al proyecto", en: "Project-funded staff" },
    singular: { es: "Contrato asociado al proyecto", en: "Project-funded staff" },
  },
};

export interface Persona {
  name: string;
  role: Rol;
  institution: string;
  /** Perfil público (portal de investigación, ORCID, Google Scholar…) */
  profile?: string;
  /** Foto (public/media/equipo/…) */
  photo?: string;
}

export const EQUIPO = equipo as Persona[];

export function institucion(id: string): Institucion {
  const found = INSTITUCIONES.find((i) => i.id === id);
  if (!found) throw new Error(`Institución desconocida: ${id}`);
  return found;
}

/** Personas de un rol agrupadas por institución, en el orden de INSTITUCIONES. */
export function porInstitucion(role: Rol): { institution: Institucion; people: Persona[] }[] {
  return INSTITUCIONES.map((institution) => ({
    institution,
    people: EQUIPO.filter((p) => p.role === role && p.institution === institution.id),
  })).filter((g) => g.people.length > 0);
}

/** Cifras para la portada y la página de equipo. */
export function cifrasEquipo() {
  const usadas = INSTITUCIONES.filter((i) => EQUIPO.some((p) => p.institution === i.id));
  return {
    personas: EQUIPO.length,
    instituciones: usadas.length,
    paises: new Set(usadas.map((i) => i.country)).size,
  };
}

/** Nombre del sitio al que lleva un perfil, para rotular el enlace. */
export function tipoPerfil(url: string): L10n {
  const host = new URL(url).hostname;
  if (url.endsWith(".pdf")) return { es: "Currículum (PDF)", en: "CV (PDF)" };
  if (host === "produccioncientifica.usal.es") return { es: "Portal de Investigación USAL", en: "USAL Research Portal" };
  if (host.startsWith("scholar.google")) return { es: "Google Scholar", en: "Google Scholar" };
  if (host === "orcid.org") return { es: "ORCID", en: "ORCID" };
  if (host === "portalcientifico.unileon.es") return { es: "Portal Científico ULE", en: "ULE Research Portal" };
  if (host === "summa.upsa.es") return { es: "SUMMA UPSA", en: "SUMMA UPSA" };
  if (host === "www.dcu.ie") return { es: "Perfil en DCU", en: "DCU profile" };
  if (host === "knowledgesociety.usal.es") return { es: "Knowledge Society", en: "Knowledge Society" };
  return { es: "Perfil", en: "Profile" };
}

/** Iniciales para el avatar (sin partículas: «de», «del», «la»…). */
export function iniciales(name: string): string {
  const parts = name
    .replace(/[ªº.’']/g, " ")
    .split(/\s+/)
    .filter((w) => w && !/^(de|del|la|las|los|y|da|do|dos)$/i.test(w));
  const first = parts[0]?.[0] ?? "";
  const second = parts.length > 2 ? parts[parts.length - 2][0] : (parts[1]?.[0] ?? "");
  return (first + second).toUpperCase();
}
