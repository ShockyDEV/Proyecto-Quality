/**
 * Cliente de la API de contenidos de GitHub para el backstage: cada guardado
 * es un commit en main, y el flujo «Web en GitHub Pages» republica la web.
 *
 * En desarrollo (`npm run dev`) habla con un simulador
 * (src/app/api/github-prueba/…) que lee y escribe en la copia local del
 * repositorio: así se puede probar todo sin tocar GitHub.
 */
export const REPO = { owner: "ShockyDEV", name: "Proyecto-Quality", branch: "main" };

export const MODO_LOCAL = process.env.NODE_ENV === "development";
const API = MODO_LOCAL ? "/api/github-prueba" : "https://api.github.com";
const BASE_REPO = `${API}/repos/${REPO.owner}/${REPO.name}`;

export class ErrorGitHub extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

export interface Entrada {
  name: string;
  path: string;
  sha: string;
  type: "file" | "dir";
}

const rutaApi = (path: string) => path.split("/").map(encodeURIComponent).join("/");

async function pedir<T>(token: string, url: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      ...init,
      cache: "no-store",
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
        ...(init.body ? { "Content-Type": "application/json" } : {}),
      },
    });
  } catch {
    throw new ErrorGitHub("No hay conexión con GitHub. Comprueba la red y vuelve a intentarlo.", 0);
  }
  if (res.ok) return (res.status === 204 ? undefined : await res.json()) as T;
  const mensajes: Record<number, string> = {
    401: "GitHub no acepta el acceso: el token ha caducado o se ha revocado. Avisa a quien gestiona la web.",
    403: "GitHub no deja hacer este cambio (permisos o demasiadas peticiones). Espera un poco y vuelve a intentarlo.",
    404: "No se encuentra el archivo en GitHub.",
    409: "Alguien ha cambiado este contenido mientras lo editabas. Recarga la lista y vuelve a hacerlo.",
    422: "GitHub ha rechazado el cambio. Recarga la lista y vuelve a intentarlo.",
  };
  throw new ErrorGitHub(mensajes[res.status] ?? `Error de GitHub (${res.status})`, res.status);
}

// ── base64 con UTF-8 ───────────────────────────────────────────────────────
export function aBase64(datos: string | Uint8Array): string {
  const bytes = typeof datos === "string" ? new TextEncoder().encode(datos) : datos;
  let bin = "";
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(bin);
}

function deBase64(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ""));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
}

// ── operaciones ───────────────────────────────────────────────────────────
/** Archivos de una carpeta del repositorio ([] si no existe). */
export async function listar(token: string, carpeta: string): Promise<Entrada[]> {
  try {
    return await pedir<Entrada[]>(token, `${BASE_REPO}/contents/${rutaApi(carpeta)}?ref=${REPO.branch}`);
  } catch (e) {
    if (e instanceof ErrorGitHub && e.status === 404) return [];
    throw e;
  }
}

export async function leer(token: string, path: string): Promise<{ texto: string; sha: string }> {
  const r = await pedir<{ content: string; sha: string }>(token, `${BASE_REPO}/contents/${rutaApi(path)}?ref=${REPO.branch}`);
  return { texto: deBase64(r.content), sha: r.sha };
}

/** Crea o sustituye un archivo (con su sha si ya existe). Devuelve el commit y el nuevo sha. */
export async function guardar(
  token: string,
  path: string,
  contenido: string | Uint8Array,
  mensaje: string,
  sha?: string,
): Promise<{ commit: string; sha: string }> {
  const r = await pedir<{ commit: { sha: string }; content: { sha: string } }>(token, `${BASE_REPO}/contents/${rutaApi(path)}`, {
    method: "PUT",
    body: JSON.stringify({ message: mensaje, content: aBase64(contenido), branch: REPO.branch, ...(sha ? { sha } : {}) }),
  });
  return { commit: r.commit.sha, sha: r.content.sha };
}

export async function borrar(token: string, path: string, sha: string, mensaje: string): Promise<{ commit: string }> {
  const r = await pedir<{ commit: { sha: string } }>(token, `${BASE_REPO}/contents/${rutaApi(path)}`, {
    method: "DELETE",
    body: JSON.stringify({ message: mensaje, sha, branch: REPO.branch }),
  });
  return { commit: r.commit.sha };
}

export type EstadoPublicacion = "esperando" | "en-curso" | "publicado" | "fallo";

/** Estado del flujo que publica la web para un commit. */
export async function estadoPublicacion(token: string, commit: string): Promise<EstadoPublicacion> {
  const r = await pedir<{ workflow_runs: { name: string; status: string; conclusion: string | null }[] }>(
    token,
    `${BASE_REPO}/actions/runs?head_sha=${commit}&per_page=10`,
  );
  const run = r.workflow_runs.find((w) => w.name === "Web en GitHub Pages");
  if (!run) return "esperando";
  if (run.status !== "completed") return "en-curso";
  return run.conclusion === "success" ? "publicado" : "fallo";
}

/** Comprueba que el token sigue sirviendo para escribir en el repositorio. */
export async function comprobarAcceso(token: string): Promise<boolean> {
  const r = await pedir<{ permissions?: { push?: boolean } }>(token, BASE_REPO);
  return !!r.permissions?.push;
}
