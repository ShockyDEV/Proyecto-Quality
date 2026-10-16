import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { cifrasEquipo, EQUIPO, iniciales, INSTITUCIONES, tipoPerfil } from "@/content/equipo";
import { TRAYECTORIA } from "@/content/trayectoria";
import { href, stripLocale } from "@/lib/i18n";

describe("equipo", () => {
  it("cada persona pertenece a una institución conocida", () => {
    const ids = new Set(INSTITUCIONES.map((i) => i.id));
    for (const p of EQUIPO) expect(ids.has(p.institution), p.name).toBe(true);
  });

  it("no hay nombres repetidos", () => {
    expect(new Set(EQUIPO.map((p) => p.name)).size).toBe(EQUIPO.length);
  });

  it("los perfiles son direcciones https válidas", () => {
    for (const p of EQUIPO) {
      if (!p.profile) continue;
      expect(new URL(p.profile).protocol, p.name).toBe("https:");
      expect(tipoPerfil(p.profile).es, p.name).not.toBe("Perfil");
    }
  });

  it("cada foto enlazada existe en public/", () => {
    for (const p of EQUIPO) {
      if (!p.photo) continue;
      expect(existsSync(path.join(process.cwd(), "public", p.photo)), p.name).toBe(true);
    }
  });

  it("cifras de la web anterior: 26 personas, 8 instituciones, 3 países", () => {
    expect(cifrasEquipo()).toEqual({ personas: 26, instituciones: 8, paises: 3 });
  });

  it("iniciales: nombre y primer apellido, sin partículas", () => {
    expect(iniciales("Mª José Rodríguez Conde")).toBe("MR");
    expect(iniciales("Alba María del Brio Nieto")).toBe("AB");
    expect(iniciales("Eva Fernández de Labastida")).toBe("EF");
    expect(iniciales("Martin Brown")).toBe("MB");
  });
});

describe("trayectoria", () => {
  it("solo hay un proyecto actual y es QUALITY", () => {
    const actuales = TRAYECTORIA.filter((p) => p.current);
    expect(actuales.map((p) => p.acronym)).toEqual(["QUALITY"]);
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
