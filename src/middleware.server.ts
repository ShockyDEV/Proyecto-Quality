import { NextResponse, type NextRequest } from "next/server";

/**
 * Solo en desarrollo (*.server.ts no existe en la versión estática): el
 * español va sin prefijo y se REESCRIBE internamente a /es/…; el inglés vive
 * en /en/…; /es/… redirige a la URL canónica. Es lo mismo que hace
 * scripts/build-static.mjs al sacar el español a la raíz de out/.
 */
export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next();
  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const url = req.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }
  const url = req.nextUrl.clone();
  url.pathname = `/es${pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  // Todo menos los internos de Next, el backstage (sin idiomas), el simulador
  // de GitHub de desarrollo y cualquier ruta con punto (ficheros: imágenes,
  // favicon, sitemap.xml, robots.txt…). Patrón de next-intl. La portada («/»)
  // tampoco pasa por aquí: tiene su ruta propia en app/(portada).
  matcher: ["/((?!_next|backstage|api/|.*\\..*).+)"],
};
