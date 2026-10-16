import type { Metadata } from "next";
import { NotFoundContent } from "@/components/layout/not-found-content";

/**
 * Solo existe en la versión estática (*.static.tsx): se genera como una página
 * más y scripts/build-static.mjs la copia a 404.html, que GitHub Pages sirve
 * para cualquier dirección que no exista.
 */
export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: false },
};

export default function PaginaNoEncontrada() {
  return <NotFoundContent />;
}
