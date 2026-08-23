import { useMemo, useState } from 'react'
import RunnerTable from './RunnerTable'
import { RESULT_FILTERS, GROUP_FILTERS } from '../utils/category'

export default function ResultsPanel({ runners, onEditTime, onDeleteTime }) {
  const [activeFilterId, setActiveFilterId] = useState(RESULT_FILTERS[0].id)
  // Dependiente del filtro de modalidad, mismo criterio que en
  // Corredores (ver App.jsx): solo importa con '10k' activo, y se
  // resetea al salir de esa modalidad.
  const [groupFilterId, setGroupFilterId] = useState(GROUP_FILTERS[0].id)

  const activeFilter =
    RESULT_FILTERS.find((filter) => filter.id === activeFilterId) ?? RESULT_FILTERS[0]

  const groupFilter = GROUP_FILTERS.find((f) => f.id === groupFilterId) ?? GROUP_FILTERS[0]

  const handleFilterChange = (id) => {
    setActiveFilterId(id)
    if (id !== '10k') {
      setGroupFilterId(GROUP_FILTERS[0].id)
    }
  }

  const filteredResults = useMemo(
    () =>
      runners
        .filter((r) => r.timestamp)
        .filter(activeFilter.match)
        .filter(groupFilter.match)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    [runners, activeFilter, groupFilter]
  )

  return (
    <div>
      <div className="sticky-toolbar">
        <div className="filter-group">
          <div className="filter-buttons" role="tablist" aria-label="Modalidades">
            {RESULT_FILTERS.map((filter) => (
              <button
                key={filter.id}
                type="button"
                role="tab"
                aria-selected={activeFilterId === filter.id}
                className={`filter-btn ${
                  activeFilterId === filter.id ? 'filter-btn-active' : ''
                }`}
                onClick={() => handleFilterChange(filter.id)}
              >
                {filter.label}
              </button>
            ))}
          </div>
          {/* Solo existe con 10K activo — ver mismo criterio en App.jsx:
              dejarlo visible pero deshabilitado fuera de 10K leía como
              roto en vez de "no aplica todavía". */}
          {activeFilterId === '10k' && (
            <select
              className="filter-select"
              aria-label="Grupo del 10K"
              value={groupFilterId}
              onChange={(event) => setGroupFilterId(event.target.value)}
            >
              {GROUP_FILTERS.map((filter) => (
                <option key={filter.id} value={filter.id}>
                  {filter.label}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      <RunnerTable
        runners={filteredResults}
        emptyMessage="Aún no hay corredores finalizados en esta modalidad"
        onEditTime={onEditTime}
        onDeleteTime={onDeleteTime}
        showRank
      />
    </div>
  )
}
