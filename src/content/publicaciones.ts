import publicaciones from "@/content/generado/publicaciones.json";
import type { Publicacion } from "@/content/publicaciones-base";

export * from "@/content/publicaciones-base";

/**
 * Publicaciones del proyecto: un archivo por publicación en
 * contenido/publicaciones/, editable desde el backstage (ver scripts/contenido.mjs).
 * Mientras no haya ninguna, «Publicaciones» no sale en el menú ni en el
 * sitemap y su página explica dónde consultar la producción del equipo.
 *
 * La página las agrupa por año y tipo; dentro de cada grupo van por el campo
 * «Orden» del backstage (los menores antes) y, a igualdad, por título.
 */

export const PUBLICACIONES = publicaciones as Publicacion[];
