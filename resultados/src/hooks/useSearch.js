import { useEffect, useRef, useState } from 'react'
import { searchRunners } from '../services/api'

const MIN_QUERY_LENGTH = 2
const DEBOUNCE_MS = 400

// Estados posibles: 'idle' (sin búsqueda todavía / query muy corta),
// 'loading', 'done' (con o sin resultados) y 'error'.
export function useSearch() {
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('idle')
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    // El mínimo de caracteres es para no lanzar una búsqueda por nombre
    // con una sola letra -- no aplica a dorsales (solo dígitos), donde
    // un dorsal de un solo dígito ("1", "2", ...) es válido (ver mismo
    // criterio en public_search, main.py).
    const isBib = /^\d+$/.test(trimmed)
    if (!isBib && trimmed.length < MIN_QUERY_LENGTH) {
      setStatus('idle')
      setResults([])
      setError(null)
      return
    }
    if (trimmed.length === 0) {
      setStatus('idle')
      setResults([])
      setError(null)
      return
    }

    setStatus('loading')
    const currentRequestId = ++requestId.current

    const timer = setTimeout(async () => {
      try {
        const matches = await searchRunners(trimmed)
        // Descarta la respuesta si el usuario ya siguió escribiendo —
        // evita que una búsqueda vieja y lenta pise una más nueva.
        if (currentRequestId !== requestId.current) return
        setResults(matches)
        setStatus('done')
        setError(null)
      } catch (err) {
        if (currentRequestId !== requestId.current) return
        setError(err.message)
        setStatus('error')
      }
    }, DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query])

  return { query, setQuery, status, results, error }
}
