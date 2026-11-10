import type { L10n } from "@/lib/i18n";
import textos from "@/content/generado/textos.json";

/**
 * Datos generales del proyecto. Los textos se editan desde el backstage
 * (contenido/textos.json, ver scripts/contenido.mjs); la referencia y el
 * acrónimo son fijos.
 *
 * PENDIENTE de las IP: fechas de inicio y fin y la fórmula exacta de
 * financiación según la resolución (la web anterior cita a la vez FEDER y
 * FSE+, y un plan estatal «2021-2027»; se deja tal cual).
 */
export const SITE = {
  acronym: "QUALITY",
  reference: "PID2024-156950NB-I00",
  year: 2026,

  title: textos.title as L10n,
  subtitle: textos.subtitle as L10n,
  /** Frase de presentación (portada) */
  statement: textos.statement as L10n,
  /** Descripción breve (metadatos, pie) */
  summary: textos.summary as L10n,
  call: textos.call as L10n,
  plan: textos.plan as L10n,
  /** Texto de financiación (pendiente de cotejar con la resolución) */
  funding: textos.funding as L10n,
  /** Correo del proyecto (sin él no se muestra contacto) */
  email: textos.email as string | null,
};

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3030").replace(/\/$/, "");
}
