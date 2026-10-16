import type { L10n } from "@/lib/i18n";

/**
 * Contenido del proyecto. Los ejes y los objetivos son los de la portada de
 * la web anterior; el enfoque, la transferencia y la colaboración salen de su
 * página «Proyecto», repartida en apartados sin añadir datos.
 */

export type EjeId = "estudiantes" | "entorno" | "profesorado";

/** Color de cada eje: los tres de las figuras del logo. */
export const EJE_COLOR: Record<EjeId, "verde" | "petroleo" | "teja"> = {
  estudiantes: "verde",
  entorno: "petroleo",
  profesorado: "teja",
};

export const EJES: { id: EjeId; title: L10n; text: L10n }[] = [
  {
    id: "estudiantes",
    title: { es: "Estudiantes", en: "Students" },
    text: {
      es: "Caracterización de los resultados de aprendizaje de estudiantes universitarios. Indicadores de inequidad y factores clave asociados.",
      en: "Characterising the learning outcomes of university students. Inequity indicators and the key factors associated with them.",
    },
  },
  {
    id: "entorno",
    title: { es: "Entorno de aprendizaje", en: "Learning environment" },
    text: {
      es: "Estudio de los entornos de aprendizaje orientados al estudiante en Universidad.",
      en: "Study of student-centred learning environments in higher education.",
    },
  },
  {
    id: "profesorado",
    title: { es: "Profesorado", en: "Teaching staff" },
    text: {
      es: "Transferencia en formación docente del profesorado universitario y hacia la orientación académica del estudiante universitario.",
      en: "Transfer to the professional development of university teaching staff and to the academic guidance of university students.",
    },
  },
];

export const OBJETIVOS: { id: string; text: L10n }[] = [
  {
    id: "conocimiento",
    text: { es: "Crear conocimiento útil y aplicable", en: "Create useful, applicable knowledge" },
  },
  {
    id: "sistema",
    text: {
      es: "Reforzar el sistema universitario: moderno, inclusivo y orientado al estudiante",
      en: "Strengthen the university system: modern, inclusive and student-centred",
    },
  },
  {
    id: "equidad",
    text: {
      es: "Mejorar la calidad y la equidad en educación superior",
      en: "Improve quality and equity in higher education",
    },
  },
];

/** Página «El proyecto»: texto íntegro de la web anterior, por apartados. */
export const DESCRIPCION = {
  objeto: {
    es: "El proyecto QUALITY evalúa la calidad de los entornos de aprendizaje orientados al estudiante en educación superior.",
    en: "The QUALITY project assesses the quality of student-centred learning environments in higher education.",
  } satisfies L10n,
  enfoque: [
    {
      id: "cuantitativo",
      title: { es: "Análisis cuantitativo", en: "Quantitative analysis" },
      text: {
        es: "Mediante análisis cuantitativo de datos SIIU con regresiones multinivel, identifica factores contextuales (centro, titulación, perfil del alumnado) que determinan el rendimiento académico y la equidad educativa, tanto socioeconómica como de género.",
        en: "Through quantitative analysis of SIIU data using multilevel regression, it identifies the contextual factors (institution, degree programme, student profile) that shape academic performance and educational equity, both socio-economic and gender equity.",
      },
      nota: {
        es: "SIIU: Sistema Integrado de Información Universitaria.",
        en: "SIIU: Spain's Integrated University Information System.",
      },
    },
    {
      id: "cualitativo",
      title: { es: "Estudios cualitativos", en: "Qualitative studies" },
      text: {
        es: "Complementa este enfoque con estudios cualitativos en centros de alta y baja eficacia para detectar buenas prácticas en enseñanza y evaluación.",
        en: "It complements this approach with qualitative studies in high- and low-effectiveness institutions to identify good practice in teaching and assessment.",
      },
    },
  ],
  transferencia: {
    es: "Los resultados se aplicarán directamente a la formación docente y la orientación académica, impulsando prácticas de aprendizaje profundo e inclusión social.",
    en: "The findings will be applied directly to teacher training and academic guidance, promoting deep-learning practices and social inclusion.",
  } satisfies L10n,
  colaboracion: {
    es: "A través de la colaboración internacional con universidades de Irlanda y Portugal, en QUALITY se elaborará un catálogo de recomendaciones prácticas que permita a las instituciones universitarias optimizar sus procesos educativos hacia un sistema más equitativo y moderno.",
    en: "Through international collaboration with universities in Ireland and Portugal, QUALITY will produce a catalogue of practical recommendations to help universities optimise their educational processes towards a fairer, more modern system.",
  } satisfies L10n,
};
