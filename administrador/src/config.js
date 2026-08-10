// Único lugar para configurar la comunicación con el servidor.
// Al conocer el contrato real del servidor, solo se modifica este archivo.

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

const CONFIG = {
  serverUrl: SERVER_URL,
  useMock: true,
  mock: {
    intervalMs: 6000,
  },
  http: {
    runners: `${SERVER_URL}/api/runners`,
    results: `${SERVER_URL}/api/results`,
  },
  socket: {
    eventRunnerFinished: 'runner:finished',
  },
}

export default CONFIG
