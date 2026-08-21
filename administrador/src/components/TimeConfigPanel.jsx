import { useEffect, useState } from 'react'
import { getRaceConfig, setRaceStartTime } from '../api/client'
import { fromDatetimeLocalValue, nowAsNaiveTimestamp } from '../utils/datetimeLocal'
import { AlertIcon } from './icons'
import ClearTimesButton from './ClearTimesButton'

// Una fila por categoría: botón "Iniciar tiempos" (fija el inicio al
// momento del click) + campo manual (fija un inicio elegido a mano).
// Ambos pasan por el mismo endpoint (/race-config) y solo tocan la hora
// de inicio de esa categoría — nunca los tiempos finales ya registrados.
function CategoryStartRow({ category, accentClass, currentStartTime, onSaved }) {
  const [manualValue, setManualValue] = useState('')
  const [starting, setStarting] = useState(false)
  const [savingManual, setSavingManual] = useState(false)
  const [error, setError] = useState(null)

  const handleStartNow = async () => {
    setStarting(true)
    setError(null)
    try {
      const res = await setRaceStartTime(category, nowAsNaiveTimestamp())
      if (res.status !== 'ok') {
        throw new Error(res.message || 'No se pudo iniciar los tiempos')
      }
      onSaved(category, res.start_time)
    } catch (err) {
      setError(err.message)
    } finally {
      setStarting(false)
    }
  }

  const handleManualSubmit = async (event) => {
    event.preventDefault()
    const timestamp = fromDatetimeLocalValue(manualValue)
    if (!timestamp) {
      setError('Ingresá una fecha y hora válidas')
      return
    }
    setSavingManual(true)
    setError(null)
    try {
      const res = await setRaceStartTime(category, timestamp)
      if (res.status !== 'ok') {
        throw new Error(res.message || 'No se pudo guardar la hora de inicio')
      }
      onSaved(category, res.start_time)
    } catch (err) {
      setError(err.message)
    } finally {
      setSavingManual(false)
    }
  }

  return (
    <div className={`time-config-row ${accentClass}`}>
      <div className="time-config-row-head">
        <h3>{category}</h3>
        <p className="time-config-current">
          {currentStartTime
            ? `Inicio actual: ${currentStartTime.slice(0, 19).replace('T', ' ')}`
            : 'Sin hora de inicio configurada'}
        </p>
      </div>

      <button
        type="button"
        className={`btn-start ${accentClass}`}
        onClick={handleStartNow}
        disabled={starting}
      >
        {starting ? 'Iniciando…' : `Iniciar tiempos ${category}`}
      </button>

      <form className="time-config-manual" onSubmit={handleManualSubmit}>
        <label className="modal-field">
          Inicio manual {category}
          <input
            type="datetime-local"
            step="1"
            value={manualValue}
            onChange={(event) => setManualValue(event.target.value)}
            required
          />
        </label>
        <button type="submit" className="btn-secondary" disabled={savingManual}>
          {savingManual ? 'Guardando…' : 'Guardar hora manual'}
        </button>
      </form>

      {error && (
        <p className="error modal-error">
          <AlertIcon className="error-icon" />
          <span>{error}</span>
        </p>
      )}
    </div>
  )
}

export default function TimeConfigPanel({ onTimesCleared }) {
  const [startTimes, setStartTimes] = useState({})
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)

  const loadConfig = async () => {
    setLoading(true)
    try {
      const res = await getRaceConfig()
      const map = {}
      for (const c of res.configs ?? []) {
        map[c.category] = c.start_time
      }
      setStartTimes(map)
      setLoadError(null)
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadConfig()
  }, [])

  const handleSaved = (category, startTime) => {
    setStartTimes((prev) => ({ ...prev, [category]: startTime }))
  }

  return (
    <div className="time-config-panel">
      {loadError && (
        <p className="error">
          <AlertIcon className="error-icon" />
          <span>No se pudo obtener la configuración de tiempos: {loadError}</span>
        </p>
      )}

      {loading ? (
        <p className="loading">Cargando configuración…</p>
      ) : (
        <div className="time-config-grid">
          <CategoryStartRow
            category="5K"
            accentClass="accent-5k"
            currentStartTime={startTimes['5K']}
            onSaved={handleSaved}
          />
          <CategoryStartRow
            category="10K"
            accentClass="accent-10k"
            currentStartTime={startTimes['10K']}
            onSaved={handleSaved}
          />
        </div>
      )}

      <div className="time-config-clear">
        <h3>Limpiar tiempos</h3>
        <p className="muted">
          Borra el tiempo final de todos los corredores (no afecta la hora
          de inicio configurada arriba).
        </p>
        <ClearTimesButton onCleared={onTimesCleared} />
      </div>
    </div>
  )
}
