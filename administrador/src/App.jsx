import { useMemo, useState } from 'react'
import { useRunners } from './hooks/useRunners'
import { useTheme } from './hooks/useTheme'
import { useActivityLog } from './hooks/useActivityLog'
import { deleteResultTime, updateResultTime } from './api/client'
import CONFIG from './config'
import Dashboard from './components/Dashboard'
import RunnerTable from './components/RunnerTable'
import ResultsPanel from './components/ResultsPanel'
import SearchBar from './components/SearchBar'
import ClearTimesButton from './components/ClearTimesButton'
import TimeConfigPanel from './components/TimeConfigPanel'
import HeaderMenu from './components/HeaderMenu'
import UploadRunnersPage from './components/UploadRunnersPage'
import { AlertIcon, MoonIcon, ReloadIcon, SunIcon } from './components/icons'
import { filterRunners } from './utils/search'
import { RUNNER_CATEGORY_FILTERS } from './utils/category'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'runners', label: 'Corredores' },
  { id: 'results', label: 'Resultados' },
  { id: 'time-config', label: 'Configuración de tiempos' },
]

export default function App() {
  const { runners, loading, error, reload, applyUpdate } = useRunners()
  const { theme, toggleTheme } = useTheme()
  const activityLog = useActivityLog()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [query, setQuery] = useState('')
  const [runnerCategoryFilterId, setRunnerCategoryFilterId] = useState(
    RUNNER_CATEGORY_FILTERS[0].id
  )

  const handleEditTime = async (runnerId, timestamp) => {
    const res = await updateResultTime(runnerId, timestamp)
    if (res.status !== 'ok') {
      throw new Error(res.message || 'No se pudo actualizar el tiempo')
    }
    applyUpdate({
      id: res.result.runner_id,
      name: res.result.name,
      timestamp: res.result.timestamp,
      category: res.result.category,
      subcategory: res.result.subcategory,
      gender: res.result.gender,
    })
  }

  const handleDeleteTime = async (runnerId) => {
    const res = await deleteResultTime(runnerId)
    if (res.status !== 'ok') {
      throw new Error(res.message || 'No se pudo eliminar el tiempo')
    }
    applyUpdate({ id: runnerId, timestamp: null })
  }

  const runnerCategoryFilter =
    RUNNER_CATEGORY_FILTERS.find((f) => f.id === runnerCategoryFilterId) ??
    RUNNER_CATEGORY_FILTERS[0]

  const filteredRunners = useMemo(
    () => filterRunners(runners, query).filter(runnerCategoryFilter.match),
    [runners, query, runnerCategoryFilter]
  )

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Administrador · Control de tiempos</h1>
          <p className="header-eyebrow">Sistema RFID // Carrera del Informático 2026</p>
        </div>
        <div className="header-actions">
          {CONFIG.useMock && <span className="badge badge-demo">Modo demo</span>}
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            {theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          </button>
          <button className="reload" onClick={reload} disabled={loading}>
            <ReloadIcon />
            Recargar
          </button>
          <HeaderMenu onUploadRunners={() => setActiveTab('upload-runners')} />
        </div>
      </header>

      <nav className="tabs" aria-label="Secciones">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      {error && (
        <p className="error">
          <AlertIcon className="error-icon" />
          <span>No se pudo obtener datos del servidor: {error}</span>
        </p>
      )}

      {loading && <p className="loading">Cargando datos…</p>}

      {!loading && activeTab === 'dashboard' && (
        <Dashboard runners={runners} activityLog={activityLog} />
      )}

      {!loading && activeTab === 'runners' && (
        <section>
          <div className="runners-toolbar">
            <div className="filter-buttons" role="tablist" aria-label="Modalidad">
              {RUNNER_CATEGORY_FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  type="button"
                  role="tab"
                  aria-selected={runnerCategoryFilterId === filter.id}
                  className={`filter-btn ${
                    runnerCategoryFilterId === filter.id ? 'filter-btn-active' : ''
                  }`}
                  onClick={() => setRunnerCategoryFilterId(filter.id)}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <ClearTimesButton onCleared={reload} />
          </div>
          <SearchBar query={query} onChange={setQuery} />
          <RunnerTable
            runners={filteredRunners}
            emptyMessage={
              query.trim() ? 'Sin resultados para la búsqueda' : 'Sin corredores'
            }
            onEditTime={handleEditTime}
            onDeleteTime={handleDeleteTime}
            showCategory
          />
        </section>
      )}

      {!loading && activeTab === 'results' && (
        <section>
          <ResultsPanel
            runners={runners}
            onEditTime={handleEditTime}
            onDeleteTime={handleDeleteTime}
          />
        </section>
      )}

      {!loading && activeTab === 'time-config' && (
        <section>
          <TimeConfigPanel onTimesCleared={reload} />
        </section>
      )}

      {activeTab === 'upload-runners' && (
        <UploadRunnersPage
          onDone={() => {
            setActiveTab('runners')
            reload()
          }}
        />
      )}
    </div>
  )
}
