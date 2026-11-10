import type { L10n } from "@/lib/i18n";
import { leerGenerado } from "@/content/leer";

/**
 * Navegación principal (mismas rutas en los dos idiomas; EN con prefijo /en).
 * Las rutas son las de la web anterior, para no romper enlaces.
 * «Publicaciones» y «Noticias» solo aparecen cuando hay alguna. Se calcula en
 * el servidor y la cabecera (de cliente) la recibe ya hecha.
 */
export interface EnlaceMenu {
  path: string;
  label: L10n;
}

const ALL_NAV: EnlaceMenu[] = [
  { path: "/el-proyecto", label: { es: "El proyecto", en: "The project" } },
  { path: "/equipo", label: { es: "Equipo", en: "Team" } },
  { path: "/publicaciones", label: { es: "Publicaciones", en: "Publications" } },
  { path: "/noticias", label: { es: "Noticias", en: "News" } },
  { path: "/trayectoria", label: { es: "Trayectoria", en: "Track record" } },
];

export function nav(): EnlaceMenu[] {
  const indice = leerGenerado<{ publicaciones: number; noticias: number }>("indice");
  return ALL_NAV.filter(
    (n) => (n.path !== "/publicaciones" || indice.publicaciones > 0) && (n.path !== "/noticias" || indice.noticias > 0),
  );
}
