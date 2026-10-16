import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";
import { NAV } from "@/content/ui";
import { href, LOCALES } from "@/lib/i18n";

// Se genera al compilar (también en la versión estática).
export const dynamic = "force-static";

// Portada + menú (Publicaciones solo entra cuando hay alguna, como en el menú)
const PATHS = ["/", ...NAV.map((n) => n.path)];

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return PATHS.flatMap((path) =>
    LOCALES.map((locale) => ({
      url: `${base}${href(locale, path)}`,
      changeFrequency: "monthly" as const,
      priority: path === "/" ? 1 : 0.7,
      alternates: { languages: Object.fromEntries(LOCALES.map((l) => [l, `${base}${href(l, path)}`])) },
    })),
  );
}
