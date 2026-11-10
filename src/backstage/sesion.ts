import { descifrar } from "../../scripts/cifrado.mjs";
import { withBase } from "@/lib/base-path";
import { comprobarAcceso, MODO_LOCAL } from "./github";

/**
 * Entrada al backstage: la contraseña descifra el token de GitHub guardado en
 * public/backstage/acceso.json (ver scripts/cifrado.mjs). El token solo vive
 * en la pestaña abierta (sessionStorage): al cerrarla, hay que volver a entrar.
 */
export interface Sesion {
  nombre: string;
  token: string;
}

const CLAVE = "quality-backstage";

export function sesionGuardada(): Sesion | null {
  try {
    const s = sessionStorage.getItem(CLAVE);
    return s ? (JSON.parse(s) as Sesion) : null;
  } catch {
    return null;
  }
}

export function salir() {
  try {
    sessionStorage.removeItem(CLAVE);
  } catch {
    /* sin almacenamiento: no hay nada que borrar */
  }
}

async function usuarios(): Promise<{ nombre: string; token: string }[]> {
  // En modo local, primero el acceso de prueba (scripts/backstage-acceso.mjs --local)
  const archivos = MODO_LOCAL ? ["acceso.local.json", "acceso.json"] : ["acceso.json"];
  for (const f of archivos) {
    try {
      const res = await fetch(withBase(`/backstage/${f}`), { cache: "no-store" });
      if (!res.ok) continue;
      const { usuarios } = (await res.json()) as { usuarios?: { nombre: string; token: string }[] };
      if (usuarios?.length) return usuarios;
    } catch {
      /* se prueba el siguiente */
    }
  }
  return [];
}

export async function entrar(clave: string): Promise<Sesion> {
  const lista = await usuarios();
  if (!lista.length) throw new Error("El acceso al backstage todavía no está configurado. Avisa a quien gestiona la web.");
  for (const u of lista) {
    const token = await descifrar(u.token, clave);
    if (!token) continue;
    let puede = false;
    try {
      puede = await comprobarAcceso(token);
    } catch (e) {
      throw new Error(e instanceof Error ? e.message : "No se ha podido comprobar el acceso con GitHub.");
    }
    if (!puede) throw new Error("El acceso ya no tiene permiso para publicar. Avisa a quien gestiona la web.");
    const sesion = { nombre: u.nombre, token };
    try {
      sessionStorage.setItem(CLAVE, JSON.stringify(sesion));
    } catch {
      /* sin almacenamiento: la sesión dura lo que la página */
    }
    return sesion;
  }
  throw new Error("La contraseña no es correcta.");
}
