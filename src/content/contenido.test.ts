import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { equipo, iniciales, INSTITUCIONES, tipoPerfil } from "@/content/equipo";
import { href, stripLocale } from "@/lib/i18n";

// El contenido se edita desde el backstage: aquí solo se
// comprueba lo que tiene que cumplirse siempre (scripts/contenido.mjs ya lo
// valida al generar; ver también generador.test.ts).
describe("equipo", () => {
  it("cada persona pertenece a una institución conocida", () => {
    const ids = new Set(INSTITUCIONES.map((i) => i.id));
    for (const p of equipo()) expect(ids.has(p.institution), p.name).toBe(true);
  });

  it("no hay nombres repetidos", () => {
    expect(new Set(equipo().map((p) => p.name)).size).toBe(equipo().length);
  });

  it("cada foto enlazada existe en public/", () => {
    for (const p of equipo()) {
      if (!p.photo) continue;
      expect(existsSync(path.join(process.cwd(), "public", p.photo)), p.name).toBe(true);
    }
  });

  it("rotula el enlace según el sitio del perfil", () => {
    expect(tipoPerfil("https://produccioncientifica.usal.es/investigadores/1/detalle").es).toBe("Portal de Investigación USAL");
    expect(tipoPerfil("https://orcid.org/0000-0000-0000-0000").es).toBe("ORCID");
    expect(tipoPerfil("https://example.org/cv").es).toBe("Perfil");
  });

  it("iniciales: nombre y primer apellido, sin partículas", () => {
    expect(iniciales("Mª José Rodríguez Conde")).toBe("MR");
    expect(iniciales("Alba María del Brio Nieto")).toBe("AB");
    expect(iniciales("Eva Fernández de Labastida")).toBe("EF");
    expect(iniciales("Martin Brown")).toBe("MB");
  });
});

describe("rutas", () => {
  it("español sin prefijo, inglés en /en, siempre con barra final", () => {
    expect(href("es", "/")).toBe("/");
    expect(href("en", "/")).toBe("/en/");
    expect(href("es", "/equipo")).toBe("/equipo/");
    expect(href("en", "/equipo")).toBe("/en/equipo/");
    expect(href("en", "/el-proyecto#enfoque")).toBe("/en/el-proyecto/#enfoque");
  });

  it("stripLocale deshace href", () => {
    expect(stripLocale("/en/equipo/")).toBe("/equipo/");
    expect(stripLocale("/en/")).toBe("/");
    expect(stripLocale("/equipo/")).toBe("/equipo/");
  });
});
