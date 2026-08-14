import { useEffect, useState } from 'react'
import { onActivity } from '../socket/socket'

// Se guarda un máximo acotado de entradas: es un log en vivo, no un
// historial completo (para eso está la pestaña de Resultados).
const MAX_ENTRIES = 200

let nextId = 0

function buildEntry(raw) {
  const name = raw.name || `#${raw.runner_id}`

  if (raw.type === 'runner') {
    return {
      id: nextId++,
      at: new Date(),
      kind: 'runner',
      tag: 'Corredor',
      text: `${name} (#${raw.runner_id}) — datos actualizados`,
    }
  }

  if (raw.deleted) {
    return {
      id: nextId++,
      at: new Date(),
      kind: 'deleted',
      tag: 'Tiempo eliminado',
      text: `${name} (#${raw.runner_id}) — tiempo eliminado, vuelve a quedar pendiente`,
    }
  }

  if (raw.corrected) {
    return {
      id: nextId++,
      at: new Date(),
      kind: 'corrected',
      tag: 'Tiempo editado',
      text: `${name} (#${raw.runner_id}) — tiempo corregido a ${raw.elapsed_display ?? '—'}`,
    }
  }

  const sourceLabel =
    raw.source === 'manual' ? 'manual' : raw.source === 'admin' ? 'panel admin' : 'RFID'
  return {
    id: nextId++,
    at: new Date(),
    kind: 'finish',
    tag: 'Llegada',
    text: `${name} (#${raw.runner_id}) — llegada registrada (${raw.elapsed_display ?? '—'}, ${sourceLabel})`,
  }
}

// Feed de actividad en vivo para el Dashboard: se mantiene montado a nivel
// de App (no del tab) para no perder entradas al cambiar de pestaña.
export function useActivityLog() {
  const [entries, setEntries] = useState([])

  useEffect(() => {
    const unsubscribe = onActivity((raw) => {
      setEntries((prev) => {
        const next = [...prev, buildEntry(raw)]
        return next.length > MAX_ENTRIES ? next.slice(next.length - MAX_ENTRIES) : next
      })
    })
    return unsubscribe
  }, [])

  return entries
}
