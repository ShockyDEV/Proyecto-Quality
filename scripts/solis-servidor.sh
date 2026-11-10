#!/usr/bin/env bash
# Web de QUALITY en solis, servida por Next (`next start`) en 127.0.0.1:3041
# detrás de Apache (https://solis.usal.es/quality/). La lanza cada minuto el
# cron de oper (`crontab -l`) y, durante ese minuto:
#
#   - arranca el servidor si no está en marcha (al encender solis, si se cae…);
#   - cada ~5 s trae de GitHub lo último (scripts/solis-actualizar.sh): el
#     contenido sale al instante; si cambia el código, recompila en
#     .next-nuevo y cambia de versión con un reinicio de pocos segundos.
#
# El backstage no espera a este bucle: nada más guardar llama a
# /api/actualizar, que hace lo mismo que solis-actualizar.sh.
#
#   ~/apps/quality-web   clon del repositorio (y public/media, que sirve Apache)
#   ~/.local/node        Node, instalado sin sudo
#   ~/quality-servidor.log  registro del servidor y de las recompilaciones
set -uo pipefail

REPO="${QUALITY_REPO:-$HOME/apps/quality-web}"
PUERTO=3041
BASE=/quality
URL="https://solis.usal.es$BASE"
LOG="$HOME/quality-servidor.log"
PID="$HOME/.quality-servidor.pid"
CERROJO=/tmp/quality-publicar.lock
export PATH="$HOME/.local/node/bin:$PATH"
export NEXT_TELEMETRY_DISABLED=1
# Lo mismo al compilar que al servir (la subcarpeta y estas variables se fijan al compilar)
export PAGES_BASE_PATH="$BASE" NEXT_PUBLIC_SITE_URL="$URL" NEXT_PUBLIC_PUBLICACION=solis

# Una sola vuelta del bucle a la vez
exec 8> /tmp/quality-servidor.lock
flock -n 8 || exit 0
cd "$REPO" || exit 1

log() { echo "$(date '+%F %T') $*" >> "$LOG"; }

en_marcha() { [ -f "$PID" ] && kill -0 "$(cat "$PID")" 2> /dev/null; }

arrancar() {
  [ -d .next-servidor ] || return 1
  # 8>&- 9>&-: el servidor no debe quedarse con los cerrojos de este script
  NEXT_DIST_DIR=.next-servidor QUALITY_ACTUALIZAR="$REPO/scripts/solis-actualizar.sh" \
    nohup node node_modules/next/dist/bin/next start -H 127.0.0.1 -p "$PUERTO" >> "$LOG" 2>&1 8>&- 9>&- &
  echo $! > "$PID"
  log "servidor arrancado (pid $!)"
}

parar() {
  en_marcha && kill "$(cat "$PID")" && sleep 2
  rm -f "$PID"
}

# Recompila con lo último de main y cambia de versión (con el cerrojo cogido)
recompilar() {
  local lock_antes
  lock_antes=$(sha1sum package-lock.json | cut -d' ' -f1)
  git reset -q --hard origin/main
  log "recompilando $(git rev-parse --short HEAD)"
  if [ ! -d node_modules ] || [ "$lock_antes" != "$(sha1sum package-lock.json | cut -d' ' -f1)" ]; then
    npm ci --no-audit --no-fund >> "$LOG" 2>&1 || { log "npm ci falló"; return 1; }
  fi
  node scripts/contenido.mjs >> "$LOG" 2>&1 || { log "el contenido tiene errores: no se recompila"; return 1; }
  rm -rf .next-nuevo
  # (sin Turbopack: en modo servidor no aplica el cargador de imágenes propio)
  if NEXT_DIST_DIR=.next-nuevo node node_modules/next/dist/bin/next build > /tmp/quality-build.log 2>&1; then
    parar
    rm -rf .next-servidor && mv .next-nuevo .next-servidor
    arrancar
    log "publicada la versión $(git rev-parse --short HEAD)"
  else
    tail -n 30 /tmp/quality-build.log >> "$LOG"
    log "FALLO al recompilar: sigue la versión anterior"
  fi
}

# Ejecuta una función con el cerrojo compartido con /api/actualizar
con_cerrojo() { (flock -w 60 9 || exit 1; "$@") 9> "$CERROJO"; }

# Primera vez (o se borró la compilación): recompilar
if [ ! -d .next-servidor ]; then
  git fetch -q origin main && con_cerrojo recompilar
fi
en_marcha || arrancar

while [ "$SECONDS" -lt 54 ]; do
  salida=$(flock -w 30 "$CERROJO" bash scripts/solis-actualizar.sh 2> /dev/null)
  if [[ "$salida" == *'"recompilar":true'* ]]; then
    con_cerrojo recompilar
  fi
  en_marcha || arrancar
  sleep 5
done
exit 0
