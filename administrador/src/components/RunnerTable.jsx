import { useState } from 'react'
import { formatTime } from '../utils/formatTime'
import { STATUS, getStatus } from '../utils/status'
import EditTimeModal from './EditTimeModal'

export default function RunnerTable({ runners, emptyMessage = 'Sin corredores', onEditTime }) {
  const [editingRunner, setEditingRunner] = useState(null)

  if (runners.length === 0) {
    return <p className="empty">{emptyMessage}</p>
  }

  const statusClass = (runner) =>
    getStatus(runner) === STATUS.FINISHED ? 'badge-done' : 'badge-pending'

  const handleSave = (timestamp) => onEditTime(editingRunner.id, timestamp)

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tiempo</th>
            <th>Estado</th>
            {onEditTime && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {runners.map((runner) => (
            <tr key={runner.id}>
              <td>{runner.id}</td>
              <td>{runner.name}</td>
              <td>{formatTime(runner.timestamp)}</td>
              <td>
                <span className={`badge ${statusClass(runner)}`}>
                  {getStatus(runner)}
                </span>
              </td>
              {onEditTime && (
                <td>
                  {runner.timestamp ? (
                    <button
                      type="button"
                      className="link-action"
                      onClick={() => setEditingRunner(runner)}
                    >
                      Editar tiempo
                    </button>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>

      {editingRunner && (
        <EditTimeModal
          runner={editingRunner}
          onSave={handleSave}
          onClose={() => setEditingRunner(null)}
        />
      )}
    </div>
  )
}
