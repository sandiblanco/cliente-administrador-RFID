// Convenciones de la carrera:
// - category: "5K" (recreativo, sin podio) o "10K" (competitivo, con podio).
// - subcategory (solo aplica al 10K): veterano, mayor, master.
// - gender: "M" o "F".
//
// Se premian los primeros puestos de las 6 combinaciones de
// subcategoría × género dentro del 10K. (Informático se eliminó como
// subcategoría premiada — ya no se necesita.)

const GENDERS = [
  { value: 'M', label: 'Hombres' },
  { value: 'F', label: 'Mujeres' },
]

const SUBCATEGORIES = [
  { value: 'veterano', label: 'Veterano' },
  { value: 'mayor', label: 'Mayor' },
  { value: 'master', label: 'Master' },
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

// Las 6 modalidades premiadas: subcategoría × género, dentro del 10K.
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

// Filtro amplio por modalidad, compartido entre Corredores y
// Resultados: Todos/5K/10K. El desglose por subcategoría × género vive
// aparte en GROUP_FILTERS — combinarlo acá como 9 pills sueltos hacía
// el filtro ilegible, así que se separa en un segmented control
// (esto) + un <select> dependiente que solo importa dentro del 10K.
const CATEGORY_FILTERS = [
  { id: 'todos', label: 'Todos', match: () => true },
  { id: '5k', label: '5K', match: (runner) => normalize(runner.category) === '5k' },
  { id: '10k', label: '10K', match: (runner) => normalize(runner.category) === '10k' },
]

export const RUNNER_CATEGORY_FILTERS = CATEGORY_FILTERS

export const RESULT_FILTERS = CATEGORY_FILTERS

// Desglose del 10K por subcategoría × género, para el <select> "Grupo"
// que acompaña al filtro de categoría — solo tiene sentido cuando la
// categoría activa es 10K (ver disabled en App.jsx/ResultsPanel.jsx).
export const GROUP_FILTERS = [
  { id: 'todos', label: 'Todos los grupos', match: () => true },
  ...PODIUM_GROUPS,
]
