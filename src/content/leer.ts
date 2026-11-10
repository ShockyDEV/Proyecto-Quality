import { readFileSync, statSync } from "node:fs";
import path from "node:path";

/**
 * Lee el contenido generado (src/content/generado/*.json, ver
 * scripts/contenido.mjs) en el momento de pintar cada página, no al compilar:
 *
 * - en la versión estática (GitHub Pages) da igual, se lee al exportar;
 * - en el servidor de solis (`next start`), un guardado del backstage
 *   regenera estos archivos y la página siguiente ya sale con lo nuevo, sin
 *   recompilar.
 *
 * Cada archivo se guarda en memoria hasta que cambia en el disco.
 */
const DIR = path.join(process.cwd(), "src/content/generado");
const cache = new Map<string, { mtime: number; datos: unknown }>();

export function leerGenerado<T>(nombre: string): T {
  const archivo = path.join(DIR, `${nombre}.json`);
  const mtime = statSync(archivo).mtimeMs;
  const guardado = cache.get(nombre);
  if (guardado?.mtime === mtime) return guardado.datos as T;
  const datos = JSON.parse(readFileSync(archivo, "utf8")) as T;
  cache.set(nombre, { mtime, datos });
  return datos;
}
