import { useState } from 'react'
import { combineTimestampParts, splitTimestampParts } from '../utils/datetimeLocal'
import DateTimeSecondsField from './DateTimeSecondsField'
import { AlertIcon } from './icons'

export default function EditTimeModal({ runner, onSave, onClose }) {
  const [parts, setParts] = useState(splitTimestampParts(runner.timestamp))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const isNew = !runner.timestamp

  const handleSubmit = async (event) => {
    event.preventDefault()
    const timestamp = combineTimestampParts(parts.date, parts.time, parts.seconds)
    if (!timestamp) {
      setError('Ingresá una fecha y hora válidas')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await onSave(timestamp)
      onClose()
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-label={`${isNew ? 'Agregar' : 'Editar'} tiempo de ${runner.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>{isNew ? 'Agregar tiempo' : 'Editar tiempo'}</h2>
        <p className="modal-subtitle">
          {runner.name} · ID {runner.id}
        </p>

        <form onSubmit={handleSubmit}>
          <DateTimeSecondsField
            label="Hora de llegada"
            date={parts.date}
            time={parts.time}
            seconds={parts.seconds}
            onChange={setParts}
            required
          />

          {error && (
            <p className="error modal-error">
              <AlertIcon className="error-icon" />
              <span>{error}</span>
            </p>
          )}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose} disabled={saving}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
