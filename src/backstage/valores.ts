import type { Campo, Valores } from "./esquemas";

/**
 * Valores de los formularios: lectura y escritura por ruta («ejes.estudiantes.titulo»,
 * «objetivos.2.texto»), limpieza antes de guardar y comprobaciones (las mismas
 * que hace scripts/contenido.mjs al publicar, para avisar antes).
 */

/** Imagen elegida en el formulario que todavía no se ha subido. */
export interface ImagenPendiente {
  pendiente: true;
  blob: Blob;
  /** URL local para verla antes de subirla */
  url: string;
}

export const esPendiente = (v: unknown): v is ImagenPendiente =>
  typeof v === "object" && v !== null && (v as ImagenPendiente).pendiente === true;

export function leerRuta(obj: unknown, ruta: string): unknown {
  return ruta.split(".").reduce<unknown>((o, k) => (o && typeof o === "object" ? (o as Record<string, unknown>)[k] : undefined), obj);
}

/** Copia con el valor cambiado en la ruta (crea los objetos y listas que falten). */
export function escribirRuta(obj: Valores, ruta: string, valor: unknown): Valores {
  const [k, ...resto] = ruta.split(".");
  const actual = obj as Record<string, unknown>;
  if (resto.length === 0) return { ...actual, [k]: valor };
  const hijo = actual[k];
  const siguienteEsIndice = /^\d+$/.test(resto[0]);
  if (Array.isArray(hijo)) {
    const copia = [...hijo];
    const i = Number(resto[0]);
    copia[i] = resto.length === 1 ? valor : escribirRuta((copia[i] as Valores) ?? {}, resto.slice(1).join("."), valor);
    return { ...actual, [k]: copia };
  }
  const base = (hijo && typeof hijo === "object" ? hijo : siguienteEsIndice ? [] : {}) as Valores;
  return { ...actual, [k]: escribirRuta(base, resto.join("."), valor) };
}

/** Quita lo vacío («», null, objetos sin nada) para que los archivos queden limpios. */
export function limpiar(v: unknown): unknown {
  if (typeof v === "string") return v.trim() === "" ? undefined : v.trim();
  if (v === null || v === undefined) return undefined;
  if (Array.isArray(v)) return v.map(limpiar).filter((x) => x !== undefined);
  if (typeof v === "object") {
    const fuera = Object.fromEntries(
      Object.entries(v as Record<string, unknown>)
        .map(([k, x]) => [k, limpiar(x)] as const)
        .filter(([, x]) => x !== undefined),
    );
    return Object.keys(fuera).length ? fuera : undefined;
  }
  return v;
}

const vacio = (v: unknown) => v === undefined || v === null || (typeof v === "string" && v.trim() === "");

/** Errores por ruta de campo; vacío si todo está bien. */
export function validar(campos: Campo[], valores: unknown, prefijo = ""): Record<string, string> {
  const errores: Record<string, string> = {};
  for (const c of campos) {
    const ruta = prefijo ? `${prefijo}.${c.nombre}` : c.nombre;
    const v = leerRuta(valores, c.nombre);
    switch (c.tipo) {
      case "grupo":
        Object.assign(errores, validar(c.campos, v ?? {}, ruta));
        break;
      case "lista":
        (Array.isArray(v) ? v : []).forEach((item, i) => Object.assign(errores, validar(c.campos, item ?? {}, `${ruta}.${i}`)));
        if (c.obligatorio && !(Array.isArray(v) && v.length)) errores[ruta] = `Añade al menos un ${c.elemento}`;
        break;
      case "bilingue": {
        const es = leerRuta(v, "es");
        const en = leerRuta(v, "en");
        if (vacio(es) && (c.obligatorio || !vacio(en))) errores[`${ruta}.es`] = "Falta el texto en español";
        break;
      }
      case "imagen":
      case "booleano":
      case "markdown":
        break;
      default:
        if (vacio(v)) {
          if (c.obligatorio) errores[ruta] = "Este campo es obligatorio";
          break;
        }
        if (c.tipo === "url" && !/^https?:\/\/\S+$/i.test(String(v).trim())) errores[ruta] = "Tiene que ser una dirección completa (https://…)";
        if (c.tipo === "correo" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v).trim())) errores[ruta] = "El correo no es válido";
        if (c.tipo === "fecha" && (!/^\d{4}-\d{2}-\d{2}$/.test(String(v)) || Number.isNaN(Date.parse(String(v)))))
          errores[ruta] = "La fecha no es válida";
        if (c.tipo === "numero" && !Number.isFinite(Number(v))) errores[ruta] = "Tiene que ser un número";
    }
  }
  return errores;
}
