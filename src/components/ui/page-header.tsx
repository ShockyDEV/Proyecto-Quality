import { cn } from "@/lib/cn";
import { HexMark } from "./hex-mark";
import { HexPattern } from "./hex-pattern";

/**
 * Cabecera clara de las páginas interiores (como las de la web del IUCE):
 * antetítulo con la marca hexagonal, titular y entradilla, sobre un panal
 * de hexágonos que se desvanece hacia la izquierda.
 */
export function PageHeader({
  eyebrow,
  title,
  lead,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  lead?: React.ReactNode;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("relative isolate overflow-hidden border-b border-linea bg-superficie", className)}>
      <HexPattern
        id="panal-cabecera"
        className="absolute inset-y-0 right-0 -z-10 h-full w-2/3 fill-none stroke-linea [mask-image:linear-gradient(to_left,#000_10%,transparent_85%)]"
      />
      <div className="contenedor py-12 sm:py-16">
        <p className="antetitulo">
          <HexMark />
          {eyebrow}
        </p>
        <h1 className="mt-3 max-w-3xl text-3xl font-extrabold leading-tight sm:text-[2.6rem]">{title}</h1>
        {lead && <p className="mt-4 max-w-2xl text-lg leading-relaxed text-cuerpo">{lead}</p>}
        {children}
      </div>
    </section>
  );
}
