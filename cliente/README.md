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

- `API_URL`: se define con `VITE_API_URL` (por defecto `http://localhost:3000`).
- `USE_MOCK_DATA`: mientras sea `true`, `getRunners()` devuelve los datos de
  `mockRunners.js`. Al ponerlo en `false` se llama a `GET /api/runners`.
- Endpoints temporales, centralizados en `src/services/api.js`:
  - `GET  /api/runners`
  - `POST /api/times`

El registro no se marca como exitoso hasta que el servidor confirma la
respuesta del POST. El servidor es la fuente de verdad.

## Docker

```sh
docker build -t assistant-cliente .
docker run -p 8080:80 assistant-cliente
```

Nota: `VITE_API_URL` se inyecta en tiempo de build (build-arg), así que si el
cliente debe apuntar a un servidor distinto dentro de Docker, hay que pasarla
al construir la imagen:

```sh
docker build --build-arg VITE_API_URL=http://server:3000 -t assistant-cliente .
```
