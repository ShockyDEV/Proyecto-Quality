import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-page";
import { PRIVACIDAD } from "@/content/legal";
import { pick } from "@/lib/i18n";
import { localeFrom, pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFrom(params);
  return { ...pageMetadata(locale, "/privacidad", pick(PRIVACIDAD.title, locale), pick(PRIVACIDAD.intro, locale)), robots: { index: false } };
}

export default async function Privacidad({ params }: Props) {
  const locale = await localeFrom(params);
  return <LegalPage doc={PRIVACIDAD} locale={locale} />;
}
