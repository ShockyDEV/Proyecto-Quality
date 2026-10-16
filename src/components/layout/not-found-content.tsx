import { HomeLink } from "@/components/ui/home-link";
import { HexMark } from "@/components/ui/hex-mark";

/** Contenido del 404 bilingüe: lo usan not-found (desarrollo) y 404.html (estática). */
export function NotFoundContent() {
  return (
    <section className="bg-superficie">
      <div className="contenedor flex min-h-[55vh] flex-col justify-center py-20">
        <p className="antetitulo">
          <HexMark />
          Error 404
        </p>
        <h1 className="mt-3 max-w-2xl text-3xl font-extrabold sm:text-4xl">
          Esta página no existe
          <span lang="en" className="mt-2 block text-xl font-semibold text-tenue sm:text-2xl">
            This page does not exist
          </span>
        </h1>
        <div className="mt-8 flex flex-wrap gap-3">
          <HomeLink href="/" className="boton-primario">
            Volver al inicio
          </HomeLink>
          <HomeLink href="/en/" className="boton-contorno">
            <span lang="en">Back to the home page</span>
          </HomeLink>
        </div>
      </div>
    </section>
  );
}
