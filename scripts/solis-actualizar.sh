#!/usr/bin/env bash
# Trae de GitHub lo último de main al clon de solis. Si solo cambia contenido
# (contenido/ y public/media/), lo aplica y regenera los datos de la web
# (scripts/contenido.mjs): el servidor de Next los lee en cada página, así que
# el cambio sale al instante, sin recompilar. Si cambia código, no lo toca y
# lo deja para scripts/solis-servidor.sh, que recompila y reinicia.
#
# Lo llaman el backstage (ruta /api/actualizar, nada más guardar) y el cron
# (solis-servidor.sh, cada ~5 s), siempre con el mismo cerrojo:
#   flock -w 30 /tmp/quality-publicar.lock bash scripts/solis-actualizar.sh
#
# Escribe en la salida un JSON: {"sha", "incluye": [commits publicados],
# "recompilar": true|false, "error": "…" si algo falla}.
set -uo pipefail

cd "${QUALITY_REPO:-$HOME/apps/quality-web}" || exit 1
export PATH="$HOME/.local/node/bin:$PATH"

json() {
  printf '{"sha":"%s","incluye":[%s],"recompilar":%s%s}\n' "$(git rev-parse HEAD)" \
    "$(git log --format='"%H"' -n 100 | paste -sd,)" "$1" "${2:+,\"error\":\"$2\"}"
}

if ! git fetch -q origin main 2> /dev/null; then
  json false "No se ha podido consultar GitHub"
  exit 0
fi
[ "$(git rev-parse HEAD)" = "$(git rev-parse origin/main)" ] && { json false; exit 0; }

# ¿Algo fuera del contenido? Entonces hay que recompilar
if git diff --name-only HEAD origin/main | grep -qvE '^(contenido/|public/media/)'; then
  json true
  exit 0
fi

git reset -q --hard origin/main
if node scripts/contenido.mjs > /tmp/quality-contenido.log 2>&1; then
  json false
else
  # Los datos anteriores siguen en uso; el detalle, en /tmp/quality-contenido.log
  json false "El contenido tiene errores"
fi
