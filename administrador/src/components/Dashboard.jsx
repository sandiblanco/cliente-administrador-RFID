import PodiumBoard from './PodiumBoard'
import ActivityLog from './ActivityLog'

export default function Dashboard({ runners, activityLog }) {
  const total = runners.length
  const finished = runners.filter((r) => r.timestamp).length
  const pending = total - finished

  const cards = [
    { label: 'Total de corredores', value: total },
    { label: 'Corredores finalizados', value: finished },
    { label: 'Corredores pendientes', value: pending },
  ]

  return (
    <div className="dashboard-layout">
      <div className="dashboard-main">
        <section className="dashboard" aria-label="Resumen de la carrera">
          {cards.map((card) => (
            <div key={card.label} className="card">
              <span className="card-value">{card.value}</span>
              <span className="card-label">{card.label}</span>
            </div>
          ))}
        </section>

        <PodiumBoard runners={runners} />
      </div>

      <ActivityLog entries={activityLog} />
    </div>
  )
}
