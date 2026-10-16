import type { LegalDoc } from "@/content/legal";
import { pick, type Locale } from "@/lib/i18n";
import { PageHeader } from "./page-header";

/** Página legal sencilla (aviso legal, privacidad, accesibilidad). */
export function LegalPage({ doc, locale }: { doc: LegalDoc; locale: Locale }) {
  return (
    <>
      <PageHeader eyebrow="QUALITY" title={pick(doc.title, locale)} lead={pick(doc.intro, locale)} />
      <section className="bg-superficie py-14 sm:py-16">
        <div className="contenedor max-w-3xl space-y-10">
          {doc.sections.map((s) => (
            <div key={s.heading.es}>
              <h2 className="text-xl font-bold">{pick(s.heading, locale)}</h2>
              <div className="prosa mt-3">
                {pick(s.body, locale).map((p) => (
                  <p key={p.slice(0, 32)}>{p}</p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
