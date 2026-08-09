import { mockRunners } from '../data/mockRunners.js'

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

export const USE_MOCK_DATA = true

export const ENDPOINTS = {
  runners: '/api/runners',
  times: '/api/times',
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
    const response = await fetch(`${API_URL}${ENDPOINTS.runners}`)

    if (!response.ok) {
      throw new ApiError('No se pudieron cargar los corredores.')
    }

    return await response.json()
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiConnectionError()
  }
}

export async function registerTime(runner) {
  if (USE_MOCK_DATA) {
    return { ...runner }
  }

  try {
    const response = await fetch(`${API_URL}${ENDPOINTS.times}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(runner),
    })

    if (!response.ok) {
      let message = 'No se pudo registrar el tiempo.'
      const body = await response.json().catch(() => null)
      if (body && body.message) {
        message = body.message
      }
      throw new ApiError(message)
    }

    const body = await response.json().catch(() => null)
    return body ?? { ...runner }
  } catch (error) {
    if (error instanceof ApiError) {
      throw error
    }
    throw new ApiConnectionError()
  }
}
