import { useMemo, useState } from 'react'
import RunnerTable from './RunnerTable'
import { RESULT_FILTERS } from '../utils/category'

export default function ResultsPanel({ runners, onEditTime }) {
  const [activeFilterId, setActiveFilterId] = useState(RESULT_FILTERS[0].id)

  const activeFilter =
    RESULT_FILTERS.find((filter) => filter.id === activeFilterId) ?? RESULT_FILTERS[0]

  const filteredResults = useMemo(
    () =>
      runners
        .filter((r) => r.timestamp)
        .filter(activeFilter.match)
        .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp)),
    [runners, activeFilter]
  )

  return (
    <div>
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
            onClick={() => setActiveFilterId(filter.id)}
          >
            {filter.label}
          </button>
        ))}
      </div>

      <RunnerTable
        runners={filteredResults}
        emptyMessage="Aún no hay corredores finalizados en esta modalidad"
        onEditTime={onEditTime}
        showRank
      />
    </div>
  )
}
