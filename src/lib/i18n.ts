/**
 * Idiomas del sitio: español (por defecto, sin prefijo en la URL) e inglés
 * (bajo /en), por los socios de Irlanda y Portugal.
 *
 * En desarrollo el middleware reescribe /ruta → /es/ruta; en la versión
 * estática, scripts/build-static.mjs saca el español a la raíz. Así todas las
 * páginas viven una sola vez en `app/(site)/[locale]/…`.
 */
export const LOCALES = ["es", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "es";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/** Texto bilingüe. */
export type L10n<T = string> = Record<Locale, T>;

/** Elige la variante del idioma (con caída al español). */
export function pick<T>(value: L10n<T>, locale: Locale): T {
  return value[locale] ?? value.es;
}

/**
 * Ruta pública localizada, siempre con barra final (como la web anterior):
 * href("en", "/equipo") → "/en/equipo/"; href("es", "/") → "/".
 */
export function href(locale: Locale, path: string = "/"): string {
  const [route, hash] = path.split("#");
  let clean = route.startsWith("/") ? route : `/${route}`;
  if (!clean.endsWith("/")) clean = `${clean}/`;
  const full = locale === DEFAULT_LOCALE ? clean : clean === "/" ? `/${locale}/` : `/${locale}${clean}`;
  return hash ? `${full}#${hash}` : full;
}

/** Quita el prefijo de idioma de una ruta: "/en/equipo/" → "/equipo/". */
export function stripLocale(pathname: string): string {
  for (const l of LOCALES) {
    if (pathname === `/${l}` || pathname === `/${l}/`) return "/";
    if (pathname.startsWith(`/${l}/`)) return pathname.slice(l.length + 1);
  }
  return pathname;
}

export const LOCALE_LABELS: L10n<{ short: string; long: string; htmlLang: string; og: string }> = {
  es: { short: "ES", long: "Español", htmlLang: "es", og: "es_ES" },
  en: { short: "EN", long: "English", htmlLang: "en", og: "en_GB" },
};
