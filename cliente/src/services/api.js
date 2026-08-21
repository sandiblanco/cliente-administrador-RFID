import { mockRunners } from '../data/mockRunners.js'

const MOCK_RESULTS_KEY = 'carrera_mock_results'

function loadMockResults() {
  try {
    return JSON.parse(localStorage.getItem(MOCK_RESULTS_KEY)) || {}
  } catch {
    return {}
  }
}

function saveMockResult(runnerId, timestamp, elapsedSeconds) {
  const results = loadMockResults()
  results[runnerId] = { timestamp, elapsedSeconds }
  localStorage.setItem(MOCK_RESULTS_KEY, JSON.stringify(results))
}

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

// Sin timeout, un fetch en una conexión que no falla limpio (paquetes
// perdidos en vez de conexión rechazada) puede quedar colgado decenas de
// segundos o más, sin que nada se detecte como "sin conexión" mientras
// tanto. isServerReachable() ya usa este mismo patrón con AbortController;
// acá se aplica también a los envíos reales para que fallen rápido y
// caigan en el flujo de cola offline en vez de quedar en el limbo.
const FETCH_TIMEOUT_MS = 10000

function fetchWithTimeout(url, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
  return fetch(url, { ...options, signal: controller.signal }).finally(() =>
    clearTimeout(timeout),
  )
}

// TODO: revertir a false antes de produccion
export const USE_MOCK_DATA = false

export const ENDPOINTS = {
  runners: '/runners',
  results: '/results',
  events: '/events',
  sync: '/events/sync',
}

function mapRunner(runner, timestamp, elapsedSeconds) {
  return {
    id: runner.runner_id,
    name: runner.name,
    timestamp,
    elapsedSeconds,
  }
}

export class ApiConnectionError extends Error {
  constructor(message = 'No hay conexión con el servidor.') {
    super(message)
    this.name = 'ApiConnectionError'
  }
}

export class ApiError extends Error {
  constructor(message = 'No se pudo registrar el tiempo.') {
    super(message)
    this.name = 'ApiError'
  }
}

export async function getRunners() {
  if (USE_MOCK_DATA) {
    const cached = loadMockResults()
    return mockRunners.map((runner) => {
      const result = cached[runner.id]
      if (result) {
        return { ...runner, timestamp: result.timestamp, elapsedSeconds: result.elapsedSeconds }
      }
      return { ...runner }
    })
  }

  try {
    const [runnersResponse, resultsResponse] = await Promise.all([
      fetch(`${API_URL}${ENDPOINTS.runners}`),
      fetch(`${API_URL}${ENDPOINTS.results}`),
    ])

    if (!runnersResponse.ok) {
      throw new ApiError('No se pudieron cargar los corredores.')
    }
    if (!resultsResponse.ok) {
      throw new ApiError('No se pudieron cargar los resultados.')
    }

    const { runners } = await runnersResponse.json()
    const { results } = await resultsResponse.json()

    const timestampsByRunnerId = new Map(
      results
        .filter((result) => result.timestamp != null)
        .map((result) => [result.runner_id, result.timestamp]),
    )
    // Duración ya calculada por el servidor (hora_final - hora_inicio de la
    // categoría, ver compute_elapsed en main.py) — se reutiliza tal cual en
    // vez de recalcularla acá, para no duplicar esa lógica en el cliente.
    const elapsedByRunnerId = new Map(
      results
        .filter((result) => result.elapsed_seconds != null)
        .map((result) => [result.runner_id, result.elapsed_seconds]),
    )

    return runners.map((runner) =>
      mapRunner(
        runner,
        timestampsByRunnerId.get(runner.runner_id) ?? null,
        elapsedByRunnerId.get(runner.runner_id) ?? null,
      ),
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiConnectionError()
  }
}

export async function sendEvent({ runner_id, timestamp, event_id }) {
  if (USE_MOCK_DATA) {
    if (!navigator.onLine) {
      throw new ApiConnectionError()
    }
    const elapsed = Math.floor(Math.random() * 7200) + 1800
    saveMockResult(runner_id, timestamp, elapsed)
    return {
      status: 'confirmed',
      runner_id,
      timestamp,
      elapsed_seconds: elapsed,
    }
  }

  try {
    const response = await fetchWithTimeout(`${API_URL}${ENDPOINTS.events}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source: 'manual', runner_id, timestamp, event_id }),
    })

    if (!response.ok) {
      let message = 'No se pudo registrar el tiempo.'
      const body = await response.json().catch(() => null)
      if (body && body.message) {
        message = body.message
      }
      throw new ApiError(message)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiConnectionError()
  }
}

export async function sendEventsSync(events) {
  if (USE_MOCK_DATA) {
    const results = events.map((e) => {
      const elapsed = Math.floor(Math.random() * 7200) + 1800
      saveMockResult(e.runner_id, e.timestamp, elapsed)
      return { event_id: e.event_id, status: 'accepted' }
    })
    return { status: 'ok', results }
  }

  try {
    const response = await fetchWithTimeout(`${API_URL}${ENDPOINTS.sync}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ events }),
    })

    if (!response.ok) {
      let message = 'Error al sincronizar eventos offline.'
      const body = await response.json().catch(() => null)
      if (body && body.message) {
        message = body.message
      }
      throw new ApiError(message)
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiConnectionError()
  }
}
