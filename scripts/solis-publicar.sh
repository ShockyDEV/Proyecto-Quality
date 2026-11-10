#!/usr/bin/env bash
# Publicación de la web en solis (además de GitHub Pages).
#
# La lanza cada minuto el cron de oper (`crontab -l`); dentro del minuto mira
# GitHub cuatro veces (cada ~15 s). Si main tiene un commit nuevo (un guardado
# del backstage, un push…), compila la versión estática aquí mismo y la cambia
# de golpe: así un cambio sale en unos 20-35 s, sin esperar a GitHub Actions.
#
#   ~/apps/quality-web          clon del repositorio (solo para compilar)
#   ~/.local/node               Node, instalado sin sudo
#   /var/www/quality/versiones  las últimas versiones compiladas
#   /var/www/quality/actual     enlace a la versión publicada (lo sirve Apache)
#
# Cada versión lleva version.json (qué commits incluye) para que el backstage
# sepa cuándo está publicado su cambio; si una compilación falla, se escribe
# fallo.json en la versión publicada, que sigue en línea.
#
# Variables: QUALITY_BASE (subcarpeta pública, «/quality»; vacía con dominio
# propio) y QUALITY_URL (dirección pública, para canonical y sitemap).
set -uo pipefail

REPO="${QUALITY_REPO:-$HOME/apps/quality-web}"
DESTINO="${QUALITY_DESTINO:-/var/www/quality}"
BASE="${QUALITY_BASE-/quality}"
URL="${QUALITY_URL:-https://solis.usal.es$BASE}"
LOG="$DESTINO/publicar.log"
export PATH="$HOME/.local/node/bin:$PATH"
export NEXT_TELEMETRY_DISABLED=1

# Una sola ejecución a la vez
exec 9>/tmp/quality-publicar.lock
flock -n 9 || exit 0

log() { echo "$(date '+%F %T') $*" >> "$LOG"; }

publicar() {
  local lock_antes sha rel tmp
  lock_antes=$(sha1sum package-lock.json 2>/dev/null | cut -d' ' -f1)
  git reset -q --hard origin/main
  sha=$(git rev-parse HEAD)
  if [ ! -d node_modules ] || [ "$lock_antes" != "$(sha1sum package-lock.json | cut -d' ' -f1)" ]; then
    log "npm ci"
    npm ci --no-audit --no-fund >> "$LOG" 2>&1 || { log "npm ci falló"; return 1; }
  fi
  log "compilando $sha"
  if PAGES_BASE_PATH="$BASE" NEXT_PUBLIC_SITE_URL="$URL" NEXT_PUBLIC_PUBLICACION=solis \
    npm run -s build:static > /tmp/quality-build.log 2>&1; then
    rel="$DESTINO/versiones/$sha"
    rm -rf "$rel" && cp -r out "$rel"
    printf '{"sha":"%s","fecha":"%s","incluye":[%s]}\n' "$sha" "$(date -Iseconds)" \
      "$(git log --format='"%H"' -n 100 | paste -sd,)" > "$rel/version.json"
    ln -sfn "$rel" "$DESTINO/actual.nuevo" && mv -Tf "$DESTINO/actual.nuevo" "$DESTINO/actual"
    # Se guardan las tres últimas versiones
    ls -1dt "$DESTINO"/versiones/*/ | tail -n +4 | xargs -r rm -rf
    log "publicado $sha"
  else
    tail -n 40 /tmp/quality-build.log >> "$LOG"
    if [ -d "$DESTINO/actual" ]; then
      printf '{"sha":"%s","fecha":"%s","incluye":[%s]}\n' "$sha" "$(date -Iseconds)" \
        "$(git log --format='"%H"' -n 100 | paste -sd,)" > "$DESTINO/actual/fallo.json"
    fi
    log "FALLO al compilar $sha (sigue publicada la versión anterior)"
  fi
}

cd "$REPO" || exit 1
mkdir -p "$DESTINO/versiones"
for i in 1 2 3 4; do
  if git fetch -q origin main 2>> "$LOG"; then
    if [ ! -e "$DESTINO/actual" ] || [ "$(git rev-parse HEAD)" != "$(git rev-parse origin/main)" ]; then
      publicar
    fi
  fi
  [ "$i" -lt 4 ] && sleep 14
done
exit 0
