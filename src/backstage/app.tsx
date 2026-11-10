"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpenText,
  CheckCircle2,
  ExternalLink,
  FileText,
  History,
  Loader2,
  LogOut,
  Newspaper,
  Plus,
  RefreshCw,
  TriangleAlert,
  Users,
} from "lucide-react";
import { slugify } from "../../scripts/comun.mjs";
import { iniciales } from "@/content/equipo-base";
import { withBase } from "@/lib/base-path";
import { cn } from "@/lib/cn";
import { Contexto } from "./contexto";
import { ARCHIVOS, COLECCIONES, type ArchivoUnico, type Coleccion, type Valores } from "./esquemas";
import { Formulario, INPUT } from "./formulario";
import { borrar, EN_SOLIS, estadoPublicacion, guardar, leer, listar, MODO_LOCAL, type EstadoPublicacion } from "./github";
import { entrar, salir, sesionGuardada, type Sesion } from "./sesion";
import { esPendiente, escribirRuta, limpiar, validar } from "./valores";

type SeccionId = Coleccion["id"] | ArchivoUnico["id"];

interface EntradaCol {
  path: string;
  sha: string;
  valores: Valores | null;
  error?: string;
}

type Edicion =
  | { tipo: "coleccion"; col: Coleccion; entrada: EntradaCol | null; valores: Valores; original: Valores; errores: Record<string, string> }
  | { tipo: "archivo"; arch: ArchivoUnico; sha: string; valores: Valores; original: Valores; errores: Record<string, string> };

const SECCIONES: { id: SeccionId; titulo: string; Icon: typeof Newspaper }[] = [
  { id: "noticias", titulo: "Noticias", Icon: Newspaper },
  { id: "publicaciones", titulo: "Publicaciones", Icon: BookOpenText },
  { id: "equipo", titulo: "Equipo", Icon: Users },
  { id: "textos", titulo: "Textos del proyecto", Icon: FileText },
  { id: "trayectoria", titulo: "Trayectoria", Icon: History },
];

const mensajeDe = (e: unknown) => (e instanceof Error ? e.message : "Ha ocurrido un error inesperado.");

/** Lee muchos archivos sin lanzar todas las peticiones a la vez. */
async function enParalelo<T, R>(items: T[], n: number, fn: (x: T) => Promise<R>): Promise<R[]> {
  const out: R[] = new Array(items.length);
  let i = 0;
  await Promise.all(
    Array.from({ length: Math.min(n, items.length) }, async () => {
      while (i < items.length) {
        const j = i++;
        out[j] = await fn(items[j]);
      }
    }),
  );
  return out;
}

export default function Backstage() {
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);
  useEffect(() => {
    setSesion(sesionGuardada());
    setListo(true);
  }, []);
  if (!listo) return null;
  if (!sesion) return <Acceso onEntrar={setSesion} />;
  return (
    <Panel
      sesion={sesion}
      onSalir={() => {
        salir();
        setSesion(null);
      }}
    />
  );
}

// ── Entrada ────────────────────────────────────────────────────────────────
function Acceso({ onEntrar }: { onEntrar: (s: Sesion) => void }) {
  const [clave, setClave] = useState("");
  const [comprobando, setComprobando] = useState(false);
  const [error, setError] = useState("");

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    if (!clave) return;
    setError("");
    setComprobando(true);
    try {
      onEntrar(await entrar(clave));
    } catch (err) {
      setError(mensajeDe(err));
      setClave("");
    } finally {
      setComprobando(false);
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center bg-pagina px-4 py-12">
      <form onSubmit={enviar} className="tarjeta w-full max-w-sm p-7">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={withBase("/brand/quality-logo.png")} alt="QUALITY" className="h-10 w-auto dark:hidden" />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={withBase("/brand/quality-logo-claro.png")} alt="QUALITY" className="hidden h-10 w-auto dark:block" />
        <h1 className="mt-6 text-2xl font-extrabold">Backstage</h1>
        <p className="mt-1 text-sm text-cuerpo">Edición de la web del proyecto.</p>
        {MODO_LOCAL && <p className="mt-3 rounded-md bg-tintado px-3 py-2 text-sm text-cuerpo">Modo local: se usa el acceso de prueba.</p>}
        <label htmlFor="clave" className="mt-6 block text-sm font-semibold text-tinta">
          Contraseña
        </label>
        <input
          id="clave"
          type="password"
          autoComplete="current-password"
          autoFocus
          value={clave}
          onChange={(e) => setClave(e.target.value)}
          className={INPUT}
        />
        {error && (
          <p className="mt-2 text-sm font-medium text-teja-texto" role="alert">
            {error}
          </p>
        )}
        <button type="submit" disabled={comprobando || !clave} className="boton-primario mt-5 w-full disabled:opacity-60">
          {comprobando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
          {comprobando ? "Comprobando…" : "Entrar"}
        </button>
        <a href={withBase("/")} className="enlace mt-5 inline-block text-sm">
          Volver a la web
        </a>
      </form>
    </main>
  );
}

// ── Panel ──────────────────────────────────────────────────────────────────
function Panel({ sesion, onSalir }: { sesion: Sesion; onSalir: () => void }) {
  const { token, nombre } = sesion;
  const [seccion, setSeccion] = useState<SeccionId>("noticias");
  const [listas, setListas] = useState<Partial<Record<Coleccion["id"], { cargando: boolean; entradas: EntradaCol[]; error?: string }>>>({});
  const [edicion, setEdicion] = useState<Edicion | null>(null);
  const [cargandoArchivo, setCargandoArchivo] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState<{ tipo: "ok" | "error"; texto: string } | null>(null);
  const [publicacion, setPublicacion] = useState<{ commit: string; texto: string; estado: EstadoPublicacion; intentos: number } | null>(null);
  const [vistaPrevia, setVistaPrevia] = useState<Record<string, string>>({});
  const [salirSinGuardar, setSalirSinGuardar] = useState<(() => void) | null>(null);
  const [confirmarBorrado, setConfirmarBorrado] = useState(false);

  const col = COLECCIONES.find((c) => c.id === seccion);
  const arch = ARCHIVOS.find((a) => a.id === seccion);
  const sucio = !!edicion && JSON.stringify(edicion.valores) !== JSON.stringify(edicion.original);
  const firma = (accion: string, path: string) => `Backstage (${nombre}): ${accion} ${path}`;

  // Aviso del navegador al cerrar con cambios sin guardar
  useEffect(() => {
    if (!sucio) return;
    const aviso = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", aviso);
    return () => window.removeEventListener("beforeunload", aviso);
  }, [sucio]);

  const cargarColeccion = useCallback(
    async (c: Coleccion) => {
      setListas((l) => ({ ...l, [c.id]: { cargando: true, entradas: l[c.id]?.entradas ?? [] } }));
      try {
        const archivos = (await listar(token, c.carpeta)).filter((f) => f.type === "file" && f.name.endsWith(c.extension));
        const entradas = await enParalelo(archivos, 6, async (f): Promise<EntradaCol> => {
          try {
            const { texto, sha } = await leer(token, f.path);
            return { path: f.path, sha, valores: c.leer(texto) };
          } catch (e) {
            return { path: f.path, sha: f.sha, valores: null, error: mensajeDe(e) };
          }
        });
        setListas((l) => ({ ...l, [c.id]: { cargando: false, entradas } }));
      } catch (e) {
        setListas((l) => ({ ...l, [c.id]: { cargando: false, entradas: [], error: mensajeDe(e) } }));
      }
    },
    [token],
  );

  const cargarArchivo = useCallback(
    async (a: ArchivoUnico) => {
      setCargandoArchivo(true);
      try {
        const { texto, sha } = await leer(token, a.path);
        const valores = a.leer(texto);
        setEdicion({ tipo: "archivo", arch: a, sha, valores, original: valores, errores: {} });
      } catch (e) {
        setMensaje({ tipo: "error", texto: mensajeDe(e) });
      } finally {
        setCargandoArchivo(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (col && !listas[col.id]) cargarColeccion(col);
    if (arch && (edicion?.tipo !== "archivo" || edicion.arch.id !== arch.id)) cargarArchivo(arch);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seccion]);

  // Sigue la publicación del último cambio
  useEffect(() => {
    if (!publicacion || !["esperando", "en-curso"].includes(publicacion.estado) || publicacion.intentos > 90) return;
    const t = setTimeout(
      async () => {
        let estado: EstadoPublicacion = publicacion.estado;
        try {
          estado = await estadoPublicacion(token, publicacion.commit);
        } catch {
          /* se vuelve a intentar */
        }
        setPublicacion((p) => (p && p.commit === publicacion.commit ? { ...p, estado, intentos: p.intentos + 1 } : p));
      },
      MODO_LOCAL ? 800 : EN_SOLIS ? 1500 : 4000,
    );
    return () => clearTimeout(t);
  }, [publicacion, token]);

  /** Pide confirmación si hay cambios sin guardar antes de cambiar de pantalla. */
  function irA(accion: () => void) {
    if (sucio) setSalirSinGuardar(() => accion);
    else accion();
  }

  function cambiarSeccion(id: SeccionId) {
    irA(() => {
      setMensaje(null);
      setConfirmarBorrado(false);
      setEdicion(null);
      setSeccion(id);
    });
  }

  function abrir(c: Coleccion, entrada: EntradaCol | null) {
    const valores = entrada?.valores ?? c.inicial();
    setMensaje(null);
    setConfirmarBorrado(false);
    setEdicion({ tipo: "coleccion", col: c, entrada, valores, original: valores, errores: {} });
    window.scrollTo({ top: 0 });
  }

  const cambiar = (ruta: string, valor: unknown) =>
    setEdicion((e) => (e ? { ...e, valores: escribirRuta(e.valores, ruta, valor) } : e));

  /** Sube una imagen ya preparada y devuelve su ruta pública (/media/…). */
  const subirBlob = useCallback(
    async (blob: Blob, carpeta: string, base: string) => {
      const path = `${carpeta}/${slugify(base).slice(0, 40) || "imagen"}-${Date.now().toString(36)}.jpg`;
      await guardar(token, path, new Uint8Array(await blob.arrayBuffer()), firma("sube", path));
      const ruta = path.replace(/^public/, "");
      setVistaPrevia((v) => ({ ...v, [ruta]: URL.createObjectURL(blob) }));
      return ruta;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [token, nombre],
  );

  /** Borra una imagen de /media/ que ya no se usa (si falla, se queda: no es grave). */
  async function borrarMedia(ruta: string) {
    if (!ruta.startsWith("/media/")) return;
    try {
      const path = `public${ruta}`;
      const carpeta = path.slice(0, path.lastIndexOf("/"));
      const f = (await listar(token, carpeta)).find((x) => x.path === path);
      if (f) await borrar(token, path, f.sha, firma("borra", path));
    } catch {
      /* sin importancia */
    }
  }

  function rutaLibre(c: Coleccion, base: string) {
    const usadas = new Set((listas[c.id]?.entradas ?? []).map((e) => e.path));
    let path = `${c.carpeta}/${base || "sin-titulo"}${c.extension}`;
    for (let i = 2; usadas.has(path); i++) path = `${c.carpeta}/${base}-${i}${c.extension}`;
    return path;
  }

  async function guardarEdicion() {
    if (!edicion) return;
    const campos = edicion.tipo === "coleccion" ? edicion.col.campos : edicion.arch.campos;
    const errores = validar(campos, edicion.valores);
    if (Object.keys(errores).length) {
      setEdicion({ ...edicion, errores });
      setMensaje({ tipo: "error", texto: "Revisa los campos marcados en naranja." });
      return;
    }
    setGuardando(true);
    setMensaje(null);
    setPublicacion(null);
    try {
      if (edicion.tipo === "coleccion") {
        const { col: c, entrada } = edicion;
        const valores: Valores = { ...edicion.valores };
        const sobran: string[] = [];
        for (const campo of c.campos) {
          if (campo.tipo !== "imagen") continue;
          const v = valores[campo.nombre];
          if (esPendiente(v)) valores[campo.nombre] = await subirBlob(v.blob, campo.carpeta, c.etiqueta(valores));
          const antes = entrada?.valores?.[campo.nombre];
          if (typeof antes === "string" && antes !== valores[campo.nombre]) sobran.push(antes);
        }
        const path = entrada?.path ?? rutaLibre(c, c.archivo(valores));
        const r = await guardar(token, path, c.escribir(limpiar(valores) as Valores), firma(entrada ? "edita" : "añade", path), entrada?.sha);
        setPublicacion({ commit: r.commit, texto: c.etiqueta(valores), estado: "esperando", intentos: 0 });
        for (const ruta of sobran) await borrarMedia(ruta);
        setEdicion(null);
        setMensaje({ tipo: "ok", texto: entrada ? "Cambios guardados." : "Añadido." });
        cargarColeccion(c);
      } else {
        const { arch: a } = edicion;
        const r = await guardar(token, a.path, a.escribir((limpiar(edicion.valores) as Valores) ?? {}), firma("edita", a.path), edicion.sha);
        setPublicacion({ commit: r.commit, texto: a.titulo, estado: "esperando", intentos: 0 });
        setEdicion({ ...edicion, sha: r.sha, original: edicion.valores, errores: {} });
        setMensaje({ tipo: "ok", texto: "Cambios guardados." });
      }
    } catch (e) {
      setMensaje({ tipo: "error", texto: mensajeDe(e) });
    } finally {
      setGuardando(false);
    }
  }

  async function borrarEntrada() {
    if (edicion?.tipo !== "coleccion" || !edicion.entrada) return;
    const { col: c, entrada } = edicion;
    setGuardando(true);
    setMensaje(null);
    setPublicacion(null);
    try {
      const r = await borrar(token, entrada.path, entrada.sha, firma("borra", entrada.path));
      setPublicacion({ commit: r.commit, texto: `Borrado: ${c.etiqueta(entrada.valores ?? {})}`, estado: "esperando", intentos: 0 });
      for (const campo of c.campos) {
        const v = entrada.valores?.[campo.nombre];
        if (campo.tipo === "imagen" && typeof v === "string") await borrarMedia(v);
      }
      setEdicion(null);
      setConfirmarBorrado(false);
      setMensaje({ tipo: "ok", texto: "Borrado." });
      cargarColeccion(c);
    } catch (e) {
      setMensaje({ tipo: "error", texto: mensajeDe(e) });
    } finally {
      setGuardando(false);
    }
  }

  const contexto = useMemo(
    () => ({ subirImagen: (blob: Blob, carpeta: string, base: string) => subirBlob(blob, carpeta, base), vistaPrevia }),
    [subirBlob, vistaPrevia],
  );

  return (
    <Contexto.Provider value={contexto}>
      <div className="min-h-dvh bg-pagina">
        {/* Cabecera */}
        <header className="bg-inverso text-white">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3 sm:px-6">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={withBase("/brand/quality-logo-claro.png")} alt="QUALITY" className="h-8 w-auto" />
            <span className="font-display text-lg font-bold">Backstage</span>
            <div className="ml-auto flex items-center gap-4 text-sm text-white/80">
              <span className="hidden sm:inline">{nombre}</span>
              <a href={withBase("/")} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white">
                Ver la web
                <ExternalLink className="h-3.5 w-3.5" aria-hidden />
              </a>
              <button type="button" onClick={() => irA(onSalir)} className="inline-flex items-center gap-1.5 hover:text-white">
                <LogOut className="h-4 w-4" aria-hidden />
                Salir
              </button>
            </div>
          </div>
        </header>

        {MODO_LOCAL && (
          <p className="bg-tintado px-4 py-2 text-center text-sm text-cuerpo">
            Modo local: los cambios se guardan en esta copia de la web, no en GitHub.
          </p>
        )}

        {publicacion && <AvisoPublicacion publicacion={publicacion} onCerrar={() => setPublicacion(null)} />}

        <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 sm:px-6 md:grid-cols-[13rem_1fr] md:py-8">
          {/* Secciones */}
          <nav aria-label="Secciones" className="min-w-0 md:sticky md:top-6 md:self-start">
            <ul className="flex gap-1 overflow-x-auto md:flex-col">
              {SECCIONES.map(({ id, titulo, Icon }) => (
                <li key={id}>
                  <button
                    type="button"
                    onClick={() => cambiarSeccion(id)}
                    aria-current={seccion === id ? "page" : undefined}
                    className={cn(
                      "flex w-full items-center gap-2.5 whitespace-nowrap rounded-md px-3 py-2 text-left text-sm font-semibold",
                      seccion === id ? "bg-superficie text-petroleo shadow-tarjeta" : "text-cuerpo hover:bg-superficie/60 hover:text-tinta",
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" aria-hidden />
                    {titulo}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <main className="min-w-0">
            {mensaje && (
              <p
                role={mensaje.tipo === "error" ? "alert" : "status"}
                className={cn(
                  "mb-5 flex items-start gap-2 rounded-md border px-4 py-3 text-sm font-medium",
                  mensaje.tipo === "ok" ? "border-verde/40 bg-verde/10 text-tinta" : "border-teja/40 bg-teja/10 text-teja-texto",
                )}
              >
                {mensaje.tipo === "ok" ? <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-verde-texto" aria-hidden /> : <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />}
                {mensaje.texto}
              </p>
            )}

            {edicion?.tipo === "coleccion" ? (
              <section className="tarjeta p-5 sm:p-7">
                <button type="button" onClick={() => irA(() => setEdicion(null))} className="enlace inline-flex items-center gap-1.5 text-sm">
                  <ArrowLeft className="h-4 w-4" aria-hidden />
                  Volver a {edicion.col.titulo.toLowerCase()}
                </button>
                <h1 className="mt-4 text-2xl font-extrabold">
                  {edicion.entrada ? edicion.col.etiqueta(edicion.valores) : edicion.col.nuevo}
                </h1>
                <div className="mt-6">
                  <Formulario campos={edicion.col.campos} valores={edicion.valores} onCambio={cambiar} errores={edicion.errores} />
                </div>
                <Acciones
                  guardando={guardando}
                  sucio={sucio || !edicion.entrada}
                  onGuardar={guardarEdicion}
                  onCancelar={() => irA(() => setEdicion(null))}
                  borrable={!!edicion.entrada}
                  confirmarBorrado={confirmarBorrado}
                  setConfirmarBorrado={setConfirmarBorrado}
                  onBorrar={borrarEntrada}
                />
              </section>
            ) : col ? (
              <ListaColeccion col={col} lista={listas[col.id]} onAbrir={(e) => abrir(col, e)} onRecargar={() => cargarColeccion(col)} />
            ) : arch ? (
              <section className="tarjeta p-5 sm:p-7">
                <h1 className="text-2xl font-extrabold">{arch.titulo}</h1>
                <p className="mt-1 text-sm text-cuerpo">{arch.ayuda}</p>
                {cargandoArchivo || edicion?.tipo !== "archivo" ? (
                  <p className="mt-6 flex items-center gap-2 text-sm text-tenue">
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Cargando…
                  </p>
                ) : (
                  <>
                    <div className="mt-6">
                      <Formulario campos={arch.campos} valores={edicion.valores} onCambio={cambiar} errores={edicion.errores} />
                    </div>
                    <Acciones
                      guardando={guardando}
                      sucio={sucio}
                      onGuardar={guardarEdicion}
                      onCancelar={() => setEdicion({ ...edicion, valores: edicion.original, errores: {} })}
                      textoCancelar="Deshacer los cambios"
                    />
                  </>
                )}
              </section>
            ) : null}
          </main>
        </div>
      </div>

      {salirSinGuardar && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4" role="dialog" aria-modal="true" aria-labelledby="sin-guardar">
          <div className="tarjeta w-full max-w-sm p-6">
            <h2 id="sin-guardar" className="text-lg font-bold">
              Tienes cambios sin guardar
            </h2>
            <p className="mt-2 text-sm text-cuerpo">Si sales ahora, se pierden.</p>
            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                className="boton-primario"
                onClick={() => {
                  setSalirSinGuardar(null);
                  setEdicion((e) => (e ? { ...e, valores: e.original } : e));
                  salirSinGuardar();
                }}
              >
                Descartar los cambios
              </button>
              <button type="button" className="boton-contorno" onClick={() => setSalirSinGuardar(null)}>
                Seguir editando
              </button>
            </div>
          </div>
        </div>
      )}
    </Contexto.Provider>
  );
}

function Acciones({
  guardando,
  sucio,
  onGuardar,
  onCancelar,
  textoCancelar = "Cancelar",
  borrable = false,
  confirmarBorrado = false,
  setConfirmarBorrado,
  onBorrar,
}: {
  guardando: boolean;
  sucio: boolean;
  onGuardar: () => void;
  onCancelar: () => void;
  textoCancelar?: string;
  borrable?: boolean;
  confirmarBorrado?: boolean;
  setConfirmarBorrado?: (v: boolean) => void;
  onBorrar?: () => void;
}) {
  return (
    <div className="sticky bottom-0 -mx-5 mt-8 border-t border-linea bg-superficie/95 px-5 py-4 backdrop-blur sm:-mx-7 sm:px-7">
      {confirmarBorrado ? (
        <div className="flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-tinta">¿Borrar? Desaparece de la web.</p>
          <button type="button" onClick={onBorrar} disabled={guardando} className="boton-primario bg-teja hover:bg-teja-texto">
            {guardando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            Sí, borrar
          </button>
          <button type="button" onClick={() => setConfirmarBorrado?.(false)} className="boton-contorno">
            No
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={onGuardar} disabled={guardando || !sucio} className="boton-primario disabled:opacity-50">
            {guardando && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
            {guardando ? "Guardando…" : "Guardar y publicar"}
          </button>
          <button type="button" onClick={onCancelar} disabled={guardando} className="boton-contorno">
            {textoCancelar}
          </button>
          {borrable && (
            <button
              type="button"
              onClick={() => setConfirmarBorrado?.(true)}
              disabled={guardando}
              className="ml-auto text-sm font-semibold text-teja-texto hover:underline"
            >
              Borrar
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function AvisoPublicacion({
  publicacion,
  onCerrar,
}: {
  publicacion: { texto: string; estado: EstadoPublicacion; intentos: number };
  onCerrar: () => void;
}) {
  const { estado, texto } = publicacion;
  const enCurso = estado === "esperando" || estado === "en-curso";
  const sinRespuesta = enCurso && publicacion.intentos > 90;
  return (
    <div
      role="status"
      className={cn(
        "border-b px-4 py-2.5 text-sm",
        estado === "fallo" ? "border-teja/40 bg-teja/10 text-teja-texto" : estado === "publicado" ? "border-verde/40 bg-verde/10" : "border-linea bg-superficie",
      )}
    >
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-3 gap-y-1 sm:px-2">
        {enCurso && !sinRespuesta && <Loader2 className="h-4 w-4 animate-spin text-petroleo" aria-hidden />}
        {estado === "publicado" && <CheckCircle2 className="h-4 w-4 text-verde-texto" aria-hidden />}
        {estado === "fallo" && <TriangleAlert className="h-4 w-4" aria-hidden />}
        <span className="font-semibold">«{texto}»</span>
        <span>
          {sinRespuesta
            ? "Guardado. La publicación está tardando más de lo normal: mira la web dentro de un rato."
            : enCurso
              ? `Guardado. Publicando la web, suele tardar ${EN_SOLIS ? "unos segundos" : "uno o dos minutos"}…`
              : estado === "publicado"
                ? "Publicado en la web."
                : "Guardado, pero la web no se ha podido publicar: el contenido tiene algún error. Avisa a quien gestiona la web."}
        </span>
        {!enCurso && (
          <button type="button" onClick={onCerrar} className="ml-auto text-sm font-semibold underline-offset-2 hover:underline">
            Cerrar
          </button>
        )}
      </div>
    </div>
  );
}

function ListaColeccion({
  col,
  lista,
  onAbrir,
  onRecargar,
}: {
  col: Coleccion;
  lista?: { cargando: boolean; entradas: EntradaCol[]; error?: string };
  onAbrir: (e: EntradaCol | null) => void;
  onRecargar: () => void;
}) {
  const entradas = [...(lista?.entradas ?? [])].sort((a, b) => (a.valores && b.valores ? col.orden(a.valores, b.valores) : 0));
  const grupos: { nombre: string; entradas: EntradaCol[] }[] = [];
  for (const e of entradas) {
    const g = e.valores && col.grupo ? col.grupo(e.valores) : "";
    const ultimo = grupos[grupos.length - 1];
    if (ultimo && ultimo.nombre === g) ultimo.entradas.push(e);
    else grupos.push({ nombre: g, entradas: [e] });
  }

  return (
    <section className="tarjeta p-5 sm:p-7">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-2xl font-extrabold">{col.titulo}</h1>
        <button type="button" onClick={onRecargar} className="rounded p-1.5 text-tenue hover:bg-tintado hover:text-tinta" title="Recargar">
          <RefreshCw className={cn("h-4 w-4", lista?.cargando && "animate-spin")} aria-hidden />
          <span className="sr-only">Recargar</span>
        </button>
        <button type="button" onClick={() => onAbrir(null)} className="boton-primario ml-auto">
          <Plus className="h-4 w-4" aria-hidden />
          {col.nuevo}
        </button>
      </div>

      {lista?.error && <p className="mt-5 text-sm font-medium text-teja-texto">{lista.error}</p>}
      {lista?.cargando && !entradas.length && (
        <p className="mt-6 flex items-center gap-2 text-sm text-tenue">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> Cargando…
        </p>
      )}
      {!lista?.cargando && !lista?.error && !entradas.length && <p className="mt-6 text-sm text-cuerpo">Todavía no hay nada. Empieza con «{col.nuevo}».</p>}

      <div className="mt-4 space-y-6">
        {grupos.map((g) => (
          <div key={g.nombre || "todo"}>
            {g.nombre && <h2 className="border-b border-linea pb-1.5 text-sm font-bold text-tenue">{g.nombre}</h2>}
            <ul className="divide-y divide-linea">
              {g.entradas.map((e) => (
                <li key={e.path}>
                  <button
                    type="button"
                    onClick={() => e.valores && onAbrir(e)}
                    disabled={!e.valores}
                    className="flex w-full items-center gap-3 py-3 text-left hover:bg-pagina disabled:cursor-not-allowed"
                  >
                    {col.id === "equipo" && e.valores && <Avatar foto={e.valores.foto} nombre={String(e.valores.nombre ?? "")} />}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold text-tinta">{e.valores ? col.etiqueta(e.valores) : e.path}</span>
                      <span className="block truncate text-sm text-tenue">
                        {e.valores ? col.detalle(e.valores) : `No se puede leer: ${e.error}`}
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

function Avatar({ foto, nombre }: { foto: unknown; nombre: string }) {
  return typeof foto === "string" && foto ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={withBase(foto)} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" loading="lazy" />
  ) : (
    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-tintado text-xs font-bold text-petroleo">
      {iniciales(nombre)}
    </span>
  );
}
