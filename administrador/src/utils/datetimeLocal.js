// Conversión entre el timestamp "naive" (sin zona horaria) que usa el
// servidor y los campos fecha/hora/segundos que usa la UI.
//
// El sistema guarda los timestamps tal cual, sin conversión de zona
// horaria, así que acá se evita cualquier paso por Date/toISOString que
// introduciría 'Z' y corriera la hora.
//
// Los segundos se editan con un input numérico propio en vez de confiar
// en el selector nativo de <input type="datetime-local">: en iOS/iPadOS
// (Safari) ese picker no muestra una rueda de segundos aunque se use
// step="1" — limitación conocida de WebKit —, así que con eso solo se
// podía ajustar minutos desde el celular/tablet.

export function splitTimestampParts(timestamp) {
  if (!timestamp) {
    return { date: '', time: '', seconds: '' }
  }
  // "2026-08-10T14:23:05.123000" -> date="2026-08-10" time="14:23" seconds="05"
  const [datePart = '', timePart = ''] = timestamp.slice(0, 19).split('T')
  const [hh = '', mm = '', ss = ''] = timePart.split(':')
  return { date: datePart, time: hh && mm ? `${hh}:${mm}` : '', seconds: ss }
}

export function combineTimestampParts(date, time, seconds) {
  if (!date || !time) {
    return null
  }
  const ss = String(seconds ?? '').trim()
  const paddedSeconds = ss === '' ? '00' : ss.padStart(2, '0')
  return `${date}T${time}:${paddedSeconds}`
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
