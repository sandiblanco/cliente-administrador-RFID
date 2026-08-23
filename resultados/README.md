# Resultados · Portal público

Portal público de solo lectura para que cualquier corredor consulte su
propio resultado, buscando por **número de dorsal** o por **nombre**. A
diferencia de cliente/administrador/podio, es la única de las cuatro apps
pensada para ser usada desde cualquier IP de internet (se despliega solo
en Azure Static Web Apps, sin equivalente en el docker-compose del NAS),
así que su backend tiene reglas propias — ver la sección "Portal público
de resultados" en `server/main.py` del repo `rfid_system_carrera_del_informatico_2026`:

- **Un endpoint dedicado, `GET /public/search`**, en vez de reusar
  `/runners` + `/results` (lo que hace podio). Esos dos devuelven el
  padrón completo — bien para una pantalla en la LAN, pero dejarían
  scrapear los datos de todos los corredores a cualquiera en internet.
  Este endpoint solo devuelve lo que matchea la búsqueda (máximo 8
  coincidencias por nombre).
- **Rate limit por IP** (20 búsquedas/minuto), en Redis, para que el
  enlace compartido en redes sociales el día de la carrera no tumbe el
  backend.
- Cada resultado trae dos puestos posibles, ya calculados por el
  servidor:
  - **general**: dentro de tu categoría (5K o 10K) contando solo por
    género, sin mirar subcategoría.
  - **de categoría**: dentro de tu grupo subcategoría × género — solo
    existe en el 10K (el 5K es recreativo, sin subcategorías).

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
```

## Despliegue

Solo Azure Static Web Apps (ver
`.github/workflows/deploy-resultados.yml`), igual patrón que
cliente/admin/podio: push a `dev` dispara el build y sube `dist/` con
`VITE_API_URL=${{ vars.BACKEND_URL }}` (el mismo Tailscale Funnel público
que usan las otras tres apps). Requiere un secret propio
`AZURE_SWA_TOKEN_RESULTADOS` en el repo — hay que crear el recurso Static
Web App en Azure y cargar el deployment token antes del primer push.

No se agrega al `docker-compose.yml` del NAS: no hace falta probarla por
LAN, solo por Azure (es la única de las cuatro pensada para acceso
público general).

## Estructura

```
src/
├── components/
│   ├── SearchForm.jsx    input de búsqueda (dorsal o nombre)
│   ├── ResultCard.jsx    tarjeta de un corredor encontrado, con sus puestos
│   └── icons.jsx         iconos en línea
├── hooks/
│   ├── useSearch.js      debounce + estado de la búsqueda (idle/loading/done/error)
│   └── useTheme.js       toggle claro/oscuro, persistido en localStorage
├── services/
│   └── api.js            GET /public/search (solo lectura, un único endpoint)
├── utils/
│   └── formatElapsed.js  formato de duración
└── App.jsx
```
