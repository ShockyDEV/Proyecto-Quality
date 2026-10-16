import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-page";
import { ACCESIBILIDAD } from "@/content/legal";
import { pick } from "@/lib/i18n";
import { localeFrom, pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFrom(params);
  return { ...pageMetadata(locale, "/accesibilidad", pick(ACCESIBILIDAD.title, locale), pick(ACCESIBILIDAD.intro, locale)), robots: { index: false } };
}

export default async function Accesibilidad({ params }: Props) {
  const locale = await localeFrom(params);
  return <LegalPage doc={ACCESIBILIDAD} locale={locale} />;
}
