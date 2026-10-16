import type { L10n } from "@/lib/i18n";

/**
 * Datos generales del proyecto. Los textos en español proceden de la web
 * anterior (quality.grial.eu, consultada el 16-10-2026), con sus erratas
 * corregidas («ORIENTACIÓ», el código repetido «PID2024-PID2024-…»). Las
 * versiones en inglés son traducción nuestra: el título oficial en inglés,
 * si existe, está por confirmar con las investigadoras principales.
 *
 * PENDIENTE de las IP: fechas de inicio y fin, correo de contacto y la
 * fórmula exacta de financiación según la resolución (la web anterior cita a
 * la vez FEDER y FSE+, y un plan estatal «2021-2027»; se deja tal cual).
 */
export const SITE = {
  acronym: "QUALITY",
  reference: "PID2024-156950NB-I00",
  year: 2026,

  title: {
    es: "Evaluación de la calidad de los entornos de aprendizaje centrados en el estudiante en Universidad",
    en: "Assessing the quality of student-centred learning environments in higher education",
  } satisfies L10n,
  subtitle: {
    es: "Transferencia hacia la formación docente y la orientación académica",
    en: "Transfer to teacher training and academic guidance",
  } satisfies L10n,
  /** Frase de presentación de la web anterior (sección de la portada). */
  statement: {
    es: "Estudiamos la interacción entre estudiantes, profesorado y el entorno de aprendizaje para mejorar la calidad universitaria.",
    en: "We study the interaction between students, teaching staff and the learning environment to improve the quality of higher education.",
  } satisfies L10n,
  /** Descripción breve (metadatos, pie). */
  summary: {
    es: "Proyecto de investigación que evalúa la calidad de los entornos de aprendizaje orientados al estudiante en educación superior y transfiere sus resultados a la formación docente y la orientación académica.",
    en: "Research project assessing the quality of student-centred learning environments in higher education and transferring its findings to teacher training and academic guidance.",
  } satisfies L10n,

  call: {
    es: "Proyectos de Generación de Conocimiento 2024",
    en: "Knowledge Generation Projects 2024",
  } satisfies L10n,
  plan: {
    es: "Plan Estatal de Investigación Científica, Técnica y de Innovación 2021-2027",
    en: "State Plan for Scientific, Technical and Innovation Research 2021-2027",
  } satisfies L10n,
  /** Texto de financiación de la web anterior (pendiente de cotejar con la resolución). */
  funding: {
    es: "Financiado por la Agencia Estatal de Investigación (AEI), convocatoria «Proyectos de Generación de Conocimiento 2024» (PID2024-156950NB-I00), Plan Estatal de Investigación Científica, Técnica y de Innovación 2021-2027. Cofinanciado por el Fondo Europeo de Desarrollo Regional (FEDER) y el Fondo Social Europeo Plus (FSE+).",
    en: "Funded by the Spanish State Research Agency (AEI), «Knowledge Generation Projects 2024» call (PID2024-156950NB-I00), State Plan for Scientific, Technical and Innovation Research 2021-2027. Co-funded by the European Regional Development Fund (ERDF) and the European Social Fund Plus (ESF+).",
  } satisfies L10n,

  /** Correo del proyecto: PENDIENTE (sin él no se muestra contacto). */
  email: null as string | null,
};

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3030").replace(/\/$/, "");
}
