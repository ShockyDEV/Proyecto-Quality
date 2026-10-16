import { cn } from "@/lib/cn";

/**
 * Marca hexagonal de QUALITY: el hexágono del símbolo del logo partido en
 * tres rombos con los colores de sus tres figuras (verde: estudiantes,
 * petróleo: entorno, teja: profesorado). Precede a los antetítulos.
 */
const ROMBOS = [
  { d: "M0 -1 L0.866 -0.5 L0 0 L-0.866 -0.5Z", c: [0, -0.5], fill: "fill-petroleo" },
  { d: "M-0.866 -0.5 L0 0 L0 1 L-0.866 0.5Z", c: [-0.433, 0.25], fill: "fill-verde" },
  { d: "M0.866 -0.5 L0.866 0.5 L0 1 L0 0Z", c: [0.433, 0.25], fill: "fill-teja" },
] as const;

export function HexMark({ className }: { className?: string }) {
  return (
    <svg viewBox="-0.9 -1.03 1.8 2.06" className={cn("h-3.5 w-auto shrink-0", className)} aria-hidden>
      {ROMBOS.map((r) => (
        <path
          key={r.d}
          d={r.d}
          className={r.fill}
          transform={`translate(${r.c[0]} ${r.c[1]}) scale(0.86) translate(${-r.c[0]} ${-r.c[1]})`}
        />
      ))}
    </svg>
  );
}
