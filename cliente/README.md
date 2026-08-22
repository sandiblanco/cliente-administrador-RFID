# Cliente · Registro de llegadas

Aplicación React (Vite) para que el staff en la meta registre la llegada de
un corredor: por RFID (automático) o a mano, escribiendo su número de
inscripción y presionando Enter. Pensada para uso continuo durante la
carrera, incluso con conexión inestable (ver [Modo offline](#modo-offline)).

## Desarrollo

```sh
npm install
npm run dev
```

Por defecto (sin nada configurado) apunta a un backend en
`http://localhost:8000`. Si tu backend corre en otra IP, creá un
`.env.development` en esta carpeta (gitignorado, cada quien apunta al
suyo):

```
VITE_API_URL=http://<ip-del-backend>:8000
VITE_SOCKET_URL=ws://<ip-del-backend>:8000/ws/live
```

## Estructura

```
src/
├── components/
│   ├── RunnerInput.jsx    input de ID + hint, foco automático
│   ├── RunnerGrid.jsx     grilla de corredores (estado: pendiente/registrado)
│   ├── RunnerCard.jsx     tarjeta individual
│   └── ConnectionStatus.jsx  indicador online/offline + cola pendiente
├── services/
│   ├── api.js             comunicación HTTP (API_URL, endpoints, USE_MOCK_DATA)
│   ├── socket.js           WebSocket en vivo (/ws/live)
│   ├── network.js          detección de conexión (online/offline)
│   ├── offlineQueue.js      cola de eventos sin enviar (localStorage)
│   └── sync.js              reintento/sincronización de la cola offline
├── data/
│   └── mockRunners.js       corredores simulados (ver USE_MOCK_DATA)
├── App.jsx
└── styles/                  navy/neón, mismo lenguaje visual que administrador/podio
```

## Configuración

Todo vive en `src/services/api.js`:

- `API_URL` — `VITE_API_URL` en build/runtime; si no está, usa
  `localhost:8000` en dev o el mismo origin de la página en producción
  (ver [Docker](#docker) — así el mismo build funciona por LAN, Tailscale
  o cualquier hostname).
- `VITE_SOCKET_URL` — igual criterio para el WebSocket `/ws/live`.
- `USE_MOCK_DATA` — flag manual en el código (**no** una env var): en
  `true`, `getRunners()`/`sendEvent()` usan `mockRunners.js` y guardan el
  resultado simulado en `localStorage` en vez de llamar al backend. Útil
  para probar la UI sin backend levantado. Hay un comentario `// TODO:
  revertir a false antes de produccion` justo arriba — no debe quedar en
  `true` al commitear.

Endpoints usados (ver el README del backend para el detalle completo):

- `GET /runners`, `GET /results` — carga inicial (se combinan en el cliente)
- `POST /events` — registra una llegada: `{ source: "rfid"|"manual", tag_id?, runner_id?, timestamp, event_id }`
- `POST /events/sync` — reenvía en lote los eventos que quedaron en la cola offline
- `WS /ws/live` — confirma cuando el worker procesa un evento (o cuando un admin edita un corredor)

Un registro manual queda en "Registrando..." hasta que el WebSocket
confirma el resultado ya procesado por el worker (ver README del
backend). Si no llega confirmación en 10 segundos, se muestra un error.
El servidor es siempre la fuente de verdad.

## Modo offline

Si el navegador pierde conexión (`network.js` la detecta), los eventos de
llegada se guardan en `offlineQueue.js` (localStorage) en vez de
perderse, y `ConnectionStatus` muestra cuántos quedan pendientes. Al
recuperar conexión, `sync.js` los reenvía en lote vía `POST
/events/sync`, que resuelve duplicados/conflictos del lado del servidor
(gana el timestamp más temprano).

## Docker

```sh
docker build -t rfid-cliente .
docker run -p 8080:80 rfid-cliente
```

La imagen sirve el build detrás de **Nginx** (`nginx.conf`), que hace
`proxy_pass` de `/ws/live` y del resto de la API hacia el backend por su
`container_name` (`carrera-server`) — sin fijar ninguna IP en el build.
Para que ese proxy funcione, este contenedor y el del backend deben
compartir la red externa `rfid-net` (ver `docker-compose.yml` de la raíz
del repo, que ya lo hace).

Si en cambio querés fijar el backend en tiempo de build (por ejemplo,
para correr este contenedor suelto, sin el resto del stack):

```sh
docker build \
  --build-arg VITE_API_URL=http://server:8000 \
  --build-arg VITE_SOCKET_URL=ws://server:8000/ws/live \
  -t rfid-cliente .
```

Para levantar las tres apps del frontend juntas (recomendado), usar el
`docker-compose.yml` de la raíz del repo — ver el README principal.
