import { useEffect, useRef, useState } from 'react'
import { getLeaderboard } from '../services/api'

// Estados: 'loading', 'done' (con o sin resultados) y 'error'. A
// diferencia de useSearch, no hay 'idle': category siempre tiene un
// valor por defecto (ver App.jsx), así que la tabla carga apenas se
// muestra.
export function useLeaderboard(filters) {
  const [status, setStatus] = useState('loading')
  const [results, setResults] = useState([])
  const [error, setError] = useState(null)
  const requestId = useRef(0)

  useEffect(() => {
    let cancelled = false
    const currentRequestId = ++requestId.current
    setStatus('loading')

    getLeaderboard(filters)
      .then((data) => {
        if (cancelled || currentRequestId !== requestId.current) return
        setResults(data)
        setStatus('done')
        setError(null)
      })
      .catch((err) => {
        if (cancelled || currentRequestId !== requestId.current) return
        setError(err.message)
        setStatus('error')
      })

    return () => {
      cancelled = true
    }
  }, [filters])

  return { status, results, error }
}
