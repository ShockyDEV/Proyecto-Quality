import { leerGenerado } from "@/content/leer";
import { INSTITUCIONES, type Institucion, type Persona, type Rol } from "@/content/equipo-base";

export * from "@/content/equipo-base";

/**
 * Equipo del proyecto. Cada persona es un archivo de contenido/equipo/ que se
 * edita desde el backstage (nombre, papel, institución, perfil, foto y orden);
 * ver scripts/contenido.mjs. Las cifras de la web (personas, instituciones,
 * países) se calculan a partir de esta lista.
 */
export const equipo = () => leerGenerado<Persona[]>("equipo");

/** Personas de un rol agrupadas por institución, en el orden de INSTITUCIONES. */
export function porInstitucion(role: Rol): { institution: Institucion; people: Persona[] }[] {
  return INSTITUCIONES.map((institution) => ({
    institution,
    people: equipo().filter((p) => p.role === role && p.institution === institution.id),
  })).filter((g) => g.people.length > 0);
}

/** Cifras para la portada y la página de equipo. */
export function cifrasEquipo() {
  const personas = equipo();
  const usadas = INSTITUCIONES.filter((i) => personas.some((p) => p.institution === i.id));
  return {
    personas: personas.length,
    instituciones: usadas.length,
    paises: new Set(usadas.map((i) => i.country)).size,
  };
}

