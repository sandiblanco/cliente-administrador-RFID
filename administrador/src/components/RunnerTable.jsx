import { useState } from 'react'
import { formatTime } from '../utils/formatTime'
import { STATUS, getStatus } from '../utils/status'
import { formatCategoryLabel } from '../utils/category'
import EditTimeModal from './EditTimeModal'

export default function RunnerTable({
  runners,
  emptyMessage = 'Sin corredores',
  onEditTime,
  showCategory = false,
  showRank = false,
}) {
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
            {showRank && <th>Puesto</th>}
            <th>ID</th>
            <th>Nombre</th>
            {showCategory && <th>Categoría</th>}
            <th>Tiempo</th>
            <th>Estado</th>
            {onEditTime && <th>Acciones</th>}
          </tr>
        </thead>
        <tbody>
          {runners.map((runner, index) => (
            <tr key={runner.id}>
              {showRank && <td>{index + 1}</td>}
              <td>{runner.id}</td>
              <td>{runner.name}</td>
              {showCategory && <td>{formatCategoryLabel(runner)}</td>}
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
