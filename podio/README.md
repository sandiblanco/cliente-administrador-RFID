# Podio · Medallero en vivo

Pantalla pública de solo lectura pensada para proyectarse (TV/proyector):
muestra el podio en vivo de las 6 modalidades premiadas del 10K
(subcategoría × género) y el conteo de llegadas del 5K. Sin escritura —
no expone ninguna ruta que modifique datos, solo lee.

## Desarrollo

```sh
npm install
npm run dev
```

Por defecto (sin nada configurado) apunta a un backend en
`http://localhost:8000`. Si tu backend corre en otra IP, creá un
`.env.development` en esta carpeta (gitignorado):

```
VITE_API_URL=http://<ip-del-backend>:8000
VITE_SOCKET_URL=ws://<ip-del-backend>:8000/ws/live
```

## Estructura

```
src/
├── components/
│   ├── PodiumBoard.jsx   las 6 tarjetas de podio + destello al llegar un nuevo tiempo
│   └── icons.jsx         iconos en línea (incluye la insignia de corredor del favicon)
├── hooks/
│   ├── useRunners.js     carga + WebSocket en vivo
│   └── useTheme.js       toggle claro/oscuro (arranca oscuro), persistido en localStorage
├── services/
│   ├── api.js            GET /runners + GET /results (solo lectura)
│   └── socket.js         WebSocket en vivo (/ws/live)
├── utils/
│   ├── category.js       agrupación por subcategoría × género (PODIUM_GROUPS)
│   └── formatElapsed.js  formato de duración
└── App.jsx
```

## Configuración

En `src/services/api.js` y `src/services/socket.js`:

- `VITE_API_URL` — si no está, usa `localhost:8000` en dev o el mismo
  origin de la página en producción (ver [Docker](#docker)).
- `VITE_SOCKET_URL` — igual criterio para `/ws/live`.

El toggle de tema (chico, en la esquina de la cabecera) arranca siempre
en oscuro — es la lectura más fiel de la marca para una pantalla
proyectada — pero queda disponible para pantallas muy luminosas.

## Docker

```sh
docker build -t rfid-podio .
docker run -p 8080:80 rfid-podio
```

Igual que cliente/administrador: Nginx (`nginx.conf`) hace `proxy_pass`
de la API y `/ws/live` hacia el backend por `container_name`
(`carrera-server`) — requiere compartir la red externa `rfid-net` con el
stack del backend (ver `docker-compose.yml` de la raíz del repo). Para
fijar el backend en build (build-args `VITE_API_URL`/`VITE_SOCKET_URL`),
o para levantar las tres apps del frontend juntas, ver el README
principal del repo.
