// Convenciones de la carrera:
// - category: "5K" (recreativo, sin podio) o "10K" (competitivo, con podio).
// - subcategory (solo aplica al 10K): veterano, mayor, master, master_b.
// - gender: "M" o "F".
//
// Se premian los primeros puestos de las 8 combinaciones de
// subcategoría × género dentro del 10K. (Informático se eliminó como
// subcategoría premiada — ya no se necesita.)
//
// master_b (61+) es un desglose de master (51+): nadie la elige en el
// formulario de inscripción — el backend la deriva por fecha de
// nacimiento al importar el .xlsx (ver MASTER_B_MIN_AGE en
// parse_runners_xlsx, server/main.py). Acá solo hace falta darle
// etiqueta para que salga en el podio.

const GENDERS = [
  { value: 'M', label: 'Hombres' },
  { value: 'F', label: 'Mujeres' },
]

const SUBCATEGORIES = [
  { value: 'veterano', label: 'Veterano' },
  { value: 'mayor', label: 'Mayor' },
  { value: 'master', label: 'Master' },
  { value: 'master_b', label: 'Máster B' },
]

export const normalize = (value) => (value ?? '').toString().trim().toLowerCase()

export function formatCategoryLabel(runner) {
  if (!runner.category) {
    return '—'
  }

  const category = runner.category.toUpperCase()
  if (normalize(runner.category) !== '10k') {
    return category
  }

  const subcategory = SUBCATEGORIES.find(
    (s) => s.value === normalize(runner.subcategory)
  )
  const gender = GENDERS.find(
    (g) => g.value === (runner.gender ?? '').toUpperCase()
  )
  const parts = [subcategory?.label, gender?.label].filter(Boolean)

  return parts.length ? `${category} · ${parts.join(' ')}` : category
}

// Las 8 modalidades premiadas: subcategoría × género, dentro del 10K.
export const PODIUM_GROUPS = SUBCATEGORIES.flatMap((subcategory) =>
  GENDERS.map((gender) => ({
    id: `10k-${subcategory.value}-${gender.value}`,
    label: `${subcategory.label} · ${gender.label}`,
    match: (runner) =>
      normalize(runner.category) === '10k' &&
      normalize(runner.subcategory) === subcategory.value &&
      (runner.gender ?? '').toUpperCase() === gender.value,
  }))
)

// Alterna la vista de la sección Corredores entre las dos modalidades —
// no premia nada, a diferencia de PODIUM_GROUPS, así que no reutiliza esa
// lista aunque comparta la idea de "match" por categoría.
export const RUNNER_CATEGORY_FILTERS = [
  { id: 'todos', label: 'Todos', match: () => true },
  { id: '5k', label: '5K', match: (runner) => normalize(runner.category) === '5k' },
  { id: '10k', label: '10K', match: (runner) => normalize(runner.category) === '10k' },
]

export const RESULT_FILTERS = [
  { id: 'todos', label: 'Todos', match: () => true },
  {
    id: '5k',
    label: '5K',
    match: (runner) => normalize(runner.category) === '5k',
  },
  ...PODIUM_GROUPS,
]
