/**
 * Contenido editable de la web (`npm run contenido`).
 *
 * Lo que se edita desde el backstage de la web (/backstage) vive en
 * contenido/: un JSON por persona y por publicación, un Markdown por noticia y
 * dos JSON con los textos del proyecto y la trayectoria. Este script lo lee,
 * lo comprueba y escribe src/content/generado/*.json, que es lo que usa la web.
 *
 * Si algo no cuadra (un campo obligatorio vacío, una institución que no
 * existe, una foto que no está en public/…), para con la lista de errores: la
 * web no se publica y la versión anterior sigue en línea.
 *
 * Se ejecuta solo antes de `dev`, `test`, `typecheck` y `build:static`.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { leerNoticia, renderMarkdown, slugify } from "./comun.mjs";

export { slugify };

const ROLES = ["ip", "investigador", "contrato", "trabajo"];
const TIPOS = ["articulo", "capitulo", "libro", "congreso", "informe"];
const EJES = ["estudiantes", "entorno", "profesorado"];
const ENFOQUES = ["cuantitativo", "cualitativo"];

/**
 * Lee y comprueba contenido/ dentro de `root`. Devuelve los datos para la web
 * y la lista de errores (vacía si todo está bien).
 */
export function generar(root) {
  const errores = [];
  const dir = path.join(root, "contenido");
  const rel = (f) => path.relative(root, f).replaceAll("\\", "/");

  // ── utilidades de comprobación ─────────────────────────────────────────
  const texto = (v) => (typeof v === "string" ? v.trim() : typeof v === "number" ? String(v) : "");
  const opcional = (v) => texto(v) || undefined;
  const obligatorio = (v, campo, donde) => {
    const t = texto(v);
    if (!t) errores.push(`${donde}: falta «${campo}»`);
    return t;
  };
  /** Texto bilingüe: el español es obligatorio; el inglés, si falta, repite el español. */
  const bilingue = (v, campo, donde, { requerido = true } = {}) => {
    const es = texto(v?.es);
    const en = texto(v?.en);
    if (!es) {
      if (requerido || en) errores.push(`${donde}: falta «${campo}» en español`);
      return undefined;
    }
    return { es, en: en || es };
  };
  const enlace = (v, campo, donde) => {
    const t = texto(v);
    if (!t) return undefined;
    if (!/^https?:\/\/\S+$/i.test(t)) errores.push(`${donde}: «${campo}» debe ser una dirección web completa (https://…)`);
    return t;
  };
  const media = (v, campo, donde) => {
    const t = texto(v);
    if (!t) return undefined;
    if (!t.startsWith("/media/")) errores.push(`${donde}: «${campo}» debe estar en la carpeta de medios (/media/…)`);
    else if (!existsSync(path.join(root, "public", decodeURI(t)))) errores.push(`${donde}: no existe la imagen ${t}`);
    return t;
  };
  const numero = (v, campo, donde, { requerido = false } = {}) => {
    if (v === undefined || v === null || v === "") {
      if (requerido) errores.push(`${donde}: falta «${campo}»`);
      return undefined;
    }
    const n = Number(v);
    if (!Number.isFinite(n)) errores.push(`${donde}: «${campo}» debe ser un número`);
    return n;
  };
  const leerJson = (f) => {
    try {
      return JSON.parse(readFileSync(f, "utf8"));
    } catch (e) {
      errores.push(`${rel(f)}: no se puede leer (${e.message})`);
      return undefined;
    }
  };
  const archivos = (sub, ext) => {
    const d = path.join(dir, sub);
    if (!existsSync(d)) return [];
    return readdirSync(d)
      .filter((f) => f.endsWith(ext))
      .sort()
      .map((f) => path.join(d, f));
  };
  const porOrden = (a, b) => (a.orden ?? Infinity) - (b.orden ?? Infinity);

  // ── instituciones (las define el código, no el backstage) ──────────────────
  const instituciones = JSON.parse(readFileSync(path.join(root, "src/content/instituciones.json"), "utf8"));
  const idsInstitucion = new Set(instituciones.map((i) => i.id));

  // ── textos del proyecto ────────────────────────────────────────────────
  const fTextos = path.join(dir, "textos.json");
  const t = leerJson(fTextos) ?? {};
  const dT = rel(fTextos);
  const textos = {
    title: bilingue(t.titulo, "Título", dT),
    subtitle: bilingue(t.subtitulo, "Subtítulo", dT),
    statement: bilingue(t.presentacion, "Frase de presentación", dT),
    summary: bilingue(t.resumen, "Resumen", dT),
    call: bilingue(t.convocatoria, "Convocatoria", dT),
    plan: bilingue(t.plan, "Plan", dT),
    funding: bilingue(t.financiacion, "Financiación", dT),
    email: opcional(t.correo) ?? null,
    ejes: EJES.map((id) => ({
      id,
      title: bilingue(t.ejes?.[id]?.titulo, `Eje ${id}: título`, dT),
      text: bilingue(t.ejes?.[id]?.texto, `Eje ${id}: texto`, dT),
    })),
    objetivos: (Array.isArray(t.objetivos) ? t.objetivos : [])
      .map((o, i) => bilingue(o?.texto, `Objetivo ${i + 1}`, dT))
      .filter(Boolean)
      .map((text) => ({ text })),
    descripcion: {
      objeto: bilingue(t.objeto, "Objeto de estudio", dT),
      enfoque: ENFOQUES.map((id) => ({
        id,
        title: bilingue(t.enfoque?.[id]?.titulo, `Enfoque ${id}: título`, dT),
        text: bilingue(t.enfoque?.[id]?.texto, `Enfoque ${id}: texto`, dT),
        ...(() => {
          const nota = bilingue(t.enfoque?.[id]?.nota, `Enfoque ${id}: nota`, dT, { requerido: false });
          return nota ? { nota } : {};
        })(),
      })),
      transferencia: bilingue(t.transferencia, "Transferencia", dT),
      colaboracion: bilingue(t.colaboracion, "Colaboración internacional", dT),
    },
  };
  if (textos.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(textos.email)) errores.push(`${dT}: el correo no es válido`);
  if (textos.objetivos.length === 0) errores.push(`${dT}: tiene que haber al menos un objetivo`);

  // ── trayectoria ────────────────────────────────────────────────────────
  const fTray = path.join(dir, "trayectoria.json");
  const tray = leerJson(fTray);
  const dTray = rel(fTray);
  const trayectoria = (Array.isArray(tray) ? tray : []).map((p, i) => {
    const d = `${dTray} (proyecto ${i + 1})`;
    return {
      acronym: obligatorio(p?.acronimo, "Acrónimo", d),
      year: numero(p?.anio, "Año", d, { requerido: true }),
      title: bilingue(p?.titulo, "Título", d),
      ...(bilingue(p?.etapa, "Etapa", d, { requerido: false }) ? { stage: bilingue(p.etapa, "Etapa", d, { requerido: false }) } : {}),
      ...(enlace(p?.web, "Web", d) ? { url: enlace(p.web, "Web", d) } : {}),
      current: p?.actual === true,
    };
  });
  trayectoria.sort((a, b) => a.year - b.year);

  // ── equipo ─────────────────────────────────────────────────────────────
  const equipo = archivos("equipo", ".json")
    .map((f) => {
      const p = leerJson(f) ?? {};
      const d = rel(f);
      const role = obligatorio(p.rol, "Papel en el proyecto", d);
      if (role && !ROLES.includes(role)) errores.push(`${d}: el papel «${role}» no existe`);
      const institution = obligatorio(p.institucion, "Institución", d);
      if (institution && !idsInstitucion.has(institution)) errores.push(`${d}: la institución «${institution}» no existe`);
      return {
        name: obligatorio(p.nombre, "Nombre", d),
        role,
        institution,
        ...(enlace(p.perfil, "Perfil", d) ? { profile: texto(p.perfil) } : {}),
        ...(media(p.foto, "Foto", d) ? { photo: texto(p.foto) } : {}),
        orden: numero(p.orden, "Orden", d),
      };
    })
    .sort((a, b) => porOrden(a, b) || a.name.localeCompare(b.name, "es"));
  const nombres = new Map();
  for (const p of equipo) {
    if (nombres.has(p.name)) errores.push(`equipo: «${p.name}» aparece dos veces`);
    nombres.set(p.name, true);
  }

  // ── publicaciones ──────────────────────────────────────────────────────
  const publicaciones = archivos("publicaciones", ".json")
    .map((f) => {
      const p = leerJson(f) ?? {};
      const d = rel(f);
      const type = obligatorio(p.tipo, "Tipo", d);
      if (type && !TIPOS.includes(type)) errores.push(`${d}: el tipo «${type}» no existe`);
      const lugar = bilingue(p.lugar, "Lugar", d, { requerido: false });
      return {
        year: numero(p.anio, "Año", d, { requerido: true }),
        type,
        authors: obligatorio(p.autores, "Autoría", d),
        title: obligatorio(p.titulo, "Título", d),
        venue: obligatorio(p.medio, "Revista, libro o congreso", d),
        ...(opcional(p.editores) ? { editors: texto(p.editores) } : {}),
        ...(opcional(p.paginas) ? { pages: texto(p.paginas) } : {}),
        ...(lugar ? { place: lugar } : {}),
        ...(opcional(p.isbn) ? { isbn: texto(p.isbn) } : {}),
        ...(opcional(p.doi) ? { doi: texto(p.doi).replace(/^https?:\/\/(dx\.)?doi\.org\//i, "") } : {}),
        ...(enlace(p.actas, "Enlace a las actas", d) ? { proceedings: texto(p.actas) } : {}),
        ...(enlace(p.accesoAbierto, "Acceso abierto", d) ? { openAccess: texto(p.accesoAbierto) } : {}),
        orden: numero(p.orden, "Orden", d),
      };
    })
    .sort((a, b) => b.year - a.year || porOrden(a, b) || a.title.localeCompare(b.title, "es"));

  // ── noticias ───────────────────────────────────────────────────────────
  const slugs = new Set();
  const noticias = archivos("noticias", ".md")
    .map((f) => {
      const d = rel(f);
      let fm, cuerpo;
      try {
        ({ cabecera: fm, cuerpo } = leerNoticia(readFileSync(f, "utf8")));
      } catch (e) {
        errores.push(`${d}: ${e.message}`);
        return undefined;
      }
      const fecha = texto(fm.fecha);
      if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha) || Number.isNaN(Date.parse(fecha))) errores.push(`${d}: la fecha debe ser AAAA-MM-DD`);
      const slug = slugify(path.basename(f, ".md"));
      if (slugs.has(slug)) errores.push(`${d}: hay otra noticia con la misma dirección (${slug})`);
      slugs.add(slug);
      const en = fm.ingles ?? {};
      const html = { es: renderMarkdown(cuerpo), en: renderMarkdown(texto(en.texto) || cuerpo) };
      return {
        slug,
        date: fecha,
        title: { es: obligatorio(fm.titulo, "Título", d), en: texto(en.titulo) || texto(fm.titulo) },
        summary: { es: obligatorio(fm.resumen, "Resumen", d), en: texto(en.resumen) || texto(fm.resumen) },
        ...(media(fm.imagen, "Imagen", d) ? { image: texto(fm.imagen), imageAlt: texto(fm.imagen_alt) } : {}),
        html,
        /** Si la versión inglesa es una traducción propia (si no, se muestra el español) */
        english: !!(texto(en.titulo) && texto(en.texto)),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.date.localeCompare(a.date) || a.slug.localeCompare(b.slug));

  const datos = {
    textos,
    trayectoria,
    equipo: equipo.map(({ orden, ...p }) => p),
    publicaciones: publicaciones.map(({ orden, ...p }) => p),
    noticias,
    indice: { publicaciones: publicaciones.length, noticias: noticias.length },
  };
  return { datos, errores };
}

/**
 * Genera y escribe src/content/generado/. Devuelve los errores (si los hay,
 * no escribe nada). La usa también el modo local del backstage.
 */
export function escribirGenerado(root) {
  const { datos, errores } = generar(root);
  if (errores.length) return { datos, errores };
  const out = path.join(root, "src/content/generado");
  mkdirSync(out, { recursive: true });
  for (const [nombre, valor] of Object.entries(datos)) {
    writeFileSync(path.join(out, `${nombre}.json`), JSON.stringify(valor, null, 2) + "\n");
  }
  return { datos, errores };
}

// ── ejecución directa ────────────────────────────────────────────────────
if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
  const { datos, errores } = escribirGenerado(root);
  if (errores.length) {
    console.error(`\n✗ El contenido tiene ${errores.length} error(es):\n`);
    for (const e of errores) console.error(`  - ${e}`);
    console.error("");
    process.exit(1);
  }
  const { indice } = datos;
  console.log(
    `✓ Contenido: ${datos.equipo.length} personas, ${indice.publicaciones} publicaciones, ${indice.noticias} noticias`,
  );
}
