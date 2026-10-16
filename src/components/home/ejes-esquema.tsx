import { GraduationCap, Presentation, School, Search } from "lucide-react";
import { EJES, EJE_COLOR, type EjeId } from "@/content/proyecto";
import { HexPattern } from "@/components/ui/hex-pattern";
import { pick, type Locale } from "@/lib/i18n";

/**
 * Esquema de la portada (sustituye a la foto de biblioteca de la web
 * anterior): los tres ejes del proyecto como los hexágonos del logo, con sus
 * tres colores, unidos entre sí y con la lupa de la evaluación en el centro.
 * Dice lo mismo que la frase del proyecto: se estudia la interacción entre
 * estudiantes, entorno de aprendizaje y profesorado.
 */
const R = 70; // radio de los hexágonos de los ejes
const NODOS: Record<EjeId, { x: number; y: number; Icon: typeof School }> = {
  estudiantes: { x: 128, y: 128, Icon: GraduationCap },
  profesorado: { x: 352, y: 128, Icon: Presentation },
  entorno: { x: 240, y: 322, Icon: School },
};
const CENTRO = { x: 240, y: 194 };

const COLOR = {
  verde: { fill: "fill-verde/15", stroke: "stroke-verde", text: "text-verde-texto" },
  petroleo: { fill: "fill-petroleo/15", stroke: "stroke-petroleo", text: "text-petroleo" },
  teja: { fill: "fill-teja/15", stroke: "stroke-teja", text: "text-teja-texto" },
} as const;

function hex(cx: number, cy: number, r: number) {
  return Array.from({ length: 6 }, (_, i) => {
    const a = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)}`;
  }).join(" ");
}

/** Parte un rótulo largo en dos líneas por el espacio más centrado. */
function lineas(label: string): string[] {
  if (label.length < 14) return [label];
  const mid = label.length / 2;
  let best = -1;
  for (let i = 0; i < label.length; i++) {
    if (label[i] === " " && (best < 0 || Math.abs(i - mid) < Math.abs(best - mid))) best = i;
  }
  return best < 0 ? [label] : [label.slice(0, best), label.slice(best + 1)];
}

export function EjesEsquema({ locale, label }: { locale: Locale; label: string }) {
  const ids = Object.keys(NODOS) as EjeId[];
  return (
    <div className="relative">
      <HexPattern
        id="panal-esquema"
        size={18}
        className="absolute inset-0 h-full w-full fill-none stroke-linea [mask-image:radial-gradient(closest-side,#000_45%,transparent)]"
      />
      <svg viewBox="0 0 480 420" role="img" aria-label={label} className="relative w-full">
        {/* Lados del triángulo entre ejes y radios hacia la evaluación */}
        <g fill="none" strokeLinecap="round">
          {ids.map((a, i) => {
            const b = ids[(i + 1) % ids.length];
            return (
              <line
                key={`${a}-${b}`}
                x1={NODOS[a].x}
                y1={NODOS[a].y}
                x2={NODOS[b].x}
                y2={NODOS[b].y}
                pathLength={1}
                className="esquema-linea stroke-linea"
                strokeWidth={2}
                style={{ ["--d" as string]: `${150 + i * 120}ms` }}
              />
            );
          })}
          {ids.map((id, i) => (
            <line
              key={`radio-${id}`}
              x1={CENTRO.x}
              y1={CENTRO.y}
              x2={NODOS[id].x}
              y2={NODOS[id].y}
              pathLength={1}
              className={`esquema-linea ${COLOR[EJE_COLOR[id]].stroke}`}
              strokeWidth={1.5}
              strokeOpacity={0.7}
              style={{ ["--d" as string]: `${500 + i * 120}ms` }}
            />
          ))}
        </g>

        {EJES.map((eje, i) => {
          const { x, y, Icon } = NODOS[eje.id];
          const c = COLOR[EJE_COLOR[eje.id]];
          const rows = lineas(pick(eje.title, locale));
          return (
            <g
              key={eje.id}
              data-reveal="escala"
              style={{ ["--d" as string]: `${i * 140}ms`, transformBox: "fill-box", transformOrigin: "center" }}
            >
              <polygon points={hex(x, y, R)} className={`fill-superficie ${c.stroke}`} strokeWidth={2} />
              <polygon points={hex(x, y, R)} className={c.fill} />
              <Icon x={x - 15} y={y - (rows.length > 1 ? 38 : 30)} width={30} height={30} strokeWidth={1.75} className={c.text} aria-hidden />
              <text x={x} y={y + (rows.length > 1 ? 12 : 22)} textAnchor="middle" className="fill-tinta font-display text-[15px] font-bold">
                {rows.map((row, j) => (
                  <tspan key={row} x={x} dy={j === 0 ? 0 : 18}>
                    {row}
                  </tspan>
                ))}
              </text>
            </g>
          );
        })}

        {/* La evaluación (la lupa del logo), en el centro */}
        <g data-reveal="escala" style={{ ["--d" as string]: "450ms", transformBox: "fill-box", transformOrigin: "center" }}>
          <polygon points={hex(CENTRO.x, CENTRO.y, 30)} className="fill-superficie stroke-teja" strokeWidth={2} />
          <Search x={CENTRO.x - 12} y={CENTRO.y - 12} width={24} height={24} strokeWidth={2.25} className="text-teja-texto" aria-hidden />
        </g>
      </svg>
    </div>
  );
}
