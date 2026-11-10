// Tipos de scripts/cifrado.mjs (cifrado del token del backstage).
export function cifrar(texto: string, clave: string): Promise<string>;
export function descifrar(blob: string, clave: string): Promise<string | null>;
