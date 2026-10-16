import { cn } from "@/lib/cn";

/**
 * Panal de hexágonos (decorativo): fondo de las cabeceras de página y del
 * esquema de la portada. Se dibuja con un <pattern> de SVG, así que pesa lo
 * mismo cubra lo que cubra.
 */
export function HexPattern({ id, className, size = 22 }: { id: string; className?: string; size?: number }) {
  const w = Math.sqrt(3) * size;
  const h = 3 * size;
  // Hexágono con vértice arriba centrado en (cx, cy)
  const hex = (cx: number, cy: number) =>
    Array.from({ length: 6 }, (_, i) => {
      const a = (Math.PI / 3) * i - Math.PI / 2;
      return `${(cx + size * Math.cos(a)).toFixed(2)},${(cy + size * Math.sin(a)).toFixed(2)}`;
    }).join(" ");

  return (
    <svg className={cn("pointer-events-none", className)} aria-hidden>
      <defs>
        <pattern id={id} width={w} height={h} patternUnits="userSpaceOnUse">
          {/* fila desplazada de la baldosa de arriba, que asoma por el borde */}
          <polygon points={hex(0, -size * 0.5)} />
          <polygon points={hex(w, -size * 0.5)} />
          <polygon points={hex(w / 2, size)} />
          <polygon points={hex(0, size * 2.5)} />
          <polygon points={hex(w, size * 2.5)} />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
