import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";
import { BASE_PATH } from "@/lib/base-path";

// Se genera al compilar (también en la versión estática).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    // El backstage (edición) fuera de los buscadores
    rules: [{ userAgent: "*", allow: "/", disallow: `${BASE_PATH}/backstage/` }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
