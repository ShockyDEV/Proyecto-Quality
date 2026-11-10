import type { MetadataRoute } from "next";
import { noticias } from "@/content/noticias";
import { siteUrl } from "@/content/site";
import { nav } from "@/content/nav";
import { href, LOCALES } from "@/lib/i18n";

// Se genera al compilar (también en la versión estática).
export const dynamic = "force-static";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  // Portada + menú (Publicaciones y Noticias solo entran cuando hay alguna,
  // como en el menú) + cada noticia
  const PATHS = ["/", ...nav().map((n) => n.path), ...noticias().map((n) => `/noticias/${n.slug}`)];
  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${base}${href(locale, path)}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${base}${href(l, path)}`])) },
    })),
  );
}
