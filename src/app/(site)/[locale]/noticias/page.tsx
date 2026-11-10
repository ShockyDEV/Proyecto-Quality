import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Newspaper } from "lucide-react";
import { PageHeader } from "@/components/ui/page-header";
import { fechaLarga, noticias } from "@/content/noticias";
import { withBase } from "@/lib/base-path";
import { href, pick } from "@/lib/i18n";
import { localeFrom, pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

const T = {
  title: { es: "Noticias", en: "News" },
  heading: { es: "Novedades del proyecto", en: "Project news" },
  lead: {
    es: "Actividades, encuentros y resultados del proyecto QUALITY.",
    en: "Activities, meetings and results from the QUALITY project.",
  },
  empty: { es: "Todavía no hay noticias publicadas.", en: "No news has been published yet." },
  read: { es: "Leer la noticia", en: "Read more" },
} as const;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFrom(params);
  return {
    ...pageMetadata(locale, "/noticias", T.title[locale], T.lead[locale]),
    ...(noticias().length === 0 ? { robots: { index: false } } : {}),
  };
}

export default async function Noticias({ params }: Props) {
  const locale = await localeFrom(params);

  return (
    <>
      <PageHeader eyebrow={T.title[locale]} title={T.heading[locale]} lead={T.lead[locale]} />

      <section className="bg-superficie py-14 sm:py-16">
        <div className="contenedor max-w-4xl">
          {noticias().length === 0 ? (
            <div className="tarjeta flex items-center gap-4 p-7">
              <Newspaper className="h-8 w-8 shrink-0 text-petroleo" aria-hidden />
              <p className="leading-relaxed text-cuerpo">{T.empty[locale]}</p>
            </div>
          ) : (
            <ul className="space-y-6">
              {noticias().map((n) => {
                const enlace = href(locale, `/noticias/${n.slug}`);
                return (
                  <li key={n.slug} data-reveal className="tarjeta overflow-hidden sm:flex">
                    {n.image && (
                      // Imágenes subidas desde el backstage: sin tamaño conocido, van tal cual
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={withBase(n.image)}
                        alt=""
                        loading="lazy"
                        className="aspect-[16/10] w-full object-cover sm:aspect-auto sm:w-64 sm:shrink-0"
                      />
                    )}
                    <div className="flex flex-col p-6">
                      <p className="text-sm text-tenue">
                        <time dateTime={n.date}>{fechaLarga(n.date, locale)}</time>
                      </p>
                      <h2 className="mt-1.5 text-xl font-bold leading-snug">
                        <Link href={enlace} className="hover:text-petroleo">
                          {pick(n.title, locale)}
                        </Link>
                      </h2>
                      <p className="mt-2 leading-relaxed text-cuerpo">{pick(n.summary, locale)}</p>
                      <Link href={enlace} className="enlace mt-4 inline-flex items-center gap-1.5 self-start text-sm">
                        {T.read[locale]}
                        <ArrowRight className="h-4 w-4" aria-hidden />
                        <span className="sr-only">: {pick(n.title, locale)}</span>
                      </Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </section>
    </>
  );
}
