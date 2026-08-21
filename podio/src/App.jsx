import { useRunners } from './hooks/useRunners'
import PodiumBoard from './components/PodiumBoard'
import { AlertIcon, RunnerBadgeIcon } from './components/icons'

export default function App() {
  const { runners, error } = useRunners()

  return (
    <main className="app">
      <header className="header">
        <span className="header-live">
          <span className="header-live-dot" />
          EN VIVO
        </span>

        <div className="badge">
          <RunnerBadgeIcon className="badge-icon" />
        </div>

        <p className="header-eyebrow">Carrera del Informático</p>
        <h1 className="header-title">Podio</h1>
        <p className="header-sub">10K · Veterano / Mayor / Master · Hombres / Mujeres</p>
      </header>

      {error && (
        <p className="error-banner" role="alert">
          <AlertIcon />
          <span>No se pudo obtener datos del servidor: {error}</span>
        </p>
      )}

      <PodiumBoard runners={runners} />
    </main>
  )
}
