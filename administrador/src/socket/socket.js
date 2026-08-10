import { io } from 'socket.io-client'
import CONFIG from '../config'
import { startSimulator, stopSimulator } from '../mock/simulator'

const listeners = new Set()

let socket = null
let simulator = null

export function connect() {
  if (CONFIG.useMock) {
    if (!simulator) {
      simulator = startSimulator((runner) => {
        listeners.forEach((handler) => handler(runner))
      })
    }
    return null
  }
  if (socket) {
    return socket
  }
  socket = io(CONFIG.serverUrl, {
    autoConnect: true,
  })
  return socket
}

export function disconnect() {
  if (CONFIG.useMock) {
    stopSimulator(simulator)
    simulator = null
    listeners.clear()
    return
  }
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

export function onRunnerFinished(handler) {
  listeners.add(handler)
  connect()

  if (!CONFIG.useMock) {
    socket.on(CONFIG.socket.eventRunnerFinished, handler)
  }

  return () => {
    listeners.delete(handler)
    if (!CONFIG.useMock) {
      socket.off(CONFIG.socket.eventRunnerFinished, handler)
    }
    if (CONFIG.useMock && listeners.size === 0) {
      stopSimulator(simulator)
      simulator = null
    }
  }
}
