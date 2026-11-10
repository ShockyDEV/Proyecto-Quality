/**
 * Prepara una imagen en el navegador antes de subirla: la endereza según la
 * cámara, la recorta en cuadrado si hace falta (fotos del equipo) y la reduce
 * a `max` píxeles. Sale en JPEG (con fondo blanco si tenía transparencia).
 */
export async function prepararImagen(file: File, { max, cuadrada = false }: { max: number; cuadrada?: boolean }) {
  if (!file.type.startsWith("image/")) throw new Error("El archivo no es una imagen");
  const img = await createImageBitmap(file, { imageOrientation: "from-image" });
  let sx = 0;
  let sy = 0;
  let sw = img.width;
  let sh = img.height;
  if (cuadrada) {
    const lado = Math.min(img.width, img.height);
    sx = (img.width - lado) / 2;
    sy = (img.height - lado) / 2;
    sw = sh = lado;
  }
  const escala = Math.min(1, max / Math.max(sw, sh));
  const w = Math.round(sw * escala);
  const h = Math.round(sh * escala);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("No se puede procesar la imagen en este navegador");
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, w, h);
  img.close();
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85));
  if (!blob) throw new Error("No se ha podido preparar la imagen");
  return { blob, url: URL.createObjectURL(blob) };
}
