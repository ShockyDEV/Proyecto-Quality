# Web del proyecto QUALITY

Web del proyecto de investigación **QUALITY** (PID2024-156950NB-I00): *Evaluación de la calidad de los entornos de aprendizaje centrados en el estudiante en Universidad. Transferencia hacia la formación docente y la orientación académica.* Sustituye a la web en WordPress de quality.grial.eu.

Es una web **estática**: sin base de datos ni panel. Parte del sistema de la web de ieTIC 2027 (Next.js exportado a HTML y publicado en GitHub Pages) con la estética de la web del IUCE y la paleta del logo de QUALITY.

| | |
|---|---|
| Marco | Next.js 15 (App Router, `output: "export"`) + React 19 + TypeScript |
| Estilos | Tailwind CSS 3 con tokens en variables CSS (modo claro y oscuro) |
| Tipografías | Manrope (titulares) e Inter (texto), autoalojadas con `next/font` |
| Idiomas | Español sin prefijo (`/equipo/`) e inglés en `/en/` |
| Publicación | GitHub Pages, con `.github/workflows/pages.yml` |

## Puesta en marcha

```bash
npm install
npm run dev               # http://localhost:3030
npm run build:static      # genera out/ (lo que se publica)
npm run preview:static    # sirve out/ en http://localhost:3031 como GitHub Pages
```

Comprobaciones: `npm run typecheck`, `npx eslint src --ext .ts,.tsx` y `npm test` (las ejecuta también la CI).

## Dónde se cambia cada cosa

Todo el contenido está en `src/content/`, con cada texto en los dos idiomas (`{ es, en }`):

| Fichero | Contenido |
|---|---|
| `site.ts` | Título, referencia, convocatoria, texto de financiación y correo de contacto |
| `proyecto.ts` | Ejes, objetivos y descripción del proyecto |
| `equipo.ts` | Personas (rol, institución, perfil) e instituciones |
| `trayectoria.ts` | Proyectos anteriores |
| `publicaciones.ts` | Publicaciones: mientras la lista esté vacía, la página no sale en el menú |
| `entidades.ts` | Logos del pie y de la financiación |
| `legal.ts` | Aviso legal, privacidad y accesibilidad |
| `ui.ts` | Menú y textos de interfaz |

Las cifras de la portada (personas, instituciones, países) se calculan a partir de `equipo.ts`.

## Cómo está montado

- **Idiomas sin duplicar páginas**: todas viven en `src/app/(site)/[locale]/`. En desarrollo, `src/middleware.server.ts` reescribe `/ruta/` a `/es/ruta/`; en la versión estática, `scripts/build-static.mjs` saca el español a la raíz de `out/`. El conmutador ES/EN usa `<a>` nativo a propósito (con `<Link>`, el router de Next reutilizaba el árbol del otro idioma).
- **Ficheros por modo**: `*.server.*` solo existen en desarrollo (middleware, 404 interna) y `*.static.*` solo en la exportación (la página que se copia a `404.html`). Ver `pageExtensions` en `next.config.ts`.
- **Direcciones de la web anterior**: barra final en todas las rutas (`trailingSlash`), y `/proyectos-anteriores/` redirige a `/trayectoria/` con una página de *meta refresh* que genera `build-static.mjs`.
- **Tokens**: `src/app/globals.css` define la paleta en variables (`--c-petroleo`, `--c-teja`…) y la redefine bajo `.dark`; `tailwind.config.ts` las expone como clases (`bg-petroleo`, `text-teja-texto`…). El verde azulado y la teja del logo no llegan al contraste AA para texto: para texto se usan sus variantes `-texto`.
- **Tema**: un script en `<head>` aplica el modo oscuro antes de pintar (preferencia guardada o la del sistema); el botón de la cabecera lo cambia y lo recuerda en `localStorage`.

## Publicación en GitHub Pages

1. Crear el repositorio y, en *Settings → Pages*, elegir *GitHub Actions* como origen.
2. Cada push a `main` compila y publica. Sin dominio propio, la web queda en `https://<usuario>.github.io/<repo>/` (el flujo añade la subcarpeta a enlaces e imágenes).
3. Para `quality.grial.eu`: quien gestione el DNS de grial.eu crea el registro `quality CNAME <usuario>.github.io` y se pone el dominio en *Settings → Pages → Custom domain*.

## Pendiente de las investigadoras principales

- Fechas de inicio y fin, y correo de contacto del proyecto (`SITE.email`).
- Fórmula exacta de financiación según la resolución (la web anterior cita a la vez FEDER y FSE+, y un plan estatal «2021-2027»).
- Título oficial en inglés, si lo hay (el de la web es traducción nuestra).
- Años de EFI cuatro (2015) y EFI cinco (2012), al revés que su numeración.
- Fotos del equipo (hoy, avatares con iniciales) y publicaciones.
- Revisión de los textos legales.
