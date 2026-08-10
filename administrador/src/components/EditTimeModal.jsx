import { useState } from 'react'
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '../utils/datetimeLocal'

export default function EditTimeModal({ runner, onSave, onClose }) {
  const [value, setValue] = useState(toDatetimeLocalValue(runner.timestamp))
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (event) => {
    event.preventDefault()
    const timestamp = fromDatetimeLocalValue(value)
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
        aria-label={`Editar tiempo de ${runner.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Editar tiempo</h2>
        <p className="modal-subtitle">
          {runner.name} · ID {runner.id}
        </p>

        <form onSubmit={handleSubmit}>
          <label className="modal-field">
            Hora de llegada
            <input
              type="datetime-local"
              step="1"
              value={value}
              onChange={(event) => setValue(event.target.value)}
              required
            />
          </label>

          {error && <p className="error modal-error">{error}</p>}

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
