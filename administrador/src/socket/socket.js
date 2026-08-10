// Capa de comunicación por WebSocket.
//
// El servidor publica un mensaje cada vez que un corredor registra su
// llegada (por RFID o manual):
// {
//   runner_id: "34",
//   name: "Carlos Rodríguez",
//   timestamp: "2026-08-09T13:42:31.000Z",
//   elapsed_seconds: 5412.0,
//   elapsed_display: "1:30:12"
// }
//
// Nota: es un WebSocket nativo, no Socket.IO. No usar socket.io-client acá:
// intenta un handshake por HTTP polling a /socket.io/ que este servidor no
// expone, y termina reintentando esa petición indefinidamente.

import CONFIG from '../config'
import { startSimulator, stopSimulator } from '../mock/simulator'

const RECONNECT_BASE_DELAY_MS = 1000
const RECONNECT_MAX_DELAY_MS = 30000

const listeners = new Set()

let socket = null
let simulator = null
let reconnectTimer = null
let disconnected = false

function mapMessage(raw) {
  return {
    id: raw.runner_id,
    name: raw.name,
    timestamp: raw.timestamp,
    elapsedSeconds: raw.elapsed_seconds,
    elapsedDisplay: raw.elapsed_display,
    category: raw.category,
    subcategory: raw.subcategory,
    gender: raw.gender,
  }
}

function emit(runner) {
  listeners.forEach((handler) => handler(runner))
}

function scheduleReconnect(attempt) {
  if (disconnected) {
    return
  }
  const delay = Math.min(
    RECONNECT_BASE_DELAY_MS * 2 ** attempt,
    RECONNECT_MAX_DELAY_MS
  )
  reconnectTimer = setTimeout(() => openSocket(attempt + 1), delay)
}

function openSocket(attempt = 0) {
  disconnected = false

  if (socket) {
    socket.close()
  }

  socket = new WebSocket(CONFIG.socket.socketURL)

  socket.onmessage = (event) => {
    let data
    try {
      data = JSON.parse(event.data)
    } catch {
      return
    }
    if (data.runner_id != null) {
      emit(mapMessage(data))
    }
  }

  socket.onerror = () => {
    // onclose se dispara después y maneja el reintento.
  }

  socket.onclose = () => {
    socket = null
    scheduleReconnect(attempt)
  }
}

export function connect() {
  if (CONFIG.useMock) {
    if (!simulator) {
      simulator = startSimulator(emit)
    }
    return null
  }
  if (!socket) {
    openSocket()
  }
  return socket
}

export function disconnect() {
  if (CONFIG.useMock) {
    stopSimulator(simulator)
    simulator = null
    listeners.clear()
    return
  }
  disconnected = true
  if (reconnectTimer) {
    clearTimeout(reconnectTimer)
    reconnectTimer = null
  }
  if (socket) {
    socket.close()
    socket = null
  }
}

export function onRunnerFinished(handler) {
  listeners.add(handler)
  connect()

  return () => {
    listeners.delete(handler)
    if (CONFIG.useMock && listeners.size === 0) {
      stopSimulator(simulator)
      simulator = null
    }
  }
}
