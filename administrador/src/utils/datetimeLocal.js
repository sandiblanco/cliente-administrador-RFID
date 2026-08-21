// Conversión entre el timestamp "naive" (sin zona horaria) que usa el
// servidor y el formato que espera un <input type="datetime-local">.
//
// El sistema guarda los timestamps tal cual, sin conversión de zona
// horaria, así que acá se evita cualquier paso por Date/toISOString que
// introduciría 'Z' y corriera la hora.

export function toDatetimeLocalValue(timestamp) {
  if (!timestamp) {
    return ''
  }
  // "2026-08-10T14:23:00.123000" -> "2026-08-10T14:23:00"
  return timestamp.slice(0, 19)
}

export function fromDatetimeLocalValue(value) {
  if (!value) {
    return null
  }
  // El input con step="1" entrega segundos, pero por las dudas se completan
  // si el navegador los omite.
  return value.length === 16 ? `${value}:00` : value
}

// Hora actual del navegador como timestamp "naive", en el mismo formato
// que usa el servidor (sin 'Z' ni offset) — la usan los botones "Iniciar
// tiempos" para fijar el inicio de una categoría al momento del click.
export function nowAsNaiveTimestamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
