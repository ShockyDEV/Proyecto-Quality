import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import "@/app/globals.css";
import { fontVariables } from "@/lib/fonts";
import { SiteHeader } from "@/components/layout/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { RevealObserver } from "@/components/ui/reveal-observer";
import { REVEAL_BOOT, THEME_BOOT } from "@/lib/reveal-boot";
import { isLocale, LOCALES, LOCALE_LABELS, pick, type Locale } from "@/lib/i18n";
import { SITE, siteUrl } from "@/content/site";
import { withBase } from "@/lib/base-path";

/** Solo existen /… (es) y /en/…; cualquier otro prefijo es 404. */
export const dynamicParams = false;
export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Omit<Props, "children">): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale: Locale = isLocale(raw) ? raw : "es";
  const title = `QUALITY | ${pick(SITE.title, locale)}`;
  const description = pick(SITE.summary, locale);
  return {
    metadataBase: new URL(siteUrl()),
    title: { default: title, template: "%s | QUALITY" },
    description,
    applicationName: "QUALITY",
    openGraph: {
      type: "website",
      siteName: "QUALITY",
      title,
      description,
      locale: LOCALE_LABELS[locale].og,
      alternateLocale: LOCALES.filter((l) => l !== locale).map((l) => LOCALE_LABELS[l].og),
    },
    icons: {
      icon: [
        { url: withBase("/favicon-32.png"), sizes: "32x32", type: "image/png" },
        { url: withBase("/favicon.ico"), sizes: "any" },
      ],
      apple: withBase("/apple-touch-icon.png"),
    },
    manifest: withBase("/manifest.webmanifest"),
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FFFFFF" },
    { media: "(prefers-color-scheme: dark)", color: "#0B1A20" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default async function SiteLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    // suppressHydrationWarning: los scripts de <head> añaden data-revela y .dark antes de hidratar
    <html lang={LOCALE_LABELS[locale].htmlLang} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT + REVEAL_BOOT }} />
      </head>
      <body className="flex min-h-dvh flex-col">
        <RevealObserver />
        <SiteHeader locale={locale} />
        <main id="contenido" className="flex-1">
          {children}
        </main>
        <SiteFooter locale={locale} />
      </body>
    </html>
  );
}
