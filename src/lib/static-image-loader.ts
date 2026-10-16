import { withBase } from "@/lib/base-path";

/**
 * Cargador de next/image para la versión estática: sin servidor no hay
 * optimizador, así que la imagen se sirve tal cual desde public/ (los ficheros
 * ya están a su tamaño), con la subcarpeta de GitHub Pages delante si la hay.
 * El ancho va en la consulta solo para que cada candidato del srcset sea
 * distinto; GitHub Pages la ignora.
 */
export default function staticImageLoader({ src, width }: { src: string; width: number; quality?: number }): string {
  return `${withBase(src)}?w=${width}`;
}
