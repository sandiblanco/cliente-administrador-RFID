export function formatTime(timestamp) {
  if (!timestamp) {
    return '—'
  }
  const date = new Date(timestamp)
  const hours = date.getHours()
  const minutes = date.getMinutes()
  const seconds = date.getSeconds()

  const pad = (n) => String(n).padStart(2, '0')

  if (hours > 0) {
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
  }
  return `${pad(minutes)}:${pad(seconds)}`
}

// Hora en la que se recibió un evento (reloj del navegador), para el log de
// actividad — distinta del tiempo de carrera que muestra formatTime().
export function formatClock(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
