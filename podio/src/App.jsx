import { useRunners } from './hooks/useRunners'
import { useTheme } from './hooks/useTheme'
import PodiumBoard from './components/PodiumBoard'
import { AlertIcon, MoonIcon, RunnerBadgeIcon, SunIcon } from './components/icons'

export default function App() {
  const { runners, error } = useRunners()
  const { theme, toggleTheme } = useTheme()

  return (
    <main className="app">
      <header className="header">
        <button
          type="button"
          className="theme-toggle-mini"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
        </button>

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
