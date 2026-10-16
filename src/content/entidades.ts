import type { L10n } from "@/lib/i18n";

/**
 * Logos del pie. La web anterior mostraba los del IUCE, GRIAL y GE2O; se
 * añade el de la Universidad de Salamanca, a la que pertenecen las
 * investigadoras principales. `h` es el alto en pantalla, ajustado para que
 * pesen parecido a la vista pese a sus proporciones distintas.
 */
export interface Entidad {
  id: string;
  name: L10n;
  url: string;
  logo: string;
  width: number;
  height: number;
  h: number;
}

export const ENTIDADES: Entidad[] = [
  {
    id: "usal",
    name: { es: "Universidad de Salamanca", en: "University of Salamanca" },
    url: "https://www.usal.es",
    logo: "/logos/usal.png",
    width: 854,
    height: 232,
    h: 36,
  },
  {
    id: "iuce",
    name: {
      es: "Instituto Universitario de Ciencias de la Educación (IUCE)",
      en: "University Institute of Educational Sciences (IUCE)",
    },
    url: "https://iuce.usal.es",
    logo: "/logos/iuce.png",
    width: 800,
    height: 362,
    h: 42,
  },
  {
    id: "grial",
    name: { es: "Grupo de investigación GRIAL", en: "GRIAL research group" },
    url: "https://grial.usal.es",
    logo: "/logos/grial.png",
    width: 600,
    height: 600,
    h: 56,
  },
  {
    id: "ge2o",
    name: {
      es: "GE2O, Grupo de Evaluación Educativa y Orientación",
      en: "GE2O, Educational Assessment and Guidance Group",
    },
    url: "https://ge2o.usal.es",
    logo: "/logos/ge2o.png",
    width: 160,
    height: 75,
    h: 34,
  },
];

/** Logos de la financiación (MICIU, Unión Europea, AEI), en una sola imagen. */
export const LOGO_FINANCIACION = {
  src: "/logos/financiacion-miciu-ue-aei.png",
  width: 1024,
  height: 198,
  alt: {
    es: "Ministerio de Ciencia, Innovación y Universidades; Cofinanciado por la Unión Europea; Agencia Estatal de Investigación",
    en: "Spanish Ministry of Science, Innovation and Universities; Co-funded by the European Union; State Research Agency",
  } satisfies L10n,
};
