import type { Metadata } from "next";
import { ArrowUpRight } from "lucide-react";
import { HexAvatar } from "@/components/ui/hex-avatar";
import { PageHeader } from "@/components/ui/page-header";
import { SectionHeading } from "@/components/ui/section-heading";
import {
  cifrasEquipo,
  EQUIPO,
  institucion,
  PAISES,
  porInstitucion,
  ROLES,
  tipoPerfil,
  type Persona,
  type Rol,
} from "@/content/equipo";
import { UI } from "@/content/ui";
import { pick, type Locale } from "@/lib/i18n";
import { localeFrom, pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

const T = {
  title: { es: "Equipo", en: "Team" },
  heading: { es: "Quién hace QUALITY", en: "Who is behind QUALITY" },
  lead: {
    es: (p: number, i: number) => `${p} personas de ${i} instituciones de España, Irlanda y Portugal.`,
    en: (p: number, i: number) => `${p} people from ${i} institutions in Spain, Ireland and Portugal.`,
  },
  direccion: { es: "Dirección", en: "Leadership" },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFrom(params);
  const c = cifrasEquipo();
  return pageMetadata(locale, "/equipo", T.title[locale], T.lead[locale](c.personas, c.instituciones));
}

function ProfileLink({ person, locale }: { person: Persona; locale: Locale }) {
  if (!person.profile) return null;
  return (
    <a
      href={person.profile}
      target="_blank"
      rel="noopener noreferrer"
      className="mt-1 inline-flex items-center gap-1 text-sm text-petroleo hover:underline"
    >
      {pick(tipoPerfil(person.profile), locale)}
      <ArrowUpRight className="h-3.5 w-3.5" aria-hidden />
      <span className="sr-only">
        {person.name} {pick(UI.newTab, locale)}
      </span>
    </a>
  );
}

function RoleSection({ role, locale }: { role: Exclude<Rol, "ip">; locale: Locale }) {
  const groups = porInstitucion(role);
  const id = `rol-${role}`;
  return (
    <section aria-labelledby={id}>
      <h2 id={id} className="text-2xl font-bold">
        {pick(ROLES[role].title, locale)}
      </h2>
      <div className="mt-6 space-y-9">
        {groups.map(({ institution, people }) => (
          <div key={institution.id}>
            <h3 className="flex flex-wrap items-baseline gap-x-2 border-b border-linea pb-2 text-base font-bold">
              {pick(institution.name, locale)}
              {institution.country !== "es" && (
                <span className="font-sans text-sm font-normal text-tenue">{pick(PAISES[institution.country], locale)}</span>
              )}
            </h3>
            <ul className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-3">
              {people.map((p) => (
                <li key={p.name} data-reveal className="flex items-center gap-3.5">
                  <HexAvatar name={p.name} tone={role === "investigador" ? "petroleo" : "verde"} />
                  <div className="min-w-0">
                    <p className="font-semibold leading-snug text-tinta">{p.name}</p>
                    <ProfileLink person={p} locale={locale} />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}

export default async function Equipo({ params }: Props) {
  const locale = await localeFrom(params);
  const c = cifrasEquipo();
  const ips = EQUIPO.filter((p) => p.role === "ip");

  return (
    <>
      <PageHeader eyebrow={T.title[locale]} title={T.heading[locale]} lead={T.lead[locale](c.personas, c.instituciones)} />

      <section aria-labelledby="direccion" className="border-b border-linea bg-pagina py-12 sm:py-14">
        <div className="contenedor">
          <SectionHeading id="direccion" eyebrow={T.direccion[locale]} title={pick(ROLES.ip.title, locale)} />
          <ul className="mt-7 grid gap-5 md:grid-cols-2">
            {ips.map((p, i) => (
              <li key={p.name} data-reveal style={{ ["--d" as string]: `${i * 90}ms` }} className="tarjeta flex items-center gap-5 p-6">
                <HexAvatar name={p.name} tone="teja" size="lg" />
                <div className="min-w-0">
                  <p className="font-display text-xl font-bold leading-tight text-tinta">{p.name}</p>
                  <p className="mt-1 text-sm text-tenue">
                    {pick(ROLES.ip.singular, locale)}, {pick(institucion(p.institution).name, locale)}
                  </p>
                  <ProfileLink person={p} locale={locale} />
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <div className="bg-superficie py-12 sm:py-14">
        <div className="contenedor space-y-14">
          <RoleSection role="investigador" locale={locale} />
          <RoleSection role="trabajo" locale={locale} />
        </div>
      </div>
    </>
  );
}
