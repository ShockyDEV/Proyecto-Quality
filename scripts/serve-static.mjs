/**
 * Sirve out/ en local como lo hace GitHub Pages (`npm run preview:static`):
 * /equipo/ → equipo/index.html, /en/ → en/index.html y, si no existe, 404.html.
 * Con --base=/QUALITY-WEB (o BASE_PATH) la sirve en esa subcarpeta, como sin dominio propio.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";

const OUT = path.resolve("out");
const PORT = Number(process.env.PORT || 3031);
const BASE = (process.argv.find((arg) => arg.startsWith("--base="))?.slice(7) || process.env.BASE_PATH || "").replace(/\/$/, "");
const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".txt": "text/plain; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".webmanifest": "application/manifest+json",
  ".xml": "application/xml",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff2": "font/woff2",
};

if (!existsSync(path.join(OUT, "index.html"))) {
  console.error("No hay versión estática: ejecuta antes `npm run build:static`.");
  process.exit(1);
}

function send(res, status, file) {
  res.writeHead(status, { "Content-Type": TYPES[path.extname(file)] || "application/octet-stream" });
  createReadStream(file).pipe(res);
}

createServer((req, res) => {
  let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
  if (BASE) {
    if (pathname === BASE) {
      res.writeHead(301, { Location: `${BASE}/` });
      return res.end();
    }
    if (!pathname.startsWith(`${BASE}/`)) return send(res, 404, path.join(OUT, "404.html"));
    pathname = pathname.slice(BASE.length);
  }
  for (const candidate of [pathname, `${pathname}.html`, path.posix.join(pathname, "index.html")]) {
    const file = path.join(OUT, candidate);
    if (!file.startsWith(OUT)) break;
    if (existsSync(file) && statSync(file).isFile()) return send(res, 200, file);
  }
  send(res, 404, path.join(OUT, "404.html"));
}).listen(PORT, () => console.log(`Versión estática en http://localhost:${PORT}${BASE}/`));
