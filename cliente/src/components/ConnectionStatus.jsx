export default function ConnectionStatus({
  isOnline,
  pendingCount,
  syncing,
  syncProgress,
}) {
  if (syncing && syncProgress) {
    return (
      <div className="connection-status">
        <span className="connection-dot syncing" />
        <span className="connection-label">
          Sincronizando... {syncProgress.processed}/{syncProgress.total}
        </span>
      </div>
    )
  }

  if (pendingCount > 0) {
    return (
      <div className="connection-status">
        <span className={`connection-dot ${isOnline ? 'online' : 'offline'}`} />
        <span className="connection-label">
          {pendingCount} registro{pendingCount !== 1 ? 's' : ''} pendiente
          {pendingCount !== 1 ? 's' : ''}
        </span>
      </div>
    )
  }

  return (
    <div className="connection-status">
      <span className={`connection-dot ${isOnline ? 'online' : 'offline'}`} />
      <span className="connection-label">
        {isOnline ? 'Conectado' : 'Sin conexión'}
      </span>
    </div>
  )
}
