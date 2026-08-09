import { useCallback, useEffect, useState } from 'react'
import RunnerInput from './components/RunnerInput.jsx'
import RunnerGrid from './components/RunnerGrid.jsx'
import { getRunners, registerTime, ApiConnectionError } from './services/api.js'
import { connectSocket, disconnectSocket, onRunnerFinished } from './services/socket.js'

export default function App() {
  const [runners, setRunners] = useState([])
  const [pendingIds, setPendingIds] = useState([])
  const [error, setError] = useState(null)

  function showError(message, type = 'validation') {
    setError({ message, type })
  }

  function handleRunnerFinished({ id, timestamp }) {
    setRunners((prev) =>
      prev.map((runner) =>
        runner.id === id && runner.timestamp === null
          ? { ...runner, timestamp }
          : runner,
      ),
    )
  }

  useEffect(() => {
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
    }
  }, [])

  const handleSubmit = useCallback(async (rawId) => {
    setError(null)

    if (!/^\d+$/.test(rawId)) {
      showError('Introduce un ID numérico válido.')
      return
    }

    const id = Number(rawId)
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
      const confirmed = await registerTime({ ...runner, timestamp })
      setRunners((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, timestamp: confirmed.timestamp ?? timestamp }
            : r,
        ),
      )
    } catch (error) {
      if (error instanceof ApiConnectionError) {
        showError(error.message, 'connection')
      } else {
        showError(error.message, 'server')
      }
    } finally {
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
