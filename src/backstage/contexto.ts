"use client";

import { createContext, useContext } from "react";

/** Lo que necesitan los campos de imagen del formulario. */
export interface ContextoBackstage {
  /** Sube ya una imagen (las del texto de las noticias) y devuelve su ruta pública (/media/…) */
  subirImagen: (blob: Blob, carpeta: string, nombre: string) => Promise<string>;
  /** Imágenes subidas en esta sesión que la web publicada aún no tiene: ruta → URL local */
  vistaPrevia: Record<string, string>;
}

export const Contexto = createContext<ContextoBackstage>({
  subirImagen: async () => {
    throw new Error("Sin sesión");
  },
  vistaPrevia: {},
});

export const useBackstage = () => useContext(Contexto);
