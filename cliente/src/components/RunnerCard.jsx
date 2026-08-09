export default function RunnerCard({ runner, pending = false }) {
  const registered = runner.timestamp !== null
  const time = registered ? runner.timestamp.slice(11, 19) : null

  return (
    <div className={`runner-card ${registered ? 'registered' : 'pending'}`}>
      <span className="status-dot" aria-hidden="true" />
      <div className="runner-name">{runner.name}</div>
      <div className="runner-id">#{runner.id}</div>
      {registered && time && <div className="runner-time">{time}</div>}
      {!registered && (
        <div className="runner-time unregistered">Sin registrar</div>
      )}
      {pending && <div className="runner-pending">Registrando...</div>}
    </div>
  )
}
