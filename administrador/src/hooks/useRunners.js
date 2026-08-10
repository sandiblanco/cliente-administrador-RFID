import { useCallback, useEffect, useState } from 'react'
import { getRunners } from '../api/client'
import { onRunnerFinished } from '../socket/socket'

function mergeRunner(list, incoming) {
  const existing = list.find((r) => r.id === incoming.id)
  if (existing) {
    return list.map((r) =>
      r.id === incoming.id ? { ...r, ...incoming } : r
    )
  }
  return [...list, incoming]
}

export function useRunners() {
  const [runners, setRunners] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const load = useCallback(async () => {
    try {
      const data = await getRunners()
      setRunners(Array.isArray(data) ? data : [])
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    const unsubscribe = onRunnerFinished((runner) => {
      setRunners((prev) => mergeRunner(prev, runner))
    })
    return unsubscribe
  }, [])

  const applyUpdate = useCallback((runner) => {
    setRunners((prev) => mergeRunner(prev, runner))
  }, [])

  return { runners, loading, error, reload: load, applyUpdate }
}
