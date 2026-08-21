// Detección de conexión a Internet.
//
// navigator.onLine y los eventos 'online'/'offline' del navegador NO
// alcanzan por sí solos: navigator.onLine solo refleja si hay alguna
// interfaz de red activa (wifi asociado, etc.), no si el servidor es
// alcanzable — con wifi conectado pero sin salida a internet, o con el
// servidor caído, se queda en `true` para siempre y esos eventos nunca
// se disparan. Por eso la fuente de verdad real es un fetch periódico a
// /health con timeout; los eventos del navegador solo se usan como
// disparador para revalidar de inmediato, nunca para decidir el estado
// por sí mismos.

import { API_URL, USE_MOCK_DATA } from './api.js'

const CHECK_INTERVAL_MS = 15000
const FETCH_TIMEOUT_MS = 5000

let _listeners = []
let _isOnline = navigator.onLine
let _checking = null
let _intervalId = null

function notify() {
  _listeners.forEach((fn) => fn(_isOnline))
}

function setOnline(value) {
  if (_isOnline === value) return
  _isOnline = value
  notify()
}

async function checkReachability() {
  if (USE_MOCK_DATA) {
    setOnline(true)
    return true
  }

  // Si ya hay una verificación en curso, reutilizarla en vez de disparar
  // otra en paralelo (puede pasar si el evento 'online' del navegador
  // coincide con el tick del intervalo).
  if (_checking) {
    return _checking
  }

  _checking = (async () => {
    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
      const response = await fetch(`${API_URL}/health`, {
        signal: controller.signal,
      })
      clearTimeout(timeout)
      setOnline(response.ok)
      return response.ok
    } catch {
      setOnline(false)
      return false
    } finally {
      _checking = null
    }
  })()

  return _checking
}

// Señal rápida y local, pero no confiable como fuente de verdad (ver
// comentario arriba) — solo dispara una revalidación real inmediata en
// vez de esperar al próximo tick del intervalo.
window.addEventListener('online', () => {
  checkReachability()
})

// 'offline' sí es una señal confiable de "no hay red" cuando se dispara
// (el navegador solo la emite cuando realmente pierde la interfaz), así
// que acá se refleja de inmediato sin esperar el fetch.
window.addEventListener('offline', () => {
  setOnline(false)
})

export const network = {
  isOnline() {
    return _isOnline
  },

  async isServerReachable() {
    return checkReachability()
  },

  onStatusChange(callback) {
    _listeners.push(callback)
    return () => {
      _listeners = _listeners.filter((fn) => fn !== callback)
    }
  },

  // Arranca la revalidación periódica real. Llamarlo una vez al montar
  // la app; sin esto, el estado nunca se corrige solo si la conexión se
  // recupera sin pasar por un evento 'online' del navegador.
  start() {
    if (_intervalId) return
    checkReachability()
    _intervalId = setInterval(checkReachability, CHECK_INTERVAL_MS)
  },

  stop() {
    if (_intervalId) {
      clearInterval(_intervalId)
      _intervalId = null
    }
  },
}
