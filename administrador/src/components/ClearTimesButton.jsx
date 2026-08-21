import { useState } from 'react'
import { clearAllResultTimes } from '../api/client'
import ClearTimesConfirm from './ClearTimesConfirm'

// Encapsula el botón + modal de confirmación + llamada a la API, para no
// duplicar esa lógica entre Corredores y Configuración de tiempos —
// ambas secciones piden la misma acción de limpieza total.
export default function ClearTimesButton({ onCleared, className = 'btn-danger' }) {
  const [confirming, setConfirming] = useState(false)

  const handleConfirm = async () => {
    const res = await clearAllResultTimes()
    if (res.status !== 'ok') {
      throw new Error(res.message || 'No se pudieron limpiar los tiempos')
    }
    onCleared?.()
  }

  return (
    <>
      <button type="button" className={className} onClick={() => setConfirming(true)}>
        Limpiar tiempos
      </button>

      {confirming && (
        <ClearTimesConfirm
          onConfirm={handleConfirm}
          onClose={() => setConfirming(false)}
        />
      )}
    </>
  )
}
