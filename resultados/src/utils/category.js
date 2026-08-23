// Mismas convenciones que category.js en podio/administrador (ver esos
// archivos): category 5K/10K, subcategory solo aplica al 10K, gender M/F.
// Acá solo viven las opciones de filtro de la tabla de resultados
// pública -- los labels/formato de categoría ya vienen calculados desde
// el backend (category_label, ver _format_category_label en main.py).

export const DISTANCE_FILTERS = [
  { id: '5k', label: '5K' },
  { id: '10k', label: '10K' },
]

export const GENDER_FILTERS = [
  { id: '', label: 'Todos' },
  { id: 'M', label: 'Hombres' },
  { id: 'F', label: 'Mujeres' },
]

// Solo se muestra con 10K activo -- a diferencia de PODIUM_GROUPS
// (podio/administrador), que combina subcategoría × género en un solo
// selector de 8 opciones, acá la subcategoría es una faceta aparte e
// independiente del género: permite el caso que no existía en ningún
// otro lado, "10K en general (todas las subcategorías) filtrado solo
// por género".
export const SUBCATEGORY_FILTERS = [
  { id: '', label: 'Todas las categorías' },
  { id: 'veterano', label: 'Veterano' },
  { id: 'mayor', label: 'Mayor' },
  { id: 'master', label: 'Master' },
  { id: 'master_b', label: 'Máster B' },
]
