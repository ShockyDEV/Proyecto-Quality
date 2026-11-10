import { execFile } from "node:child_process";
import { NextResponse } from "next/server";

/**
 * SOLO EN EL SERVIDOR DE SOLIS (QUALITY_ACTUALIZAR = ruta de
 * scripts/solis-actualizar.sh; sin ella, 404): el backstage llama aquí nada
 * más guardar, para que solis traiga el cambio de GitHub en el momento en vez
 * de esperar al cron. Responde qué commits están ya publicados.
 *
 * No necesita sesión: solo sincroniza con lo que ya está en GitHub. Para que
 * no se pueda saturar, como mucho una vez cada 2 s (las demás peticiones
 * reciben la última respuesta).
 */
export const dynamic = "force-dynamic";

const g = globalThis as { __qualityActualizar?: { cuando: number; respuesta: Promise<unknown> } };

function actualizar(script: string): Promise<unknown> {
  return new Promise((resolve) => {
    execFile("flock", ["-w", "30", "/tmp/quality-publicar.lock", "bash", script], { timeout: 45000 }, (err, stdout) => {
      try {
        resolve(JSON.parse(stdout));
      } catch {
        resolve({ error: err ? "No se ha podido actualizar" : "Respuesta no válida" });
      }
    });
  });
}

export async function POST() {
  const script = process.env.QUALITY_ACTUALIZAR;
  if (!script) return NextResponse.json({ message: "Not Found" }, { status: 404 });
  const ahora = Date.now();
  if (!g.__qualityActualizar || ahora - g.__qualityActualizar.cuando > 2000) {
    g.__qualityActualizar = { cuando: ahora, respuesta: actualizar(script) };
  }
  return NextResponse.json(await g.__qualityActualizar.respuesta, { headers: { "Cache-Control": "no-store" } });
}
