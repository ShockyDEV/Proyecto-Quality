import type { Metadata, Viewport } from "next";
import "@/app/globals.css";
import { fontVariables } from "@/lib/fonts";
import { THEME_BOOT } from "@/lib/reveal-boot";
import { withBase } from "@/lib/base-path";

/**
 * Backstage (/backstage/): edición de la web por quien tenga la contraseña.
 * Sin idiomas, sin la cabecera ni el pie de la web y fuera de los buscadores.
 * Ver src/backstage/.
 */
export const metadata: Metadata = {
  title: "Backstage | QUALITY",
  robots: { index: false, follow: false },
  icons: { icon: [{ url: withBase("/favicon-32.png"), sizes: "32x32", type: "image/png" }] },
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function BackstageLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_BOOT }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
