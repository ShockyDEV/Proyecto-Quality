import Image from "next/image";
import { iniciales } from "@/content/equipo";
import { cn } from "@/lib/cn";

const TONO = {
  verde: "bg-verde/15 text-verde-texto",
  petroleo: "bg-petroleo/15 text-petroleo",
  teja: "bg-teja/15 text-teja-texto",
} as const;

/**
 * Avatar hexagonal: la foto de la persona si la hay (public/equipo/, 240 px)
 * y, si no, sus iniciales sobre el tono de su papel en el equipo. El nombre
 * va siempre al lado, así que la imagen es decorativa (alt vacío).
 */
export function HexAvatar({
  name,
  photo,
  tone = "petroleo",
  size = "md",
}: {
  name: string;
  photo?: string;
  tone?: keyof typeof TONO;
  size?: "md" | "lg";
}) {
  return (
    <span
      className={cn(
        "hexagono relative flex shrink-0 items-center justify-center overflow-hidden font-display font-bold",
        TONO[tone],
        size === "lg" ? "h-[5.25rem] w-[4.55rem] text-xl" : "h-14 w-[3.05rem] text-sm",
      )}
      aria-hidden
    >
      {photo ? (
        <Image src={photo} alt="" width={240} height={240} className="h-full w-full object-cover" />
      ) : (
        iniciales(name)
      )}
    </span>
  );
}
