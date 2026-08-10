// Capa de comunicación por WebSocket.
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
// Nota: es un WebSocket nativo, no Socket.IO. No usar socket.io-client acá:
// intenta un handshake por HTTP polling a /socket.io/ que este servidor no
// expone, y termina reintentando esa petición indefinidamente.

import CONFIG from '../config'
import { startSimulator, stopSimulator } from '../mock/simulator'

const RECONNECT_BASE_DELAY_MS = 1000
const RECONNECT_MAX_DELAY_MS = 30000

const listeners = new Set()
// Suscriptores del feed de actividad: reciben el mensaje tal cual llega del
// servidor (sin pasar por mapMessage), porque el log necesita campos que
// mapMessage no expone a los consumidores de `runners` (type, corrected,
// source, elapsed_display).
const activityListeners = new Set()

let socket = null
let simulator = null
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

  // type: "runner" no trae timestamp/elapsed_*: si se incluyeran igual
  // (aunque fuera con valor null/undefined), el merge por spread
  // pisaría el tiempo ya registrado de ese corredor.
  if (raw.type === 'runner') {
    return runner
  }

  return {
    ...runner,
    timestamp: raw.timestamp,
    elapsedSeconds: raw.elapsed_seconds,
    elapsedDisplay: raw.elapsed_display,
  }
}

function emit(runner) {
  listeners.forEach((handler) => handler(runner))
}

function emitActivity(raw) {
  activityListeners.forEach((handler) => handler(raw))
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
      emitActivity(data)
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

export function onLiveUpdate(handler) {
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

export function onActivity(handler) {
  activityListeners.add(handler)
  connect()

  return () => {
    activityListeners.delete(handler)
  }
}
