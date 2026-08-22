// Capa de comunicación por WebSocket — solo lectura, igual convención que
// cliente/administrador.
//
// El servidor publica dos tipos de mensaje, distinguibles por `type`:
//
// - type: "result" — un corredor registró su llegada (RFID/manual) o un
//   admin corrigió su tiempo:
//   {
//     type: "result",
//     runner_id: "34",
//     name: "Carlos Rodríguez",
//     timestamp: "2026-08-09T13:42:31.000Z",
//     elapsed_seconds: 5412.0,
//     elapsed_display: "1:30:12"
//   }
//
// - type: "runner" — se creó o editó un corredor (sin relación con su
//   tiempo). No trae timestamp/elapsed_*: si los trajera en null, un merge
//   por spread pisaría el tiempo ya registrado de ese corredor.
//   { type: "runner", runner_id: "34", name: "...", category: "10K", ... }
//
// Nota: es un WebSocket nativo, no Socket.IO — no usar socket.io-client.

// Mismo criterio que cliente/administrador (ver services/api.js): en
// producción, sin VITE_SOCKET_URL definido, deriva el WebSocket del origin
// actual en vez de una IP fija.
function defaultSocketUrl() {
  if (!import.meta.env.PROD) return 'ws://localhost:8000/ws/live'
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}/ws/live`
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || defaultSocketUrl()

const RECONNECT_BASE_DELAY_MS = 1000
const RECONNECT_MAX_DELAY_MS = 30000

const listeners = new Set()

let socket = null
let reconnectTimer = null
let disconnected = false

function mapMessage(raw) {
  const runner = {
    id: raw.runner_id,
    name: raw.name,
    category: raw.category,
    subcategory: raw.subcategory,
    gender: raw.gender,
  }

  if (raw.type === 'runner') {
    return runner
  }

  return {
    ...runner,
    timestamp: raw.timestamp,
    elapsedSeconds: raw.elapsed_seconds,
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

  socket = new WebSocket(SOCKET_URL)

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
  if (!socket) {
    openSocket()
  }
  return socket
}

export function disconnect() {
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

export function onLiveUpdate(handler) {
  listeners.add(handler)
  connect()

  return () => {
    listeners.delete(handler)
  }
}
