# Assistant · Cliente de registro de llegadas

Aplicación React (Vite) para que un asistente registre manualmente el tiempo
de llegada de los corredores.

## Desarrollo

```sh
npm install
npm run dev
```

## Estructura

```
src/
├── components/   RunnerInput, RunnerGrid, RunnerCard
├── services/
│   ├── api.js    comunicación HTTP centralizada (API_URL, endpoints, errores)
│   └── socket.js stub preparado para la futura comunicación por Socket
├── data/
│   └── mockRunners.js   corredores simulados
├── App.jsx
├── main.jsx
└── styles.css   estilo neutro (desacoplado de la lógica)
```

## Comunicación con el servidor

- `API_URL`: se define con `VITE_API_URL` (por defecto `http://localhost:8000`).
- `SOCKET_URL`: se define con `VITE_SOCKET_URL` (por defecto
  `ws://localhost:8000/ws/live`).
- `USE_MOCK_DATA`: mientras sea `true`, `getRunners()` devuelve los datos de
  `mockRunners.js`. Al ponerlo en `false` se llama a la API real.
- Endpoints, centralizados en `src/services/api.js`:
  - `GET  /runners`  — lista de corredores
  - `GET  /results`  — resultados registrados (se unen a los corredores)
  - `POST /events`   — registra una llegada manual:
    `{ source: "manual", runner_id, timestamp }`

El registro manual envía el evento al servidor y la tarjeta queda en
"Registrando..." hasta que el WebSocket (`/ws/live`) confirma el resultado
procesado por el worker. Si no llega confirmación en 10 segundos, se muestra
un error. El servidor es la fuente de verdad.

## Docker

```sh
docker build -t assistant-cliente .
docker run -p 8080:80 assistant-cliente
```

Nota: `VITE_API_URL` y `VITE_SOCKET_URL` se inyectan en tiempo de build
(build-arg), así que si el cliente debe apuntar a un servidor distinto dentro
de Docker, hay que pasarlas al construir la imagen:

```sh
docker build \
  --build-arg VITE_API_URL=http://server:8000 \
  --build-arg VITE_SOCKET_URL=ws://server:8000/ws/live \
  -t assistant-cliente .
```
