"use client";

import { useRef, useState } from "react";
import { ArrowDown, ArrowUp, ChevronDown, ImagePlus, Loader2, Plus, Trash2 } from "lucide-react";
import { withBase } from "@/lib/base-path";
import { cn } from "@/lib/cn";
import { useBackstage } from "./contexto";
import { EditorMarkdown } from "./editor-markdown";
import type { Campo, Valores } from "./esquemas";
import { prepararImagen } from "./imagenes";
import { esPendiente, leerRuta } from "./valores";

export const INPUT =
  "mt-1.5 block w-full rounded-md border border-linea bg-superficie px-3 py-2 text-[0.95rem] text-tinta focus:border-petroleo focus:outline-none focus:ring-2 focus:ring-petroleo/20";

const idDe = (ruta: string) => `campo-${ruta.replace(/[^a-z0-9]+/gi, "-")}`;

interface Props {
  campos: Campo[];
  valores: unknown;
  onCambio: (ruta: string, valor: unknown) => void;
  errores: Record<string, string>;
  prefijo?: string;
}

/** Dibuja los campos de un esquema (esquemas.ts) y avisa de cada cambio por su ruta. */
export function Formulario({ campos, valores, onCambio, errores, prefijo = "" }: Props) {
  return (
    <div className="space-y-6">
      {campos.map((c) => {
        const ruta = prefijo ? `${prefijo}.${c.nombre}` : c.nombre;
        return <CampoVista key={ruta} campo={c} ruta={ruta} valor={leerRuta(valores, c.nombre)} onCambio={onCambio} errores={errores} />;
      })}
    </div>
  );
}

function Etiqueta({ campo, htmlFor }: { campo: Campo; htmlFor?: string }) {
  return (
    <label htmlFor={htmlFor} className="block text-sm font-semibold text-tinta">
      {campo.etiqueta}
      {campo.obligatorio && <span className="text-teja-texto"> *</span>}
    </label>
  );
}

function Ayuda({ texto }: { texto?: string }) {
  return texto ? <p className="mt-1 text-sm text-tenue">{texto}</p> : null;
}

function MensajeError({ texto }: { texto?: string }) {
  return texto ? (
    <p className="mt-1 text-sm font-medium text-teja-texto" role="alert">
      {texto}
    </p>
  ) : null;
}

function CampoVista({
  campo,
  ruta,
  valor,
  onCambio,
  errores,
}: {
  campo: Campo;
  ruta: string;
  valor: unknown;
  onCambio: Props["onCambio"];
  errores: Record<string, string>;
}) {
  const id = idDe(ruta);
  const texto = typeof valor === "string" ? valor : typeof valor === "number" ? String(valor) : "";

  switch (campo.tipo) {
    case "texto":
    case "url":
    case "correo":
    case "fecha":
      return (
        <div>
          <Etiqueta campo={campo} htmlFor={id} />
          <input
            id={id}
            type={campo.tipo === "fecha" ? "date" : campo.tipo === "url" ? "url" : campo.tipo === "correo" ? "email" : "text"}
            value={texto}
            placeholder={campo.tipo === "url" ? "https://" : campo.ejemplo}
            onChange={(e) => onCambio(ruta, e.target.value)}
            className={cn(INPUT, errores[ruta] && "border-teja")}
          />
          <Ayuda texto={campo.ayuda} />
          <MensajeError texto={errores[ruta]} />
        </div>
      );
    case "numero":
      return (
        <div>
          <Etiqueta campo={campo} htmlFor={id} />
          <input
            id={id}
            type="number"
            inputMode="numeric"
            value={texto}
            onChange={(e) => onCambio(ruta, e.target.value === "" ? undefined : Number(e.target.value))}
            className={cn(INPUT, "max-w-[10rem]", errores[ruta] && "border-teja")}
          />
          <Ayuda texto={campo.ayuda} />
          <MensajeError texto={errores[ruta]} />
        </div>
      );
    case "parrafo":
      return (
        <div>
          <Etiqueta campo={campo} htmlFor={id} />
          <textarea
            id={id}
            rows={3}
            value={texto}
            placeholder={campo.ejemplo}
            onChange={(e) => onCambio(ruta, e.target.value)}
            className={cn(INPUT, "resize-y", errores[ruta] && "border-teja")}
          />
          <Ayuda texto={campo.ayuda} />
          <MensajeError texto={errores[ruta]} />
        </div>
      );
    case "seleccion":
      return (
        <div>
          <Etiqueta campo={campo} htmlFor={id} />
          <select id={id} value={texto} onChange={(e) => onCambio(ruta, e.target.value)} className={cn(INPUT, errores[ruta] && "border-teja")}>
            {!campo.obligatorio || !texto ? <option value="">Elige una opción</option> : null}
            {campo.opciones.map((o) => (
              <option key={o.valor} value={o.valor}>
                {o.etiqueta}
              </option>
            ))}
          </select>
          <Ayuda texto={campo.ayuda} />
          <MensajeError texto={errores[ruta]} />
        </div>
      );
    case "booleano":
      return (
        <label className="flex items-center gap-2.5 text-sm font-semibold text-tinta">
          <input type="checkbox" checked={valor === true} onChange={(e) => onCambio(ruta, e.target.checked)} className="h-4 w-4 accent-petroleo" />
          {campo.etiqueta}
        </label>
      );
    case "bilingue": {
      const Control = campo.largo ? "textarea" : "input";
      return (
        <fieldset>
          <legend className="block text-sm font-semibold text-tinta">
            {campo.etiqueta}
            {campo.obligatorio && <span className="text-teja-texto"> *</span>}
          </legend>
          <div className="mt-1.5 grid gap-3 md:grid-cols-2">
            {(["es", "en"] as const).map((l) => (
              <div key={l}>
                <label htmlFor={`${id}-${l}`} className="text-xs font-semibold text-tenue">
                  {l === "es" ? "Español" : "Inglés"}
                </label>
                <Control
                  id={`${id}-${l}`}
                  value={String(leerRuta(valor, l) ?? "")}
                  onChange={(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => onCambio(`${ruta}.${l}`, e.target.value)}
                  {...(campo.largo ? { rows: 3 } : {})}
                  className={cn(INPUT, "mt-1", campo.largo && "resize-y", l === "es" && errores[`${ruta}.es`] && "border-teja")}
                />
              </div>
            ))}
          </div>
          <Ayuda texto={campo.ayuda} />
          <MensajeError texto={errores[`${ruta}.es`]} />
        </fieldset>
      );
    }
    case "grupo":
      return (
        <fieldset className="rounded-lg border border-linea bg-pagina p-4 sm:p-5">
          <legend className="px-1 font-display text-base font-bold text-tinta">{campo.etiqueta}</legend>
          {campo.ayuda && <p className="-mt-1 mb-4 text-sm text-tenue">{campo.ayuda}</p>}
          <Formulario campos={campo.campos} valores={valor ?? {}} onCambio={onCambio} errores={errores} prefijo={ruta} />
        </fieldset>
      );
    case "lista":
      return <CampoLista campo={campo} ruta={ruta} valor={valor} onCambio={onCambio} errores={errores} />;
    case "imagen":
      return <CampoImagen campo={campo} ruta={ruta} valor={valor} onCambio={onCambio} />;
    case "markdown":
      return (
        <div>
          <Etiqueta campo={campo} htmlFor={id} />
          <EditorMarkdown id={id} valor={texto} onCambio={(v) => onCambio(ruta, v)} carpeta={campo.carpeta} />
          <Ayuda texto={campo.ayuda} />
        </div>
      );
  }
}

function CampoLista({
  campo,
  ruta,
  valor,
  onCambio,
  errores,
}: {
  campo: Extract<Campo, { tipo: "lista" }>;
  ruta: string;
  valor: unknown;
  onCambio: Props["onCambio"];
  errores: Record<string, string>;
}) {
  const items = Array.isArray(valor) ? (valor as Valores[]) : [];
  const [abierto, setAbierto] = useState<number | null>(null);
  const conError = (i: number) => Object.keys(errores).some((k) => k.startsWith(`${ruta}.${i}.`));
  const mover = (i: number, d: number) => {
    const copia = [...items];
    [copia[i], copia[i + d]] = [copia[i + d], copia[i]];
    onCambio(ruta, copia);
    setAbierto(i + d);
  };

  return (
    <fieldset>
      <legend className="block text-sm font-semibold text-tinta">{campo.etiqueta}</legend>
      <Ayuda texto={campo.ayuda} />
      <ul className="mt-2 space-y-2">
        {items.map((item, i) => (
          <li key={i} className={cn("rounded-lg border bg-superficie", conError(i) ? "border-teja" : "border-linea")}>
            <div className="flex items-center gap-1 px-3 py-2">
              <button
                type="button"
                onClick={() => setAbierto(abierto === i ? null : i)}
                className="flex min-w-0 flex-1 items-center gap-2 text-left text-sm font-medium text-tinta"
                aria-expanded={abierto === i}
              >
                <ChevronDown className={cn("h-4 w-4 shrink-0 text-tenue transition-transform", abierto === i && "rotate-180")} aria-hidden />
                <span className="truncate">{campo.resumen(item) || `Nuevo ${campo.elemento}`}</span>
              </button>
              <button type="button" disabled={i === 0} onClick={() => mover(i, -1)} className="rounded p-1.5 text-tenue hover:bg-tintado disabled:opacity-30" title="Subir">
                <ArrowUp className="h-4 w-4" aria-hidden />
                <span className="sr-only">Subir</span>
              </button>
              <button
                type="button"
                disabled={i === items.length - 1}
                onClick={() => mover(i, 1)}
                className="rounded p-1.5 text-tenue hover:bg-tintado disabled:opacity-30"
                title="Bajar"
              >
                <ArrowDown className="h-4 w-4" aria-hidden />
                <span className="sr-only">Bajar</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  onCambio(
                    ruta,
                    items.filter((_, j) => j !== i),
                  );
                  setAbierto(null);
                }}
                className="rounded p-1.5 text-tenue hover:bg-tintado hover:text-teja-texto"
                title={`Quitar ${campo.elemento}`}
              >
                <Trash2 className="h-4 w-4" aria-hidden />
                <span className="sr-only">Quitar {campo.elemento}</span>
              </button>
            </div>
            {abierto === i && (
              <div className="border-t border-linea p-4">
                <Formulario campos={campo.campos} valores={item} onCambio={onCambio} errores={errores} prefijo={`${ruta}.${i}`} />
              </div>
            )}
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => {
          onCambio(ruta, [...items, {}]);
          setAbierto(items.length);
        }}
        className="boton-contorno mt-3"
      >
        <Plus className="h-4 w-4" aria-hidden />
        Añadir {campo.elemento}
      </button>
      <MensajeError texto={errores[ruta]} />
    </fieldset>
  );
}

function CampoImagen({
  campo,
  ruta,
  valor,
  onCambio,
}: {
  campo: Extract<Campo, { tipo: "imagen" }>;
  ruta: string;
  valor: unknown;
  onCambio: Props["onCambio"];
}) {
  const { vistaPrevia } = useBackstage();
  const input = useRef<HTMLInputElement>(null);
  const [preparando, setPreparando] = useState(false);
  const [error, setError] = useState("");
  const src = esPendiente(valor) ? valor.url : typeof valor === "string" && valor ? (vistaPrevia[valor] ?? withBase(valor)) : "";

  async function elegir(file: File | undefined) {
    if (!file) return;
    setError("");
    setPreparando(true);
    try {
      const { blob, url } = await prepararImagen(file, { max: campo.max, cuadrada: campo.cuadrada });
      onCambio(ruta, { pendiente: true, blob, url });
    } catch (e) {
      setError(e instanceof Error ? e.message : "No se ha podido preparar la imagen");
    } finally {
      setPreparando(false);
      if (input.current) input.current.value = "";
    }
  }

  return (
    <div>
      <Etiqueta campo={campo} />
      <div className="mt-1.5 flex flex-wrap items-center gap-4">
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={src}
            alt=""
            className={cn("rounded-md border border-linea bg-pagina object-cover", campo.cuadrada ? "h-24 w-24" : "h-28 w-44")}
          />
        ) : (
          <div
            className={cn(
              "flex items-center justify-center rounded-md border border-dashed border-linea bg-pagina text-tenue",
              campo.cuadrada ? "h-24 w-24" : "h-28 w-44",
            )}
          >
            <ImagePlus className="h-6 w-6" aria-hidden />
          </div>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => input.current?.click()} className="boton-contorno" disabled={preparando}>
            {preparando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {src ? "Cambiar imagen" : "Elegir imagen"}
          </button>
          {src && (
            <button type="button" onClick={() => onCambio(ruta, undefined)} className="boton-contorno">
              Quitar
            </button>
          )}
        </div>
        <input ref={input} type="file" accept="image/*" className="hidden" onChange={(e) => elegir(e.target.files?.[0])} />
      </div>
      {esPendiente(valor) && <p className="mt-1 text-sm text-tenue">Se subirá al guardar.</p>}
      <Ayuda texto={campo.ayuda} />
      <MensajeError texto={error} />
    </div>
  );
}
