// Único lugar para configurar la comunicación con el servidor.
// Al conocer el contrato real del servidor, solo se modifica este archivo.

// En dev sin VITE_SERVER_URL, apunta al backend local. En producción
// (build de Docker) sin VITE_SERVER_URL, usa el mismo origin con el que se
// cargó la página: funciona igual por LAN, Tailscale o cualquier hostname,
// sin fijar ninguna IP en el build. El backend queda detrás de Nginx
// (mismo puerto) vía proxy_pass.
const SERVER_URL =
  import.meta.env.VITE_SERVER_URL ||
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:3000')

const CONFIG = {
  serverUrl: SERVER_URL,
  useMock: false,
  mock: {
    intervalMs: 6000,
  },
  http: {
    runners: `${SERVER_URL}/runners`,
    runnersReplaceFromFile: `${SERVER_URL}/runners/bulk/replace-from-file`,
    results: `${SERVER_URL}/results`,
    raceConfig: `${SERVER_URL}/race-config`,
  },
  socket: {
    socketURL:
      import.meta.env.VITE_SOCKET_URL ||
      (import.meta.env.PROD
        ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws/live`
        : 'ws://localhost:3000/ws/live'),
    eventRunnerFinished: 'runner:finished',
  },
}

export default CONFIG
