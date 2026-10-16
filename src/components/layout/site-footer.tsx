import Image from "next/image";
import Link from "next/link";
import { Mail } from "lucide-react";
import { ENTIDADES, LOGO_FINANCIACION } from "@/content/entidades";
import { LEGAL_NAV, NAV, UI } from "@/content/ui";
import { SITE } from "@/content/site";
import { href, pick, type Locale } from "@/lib/i18n";

/**
 * Pie en tres bandas: logos del instituto y los grupos, financiación (con los
 * logos y el texto obligatorios de la AEI) y la banda oscura con navegación.
 * Los logos van sobre placas blancas en los dos temas, para respetar sus
 * colores institucionales.
 */
export function SiteFooter({ locale }: { locale: Locale }) {
  return (
    <footer className="mt-auto">
      <section aria-labelledby="pie-entidades" className="border-t border-linea bg-superficie py-10">
        <div className="contenedor">
          <h2 id="pie-entidades" className="text-center font-sans text-sm font-medium text-tenue">
            {pick(UI.entities, locale)}
          </h2>
          <ul className="mt-5 flex flex-wrap items-center justify-center gap-4">
            {ENTIDADES.map((e) => {
              const name = pick(e.name, locale);
              return (
                <li key={e.id}>
                  <a
                    href={e.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title={name}
                    className="flex h-[5.25rem] items-center rounded-md border border-linea bg-white px-5 transition hover:-translate-y-0.5 hover:shadow-tarjeta"
                  >
                    <Image
                      src={e.logo}
                      alt={name}
                      width={e.width}
                      height={e.height}
                      style={{ height: e.h }}
                      className="w-auto"
                    />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </section>

      <section aria-labelledby="pie-financiacion" className="border-t border-linea bg-pagina py-8">
        <div className="contenedor grid items-center gap-6 lg:grid-cols-[minmax(0,30rem)_1fr]">
          <h2 id="pie-financiacion" className="sr-only">
            {pick(UI.funding, locale)}
          </h2>
          <div className="rounded-md border border-linea bg-white p-3">
            <Image
              src={LOGO_FINANCIACION.src}
              alt={pick(LOGO_FINANCIACION.alt, locale)}
              width={LOGO_FINANCIACION.width}
              height={LOGO_FINANCIACION.height}
              className="h-auto w-full"
            />
          </div>
          <p className="text-sm leading-relaxed text-tenue">{pick(SITE.funding, locale)}</p>
        </div>
      </section>

      <div className="bg-inverso text-white/75">
        <div className="contenedor grid gap-10 py-12 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Image src="/brand/quality-logo-claro.png" alt="QUALITY" width={495} height={200} className="h-12 w-auto" />
            <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70">{pick(SITE.summary, locale)}</p>
            {SITE.email && (
              <p className="mt-4 flex items-center gap-2.5 text-sm">
                <Mail className="h-4 w-4 text-teja" aria-hidden />
                <a href={`mailto:${SITE.email}`} className="transition-colors hover:text-white">
                  {SITE.email}
                </a>
              </p>
            )}
          </div>
          <nav aria-label={pick(UI.sections, locale)}>
            <h2 className="font-sans text-sm font-medium text-white/55">{pick(UI.sections, locale)}</h2>
            <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {NAV.map((item) => (
                <li key={item.path}>
                  <Link href={href(locale, item.path)} className="transition-colors hover:text-white">
                    {pick(item.label, locale)}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
        <div className="border-t border-white/10">
          <div className="contenedor flex flex-col gap-3 py-5 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
            <ul className="flex flex-wrap gap-x-5 gap-y-2">
              {LEGAL_NAV.map((item) => (
                <li key={item.path}>
                  <Link href={href(locale, item.path)} className="transition-colors hover:text-white">
                    {pick(item.label, locale)}
                  </Link>
                </li>
              ))}
            </ul>
            <p>
              © {SITE.year} QUALITY, {pick(UI.rights, locale)}
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
