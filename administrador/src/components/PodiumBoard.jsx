import { formatTime } from '../utils/formatTime'
import { PODIUM_GROUPS } from '../utils/category'

const PLACE_LABELS = ['1º', '2º', '3º']

export default function PodiumBoard({ runners }) {
  const podiums = PODIUM_GROUPS.map((group) => {
    const top3 = runners
      .filter((r) => r.timestamp)
      .filter(group.match)
      .sort((a, b) => new Date(a.timestamp) - new Date(b.timestamp))
      .slice(0, 3)
    return { ...group, top3 }
  })

  return (
    <section className="podium-board" aria-label="Podio por modalidad">
      <h2 className="section-title">Podio</h2>
      <div className="podium-grid">
        {podiums.map((group) => (
          <div key={group.id} className="podium-card">
            <h3 className="podium-card-title">{group.label}</h3>
            <ol className="podium-list">
              {PLACE_LABELS.map((label, i) => {
                const runner = group.top3[i]
                return (
                  <li key={label} className={`podium-place podium-place-${i + 1}`}>
                    <span className="podium-rank">{label}</span>
                    {runner ? (
                      <>
                        <span className="podium-name">{runner.name}</span>
                        <span className="podium-time">{formatTime(runner.timestamp)}</span>
                      </>
                    ) : (
                      <span className="podium-name podium-empty">— sin definir —</span>
                    )}
                  </li>
                )
              })}
            </ol>
          </div>
        ))}
      </div>
    </section>
  )
}
