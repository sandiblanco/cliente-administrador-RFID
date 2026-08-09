// Capa de comunicación por Socket.
//
// Aún no hay backend definido, por lo que estas funciones son un stub
// preparado para incorporar la implementación real (Socket.IO, WebSocket u
// otra) cuando el servidor la defina.
//
// Uso previsto: el servidor emite un evento cuando un corredor registra su
// llegada (por ejemplo, vía RFID o desde otro cliente) y este cliente debe
// actualizar el estado sin recargar la página.
//
// Evento esperado (conceptualmente):
// {
//   id: 34,
//   name: "Carlos Rodríguez",
//   timestamp: "2026-08-09T13:42:31.000Z"
// }

let _runnerFinishedHandler = null

export function connectSocket() {
  // TODO: implementar cuando el backend defina el protocolo (Socket.IO, WebSocket...).
}

export function disconnectSocket() {
  // TODO: implementar junto con connectSocket().
}

export function onRunnerFinished(handler) {
  _runnerFinishedHandler = handler
}

export function offRunnerFinished() {
  _runnerFinishedHandler = null
}
