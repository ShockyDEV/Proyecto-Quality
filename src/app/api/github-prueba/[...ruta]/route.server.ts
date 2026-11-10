import { createHash, randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from "node:fs";
import path from "node:path";
import { NextResponse, type NextRequest } from "next/server";
import { escribirGenerado } from "../../../../../scripts/contenido.mjs";

/**
 * SOLO EN DESARROLLO (*.server.ts no existe en la versión estática): imita la
 * parte de la API de GitHub que usa el backstage, sobre la copia local del
 * repositorio. Acepta solo el token de prueba de .backstage-local.json
 * (`npm run backstage:acceso -- --local`), escribe solo en contenido/ y
 * public/media/ y, tras cada cambio, regenera el contenido como haría la
 * publicación (si falla la validación, la «publicación» falla).
 */
export const dynamic = "force-dynamic";

const ROOT = process.cwd();
const ESCRIBIBLE = /^(contenido|public\/media)\//;
// En desarrollo Next recarga este módulo entre peticiones: el resultado de
// cada «publicación» se guarda en globalThis para no perderlo.
const g = globalThis as { __githubPrueba?: Map<string, boolean> };
const resultados = (g.__githubPrueba ??= new Map<string, boolean>());

const shaGit = (buf: Buffer) => createHash("sha1").update(`blob ${buf.length}\0`).update(buf).digest("hex");
const json = (data: unknown, status = 200) => NextResponse.json(data, { status });

function autorizado(req: NextRequest) {
  const archivo = path.join(ROOT, ".backstage-local.json");
  if (!existsSync(archivo)) return false;
  const { token } = JSON.parse(readFileSync(archivo, "utf8"));
  return req.headers.get("authorization") === `Bearer ${token}`;
}

function rutaSegura(rel: string) {
  const abs = path.resolve(ROOT, rel);
  if (!abs.startsWith(ROOT + path.sep)) throw new Error("ruta fuera del repositorio");
  return abs;
}

function regenerar() {
  const { errores } = escribirGenerado(ROOT) as { errores: string[] };
  if (errores.length) console.warn("[github-prueba] el contenido tiene errores:\n  " + errores.join("\n  "));
  const commit = randomBytes(20).toString("hex");
  resultados.set(commit, errores.length === 0);
  return commit;
}

type Ctx = { params: Promise<{ ruta: string[] }> };

async function partes(ctx: Ctx) {
  const { ruta } = await ctx.params;
  // repos/<owner>/<repo>/<resto…>
  const [, , , ...resto] = ruta.map(decodeURIComponent);
  return resto;
}

export async function GET(req: NextRequest, ctx: Ctx) {
  if (!autorizado(req)) return json({ message: "Bad credentials" }, 401);
  const resto = await partes(ctx);
  if (resto.length === 0) return json({ permissions: { push: true } });
  if (resto[0] === "actions") {
    const commit = req.nextUrl.searchParams.get("head_sha") ?? "";
    if (!resultados.has(commit)) return json({ workflow_runs: [] });
    return json({
      workflow_runs: [{ name: "Web en GitHub Pages", status: "completed", conclusion: resultados.get(commit) ? "success" : "failure" }],
    });
  }
  if (resto[0] !== "contents") return json({ message: "Not Found" }, 404);
  const rel = resto.slice(1).join("/");
  const abs = rutaSegura(rel);
  if (!existsSync(abs)) return json({ message: "Not Found" }, 404);
  if (statSync(abs).isDirectory()) {
    return json(
      readdirSync(abs).map((name) => {
        const p = path.join(abs, name);
        const dir = statSync(p).isDirectory();
        return { name, path: `${rel}/${name}`, sha: dir ? "" : shaGit(readFileSync(p)), type: dir ? "dir" : "file" };
      }),
    );
  }
  const buf = readFileSync(abs);
  return json({ name: path.basename(abs), path: rel, sha: shaGit(buf), content: buf.toString("base64"), encoding: "base64" });
}

export async function PUT(req: NextRequest, ctx: Ctx) {
  if (!autorizado(req)) return json({ message: "Bad credentials" }, 401);
  const resto = await partes(ctx);
  const rel = resto.slice(1).join("/");
  if (resto[0] !== "contents" || !ESCRIBIBLE.test(rel)) return json({ message: "Forbidden" }, 403);
  const { content, sha } = (await req.json()) as { content: string; sha?: string };
  const abs = rutaSegura(rel);
  if (existsSync(abs) && shaGit(readFileSync(abs)) !== sha) return json({ message: "sha does not match" }, 409);
  if (!existsSync(abs) && sha) return json({ message: "Not Found" }, 404);
  mkdirSync(path.dirname(abs), { recursive: true });
  const buf = Buffer.from(content, "base64");
  writeFileSync(abs, buf);
  return json({ commit: { sha: regenerar() }, content: { sha: shaGit(buf) } }, 201);
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  if (!autorizado(req)) return json({ message: "Bad credentials" }, 401);
  const resto = await partes(ctx);
  const rel = resto.slice(1).join("/");
  if (resto[0] !== "contents" || !ESCRIBIBLE.test(rel)) return json({ message: "Forbidden" }, 403);
  const { sha } = (await req.json()) as { sha: string };
  const abs = rutaSegura(rel);
  if (!existsSync(abs)) return json({ message: "Not Found" }, 404);
  if (shaGit(readFileSync(abs)) !== sha) return json({ message: "sha does not match" }, 409);
  rmSync(abs);
  return json({ commit: { sha: regenerar() } });
}
