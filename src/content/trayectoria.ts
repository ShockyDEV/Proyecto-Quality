import type { L10n } from "@/lib/i18n";

/**
 * Proyectos anteriores del equipo (página «Proyectos anteriores» de la web
 * anterior, 16-10-2026), con títulos y años tal como figuran allí. Las cuatro
 * webs seguían en línea ese día.
 *
 * POR CONFIRMAR con las IP (no se corrige): la web anterior fecha EFI cuatro
 * en 2015 y EFI cinco en 2012, al revés que su numeración.
 */
export interface ProyectoAnterior {
  acronym: string;
  year: number;
  title: L10n;
  /** Etapa, solo cuando el título la dice */
  stage?: L10n;
  url?: string;
  current?: boolean;
}

const SECUNDARIA: L10n = { es: "Educación Secundaria", en: "Secondary education" };

export const TRAYECTORIA: ProyectoAnterior[] = [
  {
    acronym: "EFI cinco",
    year: 2012,
    title: {
      es: "Evaluación, Formación e Innovación sobre competencias clave en Educación Secundaria: TIC, Competencia INformacional y Resolución de COnflictos",
      en: "Assessment, Training and Innovation in key competences in secondary education: ICT, information literacy and conflict resolution",
    },
    stage: SECUNDARIA,
    url: "https://eficinco.usal.es/",
  },
  {
    acronym: "EFI cuatro",
    year: 2015,
    title: {
      es: "Evaluación de Impacto del Desarrollo de Competencias Básicas sobre el Rendimiento Académico en Educación Secundaria",
      en: "Impact assessment of the development of basic competences on academic performance in secondary education",
    },
    stage: SECUNDARIA,
    url: "https://eficuatro.usal.es/",
  },
  {
    acronym: "EFI seis",
    year: 2018,
    title: {
      es: "Escuelas eficaces para la mejora del sistema",
      en: "Effective schools for improving the system",
    },
    url: "https://efiseis.grial.eu/",
  },
  {
    acronym: "EVIDENCE",
    year: 2021,
    title: {
      es: "Evaluación y promoción de la equidad educativa en Educación Secundaria",
      en: "Assessing and promoting educational equity in secondary education",
    },
    stage: SECUNDARIA,
    url: "https://evidence.grial.eu/",
  },
  {
    acronym: "QUALITY",
    year: 2024,
    title: {
      es: "Evaluación de la calidad de los entornos de aprendizaje centrados en el estudiante en Universidad",
      en: "Assessing the quality of student-centred learning environments in higher education",
    },
    stage: { es: "Universidad", en: "Higher education" },
    current: true,
  },
];
