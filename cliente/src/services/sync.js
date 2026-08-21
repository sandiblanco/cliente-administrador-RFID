// Orquestación de sincronización de la cola offline.
//
// Cuando se detecta que la conexión volvió, procesa los eventos
// pendientes uno por uno contra el servidor. Solo elimina un registro
// de la cola después de recibir confirmación de que fue procesado.
// Si la conexión se pierde durante la sincronización, se detiene
// y continúa cuando vuelva.

import { offlineQueue } from './offlineQueue.js'
import { network } from './network.js'
import { sendEventsSync } from './api.js'

const MAX_RETRIES = 5
const RETRY_BASE_DELAY_MS = 2000

let _syncing = false
let _progressListeners = []
let _completeListeners = []
let _conflictListeners = []

function notifyProgress(processed, total) {
  _progressListeners.forEach((fn) => fn({ processed, total }))
}

function notifyComplete() {
  _completeListeners.forEach((fn) => fn())
}

function notifyConflict(event) {
  _conflictListeners.forEach((fn) => fn(event))
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export const syncService = {
  isSyncing() {
    return _syncing
  },

  async sync() {
    if (_syncing) return

    // Chequeo real contra el servidor, no el flag cacheado de
    // network.isOnline(): ese flag puede quedar atascado en `false` (p.
    // ej. el evento 'offline' del navegador se disparó pero la conexión
    // ya volvió) y con eso ni siquiera un sync manual lo destrababa.
    const reachable = await network.isServerReachable()
    if (!reachable) return

    _syncing = true
    const pending = offlineQueue.getPending()
    const total = pending.length

    if (total === 0) {
      _syncing = false
      notifyComplete()
      return
    }

    let processed = 0

    for (const item of pending) {
      if (!network.isOnline()) break

      offlineQueue.update(item.id, { status: 'syncing' })

      try {
        const response = await sendEventsSync([
          {
            event_id: item.event_id,
            runner_id: item.runner_id,
            timestamp: item.timestamp,
          },
        ])

        const result = response.results[0]

        if (result.status === 'accepted' || result.status === 'duplicate') {
          offlineQueue.remove(item.id)
          processed++
          notifyProgress(processed, total)
        } else if (result.status === 'conflict') {
          offlineQueue.remove(item.id)
          notifyConflict({ ...item, message: result.message })
          processed++
          notifyProgress(processed, total)
        } else {
          // Error — retry logic
          const newRetries = item.retries + 1
          if (newRetries >= MAX_RETRIES) {
            offlineQueue.update(item.id, {
              status: 'error',
              retries: newRetries,
              error: result.message || 'Error definitivo',
            })
          } else {
            offlineQueue.update(item.id, {
              status: 'pending',
              retries: newRetries,
              error: result.message,
            })
            await delay(RETRY_BASE_DELAY_MS * newRetries)
          }
        }
      } catch {
        // Network or server error — stop syncing
        offlineQueue.update(item.id, { status: 'pending' })
        break
      }
    }

    _syncing = false
    notifyComplete()
  },

  onSyncProgress(callback) {
    _progressListeners.push(callback)
    return () => {
      _progressListeners = _progressListeners.filter((fn) => fn !== callback)
    }
  },

  onSyncComplete(callback) {
    _completeListeners.push(callback)
    return () => {
      _completeListeners = _completeListeners.filter((fn) => fn !== callback)
    }
  },

  onConflict(callback) {
    _conflictListeners.push(callback)
    return () => {
      _conflictListeners = _conflictListeners.filter((fn) => fn !== callback)
    }
  },
}
