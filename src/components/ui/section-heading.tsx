import { cn } from "@/lib/cn";
import { HexMark } from "./hex-mark";

/** Antetítulo (con la marca hexagonal) + titular + entradilla opcional. */
export function SectionHeading({
  eyebrow,
  title,
  lead,
  align = "left",
  className,
  id,
}: {
  eyebrow: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  id?: string;
}) {
  return (
    <div data-reveal className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p className={cn("antetitulo", align === "center" && "justify-center")}>
        <HexMark />
        {eyebrow}
      </p>
      <h2 id={id} className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
        {title}
      </h2>
      {lead && <p className="mt-4 text-lg leading-relaxed text-cuerpo">{lead}</p>}
    </div>
  );
}
