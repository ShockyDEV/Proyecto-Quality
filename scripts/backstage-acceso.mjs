/**
 * Da acceso al backstage a una persona (`npm run backstage:acceso`).
 *
 * Pide su nombre, el token de GitHub y la contraseña que usará para entrar, y
 * guarda el token cifrado con esa contraseña en public/backstage/acceso.json
 * (público; ver scripts/cifrado.mjs). Después hay que hacer commit y push de
 * ese archivo. Para quitarle el acceso a alguien: borrar su entrada y, si
 * pudiera haber guardado el token, revocarlo en GitHub y cifrar uno nuevo.
 *
 * El token, de grano fino, en github.com → Settings → Developer settings →
 * Fine-grained tokens: solo el repositorio Proyecto-Quality, con el permiso
 * «Contents: Read and write».
 *
 * Con --local crea un acceso de PRUEBA para el modo local (`npm run dev`), con
 * un token inventado que solo acepta el simulador de GitHub de desarrollo:
 * public/backstage/acceso.local.json y .backstage-local.json (fuera de git).
 *
 * Sin teclado, los datos se pueden pasar en BACKSTAGE_NOMBRE, BACKSTAGE_TOKEN
 * y BACKSTAGE_CLAVE.
 */
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { createInterface } from "node:readline";
import { fileURLToPath } from "node:url";
import { cifrar, descifrar } from "./cifrado.mjs";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const REPO = "ShockyDEV/Proyecto-Quality";
const local = process.argv.includes("--local");

/** Pregunta por consola; con oculto, no se ve lo que se escribe. */
function preguntar(texto, { oculto = false } = {}) {
  return new Promise((resolve) => {
    const rl = createInterface({ input: process.stdin, output: process.stdout, terminal: true });
    if (oculto) {
      rl._writeToOutput = (s) => {
        if (s.includes(texto)) process.stdout.write(s);
      };
    }
    rl.question(texto, (r) => {
      rl.close();
      if (oculto) process.stdout.write("\n");
      resolve(r.trim());
    });
  });
}

const nombre = process.env.BACKSTAGE_NOMBRE || (await preguntar("Nombre de quien va a editar: "));
if (!nombre) throw new Error("Falta el nombre");

let token;
if (local) {
  token = `prueba-local-${randomBytes(16).toString("hex")}`;
} else {
  token = process.env.BACKSTAGE_TOKEN || (await preguntar("Token de GitHub (no se verá al escribir): ", { oculto: true }));
  if (!/^(github_pat_|ghp_)\w+$/.test(token)) throw new Error("Eso no parece un token de GitHub (empieza por github_pat_)");
  const res = await fetch(`https://api.github.com/repos/${REPO}`, {
    headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" },
  });
  if (!res.ok) throw new Error(`GitHub no acepta el token (${res.status})`);
  const repo = await res.json();
  if (!repo.permissions?.push) throw new Error(`El token no puede escribir en ${REPO}: dale «Contents: Read and write»`);
  console.log(`✓ El token puede escribir en ${REPO}`);
}

const clave = process.env.BACKSTAGE_CLAVE || (await preguntar("Contraseña para entrar al backstage (12 caracteres o más): ", { oculto: true }));
if (clave.length < 12) throw new Error("La contraseña tiene que tener al menos 12 caracteres");
if (!process.env.BACKSTAGE_CLAVE) {
  const otra = await preguntar("Repite la contraseña: ", { oculto: true });
  if (otra !== clave) throw new Error("Las contraseñas no coinciden");
}

const blob = await cifrar(token, clave);
if ((await descifrar(blob, clave)) !== token) throw new Error("El cifrado no se ha podido comprobar");

const archivo = path.join(ROOT, "public/backstage", local ? "acceso.local.json" : "acceso.json");
mkdirSync(path.dirname(archivo), { recursive: true });
const acceso = existsSync(archivo) ? JSON.parse(readFileSync(archivo, "utf8")) : { usuarios: [] };
acceso.usuarios = [...acceso.usuarios.filter((u) => u.nombre !== nombre), { nombre, token: blob }];
writeFileSync(archivo, JSON.stringify(acceso, null, 2) + "\n");
// En modo local se apuntan también la contraseña de prueba, para no olvidarla (archivo fuera de git)
if (local) writeFileSync(path.join(ROOT, ".backstage-local.json"), JSON.stringify({ nombre, token, clave }, null, 2) + "\n");

console.log(`✓ Acceso de ${nombre} guardado en ${path.relative(ROOT, archivo).replaceAll("\\", "/")}`);
if (!local) console.log("  Ahora: git add public/backstage/acceso.json, commit y push.");
