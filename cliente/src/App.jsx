import { useCallback, useEffect, useRef, useState } from 'react'
import RunnerInput from './components/RunnerInput.jsx'
import RunnerGrid from './components/RunnerGrid.jsx'
import { getRunners, sendEvent, ApiConnectionError } from './services/api.js'
import {
  connectSocket,
  disconnectSocket,
  onRunnerFinished,
  offRunnerFinished,
} from './services/socket.js'

const CONFIRM_TIMEOUT_MS = 10000

export default function App() {
  const [runners, setRunners] = useState([])
  const [pendingIds, setPendingIds] = useState([])
  const [error, setError] = useState(null)
  const pendingTimers = useRef({})

  function showError(message, type = 'validation') {
    setError({ message, type })
  }

  function clearPendingTimer(runnerId) {
    const timer = pendingTimers.current[runnerId]
    if (timer) {
      clearTimeout(timer)
      delete pendingTimers.current[runnerId]
    }
  }

  function handleRunnerFinished({ runner_id, timestamp }) {
    setRunners((prev) =>
      prev.map((runner) =>
        runner.id === runner_id && runner.timestamp === null
          ? { ...runner, timestamp }
          : runner,
      ),
    )
    clearPendingTimer(runner_id)
    setPendingIds((prev) => prev.filter((pendingId) => pendingId !== runner_id))
  }

  useEffect(() => {
    const timers = pendingTimers.current

    connectSocket()
    onRunnerFinished(handleRunnerFinished)

    getRunners()
      .then((loadedRunners) => setRunners(loadedRunners))
      .catch((error) => {
        if (error instanceof ApiConnectionError) {
          showError(error.message, 'connection')
        } else {
          showError(error.message, 'server')
        }
      })

    return () => {
      disconnectSocket()
      offRunnerFinished()
      Object.values(timers).forEach((timer) => clearTimeout(timer))
    }
  }, [])

  const handleSubmit = useCallback(async (rawId) => {
    setError(null)

    const id = String(rawId ?? '').trim()

    if (!id) {
      showError('Introduce un ID válido.')
      return
    }

    const runner = runners.find((runner) => runner.id === id)

    if (!runner) {
      showError(`El corredor ${id} no existe.`)
      return
    }

    if (runner.timestamp !== null) {
      showError(`El corredor ${id} ya tiene un tiempo registrado.`)
      return
    }

    if (pendingIds.includes(id)) {
      return
    }

    const timestamp = new Date().toISOString()
    setPendingIds((prev) => [...prev, id])

    try {
      await sendEvent({ runner_id: id, timestamp })

      pendingTimers.current[id] = setTimeout(() => {
        setPendingIds((prev) => prev.filter((pendingId) => pendingId !== id))
        delete pendingTimers.current[id]
        showError(
          `El servidor no confirmó el registro del corredor ${id}.`,
          'server',
        )
      }, CONFIRM_TIMEOUT_MS)
    } catch (error) {
      if (error instanceof ApiConnectionError) {
        showError(error.message, 'connection')
      } else {
        showError(error.message, 'server')
      }
      setPendingIds((prev) => prev.filter((pendingId) => pendingId !== id))
    }
  }, [runners, pendingIds])

  const registeredCount = runners.filter(
    (runner) => runner.timestamp !== null,
  ).length

  return (
    <main className="app">
      <header>
        <h1>Registro de llegadas</h1>
        <p className="runner-count">
          {registeredCount} de {runners.length} corredores registrados
        </p>
      </header>

      <section className="input-section">
        <RunnerInput onSubmit={handleSubmit} disabled={pendingIds.length > 0} />
      </section>

      {error && (
        <p className={`message ${error.type}`} role="alert">
          {error.message}
        </p>
      )}

      <RunnerGrid runners={runners} pendingIds={pendingIds} />
    </main>
  )
}
