import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useRunners } from './hooks/useRunners'
import { useTheme } from './hooks/useTheme'
import { useActivityLog } from './hooks/useActivityLog'
import { deleteResultTime, updateResultTime, updateRunner } from './api/client'
import CONFIG from './config'
import Dashboard from './components/Dashboard'
import RunnerTable from './components/RunnerTable'
import ResultsPanel from './components/ResultsPanel'
import ReportsPanel from './components/ReportsPanel'
import SearchBar from './components/SearchBar'
import TimeConfigPanel from './components/TimeConfigPanel'
import HeaderMenu from './components/HeaderMenu'
import UploadRunnersPage from './components/UploadRunnersPage'
import { AlertIcon, MoonIcon, ReloadIcon, SunIcon } from './components/icons'
import { filterRunners } from './utils/search'
import { RUNNER_CATEGORY_FILTERS, GROUP_FILTERS } from './utils/category'
import { DELIVERY_FILTERS } from './utils/delivery'

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'runners', label: 'Corredores' },
  { id: 'results', label: 'Resultados' },
  { id: 'time-config', label: 'Configuración de tiempos' },
  { id: 'reports', label: 'Informes' },
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
  // Dependiente del filtro de categoría: solo tiene efecto real cuando
  // esta última es '10k' (ver disabled del <select> más abajo) — se
  // resetea a 'todos' apenas se sale del 10K para que no quede un
  // grupo elegido "fantasma" filtrando en silencio.
  const [groupFilterId, setGroupFilterId] = useState(GROUP_FILTERS[0].id)
  const [deliveryFilterId, setDeliveryFilterId] = useState(DELIVERY_FILTERS[0].id)
  // No es parte de DELIVERY_FILTERS ni de un grupo de tabs: la nota
  // especial es independiente del semáforo de entregas y puede
  // combinarse con cualquiera de sus opciones, así que es un toggle
  // aparte en vez de un valor más dentro de ese mismo grupo exclusivo.
  const [noteFilterActive, setNoteFilterActive] = useState(false)
  // Entregas + nota especial quedan colapsados detrás de un botón —
  // mostrar de entrada las dos filas de filtros (categoría y esto)
  // resultaba confuso; se revelan solo a pedido. Si ya hay algo activo
  // ahí (p. ej. se activó y después se cambió de tab), arrancan
  // visibles en vez de esconder un filtro que sigue filtrando en
  // silencio.
  const [extraFiltersOpen, setExtraFiltersOpen] = useState(false)

  // El header y la barra de tabs son sticky (quedan fijos arriba al
  // scrollear), y las barras de búsqueda/filtro de cada sección se
  // apilan pegadas justo debajo — para eso necesitan saber cuánto
  // espacio ocupan header+tabs, que varía según el contenido (el badge
  // "Modo demo", el ancho de pantalla que hace wrappear el título,
  // etc.). Se mide con ResizeObserver en vez de fijarlo a mano, para no
  // tener que mantener ese número sincronizado a mano con el CSS.
  const headerRef = useRef(null)
  const tabsRef = useRef(null)

  useLayoutEffect(() => {
    const headerEl = headerRef.current
    const tabsEl = tabsRef.current
    if (!headerEl || !tabsEl) {
      return
    }
    const root = document.documentElement
    const updateOffsets = () => {
      root.style.setProperty('--header-h', `${headerEl.offsetHeight}px`)
      root.style.setProperty('--tabs-h', `${tabsEl.offsetHeight}px`)
    }
    updateOffsets()
    const observer = new ResizeObserver(updateOffsets)
    observer.observe(headerEl)
    observer.observe(tabsEl)
    return () => observer.disconnect()
  }, [])

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

  // PUT /runners/{id} espera el Runner completo, no un parche — se
  // reconstruye a partir de lo que ya tenemos en memoria para esa fila en
  // vez de pedirlo de nuevo al servidor. shirt_size viaja tal cual está
  // en memoria (viene del .xlsx, no se edita desde acá — ver
  // RunnerInfoButton) y lo mismo el resto de campos permanentes que no
  // se están editando en cada llamada, para no pisarlos.
  const handleUpdateTag = async (runner, tagId) => {
    const res = await updateRunner(runner.id, {
      runner_id: runner.id,
      tag_id: tagId,
      name: runner.name,
      gender: runner.gender,
      category: runner.category,
      subcategory: runner.subcategory,
      shirt_size: runner.shirtSize,
      shirt_delivered: runner.shirtDelivered,
      kit_delivered: runner.kitDelivered,
      special_note: runner.specialNote,
    })
    if (res.status !== 'ok') {
      throw new Error(res.message || 'No se pudo actualizar el tag')
    }
    applyUpdate({ id: runner.id, tagId })
  }

  // Misma lógica que handleUpdateTag pero para los datos permanentes
  // del popover de info (entrega de camiseta y de paquete de corredor,
  // y la nota especial) — persisten por runner_id igual que el tag.
  // shirt_size no se toca: viene del .xlsx y no es editable desde este
  // popover.
  const handleUpdateInfo = async (runner, info) => {
    const res = await updateRunner(runner.id, {
      runner_id: runner.id,
      tag_id: runner.tagId,
      name: runner.name,
      gender: runner.gender,
      category: runner.category,
      subcategory: runner.subcategory,
      shirt_size: runner.shirtSize,
      shirt_delivered: info.shirtDelivered,
      kit_delivered: info.kitDelivered,
      special_note: info.specialNote,
    })
    if (res.status !== 'ok') {
      throw new Error(res.message || 'No se pudo actualizar la información del corredor')
    }
    applyUpdate({ id: runner.id, ...info })
  }

  const runnerCategoryFilter =
    RUNNER_CATEGORY_FILTERS.find((f) => f.id === runnerCategoryFilterId) ??
    RUNNER_CATEGORY_FILTERS[0]

  const groupFilter = GROUP_FILTERS.find((f) => f.id === groupFilterId) ?? GROUP_FILTERS[0]

  const deliveryFilter =
    DELIVERY_FILTERS.find((f) => f.id === deliveryFilterId) ?? DELIVERY_FILTERS[0]

  // Para el badge del botón que revela Entregas/Notas: si hay algo
  // activo ahí, tiene que notarse aunque el panel esté colapsado — si
  // no, un filtro sigue filtrando en silencio sin ninguna pista visual.
  const extraFiltersActiveCount =
    (deliveryFilterId !== DELIVERY_FILTERS[0].id ? 1 : 0) + (noteFilterActive ? 1 : 0)

  // Cambiar de categoría a algo distinto de 10K deja sin sentido el
  // grupo elegido — se limpia acá en vez de en el onClick del botón de
  // categoría para que valga sin importar desde dónde cambie (incluida
  // una futura navegación por URL).
  const handleCategoryFilterChange = (id) => {
    setRunnerCategoryFilterId(id)
    if (id !== '10k') {
      setGroupFilterId(GROUP_FILTERS[0].id)
    }
  }

  const filteredRunners = useMemo(
    () =>
      filterRunners(runners, query)
        .filter(runnerCategoryFilter.match)
        .filter(groupFilter.match)
        .filter(deliveryFilter.match)
        .filter((runner) => !noteFilterActive || !!runner.specialNote),
    [runners, query, runnerCategoryFilter, groupFilter, deliveryFilter, noteFilterActive]
  )

  return (
    <div className="app">
      <header className="header" ref={headerRef}>
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

      <nav className="tabs" aria-label="Secciones" ref={tabsRef}>
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
          {/* Orden de la barra de filtros, de más ancho a más específico
              (estándar de facetas de e-commerce/dashboards): 1) búsqueda
              libre, siempre visible arriba; 2) categoría — el filtro más
              amplio — junto a su dependiente (grupo del 10K, solo visible
              con 10K activo); 3) filtros de estado (entregas + nota),
              colapsados detrás de un botón — mostrar las dos filas de
              entrada resultaba confuso, así que la segunda solo aparece
              a pedido. */}
          <div className="sticky-toolbar">
            <SearchBar query={query} onChange={setQuery} />

            <div className="runners-toolbar">
              <div className="filter-group">
                <div className="filter-buttons" role="tablist" aria-label="Categoría">
                  {RUNNER_CATEGORY_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      role="tab"
                      aria-selected={runnerCategoryFilterId === filter.id}
                      className={`filter-btn ${
                        runnerCategoryFilterId === filter.id ? 'filter-btn-active' : ''
                      }`}
                      onClick={() => handleCategoryFilterChange(filter.id)}
                    >
                      {filter.label}
                    </button>
                  ))}
                </div>
                {/* Solo existe con 10K activo — antes quedaba siempre
                    visible pero deshabilitado fuera de 10K, y eso leía
                    como roto (un control gris que no responde) en vez de
                    "no aplica todavía". Mostrarlo solo cuando corresponde
                    es más claro que dejarlo ahí sin poder tocarlo. */}
                {runnerCategoryFilterId === '10k' && (
                  <select
                    className="filter-select"
                    aria-label="Grupo del 10K"
                    value={groupFilterId}
                    onChange={(event) => setGroupFilterId(event.target.value)}
                  >
                    {GROUP_FILTERS.map((filter) => (
                      <option key={filter.id} value={filter.id}>
                        {filter.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <button
                type="button"
                aria-expanded={extraFiltersOpen}
                className={`filter-btn ${extraFiltersOpen ? 'filter-btn-active' : ''}`}
                onClick={() => setExtraFiltersOpen((open) => !open)}
              >
                Filtros de entrega
                {extraFiltersActiveCount > 0 && (
                  <span className="filter-count-badge">{extraFiltersActiveCount}</span>
                )}
              </button>
            </div>

            {extraFiltersOpen && (
              <div className="filter-group">
                <div className="filter-buttons" role="tablist" aria-label="Entregas">
                  {DELIVERY_FILTERS.map((filter) => (
                    <button
                      key={filter.id}
                      type="button"
                      role="tab"
                      aria-selected={deliveryFilterId === filter.id}
                      className={`filter-btn ${
                        deliveryFilterId === filter.id ? 'filter-btn-active' : ''
                      }`}
                      onClick={() => setDeliveryFilterId(filter.id)}
                    >
                      {filter.dot && <span className={`filter-dot filter-dot-${filter.dot}`} />}
                      {filter.label}
                    </button>
                  ))}
                </div>
                {/* Toggle independiente, no exclusivo — se puede combinar
                    con cualquier valor del semáforo de Entregas, así que
                    va en su propio role="group" en vez de sumarse a ese
                    tablist. */}
                <div className="filter-buttons" role="group" aria-label="Notas">
                  <button
                    type="button"
                    aria-pressed={noteFilterActive}
                    className={`filter-btn ${noteFilterActive ? 'filter-btn-active' : ''}`}
                    onClick={() => setNoteFilterActive((active) => !active)}
                  >
                    Con nota especial
                  </button>
                </div>
              </div>
            )}
          </div>
          <RunnerTable
            runners={filteredRunners}
            emptyMessage={
              query.trim() ? 'Sin resultados para la búsqueda' : 'Sin corredores'
            }
            onEditTime={handleEditTime}
            onDeleteTime={handleDeleteTime}
            onUpdateTag={handleUpdateTag}
            onUpdateInfo={handleUpdateInfo}
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

      {!loading && activeTab === 'reports' && (
        <section>
          <ReportsPanel />
        </section>
      )}

      {activeTab === 'upload-runners' && (
        <UploadRunnersPage
          runners={runners}
          onDone={() => {
            setActiveTab('runners')
            reload()
          }}
        />
      )}
    </div>
  )
}
