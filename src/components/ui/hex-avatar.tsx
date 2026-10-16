import { iniciales } from "@/content/equipo";
import { cn } from "@/lib/cn";

const TONO = {
  verde: "bg-verde/15 text-verde-texto",
  petroleo: "bg-petroleo/15 text-petroleo",
  teja: "bg-teja/15 text-teja-texto",
} as const;

/**
 * Avatar hexagonal con las iniciales (no hay fotos del equipo todavía). Si un
 * día las hay, basta con pintar la foto dentro del mismo recorte .hexagono.
 */
export function HexAvatar({
  name,
  tone = "petroleo",
  size = "md",
}: {
  name: string;
  tone?: keyof typeof TONO;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "hexagono flex shrink-0 items-center justify-center font-display font-bold",
        TONO[tone],
        size === "lg" ? "h-[5.25rem] w-[4.55rem] text-xl" : "h-14 w-[3.05rem] text-sm",
      )}
      aria-hidden
    >
      {iniciales(name)}
    </span>
  );
}
