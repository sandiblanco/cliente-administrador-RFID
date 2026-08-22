// Capa de comunicación por WebSocket.
//
// El servidor publica dos tipos de mensaje, distinguibles por `type`:
//
// type: "result" — un corredor registró su llegada (RFID/manual) o un
// admin corrigió su tiempo:
// {
//   type: "result",
//   runner_id: "34",
//   name: "Carlos Rodríguez",
//   timestamp: "2026-08-09T13:42:31.000Z",
//   elapsed_seconds: 5412.0,
//   elapsed_display: "1:30:12"
// }
//
// type: "runner" — se dio de alta o se editó un corredor (nombre/
// categoría/etc). No trae timestamp: nunca hay que tratarlo como una
// llegada, o "confirmaría" de forma falsa a un corredor pendiente que en
// realidad solo se editó. Va a un handler separado (onRunnerUpdated).
// { type: "runner", runner_id: "34", name: "...", category: "10K", ... }

// Mismo criterio que API_URL (ver services/api.js): en producción, sin
// VITE_SOCKET_URL definido, deriva el WebSocket del origin actual en vez de
// una IP fija, para que funcione igual por LAN o por Tailscale.
function defaultSocketUrl() {
  if (!import.meta.env.PROD) return 'ws://localhost:8000/ws/live'
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/live`
}

export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || defaultSocketUrl()

let _socket = null
let _runnerFinishedHandler = null
let _runnerUpdatedHandler = null
let _reconnectTimer = null
let _disconnected = false

const RECONNECT_BASE_DELAY_MS = 1000
const RECONNECT_MAX_DELAY_MS = 30000

function handleMessage(event) {
  let data
  try {
    data = JSON.parse(event.data)
  } catch {
    return
  }

  if (data.runner_id == null) {
    return
  }

  if (data.type === 'runner') {
    _runnerUpdatedHandler?.({
      runner_id: data.runner_id,
      name: data.name,
    })
    return
  }

  _runnerFinishedHandler?.({
    runner_id: data.runner_id,
    timestamp: data.timestamp,
    elapsed_seconds: data.elapsed_seconds,
    elapsed_display: data.elapsed_display,
  })
}

function scheduleReconnect(attempt) {
  if (_disconnected) {
    return
  }

  const delay = Math.min(
    RECONNECT_BASE_DELAY_MS * 2 ** attempt,
    RECONNECT_MAX_DELAY_MS,
  )
  _reconnectTimer = setTimeout(() => connectSocket(attempt + 1), delay)
}

export function connectSocket(attempt = 0) {
  // Calling connect always means "we want to be connected again", so it
  // must clear a previous disconnectSocket() call. Without this, React's
  // StrictMode double-invoke of effects in development (mount -> cleanup
  // -> mount) calls disconnectSocket() once before the real mount, which
  // permanently latches _disconnected = true and silently no-ops every
  // future connectSocket() call for the lifetime of the page.
  _disconnected = false

  if (_socket) {
    _socket.close()
  }

  _socket = new WebSocket(SOCKET_URL)

  _socket.onopen = () => {
    console.log('Connected to live results socket')
  }

  _socket.onmessage = handleMessage

  _socket.onerror = () => {
    // onclose will trigger the reconnect logic
  }

  _socket.onclose = () => {
    _socket = null
    scheduleReconnect(attempt)
  }
}

export function disconnectSocket() {
  _disconnected = true
  if (_reconnectTimer) {
    clearTimeout(_reconnectTimer)
    _reconnectTimer = null
  }
  if (_socket) {
    _socket.close()
    _socket = null
  }
}

export function onRunnerFinished(handler) {
  _runnerFinishedHandler = handler
}

export function offRunnerFinished() {
  _runnerFinishedHandler = null
}

export function onRunnerUpdated(handler) {
  _runnerUpdatedHandler = handler
}

export function offRunnerUpdated() {
  _runnerUpdatedHandler = null
}
