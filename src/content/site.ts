import type { L10n } from "@/lib/i18n";
import { leerGenerado } from "@/content/leer";

/**
 * Datos generales del proyecto. Los textos se editan desde el backstage
 * (contenido/textos.json, ver scripts/contenido.mjs); la referencia y el
 * acrónimo son fijos.
 *
 * PENDIENTE de las IP: fechas de inicio y fin y la fórmula exacta de
 * financiación según la resolución (la web anterior cita a la vez FEDER y
 * FSE+, y un plan estatal «2021-2027»; se deja tal cual).
 */
interface Textos {
  title: L10n;
  subtitle: L10n;
  statement: L10n;
  summary: L10n;
  call: L10n;
  plan: L10n;
  funding: L10n;
  email: string | null;
}
// Se leen en cada página (ver content/leer.ts): en solis cambian sin recompilar
const textos = () => leerGenerado<Textos>("textos");

export const SITE = {
  acronym: "QUALITY",
  reference: "PID2024-156950NB-I00",
  year: 2026,

  get title() {
    return textos().title;
  },
  get subtitle() {
    return textos().subtitle;
  },
  /** Frase de presentación (portada) */
  get statement() {
    return textos().statement;
  },
  /** Descripción breve (metadatos, pie) */
  get summary() {
    return textos().summary;
  },
  get call() {
    return textos().call;
  },
  get plan() {
    return textos().plan;
  },
  /** Texto de financiación (pendiente de cotejar con la resolución) */
  get funding() {
    return textos().funding;
  },
  /** Correo del proyecto (sin él no se muestra contacto) */
  get email() {
    return textos().email;
  },
};

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3030").replace(/\/$/, "");
}
