// Detección de conexión a Internet.
//
// Combina navigator.onLine con eventos del navegador y una verificación
// real contra el servidor (/health) para no confiar únicamente en el
// estado reportado por el navegador.

import { API_URL, USE_MOCK_DATA } from './api.js'

let _listeners = []
let _isOnline = navigator.onLine

function notify() {
  _listeners.forEach((fn) => fn(_isOnline))
}

window.addEventListener('online', () => {
  _isOnline = true
  notify()
})

window.addEventListener('offline', () => {
  _isOnline = false
  notify()
})

export const network = {
  isOnline() {
    return _isOnline
  },

  async isServerReachable() {
    if (USE_MOCK_DATA) return true
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000)
      const response = await fetch(`${API_URL}/health`, {
        signal: controller.signal,
      })
      clearTimeout(timeout)
      return response.ok
    } catch {
      return false
    }
  },

  onStatusChange(callback) {
    _listeners.push(callback)
    return () => {
      _listeners = _listeners.filter((fn) => fn !== callback)
    }
  },
}
