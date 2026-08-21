import CONFIG from '../config'
import { MOCK_RUNNERS } from '../mock/data'

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

async function request(url, options) {
  if (CONFIG.useMock) {
    await delay(300)
    return MOCK_RUNNERS
  }
  const res = await fetch(url, options)
  if (!res.ok) {
    throw new Error(`Error del servidor (${res.status})`)
  }
  return res.json()
}

function mapRunner(runner, timestamp, elapsedSeconds) {
  return {
    id: runner.runner_id,
    tagId: runner.tag_id ?? null,
    name: runner.name,
    timestamp,
    elapsedSeconds,
    category: runner.category,
    subcategory: runner.subcategory,
    gender: runner.gender,
  }
}

export async function getRunners() {
  if (CONFIG.useMock) {
    return request(CONFIG.http.runners)
  }

  const [runnersRes, resultsRes] = await Promise.all([
    fetch(CONFIG.http.runners),
    fetch(CONFIG.http.results),
  ])
  if (!runnersRes.ok) {
    throw new Error(`Error del servidor (${runnersRes.status})`)
  }
  if (!resultsRes.ok) {
    throw new Error(`Error del servidor (${resultsRes.status})`)
  }

  const { runners } = await runnersRes.json()
  const { results } = await resultsRes.json()

  const timestampsByRunnerId = new Map(
    results
      .filter((result) => result.timestamp != null)
      .map((result) => [result.runner_id, result.timestamp])
  )
  // Duración ya calculada por el servidor (hora_final - hora_inicio de la
  // categoría, ver compute_elapsed en main.py) — se reutiliza tal cual en
  // vez de recalcularla acá, para no duplicar esa lógica en el frontend.
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

export async function getResults() {
  return request(CONFIG.http.results)
}

export async function createRunner(runner) {
  return request(CONFIG.http.runners, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(runner),
  })
}

export async function updateRunner(id, runner) {
  return request(`${CONFIG.http.runners}/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(runner),
  })
}

export async function deleteRunner(id) {
  return request(`${CONFIG.http.runners}/${id}`, {
    method: 'DELETE',
  })
}

export async function updateResultTime(id, timestamp) {
  return request(`${CONFIG.http.results}/${id}/time`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ timestamp }),
  })
}

export async function deleteResultTime(id) {
  return request(`${CONFIG.http.results}/${id}/time`, {
    method: 'DELETE',
  })
}

// Borra el tiempo final de TODOS los corredores de un saque — usada por
// "Limpiar tiempos" tanto en Corredores como en Configuración de tiempos.
export async function clearAllResultTimes() {
  return request(CONFIG.http.results, {
    method: 'DELETE',
  })
}

// Fija la hora de inicio de una categoría ("5K" o "10K"). El servidor la
// usa para calcular el tiempo transcurrido de cada corredor de esa
// categoría — no toca los tiempos finales ya registrados.
export async function setRaceStartTime(category, startTime) {
  return request(CONFIG.http.raceConfig, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ category, start_time: startTime }),
  })
}

export async function getRaceConfig() {
  return request(CONFIG.http.raceConfig)
}

// Reemplaza TODOS los corredores (y borra los tiempos ya registrados) a
// partir de un .xlsx con el listado de inscritos. No pasa por request()
// porque es multipart, no JSON: el navegador arma el Content-Type con el
// boundary correcto al ver un FormData, así que no lo fijamos a mano.
export async function replaceRunnersFromFile(file) {
  const formData = new FormData()
  formData.append('file', file)

  const res = await fetch(CONFIG.http.runnersReplaceFromFile, {
    method: 'POST',
    body: formData,
  })
  if (!res.ok) {
    throw new Error(`Error del servidor (${res.status})`)
  }
  return res.json()
}
