import { useState } from 'react'
import { formatElapsed } from '../utils/formatElapsed'
import { STATUS, getStatus } from '../utils/status'
import { formatCategoryLabel } from '../utils/category'
import EditTimeModal from './EditTimeModal'
import DeleteTimeConfirm from './DeleteTimeConfirm'
import TagEditButton from './TagEditButton'
import RunnerInfoButton from './RunnerInfoButton'

export default function RunnerTable({
  runners,
  emptyMessage = 'Sin corredores',
  onEditTime,
  onDeleteTime,
  onUpdateTag,
  onUpdateInfo,
  showCategory = false,
  showRank = false,
}) {
  const [editingRunner, setEditingRunner] = useState(null)
  const [deletingRunner, setDeletingRunner] = useState(null)

  // Cuenta lo que efectivamente se está mostrando: `runners` ya viene
  // filtrado por el filtro de modalidad y/o la búsqueda activa en quien
  // llama a esta tabla, así que este número siempre refleja lo que hay
  // en pantalla, no el total sin filtrar.
  const countLabel = `${runners.length} ${runners.length === 1 ? 'corredor' : 'corredores'}`

  if (runners.length === 0) {
    return (
      <>
        <p className="table-count table-count-standalone">{countLabel}</p>
        <p className="empty">{emptyMessage}</p>
      </>
    )
  }

  const statusClass = (runner) =>
    getStatus(runner) === STATUS.FINISHED ? 'badge-done' : 'badge-pending'

  const handleSave = (timestamp) => onEditTime(editingRunner.id, timestamp)
  const handleDelete = () => onDeleteTime(deletingRunner.id)

  return (
    <div className="table-wrapper">
      <p className="table-count">{countLabel}</p>
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
            {onUpdateInfo && <th className="th-info"></th>}
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
              <td>
                <span className="id-cell">
                  {runner.id}
                  {onUpdateTag && (
                    <TagEditButton
                      runner={runner}
                      onSave={(tagId) => onUpdateTag(runner, tagId)}
                    />
                  )}
                </span>
              </td>
              <td>{runner.name}</td>
              {showCategory && (
                <td>
                  <span className="tag">{formatCategoryLabel(runner)}</span>
                </td>
              )}
              <td>{formatElapsed(runner.elapsedSeconds)}</td>
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
              {onUpdateInfo && (
                <td className="td-info">
                  <RunnerInfoButton
                    runner={runner}
                    onSave={(info) => onUpdateInfo(runner, info)}
                  />
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
