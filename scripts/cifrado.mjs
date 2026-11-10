/**
 * Cifrado del token de GitHub del backstage (navegador y Node, con Web Crypto).
 *
 * El token (de grano fino: solo escribir en este repositorio) se guarda
 * CIFRADO en public/backstage/acceso.json, que es público; la contraseña de
 * quien edita es la clave. AES-GCM lleva autenticación: con una contraseña
 * equivocada, el descifrado falla y ya está (no hay que guardar la contraseña
 * ni su huella en ningún sitio).
 *
 * Como el cifrado es público, se puede probar contraseñas sin límite fuera de
 * la web: PBKDF2 con 600 000 iteraciones hace cada intento lento, pero la
 * defensa de verdad es una contraseña larga (el script pide 12 caracteres o
 * más). Si se filtra, se revoca el token en GitHub y se cifra uno nuevo.
 *
 * Formato: QBX1:<base64url( sal(16) | iv(12) | cifrado )>
 */
const PREFIJO = "QBX1:";
const ITERACIONES = 600000;

const subtle = () => {
  const s = globalThis.crypto?.subtle;
  if (!s) throw new Error("Este navegador no permite descifrar (falta Web Crypto)");
  return s;
};

function aBase64url(bytes) {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function deBase64url(texto) {
  const b64 = texto.replace(/-/g, "+").replace(/_/g, "/") + "===".slice((texto.length + 3) % 4);
  const bin = atob(b64);
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

async function derivarClave(clave, sal) {
  const base = await subtle().importKey("raw", new TextEncoder().encode(clave), "PBKDF2", false, ["deriveKey"]);
  return subtle().deriveKey(
    { name: "PBKDF2", salt: sal, iterations: ITERACIONES, hash: "SHA-256" },
    base,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"],
  );
}

export async function cifrar(texto, clave) {
  const sal = globalThis.crypto.getRandomValues(new Uint8Array(16));
  const iv = globalThis.crypto.getRandomValues(new Uint8Array(12));
  const cifrado = new Uint8Array(
    await subtle().encrypt({ name: "AES-GCM", iv }, await derivarClave(clave, sal), new TextEncoder().encode(texto)),
  );
  const todo = new Uint8Array(sal.length + iv.length + cifrado.length);
  todo.set(sal, 0);
  todo.set(iv, sal.length);
  todo.set(cifrado, sal.length + iv.length);
  return PREFIJO + aBase64url(todo);
}

/** Devuelve el texto, o null si la contraseña no es la buena. */
export async function descifrar(blob, clave) {
  if (typeof blob !== "string" || !blob.startsWith(PREFIJO)) return null;
  const todo = deBase64url(blob.slice(PREFIJO.length));
  const sal = todo.slice(0, 16);
  const iv = todo.slice(16, 28);
  try {
    const claro = await subtle().decrypt({ name: "AES-GCM", iv }, await derivarClave(clave, sal), todo.slice(28));
    return new TextDecoder().decode(claro);
  } catch {
    return null;
  }
}
