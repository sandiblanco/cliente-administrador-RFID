// Hora en la que se recibió un evento (reloj del navegador), para el log de
// actividad — distinta de la duración de carrera que muestra formatElapsed().
export function formatClock(date) {
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`
}
