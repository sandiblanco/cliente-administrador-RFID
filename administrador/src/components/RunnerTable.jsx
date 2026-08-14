import { useState } from 'react'
import { formatTime } from '../utils/formatTime'
import { STATUS, getStatus } from '../utils/status'
import { formatCategoryLabel } from '../utils/category'
import EditTimeModal from './EditTimeModal'
import DeleteTimeConfirm from './DeleteTimeConfirm'

export default function RunnerTable({
  runners,
  emptyMessage = 'Sin corredores',
  onEditTime,
  onDeleteTime,
  showCategory = false,
  showRank = false,
}) {
  const [editingRunner, setEditingRunner] = useState(null)
  const [deletingRunner, setDeletingRunner] = useState(null)

  if (runners.length === 0) {
    return <p className="empty">{emptyMessage}</p>
  }

  const statusClass = (runner) =>
    getStatus(runner) === STATUS.FINISHED ? 'badge-done' : 'badge-pending'

  const handleSave = (timestamp) => onEditTime(editingRunner.id, timestamp)
  const handleDelete = () => onDeleteTime(deletingRunner.id)

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
              {showRank && (
                <td>
                  <span className="rank">{index + 1}</span>
                </td>
              )}
              <td>{runner.id}</td>
              <td>{runner.name}</td>
              {showCategory && (
                <td>
                  <span className="tag">{formatCategoryLabel(runner)}</span>
                </td>
              )}
              <td>{formatTime(runner.timestamp)}</td>
              <td>
                <span className={`badge ${statusClass(runner)}`}>
                  {getStatus(runner)}
                </span>
              </td>
              {onEditTime && (
                <td>
                  <div className="row-actions">
                    <button
                      type="button"
                      className="link-action"
                      onClick={() => setEditingRunner(runner)}
                    >
                      {runner.timestamp ? 'Editar tiempo' : 'Agregar tiempo'}
                    </button>
                    {runner.timestamp && onDeleteTime && (
                      <button
                        type="button"
                        className="link-action link-danger"
                        onClick={() => setDeletingRunner(runner)}
                      >
                        Eliminar
                      </button>
                    )}
                  </div>
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

      {deletingRunner && (
        <DeleteTimeConfirm
          runner={deletingRunner}
          onConfirm={handleDelete}
          onClose={() => setDeletingRunner(null)}
        />
      )}
    </div>
  )
}
