import RunnerCard from './RunnerCard.jsx'

export default function RunnerGrid({ runners, pendingIds }) {
  if (runners.length === 0) {
    return <p className="empty-message">No hay corredores cargados.</p>
  }

  return (
    <div className="runner-grid">
      {runners.map((runner) => (
        <RunnerCard
          key={runner.id}
          runner={runner}
          pending={pendingIds.includes(runner.id)}
        />
      ))}
    </div>
  )
}
