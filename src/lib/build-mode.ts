/**
 * La web se compila de dos maneras con el mismo código:
 *
 * - Desarrollo (`npm run dev`): servidor de Next con el middleware de idiomas.
 * - Estática (STATIC_EXPORT=1, `npm run build:static`): la web ya generada,
 *   para GitHub Pages. Los ficheros *.server.* (middleware, 404 de desarrollo)
 *   no existen en este modo y los *.static.* solo existen en él (ver
 *   `pageExtensions` en next.config.ts).
 */
export const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";
