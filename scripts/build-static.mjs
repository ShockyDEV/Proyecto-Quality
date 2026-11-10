/**
 * Versión estática de la web para GitHub Pages (`npm run build:static`).
 *
 *   1. `next build` con STATIC_EXPORT=1, después de generar el contenido
 *      editable (scripts/contenido.mjs; sin base de datos).
 *   2. Reordena out/ para que GitHub Pages sirva las mismas direcciones que el
 *      modo desarrollo: el español sin prefijo (/equipo/) y el inglés en /en/.
 *   3. 404.html, la redirección de /proyectos-anteriores/ (dirección de la web
 *      anterior), CNAME (si se define SITE_DOMAIN) y .nojekyll.
 *
 * Sin dominio propio, GitHub Pages sirve la web en una subcarpeta
 * (shockydev.github.io/QUALITY-WEB): PAGES_BASE_PATH=/QUALITY-WEB la tiene en
 * cuenta en enlaces, imágenes, iconos y manifiesto.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, readFileSync, readdirSync, renameSync, rmSync, statSync, writeFileSync, copyFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";

const OUT = path.join(process.cwd(), "out");
const rel = (p) => path.relative(OUT, p).replaceAll("\\", "/");
const base = (process.env.PAGES_BASE_PATH || "").replace(/\/$/, "");

function fail(msg) {
  console.error(`\n✗ ${msg}`);
  process.exit(1);
}

/**
 * Reduce las fotos de más de 400 KB a un máximo de 1600 px (480 px las del
 * equipo, que se ven en un hexágono pequeño). Usa sharp, que llega con Next;
 * si no está, deja las imágenes como están.
 */
async function optimizarMedia(dir) {
  if (!existsSync(dir)) return;
  let sharp;
  try {
    sharp = (await import("sharp")).default;
  } catch {
    console.warn("· sharp no está instalado: las imágenes de /media/ se publican sin reducir");
    return;
  }
  const walk = (d) =>
    readdirSync(d).flatMap((n) => {
      const p = path.join(d, n);
      return statSync(p).isDirectory() ? walk(p) : [p];
    });
  for (const file of walk(dir)) {
    if (!/\.(jpe?g|png|webp)$/i.test(file) || statSync(file).size <= 400 * 1024) continue;
    const max = rel(file).startsWith("media/equipo/") ? 480 : 1600;
    const img = sharp(readFileSync(file)).rotate().resize({ width: max, height: max, fit: "inside", withoutEnlargement: true });
    const ext = path.extname(file).toLowerCase();
    const buf = await (ext === ".png" ? img.png({ compressionLevel: 9 }) : ext === ".webp" ? img.webp({ quality: 82 }) : img.jpeg({ quality: 82, mozjpeg: true })).toBuffer();
    writeFileSync(file, buf);
    console.log(`· ${rel(file)} reducida a ${Math.round(buf.length / 1024)} KB`);
  }
}

// ─── 1. Compilación ─────────────────────────────────────────────────────
// Antes, el contenido editable (contenido/ → src/content/generado/): si tiene
// errores, se para aquí y la versión publicada no cambia.
const contenido = spawnSync(process.execPath, [path.join(process.cwd(), "scripts/contenido.mjs")], { stdio: "inherit" });
if (contenido.status !== 0) process.exit(contenido.status ?? 1);
rmSync(OUT, { recursive: true, force: true });
const nextBin = createRequire(import.meta.url).resolve("next/dist/bin/next");
const build = spawnSync(process.execPath, [nextBin, "build"], {
  stdio: "inherit",
  // Sin NEXT_DIST_DIR: en la exportación Next lo usaría como destino (ver next.config.ts)
  env: { ...process.env, STATIC_EXPORT: "1", NEXT_DIST_DIR: "" },
});
if (build.status !== 0) process.exit(build.status ?? 1);
if (!existsSync(OUT)) fail("next build no ha generado out/");
// Los tipos de rutas de este modo confundirían a `npm run typecheck` en
// local; el servidor de desarrollo los vuelve a generar.
rmSync(path.join(process.cwd(), ".next", "types"), { recursive: true, force: true });

// ─── 2. Español en la raíz ──────────────────────────────────────────────
/** Mueve el contenido de src a dest sin pisar nada (un choque es un error). */
function moveInto(src, dest) {
  for (const name of readdirSync(src)) {
    const from = path.join(src, name);
    const to = path.join(dest, name);
    if (existsSync(to)) {
      if (!statSync(from).isDirectory() || !statSync(to).isDirectory()) {
        fail(`Al pasar el español a la raíz, ${rel(to)} ya existe`);
      }
      moveInto(from, to);
    } else {
      renameSync(from, to);
    }
  }
  rmSync(src, { recursive: true, force: true });
}

const esDir = path.join(OUT, "es");
if (!existsSync(path.join(esDir, "index.html"))) fail("Falta out/es/index.html (la portada en español)");
// Lo que Next genere en la raíz para la ruta «/» (no la usamos: la portada
// es la del español) se aparta antes de mover
for (const f of ["index.html", "index.txt"]) rmSync(path.join(OUT, f), { force: true });
moveInto(esDir, OUT);

// ─── 3. 404, redirecciones, dominio y Jekyll ────────────────────────────
const notFound = path.join(OUT, "pagina-no-encontrada", "index.html");
if (!existsSync(notFound)) fail("Falta la página 404 (pagina-no-encontrada)");
copyFileSync(notFound, path.join(OUT, "404.html"));
// (y la 404 genérica que Next genera por su cuenta, en inglés)
for (const dir of ["pagina-no-encontrada", "en/pagina-no-encontrada", "_not-found", "404"]) {
  rmSync(path.join(OUT, dir), { recursive: true, force: true });
}

// Sin noticias, la ruta /noticias/[slug] genera una página «_» de relleno
// (ver su generateStaticParams): fuera.
for (const dir of ["noticias/_", "en/noticias/_"]) {
  rmSync(path.join(OUT, dir), { recursive: true, force: true });
}

// El acceso de prueba del modo local nunca se publica (en GitHub ni existe)
rmSync(path.join(OUT, "backstage", "acceso.local.json"), { force: true });

// Imágenes subidas desde el backstage (public/media/): las muy grandes se
// reducen en la copia publicada (el original sigue en el repositorio).
await optimizarMedia(path.join(OUT, "media"));

// La web anterior tenía /proyectos-anteriores/; ahora es /trayectoria/.
// GitHub Pages no hace redirecciones de servidor: una página mínima con
// meta refresh y canonical (los buscadores lo tratan como redirección).
const REDIRECCIONES = { "proyectos-anteriores": "/trayectoria/" };
for (const [from, to] of Object.entries(REDIRECCIONES)) {
  const target = `${base}${to}`;
  mkdirSync(path.join(OUT, from), { recursive: true });
  writeFileSync(
    path.join(OUT, from, "index.html"),
    `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>QUALITY</title>` +
      `<link rel="canonical" href="${target}"><meta name="robots" content="noindex">` +
      `<meta http-equiv="refresh" content="0; url=${target}"></head>` +
      `<body><p><a href="${target}">${target}</a></p></body></html>\n`,
  );
}

// Manifiesto: con subcarpeta, sus rutas también la llevan delante
if (base) {
  const file = path.join(OUT, "manifest.webmanifest");
  const manifest = JSON.parse(readFileSync(file, "utf8"));
  const withBase = (u) => (typeof u === "string" && u.startsWith("/") ? `${base}${u}` : u);
  manifest.start_url = withBase(manifest.start_url);
  manifest.scope = `${base}/`;
  manifest.icons = (manifest.icons || []).map((icon) => ({ ...icon, src: withBase(icon.src) }));
  writeFileSync(file, `${JSON.stringify(manifest, null, 2)}\n`);
}

const domain = (process.env.SITE_DOMAIN || "").trim();
if (domain) writeFileSync(path.join(OUT, "CNAME"), `${domain}\n`);
writeFileSync(path.join(OUT, ".nojekyll"), "");

// ─── Comprobación final ─────────────────────────────────────────────────
const required = [
  "index.html",
  "el-proyecto/index.html",
  "equipo/index.html",
  "trayectoria/index.html",
  "publicaciones/index.html",
  "noticias/index.html",
  "backstage/index.html",
  "backstage/acceso.json",
  "en/index.html",
  "en/equipo/index.html",
  "proyectos-anteriores/index.html",
  "404.html",
  "sitemap.xml",
  "robots.txt",
];
const missing = required.filter((f) => !existsSync(path.join(OUT, f)));
if (missing.length) fail(`Faltan en out/: ${missing.join(", ")}`);

const html = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    if (statSync(p).isDirectory()) {
      if (name !== "_next") walk(p);
    } else if (name.endsWith(".html")) {
      html.push(rel(p));
    }
  }
})(OUT);
console.log(`\n✓ Versión estática lista en out/ (${html.length} páginas${domain ? `, dominio ${domain}` : ""}${base ? `, en la subcarpeta ${base}` : ""})`);
