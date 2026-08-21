// Formatea segundos transcurridos como duración "HH:MM:SS".
//
// El valor de entrada ya viene calculado por el servidor (hora de llegada
// menos hora de inicio de la categoría, ver compute_elapsed en main.py) —
// acá solo se le da formato, no se recalcula la duración.
//
// Se trunca igual que el servidor (int(elapsed_seconds) en Python, que
// trunca hacia cero) para no mostrar un segundo de diferencia respecto a
// elapsed_display si algún día se comparan. Mismo placeholder '—' que ya
// usa el resto del panel para datos ausentes.
export function formatElapsed(elapsedSeconds) {
  if (elapsedSeconds == null) {
    return '—'
  }

  const totalSeconds = Math.max(0, Math.floor(elapsedSeconds))
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`
}
