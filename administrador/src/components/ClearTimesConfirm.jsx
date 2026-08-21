import { useState } from 'react'
import { AlertIcon } from './icons'

const CONFIRM_WORD = 'CONFIRMAR'

// Limpiar tiempos afecta a TODOS los corredores a la vez (no a uno solo,
// como DeleteTimeConfirm), así que el resguardo es más estricto: no basta
// un segundo clic, hay que escribir la palabra de confirmación tal cual.
export default function ClearTimesConfirm({ onConfirm, onClose }) {
  const [input, setInput] = useState('')
  const [clearing, setClearing] = useState(false)
  const [error, setError] = useState(null)

  const canConfirm = input.trim() === CONFIRM_WORD

  const handleConfirm = async () => {
    if (!canConfirm) {
      return
    }
    setClearing(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.message)
      setClearing(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-label="Limpiar todos los tiempos"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Limpiar tiempos</h2>
        <p className="modal-warning">
          Esta acción elimina el tiempo final registrado de TODOS los
          corredores (5K y 10K). No se puede deshacer.
        </p>
        <p className="modal-subtitle">
          Para confirmar, escribí <strong>{CONFIRM_WORD}</strong> abajo.
        </p>

        <label className="modal-field">
          Confirmación
          <input
            type="text"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            placeholder={CONFIRM_WORD}
            autoComplete="off"
            autoFocus
          />
        </label>

        {error && (
          <p className="error modal-error">
            <AlertIcon className="error-icon" />
            <span>{error}</span>
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={clearing}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleConfirm}
            disabled={!canConfirm || clearing}
          >
            {clearing ? 'Limpiando…' : 'Limpiar todos los tiempos'}
          </button>
        </div>
      </div>
    </div>
  )
}
