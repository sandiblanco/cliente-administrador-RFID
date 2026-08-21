import { useRef, useState } from 'react'
import { replaceRunnersFromFile } from '../api/client'
import { UploadIcon } from './icons'
import UploadRunnersConfirm from './UploadRunnersConfirm'

// Página de "Subir archivo de corredores" — llegada desde el menú de tres
// puntos del header. Toma un .xlsx (export del formulario de inscripción),
// lo envía al backend, y reemplaza TODO el listado de corredores con lo
// que venga en el archivo.
export default function UploadRunnersPage({ onDone }) {
  const fileInputRef = useRef(null)
  const [file, setFile] = useState(null)
  const [confirming, setConfirming] = useState(false)
  const [result, setResult] = useState(null)

  const handleFileChange = (event) => {
    const selected = event.target.files?.[0] ?? null
    setFile(selected)
    setResult(null)
  }

  const handleUpload = async () => {
    const res = await replaceRunnersFromFile(file)
    if (res.status !== 'ok') {
      throw new Error(res.message || 'No se pudo subir el archivo')
    }
    setResult(res)
    setFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <section>
      <div className="upload-runners-panel">
        <h2>Subir archivo de corredores</h2>
        <p className="upload-runners-hint">
          Subí el .xlsx con el listado de inscritos (export del formulario
          de inscripción). Esto reemplaza a TODOS los corredores y tiempos
          actuales con los datos del archivo.
        </p>

        <label className="upload-runners-dropzone" htmlFor="runners-xlsx-input">
          <UploadIcon />
          <span>{file ? file.name : 'Elegí un archivo .xlsx'}</span>
        </label>
        <input
          id="runners-xlsx-input"
          ref={fileInputRef}
          type="file"
          accept=".xlsx"
          onChange={handleFileChange}
          className="upload-runners-input"
        />

        <div className="upload-runners-actions">
          <button
            type="button"
            className="btn-primary"
            disabled={!file}
            onClick={() => setConfirming(true)}
          >
            Subir y reemplazar corredores
          </button>
        </div>

        {result && (
          <div className="upload-runners-result">
            <p>
              <strong>{result.inserted}</strong> corredores importados
              {result.skipped?.length ? (
                <> · <strong>{result.skipped.length}</strong> filas omitidas</>
              ) : null}
            </p>
            {result.skipped?.length > 0 && (
              <ul className="upload-runners-skipped">
                {result.skipped.map((s, i) => (
                  <li key={i}>
                    Fila {s.row}
                    {s.runner_id ? ` (corredor ${s.runner_id})` : ''}: {s.reason}
                  </li>
                ))}
              </ul>
            )}
            <button type="button" className="btn-secondary" onClick={onDone}>
              Ir a Corredores
            </button>
          </div>
        )}
      </div>

      {confirming && (
        <UploadRunnersConfirm
          fileName={file?.name}
          onConfirm={handleUpload}
          onClose={() => setConfirming(false)}
        />
      )}
    </section>
  )
}
