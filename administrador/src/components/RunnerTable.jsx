import { formatTime } from '../utils/formatTime'
import { STATUS, getStatus } from '../utils/status'

export default function RunnerTable({ runners, emptyMessage = 'Sin corredores' }) {
  if (runners.length === 0) {
    return <p className="empty">{emptyMessage}</p>
  }

  const statusClass = (runner) =>
    getStatus(runner) === STATUS.FINISHED ? 'badge-done' : 'badge-pending'

  return (
    <div className="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Tiempo</th>
            <th>Estado</th>
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
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
