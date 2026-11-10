# Web del proyecto QUALITY

Web del proyecto de investigación **QUALITY** (PID2024-156950NB-I00): *Evaluación de la calidad de los entornos de aprendizaje centrados en el estudiante en Universidad. Transferencia hacia la formación docente y la orientación académica.* Sustituye a la web en WordPress de quality.grial.eu.

Es una web **estática**, sin base de datos: parte del sistema de la web de ieTIC 2027 (Next.js exportado a HTML y publicado en GitHub Pages) con la estética de la web del IUCE y la paleta del logo de QUALITY. Noticias, publicaciones, equipo y textos se editan desde el **backstage** de la propia web (`/backstage/`), que guarda cada cambio en este repositorio.

| | |
|---|---|
| Marco | Next.js 15 (App Router, `output: "export"`) + React 19 + TypeScript |
| Estilos | Tailwind CSS 3 con tokens en variables CSS (modo claro y oscuro) |
| Tipografías | Manrope (titulares) e Inter (texto), autoalojadas con `next/font` |
| Idiomas | Español sin prefijo (`/equipo/`) e inglés en `/en/` |
| Publicación | GitHub Pages, con `.github/workflows/pages.yml` |
| Edición | Backstage en `/backstage/` (`src/backstage/`), sobre la carpeta `contenido/` |

## Puesta en marcha

```bash
npm install
npm run dev               # http://localhost:3030
npm run build:static      # genera out/ (lo que se publica)
npm run preview:static    # sirve out/ en http://localhost:3031 como GitHub Pages
```

Comprobaciones: `npm run typecheck`, `npx eslint src --ext .ts,.tsx` y `npm test` (las ejecuta también la CI).

## Backstage (edición)

En `/backstage/` (no enlazado desde la web y fuera de los buscadores). Se entra **con una contraseña**, sin cuenta de GitHub. Como en la web del programa de ICED26, no hay servidor: el navegador publica directamente con la API de GitHub. Cada cambio guardado es un commit en `main` («Backstage (nombre): …») y la web se republica sola en uno o dos minutos; el backstage avisa cuando ya está publicada.

| Sección | Archivos |
|---|---|
| Noticias | `contenido/noticias/*.md` (Markdown con cabecera; versión inglesa opcional) |
| Publicaciones | `contenido/publicaciones/*.json` |
| Equipo | `contenido/equipo/*.json` (fotos en `public/media/equipo/`) |
| Textos del proyecto | `contenido/textos.json` |
| Trayectoria | `contenido/trayectoria.json` |

Las imágenes se preparan en el navegador antes de subirlas (fotos del equipo: recorte cuadrado a 480 px; el resto, 1600 px como mucho) y van a `public/media/`.

`scripts/contenido.mjs` lee `contenido/`, lo **comprueba** (campos obligatorios, instituciones, enlaces, que existan las fotos, fechas…) y escribe `src/content/generado/` (no va a git), que es lo que usa la web. Se ejecuta solo antes de `dev`, `test`, `typecheck` y `build:static`. Si algo no cuadra, para con la lista de errores en castellano: la web no se publica y sigue en línea la versión anterior (el backstage lo avisa y el detalle está en la pestaña *Actions*). El backstage hace las mismas comprobaciones antes de guardar.

### Acceso

El backstage publica con un **token de GitHub de grano fino** que solo puede escribir en este repositorio. Ese token va **cifrado** en `public/backstage/acceso.json` (público) y lo abre la contraseña de cada persona (AES-GCM con PBKDF2 de 600 000 iteraciones, `scripts/cifrado.mjs`). Al entrar, el token solo se guarda en la pestaña abierta.

Para dar acceso a alguien (o cambiar su contraseña):

1. En GitHub → *Settings → Developer settings → Fine-grained tokens → Generate new token*: solo el repositorio **Proyecto-Quality**, con el permiso **Contents: Read and write**, y la caducidad que se quiera.
2. `npm run backstage:acceso` y escribir su nombre, el token y su contraseña (12 caracteres o más). El script comprueba el token y escribe `public/backstage/acceso.json`.
3. Commit y push de ese archivo.

Como el archivo cifrado es público, la defensa es una **contraseña larga**. Si se filtra o alguien deja el proyecto: revocar el token en GitHub, crear otro y repetir el paso 2. Cuando el token caduque, el backstage avisa al entrar.

### Modo local

Con `npm run dev`, `/backstage/` no toca GitHub: un simulador (`src/app/api/github-prueba/`, solo en desarrollo) lee y escribe en la copia local y regenera el contenido. Para entrar hace falta un acceso de prueba: `npm run backstage:acceso -- --local` (crea `public/backstage/acceso.local.json` y `.backstage-local.json`, fuera de git, con un token inventado y la contraseña de prueba).

## Lo que se cambia en el código

| Fichero | Contenido |
|---|---|
| `src/content/instituciones.json` | Instituciones (el backstage las ofrece en el desplegable del equipo) |
| `src/content/site.ts` | Referencia y acrónimo (los textos vienen del backstage) |
| `src/content/equipo.ts` | Papeles del equipo y rótulos de los perfiles |
| `src/content/entidades.ts` | Logos del pie y de la financiación |
| `src/content/legal.ts` | Aviso legal, privacidad y accesibilidad |
| `src/content/ui.ts` | Menú y textos de interfaz |

«Publicaciones» y «Noticias» solo salen en el menú cuando hay alguna. Las cifras de la portada (personas, instituciones, países) se calculan a partir del equipo.

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

- Fechas de inicio y fin, y correo de contacto del proyecto (se puede poner desde el backstage, en *Textos del proyecto*).
- Fórmula exacta de financiación según la resolución (la web anterior cita a la vez FEDER y FSE+, y un plan estatal «2021-2027»).
- Título oficial en inglés, si lo hay (el de la web es traducción nuestra).
- Años de EFI cuatro (2015) y EFI cinco (2012), al revés que su numeración.
- Fotos de quien todavía sale con iniciales.
- Revisión de los textos legales.
