// Cola local de eventos offline persistida en localStorage.
//
// Cada item contiene suficiente información para enviarse al servidor
// cuando se recupere la conexión, incluyendo un event_id único para
// idempotencia y un timestamp del momento en que el usuario registró
// el tiempo (no cuando se sincronice).

const STORAGE_KEY = 'carrera_offline_queue'

function generateId() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

function load() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []
  } catch {
    return []
  }
}

function save(queue) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(queue))
}

export const offlineQueue = {
  add(runnerId, timestamp) {
    const queue = load()
    const item = {
      id: generateId(),
      runner_id: runnerId,
      timestamp,
      source: 'manual',
      event_id: generateId(),
      createdAt: Date.now(),
      status: 'pending',
      retries: 0,
      error: null,
    }
    queue.push(item)
    save(queue)
    return item
  },

  getAll() {
    return load()
  },

  getById(id) {
    return load().find((item) => item.id === id) || null
  },

  getPending() {
    return load().filter((item) => item.status === 'pending')
  },

  update(id, updates) {
    const queue = load()
    const index = queue.findIndex((item) => item.id === id)
    if (index === -1) return
    queue[index] = { ...queue[index], ...updates }
    save(queue)
  },

  remove(id) {
    const queue = load().filter((item) => item.id !== id)
    save(queue)
  },

  clear() {
    localStorage.removeItem(STORAGE_KEY)
  },

  getCount() {
    return load().filter((item) => item.status === 'pending').length
  },
}
