import { escribirNoticia, leerNoticia, slugify } from "../../scripts/comun.mjs";
import instituciones from "@/content/instituciones.json";
import { ROLES, type Rol } from "@/content/equipo-base";
import { TIPOS, type TipoPublicacion } from "@/content/publicaciones-base";

/**
 * Qué se edita en el backstage y cómo: los campos de cada formulario y cómo
 * se leen y escriben los archivos de contenido/ (los mismos que comprueba
 * scripts/contenido.mjs al publicar).
 */

export type Valores = Record<string, unknown>;

interface Base {
  nombre: string;
  etiqueta: string;
  ayuda?: string;
  obligatorio?: boolean;
}
export type Campo =
  | (Base & { tipo: "texto" | "parrafo" | "url" | "correo" | "fecha" | "numero"; ejemplo?: string })
  | (Base & { tipo: "seleccion"; opciones: { valor: string; etiqueta: string }[] })
  | (Base & { tipo: "bilingue"; largo?: boolean })
  | (Base & { tipo: "booleano" })
  | (Base & { tipo: "grupo"; campos: Campo[] })
  | (Base & { tipo: "lista"; campos: Campo[]; elemento: string; resumen: (v: Valores) => string })
  | (Base & { tipo: "imagen"; carpeta: string; cuadrada?: boolean; max: number })
  | (Base & { tipo: "markdown"; carpeta: string });

export interface Coleccion {
  id: "noticias" | "publicaciones" | "equipo";
  titulo: string;
  /** «Añadir …» */
  nuevo: string;
  carpeta: string;
  extension: ".md" | ".json";
  campos: Campo[];
  inicial: () => Valores;
  /** Nombre de archivo para una entrada nueva (sin extensión) */
  archivo: (v: Valores) => string;
  etiqueta: (v: Valores) => string;
  detalle: (v: Valores) => string;
  /** Grupo en la lista (opcional) y orden dentro */
  grupo?: (v: Valores) => string;
  orden: (a: Valores, b: Valores) => number;
  leer: (texto: string) => Valores;
  escribir: (v: Valores) => string;
}

export interface ArchivoUnico {
  id: "textos" | "trayectoria";
  titulo: string;
  ayuda: string;
  path: string;
  campos: Campo[];
  leer: (texto: string) => Valores;
  escribir: (v: Valores) => string;
}

const s = (v: unknown) => (typeof v === "string" ? v : typeof v === "number" ? String(v) : "");
const json = (v: Valores) => JSON.stringify(v, null, 2) + "\n";
const hoy = () => new Date().toISOString().slice(0, 10);

// ── Noticias ─────────────────────────────────────────────────────────────
export const NOTICIAS: Coleccion = {
  id: "noticias",
  titulo: "Noticias",
  nuevo: "Añadir noticia",
  carpeta: "contenido/noticias",
  extension: ".md",
  campos: [
    { tipo: "texto", nombre: "titulo", etiqueta: "Título", obligatorio: true },
    { tipo: "fecha", nombre: "fecha", etiqueta: "Fecha", obligatorio: true },
    {
      tipo: "parrafo",
      nombre: "resumen",
      etiqueta: "Resumen",
      obligatorio: true,
      ayuda: "Una o dos frases. Sale en la lista de noticias, en la portada y en los buscadores.",
    },
    {
      tipo: "imagen",
      nombre: "imagen",
      etiqueta: "Imagen principal (opcional)",
      ayuda: "Mejor horizontal. Se reduce sola a 1600 px al subirla.",
      carpeta: "public/media/noticias",
      max: 1600,
    },
    {
      tipo: "texto",
      nombre: "imagen_alt",
      etiqueta: "Descripción de la imagen",
      ayuda: "Qué se ve en la imagen, para quien no puede verla (lectores de pantalla).",
    },
    { tipo: "markdown", nombre: "body", etiqueta: "Texto de la noticia", carpeta: "public/media/noticias" },
    {
      tipo: "grupo",
      nombre: "ingles",
      etiqueta: "Versión en inglés (opcional)",
      ayuda: "Si se deja vacía, la web en inglés muestra la noticia en español con un aviso.",
      campos: [
        { tipo: "texto", nombre: "titulo", etiqueta: "Título en inglés" },
        { tipo: "parrafo", nombre: "resumen", etiqueta: "Resumen en inglés" },
        { tipo: "markdown", nombre: "texto", etiqueta: "Texto en inglés", carpeta: "public/media/noticias" },
      ],
    },
  ],
  inicial: () => ({ fecha: hoy() }),
  archivo: (v) => `${s(v.fecha) || hoy()}-${slugify(s(v.titulo)).slice(0, 60).replace(/-$/, "")}`,
  etiqueta: (v) => s(v.titulo) || "(sin título)",
  detalle: (v) => fechaCorta(s(v.fecha)),
  orden: (a, b) => s(b.fecha).localeCompare(s(a.fecha)),
  leer: (texto) => {
    const { cabecera, cuerpo } = leerNoticia(texto);
    return { ...cabecera, body: cuerpo };
  },
  escribir: (v) => {
    const { body, ...cabecera } = v;
    return escribirNoticia(cabecera, s(body));
  },
};

// ── Publicaciones ────────────────────────────────────────────────────────
const NOMBRE_TIPO: Record<TipoPublicacion, string> = {
  articulo: "Artículo de revista",
  capitulo: "Capítulo de libro",
  libro: "Libro",
  congreso: "Comunicación en congreso",
  informe: "Informe",
};

export const PUBLICACIONES: Coleccion = {
  id: "publicaciones",
  titulo: "Publicaciones",
  nuevo: "Añadir publicación",
  carpeta: "contenido/publicaciones",
  extension: ".json",
  campos: [
    { tipo: "numero", nombre: "anio", etiqueta: "Año", obligatorio: true },
    {
      tipo: "seleccion",
      nombre: "tipo",
      etiqueta: "Tipo",
      obligatorio: true,
      opciones: (Object.keys(TIPOS) as TipoPublicacion[]).map((t) => ({ valor: t, etiqueta: NOMBRE_TIPO[t] })),
    },
    {
      tipo: "texto",
      nombre: "autores",
      etiqueta: "Autoría",
      obligatorio: true,
      ayuda: "Como se cita, en APA.",
      ejemplo: "Rodríguez-Conde, M.-J., Olmos-Migueláñez, S., & Conley-Torres, C.",
    },
    { tipo: "texto", nombre: "titulo", etiqueta: "Título", obligatorio: true },
    {
      tipo: "texto",
      nombre: "medio",
      etiqueta: "Revista, libro, actas o congreso",
      obligatorio: true,
      ayuda: "Sale en cursiva. Para un congreso, su nombre; para un capítulo, el título del libro o de las actas.",
    },
    {
      tipo: "texto",
      nombre: "editores",
      etiqueta: "Editores (opcional)",
      ayuda: "Solo para capítulos y actas, sin «(Eds.)».",
      ejemplo: "M. Feixas, S. Olmos-Migueláñez, & M. García-Herrero",
    },
    { tipo: "texto", nombre: "paginas", etiqueta: "Páginas (opcional)", ejemplo: "101–103" },
    { tipo: "bilingue", nombre: "lugar", etiqueta: "Lugar del congreso (opcional)", ayuda: "Ciudad y país: «Oporto (Portugal)»." },
    { tipo: "texto", nombre: "isbn", etiqueta: "ISBN (opcional)" },
    { tipo: "texto", nombre: "doi", etiqueta: "DOI (opcional)", ayuda: "Solo el código.", ejemplo: "10.1234/abcd.5678" },
    {
      tipo: "url",
      nombre: "actas",
      etiqueta: "Enlace a las actas (opcional)",
      ayuda: "Dirección del PDF; con #page=N al final se abre en la página de la comunicación.",
    },
    { tipo: "url", nombre: "accesoAbierto", etiqueta: "Versión en acceso abierto (opcional)", ayuda: "GREDOS, Zenodo u otro repositorio." },
    {
      tipo: "numero",
      nombre: "orden",
      etiqueta: "Orden (opcional)",
      ayuda: "Para ordenar dentro del mismo año y tipo: los números menores salen antes.",
    },
  ],
  inicial: () => ({ anio: new Date().getFullYear(), tipo: "congreso" }),
  archivo: (v) => `${s(v.anio)}-${slugify(s(v.titulo)).slice(0, 60).replace(/-$/, "")}`,
  etiqueta: (v) => s(v.titulo) || "(sin título)",
  detalle: (v) => [NOMBRE_TIPO[v.tipo as TipoPublicacion], s(v.medio)].filter(Boolean).join(", "),
  grupo: (v) => s(v.anio),
  orden: (a, b) =>
    Number(b.anio) - Number(a.anio) || (Number(a.orden ?? Infinity) - Number(b.orden ?? Infinity) || 0) || s(a.titulo).localeCompare(s(b.titulo), "es"),
  leer: (texto) => JSON.parse(texto),
  escribir: json,
};

// ── Equipo ───────────────────────────────────────────────────────────────
const ORDEN_ROLES: Rol[] = ["ip", "investigador", "contrato", "trabajo"];

export const EQUIPO: Coleccion = {
  id: "equipo",
  titulo: "Equipo",
  nuevo: "Añadir persona",
  carpeta: "contenido/equipo",
  extension: ".json",
  campos: [
    { tipo: "texto", nombre: "nombre", etiqueta: "Nombre y apellidos", obligatorio: true },
    {
      tipo: "seleccion",
      nombre: "rol",
      etiqueta: "Papel en el proyecto",
      obligatorio: true,
      opciones: ORDEN_ROLES.map((r) => ({ valor: r, etiqueta: r === "ip" ? "Investigadora o investigador principal" : ROLES[r].singular.es })),
    },
    {
      tipo: "seleccion",
      nombre: "institucion",
      etiqueta: "Institución",
      obligatorio: true,
      ayuda: "Si falta alguna, pídesela a quien gestiona la web.",
      opciones: instituciones.map((i) => ({ valor: i.id, etiqueta: i.name.es })),
    },
    { tipo: "url", nombre: "perfil", etiqueta: "Perfil (opcional)", ayuda: "Ficha en el Portal de Investigación, ORCID, Google Scholar…" },
    {
      tipo: "imagen",
      nombre: "foto",
      etiqueta: "Foto (opcional)",
      ayuda: "Se recorta en cuadrado por el centro y se reduce a 480 px. Sin foto, salen las iniciales.",
      carpeta: "public/media/equipo",
      cuadrada: true,
      max: 480,
    },
    {
      tipo: "numero",
      nombre: "orden",
      etiqueta: "Orden (opcional)",
      ayuda: "Para ordenar dentro de su grupo: los números menores salen antes. Vacío, va al final.",
    },
  ],
  inicial: () => ({ rol: "trabajo", institucion: "usal" }),
  archivo: (v) => slugify(s(v.nombre)),
  etiqueta: (v) => s(v.nombre) || "(sin nombre)",
  detalle: (v) => instituciones.find((i) => i.id === v.institucion)?.short ?? s(v.institucion),
  grupo: (v) => (v.rol === "ip" ? "Investigadoras principales" : (ROLES[v.rol as Rol]?.title.es ?? s(v.rol))),
  orden: (a, b) =>
    ORDEN_ROLES.indexOf(a.rol as Rol) - ORDEN_ROLES.indexOf(b.rol as Rol) ||
    Number(a.orden ?? Infinity) - Number(b.orden ?? Infinity) ||
    s(a.nombre).localeCompare(s(b.nombre), "es"),
  leer: (texto) => JSON.parse(texto),
  escribir: json,
};

export const COLECCIONES = [NOTICIAS, PUBLICACIONES, EQUIPO];

// ── Textos del proyecto ──────────────────────────────────────────────────
const eje = (nombre: string, etiqueta: string): Campo => ({
  tipo: "grupo",
  nombre,
  etiqueta,
  campos: [
    { tipo: "bilingue", nombre: "titulo", etiqueta: "Título", obligatorio: true },
    { tipo: "bilingue", nombre: "texto", etiqueta: "Texto", obligatorio: true, largo: true },
  ],
});

export const TEXTOS: ArchivoUnico = {
  id: "textos",
  titulo: "Textos del proyecto",
  ayuda: "Los textos de la portada, de «El proyecto» y del pie. El inglés que se deje vacío se sustituye por el español.",
  path: "contenido/textos.json",
  campos: [
    { tipo: "bilingue", nombre: "titulo", etiqueta: "Título del proyecto", obligatorio: true, largo: true },
    { tipo: "bilingue", nombre: "subtitulo", etiqueta: "Subtítulo", obligatorio: true, largo: true },
    { tipo: "bilingue", nombre: "presentacion", etiqueta: "Frase de presentación (portada)", obligatorio: true, largo: true },
    { tipo: "bilingue", nombre: "resumen", etiqueta: "Resumen (pie de página y buscadores)", obligatorio: true, largo: true },
    {
      tipo: "grupo",
      nombre: "ejes",
      etiqueta: "Ejes de estudio",
      ayuda: "Los tres ejes de la portada y de «El proyecto».",
      campos: [eje("estudiantes", "Eje «Estudiantes»"), eje("entorno", "Eje «Entorno de aprendizaje»"), eje("profesorado", "Eje «Profesorado»")],
    },
    {
      tipo: "lista",
      nombre: "objetivos",
      etiqueta: "Objetivos",
      elemento: "objetivo",
      resumen: (v) => s((v.texto as Valores | undefined)?.es),
      campos: [{ tipo: "bilingue", nombre: "texto", etiqueta: "Objetivo", obligatorio: true, largo: true }],
    },
    { tipo: "bilingue", nombre: "objeto", etiqueta: "Objeto de estudio («El proyecto»)", obligatorio: true, largo: true },
    {
      tipo: "grupo",
      nombre: "enfoque",
      etiqueta: "Enfoque",
      campos: ["cuantitativo", "cualitativo"].map(
        (id): Campo => ({
          tipo: "grupo",
          nombre: id,
          etiqueta: id === "cuantitativo" ? "Análisis cuantitativo" : "Estudios cualitativos",
          campos: [
            { tipo: "bilingue", nombre: "titulo", etiqueta: "Título", obligatorio: true },
            { tipo: "bilingue", nombre: "texto", etiqueta: "Texto", obligatorio: true, largo: true },
            { tipo: "bilingue", nombre: "nota", etiqueta: "Nota al pie (opcional)", largo: true },
          ],
        }),
      ),
    },
    { tipo: "bilingue", nombre: "transferencia", etiqueta: "Transferencia", obligatorio: true, largo: true },
    { tipo: "bilingue", nombre: "colaboracion", etiqueta: "Colaboración internacional", obligatorio: true, largo: true },
    { tipo: "bilingue", nombre: "convocatoria", etiqueta: "Convocatoria (ficha del proyecto)", obligatorio: true },
    { tipo: "bilingue", nombre: "plan", etiqueta: "Plan estatal (ficha del proyecto)", obligatorio: true, largo: true },
    { tipo: "bilingue", nombre: "financiacion", etiqueta: "Texto de financiación (pie de página)", obligatorio: true, largo: true },
    { tipo: "correo", nombre: "correo", etiqueta: "Correo de contacto (opcional)", ayuda: "Si se rellena, aparece en el pie de la web." },
  ],
  leer: (texto) => JSON.parse(texto),
  escribir: json,
};

// ── Trayectoria ──────────────────────────────────────────────────────────
export const TRAYECTORIA: ArchivoUnico = {
  id: "trayectoria",
  titulo: "Trayectoria",
  ayuda: "Proyectos anteriores del equipo; en la web salen ordenados por año.",
  path: "contenido/trayectoria.json",
  campos: [
    {
      tipo: "lista",
      nombre: "proyectos",
      etiqueta: "Proyectos",
      elemento: "proyecto",
      resumen: (v) => [s(v.anio), s(v.acronimo)].filter(Boolean).join(" "),
      campos: [
        { tipo: "texto", nombre: "acronimo", etiqueta: "Acrónimo", obligatorio: true },
        { tipo: "numero", nombre: "anio", etiqueta: "Año", obligatorio: true },
        { tipo: "bilingue", nombre: "titulo", etiqueta: "Título", obligatorio: true, largo: true },
        { tipo: "bilingue", nombre: "etapa", etiqueta: "Etapa educativa (opcional)" },
        { tipo: "url", nombre: "web", etiqueta: "Web del proyecto (opcional)" },
        { tipo: "booleano", nombre: "actual", etiqueta: "Es el proyecto actual (QUALITY)" },
      ],
    },
  ],
  // El archivo es una lista: en el formulario va dentro de «proyectos»
  leer: (texto) => ({ proyectos: JSON.parse(texto) }),
  escribir: (v) => JSON.stringify(v.proyectos ?? [], null, 2) + "\n",
};

export const ARCHIVOS = [TEXTOS, TRAYECTORIA];

// ── utilidades ───────────────────────────────────────────────────────────
export function fechaCorta(fecha: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) return fecha;
  return new Intl.DateTimeFormat("es-ES", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }).format(
    new Date(`${fecha}T00:00:00Z`),
  );
}

