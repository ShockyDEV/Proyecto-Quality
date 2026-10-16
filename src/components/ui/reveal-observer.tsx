"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Aparición al hacer scroll: cualquier elemento
 * con `data-reveal` aparece con fundido y desplazamiento cuando entra en
 * pantalla. El retardo se da con la variable CSS `--d` (p. ej. 90 ms por
 * tarjeta para que entren en cadena). Variantes: data-reveal="izq" | "escala".
 *
 * El script REVEAL_BOOT (en <head>) marca <html data-revela="si"> antes de
 * pintar para que no haya parpadeo; si este componente no llegara a cargarse,
 * el propio script lo desactiva a los 4 s y todo queda visible.
 */
export function RevealObserver() {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    (window as unknown as { __revealListo?: boolean }).__revealListo = true;
    if (root.dataset.revela !== "si" || typeof IntersectionObserver === "undefined") return;

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        }
      },
      { rootMargin: "0px 0px -6% 0px" },
    );
    const scan = () => document.querySelectorAll("[data-reveal]:not(.is-in)").forEach((el) => io.observe(el));
    scan();
    // Contenido que llega después de la carga
    const mo = new MutationObserver(scan);
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
    };
  }, [pathname]);

  return null;
}
