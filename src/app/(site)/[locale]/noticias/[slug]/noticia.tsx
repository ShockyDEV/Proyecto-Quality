import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { conBase, fechaLarga, noticia, noticias } from "@/content/noticias";
import { withBase } from "@/lib/base-path";
import { href, LOCALES, pick, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string; slug: string }> };

/**
 * Ficha de una noticia. La página está repartida en page.static.tsx (versión
 * estática: solo las noticias que hay al exportar) y page.server.tsx (servidor
 * de solis: también las que se guardan después, sin recompilar).
 *
 * Sin noticias, la exportación estática no admite una ruta dinámica vacía:
 * se genera una página «_» que da 404 y scripts/build-static.mjs la borra.
 */
const VACIA = "_";

export function generateStaticParams() {
  const slugs = noticias().length ? noticias().map((n) => n.slug) : [VACIA];
  return LOCALES.flatMap((locale) => slugs.map((slug) => ({ locale, slug })));
}

const T = {
  news: { es: "Noticias", en: "News" },
  back: { es: "Todas las noticias", en: "All news" },
  soloEs: {
    es: "",
    en: "This news item is only available in Spanish.",
  },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  const locale: Locale = raw === "en" ? "en" : "es";
  const n = noticia(slug);
  if (!n) return {};
  return pageMetadata(locale, `/noticias/${slug}`, pick(n.title, locale), pick(n.summary, locale));
}

export default async function Noticia({ params }: Props) {
  const { locale: raw, slug } = await params;
  const locale: Locale = raw === "en" ? "en" : "es";
  const n = noticia(slug);
  if (!n) notFound();
  // Sin versión inglesa propia, la página en inglés muestra el texto en español
  const lang = locale === "en" && !n.english ? "es" : locale;

  return (
    <>
      <PageHeader eyebrow={fechaLarga(n.date, locale)} title={pick(n.title, locale)} lead={pick(n.summary, locale)} />

      <article lang={lang} className="bg-superficie py-12 sm:py-14">
        <div className="contenedor max-w-3xl">
          {lang !== locale && <p className="mb-6 text-sm italic text-tenue">{T.soloEs[locale]}</p>}
          {n.image && (
            <figure className="mb-8">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={withBase(n.image)} alt={n.imageAlt ?? ""} className="w-full rounded-lg border border-linea" />
            </figure>
          )}
          <div className="texto-noticia" dangerouslySetInnerHTML={{ __html: conBase(pick(n.html, locale)) }} />
          <p className="mt-12 border-t border-linea pt-6">
            <Link href={href(locale, "/noticias")} className="enlace inline-flex items-center gap-1.5 text-sm">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              {T.back[locale]}
            </Link>
          </p>
        </div>
      </article>
    </>
  );
}
