import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { TRAYECTORIA } from "@/content/trayectoria";
import { UI } from "@/content/ui";
import { pick } from "@/lib/i18n";
import { localeFrom, pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/cn";

type Props = { params: Promise<{ locale: string }> };

const T = {
  title: { es: "Trayectoria", en: "Track record" },
  heading: { es: "Los proyectos que preceden a QUALITY", en: "The projects that led to QUALITY" },
  lead: {
    es: "QUALITY continúa una línea de proyectos de evaluación educativa del equipo que arranca en 2012 en la Educación Secundaria y llega ahora a la Universidad.",
    en: "QUALITY continues a line of educational assessment projects by the team that began in secondary education in 2012 and now reaches higher education.",
  },
  current: { es: "Proyecto actual", en: "Current project" },
  web: { es: "Visitar su web", en: "Visit its website" },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFrom(params);
  return pageMetadata(locale, "/trayectoria", T.title[locale], T.lead[locale]);
}

export default async function Trayectoria({ params }: Props) {
  const locale = await localeFrom(params);
  const items = [...TRAYECTORIA].sort((a, b) => a.year - b.year);

  return (
    <>
      <PageHeader eyebrow={T.title[locale]} title={T.heading[locale]} lead={T.lead[locale]} />

      <section className="bg-superficie py-14 sm:py-16">
        <div className="contenedor">
          <ol className="relative max-w-3xl">
            {/* eje vertical, en mitad del hueco entre el año y el texto */}
            <span className="absolute bottom-3 left-[5.35rem] top-3 w-px bg-linea sm:left-[6.35rem]" aria-hidden />
            {items.map((p, i) => (
              <li
                key={p.acronym}
                data-reveal
                style={{ ["--d" as string]: `${i * 90}ms` }}
                className="relative grid grid-cols-[4.6rem_1fr] gap-x-6 pb-10 last:pb-0 sm:grid-cols-[5.6rem_1fr]"
              >
                <p className={cn("pt-1 text-right font-display text-xl font-extrabold tabular-nums", p.current ? "text-teja-texto" : "text-tenue")}>
                  {p.year}
                </p>
                <span
                  className={cn(
                    "hexagono absolute left-[5.35rem] top-2 h-4 w-3.5 -translate-x-1/2 sm:left-[6.35rem]",
                    p.current ? "bg-teja" : "bg-verde",
                  )}
                  aria-hidden
                />
                <div className={cn("pl-2", p.current && "rounded-lg border border-teja/40 bg-tintado p-5")}>
                  <h2 className="text-xl font-bold">
                    {p.acronym}
                    {p.current && <span className="ml-3 font-sans text-sm font-semibold text-teja-texto">{T.current[locale]}</span>}
                  </h2>
                  <p className="mt-1.5 leading-relaxed text-cuerpo">{pick(p.title, locale)}</p>
                  {p.stage && <p className="mt-1.5 text-sm text-tenue">{pick(p.stage, locale)}</p>}
                  {p.url && (
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="enlace mt-2 inline-flex items-center gap-1 text-sm"
                    >
                      {T.web[locale]}
                      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
                      <span className="sr-only">
                        ({p.acronym}) {pick(UI.newTab, locale)}
                      </span>
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  );
}
