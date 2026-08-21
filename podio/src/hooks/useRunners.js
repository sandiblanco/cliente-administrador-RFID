import { useCallback, useEffect, useState } from 'react'
import { getRunners } from '../services/api'
import { onLiveUpdate } from '../services/socket'

// Red de seguridad ante un WebSocket que no llega a entregar mensajes —
// misma convención que administrador/cliente.
const POLL_INTERVAL_MS = 10000

function mergeRunner(list, incoming) {
  const existing = list.find((r) => r.id === incoming.id)
  if (existing) {
    return list.map((r) => (r.id === incoming.id ? { ...r, ...incoming } : r))
  }
  return [...list, incoming]
}

export function useRunners() {
  const [runners, setRunners] = useState([])
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await getRunners()
      setRunners(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.message)
    }
  }, [])

  useEffect(() => {
    load()
    const pollTimer = setInterval(load, POLL_INTERVAL_MS)
    return () => clearInterval(pollTimer)
  }, [load])

  useEffect(() => {
    const unsubscribe = onLiveUpdate((runner) => {
      setRunners((prev) => mergeRunner(prev, runner))
    })
    return unsubscribe
  }, [])

  return { runners, error }
}
