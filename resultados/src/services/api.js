// Capa HTTP del portal público de resultados — solo lectura, dos
// endpoints dedicados (GET /public/search, GET /public/leaderboard), a
// diferencia de cliente/administrador/podio que consumen /runners +
// /results directamente. Ver el comentario en main.py (sección "Portal
// público de resultados") para el porqué: esta es la única app que le
// pega al backend directo desde cualquier IP de internet (vía el
// Tailscale Funnel usado como VITE_API_URL en el build de Azure).
// /public/search nunca devuelve más que unas pocas coincidencias;
// /public/leaderboard sí devuelve una modalidad completa (como la
// pestaña Resultados del admin), pero ese dato ya es público hoy de
// todos modos -- ver la nota en main.py.
const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? window.location.origin : 'http://localhost:8000')

export class ApiConnectionError extends Error {
  constructor(message = 'No hay conexión con el servidor.') {
    super(message)
    this.name = 'ApiConnectionError'
  }
}

export class RateLimitError extends Error {
  constructor(message = 'Demasiadas búsquedas seguidas. Esperá un minuto e intentá de nuevo.') {
    super(message)
    this.name = 'RateLimitError'
  }
}

async function get(path) {
  let res
  try {
    res = await fetch(`${API_URL}${path}`)
  } catch {
    throw new ApiConnectionError()
  }

  if (res.status === 429) {
    throw new RateLimitError()
  }

  if (!res.ok) {
    // 400 y cualquier otro error del servidor comparten el mismo shape
    // {detail}, ver HTTPException en main.py.
    let detail
    try {
      detail = (await res.json()).detail
    } catch {
      // sin body JSON legible, se usa el mensaje genérico de abajo
    }
    throw new ApiConnectionError(detail || 'No se pudo completar la solicitud.')
  }

  return res.json()
}

export async function searchRunners(query) {
  const data = await get(`/public/search?q=${encodeURIComponent(query)}`)
  return Array.isArray(data.matches) ? data.matches : []
}

// filters: { category: '5k' | '10k', subcategory?: string, gender?: 'M' | 'F' }
export async function getLeaderboard(filters) {
  const params = new URLSearchParams({ category: filters.category })
  if (filters.subcategory) params.set('subcategory', filters.subcategory)
  if (filters.gender) params.set('gender', filters.gender)

  const data = await get(`/public/leaderboard?${params.toString()}`)
  return Array.isArray(data.results) ? data.results : []
}
