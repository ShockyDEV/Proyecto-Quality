/**
 * Lo que comparten el generador de contenido (scripts/contenido.mjs, en Node)
 * y el backstage (en el navegador): direcciones, Markdown de las noticias y
 * lectura/escritura de su cabecera. Nada de Node aquí: tiene que poder ir en
 * el navegador.
 */
import { dump, load } from "js-yaml";
import { Marked } from "marked";

export const escapeHtml = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Nombre de archivo → dirección: sin tildes, en minúsculas y con guiones. */
export function slugify(s) {
  return String(s)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

/**
 * Markdown de las noticias → HTML. El HTML que venga escrito a mano se
 * muestra como texto y los enlaces solo pueden ser http(s), mailto o rutas de
 * la propia web.
 */
const markdown = new Marked({
  gfm: true,
  renderer: {
    html({ text }) {
      return escapeHtml(text);
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      if (!/^(https?:|mailto:|\/|#)/i.test(href)) return text;
      const externo = /^https?:/i.test(href);
      return `<a href="${escapeHtml(href)}"${title ? ` title="${escapeHtml(title)}"` : ""}${externo ? ' target="_blank" rel="noopener noreferrer"' : ""}>${text}</a>`;
    },
    image({ href, title, text }) {
      if (!/^(https?:|\/)/i.test(href)) return "";
      return `<img src="${escapeHtml(href)}" alt="${escapeHtml(text)}"${title ? ` title="${escapeHtml(title)}"` : ""} loading="lazy">`;
    },
  },
});

export function renderMarkdown(md) {
  return markdown.parse(String(md ?? ""));
}

/**
 * Noticia en Markdown con cabecera YAML («---» … «---») → { cabecera, cuerpo }.
 * Lanza un Error con el motivo si no se puede leer.
 */
export function leerNoticia(raw) {
  const m = String(raw)
    .replace(/^﻿/, "")
    .match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) throw new Error("falta la cabecera (---) con el título y la fecha");
  let cabecera;
  try {
    cabecera = load(m[1]) ?? {};
  } catch (e) {
    throw new Error(`cabecera ilegible (${e.message})`);
  }
  if (cabecera.fecha instanceof Date) cabecera.fecha = cabecera.fecha.toISOString().slice(0, 10);
  return { cabecera, cuerpo: m[2].trim() };
}

/**
 * { cabecera, cuerpo } → Markdown con cabecera YAML. js-yaml pone entre
 * comillas lo que parece una fecha, así que vuelve a leerse como texto.
 */
export function escribirNoticia(cabecera, cuerpo) {
  return `---\n${dump(cabecera, { lineWidth: -1 })}---\n${String(cuerpo ?? "").trim()}\n`;
}
