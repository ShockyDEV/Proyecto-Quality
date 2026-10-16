import type { Metadata } from "next";
import { LegalPage } from "@/components/ui/legal-page";
import { AVISO_LEGAL } from "@/content/legal";
import { pick } from "@/lib/i18n";
import { localeFrom, pageMetadata } from "@/lib/metadata";

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await localeFrom(params);
  return { ...pageMetadata(locale, "/aviso-legal", pick(AVISO_LEGAL.title, locale), pick(AVISO_LEGAL.intro, locale)), robots: { index: false } };
}

export default async function Aviso({ params }: Props) {
  const locale = await localeFrom(params);
  return <LegalPage doc={AVISO_LEGAL} locale={locale} />;
}
