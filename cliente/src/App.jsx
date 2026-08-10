import { useCallback, useEffect, useRef, useState } from 'react'
import RunnerInput from './components/RunnerInput.jsx'
import RunnerGrid from './components/RunnerGrid.jsx'
import { getRunners, sendEvent, ApiConnectionError } from './services/api.js'
import {
  connectSocket,
  disconnectSocket,
  onRunnerFinished,
  offRunnerFinished,
  onRunnerUpdated,
  offRunnerUpdated,
} from './services/socket.js'

const CONFIRM_TIMEOUT_MS = 10000

// Red de seguridad ante un WebSocket que no llega a entregar mensajes (por
// ejemplo, un reverse proxy que no reenvía el upgrade de conexión): sin
// esto, los tiempos quedan "Registrando..." para siempre y los cambios de
// otros asistentes solo se ven al recargar la página a mano.
const POLL_INTERVAL_MS = 10000

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

  // Llegada nueva o corrección de un tiempo ya registrado — ambas viajan
  // por el mismo evento. No hay que exigir timestamp === null: eso
  // impediría que una corrección se refleje (se descartaría en silencio
  // hasta el próximo refresco de fondo).
  function handleRunnerFinished({ runner_id, timestamp }) {
    setRunners((prev) =>
      prev.map((runner) =>
        runner.id === runner_id ? { ...runner, timestamp } : runner,
      ),
    )
    clearPendingTimer(runner_id)
    setPendingIds((prev) => prev.filter((pendingId) => pendingId !== runner_id))
  }

  // Alta o edición de un corredor (nombre/categoría/etc, sin relación con
  // su tiempo). Nunca toca `timestamp`: si el corredor ya existía, solo
  // actualiza su nombre; si es nuevo, lo agrega como pendiente para poder
  // registrarlo sin recargar la página.
  function handleRunnerUpdated({ runner_id, name }) {
    setRunners((prev) => {
      const exists = prev.some((runner) => runner.id === runner_id)
      if (exists) {
        return prev.map((runner) =>
          runner.id === runner_id ? { ...runner, name } : runner,
        )
      }
      return [...prev, { id: runner_id, name, timestamp: null }]
    })
  }

  function pollRunners() {
    getRunners()
      .then((loadedRunners) => {
        setRunners(loadedRunners)
        // Si el socket no avisó, esto igual destraba los "Registrando...".
        loadedRunners
          .filter((runner) => runner.timestamp !== null)
          .forEach((runner) =>
            handleRunnerFinished({
              runner_id: runner.id,
              timestamp: runner.timestamp,
            }),
          )
      })
      .catch(() => {
        // Silencioso: es un refresco de fondo, el próximo intento reintenta.
      })
  }

  useEffect(() => {
    const timers = pendingTimers.current

    connectSocket()
    onRunnerFinished(handleRunnerFinished)
    onRunnerUpdated(handleRunnerUpdated)

    getRunners()
      .then((loadedRunners) => setRunners(loadedRunners))
      .catch((error) => {
        if (error instanceof ApiConnectionError) {
          showError(error.message, 'connection')
        } else {
          showError(error.message, 'server')
        }
      })

    const pollTimer = setInterval(pollRunners, POLL_INTERVAL_MS)

    return () => {
      disconnectSocket()
      offRunnerFinished()
      offRunnerUpdated()
      clearInterval(pollTimer)
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
