// Único lugar para configurar la comunicación con el servidor.
// Al conocer el contrato real del servidor, solo se modifica este archivo.

const SERVER_URL =
  import.meta.env.VITE_SERVER_URL || 'http://localhost:3000'

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
    socketURL: import.meta.env.VITE_SOCKET_URL || 'ws://localhost:3000/ws/live',
    eventRunnerFinished: 'runner:finished',
  },
}

export default CONFIG
