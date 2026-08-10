// Convenciones de la carrera:
// - category: "5K" (recreativo, sin podio) o "10K" (competitivo, con podio).
// - subcategory (solo aplica al 10K): veterano, mayor, master, informatico.
// - gender: "M" o "F".
//
// Se premian los primeros puestos de las 8 combinaciones de
// subcategoría × género dentro del 10K.

const GENDERS = [
  { value: 'M', label: 'Hombres' },
  { value: 'F', label: 'Mujeres' },
]

const SUBCATEGORIES = [
  { value: 'veterano', label: 'Veterano' },
  { value: 'mayor', label: 'Mayor' },
  { value: 'master', label: 'Master' },
  { value: 'informatico', label: 'Informático' },
]

const normalize = (value) => (value ?? '').toString().trim().toLowerCase()

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
const PODIUM_GROUPS = SUBCATEGORIES.flatMap((subcategory) =>
  GENDERS.map((gender) => ({
    id: `10k-${subcategory.value}-${gender.value}`,
    label: `${subcategory.label} · ${gender.label}`,
    match: (runner) =>
      normalize(runner.category) === '10k' &&
      normalize(runner.subcategory) === subcategory.value &&
      (runner.gender ?? '').toUpperCase() === gender.value,
  }))
)

export const RESULT_FILTERS = [
  { id: 'todos', label: 'Todos', match: () => true },
  {
    id: '5k',
    label: '5K',
    match: (runner) => normalize(runner.category) === '5k',
  },
  ...PODIUM_GROUPS,
]
