import { useState } from 'react'
import { AlertIcon } from './icons'

// Doble confirmación deliberada: un primer paso liviano y un segundo paso
// explícito con el texto de advertencia antes de llamar a la API. Un solo
// clic accidental sobre "Eliminar" nunca alcanza para borrar el tiempo.
export default function DeleteTimeConfirm({ runner, onConfirm, onClose }) {
  const [step, setStep] = useState(1)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)

  const handleConfirm = async () => {
    if (step === 1) {
      setStep(2)
      return
    }

    setDeleting(true)
    setError(null)
    try {
      await onConfirm()
      onClose()
    } catch (err) {
      setError(err.message)
      setDeleting(false)
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal"
        role="alertdialog"
        aria-modal="true"
        aria-label={`Eliminar tiempo de ${runner.name}`}
        onClick={(event) => event.stopPropagation()}
      >
        <h2>Eliminar tiempo</h2>
        <p className="modal-subtitle">
          {runner.name} · ID {runner.id}
        </p>

        {step === 1 ? (
          <p>¿Eliminar el tiempo registrado de este corredor?</p>
        ) : (
          <p className="modal-warning">
            Esta acción no se puede deshacer: {runner.name} volverá a quedar
            pendiente. ¿Confirmás la eliminación?
          </p>
        )}

        {error && (
          <p className="error modal-error">
            <AlertIcon className="error-icon" />
            <span>{error}</span>
          </p>
        )}

        <div className="modal-actions">
          <button type="button" className="btn-secondary" onClick={onClose} disabled={deleting}>
            Cancelar
          </button>
          <button type="button" className="btn-danger" onClick={handleConfirm} disabled={deleting}>
            {deleting ? 'Eliminando…' : step === 1 ? 'Eliminar' : 'Sí, eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}
