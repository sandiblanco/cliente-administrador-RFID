import { ClockIcon } from './icons'
import { formatElapsed } from '../utils/formatElapsed'

const GENDER_LABELS = { M: 'Hombres', F: 'Mujeres' }

// Una tarjeta por corredor encontrado. Muestra hasta dos puestos, los que
// el backend calculó en /public/search (ver _build_public_result en
// main.py):
// - "general" (rank_gender/group_total_gender): dentro de su categoría
//   (5K o 10K) contando solo por género, sin mirar subcategoría. Aplica
//   siempre que haya llegado.
// - "de categoría" (rank_group/group_total_group): dentro de su grupo
//   subcategoría × género. Solo existe en 10K -- el 5K es recreativo y
//   no tiene subcategorías (ver category.js del podio).
export default function ResultCard({ result }) {
  const genderLabel = GENDER_LABELS[result.gender] ?? result.gender ?? '—'

  return (
    <article className="result-card">
      <header className="result-card-header">
        <span className="result-bib">#{result.runner_id}</span>
        <h2 className="result-name">{result.name}</h2>
      </header>

      <p className="result-category">{result.category_label}</p>

      {!result.finished && (
        <p className="result-pending">Todavía no registra tiempo de llegada.</p>
      )}

      {result.finished && (
        <div className="result-stats">
          <div className="result-stat result-stat-time">
            <ClockIcon className="result-stat-icon" />
            <div>
              <span className="result-stat-label">Tiempo</span>
              <span className="result-stat-value">{formatElapsed(result.elapsed_seconds)}</span>
            </div>
          </div>

          {result.rank_gender != null && (
            <div className="result-stat">
              <span className="result-stat-rank">{result.rank_gender}º</span>
              <div>
                <span className="result-stat-label">
                  General {result.category} · {genderLabel}
                </span>
                <span className="result-stat-value">de {result.group_total_gender}</span>
              </div>
            </div>
          )}

          {result.rank_group != null && (
            <div className="result-stat">
              <span className="result-stat-rank">{result.rank_group}º</span>
              <div>
                <span className="result-stat-label">En tu categoría</span>
                <span className="result-stat-value">de {result.group_total_group}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </article>
  )
}
