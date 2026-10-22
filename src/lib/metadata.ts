import type { Metadata } from "next";
import { href, isLocale, type Locale } from "@/lib/i18n";

/**
 * Metadatos de una página pública: título, descripción, canonical y
 * alternativas hreflang ES/EN (+ x-default en español).
 */
export function pageMetadata(
  locale: Locale,
  path: string,
  title: string | null,
  description?: string,
): Metadata {
  return {
    ...(title ? { title } : {}),
    ...(description ? { description } : {}),
    alternates: {
      canonical: href(locale, path),
      languages: { es: href("es", path), en: href("en", path), "x-default": href("es", path) },
    },
    openGraph: {
      ...(title ? { title: `${title} | QUALITY` } : {}),
      ...(description ? { description } : {}),
      url: href(locale, path),
    },
  };
}

/** Idioma de los parámetros de una página (con caída al español). */
export async function localeFrom(params: Promise<{ locale: string }>): Promise<Locale> {
  const { locale } = await params;
  return isLocale(locale) ? locale : "es";
}
