import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { generar, slugify } from "../../scripts/contenido.mjs";

/** Contenido mínimo válido en una carpeta temporal, con los cambios que pida cada prueba. */
function montar(cambios: Record<string, unknown> = {}) {
  const root = mkdtempSync(path.join(tmpdir(), "quality-contenido-"));
  const escribir = (rel: string, valor: unknown) => {
    const f = path.join(root, rel);
    mkdirSync(path.dirname(f), { recursive: true });
    writeFileSync(f, typeof valor === "string" ? valor : JSON.stringify(valor));
  };
  const b = (es: string, en = "") => ({ es, en });
  const base: Record<string, unknown> = {
    "src/content/instituciones.json": [{ id: "usal", name: b("USAL"), short: "USAL", country: "es", url: "https://usal.es" }],
    "contenido/textos.json": {
      titulo: b("Título", "Title"),
      subtitulo: b("Subtítulo"),
      presentacion: b("Presentación"),
      resumen: b("Resumen"),
      convocatoria: b("Convocatoria"),
      plan: b("Plan"),
      financiacion: b("Financiación"),
      correo: "",
      ejes: {
        estudiantes: { titulo: b("E"), texto: b("E") },
        entorno: { titulo: b("A"), texto: b("A") },
        profesorado: { titulo: b("P"), texto: b("P") },
      },
      objetivos: [{ texto: b("Uno") }],
      objeto: b("Objeto"),
      enfoque: { cuantitativo: { titulo: b("C"), texto: b("C") }, cualitativo: { titulo: b("Q"), texto: b("Q") } },
      transferencia: b("T"),
      colaboracion: b("C"),
    },
    "contenido/trayectoria.json": [{ acronimo: "QUALITY", anio: 2024, titulo: b("Q"), actual: true }],
    "contenido/equipo/b.json": { nombre: "Beatriz", rol: "trabajo", institucion: "usal" },
    "contenido/equipo/a.json": { nombre: "Zoe", rol: "ip", institucion: "usal", orden: 1 },
    "contenido/publicaciones/p.json": { anio: 2026, tipo: "congreso", autores: "A, B.", titulo: "T", medio: "M" },
  };
  for (const [rel, valor] of Object.entries({ ...base, ...cambios })) if (valor !== undefined) escribir(rel, valor);
  carpetas.push(root);
  return root;
}
const carpetas: string[] = [];
afterEach(() => {
  for (const c of carpetas.splice(0)) rmSync(c, { recursive: true, force: true });
});

describe("generador de contenido", () => {
  it("acepta el contenido válido, rellena el inglés que falta y ordena", () => {
    const { datos, errores } = generar(montar());
    expect(errores).toEqual([]);
    expect(datos.textos.title).toEqual({ es: "Título", en: "Title" });
    expect(datos.textos.subtitle).toEqual({ es: "Subtítulo", en: "Subtítulo" });
    // «orden» primero; sin orden, al final y por nombre
    expect(datos.equipo.map((p: { name: string }) => p.name)).toEqual(["Zoe", "Beatriz"]);
    expect(datos.indice).toEqual({ publicaciones: 1, noticias: 0 });
  });

  it("explica en castellano lo que falta o no existe", () => {
    const { errores } = generar(
      montar({
        "contenido/equipo/x.json": { nombre: "", rol: "jefa", institucion: "mit", perfil: "www.ejemplo.es", foto: "/media/equipo/no.jpg" },
        "contenido/publicaciones/q.json": { tipo: "congreso", autores: "A", titulo: "T2", medio: "M" },
      }),
    );
    expect(errores).toEqual(
      expect.arrayContaining([
        "contenido/equipo/x.json: falta «Nombre»",
        "contenido/equipo/x.json: el papel «jefa» no existe",
        "contenido/equipo/x.json: la institución «mit» no existe",
        "contenido/equipo/x.json: «Perfil» debe ser una dirección web completa (https://…)",
        "contenido/equipo/x.json: no existe la imagen /media/equipo/no.jpg",
        "contenido/publicaciones/q.json: falta «Año»",
      ]),
    );
  });

  it("detecta nombres repetidos", () => {
    const { errores } = generar(montar({ "contenido/equipo/c.json": { nombre: "Zoe", rol: "trabajo", institucion: "usal" } }));
    expect(errores).toContain("equipo: «Zoe» aparece dos veces");
  });

  it("noticias: Markdown a HTML sin HTML escrito a mano ni enlaces javascript:", () => {
    const md = [
      "---",
      "titulo: Nueva web",
      "fecha: 2026-11-10",
      "resumen: Estrenamos web.",
      "---",
      "Hola **equipo**. <script>alert(1)</script>",
      "",
      "[malo](javascript:alert(1)) y [bueno](https://usal.es)",
    ].join("\n");
    const { datos, errores } = generar(montar({ "contenido/noticias/2026-11-10-Nueva Web.md": md }));
    expect(errores).toEqual([]);
    const [n] = datos.noticias;
    expect(n.slug).toBe("2026-11-10-nueva-web");
    expect(n.date).toBe("2026-11-10");
    expect(n.html.es).toContain("<strong>equipo</strong>");
    expect(n.html.es).not.toContain("<script>");
    expect(n.html.es).not.toContain("javascript:");
    expect(n.html.es).toContain('<a href="https://usal.es" target="_blank" rel="noopener noreferrer">bueno</a>');
    // Sin versión inglesa, se repite la española
    expect(n.english).toBe(false);
    expect(n.title.en).toBe("Nueva web");
  });

  it("noticias: la fecha tiene que ser AAAA-MM-DD", () => {
    const md = "---\ntitulo: X\nfecha: 10/11/2026\nresumen: Y\n---\nTexto";
    const { errores } = generar(montar({ "contenido/noticias/x.md": md }));
    expect(errores).toContain("contenido/noticias/x.md: la fecha debe ser AAAA-MM-DD");
  });

  it("slugify quita tildes y espacios", () => {
    expect(slugify("Jornada en Oporto: ¡éxito!")).toBe("jornada-en-oporto-exito");
  });
});
