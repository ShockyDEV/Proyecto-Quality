import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  ChartColumn,
  Globe2,
  GraduationCap,
  Landmark,
  Lightbulb,
  MessagesSquare,
  Presentation,
  Scale,
  School,
  Share2,
  Users,
} from "lucide-react";
import { EjesEsquema } from "@/components/home/ejes-esquema";
import { HexMark } from "@/components/ui/hex-mark";
import { SectionHeading } from "@/components/ui/section-heading";
import { DESCRIPCION, EJES, EJE_COLOR, OBJETIVOS, type EjeId } from "@/content/proyecto";
import { cifrasEquipo, EQUIPO, INSTITUCIONES, PAISES, type PaisId } from "@/content/equipo";
import { SITE } from "@/content/site";
import { href, pick, type Locale } from "@/lib/i18n";
import { localeFrom, pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/cn";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFrom(params);
  return pageMetadata(locale, "/", null);
}

const T = {
  eyebrow: { es: "Proyecto de Generación de Conocimiento 2024", en: "Knowledge Generation Project 2024" },
  cta: { es: "Conoce el proyecto", en: "About the project" },
  team: { es: "Equipo", en: "Team" },
  people: { es: "personas", en: "people" },
  institutions: { es: "instituciones", en: "institutions" },
  countries: { es: "países", en: "countries" },
  schema: {
    es: "Esquema del proyecto: estudiantes, entorno de aprendizaje y profesorado, unidos entre sí y con la evaluación en el centro.",
    en: "Project diagram: students, learning environment and teaching staff, connected to each other with assessment at the centre.",
  },
  ejesEyebrow: { es: "Líneas de trabajo", en: "Lines of work" },
  ejesTitle: { es: "Tres ejes de estudio", en: "Three areas of study" },
  enfoqueEyebrow: { es: "Enfoque", en: "Approach" },
  enfoqueTitle: { es: "Cómo se investiga", en: "How the research works" },
  transferencia: { es: "Transferencia", en: "Transfer" },
  more: { es: "Más sobre el proyecto", en: "More about the project" },
  objetivosEyebrow: { es: "Objetivos", en: "Aims" },
  objetivosTitle: { es: "Nuestros objetivos", en: "Our aims" },
  redEyebrow: { es: "Colaboración", en: "Collaboration" },
  redLead: {
    es: "Universidades y agencias de calidad de España, Irlanda y Portugal forman el equipo del proyecto.",
    en: "Universities and quality agencies from Spain, Ireland and Portugal make up the project team.",
  },
  meetTeam: { es: "Conoce al equipo", en: "Meet the team" },
} as const;

/** Textos con cifras */
const F = {
  redTitle: {
    es: (i: number, p: number) => `${i} instituciones de ${p} países`,
    en: (i: number, p: number) => `${i} institutions in ${p} countries`,
  },
  member: {
    es: (n: number) => (n === 1 ? "1 persona" : `${n} personas`),
    en: (n: number) => (n === 1 ? "1 person" : `${n} people`),
  },
};

const EJE_ICON: Record<EjeId, typeof School> = {
  estudiantes: GraduationCap,
  entorno: School,
  profesorado: Presentation,
};
const EJE_TONO = {
  verde: { bar: "bg-verde", tile: "bg-verde/15 text-verde-texto" },
  petroleo: { bar: "bg-petroleo", tile: "bg-petroleo/15 text-petroleo" },
  teja: { bar: "bg-teja", tile: "bg-teja/15 text-teja-texto" },
} as const;
const OBJETIVO_ICON: Record<string, typeof School> = { conocimiento: Lightbulb, sistema: Landmark, equidad: Scale };

export default async function Home({ params }: Props) {
  const locale = await localeFrom(params);
  const cifras = cifrasEquipo();
  const t = (k: keyof typeof T): string => T[k][locale];

  const hitos = [
    { Icon: Users, label: `${cifras.personas} ${t("people")}` },
    { Icon: Building2, label: `${cifras.instituciones} ${t("institutions")}` },
    { Icon: Globe2, label: `${cifras.paises} ${t("countries")}` },
  ];

  const enfoque = [
    { Icon: ChartColumn, title: pick(DESCRIPCION.enfoque[0].title, locale), text: pick(DESCRIPCION.enfoque[0].text, locale) },
    { Icon: MessagesSquare, title: pick(DESCRIPCION.enfoque[1].title, locale), text: pick(DESCRIPCION.enfoque[1].text, locale) },
    { Icon: Share2, title: t("transferencia"), text: pick(DESCRIPCION.transferencia, locale) },
  ];

  const paises = (Object.keys(PAISES) as PaisId[]).map((pais) => ({
    pais,
    instituciones: INSTITUCIONES.filter((i) => i.country === pais).map((i) => ({
      ...i,
      miembros: EQUIPO.filter((p) => p.institution === i.id).length,
    })),
  }));

  return (
    <>
      {/* Portada */}
      <section className="bg-superficie">
        <div className="contenedor grid items-center gap-10 pb-14 pt-12 lg:grid-cols-[1.08fr_1fr] lg:gap-14 lg:pb-16 lg:pt-14">
          <div>
            <p className="antetitulo">
              <HexMark />
              {t("eyebrow")}
            </p>
            <h1 className="mt-4 text-[2rem] font-extrabold leading-[1.15] sm:text-[2.55rem]">{pick(SITE.title, locale)}</h1>
            <p className="mt-4 text-lg font-semibold leading-snug text-petroleo">{pick(SITE.subtitle, locale)}</p>
            <p className="mt-4 max-w-[52ch] leading-relaxed text-cuerpo">{pick(SITE.statement, locale)}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href={href(locale, "/el-proyecto")} className="boton-primario">
                {t("cta")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
              <Link href={href(locale, "/equipo")} className="boton-contorno">
                {t("team")}
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-6 gap-y-2.5 border-t border-linea pt-5 text-sm text-tenue">
              {hitos.map(({ Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="h-4 w-4 text-teja" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="mx-auto w-full max-w-md lg:max-w-none">
            <EjesEsquema locale={locale} label={t("schema")} />
          </div>
        </div>
      </section>

      {/* Ejes */}
      <section aria-labelledby="ejes" className="border-y border-linea bg-pagina py-14 sm:py-16">
        <div className="contenedor">
          <SectionHeading id="ejes" eyebrow={t("ejesEyebrow")} title={t("ejesTitle")} lead={pick(SITE.statement, locale)} />
          <ul className="mt-9 grid gap-5 md:grid-cols-3">
            {EJES.map((eje, i) => {
              const Icon = EJE_ICON[eje.id];
              const tono = EJE_TONO[EJE_COLOR[eje.id]];
              return (
                <li key={eje.id} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="tarjeta relative overflow-hidden p-6">
                  <span className={cn("absolute inset-x-0 top-0 h-1", tono.bar)} aria-hidden />
                  <span className={cn("hexagono flex h-12 w-[2.6rem] items-center justify-center", tono.tile)}>
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="mt-4 text-lg font-bold">{pick(eje.title, locale)}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-cuerpo">{pick(eje.text, locale)}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Enfoque */}
      <section aria-labelledby="enfoque" className="bg-superficie py-14 sm:py-16">
        <div className="contenedor">
          <SectionHeading id="enfoque" eyebrow={t("enfoqueEyebrow")} title={t("enfoqueTitle")} lead={pick(DESCRIPCION.objeto, locale)} />
          <ol className="mt-9 grid gap-5 lg:grid-cols-3">
            {enfoque.map(({ Icon, title, text }, i) => (
              <li key={title} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="relative">
                <div className="h-full rounded-lg border border-linea bg-pagina p-6">
                  <Icon className="h-6 w-6 text-petroleo" aria-hidden />
                  <h3 className="mt-3 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-[0.95rem] leading-relaxed text-cuerpo">{text}</p>
                </div>
                {i < enfoque.length - 1 && (
                  <ArrowRight
                    className="absolute -right-[1.1rem] top-1/2 z-10 hidden h-5 w-5 -translate-y-1/2 text-teja lg:block"
                    aria-hidden
                  />
                )}
              </li>
            ))}
          </ol>
          <Link href={href(locale, "/el-proyecto")} className="enlace mt-7 inline-flex items-center gap-1.5">
            {t("more")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>

      {/* Objetivos */}
      <section aria-labelledby="objetivos" className="border-y border-linea bg-tintado py-14 sm:py-16">
        <div className="contenedor">
          <SectionHeading id="objetivos" eyebrow={t("objetivosEyebrow")} title={t("objetivosTitle")} />
          <ul className="mt-8 grid gap-5 md:grid-cols-3">
            {OBJETIVOS.map((o, i) => {
              const Icon = OBJETIVO_ICON[o.id];
              return (
                <li key={o.id} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="flex gap-4 rounded-lg bg-superficie p-6 shadow-tarjeta">
                  <Icon className="mt-0.5 h-6 w-6 shrink-0 text-teja" aria-hidden />
                  <p className="font-display text-lg font-bold leading-snug text-tinta">{pick(o.text, locale)}</p>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      {/* Red de instituciones */}
      <section aria-labelledby="red" className="bg-superficie py-14 sm:py-16">
        <div className="contenedor">
          <SectionHeading
            id="red"
            eyebrow={t("redEyebrow")}
            title={F.redTitle[locale](cifras.instituciones, cifras.paises)}
            lead={t("redLead")}
          />
          <div className="mt-9 grid gap-8 md:grid-cols-[2fr_1fr_1fr]">
            {paises.map(({ pais, instituciones }) => (
              <div key={pais} data-reveal>
                <h3 className="border-b border-linea pb-2 font-sans text-sm font-semibold text-tenue">{pick(PAISES[pais], locale)}</h3>
                <ul className="mt-3 space-y-3">
                  {instituciones.map((i) => (
                    <li key={i.id}>
                      <a href={i.url} target="_blank" rel="noopener noreferrer" className="font-medium text-tinta hover:text-petroleo">
                        {pick(i.name, locale)}
                      </a>
                      <span className="block text-sm text-tenue">{F.member[locale](i.miembros)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <Link href={href(locale, "/equipo")} className="boton-contorno mt-9">
            {t("meetTeam")}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
