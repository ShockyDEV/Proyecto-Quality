import type { NextConfig } from "next";

/**
 * La web es estática (GitHub Pages), sin base de datos ni panel. Dos modos
 * con el mismo código (ver src/lib/build-mode.ts):
 * - desarrollo (`npm run dev`): el middleware sirve el español sin prefijo;
 * - estático (STATIC_EXPORT=1, `npm run build:static`): genera out/.
 */
const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";
// Subcarpeta de GitHub Pages sin dominio propio (p. ej. "/QUALITY-WEB"); el
// flujo de Pages la saca de actions/configure-pages. Ver src/lib/base-path.ts.
const BASE_PATH = STATIC_EXPORT ? (process.env.PAGES_BASE_PATH || "").replace(/\/$/, "") : "";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: STATIC_EXPORT ? "export" : undefined,
  // Barra final, como las direcciones de la web anterior (/equipo/,
  // /el-proyecto/…): así los enlaces que ya circulan siguen funcionando.
  trailingSlash: true,
  basePath: BASE_PATH,
  env: { NEXT_PUBLIC_BASE_PATH: BASE_PATH },
  // Los ficheros *.server.* (middleware de idiomas, 404 del modo desarrollo)
  // solo cuentan en desarrollo y los *.static.* (404.html) solo en el estático.
  pageExtensions: STATIC_EXPORT
    ? ["static.tsx", "static.ts", "tsx", "ts", "jsx", "js"]
    : ["server.tsx", "server.ts", "tsx", "ts", "jsx", "js"],
  // En desarrollo se puede usar otra carpeta (NEXT_DIST_DIR=.next-dev). En la
  // exportación no: Next tomaría esa carpeta como destino en lugar de out/.
  distDir: STATIC_EXPORT ? ".next" : process.env.NEXT_DIST_DIR || ".next",
  poweredByHeader: false,
  // Sin servidor no hay optimizador de imágenes: se sirven tal cual (los
  // ficheros de public/ ya están a su tamaño), con la subcarpeta delante.
  images: STATIC_EXPORT
    ? { loader: "custom", loaderFile: "./src/lib/static-image-loader.ts" }
    : { unoptimized: true },
  // Tipos y lint se comprueban en CI (npm run typecheck, eslint); aquí
  // chocarían los tipos de rutas que Next genera para cada modo.
  ...(STATIC_EXPORT ? { typescript: { ignoreBuildErrors: true }, eslint: { ignoreDuringBuilds: true } } : {}),
};

export default nextConfig;
