"use client";

import { useRef, useState } from "react";
import { Bold, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Loader2, Quote } from "lucide-react";
import { renderMarkdown } from "../../scripts/comun.mjs";
import { withBase } from "@/lib/base-path";
import { cn } from "@/lib/cn";
import { useBackstage } from "./contexto";
import { prepararImagen } from "./imagenes";

/** Rutas /media/… del HTML → la imagen local (si se acaba de subir) o la de la web. */
export function htmlParaVista(html: string, vista: Record<string, string>) {
  return html.replace(/(src|href)="(\/[^"]*)"/g, (_, attr: string, ruta: string) => `${attr}="${vista[ruta] ?? withBase(ruta)}"`);
}

/**
 * Texto con formato en Markdown: una barra con lo básico (negrita, título,
 * listas, enlaces, imágenes…) y la vista previa tal como saldrá en la web.
 */
export function EditorMarkdown({
  id,
  valor,
  onCambio,
  carpeta,
}: {
  id: string;
  valor: string;
  onCambio: (v: string) => void;
  carpeta: string;
}) {
  const { subirImagen, vistaPrevia } = useBackstage();
  const area = useRef<HTMLTextAreaElement>(null);
  const archivo = useRef<HTMLInputElement>(null);
  const [vista, setVista] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [error, setError] = useState("");

  /** Envuelve la selección (o inserta un ejemplo) y la deja seleccionada. */
  function envolver(antes: string, despues: string, ejemplo: string) {
    const ta = area.current;
    if (!ta) return;
    const { selectionStart: a, selectionEnd: b } = ta;
    const sel = valor.slice(a, b) || ejemplo;
    const nuevo = valor.slice(0, a) + antes + sel + despues + valor.slice(b);
    onCambio(nuevo);
    requestAnimationFrame(() => {
      ta.focus();
      ta.setSelectionRange(a + antes.length, a + antes.length + sel.length);
    });
  }

  /** Pone un prefijo al principio de cada línea seleccionada. */
  function prefijar(prefijo: (i: number) => string) {
    const ta = area.current;
    if (!ta) return;
    const inicio = valor.lastIndexOf("\n", ta.selectionStart - 1) + 1;
    const fin = ta.selectionEnd;
    const bloque = valor.slice(inicio, fin) || "Texto";
    const nuevo = bloque
      .split("\n")
      .map((l, i) => prefijo(i) + l.replace(/^(#{1,6} |> |- |\d+\. )/, ""))
      .join("\n");
    onCambio(valor.slice(0, inicio) + nuevo + valor.slice(fin));
    requestAnimationFrame(() => ta.focus());
  }

  async function insertarImagen(file: File | undefined) {
    if (!file) return;
    setError("");
    setSubiendo(true);
    try {
      const { blob } = await prepararImagen(file, { max: 1600 });
      const ruta = await subirImagen(blob, carpeta, file.name.replace(/\.[^.]+$/, ""));
      envolver(`\n\n![`, `](${ruta})\n\n`, "Descripción de la imagen");
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido subir la imagen");
    } finally {
      setSubiendo(false);
      if (archivo.current) archivo.current.value = "";
    }
  }

  const boton = "inline-flex h-8 w-8 items-center justify-center rounded text-cuerpo hover:bg-tintado hover:text-tinta disabled:opacity-40";

  return (
    <div className="mt-1.5 overflow-hidden rounded-md border border-linea bg-superficie focus-within:border-petroleo">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-linea bg-pagina px-1.5 py-1">
        <button type="button" className={boton} title="Negrita" onClick={() => envolver("**", "**", "texto en negrita")} disabled={vista}>
          <Bold className="h-4 w-4" aria-hidden />
          <span className="sr-only">Negrita</span>
        </button>
        <button type="button" className={boton} title="Cursiva" onClick={() => envolver("*", "*", "texto en cursiva")} disabled={vista}>
          <Italic className="h-4 w-4" aria-hidden />
          <span className="sr-only">Cursiva</span>
        </button>
        <button type="button" className={boton} title="Subtítulo" onClick={() => prefijar(() => "## ")} disabled={vista}>
          <Heading2 className="h-4 w-4" aria-hidden />
          <span className="sr-only">Subtítulo</span>
        </button>
        <button type="button" className={boton} title="Lista" onClick={() => prefijar(() => "- ")} disabled={vista}>
          <List className="h-4 w-4" aria-hidden />
          <span className="sr-only">Lista</span>
        </button>
        <button type="button" className={boton} title="Lista numerada" onClick={() => prefijar((i) => `${i + 1}. `)} disabled={vista}>
          <ListOrdered className="h-4 w-4" aria-hidden />
          <span className="sr-only">Lista numerada</span>
        </button>
        <button type="button" className={boton} title="Cita" onClick={() => prefijar(() => "> ")} disabled={vista}>
          <Quote className="h-4 w-4" aria-hidden />
          <span className="sr-only">Cita</span>
        </button>
        <button type="button" className={boton} title="Enlace" onClick={() => envolver("[", "](https://)", "texto del enlace")} disabled={vista}>
          <Link2 className="h-4 w-4" aria-hidden />
          <span className="sr-only">Enlace</span>
        </button>
        <button type="button" className={boton} title="Imagen" onClick={() => archivo.current?.click()} disabled={vista || subiendo}>
          {subiendo ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <ImagePlus className="h-4 w-4" aria-hidden />}
          <span className="sr-only">Insertar imagen</span>
        </button>
        <input ref={archivo} type="file" accept="image/*" className="hidden" onChange={(e) => insertarImagen(e.target.files?.[0])} />
        <div className="ml-auto flex rounded border border-linea text-xs font-semibold">
          <button type="button" onClick={() => setVista(false)} className={cn("px-2.5 py-1", !vista ? "bg-petroleo text-sobre-petroleo" : "text-cuerpo")}>
            Escribir
          </button>
          <button type="button" onClick={() => setVista(true)} className={cn("px-2.5 py-1", vista ? "bg-petroleo text-sobre-petroleo" : "text-cuerpo")}>
            Vista previa
          </button>
        </div>
      </div>
      {vista ? (
        <div
          className="texto-noticia min-h-[14rem] px-4 py-3"
          dangerouslySetInnerHTML={{ __html: htmlParaVista(renderMarkdown(valor), vistaPrevia) || "<p><em>Sin texto</em></p>" }}
        />
      ) : (
        <textarea
          id={id}
          ref={area}
          value={valor}
          onChange={(e) => onCambio(e.target.value)}
          rows={14}
          className="block w-full resize-y bg-superficie px-4 py-3 font-sans text-[0.95rem] leading-relaxed text-tinta focus:outline-none"
          placeholder="Escribe aquí el texto. Deja una línea en blanco entre párrafos."
        />
      )}
      {error && <p className="border-t border-linea px-4 py-2 text-sm text-teja-texto">{error}</p>}
    </div>
  );
}
