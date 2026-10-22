import type { L10n } from "@/lib/i18n";

/**
 * Equipo del proyecto, tal como lo publica la web anterior (página «Equipo»,
 * 16-10-2026): investigadoras principales, equipo investigador y equipo de
 * trabajo, por institución, con el enlace al perfil que allí figura. Errata
 * corregida: «Politécncio». Los nombres se dejan como estaban escritos.
 *
 * Las cifras de la web (personas, instituciones, países) se calculan a partir
 * de esta lista: basta con añadir o quitar a alguien aquí.
 *
 * Fotos (public/equipo/, 240 px, 16-10-2026): de la ficha de cada persona en
 * el Portal de Investigación USAL; las de Ana María Pinto, José Carlos Sánchez
 * Prieto y Serena Rivetta, que no tienen foto en el portal, de la web del
 * IUCE; las de Ignacio González y Eloísa Reche, de su perfil de Google Scholar;
 * la de Amparo Jiménez, de Knowledge Society. El resto no tiene foto pública
 * en el perfil enlazado y se muestra con sus iniciales.
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

export const INSTITUCIONES: Institucion[] = [
  {
    id: "usal",
    name: { es: "Universidad de Salamanca", en: "University of Salamanca" },
    short: "USAL",
    country: "es",
    url: "https://www.usal.es",
  },
  {
    id: "uco",
    name: { es: "Universidad de Córdoba", en: "University of Córdoba" },
    short: "UCO",
    country: "es",
    url: "https://www.uco.es",
  },
  {
    id: "ule",
    name: { es: "Universidad de León", en: "University of León" },
    short: "ULE",
    country: "es",
    url: "https://www.unileon.es",
  },
  {
    id: "upsa",
    name: { es: "Universidad Pontificia de Salamanca", en: "Pontifical University of Salamanca" },
    short: "UPSA",
    country: "es",
    url: "https://www.upsa.es",
  },
  {
    id: "unibasq",
    name: {
      es: "Agencia de Calidad del Sistema Universitario Vasco (Unibasq)",
      en: "Basque University System Quality Agency (Unibasq)",
    },
    short: "Unibasq",
    country: "es",
    url: "https://www.unibasq.eus",
  },
  {
    id: "dcu",
    name: { es: "Dublin City University", en: "Dublin City University" },
    short: "DCU",
    country: "ie",
    url: "https://www.dcu.ie",
  },
  {
    id: "ubi",
    name: { es: "Universidade da Beira Interior", en: "University of Beira Interior" },
    short: "UBI",
    country: "pt",
    url: "https://www.ubi.pt",
  },
  {
    id: "ipv",
    name: { es: "Instituto Politécnico de Viseu", en: "Polytechnic Institute of Viseu" },
    short: "IPV",
    country: "pt",
    url: "https://www.ipv.pt",
  },
];

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
  /** Perfil público que enlaza la web anterior */
  profile?: string;
  /** Foto (public/equipo/…) */
  photo?: string;
}

const portalUsal = (id: number) => `https://produccioncientifica.usal.es/investigadores/${id}/detalle`;
const orcid = (id: string) => `https://orcid.org/${id}`;
const foto = (slug: string) => `/equipo/${slug}.jpg`;

export const EQUIPO: Persona[] = [
  // Investigadoras principales
  { name: "Mª José Rodríguez Conde", role: "ip", institution: "usal", profile: portalUsal(56749), photo: foto("rodriguez-conde") },
  { name: "Susana Olmos Miguelañez", role: "ip", institution: "usal", profile: portalUsal(57518), photo: foto("olmos-miguelanez") },

  // Equipo investigador
  { name: "Ana Belén González Rogado", role: "investigador", institution: "usal", profile: portalUsal(56131), photo: foto("gonzalez-rogado") },
  { name: "Juan Pablo Hernández Ramos", role: "investigador", institution: "usal", profile: portalUsal(57150), photo: foto("hernandez-ramos") },
  { name: "Susana Nieto Isidro", role: "investigador", institution: "usal", profile: portalUsal(55912), photo: foto("nieto-isidro") },
  { name: "Ana María Pinto Llorente", role: "investigador", institution: "usal", profile: portalUsal(57371), photo: foto("pinto-llorente") },
  { name: "José Carlos Sánchez Prieto", role: "investigador", institution: "usal", profile: portalUsal(57383), photo: foto("sanchez-prieto") },
  {
    name: "Ignacio González López",
    role: "investigador",
    institution: "uco",
    profile: "https://scholar.google.com/citations?user=bYLYLswAAAAJ&hl=en",
    photo: foto("gonzalez-lopez"),
  },
  {
    name: "Eloisa Reche Urbano",
    role: "investigador",
    institution: "uco",
    profile: "https://scholar.google.es/citations?user=I1fMRhEAAAAJ&hl=es",
    photo: foto("reche-urbano"),
  },
  {
    name: "Mercedes López Aguado",
    role: "investigador",
    institution: "ule",
    profile: "https://portalcientifico.unileon.es/investigadores/97017/detalle",
  },
  {
    name: "Amparo Jiménez Vivas",
    role: "investigador",
    institution: "upsa",
    profile: "https://knowledgesociety.usal.es/users/amparo-jim%C3%A9nez-vivas",
    photo: foto("jimenez-vivas"),
  },
  {
    name: "María Teresa Del Moral Marcos",
    role: "investigador",
    institution: "upsa",
    profile: "https://summa.upsa.es/details.vm?q=id:0000129719&lang=es&view=main",
  },

  // Equipo de trabajo
  { name: "Alba María del Brio Nieto", role: "trabajo", institution: "usal", profile: portalUsal(1222816), photo: foto("del-brio-nieto") },
  { name: "Cristina Frade Martínez", role: "trabajo", institution: "usal", profile: portalUsal(148037), photo: foto("frade-martinez") },
  { name: "Marina García Herrero", role: "trabajo", institution: "usal", profile: portalUsal(820219), photo: foto("garcia-herrero") },
  { name: "María Holgado Aguadero", role: "trabajo", institution: "usal", profile: portalUsal(818526), photo: foto("holgado-aguadero") },
  { name: "Carolina Alexandra Martins Azinheiro", role: "trabajo", institution: "usal", profile: portalUsal(182560), photo: foto("martins-azinheiro") },
  { name: "Alberto Ortiz López", role: "trabajo", institution: "usal", profile: portalUsal(157284), photo: foto("ortiz-lopez") },
  { name: "Serena Rivetta", role: "trabajo", institution: "usal", profile: portalUsal(148049), photo: foto("rivetta") },
  { name: "Lourdes Sancho Otero", role: "trabajo", institution: "uco", profile: orcid("0000-0002-9999-2593") },
  {
    name: "Sandra Marcos Ortega",
    role: "trabajo",
    institution: "upsa",
    profile: "https://www.unibasq.eus/wp-content/uploads/2025/01/CV-SMO.pdf",
  },
  {
    name: "Joe O’Hara",
    role: "trabajo",
    institution: "dcu",
    profile: "https://www.dcu.ie/policy-and-practice/people/joe-ohara",
  },
  {
    name: "Martin Brown",
    role: "trabajo",
    institution: "dcu",
    profile: "https://www.dcu.ie/policyandpractice/people/martin-brown",
  },
  { name: "Maria Eugenia Neto Ferrao", role: "trabajo", institution: "ubi", profile: orcid("0000-0002-1317-0629") },
  { name: "Maria Pacheco Figueiredo", role: "trabajo", institution: "ipv", profile: orcid("0000-0002-3604-529X") },
  { name: "Eva Fernández de Labastida", role: "trabajo", institution: "unibasq", profile: orcid("0009-0008-0731-5597") },

  // Contratos asociados al proyecto (no estaban en la web anterior; añadido el 22-10-2026)
  { name: "César Conley", role: "contrato", institution: "usal" },
];

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
