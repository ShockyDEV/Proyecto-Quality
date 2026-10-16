import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, BookOpenText } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { PUBLICACIONES, TIPOS, type Publicacion } from "@/content/publicaciones";
import { UI } from "@/content/ui";
import { href, pick, type Locale } from "@/lib/i18n";
import { localeFrom, pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

const T = {
  title: { es: "Publicaciones", en: "Publications" },
  heading: { es: "Resultados publicados", en: "Published results" },
  lead: {
    es: "Artículos, capítulos y comunicaciones que difunden los resultados del proyecto.",
    en: "Articles, chapters and conference papers reporting the project's results.",
  },
  emptyTitle: { es: "Los primeros resultados están en preparación", en: "The first results are in preparation" },
  emptyText: {
    es: "Aquí se irán recogiendo las publicaciones del proyecto, con su enlace a la versión en acceso abierto. Mientras tanto, la producción científica de cada miembro del equipo puede consultarse en su perfil.",
    en: "The project's publications will be listed here, each with a link to its open-access version. In the meantime, the research output of each team member can be found on their profile.",
  },
  toTeam: { es: "Ir al equipo", en: "Go to the team" },
  openAccess: { es: "Acceso abierto", en: "Open access" },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFrom(params);
  return {
    ...pageMetadata(locale, "/publicaciones", T.title[locale], T.lead[locale]),
    // Sin publicaciones, la página no se ofrece a los buscadores
    ...(PUBLICACIONES.length === 0 ? { robots: { index: false } } : {}),
  };
}

function Cita({ p, locale }: { p: Publicacion; locale: Locale }) {
  return (
    <li className="border-b border-linea pb-5 last:border-0">
      <p className="text-sm text-tenue">{p.authors}</p>
      <p className="mt-1 font-semibold leading-snug text-tinta">{p.title}</p>
      <p className="mt-1 text-sm italic text-cuerpo">{p.venue}</p>
      <p className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm">
        {p.doi && (
          <a href={`https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer" className="enlace inline-flex items-center gap-1">
            DOI {p.doi}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">{pick(UI.newTab, locale)}</span>
          </a>
        )}
        {p.openAccess && (
          <a href={p.openAccess} target="_blank" rel="noopener noreferrer" className="enlace inline-flex items-center gap-1">
            {T.openAccess[locale]}
            <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only">{pick(UI.newTab, locale)}</span>
          </a>
        )}
      </p>
    </li>
  );
}

export default async function Publicaciones({ params }: Props) {
  const locale = await localeFrom(params);
  const years = [...new Set(PUBLICACIONES.map((p) => p.year))].sort((a, b) => b - a);

  return (
    <>
      <PageHeader eyebrow={T.title[locale]} title={T.heading[locale]} lead={T.lead[locale]} />

      <section className="bg-superficie py-14 sm:py-16">
        <div className="contenedor max-w-4xl">
          {years.length === 0 ? (
            <div className="tarjeta flex flex-col gap-5 p-7 sm:flex-row sm:items-start">
              <BookOpenText className="h-8 w-8 shrink-0 text-petroleo" aria-hidden />
              <div>
                <h2 className="text-xl font-bold">{T.emptyTitle[locale]}</h2>
                <p className="mt-2 leading-relaxed text-cuerpo">{T.emptyText[locale]}</p>
                <Link href={href(locale, "/equipo")} className="boton-contorno mt-5">
                  {T.toTeam[locale]}
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-12">
              {years.map((year) => (
                <section key={year} aria-labelledby={`anio-${year}`}>
                  <h2 id={`anio-${year}`} className="text-2xl font-extrabold tabular-nums">
                    {year}
                  </h2>
                  {(Object.keys(TIPOS) as (keyof typeof TIPOS)[]).map((tipo) => {
                    const items = PUBLICACIONES.filter((p) => p.year === year && p.type === tipo);
                    if (items.length === 0) return null;
                    return (
                      <div key={tipo} className="mt-6">
                        <h3 className="font-sans text-sm font-semibold text-tenue">{pick(TIPOS[tipo], locale)}</h3>
                        <ul className="mt-3 space-y-5">
                          {items.map((p) => (
                            <Cita key={p.title} p={p} locale={locale} />
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </section>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
