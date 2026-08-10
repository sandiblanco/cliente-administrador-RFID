const NAMES = [
  'Carlos Rodríguez',
  'María González',
  'Pedro López',
  'Ana Martínez',
  'Luis Fernández',
  'Laura Sánchez',
  'Diego Ramírez',
  'Sofía Torres',
  'Jorge Herrera',
  'Valeria Castro',
]

const now = Date.now()

export const MOCK_RUNNERS = NAMES.map((name, i) => {
  const timestamp =
    i % 3 === 0
      ? new Date(now - (i + 1) * 3 * 60000).toISOString()
      : null
  return { id: i + 1, name, timestamp }
})

export function finishNextPending() {
  const pending = MOCK_RUNNERS.find((r) => r.timestamp === null)
  if (!pending) {
    return null
  }
  pending.timestamp = new Date().toISOString()
  return { ...pending }
}
