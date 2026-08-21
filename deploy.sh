#!/usr/bin/env bash
# Deploy the current origin/dev branch to the race-day NAS.
# Usage: ./deploy.sh
#
# Requires: sshpass (brew install hudochenkov/sshpass/sshpass | apt/dnf install sshpass)
set -euo pipefail

SSH_HOST_LAN=172.24.160.6
SSH_HOST_TAILSCALE=100.120.91.17
SSH_PORT=1022
SSH_USER=marcos
REMOTE_DIR=/volume1/docker/cliente_administrador_rfid
BRANCH=dev

# Comprueba si un host:puerto acepta conexiones TCP en un plazo corto.
host_reachable() {
  local host="$1"
  timeout 3 bash -c "cat < /dev/null > /dev/tcp/${host}/${SSH_PORT}" 2>/dev/null
}

echo "==> Detectando ruta de acceso al NAS"
if host_reachable "$SSH_HOST_LAN"; then
  SSH_HOST="$SSH_HOST_LAN"
  echo "Usando red local (${SSH_HOST})"
elif host_reachable "$SSH_HOST_TAILSCALE"; then
  SSH_HOST="$SSH_HOST_TAILSCALE"
  echo "Red local no disponible; usando Tailscale (${SSH_HOST})"
else
  echo "No se pudo contactar al NAS ni por red local (${SSH_HOST_LAN}) ni por Tailscale (${SSH_HOST_TAILSCALE})" >&2
  exit 1
fi

read -rsp "Contraseña SSH de ${SSH_USER}@${SSH_HOST}: " SSH_PASS
echo

ssh_cmd() {
  sshpass -p "$SSH_PASS" ssh -p "$SSH_PORT" -o StrictHostKeyChecking=accept-new \
    "${SSH_USER}@${SSH_HOST}" "$@"
}

echo "==> Sincronizando repo remoto con origin/${BRANCH}"
ssh_cmd "
  if [ -d '$REMOTE_DIR/.git' ]; then
    cd '$REMOTE_DIR' && git fetch origin && git checkout '$BRANCH' && git reset --hard 'origin/$BRANCH'
  else
    git clone --branch '$BRANCH' https://github.com/sandiblanco/cliente-administrador-RFID.git '$REMOTE_DIR'
  fi
"

echo "==> Reconstruyendo y reiniciando contenedores (cliente/administrador/podio)"
ssh_cmd "export PATH=\$PATH:/usr/local/bin; cd '$REMOTE_DIR' && echo '$SSH_PASS' | sudo -S docker compose up -d --build --remove-orphans"

echo "==> Limpiando imágenes huérfanas"
ssh_cmd "export PATH=\$PATH:/usr/local/bin; echo '$SSH_PASS' | sudo -S docker image prune -f"

echo "==> Estado de los contenedores"
ssh_cmd "export PATH=\$PATH:/usr/local/bin; cd '$REMOTE_DIR' && echo '$SSH_PASS' | sudo -S docker compose ps"

echo "==> Verificando que los sitios respondan"
ok=1
if curl -sf --max-time 8 -o /dev/null "http://${SSH_HOST}:8083/"; then
  echo "cliente responde OK en http://${SSH_HOST}:8083"
else
  echo "cliente NO respondió en http://${SSH_HOST}:8083 -- revisa 'docker compose logs cliente'" >&2
  ok=0
fi
if curl -sf --max-time 8 -o /dev/null "http://${SSH_HOST}:8081/"; then
  echo "administrador responde OK en http://${SSH_HOST}:8081"
else
  echo "administrador NO respondió en http://${SSH_HOST}:8081 -- revisa 'docker compose logs administrador'" >&2
  ok=0
fi
if curl -sf --max-time 8 -o /dev/null "http://${SSH_HOST}:8084/"; then
  echo "podio responde OK en http://${SSH_HOST}:8084"
else
  echo "podio NO respondió en http://${SSH_HOST}:8084 -- revisa 'docker compose logs podio'" >&2
  ok=0
fi
[ "$ok" -eq 1 ]
