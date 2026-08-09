export default function RunnerCard({ runner, pending = false }) {
  const registered = runner.timestamp !== null

  return (
    <div className={`runner-card ${registered ? 'registered' : 'pending'}`}>
      <span className="status-dot" aria-hidden="true" />
      <div className="runner-name">{runner.name}</div>
      <div className="runner-id">{runner.id}</div>
      {registered && runner.timestamp && (
        <div className="runner-time">{runner.timestamp}</div>
      )}
      {pending && <div className="runner-pending">Registrando...</div>}
    </div>
  )
}
