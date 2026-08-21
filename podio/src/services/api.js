// Capa HTTP de la pantalla de podio — solo lectura. A diferencia de
// cliente/administrador, acá no hay POST/PUT/DELETE: esta app es de solo
// visualización (se despliega en su propio puerto, sin backend de
// escritura, para no exponer esas rutas en la pantalla pública).

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const ENDPOINTS = {
  runners: '/runners',
  results: '/results',
}

export class ApiConnectionError extends Error {
  constructor(message = 'No hay conexión con el servidor.') {
    super(message)
    this.name = 'ApiConnectionError'
  }
}

function mapRunner(runner, timestamp, elapsedSeconds) {
  return {
    id: runner.runner_id,
    name: runner.name,
    category: runner.category,
    subcategory: runner.subcategory,
    gender: runner.gender,
    timestamp,
    elapsedSeconds,
  }
}

export async function getRunners() {
  let runnersRes
  let resultsRes
  try {
    ;[runnersRes, resultsRes] = await Promise.all([
      fetch(`${API_URL}${ENDPOINTS.runners}`),
      fetch(`${API_URL}${ENDPOINTS.results}`),
    ])
  } catch {
    throw new ApiConnectionError()
  }

  if (!runnersRes.ok || !resultsRes.ok) {
    throw new ApiConnectionError('No se pudo obtener datos del servidor.')
  }

  const { runners } = await runnersRes.json()
  const { results } = await resultsRes.json()

  const timestampsByRunnerId = new Map(
    results
      .filter((result) => result.timestamp != null)
      .map((result) => [result.runner_id, result.timestamp])
  )
  // Duración ya calculada por el servidor — se reutiliza tal cual, igual
  // que en cliente/administrador (ver compute_elapsed en main.py).
  const elapsedByRunnerId = new Map(
    results
      .filter((result) => result.elapsed_seconds != null)
      .map((result) => [result.runner_id, result.elapsed_seconds])
  )

  return runners.map((runner) =>
    mapRunner(
      runner,
      timestampsByRunnerId.get(runner.runner_id) ?? null,
      elapsedByRunnerId.get(runner.runner_id) ?? null
    )
  )
}
