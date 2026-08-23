import { useSearch } from './hooks/useSearch'
import { useTheme } from './hooks/useTheme'
import SearchForm from './components/SearchForm'
import ResultCard from './components/ResultCard'
import { AlertIcon, MoonIcon, RunnerBadgeIcon, SunIcon } from './components/icons'

export default function App() {
  const { query, setQuery, status, results, error } = useSearch()
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

        <div className="badge">
          <RunnerBadgeIcon className="badge-icon" />
        </div>

        <p className="header-eyebrow">Carrera del Informático</p>
        <h1 className="header-title">Resultados</h1>
        <p className="header-sub">Buscá tu resultado por número de dorsal o por tu nombre</p>
      </header>

      <SearchForm query={query} onChange={setQuery} />

      {status === 'loading' && <p className="status-line">Buscando…</p>}

      {status === 'error' && (
        <p className="error-banner" role="alert">
          <AlertIcon />
          <span>{error}</span>
        </p>
      )}

      {status === 'done' && results.length === 0 && (
        <p className="status-line">
          No encontramos a nadie con «{query.trim()}». Revisá el número o probá con el
          nombre completo.
        </p>
      )}

      {status === 'done' && results.length > 0 && (
        <div className="results-list">
          {results.map((result) => (
            <ResultCard key={result.runner_id} result={result} />
          ))}
        </div>
      )}

      {status === 'idle' && (
        <p className="status-line status-line-hint">
          Escribí al menos 2 letras de tu nombre, o tu número de dorsal completo.
        </p>
      )}
    </main>
  )
}
