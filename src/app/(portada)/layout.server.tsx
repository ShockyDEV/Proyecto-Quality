import SiteLayout, { generateMetadata as metadataSitio } from "../(site)/[locale]/layout";

/**
 * Portada en español en el servidor (desarrollo y solis): la misma web que
 * /[locale] con locale «es», pero en «/» sin reescribir la ruta (con
 * subcarpeta, Next devolvía la portada reescrita vacía). En la exportación
 * estática no existe: build-static.mjs ya saca el español a la raíz.
 */
const ES = Promise.resolve({ locale: "es" });

export { viewport } from "../(site)/[locale]/layout";

export function generateMetadata() {
  return metadataSitio({ params: ES });
}

export default function PortadaLayout({ children }: { children: React.ReactNode }) {
  return <SiteLayout params={ES}>{children}</SiteLayout>;
}
