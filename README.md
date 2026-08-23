# Carrera del Informático · Sistema RFID

Monorepo con las cuatro aplicaciones web del sistema de cronometraje por
RFID de la Carrera del Informático. El backend (API, worker, base de
datos) vive en un repositorio aparte, incluido acá como submódulo git.

## Apps

| App | Carpeta | Para quién | README propio |
|---|---|---|---|
| **Cliente** | [`cliente/`](cliente/README.md) | El staff en la meta, registrando llegadas a mano (RFID + respaldo manual) | [cliente/README.md](cliente/README.md) |
| **Administrador** | [`administrador/`](administrador/README.md) | El organizador: corredores, tiempos, tags RFID, entregas, podio | [administrador/README.md](administrador/README.md) |
| **Podio** | [`podio/`](podio/README.md) | Pantalla pública de solo lectura (TV/proyector) con el medallero en vivo | [podio/README.md](podio/README.md) |
| **Resultados** | [`resultados/`](resultados/README.md) | Cualquier corredor, buscando su propio resultado por dorsal o nombre — la única pensada para internet abierto, no solo LAN/Tailscale | [resultados/README.md](resultados/README.md) |

Las cuatro son SPAs en React + Vite y comparten la misma identidad visual
(paleta navy/neón, tipografía Chakra Petch). Cliente/administrador/podio
hablan con el backend por LAN o Tailscale (o el Nginx de su propio
contenedor); resultados es la excepción — le pega directo al backend por
el Tailscale Funnel público, con su propio endpoint de solo lectura y
rate limit (ver [resultados/README.md](resultados/README.md)).

## Backend

El servidor (FastAPI + Mongo + Redis + un worker que procesa las lecturas
RFID) está en
[`conexionServer/rfid_system_carrera_del_informatico_2026`](conexionServer/rfid_system_carrera_del_informatico_2026)
— un **submódulo git** con su propio repositorio, historia y README. Ver
[ese README](conexionServer/rfid_system_carrera_del_informatico_2026/README.md)
para levantarlo (con o sin Docker) y el detalle de sus endpoints.

Al clonar este repo, traer también el submódulo:

```sh
git clone --recurse-submodules <url-de-este-repo>
# o si ya lo clonaste sin --recurse-submodules:
git submodule update --init --recursive
```

## Requisitos

- Node.js 22+ y npm (cada app tiene su propio `package.json`)
- El backend corriendo en algún lado (local, LAN o Tailscale) — ver su README
- Para levantar todo con Docker: Docker + Docker Compose

## Desarrollo local (sin Docker)

Cada app se levanta independiente:

```sh
cd cliente          # o administrador / podio
npm install
npm run dev
```

Por defecto, en desarrollo cada app apunta a un backend en `localhost`
(puerto 8000, salvo administrador — ver su README, tiene un detalle
distinto). Si tu backend corre en otra IP (por ejemplo, un contenedor
remoto o una VM), creá un `.env.development` en la carpeta de la app
(gitignorado, no se versiona) con las variables `VITE_API_URL` /
`VITE_SERVER_URL` y `VITE_SOCKET_URL` — el detalle exacto de cada una está
en el README de cada app.

## Docker (las tres apps juntas)

El `docker-compose.yml` de la raíz levanta las tres apps, cada una detrás
de su propio Nginx:

```sh
docker compose up -d --build
```

- **Cliente** → puerto `8083`
- **Administrador** → puerto `8081`
- **Podio** → puerto `8084`

Cada Nginx hace `proxy_pass` de la API y el WebSocket hacia el backend por
su `container_name` (`carrera-server`), **sin depender de ninguna IP fija
de LAN o Tailscale** — así el mismo build sirve para acceder por LAN, por
Tailscale o por el hostname que sea. Para que ese proxy funcione, el
backend tiene que estar corriendo y ambos stacks (frontend y backend)
deben compartir la red externa `rfid-net`:

```sh
docker network create rfid-net   # una sola vez, si no existe ya
```

`deploy.sh` (ver abajo) la crea automáticamente si hace falta; los
`docker-compose.yml` de ambos repos ya están configurados para unirse a
ella.

Orden recomendado para levantar todo desde cero:

1. Backend: seguir el README del submódulo (crea `rfid-net`, levanta
   Mongo/Redis/server/worker).
2. Frontend (acá): `docker network create rfid-net` (si el paso anterior
   no la creó) y `docker compose up -d --build`.

## Despliegue

`./deploy.sh` sincroniza `origin/dev` en el NAS de despliegue de la
carrera (detecta si es accesible por LAN o por Tailscale, hace `git
reset --hard` al remoto, reconstruye los contenedores con `docker compose
up -d --build` y verifica que las tres apps respondan). Requiere
`sshpass` instalado y las credenciales SSH del NAS. Ver el script para el
detalle de hosts/puertos.

```sh
./deploy.sh
```

## Estructura

```
cliente/          Registro de llegadas (staff en meta)
administrador/     Panel de control (organizador)
podio/             Pantalla pública de medallero en vivo
resultados/        Portal público de resultados (solo Azure, no en el docker-compose)
conexionServer/    Submódulo git → backend (FastAPI + Mongo + Redis + worker)
docker-compose.yml Levanta cliente/administrador/podio (resultados no vive acá)
deploy.sh          Despliegue al NAS de la carrera
docs/              Notas de diseño / especificaciones puntuales
```

## Azure Static Web Apps

Las cuatro apps también se despliegan automáticamente a Azure Static Web
Apps (tier Free) en cada push a `dev`, vía
`.github/workflows/deploy-{cliente,admin,podio,resultados}.yml`. Cada
workflow hace `npm run build` con `VITE_API_URL`/`VITE_SERVER_URL`
apuntando a `vars.BACKEND_URL` (el Tailscale Funnel público del backend)
y sube `dist/` con un token propio por app (`AZURE_SWA_TOKEN_*`, como
secret del repo). `resultados` es la única de las cuatro que **solo**
vive en Azure — no tiene contenedor ni entrada en el `docker-compose.yml`
del NAS, porque no hace falta probarla por LAN.
