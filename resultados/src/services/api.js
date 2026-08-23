// Capa HTTP del portal público de resultados — solo lectura, un único
// endpoint dedicado (GET /public/search), a diferencia de
// cliente/administrador/podio que consumen /runners + /results
// directamente. Ver el comentario en main.py (sección "Portal público de
// resultados") para el porqué: esta es la única app que le pega al
// backend directo desde cualquier IP de internet (vía el Tailscale Funnel
// usado como VITE_API_URL en el build de Azure), así que no debe traer
// nunca el padrón completo.
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

export async function searchRunners(query) {
  let res
  try {
    res = await fetch(`${API_URL}/public/search?q=${encodeURIComponent(query)}`)
  } catch {
    throw new ApiConnectionError()
  }

  if (res.status === 429) {
    throw new RateLimitError()
  }

  if (!res.ok) {
    // 400 (query muy corta) y cualquier otro error del servidor
    // comparten el mismo shape {detail}, ver HTTPException en main.py.
    let detail
    try {
      detail = (await res.json()).detail
    } catch {
      // sin body JSON legible, se usa el mensaje genérico de abajo
    }
    throw new ApiConnectionError(detail || 'No se pudo completar la búsqueda.')
  }

  const data = await res.json()
  return Array.isArray(data.matches) ? data.matches : []
}
