import type { L10n } from "@/lib/i18n";
import textos from "@/content/generado/textos.json";

/**
 * Contenido del proyecto, editable desde el backstage (contenido/textos.json).
 * Los tres ejes y los dos enfoques son fijos (cada uno tiene su color e
 * icono); los objetivos pueden ser los que se quiera.
 */

export type EjeId = "estudiantes" | "entorno" | "profesorado";

/** Color de cada eje: los tres de las figuras del logo. */
export const EJE_COLOR: Record<EjeId, "verde" | "petroleo" | "teja"> = {
  estudiantes: "verde",
  entorno: "petroleo",
  profesorado: "teja",
};

export const EJES = textos.ejes as { id: EjeId; title: L10n; text: L10n }[];

export const OBJETIVOS = textos.objetivos as { text: L10n }[];

/** Página «El proyecto», por apartados. */
export const DESCRIPCION = textos.descripcion as {
  objeto: L10n;
  enfoque: { id: "cuantitativo" | "cualitativo"; title: L10n; text: L10n; nota?: L10n }[];
  transferencia: L10n;
  colaboracion: L10n;
};
