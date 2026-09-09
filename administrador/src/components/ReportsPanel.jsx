import { useEffect, useState } from 'react'
import { getReportSummary, downloadReportXlsx, downloadReportPdf } from '../api/client'
import { GENDERS } from '../utils/category'
import { AlertIcon, DownloadIcon, ReloadIcon } from './icons'

const genderLabel = (value) => GENDERS.find((g) => g.value === value)?.label ?? value

function StatCard({ label, value }) {
  return (
    <div className="card">
      <span className="card-value">{value}</span>
      <span className="card-label">{label}</span>
    </div>
  )
}

// Tabla genérica de desglose: siempre muestra el título (con el conteo
// si aplica, ver los usos de abajo) para que quede claro que la
// sección se revisó y no tiene datos, en vez de desaparecer sin más —
// mismo criterio que el emptyMessage de RunnerTable.
function BreakdownTable({ title, headers, rows, emptyMessage = 'Sin datos' }) {
  return (
    <section className="reports-section">
      <h3>{title}</h3>
      {rows.length ? (
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                {headers.map((header) => (
                  <th key={header}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                // eslint-disable-next-line react/no-array-index-key -- filas sin id propio, el orden no cambia entre renders
                <tr key={i}>
                  {row.map((cell, j) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <td key={j}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="muted">{emptyMessage}</p>
      )}
    </section>
  )
}

export default function ReportsPanel() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState(null)
  // 'xlsx' | 'pdf' | null — deshabilita ambos botones mientras cualquiera
  // de los dos exports está en curso, para no disparar dos descargas a
  // la vez sobre la misma data.
  const [exporting, setExporting] = useState(null)
  const [exportError, setExportError] = useState(null)

  const load = async () => {
    setLoading(true)
    setLoadError(null)
    try {
      setData(await getReportSummary())
    } catch (err) {
      setLoadError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleExport = async (format) => {
    setExporting(format)
    setExportError(null)
    try {
      await (format === 'xlsx' ? downloadReportXlsx() : downloadReportPdf())
    } catch (err) {
      setExportError(err.message)
    } finally {
      setExporting(null)
    }
  }

  return (
    <div className="reports-panel">
      <div className="reports-header">
        <div>
          <h2 className="section-title">Informes</h2>
          {data && (
            <p className="muted">
              Generado: {new Date(data.generated_at).toLocaleString('es-CR')}
            </p>
          )}
        </div>
        <div className="reports-actions">
          <button type="button" className="btn-secondary" onClick={load} disabled={loading}>
            <ReloadIcon /> Actualizar
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleExport('xlsx')}
            disabled={exporting !== null}
          >
            <DownloadIcon /> {exporting === 'xlsx' ? 'Generando…' : 'Exportar Excel'}
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => handleExport('pdf')}
            disabled={exporting !== null}
          >
            <DownloadIcon /> {exporting === 'pdf' ? 'Generando…' : 'Exportar PDF'}
          </button>
        </div>
      </div>

      {loadError && (
        <p className="error">
          <AlertIcon className="error-icon" />
          <span>No se pudo obtener el informe: {loadError}</span>
        </p>
      )}
      {exportError && (
        <p className="error">
          <AlertIcon className="error-icon" />
          <span>No se pudo generar el archivo: {exportError}</span>
        </p>
      )}

      {loading && <p className="loading">Cargando informe…</p>}

      {!loading && data && (
        <>
          <section className="dashboard" aria-label="Resumen de entregas">
            <StatCard
              label="Camisetas entregadas"
              value={`${data.shirts.delivered} / ${data.totals.total}`}
            />
            <StatCard
              label="Kits entregados"
              value={`${data.kits.delivered} / ${data.totals.total}`}
            />
            <StatCard
              label="Tags RFID asignados"
              value={`${data.tags.assigned} / ${data.totals.total}`}
            />
            <StatCard
              label="Resultados corregidos a mano"
              value={data.results_quality.corrected}
            />
          </section>

          <BreakdownTable
            title="Por categoría"
            headers={['Categoría', 'Total', 'Finalizados', 'Pendientes']}
            rows={Object.entries(data.by_category).map(([category, v]) => [
              category,
              v.total,
              v.finished,
              v.pending,
            ])}
          />

          <BreakdownTable
            title="Por género"
            headers={['Género', 'Total', 'Finalizados', 'Pendientes']}
            rows={Object.entries(data.by_gender).map(([gender, v]) => [
              genderLabel(gender),
              v.total,
              v.finished,
              v.pending,
            ])}
          />

          <BreakdownTable
            title="Subcategorías del 10K"
            headers={['Subcategoría', 'Total', 'Finalizados', 'Pendientes']}
            rows={Object.values(data.by_subcategory).map((v) => [
              v.label,
              v.total,
              v.finished,
              v.pending,
            ])}
            emptyMessage="Todavía no hay corredores de 10K"
          />

          <BreakdownTable
            title="Camisetas por talla"
            headers={['Talla', 'Cantidad']}
            rows={Object.entries(data.shirts.by_size).map(([size, count]) => [size, count])}
          />

          <BreakdownTable
            title="Tiempos"
            headers={['Categoría', 'Mejor', 'Peor', 'Promedio', 'Mediana']}
            rows={[
              [
                'General',
                data.times.overall.best ?? '—',
                data.times.overall.worst ?? '—',
                data.times.overall.avg ?? '—',
                data.times.overall.median ?? '—',
              ],
              ...Object.entries(data.times.by_category).map(([category, v]) => [
                category,
                v.best ?? '—',
                v.worst ?? '—',
                v.avg ?? '—',
                v.median ?? '—',
              ]),
            ]}
            emptyMessage="Todavía no hay tiempos registrados"
          />

          <BreakdownTable
            title="Resultados por fuente"
            headers={['Fuente', 'Cantidad']}
            rows={Object.entries(data.results_quality.by_source).map(([source, count]) => [
              source,
              count,
            ])}
            emptyMessage="Todavía no hay resultados registrados"
          />

          <BreakdownTable
            title={`Notas especiales (${data.special_notes.length})`}
            headers={['Corredor', 'Categoría', 'Nota']}
            rows={data.special_notes.map((n) => [n.name, n.category, n.note])}
            emptyMessage="Nadie tiene una nota especial registrada"
          />

          <BreakdownTable
            title={`Ausentes (${data.absentees.length})`}
            headers={['Corredor', 'Categoría', 'Género']}
            rows={data.absentees.map((a) => [a.name, a.category, genderLabel(a.gender)])}
            emptyMessage="Todos los inscritos ya tienen un tiempo registrado"
          />
        </>
      )}
    </div>
  )
}
