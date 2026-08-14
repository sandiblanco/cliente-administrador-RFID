import { PendingIcon } from './icons.jsx'
import { formatElapsed } from '../utils/formatElapsed.js'

export default function RunnerCard({ runner, pending = false }) {
  const registered = runner.timestamp !== null

  return (
    <div className={`runner-card ${registered ? 'registered' : 'pending'}`}>
      <span className="status-dot" aria-hidden="true" />
      <div className="runner-name">{runner.name}</div>
      <div className="runner-id">#{runner.id}</div>
      {registered && (
        <div className="runner-time">{formatElapsed(runner.elapsedSeconds)}</div>
      )}
      {!registered && (
        <div className="runner-time unregistered">Sin registrar</div>
      )}
      {pending && (
        <div className="runner-pending">
          <PendingIcon className="runner-pending-icon" />
          Registrando...
        </div>
      )}
    </div>
  )
}
