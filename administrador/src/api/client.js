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

export async function getRunners() {
  return request(CONFIG.http.runners)
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
