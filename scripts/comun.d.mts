// Tipos de scripts/comun.mjs (lo comparten el generador y el backstage).
export function escapeHtml(s: string): string;
export function slugify(s: string): string;
export function renderMarkdown(md: string): string;
export function leerNoticia(raw: string): { cabecera: Record<string, unknown>; cuerpo: string };
export function escribirNoticia(cabecera: Record<string, unknown>, cuerpo: string): string;
