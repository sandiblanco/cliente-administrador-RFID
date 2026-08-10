import { mockRunners } from '../data/mockRunners.js'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

export const USE_MOCK_DATA = false

export const ENDPOINTS = {
  runners: '/runners',
  results: '/results',
  events: '/events',
}

function mapRunner(runner, timestamp) {
  return {
    id: runner.runner_id,
    name: runner.name,
    timestamp,
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
    return structuredClone(mockRunners)
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

    return runners.map((runner) =>
      mapRunner(runner, timestampsByRunnerId.get(runner.runner_id) ?? null),
    )
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiConnectionError()
  }
}

export async function sendEvent({ runner_id, timestamp }) {
  if (USE_MOCK_DATA) {
    return { status: 'queued' }
  }

  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.events}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ source: 'manual', runner_id, timestamp }),
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
