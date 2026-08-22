# Administrador · Control de tiempos

Panel del organizador: alta/edición de corredores, asignación de tags
RFID, entregas (camiseta/paquete de corredor), corrección manual de
tiempos, configuración del inicio de cada modalidad, medallero en vivo y
subida del listado de inscritos desde un `.xlsx`.

## Desarrollo

```sh
npm install
npm run dev
```

⚠️ **A diferencia de cliente/podio, el default de desarrollo apunta a
`http://localhost:3000`, no a `:8000`** (el puerto real del backend — ver
su README). Si no vas a correr el backend en el 3000, creá un
`.env.development` en esta carpeta (gitignorado):

```
VITE_SERVER_URL=http://localhost:8000
VITE_SOCKET_URL=ws://localhost:8000/ws/live
```

## Estructura

```
src/
├── components/
│   ├── RunnerTable.jsx          tabla de corredores/resultados
│   ├── TagEditButton.jsx        popover: asignar/editar tag RFID por fila
│   ├── RunnerInfoButton.jsx     popover: género/talla (solo lectura) + entregas
│   ├── EditTimeModal.jsx        agregar/corregir tiempo de llegada
│   ├── DeleteTimeConfirm.jsx    confirmar borrado de un tiempo
│   ├── ClearTimesButton/Confirm.jsx  borrar TODOS los tiempos (doble confirmación)
│   ├── SearchBar.jsx            búsqueda por ID o nombre
│   ├── ResultsPanel.jsx         pestaña Resultados (filtros por modalidad/podio)
│   ├── TimeConfigPanel.jsx      inicio de tiempos 5K/10K (ahora o manual)
│   ├── PodiumBoard.jsx          medallero (Dashboard)
│   ├── Dashboard.jsx            resumen + actividad en vivo
│   ├── UploadRunnersPage/Confirm.jsx  reemplazo del listado desde .xlsx
│   ├── ActivityLog.jsx          feed de eventos (RFID/manual/admin)
│   └── HeaderMenu.jsx           menú de tres puntos (subir corredores, etc.)
├── hooks/
│   ├── useRunners.js            estado de corredores: poll + WebSocket + updates optimistas
│   ├── useActivityLog.js        feed de actividad desde el WebSocket
│   └── useTheme.js              claro/oscuro, persistido en localStorage
├── utils/
│   ├── category.js               filtros de modalidad/podio, formato de categoría
│   ├── search.js                  filtro por ID/nombre
│   ├── status.js                  pendiente/finalizado
│   ├── datetimeLocal.js           conversión hacia/desde <input type="datetime-local">
│   └── formatElapsed.js/formatTime.js  formato de duración/hora
├── api/client.js                  toda la comunicación HTTP (ver abajo)
├── socket/socket.js               WebSocket en vivo (/ws/live)
├── mock/                          datos + simulador para CONFIG.useMock
└── App.jsx
```

## Configuración

Todo vive en `src/config.js`:

- `VITE_SERVER_URL` — ver el warning de arriba sobre el default en dev.
- `VITE_SOCKET_URL` — WebSocket `/ws/live`.
- En producción (build de Docker), sin ninguna de las dos, usa el mismo
  origin de la página (LAN/Tailscale/hostname — el backend queda detrás
  de Nginx, ver [Docker](#docker)).
- `useMock` — en `true`, `getRunners()` devuelve `MOCK_RUNNERS`
  (`src/mock/data.js`) en vez de llamar al backend; útil para probar la
  UI sin backend. Se ve un badge "MODO DEMO" en el header cuando está
  activo. Debe quedar en `false` antes de comitear/desplegar.

`src/api/client.js` centraliza todos los endpoints (`getRunners`,
`updateRunner`, `updateResultTime`, `deleteResultTime`,
`clearAllResultTimes`, `setRaceStartTime`, `replaceRunnersFromFile`, …) —
ver el README del backend para el contrato completo de cada uno.

## Persistencia de datos "permanentes"

`tag_id`, `shirt_size` *(este último viene del `.xlsx`, ver abajo)*,
`shirt_delivered` y `kit_delivered` viven en el mismo documento del
corredor (`runners` en Mongo, ver backend) y **sobreviven** a un
reemplazo del listado por `.xlsx` — el backend los reaplica por
`runner_id` después de reimportar (salvo `shirt_size`, que sí se toma
del archivo nuevo cada vez, igual que nombre/género/categoría).

## Subida de corredores desde .xlsx

`POST /runners/bulk/replace-from-file` (botón "Subir archivo de
corredores" en el menú de tres puntos) **reemplaza TODO el listado**
(corredores + tiempos), a partir de un export del formulario de
inscripción (Google Forms). Columnas requeridas: número, nombre,
apellidos, género, distancia; la categoría (franja etaria) solo es
obligatoria para 10K. La columna de talla se detecta por nombre parcial
("...talla...") y es opcional. Las filas que no se puedan mapear se
reportan (con el nombre del corredor, cuando se puede identificar) en
vez de bloquear la subida entera.

## Docker

```sh
docker build -t rfid-administrador .
docker run -p 8081:80 rfid-administrador
```

Igual que cliente/podio: Nginx (`nginx.conf`) hace `proxy_pass` de la API
y `/ws/live` hacia el backend por `container_name` (`carrera-server`) —
requiere compartir la red externa `rfid-net` con el stack del backend
(ver `docker-compose.yml` de la raíz del repo). Para fijar el backend en
build (build-args `VITE_SERVER_URL`/`VITE_SOCKET_URL`), o para levantar
las tres apps del frontend juntas, ver el README principal del repo.
