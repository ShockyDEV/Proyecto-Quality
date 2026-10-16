import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ChartColumn, Globe2, MessagesSquare, Share2 } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import { DESCRIPCION, EJES, EJE_COLOR } from "@/content/proyecto";
import { EQUIPO, institucion } from "@/content/equipo";
import { SITE } from "@/content/site";
import { href, pick } from "@/lib/i18n";
import { localeFrom, pageMetadata } from "@/lib/metadata";
import { cn } from "@/lib/cn";

type Props = { params: Promise<{ locale: string }> };

const T = {
  title: { es: "El proyecto", en: "The project" },
  heading: { es: "Qué estudia QUALITY", en: "What QUALITY studies" },
  objetoEyebrow: { es: "Objeto de estudio", en: "Focus" },
  objetoTitle: { es: "Estudiantes, entorno de aprendizaje y profesorado", en: "Students, learning environment and teaching staff" },
  enfoqueEyebrow: { es: "Enfoque", en: "Approach" },
  enfoqueTitle: { es: "Dos miradas complementarias", en: "Two complementary perspectives" },
  transferEyebrow: { es: "Transferencia", en: "Transfer" },
  transferTitle: { es: "De los resultados a la formación docente", en: "From findings to teacher training" },
  colaboracion: { es: "Colaboración internacional", en: "International collaboration" },
  ficha: { es: "Ficha del proyecto", en: "Project details" },
  reference: { es: "Referencia", en: "Reference" },
  call: { es: "Convocatoria", en: "Call" },
  plan: { es: "Plan", en: "Plan" },
  ip: { es: "Investigadoras principales", en: "Principal investigators" },
  fundingTitle: { es: "Financiación", en: "Funding" },
  team: { es: "Conoce al equipo", en: "Meet the team" },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFrom(params);
  return pageMetadata(locale, "/el-proyecto", T.title[locale], pick(DESCRIPCION.objeto, locale));
}

const TONO = {
  verde: "border-verde",
  petroleo: "border-petroleo",
  teja: "border-teja",
} as const;

export default async function Proyecto({ params }: Props) {
  const locale = await localeFrom(params);
  const t = (k: keyof typeof T): string => T[k][locale];
  const ips = EQUIPO.filter((p) => p.role === "ip");
  const enfoqueIcon = [ChartColumn, MessagesSquare];

  const ficha = [
    { term: t("reference"), value: SITE.reference },
    { term: t("call"), value: pick(SITE.call, locale) },
    { term: t("plan"), value: pick(SITE.plan, locale) },
    { term: t("ip"), value: ips.map((p) => `${p.name} (${institucion(p.institution).short})`).join(", ") },
  ];

  return (
    <>
      <PageHeader eyebrow={t("title")} title={t("heading")} lead={pick(DESCRIPCION.objeto, locale)} />

      <section className="bg-superficie py-14 sm:py-16">
        <div className="contenedor grid gap-12 lg:grid-cols-[1fr_20rem]">
          <div className="min-w-0 space-y-14">
            {/* Objeto */}
            <div>
              <SectionHeading eyebrow={t("objetoEyebrow")} title={t("objetoTitle")} />
              <ul className="mt-7 space-y-4">
                {EJES.map((eje) => (
                  <li key={eje.id} data-reveal className={cn("border-l-[3px] pl-4", TONO[EJE_COLOR[eje.id]])}>
                    <h3 className="text-base font-bold">{pick(eje.title, locale)}</h3>
                    <p className="mt-1 leading-relaxed text-cuerpo">{pick(eje.text, locale)}</p>
                  </li>
                ))}
              </ul>
            </div>

            {/* Enfoque */}
            <div>
              <SectionHeading eyebrow={t("enfoqueEyebrow")} title={t("enfoqueTitle")} />
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                {DESCRIPCION.enfoque.map((e, i) => {
                  const Icon = enfoqueIcon[i];
                  return (
                    <div key={e.id} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="tarjeta p-6">
                      <Icon className="h-6 w-6 text-petroleo" aria-hidden />
                      <h3 className="mt-3 text-lg font-bold">{pick(e.title, locale)}</h3>
                      <p className="mt-2 leading-relaxed text-cuerpo">{pick(e.text, locale)}</p>
                      {"nota" in e && e.nota && <p className="mt-3 text-sm text-tenue">{pick(e.nota, locale)}</p>}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Transferencia y colaboración */}
            <div>
              <SectionHeading eyebrow={t("transferEyebrow")} title={t("transferTitle")} />
              <div className="mt-7 grid gap-5 md:grid-cols-2">
                <div data-reveal className="rounded-lg bg-tintado p-6">
                  <Share2 className="h-6 w-6 text-teja" aria-hidden />
                  <p className="mt-3 leading-relaxed text-cuerpo">{pick(DESCRIPCION.transferencia, locale)}</p>
                </div>
                <div data-reveal style={{ ["--d" as string]: "90ms" }} className="rounded-lg bg-tintado p-6">
                  <Globe2 className="h-6 w-6 text-teja" aria-hidden />
                  <h3 className="mt-3 text-base font-bold">{t("colaboracion")}</h3>
                  <p className="mt-1 leading-relaxed text-cuerpo">{pick(DESCRIPCION.colaboracion, locale)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Ficha */}
          <aside className="lg:pt-1">
            <div className="tarjeta sticky top-[calc(var(--header-h)+1.5rem)] p-6">
              <h2 className="text-lg font-bold">{t("ficha")}</h2>
              <dl className="mt-4 space-y-4 text-sm">
                {ficha.map((f) => (
                  <div key={f.term}>
                    <dt className="font-medium text-tenue">{f.term}</dt>
                    <dd className="mt-0.5 text-tinta">{f.value}</dd>
                  </div>
                ))}
              </dl>
              <h3 className="mt-6 border-t border-linea pt-4 font-sans text-sm font-medium text-tenue">{t("fundingTitle")}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-cuerpo">{pick(SITE.funding, locale)}</p>
              <Link href={href(locale, "/equipo")} className="enlace mt-5 inline-flex items-center gap-1.5 text-sm">
                {t("team")}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
