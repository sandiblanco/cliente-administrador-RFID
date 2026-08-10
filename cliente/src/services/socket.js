// Capa de comunicación por WebSocket.
//
// El servidor publica un evento en "live_results" cada vez que un corredor
// registra su llegada (por RFID o manual) y lo reenvía por el socket:
// {
//   runner_id: "34",
//   name: "Carlos Rodríguez",
//   timestamp: "2026-08-09T13:42:31.000Z",
//   elapsed_seconds: 5412.0,
//   elapsed_display: "1:30:12"
// }

export const SOCKET_URL =
  import.meta.env.VITE_SOCKET_URL || 'ws://localhost:8000/ws/live'

let _socket = null
let _runnerFinishedHandler = null
let _reconnectTimer = null
let _disconnected = false

const RECONNECT_BASE_DELAY_MS = 1000
const RECONNECT_MAX_DELAY_MS = 30000

function handleMessage(event) {
  if (!_runnerFinishedHandler) {
    return
  }

  let data
  try {
    data = JSON.parse(event.data)
  } catch {
    return
  }

  if (data.runner_id != null) {
    _runnerFinishedHandler({
      runner_id: data.runner_id,
      timestamp: data.timestamp,
      elapsed_seconds: data.elapsed_seconds,
      elapsed_display: data.elapsed_display,
    })
  }
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
