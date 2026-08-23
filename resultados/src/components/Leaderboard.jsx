import { useLeaderboard } from '../hooks/useLeaderboard'
import { DISTANCE_FILTERS, GENDER_FILTERS, SUBCATEGORY_FILTERS } from '../utils/category'
import { formatElapsed } from '../utils/formatElapsed'

export default function Leaderboard({ filters, onFilterChange, highlightRunnerId }) {
  const { status, results, error } = useLeaderboard(filters)

  return (
    <section className="leaderboard" id="leaderboard-section">
      <div className="leaderboard-filters">
        <div className="filter-group" role="tablist" aria-label="Distancia">
          {DISTANCE_FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              role="tab"
              aria-selected={filters.category === f.id}
              className={`filter-btn ${filters.category === f.id ? 'filter-btn-active' : ''}`}
              onClick={() => onFilterChange({ category: f.id, subcategory: '' })}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="filter-group" role="tablist" aria-label="Género">
          {GENDER_FILTERS.map((f) => (
            <button
              key={f.id || 'todos'}
              type="button"
              role="tab"
              aria-selected={filters.gender === f.id}
              className={`filter-btn ${filters.gender === f.id ? 'filter-btn-active' : ''}`}
              onClick={() => onFilterChange({ gender: f.id })}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Solo tiene sentido dentro del 10K -- el 5K es recreativo y no
            tiene subcategorías (ver category.js). */}
        {filters.category === '10k' && (
          <select
            className="filter-select"
            aria-label="Categoría del 10K"
            value={filters.subcategory}
            onChange={(e) => onFilterChange({ subcategory: e.target.value })}
          >
            {SUBCATEGORY_FILTERS.map((f) => (
              <option key={f.id || 'todas'} value={f.id}>
                {f.label}
              </option>
            ))}
          </select>
        )}
      </div>

      {status === 'loading' && <p className="status-line">Cargando resultados…</p>}

      {status === 'error' && (
        <p className="error-banner" role="alert">
          {error}
        </p>
      )}

      {status === 'done' && results.length === 0 && (
        <p className="status-line">Todavía no hay llegadas registradas en esta modalidad.</p>
      )}

      {status === 'done' && results.length > 0 && (
        <ol className="leaderboard-table">
          {results.map((r) => (
            <li
              key={r.runner_id}
              className={`leaderboard-row ${
                r.runner_id === highlightRunnerId ? 'leaderboard-row-highlight' : ''
              }`}
            >
              <span className="leaderboard-rank">{r.rank}º</span>
              <span className="leaderboard-name">
                {r.name} <span className="leaderboard-bib">#{r.runner_id}</span>
              </span>
              <span className="leaderboard-time">{formatElapsed(r.elapsed_seconds)}</span>
            </li>
          ))}
        </ol>
      )}
    </section>
  )
}
