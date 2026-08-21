// El servidor guarda y compara los timestamps "naive" (sin zona horaria,
// ver compute_elapsed en main.py / process_event en worker.py: solo les
// quita el tzinfo si lo traen, nunca convierten a otra zona). Por eso acá
// se arma el timestamp a mano con la hora local del dispositivo, en vez de
// usar Date.toISOString() — ese método vuelca a UTC y agrega 'Z', lo que
// en Costa Rica (UTC-6) adelanta cada llegada 6 horas respecto al inicio
// de la categoría. Mismo criterio que administrador/src/utils/datetimeLocal.js.
export function nowAsNaiveTimestamp() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`
}
