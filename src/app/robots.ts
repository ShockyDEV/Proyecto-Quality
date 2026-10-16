import type { MetadataRoute } from "next";
import { siteUrl } from "@/content/site";

// Se genera al compilar (también en la versión estática).
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/" }],
    sitemap: `${siteUrl()}/sitemap.xml`,
  };
}
