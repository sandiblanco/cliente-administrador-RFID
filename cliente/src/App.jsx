import { useCallback, useEffect, useRef, useState } from 'react'
import RunnerInput from './components/RunnerInput.jsx'
import RunnerGrid from './components/RunnerGrid.jsx'
import ConnectionStatus from './components/ConnectionStatus.jsx'
import { AlertIcon } from './components/icons.jsx'
import { getRunners, sendEvent, ApiConnectionError } from './services/api.js'
import { offlineQueue } from './services/offlineQueue.js'
import { network } from './services/network.js'
import { syncService } from './services/sync.js'
import {
  connectSocket,
  disconnectSocket,
  onRunnerFinished,
  offRunnerFinished,
  onRunnerUpdated,
  offRunnerUpdated,
} from './services/socket.js'

const CONFIRM_TIMEOUT_MS = 10000
const POLL_INTERVAL_MS = 10000
const RUNNERS_CACHE_KEY = 'carrera_runners_cache'

export default function App() {
  const [runners, setRunners] = useState([])
  const [pendingIds, setPendingIds] = useState([])
  const [error, setError] = useState(null)
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingSyncCount, setPendingSyncCount] = useState(offlineQueue.getCount())
  const [syncProgress, setSyncProgress] = useState(null)
  const [syncing, setSyncing] = useState(false)
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

  function refreshPendingCount() {
    setPendingSyncCount(offlineQueue.getCount())
  }

  function handleRunnerFinished({ runner_id, timestamp, elapsed_seconds }) {
    setRunners((prev) =>
      prev.map((runner) =>
        runner.id === runner_id
          ? { ...runner, timestamp, elapsedSeconds: elapsed_seconds ?? null }
          : runner,
      ),
    )
    clearPendingTimer(runner_id)
    setPendingIds((prev) => prev.filter((pendingId) => pendingId !== runner_id))
    refreshPendingCount()
  }

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

  function cacheRunners(runnersToCache) {
    try {
      localStorage.setItem(RUNNERS_CACHE_KEY, JSON.stringify(runnersToCache))
    } catch {
      // Silencioso: localStorage lleno o no disponible
    }
  }

  function loadCachedRunners() {
    try {
      const cached = localStorage.getItem(RUNNERS_CACHE_KEY)
      return cached ? JSON.parse(cached) : null
    } catch {
      return null
    }
  }

  function pollRunners() {
    getRunners()
      .then((loadedRunners) => {
        setRunners(loadedRunners)
        cacheRunners(loadedRunners)
        loadedRunners
          .filter((runner) => runner.timestamp !== null)
          .forEach((runner) =>
            handleRunnerFinished({
              runner_id: runner.id,
              timestamp: runner.timestamp,
              elapsed_seconds: runner.elapsedSeconds,
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
      .then((loadedRunners) => {
        setRunners(loadedRunners)
        cacheRunners(loadedRunners)
      })
      .catch((error) => {
        // Si falla, intentar con caché
        const cached = loadCachedRunners()
        if (cached) {
          setRunners(cached)
        } else if (error instanceof ApiConnectionError) {
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

  // Network status listener + auto-sync on reconnect
  useEffect(() => {
    const unsubStatus = network.onStatusChange(async (online) => {
      setIsOnline(online)
      if (online) {
        const reachable = await network.isServerReachable()
        if (reachable) {
          triggerSync()
          pollRunners()
        }
      }
    })

    const unsubProgress = syncService.onSyncProgress(({ processed, total }) => {
      setSyncProgress({ processed, total })
    })

    const unsubComplete = syncService.onSyncComplete(() => {
      setSyncing(false)
      setSyncProgress(null)
      refreshPendingCount()
      pollRunners()
    })

    const unsubConflict = syncService.onConflict((event) => {
      showError(
        `Conflicto: el corredor ${event.runner_id} ya tiene un tiempo registrado con prioridad.`,
        'connection',
      )
      refreshPendingCount()
    })

    return () => {
      unsubStatus()
      unsubProgress()
      unsubComplete()
      unsubConflict()
    }
  }, [])

  async function triggerSync() {
    if (syncService.isSyncing()) return
    setSyncing(true)
    await syncService.sync()
  }

  const handleSubmit = useCallback(
    async (rawId) => {
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
        const response = await sendEvent({ runner_id: id, timestamp })

        if (response.status === 'confirmed' && response.elapsed_seconds != null) {
          handleRunnerFinished({
            runner_id: id,
            timestamp: response.timestamp,
            elapsed_seconds: response.elapsed_seconds,
          })
        } else {
          pendingTimers.current[id] = setTimeout(() => {
            setPendingIds((prev) => prev.filter((pendingId) => pendingId !== id))
            delete pendingTimers.current[id]
            showError(
              `El servidor no confirmó el registro del corredor ${id}.`,
              'server',
            )
          }, CONFIRM_TIMEOUT_MS)
        }
      } catch (error) {
        if (error instanceof ApiConnectionError) {
          // Offline → guardar en cola local
          offlineQueue.add(id, timestamp)
          refreshPendingCount()
          showError(
            'Sin conexión. El registro se enviará cuando vuelva Internet.',
            'connection',
          )
          // No quitar de pendingIds — queda "Registrando..." hasta que sync resuelva
        } else {
          showError(error.message, 'server')
          setPendingIds((prev) => prev.filter((pendingId) => pendingId !== id))
        }
      }
    },
    [runners, pendingIds],
  )

  const registeredCount = runners.filter(
    (runner) => runner.timestamp !== null,
  ).length

  return (
    <main className="app">
      <header className="chrome">
        <div className="chrome-inner">
          <div className="chrome-heading">
            <p className="chrome-eyebrow">Carrera del Informático</p>
            <h1 className="chrome-title">Registro de llegadas</h1>
          </div>
          <div className="chrome-stats">
            <div className="chrome-stat">
              <p className="chrome-stat-value">
                {registeredCount}/{runners.length}
              </p>
              <p className="chrome-stat-label">Registrados</p>
            </div>
            <ConnectionStatus
              isOnline={isOnline}
              pendingCount={pendingSyncCount}
              syncing={syncing}
              syncProgress={syncProgress}
            />
          </div>
        </div>
      </header>

      <div className="app-main">
        <section className="input-section">
          <RunnerInput onSubmit={handleSubmit} />
        </section>

        {error && (
          <p className={`message ${error.type}`} role="alert">
            <AlertIcon className="message-icon" />
            <span>{error.message}</span>
          </p>
        )}

        <RunnerGrid runners={runners} pendingIds={pendingIds} />
      </div>
    </main>
  )
}
