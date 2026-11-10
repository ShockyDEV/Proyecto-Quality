import type { L10n } from "@/lib/i18n";
import { leerGenerado } from "@/content/leer";

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

interface Textos {
  ejes: { id: EjeId; title: L10n; text: L10n }[];
  objetivos: { text: L10n }[];
  descripcion: {
    objeto: L10n;
    enfoque: { id: "cuantitativo" | "cualitativo"; title: L10n; text: L10n; nota?: L10n }[];
    transferencia: L10n;
    colaboracion: L10n;
  };
}
// Se leen en cada página (ver content/leer.ts): en solis cambian sin recompilar
const textos = () => leerGenerado<Textos>("textos");

export const ejes = () => textos().ejes;

export const objetivos = () => textos().objetivos;

/** Página «El proyecto», por apartados. */
export const DESCRIPCION = {
  get objeto() {
    return textos().descripcion.objeto;
  },
  get enfoque() {
    return textos().descripcion.enfoque;
  },
  get transferencia() {
    return textos().descripcion.transferencia;
  },
  get colaboracion() {
    return textos().descripcion.colaboracion;
  },
};
