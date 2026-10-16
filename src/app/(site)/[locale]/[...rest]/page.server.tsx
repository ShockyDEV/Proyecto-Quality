import { notFound } from "next/navigation";

/** Cualquier ruta pública desconocida → 404 dentro del layout del sitio. */
export default function CatchAll() {
  notFound();
}
