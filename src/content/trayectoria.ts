import type { L10n } from "@/lib/i18n";
import trayectoria from "@/content/generado/trayectoria.json";

/**
 * Proyectos anteriores del equipo, editables desde el panel
 * (contenido/trayectoria.json), ordenados por año.
 *
 * POR CONFIRMAR con las IP (no se corrige): la web anterior fecha EFI cuatro
 * en 2015 y EFI cinco en 2012, al revés que su numeración.
 */
export interface ProyectoAnterior {
  acronym: string;
  year: number;
  title: L10n;
  /** Etapa, solo cuando el título la dice */
  stage?: L10n;
  url?: string;
  current?: boolean;
}

export const TRAYECTORIA = trayectoria as ProyectoAnterior[];
