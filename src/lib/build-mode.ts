/**
 * La web se compila de dos maneras con el mismo código:
 *
 * - Desarrollo (`npm run dev`) y servidor de solis: Next con las reescrituras
 *   de idiomas de next.config.ts.
 * - Estática (STATIC_EXPORT=1, `npm run build:static`): la web ya generada,
 *   para GitHub Pages. Los ficheros *.server.* (portada, 404 y rutas de API del servidor)
 *   no existen en este modo y los *.static.* solo existen en él (ver
 *   `pageExtensions` en next.config.ts).
 */
export const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";
