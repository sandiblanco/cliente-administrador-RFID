import { useState } from 'react'
import { AlertIcon } from './icons'

const CONFIRM_WORD = 'REEMPLAZAR'

// Reemplazar corredores afecta a TODOS los corredores y tiempos a la vez
// (no solo agrega, como /runners/bulk) — mismo resguardo que
// ClearTimesConfirm: escribir la palabra de confirmación, no basta un clic.
export default function UploadRunnersConfirm({ fileName, taggedCount, onConfirm, onClose }) {
  const [input, setInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState(null)

  const canConfirm = input.trim() === CONFIRM_WORD

  const handleConfirm = async () => {
    if (!canConfirm) {
      return
    }
    setUploading(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.message)
      setUploading(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-label="Reemplazar todos los corredores"
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Reemplazar corredores</h2>
        <p className="modal-warning">
          Esto elimina TODOS los corredores y tiempos registrados
          actualmente, y los reemplaza con los datos de{' '}
          <strong>{fileName}</strong>. No se puede deshacer.
        </p>
        {taggedCount > 0 && (
          <p className="modal-subtitle">
            Actualmente <strong>{taggedCount}</strong> corredor
            {taggedCount === 1 ? '' : 'es'} tiene{taggedCount === 1 ? '' : 'n'} un
            tag RFID asignado. Se va a preservar para los corredores cuyo N°
            de inscripción se repita en el archivo nuevo.
          </p>
        )}

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
          <button type="button" className="btn-secondary" onClick={onClose} disabled={uploading}>
            Cancelar
          </button>
          <button
            type="button"
            className="btn-danger"
            onClick={handleConfirm}
            disabled={!canConfirm || uploading}
          >
            {uploading ? 'Subiendo…' : 'Reemplazar corredores'}
          </button>
        </div>
      </div>
    </div>
  )
}
