import Home, { generateMetadata as metadataPortada } from "../(site)/[locale]/page";

// Portada en español en «/» (ver layout.server.tsx)
const ES = Promise.resolve({ locale: "es" });

export function generateMetadata() {
  return metadataPortada({ params: ES });
}

export default function Portada() {
  return <Home params={ES} />;
}
