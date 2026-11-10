import { describe, expect, it } from "vitest";
import { cifrar, descifrar } from "../../scripts/cifrado.mjs";
import { leerNoticia } from "../../scripts/comun.mjs";
import { NOTICIAS, TEXTOS, TRAYECTORIA } from "./esquemas";
import { escribirRuta, limpiar, validar } from "./valores";

describe("cifrado del token", () => {
  it("la contraseña buena lo abre y una mala no", async () => {
    const blob = await cifrar("github_pat_prueba", "una contraseña bastante larga");
    expect(blob.startsWith("QBX1:")).toBe(true);
    expect(await descifrar(blob, "una contraseña bastante larga")).toBe("github_pat_prueba");
    expect(await descifrar(blob, "otra contraseña cualquiera")).toBeNull();
    expect(await descifrar("no es un cifrado", "x")).toBeNull();
  });
});

describe("valores del formulario", () => {
  it("escribe por ruta sin tocar el original y crea lo que falta", () => {
    const a = { ejes: { estudiantes: { titulo: { es: "E" } } }, objetivos: [{ texto: { es: "Uno" } }] };
    const b = escribirRuta(a, "ejes.estudiantes.titulo.en", "S");
    const c = escribirRuta(b, "objetivos.1.texto.es", "Dos");
    expect(c).toEqual({ ejes: { estudiantes: { titulo: { es: "E", en: "S" } } }, objetivos: [{ texto: { es: "Uno" } }, { texto: { es: "Dos" } }] });
    expect(a.ejes.estudiantes.titulo).toEqual({ es: "E" });
  });

  it("limpia lo vacío antes de guardar", () => {
    expect(limpiar({ a: " x ", b: "", c: { es: "", en: "" }, d: [{ e: "" }, { e: "f" }], g: false, h: 0 })).toEqual({
      a: "x",
      d: [{ e: "f" }],
      g: false,
      h: 0,
    });
  });

  it("valida como el generador: obligatorios, enlaces, fechas y español de los textos bilingües", () => {
    const errores = validar(NOTICIAS.campos, { titulo: "", fecha: "10/11/2026", resumen: "R" });
    expect(errores).toEqual({ titulo: "Este campo es obligatorio", fecha: "La fecha no es válida" });
    const tray = validar(TRAYECTORIA.campos, { proyectos: [{ acronimo: "X", anio: 2020, titulo: { en: "Only English" }, web: "www.x.es" }] });
    expect(tray).toEqual({
      "proyectos.0.titulo.es": "Falta el texto en español",
      "proyectos.0.web": "Tiene que ser una dirección completa (https://…)",
    });
    expect(validar(TEXTOS.campos, { correo: "no-es-correo" })).toMatchObject({ correo: "El correo no es válido" });
  });
});

describe("noticias", () => {
  it("lo que escribe el backstage lo lee igual el generador", () => {
    const valores = {
      titulo: "Jornada: «QUALITY» en Oporto",
      fecha: "2026-11-10",
      resumen: "Una línea: con dos puntos.",
      imagen: "/media/noticias/foto.jpg",
      ingles: { titulo: "Meeting in Porto" },
      body: "Texto con **negrita**.\n\nOtro párrafo.",
    };
    const texto = NOTICIAS.escribir(limpiar(valores) as Record<string, unknown>);
    const { cabecera, cuerpo } = leerNoticia(texto);
    expect(typeof cabecera.fecha).toBe("string");
    expect(cabecera).toEqual({
      titulo: valores.titulo,
      fecha: valores.fecha,
      resumen: valores.resumen,
      imagen: valores.imagen,
      ingles: { titulo: "Meeting in Porto" },
    });
    expect(cuerpo).toBe(valores.body);
    expect(NOTICIAS.leer(texto)).toEqual(valores);
  });

  it("nombre de archivo de una noticia nueva: fecha y título sin tildes", () => {
    expect(NOTICIAS.archivo({ fecha: "2026-11-10", titulo: "¡Jornada en Oporto!" })).toBe("2026-11-10-jornada-en-oporto");
  });
});
